/**
 * Occlusal-weighted rigid ICP between maxilla (fixed target BVH) and mandible (moving).
 * Samples bite-facing vertices (cuspal / fossae-facing normals), registers with weighted Kabsch,
 * then separates along the mean upper-occlusal normal for a minimum clearance band.
 */

import * as THREE from "three";
import { MeshBVH } from "three-mesh-bvh";
import type { HitPointInfo } from "three-mesh-bvh";
import { Matrix, SingularValueDecomposition } from "ml-matrix";

const OCCLUSAL_DOT_ABS = 0.32;

const MAX_ICP_ITERS = 48;
const LOWER_SAMPLES = 1600;
const OUTLIER_FRAC_OF_SCALE = 0.52;
const MIN_CLEARANCE = 0.001;
const POST_SEP_ITER = 30;

export interface MandibleAlignedPose {
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
}

const _euler = new THREE.Euler(-Math.PI / 2, 0, 0);
const _R0m = new THREE.Matrix3().setFromMatrix4(new THREE.Matrix4().makeRotationFromEuler(_euler));
const _R0inv = _R0m.clone().transpose();
const _va = new THREE.Vector3();
const _vb = new THREE.Vector3();
const _vc = new THREE.Vector3();
const _pw = new THREE.Vector3();
const _rPrev = new THREE.Matrix3();

function transformPositionByMat3(R: THREE.Matrix3, x: number, y: number, z: number, target: THREE.Vector3) {
  target.set(R.elements[0] * x + R.elements[3] * y + R.elements[6] * z, R.elements[1] * x + R.elements[4] * y + R.elements[7] * z, R.elements[2] * x + R.elements[5] * y + R.elements[8] * z);
}

function mat3MulVector(R: THREE.Matrix3, v: THREE.Vector3) {
  const { x, y, z } = v;
  v.set(R.elements[0] * x + R.elements[3] * y + R.elements[6] * z, R.elements[1] * x + R.elements[4] * y + R.elements[7] * z, R.elements[2] * x + R.elements[5] * y + R.elements[8] * z);
}

function triangleNormal(geo: THREE.BufferGeometry, faceIndex: number, out: THREE.Vector3) {
  const pos = geo.getAttribute("position") as THREE.BufferAttribute;
  const idx = geo.getIndex();
  let a: number;
  let b: number;
  let c: number;
  if (idx) {
    a = idx.getX(faceIndex * 3);
    b = idx.getX(faceIndex * 3 + 1);
    c = idx.getX(faceIndex * 3 + 2);
  } else {
    a = faceIndex * 3;
    b = faceIndex * 3 + 1;
    c = faceIndex * 3 + 2;
  }
  _va.set(pos.getX(b) - pos.getX(a), pos.getY(b) - pos.getY(a), pos.getZ(b) - pos.getZ(a));
  _vb.set(pos.getX(c) - pos.getX(a), pos.getY(c) - pos.getY(a), pos.getZ(c) - pos.getZ(a));
  out.crossVectors(_va, _vb).normalize();
}

function kabschWeighted(P: number[][], Q: number[][], w: number[]): { R: THREE.Matrix3; t: THREE.Vector3 } {
  const n = P.length;
  let sw = 0;
  const cp = [0, 0, 0];
  const cq = [0, 0, 0];
  for (let i = 0; i < n; i++) {
    const wi = w[i];
    sw += wi;
    cp[0] += wi * P[i][0];
    cp[1] += wi * P[i][1];
    cp[2] += wi * P[i][2];
    cq[0] += wi * Q[i][0];
    cq[1] += wi * Q[i][1];
    cq[2] += wi * Q[i][2];
  }
  for (let j = 0; j < 3; j++) {
    cp[j] /= sw;
    cq[j] /= sw;
  }

  const H = new Matrix(3, 3);
  for (let i = 0; i < n; i++) {
    const wi = w[i];
    const px = P[i][0] - cp[0];
    const py = P[i][1] - cp[1];
    const pz = P[i][2] - cp[2];
    const qx = Q[i][0] - cq[0];
    const qy = Q[i][1] - cq[1];
    const qz = Q[i][2] - cq[2];
    H.set(0, 0, H.get(0, 0) + wi * px * qx);
    H.set(0, 1, H.get(0, 1) + wi * px * qy);
    H.set(0, 2, H.get(0, 2) + wi * px * qz);
    H.set(1, 0, H.get(1, 0) + wi * py * qx);
    H.set(1, 1, H.get(1, 1) + wi * py * qy);
    H.set(1, 2, H.get(1, 2) + wi * py * qz);
    H.set(2, 0, H.get(2, 0) + wi * pz * qx);
    H.set(2, 1, H.get(2, 1) + wi * pz * qy);
    H.set(2, 2, H.get(2, 2) + wi * pz * qz);
  }

  const svd = new SingularValueDecomposition(H);
  const U = svd.leftSingularVectors;
  const V = svd.rightSingularVectors;
  let Rm = V.mmul(U.transpose());
  const detRm =
    Rm.get(0, 0) * (Rm.get(1, 1) * Rm.get(2, 2) - Rm.get(1, 2) * Rm.get(2, 1)) -
    Rm.get(0, 1) * (Rm.get(1, 0) * Rm.get(2, 2) - Rm.get(1, 2) * Rm.get(2, 0)) +
    Rm.get(0, 2) * (Rm.get(1, 0) * Rm.get(2, 1) - Rm.get(1, 1) * Rm.get(2, 0));
  if (detRm < 0) {
    const Vcopy = V.clone();
    const col2 = Vcopy.getColumn(2).map((x: number) => -x);
    Vcopy.setColumn(2, col2);
    Rm = Vcopy.mmul(U.transpose());
  }

  const R = new THREE.Matrix3().set(Rm.get(0, 0), Rm.get(0, 1), Rm.get(0, 2), Rm.get(1, 0), Rm.get(1, 1), Rm.get(1, 2), Rm.get(2, 0), Rm.get(2, 1), Rm.get(2, 2));

  const rcpx = R.elements[0] * cp[0] + R.elements[3] * cp[1] + R.elements[6] * cp[2];
  const rcpy = R.elements[1] * cp[0] + R.elements[4] * cp[1] + R.elements[7] * cp[2];
  const rcpz = R.elements[2] * cp[0] + R.elements[5] * cp[1] + R.elements[8] * cp[2];

  const t = new THREE.Vector3(cq[0] - rcpx, cq[1] - rcpy, cq[2] - rcpz);

  return { R, t };
}

function gatherOcclusalIndices(geo: THREE.BufferGeometry, jaw: "upper" | "lower"): number[] {
  geo.computeVertexNormals();
  const pos = geo.getAttribute("position") as THREE.BufferAttribute;
  const normals = geo.getAttribute("normal") as THREE.BufferAttribute;

  const out: number[] = [];
  for (let i = 0; i < pos.count; i++) {
    _va.set(normals.getX(i), normals.getY(i), normals.getZ(i));
    mat3MulVector(_R0m, _va);
    _va.normalize();

    const ny = _va.y;
    const matches = jaw === "upper" ? ny < -OCCLUSAL_DOT_ABS : ny > OCCLUSAL_DOT_ABS;
    if (matches) out.push(i);
  }

  return out;
}

function stratifiedSample(indices: number[], target: number): number[] {
  if (indices.length <= target) return [...indices];
  const step = indices.length / target;
  const picked: number[] = [];
  for (let k = 0; k < target; k++) {
    picked.push(indices[Math.floor(k * step)]);
  }
  return picked;
}

function estimateSceneScale(geo: THREE.BufferGeometry): number {
  geo.computeBoundingBox();
  const box = geo.boundingBox!;
  const s = new THREE.Vector3();
  box.getSize(s);
  return Math.max(s.x, s.y, s.z, 1e-6);
}

function mandibleVertexWorld(
  pos: THREE.BufferAttribute,
  vi: number,
  R_man: THREE.Matrix3,
  t: THREE.Vector3,
  out: THREE.Vector3,
) {
  transformPositionByMat3(_R0m, pos.getX(vi), pos.getY(vi), pos.getZ(vi), out);
  out.applyMatrix3(R_man);
  out.add(t);
}

function resolvePenetration(
  upperGeo: THREE.BufferGeometry,
  lowerGeo: THREE.BufferGeometry,
  bvh: MeshBVH,
  R_man: THREE.Matrix3,
  t: THREE.Vector3,
  sepDir: THREE.Vector3,
  sceneScale: number,
): THREE.Vector3 {
  const pos = lowerGeo.getAttribute("position") as THREE.BufferAttribute;
  const clearance = MIN_CLEARANCE * Math.max(1, sceneScale * 0.5);
  const tAdj = t.clone();

  const sampleVerts = Math.min(pos.count, 4400);
  const step = Math.max(1, Math.floor(pos.count / sampleVerts));

  const hit = {} as HitPointInfo;

  for (let iter = 0; iter < POST_SEP_ITER; iter++) {
    let minDist = Infinity;
    for (let vi = 0; vi < pos.count; vi += step) {
      mandibleVertexWorld(pos, vi, R_man, tAdj, _va);

      _vb.copy(_va);
      mat3MulVector(_R0inv, _vb);

      const h = bvh.closestPointToPoint(_vb, hit);
      if (!h) continue;
      triangleNormal(upperGeo, h.faceIndex!, _vc);
      mat3MulVector(_R0m, _vc);
      transformPositionByMat3(_R0m, h.point.x, h.point.y, h.point.z, _vb);
      const dist = _va.distanceTo(_vb);
      if (dist < minDist) minDist = dist;
    }

    if (minDist >= clearance) break;
    const push = clearance - minDist + 1e-5;
    tAdj.addScaledVector(sepDir, push);
  }

  return tAdj;
}

/** Direction from upper mesh centroid toward lower (mandible) centroid — pushing mandible along this separates arches. */
function separationDirectionFromCentroids(
  upperGeo: THREE.BufferGeometry,
  lowerGeo: THREE.BufferGeometry,
  R_man: THREE.Matrix3,
  t: THREE.Vector3,
): THREE.Vector3 {
  const posU = upperGeo.getAttribute("position") as THREE.BufferAttribute;
  const posL = lowerGeo.getAttribute("position") as THREE.BufferAttribute;

  const cu = new THREE.Vector3();
  let nu = 0;
  const stepU = Math.max(1, Math.floor(posU.count / 2500));
  for (let i = 0; i < posU.count; i += stepU) {
    transformPositionByMat3(_R0m, posU.getX(i), posU.getY(i), posU.getZ(i), _va);
    cu.add(_va);
    nu++;
  }
  cu.multiplyScalar(1 / Math.max(nu, 1));

  const cl = new THREE.Vector3();
  let nl = 0;
  const stepL = Math.max(1, Math.floor(posL.count / 2500));
  for (let i = 0; i < posL.count; i += stepL) {
    mandibleVertexWorld(posL, i, R_man, t, _va);
    cl.add(_va);
    nl++;
  }
  cl.multiplyScalar(1 / Math.max(nl, 1));

  const dir = new THREE.Vector3().copy(cl).sub(cu);
  if (dir.lengthSq() < 1e-12) dir.set(0, -1, 0);
  else dir.normalize();
  return dir;
}

export function computeOcclusalBiteAlignment(upperGeo: THREE.BufferGeometry, lowerGeo: THREE.BufferGeometry): MandibleAlignedPose {
  upperGeo.computeBoundingBox();
  lowerGeo.computeBoundingBox();

  const sceneScale = Math.max(estimateSceneScale(upperGeo), estimateSceneScale(lowerGeo));

  const upperOcc = gatherOcclusalIndices(upperGeo, "upper");
  const lowerOcc = gatherOcclusalIndices(lowerGeo, "lower");

  const upperFallback = stratifiedSample(
    Array.from({ length: (upperGeo.getAttribute("position") as THREE.BufferAttribute).count }, (_, i) => i),
    LOWER_SAMPLES,
  );
  const lowerFallback = stratifiedSample(
    Array.from({ length: (lowerGeo.getAttribute("position") as THREE.BufferAttribute).count }, (_, i) => i),
    LOWER_SAMPLES,
  );

  const uSrc = upperOcc.length >= 120 ? upperOcc : upperFallback;
  const lSrc = lowerOcc.length >= 120 ? lowerOcc : lowerFallback;

  const posU = upperGeo.getAttribute("position") as THREE.BufferAttribute;
  const posL = lowerGeo.getAttribute("position") as THREE.BufferAttribute;
  const nrmL = lowerGeo.getAttribute("normal") as THREE.BufferAttribute;

  const cu = new THREE.Vector3();
  let cc = 0;
  for (let i = 0; i < Math.min(uSrc.length, 8000); i++) {
    const ix = uSrc[i];
    cu.x += posU.getX(ix);
    cu.y += posU.getY(ix);
    cu.z += posU.getZ(ix);
    cc++;
  }
  cu.multiplyScalar(1 / Math.max(cc, 1));
  transformPositionByMat3(_R0m, cu.x, cu.y, cu.z, cu);

  const cl = new THREE.Vector3();
  cc = 0;
  for (let i = 0; i < Math.min(lSrc.length, 8000); i++) {
    const ix = lSrc[i];
    cl.x += posL.getX(ix);
    cl.y += posL.getY(ix);
    cl.z += posL.getZ(ix);
    cc++;
  }
  cl.multiplyScalar(1 / Math.max(cc, 1));
  transformPositionByMat3(_R0m, cl.x, cl.y, cl.z, cl);

  const sepHint = _va.copy(cu).sub(cl);
  if (sepHint.lengthSq() < 1e-10) sepHint.set(0, 1, 0);
  else sepHint.normalize();

  const initialGap = 0.012 * sceneScale;
  const t = _vb.copy(sepHint).multiplyScalar(initialGap).add(cu).sub(cl);

  const bvh = new MeshBVH(upperGeo);

  const R_acc = new THREE.Matrix3().identity();
  let t_acc = t.clone();

  const sampleIdx = stratifiedSample(lSrc, Math.min(LOWER_SAMPLES, lSrc.length));

  const v0: number[][] = [];
  const n0w: THREE.Vector3[] = [];
  for (const ix of sampleIdx) {
    transformPositionByMat3(_R0m, posL.getX(ix), posL.getY(ix), posL.getZ(ix), _va);
    v0.push([_va.x, _va.y, _va.z]);
    _vb.set(nrmL.getX(ix), nrmL.getY(ix), nrmL.getZ(ix));
    mat3MulVector(_R0m, _vb);
    _vb.normalize();
    n0w.push(_vb.clone());
  }

  const outlierLimit = OUTLIER_FRAC_OF_SCALE * sceneScale;

  const hit = {} as HitPointInfo;

  for (let iter = 0; iter < MAX_ICP_ITERS; iter++) {
    const P: number[][] = [];
    const Q: number[][] = [];
    const W: number[] = [];

    const adaptLimit = outlierLimit * (0.9 ** Math.floor(iter / 7));

    for (let i = 0; i < v0.length; i++) {
      _pw.set(v0[i][0], v0[i][1], v0[i][2]);
      _pw.applyMatrix3(R_acc);
      _pw.add(t_acc);

      _vb.copy(_pw);
      mat3MulVector(_R0inv, _vb);

      const h = bvh.closestPointToPoint(_vb, hit);
      if (!h || h.faceIndex === undefined) continue;

      triangleNormal(upperGeo, h.faceIndex, _vc);
      mat3MulVector(_R0m, _vc);
      _vc.normalize();

      transformPositionByMat3(_R0m, h.point.x, h.point.y, h.point.z, _vb);

      const dist = _pw.distanceTo(_vb);
      if (dist > adaptLimit) continue;

      const nl = n0w[i]!;
      let wgt = Math.max(0, -_vc.dot(nl));
      wgt *= wgt;
      if (wgt < 1e-8) wgt = 0.06;

      _va.copy(_pw).sub(_vb);
      const len = _va.length();
      if (len < 1e-9) continue;
      _va.multiplyScalar(1 / len);
      const planeW = Math.abs(_vc.dot(_va));
      wgt *= 0.28 + 0.72 * planeW;

      P.push(v0[i]);
      Q.push([_vb.x, _vb.y, _vb.z]);
      W.push(wgt);
    }

    if (P.length < 14) break;

    _rPrev.copy(R_acc);

    const { R: R_step, t: t_step } = kabschWeighted(P, Q, W);

    const tPrev = t_acc.clone();
    R_acc.copy(R_step);
    t_acc.copy(t_step);

    let rFrob = 0;
    for (let k = 0; k < 9; k++) {
      rFrob += Math.abs(R_step.elements[k]! - _rPrev.elements[k]!);
    }
    const deltaMag = (rFrob + t_acc.distanceTo(tPrev)) / sceneScale;
    if (deltaMag < 2e-5) break;
  }

  const sepDir = separationDirectionFromCentroids(upperGeo, lowerGeo, R_acc, t_acc);

  t_acc.copy(resolvePenetration(upperGeo, lowerGeo, bvh, R_acc, t_acc, sepDir, sceneScale));

  const quat = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().setFromMatrix3(R_acc));

  return {
    position: t_acc.clone(),
    quaternion: quat,
  };
}

/**
 * Fast Y-separation after mesh rotation — used so bite view shows geometry immediately before ICP finishes.
 * Geometry clones are disposed after bounding-box computation.
 */
export function computeProvisionalBitePose(upperGeo: THREE.BufferGeometry, lowerGeo: THREE.BufferGeometry): MandibleAlignedPose {
  const tmpU = new THREE.Mesh(upperGeo.clone());
  tmpU.rotation.x = -Math.PI / 2;
  const tmpL = new THREE.Mesh(lowerGeo.clone());
  tmpL.rotation.x = -Math.PI / 2;
  const bu = new THREE.Box3().setFromObject(tmpU);
  const bl = new THREE.Box3().setFromObject(tmpL);
  tmpU.geometry.dispose();
  tmpL.geometry.dispose();

  const CLEARANCE = 0.0015;
  const mandibleBaseY = bu.min.y - bl.max.y - CLEARANCE;

  return {
    position: new THREE.Vector3(0, mandibleBaseY, 0),
    quaternion: new THREE.Quaternion(),
  };
}
