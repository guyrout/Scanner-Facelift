import { Suspense, useState, useEffect, useRef, useMemo, type MutableRefObject } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader.js";
import * as THREE from "three";
import {
  generateHeatPoints,
  computeHeatIntensity,
  createHeatmapMaterial,
} from "../shaders/occlusalHeatmap";

export interface CameraState {
  radius: number;
  phi: number;
  theta: number;
  targetX: number;
  targetY: number;
  targetZ: number;
}

export type ViewMode = "color" | "stone";

const STONE_COLOR = "#e5d5c0";

// --- Step 1: Identify teeth (vs gingiva and palate) ---
// Only mark as gingiva when color is clearly pink/red. Teeth can be cream, yellow, or dark.

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
function segmentTeeth(
  pos: THREE.BufferAttribute,
  origColor: THREE.BufferAttribute | undefined,
): boolean[] {
  const count = pos.count;
  const isToothRaw: boolean[] = new Array(count);
  let yMid = 0;
  if (!origColor) {
    let lo = Infinity, hi = -Infinity;
    for (let i = 0; i < count; i++) {
      const y = pos.getY(i);
      if (y < lo) lo = y;
      if (y > hi) hi = y;
    }
    yMid = lo === Infinity ? 0 : (lo + hi) * 0.5;
  }
  for (let i = 0; i < count; i++) {
    isToothRaw[i] = origColor
      ? !isGingivaByColor(origColor, i)
      : isToothByPosition(pos, i, yMid);
  }

  let cx = 0, cz = 0;
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

  let crownYMin = Infinity, crownYMax = -Infinity;
  let crownZMin = Infinity, crownZMax = -Infinity;
  for (let i = 0; i < count; i++) {
    if (!isToothNoCrown[i]) continue;
    const y = pos.getY(i), z = pos.getZ(i);
    crownYMin = Math.min(crownYMin, y); crownYMax = Math.max(crownYMax, y);
    crownZMin = Math.min(crownZMin, z); crownZMax = Math.max(crownZMax, z);
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
    const h = heightAxis === "y"
      ? (pos.getY(i) - crownYMin) / rangeY
      : (pos.getZ(i) - crownZMin) / rangeZ;
    isTooth[i] = h >= CROWN_BOTTOM_FRAC;
  }
  return isTooth;
}

// --- Step 2: Identify occlusal areas on teeth (biting surfaces) ---
// Include ALL tooth surfaces - no exceptions.

/** Step 2 result: ALL tooth vertices get heatmap. */
function segmentOcclusal(
  pos: THREE.BufferAttribute,
  _normal: THREE.BufferAttribute | undefined,
  isTooth: boolean[],
): boolean[] {
  const count = pos.count;
  const isOcclusal: boolean[] = new Array(count);
  
  for (let i = 0; i < count; i++) {
    isOcclusal[i] = isTooth[i];
  }
  
  return isOcclusal;
}

/** Stone color as RGB 0–1 for vertex color attribute. */
function stoneColorRGB(): [number, number, number] {
  const c = new THREE.Color(STONE_COLOR);
  return [c.r, c.g, c.b];
}

/**
 * Step 3: Apply pressure-point heat map only to occlusal tooth vertices.
 * - Occlusal tooth → heat map from radial influence of pressure points (blue→cyan→green→yellow→red).
 * - Other tooth → base tooth color.
 * - Gingiva → base gingiva color.
 * Returns geometry with heatIntensity and baseColor attributes for ShaderMaterial.
 */
function applyHeatMapToGeometry(
  geometry: THREE.BufferGeometry,
  viewMode: ViewMode,
): THREE.BufferGeometry {
  const clone = geometry.clone();
  const pos = clone.getAttribute("position") as THREE.BufferAttribute;
  const normal = clone.getAttribute("normal") as THREE.BufferAttribute | undefined;
  const origColor = geometry.getAttribute("color") as THREE.BufferAttribute | undefined;
  const count = pos.count;

  const isTooth = segmentTeeth(pos, origColor);
  const isOcclusal = segmentOcclusal(pos, normal, isTooth);

  let toothCount = 0;
  let occlusalCount = 0;
  for (let i = 0; i < count; i++) {
    if (isTooth[i]) toothCount++;
    if (isOcclusal[i]) occlusalCount++;
  }

  const heatMask = occlusalCount > 0 ? isOcclusal : isTooth;
  if (import.meta.env?.DEV) {
    console.log("[Occlusgram] Step 1 – teeth:", toothCount, "/", count, "| Step 2 – occlusal (heat map):", occlusalCount, occlusalCount === 0 ? "(fallback: all teeth)" : "");
  }

  const heatPoints = generateHeatPoints(pos, heatMask, 80);
  const rawIntensity = computeHeatIntensity(pos, heatPoints, 0.5);

  const [sr, sg, sb] = stoneColorRGB();
  const heatIntensity = new Float32Array(count);
  const baseColor = new Float32Array(count * 3);

  const MIN_VISIBLE_INTENSITY = 0.25;
  for (let i = 0; i < count; i++) {
    if (heatMask[i]) {
      heatIntensity[i] = Math.max(rawIntensity[i], MIN_VISIBLE_INTENSITY);
    } else {
      heatIntensity[i] = 0;
    }

    if (isTooth[i] && !heatMask[i]) {
      if (viewMode === "color" && origColor) {
        baseColor[i * 3] = origColor.getX(i);
        baseColor[i * 3 + 1] = origColor.getY(i);
        baseColor[i * 3 + 2] = origColor.getZ(i);
      } else {
        baseColor[i * 3] = sr;
        baseColor[i * 3 + 1] = sg;
        baseColor[i * 3 + 2] = sb;
      }
    } else if (heatMask[i]) {
      if (viewMode === "color" && origColor) {
        baseColor[i * 3] = origColor.getX(i);
        baseColor[i * 3 + 1] = origColor.getY(i);
        baseColor[i * 3 + 2] = origColor.getZ(i);
      } else {
        baseColor[i * 3] = sr;
        baseColor[i * 3 + 1] = sg;
        baseColor[i * 3 + 2] = sb;
      }
    } else {
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
  }

  clone.setAttribute("heatIntensity", new THREE.BufferAttribute(heatIntensity, 1));
  clone.setAttribute("baseColor", new THREE.BufferAttribute(baseColor, 3));
  return clone;
}

function PlyMesh({
  url,
  viewMode,
  showOcclusgramHeatmap,
}: {
  url: string;
  viewMode: ViewMode;
  showOcclusgramHeatmap?: boolean;
}) {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    const loader = new PLYLoader();
    loader.load(url, (geo) => {
      geo.computeVertexNormals();
      geo.center();
      const bbox = new THREE.Box3().setFromBufferAttribute(
        geo.getAttribute("position") as THREE.BufferAttribute,
      );
      const size = new THREE.Vector3();
      bbox.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      if (maxDim > 0) geo.scale(2 / maxDim, 2 / maxDim, 2 / maxDim);
      setGeometry(geo);
    });
  }, [url]);

  const showHeat = showOcclusgramHeatmap === true;
  const displayGeometry = useMemo(() => {
    if (!geometry) return null;
    return showHeat ? applyHeatMapToGeometry(geometry, viewMode) : geometry;
  }, [geometry, showHeat, viewMode]);

  const heatmapMaterial = useMemo(() => createHeatmapMaterial(1), []);

  if (!geometry) return null;

  const hasColors = geometry.getAttribute("color") != null;
  const isStone = viewMode === "stone";

  return (
    <mesh
      key={`${viewMode}-${showHeat ? "heat" : "base"}`}
      geometry={displayGeometry ?? geometry}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      {showHeat ? (
        <primitive object={heatmapMaterial} attach="material" />
      ) : isStone ? (
        <meshStandardMaterial
          color={STONE_COLOR}
          roughness={0.55}
          metalness={0.02}
          side={THREE.DoubleSide}
        />
      ) : hasColors ? (
        <meshStandardMaterial
          vertexColors
          roughness={0.5}
          metalness={0.0}
          side={THREE.DoubleSide}
        />
      ) : (
        <meshStandardMaterial
          color={STONE_COLOR}
          roughness={0.55}
          metalness={0.02}
          side={THREE.DoubleSide}
        />
      )}
    </mesh>
  );
}


function CameraRig({ sharedCameraRef }: { sharedCameraRef?: MutableRefObject<CameraState> }) {
  const { camera, gl } = useThree();
  const isDragging = useRef(false);
  const prevMouse = useRef({ x: 0, y: 0 });

  const initial = sharedCameraRef?.current;
  const spherical = useRef(
    new THREE.Spherical(
      initial?.radius ?? 4,
      initial?.phi ?? Math.PI / 2.2,
      initial?.theta ?? 0,
    ),
  );
  const target = useRef(
    new THREE.Vector3(
      initial?.targetX ?? 0,
      initial?.targetY ?? 0,
      initial?.targetZ ?? 0,
    ),
  );

  useEffect(() => {
    const el = gl.domElement;

    function onPointerDown(e: PointerEvent) {
      isDragging.current = true;
      prevMouse.current = { x: e.clientX, y: e.clientY };
      el.setPointerCapture(e.pointerId);
    }

    function onPointerMove(e: PointerEvent) {
      if (!isDragging.current) return;
      const dx = e.clientX - prevMouse.current.x;
      const dy = e.clientY - prevMouse.current.y;
      prevMouse.current = { x: e.clientX, y: e.clientY };
      spherical.current.theta -= dx * 0.005;
      spherical.current.phi = Math.max(
        0.1,
        Math.min(Math.PI - 0.1, spherical.current.phi - dy * 0.005),
      );
    }

    function onPointerUp(e: PointerEvent) {
      isDragging.current = false;
      el.releasePointerCapture(e.pointerId);
    }

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      spherical.current.radius = Math.max(
        1.5,
        Math.min(10, spherical.current.radius + e.deltaY * 0.005),
      );
    }

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("wheel", onWheel);
    };
  }, [gl]);

  useFrame(() => {
    const pos = new THREE.Vector3().setFromSpherical(spherical.current);
    pos.add(target.current);
    camera.position.copy(pos);
    camera.lookAt(target.current);

    if (sharedCameraRef) {
      sharedCameraRef.current = {
        radius: spherical.current.radius,
        phi: spherical.current.phi,
        theta: spherical.current.theta,
        targetX: target.current.x,
        targetY: target.current.y,
        targetZ: target.current.z,
      };
    }
  });

  return null;
}

function LoadingIndicator() {
  return (
    <mesh>
      <sphereGeometry args={[0.2, 16, 16]} />
      <meshStandardMaterial color="#009ace" wireframe />
    </mesh>
  );
}

interface PlyModelViewerProps {
  url: string;
  viewMode?: ViewMode;
  cameraStateRef?: MutableRefObject<CameraState>;
  showOcclusgramHeatmap?: boolean;
}

export default function PlyModelViewer({
  url,
  viewMode = "color",
  cameraStateRef,
  showOcclusgramHeatmap = false,
}: PlyModelViewerProps) {
  return (
    <Canvas
      camera={{
        position: [0, 0, cameraStateRef?.current.radius ?? 4],
        fov: 45,
        near: 0.1,
        far: 100,
      }}
      style={{ width: "100%", height: "100%" }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 10, 5]} intensity={1.5} />
      <directionalLight position={[-5, 3, -2]} intensity={0.5} />
      <directionalLight position={[0, -2, 5]} intensity={0.3} />
      <hemisphereLight args={["#ffffff", "#c0c0c0", 0.4]} />
      <CameraRig sharedCameraRef={cameraStateRef} />
      <Suspense fallback={<LoadingIndicator />}>
        <PlyMesh
          url={url}
          viewMode={viewMode}
          showOcclusgramHeatmap={showOcclusgramHeatmap}
        />
      </Suspense>
    </Canvas>
  );
}
