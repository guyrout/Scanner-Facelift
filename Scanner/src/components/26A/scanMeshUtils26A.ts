import * as THREE from "three";

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
