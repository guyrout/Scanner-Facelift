/**
 * Sleeve confirmation — Figma 4357:72798 (Modal window) + 4635:198362 (443px art band).
 * Modal width 784px; inner column 736px (px-6 sides); 702px art centered; chevron = centered art + 515.
 * Depth-01 shadow, pt-8 px-6 pb-6, gap-24 to buttons, gap-2 in headline.
 */

import { useEffect, type CSSProperties } from "react";
import { createPortal } from "react-dom";

const ILLUSTRATION = "/sleeve-confirmation/illustration.png";
const WAND_HINT = "/sleeve-confirmation/wand-ok-hint.svg";

const DEPTH_01_SHADOW = "0px 2px 12px 0px rgba(0, 0, 0, 0.13)";

/** Figma frame width; caps width on large viewports. */
const MODAL_MAX_W = 784;
const ART_W = 702;
/** Figma 4358:73109 — 515px from the left of the 702px art; headline can be wider (art centered). */
const HINT_L = 515;
const HINT_TOP = 210.5;
const HINT_W = 90;
const HINT_H = 34;

export interface SleeveConfirmationModal26AProps {
  open: boolean;
  onConfirm: () => void;
  onRequestClose: () => void;
}

export default function SleeveConfirmationModal26A({
  open,
  onConfirm,
  onRequestClose,
}: SleeveConfirmationModal26AProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onRequestClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onRequestClose]);

  if (!open || typeof document === "undefined") return null;

  const cardStyle: CSSProperties = {
    width: "100%",
    maxHeight: "min(900px, calc(100vh - 48px))",
    boxSizing: "border-box",
    overflow: "auto",
    borderRadius: 16,
    backgroundColor: "var(--color-background-layer-01)",
    boxShadow: DEPTH_01_SHADOW,
    paddingTop: 8,
    paddingLeft: 24,
    paddingRight: 24,
    paddingBottom: 24,
  };

  const hintInHeadline: CSSProperties = {
    position: "absolute",
    left: `max(0px, calc((100% - ${ART_W}px) / 2 + ${HINT_L}px))`,
    top: HINT_TOP,
    width: HINT_W,
    height: HINT_H,
  };

  const node = (
    <div
      className="pointer-events-none fixed inset-0 z-[10050] flex items-center justify-center scan-flow"
      style={{ padding: 24 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sleeve-confirm-title"
    >
      <div
        className="pointer-events-auto relative z-10 w-full min-w-0 shrink-0"
        style={{ maxWidth: `min(${MODAL_MAX_W}px, calc(100vw - 48px))` }}
      >
        <div
          className="flex w-full min-w-0 flex-col items-end gap-6 animate-modal-content-enter"
          style={cardStyle}
          data-node-id="4357:72798"
        >
          <div
            className="flex w-full min-w-0 shrink-0 flex-col items-start"
            data-node-id="4357:72799"
          >
            <div
              className="relative flex w-full min-w-0 flex-col items-center gap-2"
              data-node-id="4357:72800"
            >
              <div
                className="flex h-[60px] w-full min-w-0 shrink-0 items-center gap-4"
                data-node-id="4357:72801"
              >
                <h2
                  id="sleeve-confirm-title"
                  className="tp-heading-03 max-h-12 min-w-px flex-1 overflow-hidden text-ellipsis text-left text-text-primary"
                  data-node-id="4357:72802"
                >
                  Sleeve Confirmation
                </h2>
              </div>

              <div
                className="flex h-[443px] w-full min-w-0 shrink-0 items-center justify-center"
                data-node-id="4635:198362"
              >
                <div
                  className="relative h-[539px] w-[min(702px,100%)] max-w-full shrink-0"
                  data-node-id="4357:72737"
                >
                  <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <img
                      src={ILLUSTRATION}
                      alt=""
                      className="absolute top-0 h-full max-w-none w-[112.85%] max-h-none -left-[6.66%]"
                      draggable={false}
                    />
                  </div>
                </div>
              </div>

              <p
                className="tp-body-02 relative w-[min-content] min-w-full shrink-0 self-start text-left text-text-secondary"
                data-node-id="4357:72811"
              >
                Press either wand button or tap OK to confirm a new sleeve is attached to the wand.
              </p>

              <div
                className="pointer-events-none absolute z-10 h-[34px] w-[90px]"
                style={hintInHeadline}
                data-node-id="4358:73109"
                aria-hidden
              >
                <div
                  className="absolute top-0 bottom-0 left-0 -right-[10.56%]"
                >
                  <img
                    src={WAND_HINT}
                    alt=""
                    className="block size-full max-w-none"
                    style={{ objectFit: "fill" }}
                    draggable={false}
                  />
                </div>
              </div>
            </div>
          </div>

          <div
            className="flex w-full shrink-0 content-stretch items-start justify-end gap-2"
            data-node-id="4357:72812"
          >
            <button
              type="button"
              className="tp-body-02 box-border flex h-[60px] min-w-[100px] w-[120px] shrink-0 cursor-pointer items-center justify-center border-2 border-solid border-[var(--color-border-subtle)] bg-[var(--color-background-layer-01)] px-4 py-3 text-text-primary transition-ui focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 hover:bg-[var(--color-background-layer-02)]"
              style={{ borderRadius: 8, padding: "12px 16px" }}
              onClick={onConfirm}
              data-node-id="4357:72814"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(node, document.body);
}
