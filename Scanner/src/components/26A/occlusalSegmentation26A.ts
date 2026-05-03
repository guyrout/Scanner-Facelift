/**
 * Tooth / occlusal vertex masks for occlusogram heat — shared by PlyMesh and inter-arch distance.
 */

import * as THREE from "three";

/** Same as mesh `rotation.x = -π/2` — occlusal normals align with `biteOcclusalAlign26A` ICP sampling. */
const BITE_MESH_ROT3 = new THREE.Matrix3().setFromMatrix4(
  new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0)),
);

/** Minimum |dot(n, biteY)| in rotated frame for a vertex to count as occlusal-facing (tooth only). */
const OCCLUSAL_DOT_ABS = 0.32;

/** True only when vertex color is clearly gingiva (strong pink/red). */
function isGingivaByColor(colorAttr: THREE.BufferAttribute, i: number): boolean {
  const r = colorAttr.getX(i);
  const g = colorAttr.getY(i);
  const b = colorAttr.getZ(i);
  const redDominance = r - Math.min(g, b);
  const isClearlyPink = r > 0.5 && r > g && r > b && redDominance > 0.2;
  return isClearlyPink;
}

/** True if vertex is in the upper (occlusal) half of the model by Y (used when no vertex colors). */
function isToothByPosition(pos: THREE.BufferAttribute, i: number, yMid: number): boolean {
  return pos.getY(i) > yMid;
}

/** Step 1 result: for each vertex, true = tooth, false = gingiva/palate. */
export function segmentTeeth(
  pos: THREE.BufferAttribute,
  origColor: THREE.BufferAttribute | undefined,
): boolean[] {
  const count = pos.count;
  const isToothRaw: boolean[] = new Array(count);
  let yMid = 0;
  if (!origColor) {
    let lo = Infinity,
      hi = -Infinity;
    for (let i = 0; i < count; i++) {
      const y = pos.getY(i);
      if (y < lo) lo = y;
      if (y > hi) hi = y;
    }
    yMid = lo === Infinity ? 0 : (lo + hi) * 0.5;
  }
  for (let i = 0; i < count; i++) {
    isToothRaw[i] = origColor ? !isGingivaByColor(origColor, i) : isToothByPosition(pos, i, yMid);
  }

  let cx = 0,
    cz = 0;
  let toothCount = 0;
  for (let i = 0; i < count; i++) {
    if (!isToothRaw[i]) continue;
    cx += pos.getX(i);
    cz += pos.getZ(i);
    toothCount++;
  }
  if (toothCount > 0) {
    cx /= toothCount;
    cz /= toothCount;
  }

  let maxDist = 0;
  for (let i = 0; i < count; i++) {
    if (!isToothRaw[i]) continue;
    const dx = pos.getX(i) - cx;
    const dz = pos.getZ(i) - cz;
    const d = Math.sqrt(dx * dx + dz * dz);
    if (d > maxDist) maxDist = d;
  }
  const palateRadius = Math.max(maxDist * 0.5, 0.01);

  const isToothNoCrown: boolean[] = new Array(count);
  for (let i = 0; i < count; i++) {
    if (!isToothRaw[i]) {
      isToothNoCrown[i] = false;
      continue;
    }
    const dx = pos.getX(i) - cx;
    const dz = pos.getZ(i) - cz;
    const distFromCenter = Math.sqrt(dx * dx + dz * dz);
    isToothNoCrown[i] = distFromCenter >= palateRadius;
  }

  let crownYMin = Infinity,
    crownYMax = -Infinity;
  let crownZMin = Infinity,
    crownZMax = -Infinity;
  for (let i = 0; i < count; i++) {
    if (!isToothNoCrown[i]) continue;
    const y = pos.getY(i),
      z = pos.getZ(i);
    crownYMin = Math.min(crownYMin, y);
    crownYMax = Math.max(crownYMax, y);
    crownZMin = Math.min(crownZMin, z);
    crownZMax = Math.max(crownZMax, z);
  }
  const rangeY = crownYMax - crownYMin || 1;
  const rangeZ = crownZMax - crownZMin || 1;
  const heightAxis = rangeY >= rangeZ ? "y" : "z";
  const CROWN_BOTTOM_FRAC = 0.22;

  const isTooth: boolean[] = new Array(count);
  for (let i = 0; i < count; i++) {
    if (!isToothNoCrown[i]) {
      isTooth[i] = false;
      continue;
    }
    const h =
      heightAxis === "y"
        ? (pos.getY(i) - crownYMin) / rangeY
        : (pos.getZ(i) - crownZMin) / rangeZ;
    isTooth[i] = h >= CROWN_BOTTOM_FRAC;
  }
  return isTooth;
}

const _n = new THREE.Vector3();

/**
 * Occlusal-facing tooth vertices only (excludes gingiva via `isTooth`).
 * After rotating normals like the displayed mesh (−90° X): upper → biting faces mostly −Y; lower → +Y.
 */
export function segmentOcclusalTeethFacing(
  normals: THREE.BufferAttribute,
  isTooth: boolean[],
  jaw: "upper" | "lower",
): boolean[] {
  const count = isTooth.length;
  const isOcclusal: boolean[] = new Array(count);
  for (let i = 0; i < count; i++) {
    if (!isTooth[i]) {
      isOcclusal[i] = false;
      continue;
    }
    _n.set(normals.getX(i), normals.getY(i), normals.getZ(i));
    _n.applyMatrix3(BITE_MESH_ROT3).normalize();
    const ny = _n.y;
    isOcclusal[i] = jaw === "upper" ? ny < -OCCLUSAL_DOT_ABS : ny > OCCLUSAL_DOT_ABS;
  }
  return isOcclusal;
}
