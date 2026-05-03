/**
 * Occlusogram: per-vertex clearance to the opposing arch via BVH closest-point queries.
 * Both geometries must already share the same model space (paired normalize or bite split).
 */

import * as THREE from "three";
import { MeshBVH } from "three-mesh-bvh";
import type { HitPointInfo } from "three-mesh-bvh";
import { stoneColorRGB, ensureVertexColors } from "./scanMeshUtils26A";
import { segmentOcclusalTeethFacing, segmentTeeth } from "./occlusalSegmentation26A";

export type OcclusogramViewMode = "color" | "stone";

function estimateSceneScale(geo: THREE.BufferGeometry): number {
  geo.computeBoundingBox();
  const s = new THREE.Vector3();
  geo.boundingBox!.getSize(s);
  return Math.max(s.x, s.y, s.z, 1e-6);
}

/**
 * Clones `surface`, adds `heatIntensity` + `baseColor` for heatmap shader.
 * Queries `opposing` mesh (unchanged) for closest-point distance per occlusal vertex.
 * @param surfaceJaw Which arch `surface` belongs to — drives occlusal normal filter (upper: −Y bite-facing; lower: +Y).
 */
export function applyInterArchHeatToSurfaceGeometry(
  surface: THREE.BufferGeometry,
  opposing: THREE.BufferGeometry,
  viewMode: OcclusogramViewMode,
  surfaceJaw: "upper" | "lower",
): THREE.BufferGeometry {
  const clone = surface.clone();
  ensureVertexColors(clone);
  clone.computeVertexNormals();

  const opposingForBvh = opposing.clone();
  ensureVertexColors(opposingForBvh);
  const bvh = new MeshBVH(opposingForBvh);
  const pos = clone.getAttribute("position") as THREE.BufferAttribute;
  const normal = clone.getAttribute("normal") as THREE.BufferAttribute;
  const origColor = clone.getAttribute("color") as THREE.BufferAttribute | undefined;
  const count = pos.count;

  const isTooth = segmentTeeth(pos, origColor);
  const heatMask = segmentOcclusalTeethFacing(normal, isTooth, surfaceJaw);

  const sceneScale = Math.max(estimateSceneScale(clone), estimateSceneScale(opposingForBvh), 1e-6);
  const sigma = sceneScale * 0.04;
  const far = sceneScale * 0.75;

  const hit = {} as HitPointInfo;
  const scratch = new THREE.Vector3();

  const rawIntensity = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    if (!heatMask[i]) {
      rawIntensity[i] = 0;
      continue;
    }
    scratch.set(pos.getX(i), pos.getY(i), pos.getZ(i));
    const h = bvh.closestPointToPoint(scratch, hit);
    const d = h?.distance ?? far;
    rawIntensity[i] = Math.exp(-d / sigma);
  }

  let maxVal = 0;
  for (let i = 0; i < count; i++) {
    if (rawIntensity[i] > maxVal) maxVal = rawIntensity[i];
  }
  if (maxVal > 1e-8) {
    for (let i = 0; i < count; i++) {
      rawIntensity[i] /= maxVal;
    }
  }

  const [sr, sg, sb] = stoneColorRGB();
  const heatIntensity = new Float32Array(count);
  const baseColor = new Float32Array(count * 3);
  const MIN_VISIBLE_INTENSITY = 0.22;

  for (let i = 0; i < count; i++) {
    if (heatMask[i]) {
      heatIntensity[i] = Math.max(rawIntensity[i], MIN_VISIBLE_INTENSITY);
    } else {
      heatIntensity[i] = 0;
    }

    if (viewMode === "color" && origColor) {
      baseColor[i * 3] = origColor.getX(i);
      baseColor[i * 3 + 1] = origColor.getY(i);
      baseColor[i * 3 + 2] = origColor.getZ(i);
    } else {
      baseColor[i * 3] = sr;
      baseColor[i * 3 + 1] = sg;
      baseColor[i * 3 + 2] = sb;
    }
  }

  opposingForBvh.dispose();

  clone.setAttribute("heatIntensity", new THREE.BufferAttribute(heatIntensity, 1));
  clone.setAttribute("baseColor", new THREE.BufferAttribute(baseColor, 3));
  return clone;
}
