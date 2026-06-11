import { Suspense, useState, useEffect, useRef, useMemo, type MutableRefObject } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createHeatmapMaterial } from "../../shaders/occlusalHeatmap";
import type { JawSelection } from "./JawSelector26A";
import type { LassoPoint } from "./LassoDrawingOverlay26A";
import {
  STONE_COLOR,
  normalizeScanMeshGeometry,
  normalizeScanMeshGeometriesPair,
  loadScanMeshGeometry,
  ensureVertexColors,
  synthesizeDentalVertexColors,
} from "./scanMeshUtils26A";
import { applyInterArchHeatToSurfaceGeometry } from "./occlusogramDistance26A";
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

/**
 * Even-odd point-in-polygon (ray casting) for screen-space lasso cuts.
 */
function pointInPolygon(px: number, py: number, polygon: LassoPoint[]): boolean {
  let inside = false;
  const n = polygon.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;
    const intersect =
      yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi + 1e-12) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Build a vertex selection mask by projecting each mesh vertex to screen-space
 * and testing against the supplied 2D lasso polygons. Vertices facing away
 * from the camera are skipped so the cut only affects the visible front face
 * of the model (mirrors the user's mental model of "cut what I see").
 */
function buildLassoSelectionMask(
  mesh: THREE.Mesh,
  geometry: THREE.BufferGeometry,
  camera: THREE.Camera,
  canvasWidth: number,
  canvasHeight: number,
  lassoPaths: LassoPoint[][],
): Uint8Array {
  const position = geometry.getAttribute("position") as THREE.BufferAttribute;
  const normal = geometry.getAttribute("normal") as THREE.BufferAttribute | null;
  const mask = new Uint8Array(position.count);
  if (lassoPaths.length === 0) return mask;

  mesh.updateMatrixWorld(true);
  const worldVertex = new THREE.Vector3();
  const projected = new THREE.Vector3();
  const worldNormal = new THREE.Vector3();
  const cameraDir = new THREE.Vector3();
  camera.getWorldDirection(cameraDir);
  const halfW = canvasWidth * 0.5;
  const halfH = canvasHeight * 0.5;

  for (let i = 0; i < position.count; i++) {
    worldVertex.fromBufferAttribute(position, i);
    mesh.localToWorld(worldVertex);
    projected.copy(worldVertex).project(camera);
    if (projected.z < -1 || projected.z > 1) continue;
    const sx = (projected.x + 1) * halfW;
    const sy = (1 - projected.y) * halfH;

    if (normal) {
      worldNormal.fromBufferAttribute(normal, i);
      worldNormal.transformDirection(mesh.matrixWorld);
      if (worldNormal.dot(cameraDir) > 0) continue;
    }

    for (const path of lassoPaths) {
      if (pointInPolygon(sx, sy, path)) {
        mask[i] = 1;
        break;
      }
    }
  }
  return mask;
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

function PairedJawOcclusogramMeshes({
  upperUrl,
  lowerUrl,
  viewMode,
  opacity,
}: {
  upperUrl: string;
  lowerUrl: string;
  viewMode: ViewMode;
  opacity: number;
}) {
  const [upperGeo, setUpperGeo] = useState<THREE.BufferGeometry | null>(null);
  const [lowerGeo, setLowerGeo] = useState<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [u, l] = await Promise.all([loadScanMeshGeometry(upperUrl), loadScanMeshGeometry(lowerUrl)]);
        if (cancelled) {
          u.dispose();
          l.dispose();
          return;
        }
        normalizeScanMeshGeometriesPair(u, l);
        ensureVertexColors(u);
        ensureVertexColors(l);
        setUpperGeo(u);
        setLowerGeo(l);
      } catch (e) {
        console.error("[PlyModelViewer26A] Paired occlusogram load failed", upperUrl, lowerUrl, e);
        if (!cancelled) {
          setUpperGeo(null);
          setLowerGeo(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [upperUrl, lowerUrl]);

  const upperHeatGeo = useMemo(() => {
    if (!upperGeo || !lowerGeo) return null;
    return applyInterArchHeatToSurfaceGeometry(upperGeo, lowerGeo, viewMode, "upper");
  }, [upperGeo, lowerGeo, viewMode]);

  const lowerHeatGeo = useMemo(() => {
    if (!upperGeo || !lowerGeo) return null;
    return applyInterArchHeatToSurfaceGeometry(lowerGeo, upperGeo, viewMode, "lower");
  }, [upperGeo, lowerGeo, viewMode]);

  const matUpper = useMemo(() => createHeatmapMaterial(1), []);
  const matLower = useMemo(() => createHeatmapMaterial(1), []);
  const useTransparency = opacity < 1;
  useEffect(() => {
    matUpper.transparent = useTransparency;
    matUpper.opacity = opacity;
    matLower.transparent = useTransparency;
    matLower.opacity = opacity;
  }, [matUpper, matLower, opacity, useTransparency]);

  if (!upperHeatGeo || !lowerHeatGeo) return null;

  const rot = -Math.PI / 2;
  return (
    <group>
      <mesh geometry={upperHeatGeo} rotation={[rot, 0, 0]} castShadow receiveShadow>
        <primitive object={matUpper} attach="material" />
      </mesh>
      <mesh geometry={lowerHeatGeo} rotation={[rot, 0, 0]} castShadow receiveShadow>
        <primitive object={matLower} attach="material" />
      </mesh>
    </group>
  );
}

function PlyMesh({
  url,
  textureUrl,
  viewMode,
  showOcclusgramHeatmap,
  opposingJawUrl,
  occlusogramSurfaceJaw,
  eraseSelectionNonce = 0,
  lassoPaths,
  opacity = 1,
}: {
  url: string;
  /** Optional JPG texture applied as `map` when `viewMode === "color"` and
   *  the loaded geometry exposes per-vertex UVs (iTero PLY exports do). */
  textureUrl?: string;
  viewMode: ViewMode;
  showOcclusgramHeatmap?: boolean;
  /** When set (and different from `url`), upper/lower load together with shared normalize for correct occlusogram distances. */
  opposingJawUrl?: string;
  /** Required for inter-arch heat when paired: which arch `url` represents. */
  occlusogramSurfaceJaw?: "upper" | "lower";
  /** Increment to trigger a lasso-based cut using the currently provided `lassoPaths`. */
  eraseSelectionNonce?: number;
  /** Screen-space lasso polygons (canvas coordinates relative to the viewport canvas). */
  lassoPaths?: LassoPoint[][];
  opacity?: number;
}) {
  const { camera, gl } = useThree();
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [opposingGeometry, setOpposingGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const lastEraseNonceRef = useRef(0);
  const lassoPathsRef = useRef<LassoPoint[][] | undefined>(lassoPaths);
  lassoPathsRef.current = lassoPaths;

  // Load the JPG texture (iTero exports map colour via per-face UV coords).
  // The texture is sampled in linear UV space; `flipY` defaults to true in
  // three.js which matches how the PLYLoader writes UVs from the file.
  useEffect(() => {
    if (!textureUrl) {
      setTexture(null);
      return;
    }
    let cancelled = false;
    const loader = new THREE.TextureLoader();
    loader.load(
      textureUrl,
      (t) => {
        if (cancelled) {
          t.dispose();
          return;
        }
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 8;
        t.needsUpdate = true;
        setTexture(t);
      },
      undefined,
      (err) => {
        console.error("[PlyModelViewer26A] Failed to load texture", textureUrl, err);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [textureUrl]);

  useEffect(() => {
    let cancelled = false;
    const usePair = Boolean(opposingJawUrl) && opposingJawUrl !== url;

    async function loadPaired() {
      try {
        const [gSelf, gOpp] = await Promise.all([
          loadScanMeshGeometry(url),
          loadScanMeshGeometry(opposingJawUrl!),
        ]);
        if (cancelled) {
          gSelf.dispose();
          gOpp.dispose();
          return;
        }
        normalizeScanMeshGeometriesPair(gSelf, gOpp);
        // Try real dental colours first (normals → gum/tooth gradient) for
        // PLYs without baked-in vertex colour. `ensureVertexColors` is now
        // a last-resort uniform-stone fill.
        synthesizeDentalVertexColors(gSelf);
        ensureVertexColors(gSelf);
        setGeometry(gSelf);
        setOpposingGeometry(gOpp);
      } catch (e) {
        console.error("[PlyModelViewer26A] Failed to load paired jaws", url, opposingJawUrl, e);
        if (!cancelled) {
          setGeometry(null);
          setOpposingGeometry(null);
        }
      }
    }

    async function loadSingle() {
      try {
        const geo = await loadScanMeshGeometry(url);
        if (cancelled) {
          geo.dispose();
          return;
        }
        normalizeScanMeshGeometry(geo);
        synthesizeDentalVertexColors(geo);
        ensureVertexColors(geo);
        setOpposingGeometry(null);
        setGeometry(geo);
      } catch (e) {
        console.error("[PlyModelViewer26A] Failed to load mesh", url, e);
        if (!cancelled) {
          setGeometry(null);
          setOpposingGeometry(null);
        }
      }
    }

    if (usePair) void loadPaired();
    else void loadSingle();

    return () => {
      cancelled = true;
    };
  }, [url, opposingJawUrl]);

  useEffect(() => {
    if (!geometry || !meshRef.current) return;
    if (eraseSelectionNonce <= lastEraseNonceRef.current) return;
    lastEraseNonceRef.current = eraseSelectionNonce;
    const paths = lassoPathsRef.current;
    if (!paths || paths.length === 0) return;
    const canvasEl = gl.domElement;
    const rect = canvasEl.getBoundingClientRect();
    const mask = buildLassoSelectionMask(
      meshRef.current,
      geometry,
      camera,
      rect.width,
      rect.height,
      paths,
    );
    let hasAny = false;
    for (let i = 0; i < mask.length; i++) {
      if (mask[i]) {
        hasAny = true;
        break;
      }
    }
    if (!hasAny) return;
    const next = eraseSelectedFaces(geometry, mask);
    ensureVertexColors(next);
    setGeometry(next);
  }, [eraseSelectionNonce, geometry, camera, gl]);

  const occlusHeatActive =
    showOcclusgramHeatmap === true &&
    opposingGeometry != null &&
    occlusogramSurfaceJaw != null;
  const displayGeometry = useMemo(() => {
    if (!geometry) return null;
    if (!occlusHeatActive || !opposingGeometry || !occlusogramSurfaceJaw) return geometry;
    return applyInterArchHeatToSurfaceGeometry(geometry, opposingGeometry, viewMode, occlusogramSurfaceJaw);
  }, [geometry, opposingGeometry, occlusHeatActive, occlusogramSurfaceJaw, viewMode]);

  const heatmapMaterial = useMemo(() => createHeatmapMaterial(1), []);
  const useTransparency = opacity < 1;
  useEffect(() => {
    heatmapMaterial.transparent = useTransparency;
    heatmapMaterial.opacity = opacity;
  }, [heatmapMaterial, opacity, useTransparency]);

  /**
   * When the mesh has both a JPG texture and UV coordinates (iTero PLY
   * workflow used by Fixed Restorative), bind the texture into the heatmap
   * shader so the heat overlays the actual photo texture instead of the
   * synthesized cream/pink dental gradient or stone gray. View-mode "stone"
   * still falls back to the vertex `baseColor` so the monochrome look is
   * preserved when the user explicitly chose it.
   */
  useEffect(() => {
    const hasUVs = geometry?.getAttribute("uv") != null;
    const useMap = !!texture && hasUVs && viewMode !== "stone";
    heatmapMaterial.uniforms.map.value = useMap ? texture : null;
    heatmapMaterial.uniforms.useMap.value = useMap;
    heatmapMaterial.needsUpdate = true;
  }, [heatmapMaterial, texture, geometry, viewMode]);

  if (!geometry) return null;

  const hasColors = geometry.getAttribute("color") != null;
  const hasUVs = geometry.getAttribute("uv") != null;
  const isStone = viewMode === "stone";
  // Texture only kicks in when the file actually has UV coords (iTero PLY
  // exports do; STLs and OrthoCAD PLYs don't). Falls back to vertex colour.
  const useTexture = !isStone && texture != null && hasUVs;

  return (
    <mesh
      ref={meshRef}
      key={`${viewMode}-${occlusHeatActive ? "heat" : "base"}-${useTexture ? "tex" : "vc"}`}
      geometry={displayGeometry ?? geometry}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      {occlusHeatActive ? (
        <primitive object={heatmapMaterial} attach="material" />
      ) : isStone ? (
        <meshStandardMaterial
          color={STONE_COLOR}
          roughness={0.55}
          metalness={0.02}
          side={THREE.DoubleSide}
          transparent={useTransparency}
          opacity={opacity}
        />
      ) : useTexture ? (
        <meshStandardMaterial
          map={texture!}
          roughness={0.5}
          metalness={0.0}
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
  /** Which jaw tab is selected (upper / lower / bite). Independent of occlusogram overlay. */
  jawView?: JawSelection;
  lowerUrl?: string;
  biteUrl?: string;
  /** Optional JPG texture for the upper jaw mesh (used when the PLY has per-face UVs). */
  upperTextureUrl?: string;
  /** Optional JPG texture for the lower jaw mesh. */
  lowerTextureUrl?: string;
  /** Material appearance: color vs stone (e.g. monochrome tool). Independent of jaw tab and occlusogram. */
  viewMode?: ViewMode;
  cameraStateRef?: MutableRefObject<CameraState>;
  /** Occlusogram heat overlay. Does not change `jawView` and must not imply bite tab selection. */
  showOcclusgramHeatmap?: boolean;
  /** Opacity for the 3D model (0–1). Default 1. */
  opacity?: number;
  /** When true, camera controls are disabled (used while drawing a lasso so the 2D overlay owns input). */
  editSelectionMode?: boolean;
  /** Increment to apply a lasso-based cut using `lassoPaths`; cuts the visible/front-facing area inside the polygons. */
  eraseSelectionNonce?: number;
  /** Screen-space lasso polygons (canvas-relative pixels) used by `eraseSelectionNonce` cuts. */
  lassoPaths?: LassoPoint[][];
}

export default function PlyModelViewer26A({
  url,
  jawView,
  lowerUrl,
  biteUrl,
  upperTextureUrl,
  lowerTextureUrl,
  viewMode = "color",
  cameraStateRef,
  showOcclusgramHeatmap = false,
  opacity = 1,
  editSelectionMode = false,
  eraseSelectionNonce = 0,
  lassoPaths,
}: PlyModelViewerProps) {
  const upperAsset = url;
  const lowerAsset = lowerUrl ?? url;
  const usesJawView = jawView != null;
  const pairedArchUrls = upperAsset !== lowerAsset;
  /**
   * Bite tab for textured arch pairs (fixed-restorative iTero export): render
   * both upper and lower PLYs at once with a shared normalize so they stay
   * in occlusion, each wearing its own JPG texture. We bypass the combined-
   * mesh bite scene (Bite.ply / split-by-Y-centroid) entirely in this mode
   * because we can show the real occlusion straight from the source PLYs.
   */
  const useBitePairTextured =
    usesJawView &&
    jawView === "bite" &&
    pairedArchUrls &&
    Boolean(upperTextureUrl) &&
    Boolean(lowerTextureUrl);
  const usesBiteStlScene =
    usesJawView && jawView === "bite" && Boolean(biteUrl) && !useBitePairTextured;
  const bitePairOcclusion =
    usesJawView && jawView === "bite" && pairedArchUrls && !useBitePairTextured;
  /**
   * Dual-arch occlusogram mesh: **only** when the jaw tab is **bite** and separate PLYs (no combined bite mesh).
   * Occlusogram must not change jaw selection — never show both arches when `jawView` is upper or lower
   * (those use a single `PlyMesh` + opposing geometry for BVH only).
   *
   * Excluded when `useBitePairTextured` is true (fixed-restorative iTero pair):
   * `PairedJawOcclusogramMeshes` reloads geometry without textures, which
   * would swap out the user-facing iTero PLYs. Instead the dual-textured
   * `PlyMesh` branch below stays mounted and each mesh renders the heatmap
   * via its own `occlusHeatActive` path — same pipeline Study Model uses on
   * upper/lower tabs (`applyInterArchHeatToSurfaceGeometry`).
   */
  const showDualArchOcclusogram =
    Boolean(showOcclusgramHeatmap) &&
    usesJawView &&
    jawView === "bite" &&
    pairedArchUrls &&
    !usesBiteStlScene &&
    !useBitePairTextured &&
    upperAsset !== lowerAsset;

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
              textureUrl={upperTextureUrl}
              viewMode={viewMode}
              showOcclusgramHeatmap={showOcclusgramHeatmap}
              eraseSelectionNonce={eraseSelectionNonce}
              lassoPaths={lassoPaths}
              opacity={opacity}
            />
          )}
          {usesBiteStlScene && (
            <BiteOcclusionScene26A
              biteUrl={biteUrl!}
              jawView="bite"
              viewMode={viewMode}
              showOcclusgramHeatmap={showOcclusgramHeatmap}
            />
          )}
          {!usesBiteStlScene && bitePairOcclusion && !showDualArchOcclusogram && (
            <BiteOcclusionScene26A
              biteUrl={upperAsset}
              jawView="bite"
              viewMode={viewMode}
              showOcclusgramHeatmap={showOcclusgramHeatmap}
            />
          )}
          {showDualArchOcclusogram && (
            <PairedJawOcclusogramMeshes
              upperUrl={upperAsset}
              lowerUrl={lowerAsset}
              viewMode={viewMode}
              opacity={opacity}
            />
          )}
          {usesJawView && jawView === "upper" && (
            <PlyMesh
              url={upperAsset}
              textureUrl={upperTextureUrl}
              opposingJawUrl={pairedArchUrls ? lowerAsset : undefined}
              occlusogramSurfaceJaw="upper"
              viewMode={viewMode}
              showOcclusgramHeatmap={showOcclusgramHeatmap}
              eraseSelectionNonce={eraseSelectionNonce}
              lassoPaths={lassoPaths}
              opacity={opacity}
            />
          )}
          {usesJawView && jawView === "lower" && (
            <PlyMesh
              url={lowerAsset}
              textureUrl={lowerTextureUrl}
              opposingJawUrl={pairedArchUrls ? upperAsset : undefined}
              occlusogramSurfaceJaw="lower"
              viewMode={viewMode}
              showOcclusgramHeatmap={showOcclusgramHeatmap}
              eraseSelectionNonce={eraseSelectionNonce}
              lassoPaths={lassoPaths}
              opacity={opacity}
            />
          )}
          {!usesBiteStlScene && usesJawView && jawView === "bite" && upperAsset === lowerAsset && (
            <>
              <PlyMesh
                url={upperAsset}
                textureUrl={upperTextureUrl}
                occlusogramSurfaceJaw="upper"
                viewMode={viewMode}
                showOcclusgramHeatmap={showOcclusgramHeatmap}
                eraseSelectionNonce={eraseSelectionNonce}
                lassoPaths={lassoPaths}
                opacity={opacity}
              />
              <group position={[0, 0.004, 0]}>
                <PlyMesh
                  url={lowerAsset}
                  textureUrl={lowerTextureUrl}
                  occlusogramSurfaceJaw="lower"
                  viewMode={viewMode}
                  showOcclusgramHeatmap={showOcclusgramHeatmap}
                  eraseSelectionNonce={eraseSelectionNonce}
                  lassoPaths={lassoPaths}
                  opacity={opacity}
                />
              </group>
            </>
          )}
          {/* Bite tab for textured arch pairs (fixed-restorative iTero PLYs):
              Render BOTH textured PLYs at once. Each PlyMesh cross-references
              the other via `opposingJawUrl`, which forces the paired loader to
              run `normalizeScanMeshGeometriesPair` — the upper and lower stay
              in their original iTero-export occlusion. The dual-arch occluso-
              gram already handles the heatmap case above, so we render here
              only when heat is off. */}
          {useBitePairTextured && !showDualArchOcclusogram && (
            <>
              <PlyMesh
                url={upperAsset}
                textureUrl={upperTextureUrl}
                opposingJawUrl={lowerAsset}
                occlusogramSurfaceJaw="upper"
                viewMode={viewMode}
                showOcclusgramHeatmap={showOcclusgramHeatmap}
                eraseSelectionNonce={eraseSelectionNonce}
                lassoPaths={lassoPaths}
                opacity={opacity}
              />
              <PlyMesh
                url={lowerAsset}
                textureUrl={lowerTextureUrl}
                opposingJawUrl={upperAsset}
                occlusogramSurfaceJaw="lower"
                viewMode={viewMode}
                showOcclusgramHeatmap={showOcclusgramHeatmap}
                eraseSelectionNonce={eraseSelectionNonce}
                lassoPaths={lassoPaths}
                opacity={opacity}
              />
            </>
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
