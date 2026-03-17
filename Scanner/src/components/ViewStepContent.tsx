/**
 * View step content — Figma 4024:74200.
 * Full view page layout shown when wizard step === "view".
 *
 * Layout:
 * ┌──────────────────────────────────────────────────────┐
 * │  TrimToolMenu                         ViewToolbar    │
 * │          3D Model Viewport                           │
 * │          (placeholder image)                         │
 * │                                                      │
 * └──────────────────────────────────────────────────────┘
 */

import { useState, useEffect, useRef, useCallback, lazy, Suspense, type MutableRefObject } from "react";
import ViewToolbar, { type ViewToolId } from "./ViewToolbar";
import type { ViewMode, CameraState } from "./PlyModelViewer";

const PlyModelViewer = lazy(() => import("./PlyModelViewer"));

function CutIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M16.5625 12.2688L12.65 10L16.5625 7.73127C17.106 7.42526 17.5456 6.96358 17.8245 6.40566C18.1035 5.84775 18.2091 5.21912 18.1277 4.60068C18.0464 3.98224 17.7818 3.40229 17.3681 2.93547C16.9544 2.46865 16.4104 2.13633 15.8063 1.98127C15.543 1.91217 15.2721 1.87647 15 1.87502C14.4487 1.87311 13.9067 2.01708 13.429 2.29232C12.9513 2.56756 12.5549 2.96428 12.2801 3.44221C12.0053 3.92014 11.8618 4.46227 11.8642 5.01358C11.8666 5.56488 12.0148 6.10574 12.2937 6.58127C12.6355 7.16974 13.16 7.63058 13.7875 7.89377L11.4 9.27502L2.5 4.12502L1.875 5.21252L10.15 10L1.875 14.8L2.5 15.8875L11.4 10.725L13.7875 12.1063C13.16 12.3695 12.6355 12.8303 12.2937 13.4188C12.0148 13.8943 11.8666 14.4352 11.8642 14.9865C11.8618 15.5378 12.0053 16.0799 12.2801 16.5578C12.5549 17.0358 12.9513 17.4325 13.429 17.7077C13.9067 17.983 14.4487 18.1269 15 18.125C15.2721 18.1236 15.543 18.0879 15.8063 18.0188C16.4104 17.8637 16.9544 17.5314 17.3681 17.0646C17.7818 16.5977 18.0464 16.0178 18.1277 15.3994C18.2091 14.7809 18.1035 14.1523 17.8245 13.5944C17.5456 13.0365 17.106 12.5748 16.5625 12.2688ZM13.375 5.95627C13.2498 5.74238 13.1682 5.50579 13.135 5.26017C13.1018 5.01456 13.1177 4.76481 13.1816 4.52535C13.2455 4.28589 13.3563 4.06149 13.5075 3.86511C13.6587 3.66873 13.8473 3.50428 14.0625 3.38127C14.2762 3.25827 14.5121 3.17865 14.7567 3.14695C15.0012 3.11526 15.2496 3.13211 15.4877 3.19655C15.7257 3.261 15.9487 3.37176 16.1438 3.5225C16.339 3.67324 16.5025 3.861 16.625 4.07502C16.7492 4.28865 16.83 4.52473 16.8627 4.76968C16.8954 5.01463 16.8793 5.26363 16.8154 5.50235C16.7515 5.74107 16.641 5.96481 16.4904 6.1607C16.3397 6.35658 16.1518 6.52075 15.9375 6.64377C15.7241 6.76702 15.4886 6.84701 15.2443 6.87916C15 6.91131 14.7517 6.895 14.5138 6.83115C14.2758 6.7673 14.0527 6.65716 13.8573 6.50705C13.6619 6.35693 13.498 6.16977 13.375 5.95627ZM16.625 15.9563C16.5025 16.1703 16.339 16.358 16.1438 16.5088C15.9487 16.6595 15.7257 16.7703 15.4877 16.8347C15.2496 16.8992 15.0012 16.916 14.7567 16.8843C14.5121 16.8526 14.2762 16.773 14.0625 16.65C13.8473 16.527 13.6587 16.3626 13.5075 16.1662C13.3563 15.9698 13.2455 15.7454 13.1816 15.5059C13.1177 15.2665 13.1018 15.0167 13.135 14.7711C13.1682 14.5255 13.2498 14.2889 13.375 14.075C13.498 13.8615 13.6619 13.6744 13.8573 13.5242C14.0527 13.3741 14.2758 13.264 14.5138 13.2001C14.7517 13.1363 15 13.12 15.2443 13.1521C15.4886 13.1843 15.7241 13.2643 15.9375 13.3875C16.362 13.6358 16.6719 14.041 16.8005 14.5156C16.9291 14.9902 16.8661 15.4964 16.625 15.925V15.9563Z" fill="currentColor" />
    </svg>
  );
}

function UndoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M12.5 6.25H4.88431L7.12644 4.00881L6.25 3.125L2.5 6.875L6.25 10.625L7.12644 9.74087L4.88619 7.5H12.5C13.4946 7.5 14.4484 7.89509 15.1517 8.59835C15.8549 9.30161 16.25 10.2554 16.25 11.25C16.25 12.2446 15.8549 13.1984 15.1517 13.9017C14.4484 14.6049 13.4946 15 12.5 15H7.5V16.25H12.5C13.8261 16.25 15.0979 15.7232 16.0355 14.7855C16.9732 13.8479 17.5 12.5761 17.5 11.25C17.5 9.92392 16.9732 8.65215 16.0355 7.71447C15.0979 6.77678 13.8261 6.25 12.5 6.25Z" fill="currentColor" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M12.5 4.5L11.5 3.5L8 7L4.5 3.5L3.5 4.5L7 8L3.5 11.5L4.5 12.5L8 9L11.5 12.5L12.5 11.5L9 8L12.5 4.5Z" fill="var(--color-icon-secondary, rgba(0,0,0,0.63))" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M12 9.99971H6.78001C8.07335 8.01204 9.97442 6.49555 12.1998 5.67629C14.4252 4.85704 16.8558 4.77889 19.1292 5.4535C21.4027 6.12811 23.3972 7.51935 24.8156 9.41984C26.2339 11.3203 27.0002 13.6283 27 15.9997H29C29.0028 13.3252 28.1805 10.7149 26.6455 8.52482C25.1104 6.33471 22.9372 4.67136 20.4222 3.76158C17.9072 2.8518 15.1727 2.73987 12.5918 3.44105C10.0108 4.14223 7.70894 5.6224 6.00001 7.67971V3.99971H4.00001V11.9997H12V9.99971Z" fill="#121212" />
      <path d="M20 21.9997H25.22C23.9267 23.9874 22.0256 25.5039 19.8002 26.3231C17.5748 27.1424 15.1442 27.2205 12.8708 26.5459C10.5973 25.8713 8.60278 24.4801 7.18443 22.5796C5.76607 20.6791 4.99986 18.3711 5.00001 15.9997H3.00001C2.99725 18.6742 3.81947 21.2845 5.35454 23.4746C6.88961 25.6647 9.06281 27.3281 11.5778 28.2378C14.0928 29.1476 16.8273 29.2596 19.4082 28.5584C21.9892 27.8572 24.2911 26.377 26 24.3197V27.9997H28V19.9997H20V21.9997Z" fill="#121212" />
    </svg>
  );
}

type Point = { x: number; y: number };

interface TrimDrawingOverlayProps {
  paths: Point[][];
  currentPath: Point[];
  onDrawStart: (p: Point) => void;
  onDrawMove: (p: Point) => void;
  onDrawEnd: () => void;
}

function TrimDrawingOverlay({ paths, currentPath, onDrawStart, onDrawMove, onDrawEnd }: TrimDrawingOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);

    ctx.strokeStyle = "rgba(0, 0, 0, 0.7)";
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    const drawPath = (points: Point[], close: boolean) => {
      if (points.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      if (close) ctx.closePath();
      ctx.stroke();
    };

    for (const p of paths) drawPath(p, true);
    if (currentPath.length > 0) drawPath(currentPath, false);
  }, [paths, currentPath]);

  const getPoint = useCallback((e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 z-10" style={{ cursor: "crosshair" }}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        onPointerDown={(e) => {
          (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
          onDrawStart(getPoint(e));
        }}
        onPointerMove={(e) => {
          if (e.buttons > 0) onDrawMove(getPoint(e));
        }}
        onPointerUp={() => onDrawEnd()}
      />
    </div>
  );
}

interface TrimToolMenuProps {
  onClose: () => void;
  onConfirmTrim: () => void;
  onUndo: () => void;
}

function TrimToolMenu({ onClose, onConfirmTrim, onUndo }: TrimToolMenuProps) {
  return (
    <div
      className="flex flex-col bg-[var(--color-background-elevated,#fff)]"
      style={{
        border: "1px solid var(--color-border-subtle, rgba(0,0,0,0.09))",
        borderRadius: 8,
        padding: 4,
        width: 260,
        boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
      }}
    >
      {/* Header row: Trim tool + close */}
      <div className="flex flex-col" style={{ height: 60 }}>
        <div
          className="flex items-center flex-1"
          style={{ padding: 12, gap: 8 }}
        >
          <span className="tp-headling-03 text-text-primary flex-1 truncate">Trim tool</span>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center cursor-pointer bg-transparent border-0 appearance-none outline-none transition-ui hover:opacity-70 shrink-0"
            style={{ width: 32, height: 32 }}
            aria-label="Close trim tool"
          >
            <CloseIcon />
          </button>
        </div>
        <div style={{ height: 1, backgroundColor: "var(--color-border-subtle, rgba(0,0,0,0.09))", margin: "0" }} />
      </div>

      {/* Confirm trim */}
      <button
        type="button"
        onClick={onConfirmTrim}
        className="flex items-center cursor-pointer bg-transparent border-0 appearance-none outline-none transition-ui hover:bg-[var(--color-background-layer-hovered)]"
        style={{ height: 60, padding: 12, gap: 8, borderRadius: 8, width: "100%" }}
      >
        <span className="shrink-0 text-[#3e3d40]"><CutIcon /></span>
        <span className="tp-body-02 text-[#3e3d40] truncate">Confirm trim</span>
      </button>

      {/* Undo */}
      <button
        type="button"
        onClick={onUndo}
        className="flex items-center cursor-pointer bg-transparent border-0 appearance-none outline-none transition-ui hover:bg-[var(--color-background-layer-hovered)]"
        style={{ height: 60, padding: 12, gap: 8, borderRadius: 8, width: "100%" }}
      >
        <span className="shrink-0 text-text-primary"><UndoIcon /></span>
        <span className="tp-body-02 text-text-primary truncate">Undo</span>
      </button>
    </div>
  );
}

function InfoIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M26 4H6C5.46957 4 4.96086 4.21071 4.58579 4.58579C4.21071 4.96086 4 5.46957 4 6V26C4 26.5304 4.21071 27.0391 4.58579 27.4142C4.96086 27.7893 5.46957 28 6 28H26C26.5304 28 27.0391 27.7893 27.4142 27.4142C27.7893 27.0391 28 26.5304 28 26V6C28 5.46957 27.7893 4.96086 27.4142 4.58579C27.0391 4.21071 26.5304 4 26 4V4ZM16 8C16.2967 8 16.5867 8.08797 16.8334 8.2528C17.08 8.41762 17.2723 8.65189 17.3858 8.92597C17.4993 9.20006 17.5291 9.50166 17.4712 9.79264C17.4133 10.0836 17.2704 10.3509 17.0607 10.5607C16.8509 10.7704 16.5836 10.9133 16.2926 10.9712C16.0017 11.0291 15.7001 10.9994 15.426 10.8858C15.1519 10.7723 14.9176 10.58 14.7528 10.3334C14.588 10.0867 14.5 9.79667 14.5 9.5C14.5 9.10218 14.658 8.72064 14.9393 8.43934C15.2206 8.15804 15.6022 8 16 8ZM20 24.125H12V21.875H14.875V16.125H13V13.875H17.125V21.875H20V24.125Z" fill="#009ACE" />
    </svg>
  );
}

const HEATMAP_STOPS: { color: string; label: string }[] = [
  { color: "#a00a0a", label: "0.1" },
  { color: "#c61313", label: "0.2" },
  { color: "#ff0000", label: "0.3" },
  { color: "#f7771a", label: "0.4" },
  { color: "#ffa008", label: "0.5" },
  { color: "#ffd600", label: "0.6" },
  { color: "#ffe500", label: "0.7" },
  { color: "#54bf00", label: "0.8" },
  { color: "#2ce9c6", label: "0.9" },
  { color: "#0ff4fc", label: "1.0" },
  { color: "#3fbaff", label: "1.1" },
  { color: "#0197ec", label: "1.2" },
  { color: "#0197ec", label: "1.3" },
  { color: "#0066ff", label: "1.4" },
];

function PrepQcHeatmapBar({ step, onStepChange }: { step: number; onStepChange: (s: number) => void }) {
  return (
    <div
      className="flex items-center justify-center bg-[var(--color-background-layer-01,#fff)]"
      style={{ borderRadius: 8, padding: "8px 16px", gap: 24, boxShadow: "0px 4px 12px rgba(0,0,0,0.08)" }}
    >
      {/* Color scale — Figma: 872px total, 14 blocks */}
      <div className="flex flex-col shrink-0" style={{ width: 872 }}>
        <div className="flex" style={{ height: 20 }}>
          {HEATMAP_STOPS.map((s, i) => (
            <div
              key={s.label}
              style={{
                flex: "1 1 0",
                height: 20,
                backgroundColor: s.color,
                borderTopLeftRadius: i === 0 ? 4 : 0,
                borderBottomLeftRadius: i === 0 ? 4 : 0,
                borderTopRightRadius: i === HEATMAP_STOPS.length - 1 ? 4 : 0,
                borderBottomRightRadius: i === HEATMAP_STOPS.length - 1 ? 4 : 0,
              }}
            />
          ))}
        </div>
        <div className="flex">
          {HEATMAP_STOPS.map((s) => (
            <span
              key={s.label}
              className="text-center"
              style={{ flex: "1 1 0", fontSize: 14, fontWeight: 500, lineHeight: "24px", color: "#000" }}
            >
              {s.label}
            </span>
          ))}
        </div>
      </div>

      {/* Step toggle: 0.1 / 0.2 — Figma: 168px total */}
      <div className="flex shrink-0" style={{ borderRadius: 4, overflow: "hidden", height: 32, width: 168 }}>
        {[0.1, 0.2].map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onStepChange(v)}
            className="flex items-center justify-center cursor-pointer border-0 appearance-none outline-none tp-body-02"
            style={{
              flex: "1 1 0",
              height: 32,
              backgroundColor: step === v ? "var(--color-border-interactive, #009ace)" : "#fff",
              color: step === v ? "#fff" : "#3d3935",
              border: step === v ? "none" : "1px solid var(--color-border-accent, rgba(0,0,0,0.23))",
              borderTopLeftRadius: v === 0.1 ? 4 : 0,
              borderBottomLeftRadius: v === 0.1 ? 4 : 0,
              borderTopRightRadius: v === 0.2 ? 4 : 0,
              borderBottomRightRadius: v === 0.2 ? 4 : 0,
            }}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}

function PrepQcInfoToast({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="flex items-start bg-[var(--color-background-elevated,#fff)]"
      style={{
        borderRadius: 8,
        padding: 16,
        gap: 16,
        boxShadow: "0px 2px 12px rgba(0,0,0,0.13)",
        width: 504,
      }}
    >
      <div className="flex flex-1 items-start" style={{ gap: 8 }}>
        <span className="shrink-0"><InfoIcon /></span>
        <div className="flex flex-col" style={{ gap: 4 }}>
          <span className="tp-headling-03 text-text-primary">Instantly evaluate reduction</span>
          <span className="tp-body-02 text-text-secondary">
            The heatmap allows you to evaluate reduction in different areas of the prep.
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="flex items-center justify-center cursor-pointer bg-transparent border-0 appearance-none outline-none transition-ui hover:opacity-70 shrink-0"
        style={{ width: 32, height: 32 }}
        aria-label="Close"
      >
        <CloseIcon />
      </button>
    </div>
  );
}

const POST_PROCESSING_DURATION_MS = 3000;
const POST_PROCESSING_TICK_MS = 50;

function PostProcessingBar({ progress }: { progress: number }) {
  return (
    <div
      className="absolute z-20 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center"
      style={{ width: 288, top: 24 }}
    >
      <span
        className="tp-label-02 text-text-secondary text-center"
        style={{ paddingBottom: 8 }}
      >
        Post processing..
      </span>
      <div
        style={{
          width: "100%",
          height: 8,
          borderRadius: 4,
          backgroundColor: "var(--color-border-subtle, rgba(0,0,0,0.09))",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            borderRadius: 4,
            backgroundColor: "var(--color-border-interactive, #009ace)",
            transition: `width ${POST_PROCESSING_TICK_MS}ms linear`,
          }}
        />
      </div>
    </div>
  );
}

interface ViewStepContentProps {
  toolbarExpanded?: boolean;
  onToolbarExpandedChange?: (expanded: boolean) => void;
  cameraStateRef?: MutableRefObject<CameraState>;
  comingFromScan?: boolean;
}

export default function ViewStepContent({
  toolbarExpanded,
  onToolbarExpandedChange,
  cameraStateRef,
  comingFromScan = false,
}: ViewStepContentProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("color");
  const [showTrimMenu, setShowTrimMenu] = useState(false);
  const [showPrepQc, setShowPrepQc] = useState(false);
  const [showPrepQcToast, setShowPrepQcToast] = useState(false);
  const [prepQcStep, setPrepQcStep] = useState(0.1);
  const [activeTools, setActiveTools] = useState<Set<ViewToolId>>(new Set());

  const [isPostProcessing, setIsPostProcessing] = useState(comingFromScan);
  const [postProcessProgress, setPostProcessProgress] = useState(0);

  const [trimPaths, setTrimPaths] = useState<Point[][]>([]);
  const [currentTrimPath, setCurrentTrimPath] = useState<Point[]>([]);

  const handleTrimDrawStart = useCallback((p: Point) => {
    setCurrentTrimPath([p]);
  }, []);

  const handleTrimDrawMove = useCallback((p: Point) => {
    setCurrentTrimPath((prev) => [...prev, p]);
  }, []);

  const handleTrimDrawEnd = useCallback(() => {
    setCurrentTrimPath((prev) => {
      if (prev.length > 2) {
        setTrimPaths((paths) => [...paths, prev]);
      }
      return [];
    });
  }, []);

  const handleTrimUndo = useCallback(() => {
    setTrimPaths((prev) => prev.slice(0, -1));
  }, []);

  const handleTrimReset = useCallback(() => {
    setTrimPaths([]);
    setCurrentTrimPath([]);
  }, []);

  const deactivateTrim = useCallback(() => {
    setShowTrimMenu(false);
    setTrimPaths([]);
    setCurrentTrimPath([]);
    setActiveTools((prev) => {
      const next = new Set(prev);
      next.delete("trim");
      return next;
    });
  }, []);

  const handleConfirmTrim = useCallback(() => {
    deactivateTrim();
  }, [deactivateTrim]);

  useEffect(() => {
    if (!isPostProcessing) return;

    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed += POST_PROCESSING_TICK_MS;
      const pct = Math.min(100, (elapsed / POST_PROCESSING_DURATION_MS) * 100);
      setPostProcessProgress(pct);

      if (elapsed >= POST_PROCESSING_DURATION_MS) {
        clearInterval(interval);
        setTimeout(() => setIsPostProcessing(false), 200);
      }
    }, POST_PROCESSING_TICK_MS);

    return () => clearInterval(interval);
  }, [isPostProcessing]);

  return (
    <div className="relative flex-1 min-h-0 min-w-0" style={{ backgroundColor: "var(--color-page-background)" }}>
      {/* 3D model viewport — fills entire area */}
      <div className="absolute inset-0 overflow-hidden">
        <Suspense
          fallback={
            <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: "var(--color-page-background)" }}>
              <span className="tp-body-02 text-text-secondary">Loading 3D model…</span>
            </div>
          }
        >
          <PlyModelViewer
            url="/models/upper-jaw.ply"
            viewMode={viewMode}
            cameraStateRef={cameraStateRef}
            showOcclusgramHeatmap={activeTools.has("occlusgram")}
          />
        </Suspense>
      </div>

      {/* Trim drawing overlay — above 3D viewport, below UI controls */}
      {!isPostProcessing && showTrimMenu && (
        <TrimDrawingOverlay
          paths={trimPaths}
          currentPath={currentTrimPath}
          onDrawStart={handleTrimDrawStart}
          onDrawMove={handleTrimDrawMove}
          onDrawEnd={handleTrimDrawEnd}
        />
      )}

      {/* Post processing overlay */}
      {isPostProcessing && <PostProcessingBar progress={postProcessProgress} />}

      {/* Bottom-left: Trim tool menu */}
      {!isPostProcessing && showTrimMenu && (
        <div
          className="absolute z-20"
          style={{ bottom: 12, left: 20 }}
        >
          <TrimToolMenu
            onClose={deactivateTrim}
            onConfirmTrim={handleConfirmTrim}
            onUndo={handleTrimUndo}
          />
        </div>
      )}

      {/* Bottom-center: Refresh/reset trim button */}
      {!isPostProcessing && showTrimMenu && (
        <div className="absolute z-20 left-1/2 -translate-x-1/2" style={{ bottom: 20 }}>
          <button
            type="button"
            onClick={handleTrimReset}
            className="flex items-center justify-center cursor-pointer appearance-none outline-none transition-ui hover:bg-[var(--color-background-layer-hovered)]"
            style={{
              width: 60,
              height: 60,
              backgroundColor: "#fff",
              border: "2px solid var(--color-border-subtle, rgba(0,0,0,0.09))",
              borderRadius: 8,
              padding: 12,
              boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
            }}
            aria-label="Reset trim"
          >
            <RefreshIcon />
          </button>
        </div>
      )}

      {/* Bottom-center: Prep QC heatmap bar */}
      {!isPostProcessing && showPrepQc && (
        <div
          className="absolute z-10 left-1/2 -translate-x-1/2"
          style={{ bottom: 12 }}
        >
          <PrepQcHeatmapBar step={prepQcStep} onStepChange={setPrepQcStep} />
        </div>
      )}

      {/* Right: floating toolbar + toast column */}
      <div
        className="absolute flex flex-col items-end z-20"
        style={{ top: 12, right: 15, gap: 8 }}
      >
        <ViewToolbar
          expanded={toolbarExpanded}
          onExpandedChange={onToolbarExpandedChange}
          activeTools={activeTools}
          onActiveToolsChange={setActiveTools}
          onToolClick={(toolId, isActive) => {
            if (toolId === "scan-color") {
              setViewMode(isActive ? "stone" : "color");
            }
            if (toolId === "trim") {
              setShowTrimMenu(isActive);
              if (!isActive) {
                setTrimPaths([]);
                setCurrentTrimPath([]);
              }
            }
            if (toolId === "prep-qc") {
              setShowPrepQc(isActive);
              if (isActive) setShowPrepQcToast(true);
            }
          }}
        />
        {!isPostProcessing && showPrepQcToast && (
          <PrepQcInfoToast onClose={() => setShowPrepQcToast(false)} />
        )}
      </div>
    </div>
  );
}
