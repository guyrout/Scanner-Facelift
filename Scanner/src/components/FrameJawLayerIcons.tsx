/**
 * Multi-layer panel jaw icons — inline SVG (same 48×48 treatment as ViewToolbar).
 */

import { useId, useMemo } from "react";
import frameJawUpperSvg from "../assets/panel/frame-jaw-upper.svg?raw";
import frameJawLowerSvg from "../assets/panel/frame-jaw-lower.svg?raw";
import frameJawBiteSvg from "../assets/panel/frame-jaw-bite.svg?raw";

/** Matches ViewToolbar tool icon size (Figma 1497:27534). */
export const FRAME_JAW_ICON_SIZE = 48;

function namespaceSvgIds(markup: string, prefix: string): string {
  const idRegex = /\bid="([^"]+)"/g;
  const idMap = new Map<string, string>();
  let next = 0;
  const withNamespacedIds = markup.replace(idRegex, (_match, id: string) => {
    const namespaced = `${prefix}-${id}-${next++}`;
    idMap.set(id, namespaced);
    return `id="${namespaced}"`;
  });

  let result = withNamespacedIds;
  idMap.forEach((newId, oldId) => {
    result = result.replaceAll(`url(#${oldId})`, `url(#${newId})`);
    result = result.replaceAll(`="#${oldId}"`, `="#${newId}"`);
  });
  return result;
}

function normalizeSvgSize(markup: string, size: number): string {
  return markup.replace(
    /<svg([^>]*)\swidth="[^"]*"([^>]*)\sheight="[^"]*"/,
    `<svg$1 width="${size}" height="${size}"$2`,
  );
}

function FrameJawIcon({ markup }: { markup: string }) {
  const iconId = useId().replaceAll(":", "-");
  const safeMarkup = useMemo(
    () => namespaceSvgIds(normalizeSvgSize(markup, FRAME_JAW_ICON_SIZE), `frame-jaw-svg-${iconId}`),
    [iconId, markup],
  );
  return (
    <span
      aria-hidden
      className="block shrink-0"
      style={{ width: FRAME_JAW_ICON_SIZE, height: FRAME_JAW_ICON_SIZE }}
      dangerouslySetInnerHTML={{ __html: safeMarkup }}
    />
  );
}

export function FrameJawIconUpper() {
  return <FrameJawIcon markup={frameJawUpperSvg} />;
}

export function FrameJawIconLower() {
  return <FrameJawIcon markup={frameJawLowerSvg} />;
}

export function FrameJawIconBite() {
  return <FrameJawIcon markup={frameJawBiteSvg} />;
}

export const FRAME_JAW_LAYER_ICONS = [FrameJawIconUpper, FrameJawIconLower] as const;
