/**
 * Scan long-tap context menu — Figma 5941:132674 (Menu- long tap).
 * Fixed restorative scan step only; opens after a long press on the viewport.
 */

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import deleteIcon from "../../assets/scan/long-tap-menu/delete.png";
import cutIcon from "../../assets/scan/long-tap-menu/cut.png";
import eraseIcon from "../../assets/scan/long-tap-menu/erase.png";
import subtractOutlineIcon from "../../assets/scan/long-tap-menu/subtract-outline.png";
import salivaDetectionIcon from "../../assets/scan/long-tap-menu/saliva-detection.png";

export type ScanLongTapMenuAction =
  | "delete-segment"
  | "trim"
  | "eraser"
  | "enable-appliance-scan"
  | "disable-saliva-detection";

const MENU_WIDTH = 288;
const LONG_PRESS_MS = 500;
const MOVE_THRESHOLD_PX = 10;

type MenuItem = {
  id: ScanLongTapMenuAction;
  label: string;
  icon: string;
  danger?: boolean;
  dividerAfter?: boolean;
};

const MENU_ITEMS: MenuItem[] = [
  { id: "delete-segment", label: "Delete segment", icon: deleteIcon, danger: true, dividerAfter: true },
  { id: "trim", label: "Trim", icon: cutIcon, dividerAfter: true },
  { id: "eraser", label: "Eraser", icon: eraseIcon, dividerAfter: true },
  { id: "enable-appliance-scan", label: "Enable appliance scan", icon: subtractOutlineIcon, dividerAfter: true },
  { id: "disable-saliva-detection", label: "Disable Saliva Detection", icon: salivaDetectionIcon },
];

interface ScanLongTapMenuProps {
  open: boolean;
  x: number;
  y: number;
  containerRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  onAction?: (action: ScanLongTapMenuAction) => void;
}

function clampMenuPosition(
  x: number,
  y: number,
  container: HTMLElement,
): { left: number; top: number } {
  const rect = container.getBoundingClientRect();
  const estimatedHeight = 60 * MENU_ITEMS.length;
  const maxLeft = Math.max(0, rect.width - MENU_WIDTH);
  const maxTop = Math.max(0, rect.height - estimatedHeight);
  const left = Math.min(Math.max(0, x - rect.left), maxLeft);
  const top = Math.min(Math.max(0, y - rect.top), maxTop);
  return { left, top };
}

export function ScanLongTapMenu26A({ open, x, y, containerRef, onClose, onAction }: ScanLongTapMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: PointerEvent) {
      if (menuRef.current?.contains(e.target as Node)) return;
      onClose();
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open || !containerRef.current) return null;

  const { left, top } = clampMenuPosition(x, y, containerRef.current);

  return (
    <div
      ref={menuRef}
      className="absolute z-[15]"
      style={{ left, top, width: MENU_WIDTH }}
      role="menu"
      aria-label="Scan actions"
    >
      <div
        className="flex flex-col bg-[var(--color-background-elevated)] border border-[var(--color-border-subtle)]"
        style={{
          borderRadius: 8,
          padding: 4,
          boxShadow: "0px 2px 6px rgba(0,0,0,0.13)",
        }}
      >
        {MENU_ITEMS.map((item) => (
          <div key={item.id} className="flex flex-col h-[60px] justify-center overflow-hidden w-full">
            <button
              type="button"
              role="menuitem"
              className="flex flex-1 items-center cursor-pointer bg-transparent border-0 appearance-none outline-none transition-ui hover:bg-[var(--color-background-layer-hovered)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-border-focus)]"
              style={{ padding: 12, gap: 8, borderRadius: 8, width: "100%", minHeight: 52 }}
              onClick={() => {
                onAction?.(item.id);
                onClose();
              }}
            >
              <img src={item.icon} alt="" width={20} height={20} className="shrink-0" aria-hidden />
              <span
                className={`tp-body-02 truncate ${item.danger ? "text-[var(--color-text-error,#d43f58)]" : "text-text-primary"}`}
              >
                {item.label}
              </span>
            </button>
            {item.dividerAfter && (
              <div className="h-[8px] relative shrink-0 w-full overflow-hidden">
                <div
                  className="absolute left-0 right-0 top-[3px] h-px border-t border-[var(--color-border-subtle)]"
                  aria-hidden
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface ScanLongTapMenuOverlay26AProps {
  enabled: boolean;
  containerRef: RefObject<HTMLElement | null>;
  onAction?: (action: ScanLongTapMenuAction) => void;
}

export default function ScanLongTapMenuOverlay26A({
  enabled,
  containerRef,
  onAction,
}: ScanLongTapMenuOverlay26AProps) {
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const timerRef = useRef<number | null>(null);
  const originRef = useRef<{ x: number; y: number; pointerId: number } | null>(null);
  const suppressNextClickRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const closeMenu = useCallback(() => {
    setMenu(null);
  }, []);

  useEffect(() => {
    if (!enabled) {
      clearTimer();
      originRef.current = null;
      setMenu(null);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    function onPointerDown(e: PointerEvent) {
      if (e.button !== 0) return;
      if (!(e.target instanceof Node) || !container!.contains(e.target)) return;
      // Ignore presses on elevated UI inside the viewport stack (if any).
      if ((e.target as HTMLElement).closest?.("[data-scan-long-tap-ignore]")) return;

      clearTimer();
      originRef.current = { x: e.clientX, y: e.clientY, pointerId: e.pointerId };
      timerRef.current = window.setTimeout(() => {
        if (!originRef.current) return;
        suppressNextClickRef.current = true;
        setMenu({ x: originRef.current.x, y: originRef.current.y });
        originRef.current = null;
        timerRef.current = null;
      }, LONG_PRESS_MS);
    }

    function onPointerMove(e: PointerEvent) {
      if (!originRef.current || originRef.current.pointerId !== e.pointerId) return;
      const dx = e.clientX - originRef.current.x;
      const dy = e.clientY - originRef.current.y;
      if (Math.hypot(dx, dy) > MOVE_THRESHOLD_PX) {
        clearTimer();
        originRef.current = null;
      }
    }

    function onPointerUp(e: PointerEvent) {
      if (originRef.current?.pointerId === e.pointerId) {
        clearTimer();
        originRef.current = null;
      }
    }

    function onClickCapture(e: MouseEvent) {
      if (!suppressNextClickRef.current) return;
      suppressNextClickRef.current = false;
      e.preventDefault();
      e.stopPropagation();
    }

    container.addEventListener("pointerdown", onPointerDown);
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerup", onPointerUp);
    container.addEventListener("pointercancel", onPointerUp);
    container.addEventListener("click", onClickCapture, true);

    return () => {
      clearTimer();
      originRef.current = null;
      container.removeEventListener("pointerdown", onPointerDown);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerup", onPointerUp);
      container.removeEventListener("pointercancel", onPointerUp);
      container.removeEventListener("click", onClickCapture, true);
    };
  }, [enabled, containerRef, clearTimer]);

  return (
    <ScanLongTapMenu26A
      open={menu != null}
      x={menu?.x ?? 0}
      y={menu?.y ?? 0}
      containerRef={containerRef}
      onClose={closeMenu}
      onAction={onAction}
    />
  );
}
