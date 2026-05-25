/**
 * Lasso drawing overlay — 2D canvas that captures pointer events and renders
 * one or more closed lasso paths over the viewport. Used by the Trim tool
 * (View step) and the Prep Edit tool (Scan step).
 *
 * The component is purely visual; consumers manage the path state and decide
 * what to do with the resulting paths (e.g. project to 3D and cut a mesh).
 */

import { useCallback, useEffect, useRef } from "react";

export type LassoPoint = { x: number; y: number };

export interface LassoDrawingOverlayProps {
  paths: LassoPoint[][];
  currentPath: LassoPoint[];
  onDrawStart: (p: LassoPoint) => void;
  onDrawMove: (p: LassoPoint) => void;
  onDrawEnd: () => void;
  /** Optional extra classes for the overlay container (defaults to `absolute inset-0`). */
  className?: string;
  /** Optional inline style override for the overlay container. */
  style?: React.CSSProperties;
}

export default function LassoDrawingOverlay26A({
  paths,
  currentPath,
  onDrawStart,
  onDrawMove,
  onDrawEnd,
  className,
  style,
}: LassoDrawingOverlayProps) {
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

    const drawPath = (points: LassoPoint[], close: boolean) => {
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

  const getPoint = useCallback((e: React.PointerEvent<HTMLCanvasElement>): LassoPoint => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 ${className ?? ""}`.trim()}
      style={{ cursor: "crosshair", ...style }}
    >
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
