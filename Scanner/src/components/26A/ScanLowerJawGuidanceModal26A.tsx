/**
 * Scan Lower Jaw guidance — Figma 4397:220940 (Modal window- Guidance Hints).
 */

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { CloseIcon } from "../Icons";
import { scanGuidanceModalCardBaseStyle } from "./scanGuidanceModalShared26A";

/** Figma GH_full_arch_lower — exported SVG (user asset). */
const STEPS_DIAGRAM = "/scan-guidance/GH_full_arch_lower.svg";
const SALIVA_ICON = "/scan-guidance/saliva-detection.svg";

export const SCAN_LOWER_JAW_GUIDANCE_PERMANENT_KEY = "scanner26a.scanLowerJawGuidance.permanentDismiss";

export function scanLowerJawGuidanceIsPermanentlySkipped(): boolean {
  try {
    return localStorage.getItem(SCAN_LOWER_JAW_GUIDANCE_PERMANENT_KEY) === "1";
  } catch {
    return false;
  }
}

export interface ScanLowerJawGuidanceModal26AProps {
  open: boolean;
  onRequestClose: () => void;
}

export default function ScanLowerJawGuidanceModal26A({ open, onRequestClose }: ScanLowerJawGuidanceModal26AProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDontShowAgain(false);
  }, [open]);

  const handleClose = useCallback(() => {
    if (dontShowAgain) {
      try {
        localStorage.setItem(SCAN_LOWER_JAW_GUIDANCE_PERMANENT_KEY, "1");
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
      data-node-id="4397:220940"
    >
      <div
        className="pointer-events-auto relative z-10 flex w-full min-w-0 flex-col items-stretch animate-modal-content-enter"
        role="dialog"
        aria-modal="false"
        aria-labelledby="scan-lower-jaw-guidance-title"
        data-node-id="I4397:220940;4397:215498"
        style={cardStyle}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex w-full min-w-0 flex-col gap-6" data-node-id="I4397:220940;4397:215499">
          <div className="flex h-[60px] w-full min-w-0 shrink-0 items-center gap-4" data-node-id="I4397:220940;4397:215501">
            <h2
              id="scan-lower-jaw-guidance-title"
              className="tp-heading-03 max-h-12 min-w-px flex-1 overflow-hidden text-ellipsis text-left text-text-primary"
              data-node-id="I4397:220940;4397:215502"
            >
              Scan Lower Jaw
            </h2>
            <button
              type="button"
              aria-label="Close"
              className="flex shrink-0 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent p-2 outline-none transition-ui hover:bg-[var(--color-background-layer-hovered)] focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2"
              onClick={handleClose}
              data-node-id="I4397:220940;4397:215684"
            >
              <CloseIcon size={24} color="var(--color-icon-primary)" className="shrink-0" />
            </button>
          </div>

          <div
            className="w-full min-w-0 overflow-x-auto px-5"
            data-node-id="I4397:220940;4397:215506"
          >
            <img
              src={STEPS_DIAGRAM}
              alt=""
              className="mx-auto block h-auto w-full max-w-[900px] min-w-0"
              draggable={false}
            />
          </div>

          <div
            className="flex w-full min-w-0 shrink-0 items-center"
            data-node-id="I4397:220940;4397:215589"
          >
            <div
              className="flex size-14 shrink-0 items-center justify-center"
              data-node-id="I4397:220940;4397:215564"
              aria-hidden
            >
              <div className="relative size-[54px] shrink-0" data-node-id="I4397:220940;4397:215565">
                <img
                  src={SALIVA_ICON}
                  alt=""
                  className="pointer-events-none block size-full max-w-none object-contain"
                  draggable={false}
                />
              </div>
            </div>
            <ul
              className="tp-body-02 block min-w-0 flex-1 list-outside list-disc ps-0 text-left text-text-secondary marker:text-text-secondary"
              data-node-id="I4397:220940;4397:215505"
            >
              <li className="mb-0 ms-[27px] whitespace-pre-wrap">
                Ensure the teeth are dry prior to scanning.
              </li>
              <li className="ms-[27px] whitespace-pre-wrap pt-2">
                If the system identifies the presence of excessive saliva bubbles, a notification will appear.
              </li>
            </ul>
          </div>

          <div className="flex w-full min-w-0 items-center gap-2" data-node-id="I4397:220940;4397:215507">
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
    </div>
  );

  return createPortal(node, document.body);
}
