/**
 * iTero Support — Figma UI-Refresh-2025 (node 2001:40406, Remote control).
 * Modal overlay + centered frame; artwork uses Figma crop (nested clip + positioned img).
 */

import { useEffect, useRef, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import { CloseIcon } from "./Icons";

export interface SupportModalProps {
  open: boolean;
  onClose: () => void;
}

const FRAME_W = 272;
const FRAME_H = 438;
/** Inner image viewport — Figma 2001:40319 */
const INNER_W = 270;
const INNER_H = 436;

export default function SupportModal({ open, onClose }: SupportModalProps) {
  const backdropCloseReadyRef = useRef(false);

  useEffect(() => {
    if (!open) {
      backdropCloseReadyRef.current = false;
      return;
    }
    backdropCloseReadyRef.current = false;
    const id = window.setTimeout(() => {
      backdropCloseReadyRef.current = true;
    }, 200);
    return () => window.clearTimeout(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  function handleBackdropPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget) return;
    if (!backdropCloseReadyRef.current) e.preventDefault();
  }

  function handleBackdropClick(e: ReactMouseEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget) return;
    if (!backdropCloseReadyRef.current) return;
    onClose();
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[20050] flex items-center justify-center overscroll-contain px-6 py-6"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.63)" }}
      role="presentation"
      onPointerDown={handleBackdropPointerDown}
      onClick={handleBackdropClick}
    >
      <div
        className="relative shrink-0 overflow-hidden rounded-lg bg-[var(--color-background-layer-01)] shadow-[0_8px_32px_rgba(0,0,0,0.24)]"
        style={{
          width: FRAME_W,
          height: FRAME_H,
          borderRadius: 8,
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="support-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="support-modal-title" className="sr-only">
          iTero Support
        </h2>
        {/* Figma 2001:40322 → 2001:40319: clipped image crop */}
        <div
          className="absolute overflow-hidden rounded-lg"
          style={{
            width: INNER_W,
            height: INNER_H,
            left: 1,
            top: 1,
            borderRadius: 8,
          }}
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg" style={{ borderRadius: 8 }}>
            <img
              src="/support-remote-control.png"
              alt="iTero Support remote session window. Allow remote control, your ID and password, and connection status."
              className="absolute max-w-none"
              style={{
                width: "710%",
                height: "237.61%",
                left: "-305.56%",
                top: "-68.35%",
              }}
              draggable={false}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-1 top-1 z-[1] flex cursor-pointer items-center justify-center rounded-md border-0 bg-[var(--color-background-layer-01)]/90 p-2 outline-none transition-ui hover:bg-[var(--color-background-layer-hovered)] focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]"
          aria-label="Close support"
        >
          <CloseIcon size={20} color="var(--color-icon-primary)" />
        </button>
      </div>
    </div>,
    document.body,
  );
}
