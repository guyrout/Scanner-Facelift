/**
 * Screenshot capture feedback — Figma 4370:180228 / 5413:179322 (thumbnail) + 4370:180399 / 4370:180567 (upload message).
 * Full-screen capture shrinks to the bottom-left thumbnail, then shows an upload notice.
 */

import { useEffect, useLayoutEffect, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { SnapshotEditIcon } from "./Icons";

/** Figma 4370:180228 reference frame — thumbnail 5413:179322 is 400×232 at 1920px wide */
const FIGMA_FRAME_W = 1920;
const FIGMA_THUMB_OUTER_W = 400;
const FIGMA_THUMB_OUTER_H = 232;
const FIGMA_EDIT_ICON = 32;
const THUMB_INSET_LEFT = 16;
const THUMB_INSET_BOTTOM = 20;
const MESSAGE_INSET_LEFT = 16;
const MESSAGE_INSET_BOTTOM = 16;
const MESSAGE_DELAY_MS = 10_000;
const MESSAGE_VISIBLE_MS = 10_000;
const UPLOAD_MESSAGE = "Screenshots will be uploaded to Myltero.";

export type ScreenshotPhase = "flash" | "animating" | "thumbnail" | "message";

export interface ScreenshotSnapshotOverlayProps {
  imageUrl: string;
  phase: ScreenshotPhase;
  onPhaseChange: (phase: ScreenshotPhase) => void;
  onDismiss: () => void;
  anchorRef: RefObject<HTMLElement | null>;
}

interface ThumbMetrics {
  scale: number;
  outerW: number;
  outerH: number;
  editIcon: number;
  padding: number;
  borderRadius: number;
  innerRadius: number;
}

interface AnchorLayout {
  thumbnailLeft: number;
  thumbnailTop: number;
  messageLeft: number;
  messageBottom: number;
  viewportWidth: number;
  viewportHeight: number;
  thumb: ThumbMetrics;
}

function getThumbMetrics(anchorWidth: number): ThumbMetrics {
  const scale = anchorWidth / FIGMA_FRAME_W;
  return {
    scale,
    outerW: FIGMA_THUMB_OUTER_W * scale,
    outerH: FIGMA_THUMB_OUTER_H * scale,
    editIcon: FIGMA_EDIT_ICON * scale,
    padding: 8 * scale,
    borderRadius: 8 * scale,
    innerRadius: 4 * scale,
  };
}

function measureAnchor(anchor: HTMLElement | null): AnchorLayout {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const anchorWidth = anchor?.getBoundingClientRect().width ?? viewportWidth;
  const thumb = getThumbMetrics(anchorWidth);

  if (!anchor) {
    return {
      thumbnailLeft: THUMB_INSET_LEFT * thumb.scale,
      thumbnailTop: viewportHeight - THUMB_INSET_BOTTOM * thumb.scale - thumb.outerH,
      messageLeft: MESSAGE_INSET_LEFT * thumb.scale,
      messageBottom: MESSAGE_INSET_BOTTOM,
      viewportWidth,
      viewportHeight,
      thumb,
    };
  }

  const rect = anchor.getBoundingClientRect();
  return {
    thumbnailLeft: rect.left + THUMB_INSET_LEFT * thumb.scale,
    thumbnailTop: rect.bottom - THUMB_INSET_BOTTOM * thumb.scale - thumb.outerH,
    messageLeft: rect.left + MESSAGE_INSET_LEFT * thumb.scale,
    messageBottom: viewportHeight - rect.bottom + MESSAGE_INSET_BOTTOM,
    viewportWidth,
    viewportHeight,
    thumb,
  };
}

/** Figma 5413:179322 — snapshot tool image */
function SnapshotToolImage({
  imageUrl,
  showEditIcon,
  metrics,
}: {
  imageUrl: string;
  showEditIcon: boolean;
  metrics: ThumbMetrics;
}) {
  return (
    <div
      className="relative box-border flex size-full min-w-0 min-h-0 items-center justify-center bg-[var(--color-background-layer-01)] border border-solid border-border-subtle"
      style={{
        padding: metrics.padding,
        borderRadius: metrics.borderRadius,
        boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.13)",
      }}
      data-name="snapshot tool image"
    >
      <div
        className="relative size-full overflow-hidden border border-solid border-border-subtle"
        style={{ borderRadius: metrics.innerRadius }}
      >
        <img
          src={imageUrl}
          alt="Captured screenshot"
          className="absolute inset-0 size-full object-contain opacity-80 pointer-events-none"
          style={{ borderRadius: metrics.innerRadius }}
          draggable={false}
        />
      </div>
      {showEditIcon && (
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ width: metrics.editIcon, height: metrics.editIcon }}
          aria-hidden
        >
          <SnapshotEditIcon size={metrics.editIcon} />
        </div>
      )}
    </div>
  );
}

/** Figma 4370:180567 — _Tooltip container (single line) */
function ScreenshotUploadMessage() {
  return (
    <div
      className="bg-[var(--color-background-on-color)] rounded-lg w-fit min-w-[44px]"
      style={{
        padding: "var(--spacing-02, 8px)",
        boxShadow: "0px 2px 12px rgba(0, 0, 0, 0.13)",
      }}
      data-name="_Tooltip container"
      role="status"
    >
      <p className="tp-body-01 text-text-primary whitespace-nowrap">{UPLOAD_MESSAGE}</p>
    </div>
  );
}

export default function ScreenshotSnapshotOverlay({
  imageUrl,
  phase,
  onPhaseChange,
  onDismiss,
  anchorRef,
}: ScreenshotSnapshotOverlayProps) {
  const [layout, setLayout] = useState<AnchorLayout>(() => measureAnchor(null));
  const isSettled = phase === "thumbnail";
  const { thumb } = layout;

  useLayoutEffect(() => {
    function update() {
      setLayout(measureAnchor(anchorRef.current));
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [anchorRef, phase]);

  useEffect(() => {
    if (phase !== "flash") return;
    const timer = window.setTimeout(() => onPhaseChange("animating"), 150);
    return () => window.clearTimeout(timer);
  }, [phase, onPhaseChange]);

  useEffect(() => {
    if (phase !== "thumbnail") return;
    const timer = window.setTimeout(() => onPhaseChange("message"), MESSAGE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [phase, onPhaseChange]);

  useEffect(() => {
    if (phase !== "message") return;
    const timer = window.setTimeout(() => onDismiss(), MESSAGE_VISIBLE_MS);
    return () => window.clearTimeout(timer);
  }, [phase, onDismiss]);

  return createPortal(
    <div className="scan-flow pointer-events-none fixed inset-0 z-[10050]" data-screenshot-exclude="">
      <AnimatePresence>
        {phase === "flash" && (
          <motion.div
            key="flash"
            className="fixed inset-0 bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.9, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(phase === "animating" || phase === "thumbnail") && (
          <motion.div
            key="snapshot-fly"
            className="fixed overflow-hidden bg-[var(--color-background-layer-01)] border border-solid border-border-subtle"
            initial={{
              left: 0,
              top: 0,
              width: layout.viewportWidth,
              height: layout.viewportHeight,
              borderRadius: 0,
              boxShadow: "none",
            }}
            animate={{
              left: layout.thumbnailLeft,
              top: layout.thumbnailTop,
              width: thumb.outerW,
              height: thumb.outerH,
              borderRadius: thumb.borderRadius,
              boxShadow: isSettled ? "0px 2px 6px rgba(0, 0, 0, 0.13)" : "none",
            }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
            onAnimationComplete={() => {
              if (phase === "animating") onPhaseChange("thumbnail");
            }}
          >
            {isSettled ? (
              <motion.div
                key="settled"
                className="size-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
              >
                <SnapshotToolImage imageUrl={imageUrl} showEditIcon metrics={thumb} />
              </motion.div>
            ) : (
              <motion.img
                key="fly"
                src={imageUrl}
                alt=""
                className="size-full object-cover pointer-events-none"
                draggable={false}
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === "message" && (
          <motion.div
            key="upload-message"
            className="fixed"
            style={{ left: layout.messageLeft, bottom: layout.messageBottom }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <ScreenshotUploadMessage />
          </motion.div>
        )}
      </AnimatePresence>
    </div>,
    document.body,
  );
}
