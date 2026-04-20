import type { JawSelection } from "./JawSelector26A";
import upperArchActiveSvg from "../../assets/scan/jaw-selector/upper-arch-active.svg";
import upperArchInactiveSvg from "../../assets/scan/jaw-selector/upper-arch-inactive.svg";
import biteActiveSvg from "../../assets/scan/jaw-selector/bite-active.svg";
import biteInactiveSvg from "../../assets/scan/jaw-selector/bite-inactive.svg";
import lowerArchActiveSvg from "../../assets/scan/jaw-selector/lower-arch-active.svg";
import lowerArchInactiveSvg from "../../assets/scan/jaw-selector/lower-arch-inactive.svg";
import toothSprites from "../../assets/procedures/tooth-sprites.svg";
import { SPRITE_H, SPRITE_W, TOOTH_SPRITES } from "./FixedRestorativeForm26A";

interface ToothMap26AProps {
  className?: string;
  selectedJaw: JawSelection;
  onJawChange: (jaw: JawSelection) => void;
  toothSelections?: Record<number, string>;
}

const PANEL_W = 249;
const PANEL_H = 389;
const TOOTH_CHART_W = 1171;
const UPPER_TEETH = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28] as const;
const LOWER_TEETH = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38] as const;
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
  // Teeth are closer to the top around incisors and lower around molars.
  const archCurveY = 24 + normalized * 20;
  // In the lower image, teeth sit in a very similar vertical band.
  return arch === "upper" ? archCurveY : archCurveY;
}

function getSpriteKey(selection: string): "Crown" | "Missing" | "Implant based" {
  if (selection === "Missing") return "Missing";
  if (selection === "Implant based") return "Implant based";
  // The library currently exposes restorative shape variants under Crown.
  return "Crown";
}

function renderToothIndicator(
  tooth: number,
  index: number,
  selection: string,
  arch: "upper" | "lower"
) {
  const markerX = getToothMarkerX(index);
  const markerY = getToothMarkerY(index, arch);
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
          transform: `rotate(${getToothMarkerRotation(index, arch)}deg)`,
          transformOrigin: "center",
          pointerEvents: "none",
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
      }}
    />
  );
}

export default function ToothMap26A({ className, selectedJaw, onJawChange, toothSelections = {} }: ToothMap26AProps) {
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
          style={{
            position: "relative",
            width: "100%",
            height: 186,
            borderRadius: 8,
            border: "none",
            padding: 0,
            background: "unset",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxSizing: "content-box",
            cursor: "pointer",
          }}
        >
          <span
            aria-hidden
            style={{
              width: "100%",
              height: "100%",
              display: "block",
              backgroundImage: `url(${selectedJaw === "upper" ? upperArchActiveSvg : upperArchInactiveSvg})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: "100% 100%",
              backgroundPosition: "center",
              pointerEvents: "none",
            }}
          />
          {UPPER_TEETH.map((tooth, index) => {
            const selection = toothSelections[tooth];
            if (!selection) return null;
            return renderToothIndicator(tooth, index, selection, "upper");
          })}
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
          style={{
            position: "relative",
            width: "100%",
            height: 186,
            borderRadius: 8,
            border: "none",
            padding: 0,
            background: "unset",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxSizing: "content-box",
            cursor: "pointer",
          }}
        >
          <span
            aria-hidden
            style={{
              width: "100%",
              height: "100%",
              display: "block",
              backgroundImage: `url(${selectedJaw === "lower" ? lowerArchActiveSvg : lowerArchInactiveSvg})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: "100% 100%",
              backgroundPosition: "center",
              pointerEvents: "none",
            }}
          />
          {LOWER_TEETH.map((tooth, index) => {
            const selection = toothSelections[tooth];
            if (!selection) return null;
            return renderToothIndicator(tooth, index, selection, "lower");
          })}
        </button>
      </div>
    </div>
  );
}
