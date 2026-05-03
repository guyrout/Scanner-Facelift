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
