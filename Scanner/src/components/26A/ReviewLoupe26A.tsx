/**
 * Review-tool loupe — a floating, draggable magnifying-glass icon shown on top
 * of the 3D model viewport while the View step's Review tool is active.
 *
 * The loupe itself is intentionally lightweight (just the icon image plus
 * pointer-drag handling); any actual magnification logic can be layered on
 * later by feeding the current position into the 3D viewport.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import loupeIcon from "../../assets/view/loupe.png";

const LOUPE_SIZE = 200;

export interface ReviewLoupe26AProps {
  /** Optional starting position in viewport-relative pixels. Defaults to roughly the centre of the parent. */
  initialPosition?: { x: number; y: number };
}

export default function ReviewLoupe26A({ initialPosition }: ReviewLoupe26AProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    initialPosition ?? null,
  );
  const dragOffsetRef = useRef<{ dx: number; dy: number } | null>(null);

  // Centre the loupe inside its positioning parent on first mount when no
  // explicit initial position was supplied.
  useEffect(() => {
    if (position != null) return;
    const parent = containerRef.current?.offsetParent as HTMLElement | null;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    setPosition({
      x: Math.max(0, rect.width / 2 - LOUPE_SIZE / 2),
      y: Math.max(0, rect.height / 2 - LOUPE_SIZE / 2),
    });
  }, [position]);

  const clampToParent = useCallback((x: number, y: number) => {
    const parent = containerRef.current?.offsetParent as HTMLElement | null;
    if (!parent) return { x, y };
    const rect = parent.getBoundingClientRect();
    const maxX = Math.max(0, rect.width - LOUPE_SIZE);
    const maxY = Math.max(0, rect.height - LOUPE_SIZE);
    return {
      x: Math.min(maxX, Math.max(0, x)),
      y: Math.min(maxY, Math.max(0, y)),
    };
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);
    const rect = target.getBoundingClientRect();
    dragOffsetRef.current = {
      dx: e.clientX - rect.left,
      dy: e.clientY - rect.top,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const offset = dragOffsetRef.current;
    if (!offset) return;
    const parent = containerRef.current?.offsetParent as HTMLElement | null;
    if (!parent) return;
    const parentRect = parent.getBoundingClientRect();
    const nextX = e.clientX - parentRect.left - offset.dx;
    const nextY = e.clientY - parentRect.top - offset.dy;
    setPosition(clampToParent(nextX, nextY));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    dragOffsetRef.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label="Review loupe"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="pointer-events-auto absolute select-none"
      style={{
        left: position?.x ?? 0,
        top: position?.y ?? 0,
        width: LOUPE_SIZE,
        height: LOUPE_SIZE,
        cursor: dragOffsetRef.current ? "grabbing" : "grab",
        touchAction: "none",
        visibility: position == null ? "hidden" : "visible",
      }}
    >
      <img
        src={loupeIcon}
        alt=""
        aria-hidden
        draggable={false}
        width={LOUPE_SIZE}
        height={LOUPE_SIZE}
        className="block h-full w-full pointer-events-none select-none"
        style={{ objectFit: "contain" }}
      />
    </div>
  );
}
