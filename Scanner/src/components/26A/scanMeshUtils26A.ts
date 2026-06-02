import * as THREE from "three";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

export const STONE_COLOR = "#e5d5c0";

export function stoneColorRGB(): [number, number, number] {
  const c = new THREE.Color(STONE_COLOR);
  return [c.r, c.g, c.b];
}

/** Center and scale mesh to ~2 units max extent (matches PlyMesh pipeline). */
export function normalizeScanMeshGeometry(geo: THREE.BufferGeometry) {
  geo.computeVertexNormals();
  geo.center();
  const bbox = new THREE.Box3().setFromBufferAttribute(geo.getAttribute("position") as THREE.BufferAttribute);
  const size = new THREE.Vector3();
  bbox.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z);
  if (maxDim > 0) {
    const s = 2 / maxDim;
    geo.scale(s, s, s);
  }
}

/**
 * Same scale/center for two meshes so inter-arch distances stay correct (OrthoCAD upper+lower pair).
 * Mutates both geometries in place (call on clones if originals must be preserved).
 */
export function normalizeScanMeshGeometriesPair(a: THREE.BufferGeometry, b: THREE.BufferGeometry) {
  a.computeBoundingBox();
  b.computeBoundingBox();
  const box = new THREE.Box3();
  box.union(a.boundingBox!);
  box.union(b.boundingBox!);
  const center = new THREE.Vector3();
  box.getCenter(center);
  const size = new THREE.Vector3();
  box.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z, 1e-6);
  const s = 2 / maxDim;

  for (const geo of [a, b]) {
    const pos = geo.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      pos.setX(i, (pos.getX(i) - center.x) * s);
      pos.setY(i, (pos.getY(i) - center.y) * s);
      pos.setZ(i, (pos.getZ(i) - center.z) * s);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  }
}

export function loadScanMeshGeometry(url: string): Promise<THREE.BufferGeometry> {
  const lower = url.toLowerCase();
  return new Promise((resolve, reject) => {
    if (lower.endsWith(".stl")) {
      new STLLoader().load(url, resolve, undefined, reject);
      return;
    }
    if (lower.endsWith(".ply")) {
      new PLYLoader().load(url, resolve, undefined, reject);
      return;
    }
    reject(new Error(`[loadScanMeshGeometry] Unsupported mesh format: ${url}`));
  });
}

export function ensureVertexColors(geometry: THREE.BufferGeometry): THREE.BufferAttribute {
  let colorAttr = geometry.getAttribute("color") as THREE.BufferAttribute | undefined;
  if (colorAttr) return colorAttr;
  const [sr, sg, sb] = stoneColorRGB();
  const position = geometry.getAttribute("position") as THREE.BufferAttribute;
  const colors = new Float32Array(position.count * 3);
  for (let i = 0; i < position.count; i++) {
    const base = i * 3;
    colors[base] = sr;
    colors[base + 1] = sg;
    colors[base + 2] = sb;
  }
  colorAttr = new THREE.BufferAttribute(colors, 3);
  geometry.setAttribute("color", colorAttr);
  return colorAttr;
}

/**
 * Synthesised "dental tissue" vertex colours for PLY/STL meshes that ship
 * without baked-in colour (e.g. iTero PLYs whose colour data lives in an
 * external texture JPG, or Blender bite exports with position-only attrs).
 *
 * Heuristic: a dental arch is a horseshoe — its smallest bounding-box
 * extent runs roughly along the occlusal-gingival axis. Vertex normals
 * aligned with that axis sit on tooth tips / cusps (cream enamel);
 * perpendicular normals sit on tooth sides, gum, and buccal/lingual
 * surfaces (pinker tissue). We lerp between two dental tones based on
 * |normal · shortAxis|² so cusps read clearly as cream.
 *
 * Intentionally *not* anatomically correct — only "vaguely tissue-
 * coloured" so the Color toggle has something to show when the source
 * mesh has no real colour data.
 *
 * Returns `true` if it actually wrote colours, `false` when the geometry
 * already had a colour attribute (caller may then skip ensureVertexColors).
 */
export function synthesizeDentalVertexColors(geometry: THREE.BufferGeometry): boolean {
  if (geometry.getAttribute("color")) return false;
  const position = geometry.getAttribute("position") as THREE.BufferAttribute | undefined;
  if (!position) return false;

  // Normals are required for the orientation heuristic. Safe to recompute
  // in case the loader (e.g. PLYLoader on a position-only PLY) didn't.
  if (!geometry.getAttribute("normal")) {
    geometry.computeVertexNormals();
  }
  const normal = geometry.getAttribute("normal") as THREE.BufferAttribute;

  geometry.computeBoundingBox();
  const bbox = geometry.boundingBox;
  if (!bbox) return false;
  const size = new THREE.Vector3();
  bbox.getSize(size);

  // Smallest bounding-box axis ≈ occlusal-gingival direction for a horseshoe arch.
  let axisIdx: 0 | 1 | 2 = 2;
  let minExtent = size.z;
  if (size.x < minExtent) {
    axisIdx = 0;
    minExtent = size.x;
  }
  if (size.y < minExtent) {
    axisIdx = 1;
  }

  const tooth = new THREE.Color("#efe1c4");
  const gum = new THREE.Color("#c98277");

  const colors = new Float32Array(position.count * 3);
  for (let i = 0; i < position.count; i++) {
    const nx = normal.getX(i);
    const ny = normal.getY(i);
    const nz = normal.getZ(i);
    const alongAxis = axisIdx === 0 ? Math.abs(nx) : axisIdx === 1 ? Math.abs(ny) : Math.abs(nz);
    // Ease toward tooth colour so cusps/edges read clearly cream.
    const t = alongAxis * alongAxis;
    const r = gum.r * (1 - t) + tooth.r * t;
    const g = gum.g * (1 - t) + tooth.g * t;
    const b = gum.b * (1 - t) + tooth.b * t;
    const base = i * 3;
    colors[base] = r;
    colors[base + 1] = g;
    colors[base + 2] = b;
  }
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return true;
}
