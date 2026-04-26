/**
 * Scan Bite guidance — Figma 4397:220820 (Modal window- Guidance Hints).
 * Content: headline + GH_bite + “Don’t show again” only (no saliva row in this frame).
 */

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { CloseIcon } from "../Icons";
import { scanGuidanceModalCardBaseStyle } from "./scanGuidanceModalShared26A";

/** Figma GH_bite — exported SVG (user asset). */
const STEPS_DIAGRAM = "/scan-guidance/GH_bite.svg";

export const SCAN_BITE_GUIDANCE_PERMANENT_KEY = "scanner26a.scanBiteGuidance.permanentDismiss";

export function scanBiteGuidanceIsPermanentlySkipped(): boolean {
  try {
    return localStorage.getItem(SCAN_BITE_GUIDANCE_PERMANENT_KEY) === "1";
  } catch {
    return false;
  }
}

export interface ScanBiteGuidanceModal26AProps {
  open: boolean;
  onRequestClose: () => void;
}

export default function ScanBiteGuidanceModal26A({ open, onRequestClose }: ScanBiteGuidanceModal26AProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDontShowAgain(false);
  }, [open]);

  const handleClose = useCallback(() => {
    if (dontShowAgain) {
      try {
        localStorage.setItem(SCAN_BITE_GUIDANCE_PERMANENT_KEY, "1");
      } catch {
        /* ignore */
      }
    }
    onRequestClose();
  }, [dontShowAgain, onRequestClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, handleClose]);

  if (!open || typeof document === "undefined") return null;

  const cardStyle: CSSProperties = scanGuidanceModalCardBaseStyle();

  const node = (
    <div
      className="pointer-events-none fixed inset-0 z-[10060] flex items-center justify-center scan-flow"
      style={{ padding: 24 }}
      role="presentation"
      data-node-id="4397:220820"
    >
      <div
        className="pointer-events-auto relative z-10 flex w-full min-w-0 flex-col gap-6 animate-modal-content-enter"
        role="dialog"
        aria-modal="false"
        aria-labelledby="scan-bite-guidance-title"
        data-node-id="I4397:220820;4397:215498"
        style={cardStyle}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex w-full min-w-0 flex-col gap-6" data-node-id="I4397:220820;4397:215499">
          <div className="flex h-[60px] w-full min-w-0 shrink-0 items-center gap-4" data-node-id="I4397:220820;4397:215501">
            <h2
              id="scan-bite-guidance-title"
              className="tp-heading-03 max-h-12 min-w-px flex-1 overflow-hidden text-ellipsis text-left text-text-primary"
              data-node-id="I4397:220820;4397:215502"
            >
              Scan Bite
            </h2>
            <button
              type="button"
              aria-label="Close"
              className="flex shrink-0 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent p-2 outline-none transition-ui hover:bg-[var(--color-background-layer-hovered)] focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2"
              onClick={handleClose}
              data-node-id="I4397:220820;4397:215684"
            >
              <CloseIcon size={24} color="var(--color-icon-primary)" className="shrink-0" />
            </button>
          </div>

          <div
            className="flex w-full min-w-0 shrink-0 flex-col items-stretch justify-center overflow-x-auto"
            data-node-id="I4397:220820;4397:215506"
          >
            <img
              src={STEPS_DIAGRAM}
              alt=""
              className="block h-auto w-full min-w-0 max-w-full object-contain"
              draggable={false}
              data-node-id="I4397:220820;4397:215506;4397:216945"
            />
          </div>
        </div>

        <div className="flex w-full min-w-0 shrink-0 items-center gap-2" data-node-id="I4397:220820;4397:215507">
          <label className="flex min-h-[60px] cursor-pointer items-center gap-2 py-2">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="size-6 shrink-0 cursor-pointer rounded border-2 border-border-subtle accent-[var(--color-background-brand)]"
              aria-label="Don't show again"
            />
            <span className="tp-body-02 text-text-primary select-none">Don&apos;t show again</span>
          </label>
        </div>
      </div>
    </div>
  );

  return createPortal(node, document.body);
}
