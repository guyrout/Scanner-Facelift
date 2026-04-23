import { useState, useEffect, useLayoutEffect, useMemo, useRef, type CSSProperties } from "react";
import type { JawSelection } from "./JawSelector26A";
import upperArchActiveLayeredSvg from "../../assets/scan/jaw-selector/upper-arch-active-layered.svg?raw";
import upperArchInactiveSvg from "../../assets/scan/jaw-selector/upper-arch-inactive.svg";
import biteActiveSvg from "../../assets/scan/jaw-selector/bite-active.svg";
import biteInactiveSvg from "../../assets/scan/jaw-selector/bite-inactive.svg";
import lowerArchActiveLayeredSvg from "../../assets/scan/jaw-selector/lower-arch-active-layered.svg?raw";
import lowerArchInactiveSvg from "../../assets/scan/jaw-selector/lower-arch-inactive.svg";
import toothSprites from "../../assets/procedures/tooth-sprites.svg";
import { SPRITE_H, SPRITE_W, TOOTH_SPRITES } from "./FixedRestorativeForm26A";
import {
  fdiToFigmaTooth,
  getRegularRestoredSvgByFigmaTooth,
  isRegularRestoredSelection,
  type RegularRestoredVisualState,
} from "./toothMapRegularRestoredAssets";
import { getMissingSvgByFigmaTooth } from "./toothMapMissingAssets";

interface ToothMap26AProps {
  className?: string;
  selectedJaw: JawSelection;
  onJawChange: (jaw: JawSelection) => void;
  toothSelections?: Record<number, string>;
}

const PANEL_W = 249;
const PANEL_H = 389;
/** Design chart width — same basis as `TOOTH_X` (jaw art stretched to PANEL_W in the UI). */
const TOOTH_CHART_W = 1171;
const UPPER_TEETH = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28] as const;
const LOWER_TEETH = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38] as const;
/** Occlusal chart: horizontal anchor per slot (index 0 = FDI 18 … index 15 = FDI 28), design units. */
const TOOTH_X = [32, 106, 182, 256, 329, 403, 477, 550, 618, 692, 766, 840, 914, 988, 1062, 1136] as const;

const RESTORATION_COLORS: Record<string, string> = {
  Crown: "#9F00A7",
  Bridge: "#5FD4C4",
  Veneer: "#F5C563",
  Inlay: "#F9A8D4",
  Onlay: "#AB8ED9",
  Eggshell: "#6B8BF5",
  Mockup: "#7C3AED",
  Missing: "#D4D4D8",
  "Implant based": "#EF4444",
};
const DEFAULT_SELECTION_COLOR = "var(--color-border-interactive)";
const MARKER_SIZE = 8;
const TOOTH_SLOT_H = 28;
const TOOTH_SLOT_MIN_W = 14;
const TOOTH_SLOT_MAX_W = 20;
const TOOTH_MASK_PADDING = 2;
const TOOTH_MASK_FILL = "#FFF9F9";

/**
 * `lower-arch-active-layered.svg` draws a single pink interior path under the per-tooth `<g>`s.
 * When we `visibility:hidden` a tooth group for Missing, that base path still shows in the slot;
 * the overlay box uses this to mask it (same fill as the SVG’s interior).
 */
const LOWER_ARCH_INTERIOR_MASK = "#FFF0F3";

/** Inline SVG markup (per-tooth `<g id="upper-arch-tooth-{FDI}">`) for devtools / future styling. */
const UPPER_ARCH_ACTIVE_LAYERED_HTML = upperArchActiveLayeredSvg.replace(/^\s*<\?xml[^>]*>\s*/i, "");
/** Same pattern as upper: exposes `<g id="lower-arch-tooth-{FDI}">` for lower slot measurement. */
const LOWER_ARCH_ACTIVE_LAYERED_HTML = lowerArchActiveLayeredSvg.replace(/^\s*<\?xml[^>]*>\s*/i, "");

/** Per-tooth jaw art overlay (regular restored or Missing) when an asset exists for that FDI. */
function archOverlayHref(
  selection: string,
  fdi: number,
  visual: RegularRestoredVisualState,
): string | undefined {
  const figmaToothN = fdiToFigmaTooth(fdi);
  if (figmaToothN == null) return undefined;
  if (selection === "Missing") return getMissingSvgByFigmaTooth(figmaToothN, visual);
  if (isRegularRestoredSelection(selection)) return getRegularRestoredSvgByFigmaTooth(figmaToothN, visual);
  return undefined;
}

function hasArchSlotOverlayAsset(selection: string | undefined, fdi: number): boolean {
  if (!selection) return false;
  if (fdiToFigmaTooth(fdi) == null) return false;
  /** Missing always uses slot replacement (per-tooth SVG or sprite inside the arch slot). */
  if (selection === "Missing") return true;
  return Boolean(archOverlayHref(selection, fdi, "active"));
}

/**
 * When a tooth uses a per-tooth SVG overlay (regular restored or Missing), hide the matching `<g>`
 * in the layered arch so the asset replaces the default arch art.
 * Uses `visibility:hidden` (not `display:none`) so `getBoundingClientRect()` still matches the
 * arch slot for overlay placement.
 */
function buildUpperArchActiveHtmlWithReplacedTeeth(toothSelections: Record<number, string>): string {
  let html = UPPER_ARCH_ACTIVE_LAYERED_HTML;
  UPPER_TEETH.forEach((fdi) => {
    const selection = toothSelections[fdi];
    if (!hasArchSlotOverlayAsset(selection, fdi)) return;
    html = html.replace(
      new RegExp(`<g\\s+id="upper-arch-tooth-${fdi}"`, "g"),
      `<g id="upper-arch-tooth-${fdi}" style="visibility:hidden;pointer-events:none"`,
    );
  });
  return html;
}

function buildLowerArchActiveHtmlWithReplacedTeeth(toothSelections: Record<number, string>): string {
  let html = LOWER_ARCH_ACTIVE_LAYERED_HTML;
  LOWER_TEETH.forEach((fdi) => {
    const selection = toothSelections[fdi];
    if (!hasArchSlotOverlayAsset(selection, fdi)) return;
    html = html.replace(
      new RegExp(`<g\\s+id="lower-arch-tooth-${fdi}"`, "g"),
      `<g id="lower-arch-tooth-${fdi}" style="visibility:hidden;pointer-events:none"`,
    );
  });
  return html;
}

type ArchSlotRect = { left: number; top: number; width: number; height: number };

function getToothMarkerX(index: number) {
  return (TOOTH_X[index] / TOOTH_CHART_W) * PANEL_W;
}

function getToothMarkerRotation(index: number, arch: "upper" | "lower") {
  const centerIndex = (TOOTH_X.length - 1) / 2;
  const normalized = (index - centerIndex) / centerIndex;
  const angle = normalized * 52;
  return arch === "upper" ? angle : -angle;
}

function getToothMarkerY(index: number, arch: "upper" | "lower") {
  const centerIndex = (TOOTH_X.length - 1) / 2;
  const normalized = Math.abs((index - centerIndex) / centerIndex);
  const archCurveY = 24 + normalized * 20;
  return arch === "upper" ? archCurveY : archCurveY;
}

function getSpriteKey(selection: string): "Crown" | "Missing" | "Implant based" {
  if (selection === "Missing") return "Missing";
  if (selection === "Implant based") return "Implant based";
  return "Crown";
}

export default function ToothMap26A({ className, selectedJaw, onJawChange, toothSelections = {} }: ToothMap26AProps) {
  const [hoveredFdi, setHoveredFdi] = useState<number | null>(null);
  const [pressedFdi, setPressedFdi] = useState<number | null>(null);
  const [upperSlotRectsByFdi, setUpperSlotRectsByFdi] = useState<Record<number, ArchSlotRect>>({});
  const [lowerSlotRectsByFdi, setLowerSlotRectsByFdi] = useState<Record<number, ArchSlotRect>>({});
  /** Arch stacking context: inline SVG + overlays share this box for measured slot alignment. */
  const upperArchLayerRef = useRef<HTMLDivElement>(null);
  const lowerArchLayerRef = useRef<HTMLDivElement>(null);

  const upperArchActiveHtml = useMemo(
    () => buildUpperArchActiveHtmlWithReplacedTeeth(toothSelections),
    [toothSelections],
  );
  const lowerArchActiveHtml = useMemo(
    () => buildLowerArchActiveHtmlWithReplacedTeeth(toothSelections),
    [toothSelections],
  );

  useLayoutEffect(() => {
    const layer = upperArchLayerRef.current;
    if (!layer) {
      setUpperSlotRectsByFdi({});
      return;
    }
    const layerEl = layer;

    function measureUpperSlots() {
      const layerRect = layerEl.getBoundingClientRect();
      const measuredByFdi: Record<number, ArchSlotRect> = {};
      const targetFdis = new Set<number>();
      UPPER_TEETH.forEach((fdi) => {
        const selection = toothSelections[fdi];
        if (!hasArchSlotOverlayAsset(selection, fdi)) return;
        targetFdis.add(fdi);
        const g = layerEl.querySelector(`#upper-arch-tooth-${fdi}`);
        if (!g) return;
        const gr = g.getBoundingClientRect();
        if (gr.width < 0.5 || gr.height < 0.5) return;
        measuredByFdi[fdi] = {
          left: gr.left - layerRect.left,
          top: gr.top - layerRect.top,
          width: gr.width,
          height: gr.height,
        };
      });
      // Preserve prior coordinates when a tooth rect is temporarily unreadable during repaints.
      setUpperSlotRectsByFdi((prev) => {
        const next: Record<number, ArchSlotRect> = {};
        targetFdis.forEach((fdi) => {
          const measured = measuredByFdi[fdi];
          const existing = prev[fdi];
          if (measured) {
            next[fdi] = measured;
          } else if (existing) {
            next[fdi] = existing;
          }
        });
        return next;
      });
    }

    measureUpperSlots();
    let cancelled = false;
    const raf1 = requestAnimationFrame(() => {
      if (cancelled) return;
      requestAnimationFrame(() => {
        if (cancelled) return;
        measureUpperSlots();
      });
    });
    const ro = new ResizeObserver(measureUpperSlots);
    ro.observe(layerEl);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf1);
      ro.disconnect();
    };
  }, [upperArchActiveHtml, toothSelections]);

  useLayoutEffect(() => {
    const layer = lowerArchLayerRef.current;
    if (!layer) {
      setLowerSlotRectsByFdi({});
      return;
    }
    const layerEl = layer;

    function measureLowerSlots() {
      const layerRect = layerEl.getBoundingClientRect();
      const measuredByFdi: Record<number, ArchSlotRect> = {};
      const targetFdis = new Set<number>();
      LOWER_TEETH.forEach((fdi) => {
        const selection = toothSelections[fdi];
        if (!hasArchSlotOverlayAsset(selection, fdi)) return;
        targetFdis.add(fdi);
        const g = layerEl.querySelector(`#lower-arch-tooth-${fdi}`);
        if (!g) return;
        const gr = g.getBoundingClientRect();
        if (gr.width < 0.5 || gr.height < 0.5) return;
        measuredByFdi[fdi] = {
          left: gr.left - layerRect.left,
          top: gr.top - layerRect.top,
          width: gr.width,
          height: gr.height,
        };
      });
      setLowerSlotRectsByFdi((prev) => {
        const next: Record<number, ArchSlotRect> = {};
        targetFdis.forEach((fdi) => {
          const measured = measuredByFdi[fdi];
          const existing = prev[fdi];
          if (measured) {
            next[fdi] = measured;
          } else if (existing) {
            next[fdi] = existing;
          }
        });
        return next;
      });
    }

    measureLowerSlots();
    let cancelled = false;
    const raf1 = requestAnimationFrame(() => {
      if (cancelled) return;
      requestAnimationFrame(() => {
        if (cancelled) return;
        measureLowerSlots();
      });
    });
    const ro = new ResizeObserver(measureLowerSlots);
    ro.observe(layerEl);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf1);
      ro.disconnect();
    };
  }, [lowerArchActiveHtml, toothSelections]);

  useEffect(() => {
    if (pressedFdi == null) return;
    const clear = () => setPressedFdi(null);
    window.addEventListener("mouseup", clear);
    window.addEventListener("touchend", clear);
    return () => {
      window.removeEventListener("mouseup", clear);
      window.removeEventListener("touchend", clear);
    };
  }, [pressedFdi]);

  function visualFor(fdi: number): RegularRestoredVisualState {
    if (pressedFdi === fdi) return "pressed";
    if (hoveredFdi === fdi) return "hovered";
    return "active";
  }

  const archButtonStyle = (placement: "top" | "bottom"): CSSProperties => ({
    position: "absolute",
    ...(placement === "top" ? { top: 0 } : { bottom: 0 }),
    left: 0,
    width: "100%",
    height: 186,
    borderRadius: 8,
    border: "none",
    padding: 0,
    background: "unset",
    display: "block",
    boxSizing: "content-box",
    cursor: "pointer",
  });

  function renderToothIndicator(tooth: number, index: number, selection: string, arch: "upper" | "lower") {
    const markerX = Math.round(getToothMarkerX(index));
    const markerY = Math.round(getToothMarkerY(index, arch));
    const rotation = getToothMarkerRotation(index, arch);

    const overlayHref = archOverlayHref(selection, tooth, visualFor(tooth));
    const missingSpriteRect =
      selection === "Missing" && !overlayHref ? TOOTH_SPRITES[tooth]?.Missing : undefined;

    if (overlayHref || missingSpriteRect) {
      const slot =
        arch === "upper" ? upperSlotRectsByFdi[tooth] : lowerSlotRectsByFdi[tooth];
      const useSlot = slot != null && slot.width > 0 && slot.height > 0;
      /** Keep per-tooth overlay assets in a controlled box while slot rects are unavailable. */
      const fallbackBox = !useSlot ? Math.max(TOOTH_SLOT_MAX_W, 28) * 1.35 : null;
      const lowerMissingMask =
        arch === "lower" && selection === "Missing"
          ? { backgroundColor: LOWER_ARCH_INTERIOR_MASK }
          : {};
      return (
        <span
          key={tooth}
          role="presentation"
          className="select-none"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onMouseEnter={() => setHoveredFdi(tooth)}
          onMouseLeave={() => {
            setHoveredFdi((h) => (h === tooth ? null : h));
          }}
          onMouseDown={() => setPressedFdi(tooth)}
          style={
            useSlot
              ? {
                  position: "absolute",
                  left: slot.left,
                  top: slot.top,
                  width: slot.width,
                  height: slot.height,
                  zIndex: 5 + index,
                  pointerEvents: "auto",
                  cursor: "default",
                  boxSizing: "border-box",
                  overflow: "hidden",
                  ...lowerMissingMask,
                }
              : fallbackBox != null
                ? {
                    position: "absolute",
                    left: markerX,
                    top: markerY,
                    zIndex: 5 + index,
                    width: fallbackBox,
                    height: fallbackBox,
                    transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                    transformOrigin: "center center",
                    pointerEvents: "auto",
                    cursor: "default",
                    boxSizing: "border-box",
                    ...lowerMissingMask,
                  }
                : {
                    position: "absolute",
                    left: markerX,
                    top: markerY,
                    zIndex: 5 + index,
                    transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                    transformOrigin: "center center",
                    pointerEvents: "auto",
                    cursor: "default",
                    ...lowerMissingMask,
                  }
          }
        >
          {overlayHref ? (
            <img
              src={overlayHref}
              alt=""
              draggable={false}
              className={
                useSlot || fallbackBox != null
                  ? `block h-full w-full max-h-none max-w-none ${useSlot ? "object-fill" : "object-contain"}`
                  : "block h-fit w-fit max-h-none max-w-none shrink-0 object-contain"
            }
            />
          ) : missingSpriteRect ? (
            <svg
              viewBox={`${missingSpriteRect[0]} ${missingSpriteRect[1]} ${missingSpriteRect[2]} ${missingSpriteRect[3]}`}
              width="100%"
              height="100%"
              preserveAspectRatio="xMidYMid meet"
              className={`block max-h-none max-w-none ${useSlot || fallbackBox != null ? "h-full w-full" : "h-fit w-fit shrink-0"} object-contain`}
              aria-hidden
            >
              <image href={toothSprites} width={SPRITE_W} height={SPRITE_H} />
            </svg>
          ) : null}
        </span>
      );
    }

    const spriteKey = getSpriteKey(selection);
    const spriteRect = TOOTH_SPRITES[tooth]?.[spriteKey];
    if (spriteRect) {
      const [, , spriteW, spriteH] = spriteRect;
      const widthByAspect = (spriteW / spriteH) * TOOTH_SLOT_H;
      const slotW = Math.max(TOOTH_SLOT_MIN_W, Math.min(TOOTH_SLOT_MAX_W, widthByAspect));
      return (
        <span
          key={tooth}
          aria-hidden
          style={{
            position: "absolute",
            left: markerX - slotW / 2,
            top: markerY - TOOTH_SLOT_H / 2,
            width: slotW,
            height: TOOTH_SLOT_H,
            transform: `rotate(${rotation}deg)`,
            transformOrigin: "center",
            pointerEvents: "none",
            zIndex: 3,
          }}
        >
          <span
            style={{
              position: "absolute",
              left: -TOOTH_MASK_PADDING,
              top: -TOOTH_MASK_PADDING,
              width: slotW + TOOTH_MASK_PADDING * 2,
              height: TOOTH_SLOT_H + TOOTH_MASK_PADDING * 2,
              borderRadius: "999px",
              backgroundColor: TOOTH_MASK_FILL,
            }}
          />
          <svg
            viewBox={`${spriteRect[0]} ${spriteRect[1]} ${spriteRect[2]} ${spriteRect[3]}`}
            width={slotW}
            height={TOOTH_SLOT_H}
            style={{ position: "relative", display: "block", overflow: "hidden" }}
          >
            <image href={toothSprites} width={SPRITE_W} height={SPRITE_H} />
          </svg>
        </span>
      );
    }

    const markerColor = RESTORATION_COLORS[selection] ?? DEFAULT_SELECTION_COLOR;
    return (
      <span
        key={tooth}
        aria-hidden
        style={{
          position: "absolute",
          left: markerX - MARKER_SIZE / 2,
          top: markerY - MARKER_SIZE / 2,
          width: MARKER_SIZE,
          height: MARKER_SIZE,
          borderRadius: "50%",
          backgroundColor: markerColor,
          border: "1px solid var(--color-border-strong)",
          boxShadow: "0 0 0 1px var(--color-background-layer-01)",
          pointerEvents: "none",
          zIndex: 3,
        }}
      />
    );
  }

  return (
    <div
      className={className ?? ""}
      style={{
        width: PANEL_W,
        height: PANEL_H,
        borderRadius: 8,
        background: "unset",
        paddingLeft: 0,
        paddingRight: 0,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
      }}
      role="group"
      aria-label="Jaw selection"
    >
      <div className="relative h-full w-full">
        <button
          type="button"
          aria-label="Upper arch"
          aria-pressed={selectedJaw === "upper"}
          onClick={() => onJawChange("upper")}
          className="absolute top-0 z-[1] outline-none transition-ui focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]"
          style={archButtonStyle("top")}
        >
          <div ref={upperArchLayerRef} className="relative h-full w-full">
            <span
              aria-hidden
              className="pointer-events-none absolute left-0 top-0 z-0 block h-full w-full [&>svg]:block [&>svg]:h-full [&>svg]:w-full"
              style={{ opacity: selectedJaw === "upper" ? 1 : 0 }}
              // eslint-disable-next-line react/no-danger -- static layered asset; exposes per-tooth <g> in DOM
              dangerouslySetInnerHTML={{ __html: upperArchActiveHtml }}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute left-0 top-0 z-[1] block h-full w-full"
              style={{
                opacity: selectedJaw === "upper" ? 0 : 1,
                backgroundImage: `url(${upperArchInactiveSvg})`,
                backgroundRepeat: "no-repeat",
                backgroundSize: "100% 100%",
                backgroundPosition: "center",
              }}
            />
            {UPPER_TEETH.map((tooth, index) => {
              const selection = toothSelections[tooth];
              if (!selection) return null;
              return renderToothIndicator(tooth, index, selection, "upper");
            })}
          </div>
        </button>
        <button
          type="button"
          aria-label="Bite registration"
          aria-pressed={selectedJaw === "bite"}
          onClick={() => onJawChange("bite")}
          className="absolute z-[2] outline-none transition-ui focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]"
          style={{
            left: 95,
            top: 150,
            width: 65,
            height: 70,
            borderRadius: 18,
            border: "none",
            padding: 0,
            background: "unset",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxSizing: "content-box",
            cursor: "pointer",
            overflow: "hidden",
          }}
        >
          <span
            aria-hidden
            style={{
              width: "100%",
              height: "100%",
              display: "block",
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              backgroundImage: `url(${selectedJaw === "bite" ? biteActiveSvg : biteInactiveSvg})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: "100% 100%",
              backgroundPosition: "center",
              pointerEvents: "none",
            }}
          />
        </button>
        <button
          type="button"
          aria-label="Lower arch"
          aria-pressed={selectedJaw === "lower"}
          onClick={() => onJawChange("lower")}
          className="absolute bottom-0 z-[1] outline-none transition-ui focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]"
          style={archButtonStyle("bottom")}
        >
          <div ref={lowerArchLayerRef} className="relative h-full w-full">
            <span
              aria-hidden
              className="pointer-events-none absolute left-0 top-0 z-0 block h-full w-full [&>svg]:block [&>svg]:h-full [&>svg]:w-full"
              style={{ opacity: selectedJaw === "lower" ? 1 : 0 }}
              // eslint-disable-next-line react/no-danger -- static layered asset; exposes per-tooth <g> in DOM
              dangerouslySetInnerHTML={{ __html: lowerArchActiveHtml }}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute left-0 top-0 z-[1] block h-full w-full"
              style={{
                opacity: selectedJaw === "lower" ? 0 : 1,
                backgroundImage: `url(${lowerArchInactiveSvg})`,
                backgroundRepeat: "no-repeat",
                backgroundSize: "100% 100%",
                backgroundPosition: "center",
              }}
            />
            {LOWER_TEETH.map((tooth, index) => {
              const selection = toothSelections[tooth];
              if (!selection) return null;
              return renderToothIndicator(tooth, index, selection, "lower");
            })}
          </div>
        </button>
      </div>
    </div>
  );
}
