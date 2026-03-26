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
import ReviewToolPanel from "./ReviewToolPanel";
import MultiLayerPanel, { type LayerItem, type SelectedLayerId } from "./MultiLayerPanel";
import type { ViewMode, CameraState } from "./PlyModelViewer";

const PlyModelViewer = lazy(() => import("./PlyModelViewer"));

const VIEW_LAYER_DEFS: LayerItem[] = [
  { id: "pre-treatment", label: "Pre-treatment", sublabel: "Upper arch" },
  { id: "treatment-scan", label: "Treatment scan", sublabel: "Upper arch" },
];

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

/* Margin line UI — Figma 4023:73770 (toast), 4024:75708 (tool window). Icons from design. */
/* Icon touch — from design (Icon touch.svg). */
function IconTouchML({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M20.0024 8H18.003C18.003 6.67392 17.4763 5.40215 16.5389 4.46446C15.6015 3.52678 14.3301 3 13.0044 3C11.6788 3 10.4074 3.52678 9.46995 4.46446C8.53255 5.40215 8.00592 6.67392 8.00592 8H6.00651C6.00651 6.14348 6.74379 4.36301 8.05616 3.05025C9.36853 1.7375 11.1485 1 13.0044 1C14.8604 1 16.6404 1.7375 17.9527 3.05025C19.2651 4.36301 20.0024 6.14348 20.0024 8Z"
        fill="currentColor"
        fillOpacity={0.63}
      />
      <path
        d="M25.0009 15C24.4844 15.0019 23.9775 15.1398 23.5313 15.4C23.2618 14.9724 22.8886 14.6198 22.4464 14.3751C22.0043 14.1303 21.5074 14.0013 21.0021 14C20.4856 14.0019 19.9787 14.1398 19.5325 14.4C19.1688 13.8275 18.6219 13.3952 17.981 13.1737C17.3401 12.9521 16.643 12.9543 16.0036 13.18V8C16.0036 7.20435 15.6876 6.44129 15.1251 5.87868C14.5627 5.31607 13.7999 5 13.0044 5C12.209 5 11.4462 5.31607 10.8837 5.87868C10.3213 6.44129 10.0053 7.20435 10.0053 8V19.1L7.77599 17.58C7.26494 17.1993 6.64371 16.9957 6.00651 17C5.41167 16.9985 4.82982 17.174 4.33495 17.5042C3.84008 17.8344 3.45455 18.3043 3.22736 18.8542C3.00017 19.4041 2.94159 20.0092 3.05908 20.5925C3.17656 21.1758 3.4648 21.711 3.88714 22.13L11.8848 29.43C13.017 30.4437 14.484 31.0029 16.0036 31H21.0021C22.858 31 24.638 30.2625 25.9504 28.9497C27.2627 27.637 28 25.8565 28 24V18C28 17.2043 27.684 16.4413 27.1216 15.8787C26.5591 15.3161 25.7963 15 25.0009 15ZM26.0006 24C26.0006 25.3261 25.474 26.5978 24.5366 27.5355C23.5992 28.4732 22.3278 29 21.0021 29H16.0036C14.9931 29.0122 14.0125 28.6568 13.2444 28L5.29673 20.7C5.11204 20.5137 5.00792 20.2623 5.00681 20C5.00681 19.8143 5.05851 19.6322 5.15612 19.4743C5.25372 19.3163 5.39338 19.1886 5.55943 19.1056C5.72549 19.0225 5.91139 18.9874 6.09629 19.004C6.2812 19.0207 6.45781 19.0886 6.60634 19.2L12.0047 22.9V8C12.0047 7.73478 12.1101 7.48043 12.2975 7.29289C12.485 7.10535 12.7393 7 13.0044 7C13.2696 7 13.5239 7.10535 13.7113 7.29289C13.8988 7.48043 14.0041 7.73478 14.0041 8V19H16.0036V16C16.0036 15.7348 16.1089 15.4804 16.2964 15.2929C16.4838 15.1054 16.7381 15 17.0033 15C17.2684 15 17.5227 15.1054 17.7102 15.2929C17.8976 15.4804 18.003 15.7348 18.003 16V19H20.0024V17C20.0024 16.7348 20.1077 16.4804 20.2952 16.2929C20.4827 16.1054 20.7369 16 21.0021 16C21.2672 16 21.5215 16.1054 21.709 16.2929C21.8965 16.4804 22.0018 16.7348 22.0018 17V19H24.0012V18C24.0012 17.7348 24.1065 17.4804 24.294 17.2929C24.4815 17.1054 24.7358 17 25.0009 17C25.266 17 25.5203 17.1054 25.7078 17.2929C25.8953 17.4804 26.0006 17.7348 26.0006 18V24Z"
        fill="currentColor"
        fillOpacity={0.63}
      />
    </svg>
  );
}
function IconCheckmarkEmpty() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M8.125 15.0009L2.5 9.37594L3.38375 8.49219L8.125 13.2328L16.6163 4.74219L17.5 5.62594L8.125 15.0009Z" fill="currentColor" />
    </svg>
  );
}
function IconChevronRightML() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M22.0016 16L12.0016 26L10.6016 24.6L19.2016 16L10.6016 7.4L12.0016 6L22.0016 16Z" fill="currentColor" />
    </svg>
  );
}
function IconDeleteML() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M8.75 7.5H7.5V15H8.75V7.5Z" fill="currentColor" />
      <path d="M12.5 7.5H11.25V15H12.5V7.5Z" fill="currentColor" />
      <path d="M2.5 3.75V5H3.75V17.5C3.75 17.8315 3.8817 18.1495 4.11612 18.3839C4.35054 18.6183 4.66848 18.75 5 18.75H15C15.3315 18.75 15.6495 18.6183 15.8839 18.3839C16.1183 18.1495 16.25 17.8315 16.25 17.5V5H17.5V3.75H2.5ZM5 17.5V5H15V17.5H5Z" fill="currentColor" />
      <path d="M12.5 1.25H7.5V2.5H12.5V1.25Z" fill="currentColor" />
    </svg>
  );
}
function IconDrawML() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M11.9625 17.4997C11.5381 17.5014 11.1229 17.3767 10.7696 17.1416C10.4164 16.9064 10.1411 16.5715 9.97891 16.1793C9.8167 15.7872 9.77487 15.3556 9.85877 14.9397C9.94266 14.5237 10.1485 14.1421 10.45 13.8435L13.6625 10.6247C13.7572 10.5458 13.8344 10.4479 13.8892 10.3375C13.944 10.227 13.9751 10.1064 13.9807 9.98319C13.9863 9.86002 13.9661 9.73704 13.9215 9.6221C13.8769 9.50715 13.8088 9.40276 13.7217 9.31557C13.6345 9.22839 13.5301 9.16033 13.4151 9.11573C13.3002 9.07113 13.1772 9.05097 13.054 9.05654C12.9309 9.0621 12.8102 9.09327 12.6998 9.14805C12.5893 9.20284 12.4915 9.28004 12.4125 9.37473L8.125 13.656C7.71756 14.0475 7.17443 14.2661 6.60938 14.2661C6.04432 14.2661 5.50119 14.0475 5.09375 13.656C4.69377 13.2542 4.46921 12.7104 4.46921 12.1435C4.46921 11.5766 4.69377 11.0327 5.09375 10.631L10.4562 5.26848C10.5509 5.18951 10.6281 5.09168 10.6829 4.98123C10.7377 4.87077 10.7689 4.75011 10.7744 4.62694C10.78 4.50377 10.7598 4.38079 10.7152 4.26585C10.6706 4.1509 10.6026 4.04651 10.5154 3.95932C10.4282 3.87214 10.3238 3.80408 10.2089 3.75948C10.0939 3.71488 9.97096 3.69472 9.84779 3.70029C9.72462 3.70585 9.60396 3.73702 9.4935 3.79181C9.38304 3.84659 9.28521 3.92379 9.20625 4.01848L4.00625 9.18723L3.125 8.31223L8.30625 3.12473C8.71437 2.7553 9.24897 2.55703 9.79929 2.571C10.3496 2.58497 10.8735 2.81011 11.2623 3.19977C11.6512 3.58943 11.8752 4.11374 11.8881 4.66408C11.9009 5.21443 11.7015 5.74862 11.3312 6.15598L5.975 11.5122C5.81012 11.6785 5.7176 11.9031 5.7176 12.1372C5.7176 12.3714 5.81012 12.596 5.975 12.7622C6.14351 12.9227 6.3673 13.0122 6.6 13.0122C6.8327 13.0122 7.05649 12.9227 7.225 12.7622L11.5125 8.47473C11.7073 8.2595 11.9438 8.08608 12.2077 7.965C12.4715 7.84391 12.7572 7.77767 13.0474 7.77031C13.3376 7.76294 13.6263 7.81459 13.896 7.92214C14.1656 8.02968 14.4106 8.19088 14.6161 8.39594C14.8216 8.60101 14.9833 8.84568 15.0914 9.11511C15.1995 9.38454 15.2518 9.67312 15.245 9.96334C15.2382 10.2536 15.1726 10.5394 15.052 10.8035C14.9315 11.0676 14.7586 11.3045 14.5438 11.4997L11.325 14.7185C11.1831 14.8886 11.11 15.1056 11.12 15.3269C11.13 15.5482 11.2224 15.7578 11.379 15.9144C11.5357 16.0711 11.7452 16.1635 11.9665 16.1735C12.1878 16.1835 12.4049 16.1104 12.575 15.9685L15.35 13.1997L16.25 14.0997L13.475 16.8747C13.2771 17.0743 13.0414 17.2323 12.7817 17.3396C12.522 17.447 12.2435 17.5014 11.9625 17.4997Z" fill="currentColor" />
    </svg>
  );
}
function IconChevronLeftML() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M10 16L20 6L21.4 7.4L12.8 16L21.4 24.6L20 26L10 16Z" fill="currentColor" />
    </svg>
  );
}
function IconCloseEmptyML() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M24 9.4L22.6 8L16 14.6L9.4 8L8 9.4L14.6 16L8 22.6L9.4 24L16 17.4L22.6 24L24 22.6L17.4 16L24 9.4Z" fill="currentColor" />
    </svg>
  );
}

/* Toast — Figma 4023:73770. Depth 01: 0 2px 12px rgba(0,0,0,0.13). Body/tp-body-02: 18px, 28px, Regular. */
function MarginLineToast({ toothLabel = "17" }: { toothLabel?: string }) {
  return (
    <div
      className="flex items-start overflow-hidden bg-[var(--color-background-elevated)] text-[var(--color-text-primary)]"
      style={{
        borderRadius: 8,
        padding: 16,
        gap: 16,
        boxShadow: "0px 2px 12px 0px rgba(0,0,0,0.13)",
        width: "fit-content",
      }}
    >
      <div
        className="flex items-start overflow-hidden shrink-0"
        style={{ gap: 8, width: "fit-content" }}
      >
        <div className="relative shrink-0 overflow-hidden" style={{ width: 32, height: 32 }}>
          <IconTouchML size={32} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <p className="tp-body-02 h-fit text-[var(--color-text-primary)] w-full whitespace-nowrap">
            Tap on{" "}
            <span className="font-medium underline decoration-solid [text-decoration-skip-ink:none]">
              tooth {toothLabel}
            </span>{" "}
            to detect the margin line.
          </p>
        </div>
      </div>
    </div>
  );
}

/* Margin Line window — Figma 4024:75708. Border: border-subtle rgba(0,0,0,0.09). px 4px, rounded 8px, 344px. */
const SPACING_02 = 8;
const SPACING_03 = 12;
const MEDIUM_RADIUS = 8;
const ITEM_HEIGHT = 60;

function MarginLinePanel({
  onClose,
  toothLabel = "17",
  onToothPrev,
  onToothNext,
  onDetectMargin,
  onMarkManually,
  onUndo,
  onClear,
}: {
  onClose: () => void;
  toothLabel?: string;
  onToothPrev?: () => void;
  onToothNext?: () => void;
  onDetectMargin?: () => void;
  onMarkManually?: () => void;
  onUndo?: () => void;
  onClear?: () => void;
}) {
  const itemStyle = {
    padding: SPACING_03,
    gap: SPACING_02,
    borderRadius: MEDIUM_RADIUS,
  };
  const rowClass =
    "flex flex-1 items-center min-h-0 min-w-0 border-0 cursor-pointer appearance-none outline-none transition-ui hover:bg-[var(--color-background-layer-hovered)] text-left w-full";
  return (
    <div
      className="flex flex-col overflow-hidden bg-[var(--color-background-elevated)] border border-solid rounded-[8px]"
      style={{
        width: 344,
        paddingLeft: 4,
        paddingRight: 4,
        borderColor: "var(--color-border-subtle)",
        boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
      }}
    >
      {/* Item 01 — Figma 4024:76170. tp-headling-03: 20px Medium, line-height 32px. */}
      <div className="flex flex-col justify-center overflow-hidden shrink-0" style={{ height: ITEM_HEIGHT, width: "100%" }}>
        <div className={`flex items-center ${rowClass}`} style={itemStyle}>
          <span className="tp-headling-03 text-[var(--color-text-primary)] flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
            Margin line
          </span>
          <button
            type="button"
            onClick={onClose}
            className="flex shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-[4px] border-0 bg-transparent p-0 outline-none transition-ui hover:opacity-70"
            style={{ width: 32, height: 32 }}
            aria-label="Close margin line"
          >
            <IconCloseEmptyML />
          </button>
        </div>
      </div>
      {/* Item 02 — Figma 4024:75710. Column h-60: blue row (flex-1 = 52px) + divider h-8, border at top 3px. */}
      <div className="flex shrink-0 flex-col overflow-hidden" style={{ height: ITEM_HEIGHT, width: "100%" }}>
        <div
          className="flex flex-1 min-h-0 items-center min-w-0 rounded-[8px]"
          style={{
            ...itemStyle,
            backgroundColor: "var(--color-background-highlight-blue)",
          }}
        >
          <button
            type="button"
            onClick={onToothPrev}
            className="flex shrink-0 cursor-pointer items-center justify-center overflow-hidden border-0 bg-transparent p-0 outline-none transition-ui hover:opacity-70 text-[var(--color-icon-primary)]"
            style={{ width: 32, height: 32 }}
            aria-label="Previous tooth"
          >
            <IconChevronLeftML />
          </button>
          <span
            className="tp-body-02 flex-1 overflow-hidden text-center text-ellipsis whitespace-nowrap text-[var(--color-text-primary)]"
            style={{ fontWeight: 600 }}
          >
            Tooth {toothLabel}
          </span>
          <div className="flex shrink-0 items-center justify-center overflow-hidden rounded-[4px]" style={{ width: 32, height: 32 }}>
            <button
              type="button"
              onClick={onToothNext}
              className="flex size-full cursor-pointer items-center justify-center border-0 bg-transparent p-0 outline-none transition-ui hover:opacity-70 text-[var(--color-icon-primary)]"
              aria-label="Next tooth"
            >
              <IconChevronRightML />
            </button>
          </div>
        </div>
        <div className="relative h-[8px] w-full shrink-0 overflow-hidden" aria-hidden>
          <div
            className="absolute left-0 right-0 border-t border-solid border-[var(--color-border-subtle)]"
            style={{ top: 3, height: 1 }}
          />
        </div>
      </div>
      {/* Items 03–06 — Figma 4024:75711–75714. Icon 20px, tp-body-02: 18px Regular, line-height 28px. */}
      {[
        { label: "Detect margin", icon: <IconCheckmarkEmpty />, onClick: onDetectMargin },
        { label: "Mark manually", icon: <IconDrawML />, onClick: onMarkManually },
        { label: "Undo", icon: <UndoIcon />, onClick: onUndo },
        { label: "Clear", icon: <IconDeleteML />, onClick: onClear },
      ].map(({ label, icon, onClick }) => (
        <div key={label} className="flex shrink-0 flex-col justify-center overflow-hidden" style={{ height: ITEM_HEIGHT, width: "100%" }}>
          <button type="button" className={`flex items-center ${rowClass}`} style={itemStyle} onClick={onClick}>
            <span className="flex shrink-0 text-[var(--color-icon-primary)]" style={{ width: 20, height: 20 }}>
              {icon}
            </span>
            <span className="tp-body-02 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[var(--color-text-primary)]">
              {label}
            </span>
          </button>
        </div>
      ))}
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
  const [marginLineTooth, setMarginLineTooth] = useState("17");

  const [isPostProcessing, setIsPostProcessing] = useState(comingFromScan);
  const [postProcessProgress, setPostProcessProgress] = useState(0);

  const [trimPaths, setTrimPaths] = useState<Point[][]>([]);
  const [currentTrimPath, setCurrentTrimPath] = useState<Point[]>([]);

  const [layerOpacities, setLayerOpacities] = useState<Record<string, number>>(() =>
    Object.fromEntries(VIEW_LAYER_DEFS.map((l) => [l.id, 100])),
  );
  const [layerVisibility, setLayerVisibility] = useState<Record<string, boolean>>(() => ({
    "pre-treatment": true,
    "treatment-scan": false,
  }));
  const [selectedLayerId, setSelectedLayerId] = useState<SelectedLayerId>("pre-treatment");
  const viewLayers: LayerItem[] = VIEW_LAYER_DEFS.map((l) => ({
    ...l,
    disabled: !layerVisibility[l.id],
  }));
  const handleLayerOpacityChange = useCallback((layerId: string, value: number) => {
    setLayerOpacities((prev) => ({ ...prev, [layerId]: value }));
  }, []);
  const handleLayerVisibilityChange = useCallback(
    (layerId: string, visible: boolean) => {
      setLayerVisibility((prev) => ({ ...prev, [layerId]: visible }));
      // When hiding the currently selected layer, switch selection to the first other visible layer (if any).
      if (!visible && selectedLayerId === layerId) {
        const firstVisibleId = VIEW_LAYER_DEFS.find((l) => l.id !== layerId && layerVisibility[l.id])?.id;
        if (firstVisibleId) setSelectedLayerId(firstVisibleId);
      }
    },
    [selectedLayerId, layerVisibility],
  );
  const opacityForViewer =
    selectedLayerId && selectedLayerId !== "add" && layerVisibility[selectedLayerId] && viewLayers.some((l) => l.id === selectedLayerId)
      ? (layerOpacities[selectedLayerId] ?? 100) / 100
      : selectedLayerId && selectedLayerId !== "add" && viewLayers.some((l) => l.id === selectedLayerId)
        ? 0
        : layerVisibility["pre-treatment"]
          ? (layerOpacities["pre-treatment"] ?? 100) / 100
          : 0;

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
            opacity={opacityForViewer}
          />
        </Suspense>
      </div>

      {/* Top-left: multi layer panel — Figma 4024:77272 */}
      <div className="absolute z-20" style={{ top: 12, left: 16 }}>
        <MultiLayerPanel
          layers={viewLayers}
          layerOpacities={layerOpacities}
          onLayerOpacityChange={handleLayerOpacityChange}
          onLayerVisibilityChange={handleLayerVisibilityChange}
          selectedLayerId={selectedLayerId}
          onSelectedLayerChange={setSelectedLayerId}
        />
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

      {/* Bottom-left: Margin line tool window — Figma 4024:75708 */}
      {!isPostProcessing && activeTools.has("margin-line") && (
        <div
          className="absolute z-20"
          style={{ bottom: 12, left: 16 }}
        >
          <MarginLinePanel
            toothLabel={marginLineTooth}
            onClose={() => setActiveTools((prev) => { const next = new Set(prev); next.delete("margin-line"); return next; })}
            onToothPrev={() => setMarginLineTooth((t) => (Number(t) > 1 ? String(Number(t) - 1) : t))}
            onToothNext={() => setMarginLineTooth((t) => (Number(t) < 32 ? String(Number(t) + 1) : t))}
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

      {/* Center-top: Margin line toast — Figma 4023:73770 */}
      {!isPostProcessing && activeTools.has("margin-line") && (
        <div
          className="absolute z-20 left-1/2 -translate-x-1/2"
          style={{ top: 12 }}
        >
          <MarginLineToast toothLabel={marginLineTooth} />
        </div>
      )}

      {/* Right: floating toolbar — Figma 1497:27534; Review tool panel 4302:155715 (16px below toolbar) */}
      <div className="absolute z-20 flex w-fit flex-col items-end" style={{ top: 12, right: 15 }}>
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
        {!isPostProcessing && activeTools.has("review-tool") && (
          <ReviewToolPanel
            onClose={() =>
              setActiveTools((prev) => {
                const next = new Set(prev);
                next.delete("review-tool");
                return next;
              })
            }
          />
        )}
        {!isPostProcessing && showPrepQcToast && (
          <div style={{ marginTop: 8 }}>
            <PrepQcInfoToast onClose={() => setShowPrepQcToast(false)} />
          </div>
        )}
      </div>
    </div>
  );
}
