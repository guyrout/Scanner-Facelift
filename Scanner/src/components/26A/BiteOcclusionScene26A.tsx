/**
 * Jaw view driven by a single "bite" STL:
 * - Bite: full model
 * - Upper: only upper triangles
 * - Lower: only lower triangles
 * All three share the exact same world transform for stable switching.
 */

import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import type { JawSelection } from "./JawSelector26A";
import type { ViewMode } from "./PlyModelViewer26A";
import { ensureVertexColors, normalizeScanMeshGeometry } from "./scanMeshUtils26A";

const MESH_ROT_X = -Math.PI / 2;
const SPLIT_ROT = new THREE.Matrix4().makeRotationX(MESH_ROT_X);

function loadStlGeometry(url: string): Promise<THREE.BufferGeometry> {
  return new Promise((resolve, reject) => {
    new STLLoader().load(url, resolve, undefined, reject);
  });
}

function triangleCount(geo: THREE.BufferGeometry) {
  const index = geo.getIndex();
  if (index) return Math.floor(index.count / 3);
  return Math.floor((geo.getAttribute("position") as THREE.BufferAttribute).count / 3);
}

function getTriangleVertexIndex(geo: THREE.BufferGeometry, tri: number, corner: 0 | 1 | 2): number {
  const index = geo.getIndex();
  if (index) return index.getX(tri * 3 + corner);
  return tri * 3 + corner;
}

function buildGeometryFromTriangles(
  source: THREE.BufferGeometry,
  triangles: number[],
): THREE.BufferGeometry {
  const position = source.getAttribute("position") as THREE.BufferAttribute;
  const normal = source.getAttribute("normal") as THREE.BufferAttribute | undefined;
  const color = source.getAttribute("color") as THREE.BufferAttribute | undefined;

  const posOut: number[] = [];
  const normOut: number[] = [];
  const colOut: number[] = [];

  for (const tri of triangles) {
    for (let c = 0 as 0 | 1 | 2; c < 3; c = (c + 1) as 0 | 1 | 2) {
      const vi = getTriangleVertexIndex(source, tri, c);
      posOut.push(position.getX(vi), position.getY(vi), position.getZ(vi));
      if (normal) normOut.push(normal.getX(vi), normal.getY(vi), normal.getZ(vi));
      if (color) colOut.push(color.getX(vi), color.getY(vi), color.getZ(vi));
    }
  }

  const out = new THREE.BufferGeometry();
  out.setAttribute("position", new THREE.Float32BufferAttribute(posOut, 3));
  if (normOut.length > 0) out.setAttribute("normal", new THREE.Float32BufferAttribute(normOut, 3));
  if (colOut.length > 0) out.setAttribute("color", new THREE.Float32BufferAttribute(colOut, 3));
  out.computeVertexNormals();
  ensureVertexColors(out);
  return out;
}

function splitBiteGeometry(source: THREE.BufferGeometry) {
  const tris = triangleCount(source);
  const centroidsY: number[] = [];
  const centroid = new THREE.Vector3();
  const p = new THREE.Vector3();

  for (let tri = 0; tri < tris; tri++) {
    centroid.set(0, 0, 0);
    for (let c = 0 as 0 | 1 | 2; c < 3; c = (c + 1) as 0 | 1 | 2) {
      const vi = getTriangleVertexIndex(source, tri, c);
      p.set(
        (source.getAttribute("position") as THREE.BufferAttribute).getX(vi),
        (source.getAttribute("position") as THREE.BufferAttribute).getY(vi),
        (source.getAttribute("position") as THREE.BufferAttribute).getZ(vi),
      );
      p.applyMatrix4(SPLIT_ROT);
      centroid.add(p);
    }
    centroid.multiplyScalar(1 / 3);
    centroidsY.push(centroid.y);
  }

  const sorted = [...centroidsY].sort((a, b) => a - b);
  const splitY = sorted[Math.floor(sorted.length * 0.5)] ?? 0;

  const upperTris: number[] = [];
  const lowerTris: number[] = [];
  for (let tri = 0; tri < tris; tri++) {
    if (centroidsY[tri] >= splitY) upperTris.push(tri);
    else lowerTris.push(tri);
  }

  const upperGeo = upperTris.length > 0 ? buildGeometryFromTriangles(source, upperTris) : source.clone();
  const lowerGeo = lowerTris.length > 0 ? buildGeometryFromTriangles(source, lowerTris) : source.clone();
  return { upperGeo, lowerGeo };
}

interface BiteOcclusionScene26AProps {
  biteUrl: string;
  jawView: JawSelection;
  viewMode: ViewMode;
}

export function BiteOcclusionScene26A({ biteUrl, jawView, viewMode }: BiteOcclusionScene26AProps) {
  const [raw, setRaw] = useState<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const g = await loadStlGeometry(biteUrl);
        if (!cancelled) setRaw(g);
      } catch (e) {
        console.error("[BiteOcclusionScene26A] Failed to load bite STL", biteUrl, e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [biteUrl]);

  const prepared = useMemo(() => {
    if (!raw) return null;
    const biteGeo = raw.clone();
    normalizeScanMeshGeometry(biteGeo);
    ensureVertexColors(biteGeo);
    const { upperGeo, lowerGeo } = splitBiteGeometry(biteGeo);
    return { biteGeo, upperGeo, lowerGeo };
  }, [raw]);

  if (!prepared) return null;

  const isStone = viewMode === "stone";
  const materialProps = {
    roughness: 0.45,
    metalness: 0.06,
    side: THREE.DoubleSide,
  };

  return (
    <group>
      {(jawView === "bite" || jawView === "upper") && (
        <mesh
          geometry={jawView === "bite" ? prepared.biteGeo : prepared.upperGeo}
          rotation={[MESH_ROT_X, 0, 0]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            {...(isStone ? { color: "#dfd2bc" } : { vertexColors: true as const })}
            {...materialProps}
          />
        </mesh>
      )}
      {jawView === "lower" && (
        <mesh geometry={prepared.lowerGeo} rotation={[MESH_ROT_X, 0, 0]} castShadow receiveShadow>
          <meshStandardMaterial
            {...(isStone ? { color: "#cfc0a8" } : { vertexColors: true as const })}
            {...materialProps}
          />
        </mesh>
      )}
    </group>
  );
}
