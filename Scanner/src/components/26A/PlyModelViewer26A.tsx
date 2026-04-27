import { Suspense, useState, useEffect, useRef, useMemo, type MutableRefObject } from "react";
import { Canvas, useThree, useFrame, type ThreeEvent } from "@react-three/fiber";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import * as THREE from "three";
import {
  generateHeatPoints,
  computeHeatIntensity,
  createHeatmapMaterial,
} from "../../shaders/occlusalHeatmap";
import type { JawSelection } from "./JawSelector26A";
import {
  STONE_COLOR,
  stoneColorRGB,
  normalizeScanMeshGeometry,
  ensureVertexColors,
} from "./scanMeshUtils26A";
import { BiteOcclusionScene26A } from "./BiteOcclusionScene26A";

export interface CameraState {
  radius: number;
  phi: number;
  theta: number;
  targetX: number;
  targetY: number;
  targetZ: number;
}

export type ViewMode = "color" | "stone";

const EDIT_SELECTION_RADIUS = 0.145;
const SELECTION_TINT = new THREE.Color("#009ACE");

function applySelectionTint(
  geometry: THREE.BufferGeometry,
  selectedMask: Uint8Array,
  baseColors: Float32Array,
) {
  const colorAttr = ensureVertexColors(geometry);
  const colors = colorAttr.array as Float32Array;
  const vertexCount = colorAttr.count;
  for (let i = 0; i < vertexCount; i++) {
    const base = i * 3;
    const r = baseColors[base];
    const g = baseColors[base + 1];
    const b = baseColors[base + 2];
    if (selectedMask[i]) {
      colors[base] = r * 0.45 + SELECTION_TINT.r * 0.55;
      colors[base + 1] = g * 0.45 + SELECTION_TINT.g * 0.55;
      colors[base + 2] = b * 0.45 + SELECTION_TINT.b * 0.55;
    } else {
      colors[base] = r;
      colors[base + 1] = g;
      colors[base + 2] = b;
    }
  }
  colorAttr.needsUpdate = true;
}

function eraseSelectedFaces(geometry: THREE.BufferGeometry, selectedMask: Uint8Array): THREE.BufferGeometry {
  const position = geometry.getAttribute("position") as THREE.BufferAttribute;
  const color = geometry.getAttribute("color") as THREE.BufferAttribute | undefined;
  const normal = geometry.getAttribute("normal") as THREE.BufferAttribute | undefined;
  const indexAttr = geometry.getIndex();

  if (indexAttr) {
    const src = indexAttr.array;
    const nextIndex: number[] = [];
    for (let i = 0; i < src.length; i += 3) {
      const a = Number(src[i]);
      const b = Number(src[i + 1]);
      const c = Number(src[i + 2]);
      if (selectedMask[a] || selectedMask[b] || selectedMask[c]) continue;
      nextIndex.push(a, b, c);
    }
    const next = geometry.clone();
    next.setIndex(nextIndex);
    next.computeVertexNormals();
    return next;
  }

  const posArray = position.array as Float32Array;
  const colorArray = color ? (color.array as Float32Array) : null;
  const normalArray = normal ? (normal.array as Float32Array) : null;
  const nextPos: number[] = [];
  const nextColor: number[] = [];
  const nextNormal: number[] = [];
  for (let v = 0; v < position.count; v += 3) {
    if (selectedMask[v] || selectedMask[v + 1] || selectedMask[v + 2]) continue;
    for (let i = 0; i < 3; i++) {
      const srcVertex = v + i;
      const srcBase = srcVertex * 3;
      nextPos.push(posArray[srcBase], posArray[srcBase + 1], posArray[srcBase + 2]);
      if (colorArray) nextColor.push(colorArray[srcBase], colorArray[srcBase + 1], colorArray[srcBase + 2]);
      if (normalArray) nextNormal.push(normalArray[srcBase], normalArray[srcBase + 1], normalArray[srcBase + 2]);
    }
  }
  const next = new THREE.BufferGeometry();
  next.setAttribute("position", new THREE.Float32BufferAttribute(nextPos, 3));
  if (nextColor.length > 0) next.setAttribute("color", new THREE.Float32BufferAttribute(nextColor, 3));
  if (nextNormal.length > 0) next.setAttribute("normal", new THREE.Float32BufferAttribute(nextNormal, 3));
  next.computeVertexNormals();
  return next;
}

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
  editSelectionMode = false,
  eraseSelectionNonce = 0,
  opacity = 1,
}: {
  url: string;
  viewMode: ViewMode;
  showOcclusgramHeatmap?: boolean;
  editSelectionMode?: boolean;
  eraseSelectionNonce?: number;
  opacity?: number;
}) {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [selectedCount, setSelectedCount] = useState(0);
  const meshRef = useRef<THREE.Mesh>(null);
  const baseColorsRef = useRef<Float32Array | null>(null);
  const selectedMaskRef = useRef<Uint8Array>(new Uint8Array(0));
  const lastEraseNonceRef = useRef(0);
  const selectingGestureRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const isStl = url.toLowerCase().endsWith(".stl");

    const applyLoaded = (geo: THREE.BufferGeometry) => {
      if (cancelled) return;
      normalizeScanMeshGeometry(geo);
      const colorAttr = ensureVertexColors(geo);
      baseColorsRef.current = new Float32Array((colorAttr.array as Float32Array).slice());
      selectedMaskRef.current = new Uint8Array(
        (geo.getAttribute("position") as THREE.BufferAttribute).count,
      );
      setSelectedCount(0);
      setGeometry(geo);
    };

    if (isStl) {
      const loader = new STLLoader();
      loader.load(
        url,
        (geo) => {
          if (cancelled) return;
          applyLoaded(geo);
        },
        undefined,
        (err) => {
          console.error("[PlyModelViewer26A] Failed to load STL", url, err);
        },
      );
    } else {
      const loader = new PLYLoader();
      loader.load(
        url,
        (geo) => {
          if (cancelled) return;
          applyLoaded(geo);
        },
        undefined,
        (err) => {
          console.error("[PlyModelViewer26A] Failed to load PLY/OBJ mesh", url, err);
        },
      );
    }

    return () => {
      cancelled = true;
    };
  }, [url]);

  useEffect(() => {
    if (!geometry || eraseSelectionNonce <= lastEraseNonceRef.current) return;
    lastEraseNonceRef.current = eraseSelectionNonce;
    if (selectedCount <= 0) return;
    const next = eraseSelectedFaces(geometry, selectedMaskRef.current);
    const colorAttr = ensureVertexColors(next);
    baseColorsRef.current = new Float32Array((colorAttr.array as Float32Array).slice());
    selectedMaskRef.current = new Uint8Array((next.getAttribute("position") as THREE.BufferAttribute).count);
    setSelectedCount(0);
    setGeometry(next);
  }, [eraseSelectionNonce, geometry, selectedCount]);

  function paintSelectionAtPoint(localPoint: THREE.Vector3) {
    if (!geometry || !baseColorsRef.current) return;
    const position = geometry.getAttribute("position") as THREE.BufferAttribute;
    const selectedMask = selectedMaskRef.current;
    let changed = false;
    const radiusSq = EDIT_SELECTION_RADIUS * EDIT_SELECTION_RADIUS;
    for (let i = 0; i < position.count; i++) {
      const dx = position.getX(i) - localPoint.x;
      const dy = position.getY(i) - localPoint.y;
      const dz = position.getZ(i) - localPoint.z;
      const distSq = dx * dx + dy * dy + dz * dz;
      if (distSq > radiusSq || selectedMask[i]) continue;
      selectedMask[i] = 1;
      changed = true;
    }
    if (!changed) return;
    applySelectionTint(geometry, selectedMask, baseColorsRef.current);
    let nextCount = 0;
    for (let i = 0; i < selectedMask.length; i++) {
      if (selectedMask[i]) nextCount += 1;
    }
    setSelectedCount(nextCount);
  }

  function handleSelectArea(event: ThreeEvent<PointerEvent>) {
    if (!editSelectionMode || !geometry || showOcclusgramHeatmap) return;
    event.stopPropagation();
    const mesh = meshRef.current;
    if (!mesh) return;
    const localPoint = mesh.worldToLocal(event.point.clone());
    selectingGestureRef.current = true;
    paintSelectionAtPoint(localPoint);
  }

  function handleSelectAreaMove(event: ThreeEvent<PointerEvent>) {
    if (!editSelectionMode || !selectingGestureRef.current || !geometry || showOcclusgramHeatmap) return;
    event.stopPropagation();
    const mesh = meshRef.current;
    if (!mesh) return;
    const localPoint = mesh.worldToLocal(event.point.clone());
    paintSelectionAtPoint(localPoint);
  }

  function stopSelectionGesture() {
    selectingGestureRef.current = false;
  }

  const showHeat = showOcclusgramHeatmap === true;
  const displayGeometry = useMemo(() => {
    if (!geometry) return null;
    return showHeat ? applyHeatMapToGeometry(geometry, viewMode) : geometry;
  }, [geometry, showHeat, viewMode]);

  const heatmapMaterial = useMemo(() => createHeatmapMaterial(1), []);
  const useTransparency = opacity < 1;
  useEffect(() => {
    heatmapMaterial.transparent = useTransparency;
    heatmapMaterial.opacity = opacity;
  }, [heatmapMaterial, opacity, useTransparency]);

  if (!geometry) return null;

  const hasColors = geometry.getAttribute("color") != null;
  const isStone = viewMode === "stone";

  return (
    <mesh
      ref={meshRef}
      key={`${viewMode}-${showHeat ? "heat" : "base"}`}
      geometry={displayGeometry ?? geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      onPointerDown={handleSelectArea}
      onPointerMove={handleSelectAreaMove}
      onPointerUp={stopSelectionGesture}
      onPointerLeave={stopSelectionGesture}
    >
      {showHeat ? (
        <primitive object={heatmapMaterial} attach="material" />
      ) : editSelectionMode || selectedCount > 0 ? (
        <meshStandardMaterial
          vertexColors
          roughness={0.5}
          metalness={0.0}
          side={THREE.DoubleSide}
          transparent={useTransparency}
          opacity={opacity}
        />
      ) : isStone ? (
        <meshStandardMaterial
          color={STONE_COLOR}
          roughness={0.55}
          metalness={0.02}
          side={THREE.DoubleSide}
          transparent={useTransparency}
          opacity={opacity}
        />
      ) : hasColors ? (
        <meshStandardMaterial
          vertexColors
          roughness={0.5}
          metalness={0.0}
          side={THREE.DoubleSide}
          transparent={useTransparency}
          opacity={opacity}
        />
      ) : (
        <meshStandardMaterial
          color={STONE_COLOR}
          roughness={0.55}
          metalness={0.02}
          side={THREE.DoubleSide}
          transparent={useTransparency}
          opacity={opacity}
        />
      )}
    </mesh>
  );
}


function CameraRig({
  sharedCameraRef,
  cameraEnabled = true,
}: {
  sharedCameraRef?: MutableRefObject<CameraState>;
  cameraEnabled?: boolean;
}) {
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
      if (!cameraEnabled) return;
      isDragging.current = true;
      prevMouse.current = { x: e.clientX, y: e.clientY };
      el.setPointerCapture(e.pointerId);
    }

    function onPointerMove(e: PointerEvent) {
      if (!cameraEnabled) return;
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
      if (el.hasPointerCapture(e.pointerId)) {
        el.releasePointerCapture(e.pointerId);
      }
    }

    function onWheel(e: WheelEvent) {
      if (!cameraEnabled) return;
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
  }, [cameraEnabled, gl]);

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
  jawView?: JawSelection;
  lowerUrl?: string;
  biteUrl?: string;
  viewMode?: ViewMode;
  cameraStateRef?: MutableRefObject<CameraState>;
  showOcclusgramHeatmap?: boolean;
  /** Opacity for the 3D model (0–1). Default 1. */
  opacity?: number;
  /** Enables click-to-select area editing on the mesh. */
  editSelectionMode?: boolean;
  /** Increment to erase currently selected area from mesh faces. */
  eraseSelectionNonce?: number;
}

export default function PlyModelViewer26A({
  url,
  jawView,
  lowerUrl,
  biteUrl,
  viewMode = "color",
  cameraStateRef,
  showOcclusgramHeatmap = false,
  opacity = 1,
  editSelectionMode = false,
  eraseSelectionNonce = 0,
}: PlyModelViewerProps) {
  const upperAsset = url;
  const lowerAsset = lowerUrl ?? url;
  const usesJawView = jawView != null;
  const usesBiteStlScene = usesJawView && jawView === "bite" && Boolean(biteUrl);
  const bitePairOcclusion = usesJawView && jawView === "bite" && upperAsset !== lowerAsset;

  return (
    <div className="relative h-full w-full">
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
        <CameraRig sharedCameraRef={cameraStateRef} cameraEnabled={!editSelectionMode} />
        <Suspense fallback={<LoadingIndicator />}>
          {!usesJawView && (
            <PlyMesh
              url={url}
              viewMode={viewMode}
              showOcclusgramHeatmap={showOcclusgramHeatmap}
              editSelectionMode={editSelectionMode}
              eraseSelectionNonce={eraseSelectionNonce}
              opacity={opacity}
            />
          )}
          {usesBiteStlScene && <BiteOcclusionScene26A biteUrl={biteUrl!} jawView="bite" viewMode={viewMode} />}
          {!usesBiteStlScene && bitePairOcclusion && (
            <BiteOcclusionScene26A biteUrl={upperAsset} jawView="bite" viewMode={viewMode} />
          )}
          {usesJawView && jawView === "upper" && (
            <PlyMesh
              url={upperAsset}
              viewMode={viewMode}
              showOcclusgramHeatmap={showOcclusgramHeatmap}
              editSelectionMode={editSelectionMode}
              eraseSelectionNonce={eraseSelectionNonce}
              opacity={opacity}
            />
          )}
          {usesJawView && jawView === "lower" && (
            <PlyMesh
              url={lowerAsset}
              viewMode={viewMode}
              showOcclusgramHeatmap={showOcclusgramHeatmap}
              editSelectionMode={editSelectionMode}
              eraseSelectionNonce={eraseSelectionNonce}
              opacity={opacity}
            />
          )}
          {!usesBiteStlScene && usesJawView && jawView === "bite" && upperAsset === lowerAsset && (
            <>
              <PlyMesh
                url={upperAsset}
                viewMode={viewMode}
                showOcclusgramHeatmap={showOcclusgramHeatmap}
                editSelectionMode={editSelectionMode}
                eraseSelectionNonce={eraseSelectionNonce}
                opacity={opacity}
              />
              <group position={[0, 0.004, 0]}>
                <PlyMesh
                  url={lowerAsset}
                  viewMode={viewMode}
                  showOcclusgramHeatmap={showOcclusgramHeatmap}
                  editSelectionMode={editSelectionMode}
                  eraseSelectionNonce={eraseSelectionNonce}
                  opacity={opacity}
                />
              </group>
            </>
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
