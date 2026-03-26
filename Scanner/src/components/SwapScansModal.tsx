/**
 * Swap scans modal — Figma UI-Refresh-2025 Q2 (4291:158458 · full screen 4302:155603).
 * Overlay / Depth 01 shadow / controls: node 4302:155603.
 * Titles: 4291:158471 · Swap control: 4291:158476 (side-by-side arrows).
 */

import { useState, useEffect, type CSSProperties } from "react";
import { createPortal } from "react-dom";

const UPPER_PREVIEW = "/swap/upper-arch.png";
const LOWER_PREVIEW = "/swap/lower-arch.png";

/** Solid hover — no translucent layer-hovered */
const BTN_HOVER = "hover:bg-[var(--color-background-layer-02)]";
/** Depth 01 — Figma drop shadow (4302:155603): offset (0,2), blur 12, #00000020 */
const DEPTH_01_SHADOW = "0px 2px 12px rgba(0, 0, 0, 0.13)";
const BTN_BASE =
  `border-2 border-solid border-[var(--color-border-subtle)] bg-[var(--color-background-layer-01)] text-[var(--color-icon-primary)] transition-[background-color] duration-150 ease-out ${BTN_HOVER} focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2`;

/** Icon.svg — close (cancel) */
function SvgIconClose({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden className="shrink-0">
      <path
        d="M27 10.575L25.425 9L18 16.425L10.575 9L9 10.575L16.425 18L9 25.425L10.575 27L18 19.575L25.425 27L27 25.425L19.575 18L27 10.575Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Checkmark empty.svg — confirm */
function SvgCheckmarkFilled({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden className="shrink-0">
      <path
        d="M8.125 15.0009L2.5 9.37594L3.38375 8.49219L8.125 13.2328L16.6163 4.74219L17.5 5.62594L8.125 15.0009Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Arrow up.svg — Figma swap control uses ↑ and ↓ side by side */
function SvgArrowUp({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden className="shrink-0">
      <path
        d="M16 4L10 10L11.41 11.41L15 7.83V28H17V7.83L20.59 11.41L22 10L16 4Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Arrow dwon.svg */
function SvgArrowDown({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden className="shrink-0">
      <path
        d="M20.59 20.59L17 24.17V4H15V24.17L11.41 20.59L10 22L16 28L22 22L20.59 20.59Z"
        fill="currentColor"
      />
    </svg>
  );
}

export interface SwapScansModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  upperLabel?: string;
  lowerLabel?: string;
}

const CARD_RADIUS = 16;
const CARD_PADDING = 16;
/** Modal column width + preview block height (Figma) */
const MODAL_W = 600;
const PREVIEW_H = 400;
const CANCEL_BTN_SIZE = 60;
/** Swap control between preview cards (Figma) */
const SWAP_BTN_SIZE = 60;
const ARROW_INNER = 32;

export default function SwapScansModal({
  open,
  onClose,
  onConfirm,
  upperLabel = "Upper 1",
  lowerLabel = "Lower 1",
}: SwapScansModalProps) {
  const [previewsSwapped, setPreviewsSwapped] = useState(false);

  useEffect(() => {
    if (open) setPreviewsSwapped(false);
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  const topLabel = previewsSwapped ? lowerLabel : upperLabel;
  const bottomLabel = previewsSwapped ? upperLabel : lowerLabel;
  const topImg = previewsSwapped ? LOWER_PREVIEW : UPPER_PREVIEW;
  const bottomImg = previewsSwapped ? UPPER_PREVIEW : LOWER_PREVIEW;

  const cardStyle: CSSProperties = {
    width: MODAL_W,
    borderRadius: CARD_RADIUS,
    backgroundColor: "var(--color-background-layer-01)",
    border: "1px solid var(--color-border-subtle)",
    boxShadow: DEPTH_01_SHADOW,
    overflow: "hidden",
  };

  const previewStyle: CSSProperties = {
    height: PREVIEW_H,
    width: "100%",
    backgroundColor: "#ffffff",
    padding: CARD_PADDING,
  };

  const node = (
    <div
      className="fixed inset-0 z-[10050] flex items-center justify-center"
      style={{ padding: 24 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="swap-scans-title"
    >
      {/* Full-screen dim — token matches Figma background-overlay rgba(0,0,0,0.63) */}
      <div
        className="absolute inset-0 animate-modal-backdrop-enter bg-[var(--color-background-overlay)]"
        onClick={onClose}
        aria-hidden
      />

      <div
        className="relative z-10 flex w-full flex-col items-center animate-modal-content-enter"
        style={{ width: MODAL_W, maxWidth: "100%" }}
        onClick={(e) => e.stopPropagation()}
      >
        <span id="swap-scans-title" className="sr-only">
          Swap scans
        </span>

        {/* Top scan card */}
        <div className="flex flex-col" style={cardStyle}>
          <div style={{ padding: `${CARD_PADDING}px ${CARD_PADDING}px 8px` }}>
            <span className="tp-heading-03 text-text-primary">{topLabel}</span>
          </div>
          <div
            className="flex w-full cursor-pointer items-center justify-center"
            style={previewStyle}
            role="button"
            tabIndex={0}
            aria-label="Swap upper and lower scans (upper preview)"
            onClick={() => setPreviewsSwapped((s) => !s)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setPreviewsSwapped((s) => !s);
              }
            }}
          >
            <img
              key={topImg}
              src={topImg}
              alt=""
              className="pointer-events-none h-full w-full max-h-full rotate-180 object-contain object-center"
              draggable={false}
            />
          </div>
        </div>

        {/* Swap: side-by-side arrows (Figma 4291:158476) — z-50 so the lower card does not paint on top and block clicks */}
        <div className="relative z-50 flex justify-center" style={{ marginTop: -14, marginBottom: -14 }}>
          <button
            type="button"
            className={`flex shrink-0 cursor-pointer flex-row items-center justify-center rounded-lg shadow-[0px_2px_12px_rgba(0,0,0,0.13)] ${BTN_BASE}`}
            style={{ width: SWAP_BTN_SIZE, height: SWAP_BTN_SIZE, gap: 0 }}
            aria-label="Swap upper and lower"
            onClick={() => setPreviewsSwapped((s) => !s)}
          >
            <SvgArrowUp size={ARROW_INNER} />
            <span className="inline-flex shrink-0" style={{ marginLeft: -16 }}>
              <SvgArrowDown size={ARROW_INNER} />
            </span>
          </button>
        </div>

        {/* Bottom scan card */}
        <div className="flex flex-col" style={cardStyle}>
          <div style={{ padding: `${CARD_PADDING}px ${CARD_PADDING}px 8px` }}>
            <span className="tp-heading-03 text-text-primary">{bottomLabel}</span>
          </div>
          <div
            className="flex w-full cursor-pointer items-center justify-center"
            style={previewStyle}
            role="button"
            tabIndex={0}
            aria-label="Swap upper and lower scans (lower preview)"
            onClick={() => setPreviewsSwapped((s) => !s)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setPreviewsSwapped((s) => !s);
              }
            }}
          >
            <img
              key={bottomImg}
              src={bottomImg}
              alt=""
              className="pointer-events-none h-full w-full max-h-full rotate-180 object-contain object-center"
              draggable={false}
            />
          </div>
        </div>

        <div className="flex items-center justify-center gap-2" style={{ marginTop: 24 }}>
          <button
            type="button"
            className={`flex cursor-pointer items-center justify-center rounded-lg ${BTN_BASE}`}
            style={{ width: CANCEL_BTN_SIZE, height: CANCEL_BTN_SIZE }}
            onClick={onClose}
            aria-label="Cancel"
          >
            <SvgIconClose size={32} />
          </button>
          <button
            type="button"
            className={`flex cursor-pointer items-center justify-center rounded-lg ${BTN_BASE}`}
            style={{ width: CANCEL_BTN_SIZE, height: CANCEL_BTN_SIZE }}
            onClick={() => {
              onConfirm?.();
              onClose();
            }}
            aria-label="Confirm"
          >
            <SvgCheckmarkFilled size={32} />
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(node, document.body);
}
