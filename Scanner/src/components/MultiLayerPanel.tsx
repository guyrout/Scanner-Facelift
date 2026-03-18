/**
 * Multi layer panel — Figma 4024:77272 (UI Refresh 2025 Q2).
 * Top-left panel on View: expand/collapse, layer thumbnails, sliders for 3D opacity.
 * Icons: /panel/frame-jaw-*.svg, frame-jaw-4.svg, chevron-right.svg, actions-dropdown-1/2.svg.
 */

import React, { useState, useCallback } from "react";

const LAYER_ICONS = ["/panel/frame-jaw-active.svg", "/panel/frame-jaw-2.svg", "/panel/frame-jaw-3.svg"];

export interface LayerItem {
  id: string;
  label: string;
  sublabel?: string;
  disabled?: boolean;
}

interface MultiLayerPanelProps {
  className?: string;
  layers: LayerItem[];
  layerOpacities: Record<string, number>;
  onLayerOpacityChange: (layerId: string, value: number) => void;
}

const PANEL_WIDTH = 352;
const HEADER_PADDING_H = 16;
const CARD_PADDING = 16;
const SLIDER_GAP = 12;

function OpacitySlider({
  value,
  onChange,
  disabled,
  "aria-label": ariaLabel,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  "aria-label"?: string;
}) {
  const [isAdjusting, setIsAdjusting] = useState(false);
  const pct = Math.round(value);
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = Number(e.target.value);
      onChange(v);
    },
    [onChange],
  );
  return (
    <div className="flex flex-col w-full" style={{ gap: 8 }}>
      <div className="flex flex-col w-full" style={{ gap: 4 }}>
        <div
          className={`flex h-[60px] items-center w-full ${isAdjusting ? "brightness-adjusting" : ""}`}
          style={{ position: "relative" }}
        >
          <input
            type="range"
            min={0}
            max={100}
            value={value}
            onChange={handleChange}
            onPointerDown={() => setIsAdjusting(true)}
            onPointerUp={() => setIsAdjusting(false)}
            onPointerLeave={() => setIsAdjusting(false)}
            disabled={disabled}
            aria-label={ariaLabel ?? "Opacity"}
            className="brightness-slider w-full block"
            style={{ ["--slider-value" as string]: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function MultiLayerPanel({
  className,
  layers,
  layerOpacities,
  onLayerOpacityChange,
}: MultiLayerPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const [activeThumbIndex, setActiveThumbIndex] = useState(0);

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-lg ${className ?? ""}`}
      style={{
        width: PANEL_WIDTH,
        backgroundColor: "var(--color-background-layer-01)",
        border: "1px solid var(--color-border-subtle)",
        boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
      }}
    >
      {/* Header row — Figma 4024:77274 (padding) + 4024:77275 (layout) */}
      <div
        className="flex shrink-0 flex-col items-stretch"
        style={{
          paddingTop: 8,
          paddingBottom: 6,
          paddingLeft: 16,
          paddingRight: 16,
          width: "100%",
        }}
      >
        {/* Figma 4024:77275 — gap 10px, items-center, full width */}
        <div
          className="flex items-center relative w-full"
          style={{ gap: 10 }}
          data-node-id="4024:77275"
        >
          {/* Figma 4024:77276 — flex-1 0 0, gap 8px (spacing-02) */}
          <div
            className="flex min-h-0 min-w-0 flex-1 items-center"
            style={{ gap: 8, backgroundColor: "unset", background: "unset" }}
            data-node-id="4024:77276"
          >
            {layers.slice(0, 3).map((layer, i) => (
              <button
                key={layer.id}
                type="button"
                className="flex shrink-0 flex-col items-center justify-center rounded-lg border-0 bg-transparent p-0 outline-none transition-ui focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 hover:opacity-70"
                style={{
                  width: 60,
                  height: 60,
                  ...(i === activeThumbIndex
                    ? { backgroundColor: "#a6e2f9" }
                    : { backgroundColor: "unset", background: "unset" }),
                }}
                data-node-id={i === 0 ? "4024:77277" : i === 1 ? "4024:77303" : "4024:77329"}
                aria-label={`Select ${layer.label}`}
                aria-pressed={i === activeThumbIndex}
                onClick={() => setActiveThumbIndex(i)}
              >
                <div className="flex h-[32px] w-[44px] shrink-0 items-center justify-center overflow-hidden">
                  <img
                    src={LAYER_ICONS[i] ?? LAYER_ICONS[0]}
                    alt=""
                    className="block max-w-none object-contain"
                    style={{ width: 44, height: 32 }}
                    aria-hidden
                  />
                </div>
              </button>
            ))}
            <button
              type="button"
              className="flex shrink-0 flex-col items-center justify-center rounded-lg border-0 bg-transparent p-0 outline-none transition-ui focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 hover:opacity-70"
              style={{
                width: 60,
                height: 60,
                backgroundColor: "unset",
                background: "unset",
              }}
              aria-label="Add layer"
            >
              <div className="flex h-[32px] w-[44px] shrink-0 items-center justify-center overflow-hidden">
                <img
                  src="/panel/frame-jaw-4.svg"
                  alt=""
                  className="block max-w-none object-contain"
                  style={{ width: 44, height: 32 }}
                  aria-hidden
                />
              </div>
            </button>
          </div>
          {/* Figma 4024:77355 — vertical divider, 60px */}
          <div
            className="shrink-0 self-stretch bg-[var(--color-border-subtle)]"
            style={{ width: 1, minHeight: 60 }}
            data-node-id="4024:77355"
            aria-hidden
          />
          {/* Figma 4024:77356 — collapse 42×42, chevron 32×32 */}
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="flex shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0 outline-none transition-ui focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 hover:opacity-70"
            style={{ width: 42, height: 42 }}
            aria-label={expanded ? "Collapse panel" : "Expand panel"}
            aria-expanded={expanded}
            data-node-id="4024:77356"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden">
              <img
                src="/panel/chevron-right.svg"
                alt=""
                className="block h-full w-full object-contain"
                style={{ transform: expanded ? "rotate(-90deg)" : "rotate(90deg)" }}
                aria-hidden
              />
            </span>
          </button>
        </div>
      </div>

      {expanded && (
        <div
          className="flex flex-col overflow-y-auto overflow-x-hidden"
          style={{
            paddingTop: 16,
            paddingBottom: 16,
            paddingLeft: HEADER_PADDING_H,
            paddingRight: HEADER_PADDING_H,
            gap: 16,
          }}
        >
          {layers.map((layer) => (
            <div
              key={layer.id}
              className="flex flex-col rounded-lg shrink-0 w-full"
              style={{
                padding: CARD_PADDING,
                gap: 4,
                backgroundColor: "var(--color-background-layer-02)",
              }}
            >
              <div className="flex items-center justify-between shrink-0 w-full">
                <span
                  className={`tp-headling-02 text-text-primary whitespace-nowrap ${layer.disabled ? "opacity-45" : ""}`}
                >
                  {layer.label}
                </span>
                <button
                  type="button"
                  className="flex items-center justify-center shrink-0 cursor-pointer border-0 bg-transparent p-0 outline-none transition-ui hover:opacity-70 rounded overflow-hidden"
                  style={{ width: 24, height: 24 }}
                  aria-label={layer.disabled ? "Layer hidden" : "Layer visible"}
                >
                  <img
                    src={layer.disabled ? "/panel/actions-dropdown-2.svg" : "/panel/actions-dropdown-1.svg"}
                    alt=""
                    className="block w-full h-full"
                    aria-hidden
                  />
                </button>
              </div>
              {layer.sublabel && (
                <span
                  className={`tp-body-02 text-text-secondary w-full ${layer.disabled ? "opacity-45" : ""}`}
                >
                  {layer.sublabel}
                </span>
              )}
              <div className="flex flex-col shrink-0 w-full" style={{ gap: SLIDER_GAP }}>
                <OpacitySlider
                  value={layerOpacities[layer.id] ?? 100}
                  onChange={(v) => onLayerOpacityChange(layer.id, v)}
                  disabled={layer.disabled}
                  aria-label={`${layer.label} opacity`}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
