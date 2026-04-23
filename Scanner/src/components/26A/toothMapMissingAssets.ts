/**
 * "Missing" per-tooth SVGs for the jaw selector (Figma export) — Active / Hovered / Pressed.
 * Files live under `src/assets/scan/tooth-map-missing/` as `tooth-{01..32}-{active|hovered|pressed}.svg`.
 * Tooth index 1…32 matches `fdiToFigmaTooth` in `toothMapRegularRestoredAssets.ts`.
 */

import type { RegularRestoredVisualState } from "./toothMapRegularRestoredAssets";

const modules = import.meta.glob<string>("../../assets/scan/tooth-map-missing/tooth-*.svg", {
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
 * @param figmaToothN – 1…32 (same chart order as restored assets)
 */
export function getMissingSvgByFigmaTooth(
  figmaToothN: number,
  visual: RegularRestoredVisualState,
): string | undefined {
  if (figmaToothN < 1 || figmaToothN > 32) return undefined;
  const triple = byChartPosition[figmaToothN];
  if (!triple) return undefined;
  return triple[visual];
}
