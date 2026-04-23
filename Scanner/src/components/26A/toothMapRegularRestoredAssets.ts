/**
 * "Regular to be Restored" per-tooth SVGs (Figma export) — Active / Hovered / Pressed.
 * Files live under `src/assets/scan/tooth-map-regular-restored/`.
 *
 * Figma `Tooth=1…32` follows upper in visual slot order, but lower is exported in the opposite
 * direction compared with `LOWER_TEETH` in this widget.
 * Map:
 *   • teeth 1–16  = upper arch, in `UPPER_TEETH` order (index 0 → Tooth 1)
 *   • teeth 17–32 = lower arch, reversed against `LOWER_TEETH` (index 0 → Tooth 32)
 * So e.g. FDI 48 (first lower slot) maps to Figma "Tooth 32", and FDI 38 maps to Tooth 17.
 */

export type RegularRestoredVisualState = "active" | "hovered" | "pressed";

const UPPER_FDI_ORDER = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28] as const;
const LOWER_FDI_ORDER = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38] as const;

const modules = import.meta.glob<string>("../../assets/scan/tooth-map-regular-restored/tooth-*.svg", {
  eager: true,
  query: "?url",
  import: "default",
});

type Triple = { active: string; hovered: string; pressed: string };
const byChartPosition: Record<number, Triple> = {};

for (const [path, url] of Object.entries(modules)) {
  const m = path.match(/tooth-(\d+)-(active|hovered|pressed)\.svg$/);
  if (!m) continue;
  const pos = Number(m[1]);
  const st = m[2] as RegularRestoredVisualState;
  if (!byChartPosition[pos]) {
    byChartPosition[pos] = { active: url, hovered: url, pressed: url };
  }
  byChartPosition[pos][st] = url;
}

/**
 * Canonical FDI -> Figma tooth number mapping used by restored overlays.
 * Upper maps left-to-right as Tooth 1..16.
 * Lower uses mirrored export order: 48..38 -> Tooth 32..17.
 */
const FDI_TO_FIGMA_TOOTH: Record<number, number> = {
  18: 1,
  17: 2,
  16: 3,
  15: 4,
  14: 5,
  13: 6,
  12: 7,
  11: 8,
  21: 9,
  22: 10,
  23: 11,
  24: 12,
  25: 13,
  26: 14,
  27: 15,
  28: 16,
  48: 32,
  47: 31,
  46: 30,
  45: 29,
  44: 28,
  43: 27,
  42: 26,
  41: 25,
  31: 24,
  32: 23,
  33: 22,
  34: 21,
  35: 20,
  36: 19,
  37: 18,
  38: 17,
};

/** FDI-based lookup for restored tooth assets. */
export function fdiToFigmaTooth(fdi: number): number | undefined {
  return FDI_TO_FIGMA_TOOTH[fdi];
}

/** Map slot in `ToothMap26A` to Figma’s Tooth=1…32 using explicit FDI mapping. */
export function chartIndexToFigmaTooth(arch: "upper" | "lower", indexInArch: number): number {
  const fdi =
    arch === "upper"
      ? UPPER_FDI_ORDER[indexInArch]
      : LOWER_FDI_ORDER[indexInArch];
  return fdiToFigmaTooth(fdi) ?? -1;
}

/**
 * @param figmaToothN – 1…32 in Figma naming (see chart order above)
 */
export function getRegularRestoredSvgByFigmaTooth(
  figmaToothN: number,
  visual: RegularRestoredVisualState,
): string | undefined {
  if (figmaToothN < 1 || figmaToothN > 32) return undefined;
  const triple = byChartPosition[figmaToothN];
  if (!triple) return undefined;
  return triple[visual];
}

export function isRegularRestoredSelection(selection: string): boolean {
  if (selection === "Missing" || selection === "Implant based") return false;
  return Boolean(selection);
}
