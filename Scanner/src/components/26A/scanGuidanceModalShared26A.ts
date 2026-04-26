/**
 * Shared layout for Scan*GuidanceModal26A — Figma modal frame ~1104px wide.
 */

import type { CSSProperties } from "react";

export const SCAN_GUIDANCE_MODAL_OUTER_WIDTH = "min(1104px, calc(100vw - 48px))";

export const SCAN_GUIDANCE_MODAL_DEPTH_01_SHADOW = "0px 2px 12px 0px rgba(0, 0, 0, 0.13)";

export function scanGuidanceModalCardBaseStyle(): CSSProperties {
  return {
    width: SCAN_GUIDANCE_MODAL_OUTER_WIDTH,
    maxWidth: SCAN_GUIDANCE_MODAL_OUTER_WIDTH,
    maxHeight: "min(900px, calc(100vh - 48px))",
    boxSizing: "border-box",
    overflow: "auto",
    borderRadius: 16,
    backgroundColor: "var(--color-background-layer-01)",
    boxShadow: SCAN_GUIDANCE_MODAL_DEPTH_01_SHADOW,
    paddingTop: 8,
    paddingLeft: 24,
    paddingRight: 24,
    paddingBottom: 24,
  };
}
