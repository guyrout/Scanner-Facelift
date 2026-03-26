/**
 * Camera NIRI / IOC review strip — Figma UI-Refresh-2025 Q2 (node 4302:155715).
 * Spec: elevated panel pl-2 pr-8 py-8 rounded-8; row 32px chevron + 392px stack; stack gap 8; blocks 416px tall rounded-8; zoom 56×56 rounded-4, fill rgba(255,255,255,0.63).
 */

const ROW_W = 424; /* 32 + 392 */
const CONTENT_W = 392;
const BLOCK_H = 416;
const CHEVRON_COL_W = 32;
const ZOOM_HIT = 56;
const ZOOM_ICON = 32;
const ZOOM_BG = "rgba(255, 255, 255, 0.63)";

const NIRI_SRC = "/review-tool/niri.png";
const IOC_SRC = "/review-tool/ioc.png";
const ZOOM_SVG = "/review-tool/zoom-in.svg";
const CHEVRON_SVG = "/review-tool/chevron-left.svg";

export interface ReviewToolPanelProps {
  onClose: () => void;
}

function ZoomInControl() {
  return (
    <button
      type="button"
      className="flex cursor-pointer items-center justify-center border-0 p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2"
      style={{
        width: ZOOM_HIT,
        height: ZOOM_HIT,
        borderRadius: 4,
        backgroundColor: ZOOM_BG,
      }}
      aria-label="Zoom in"
    >
      <img src={ZOOM_SVG} width={ZOOM_ICON} height={ZOOM_ICON} alt="" className="pointer-events-none shrink-0" />
    </button>
  );
}

export default function ReviewToolPanel({ onClose }: ReviewToolPanelProps) {
  return (
    <aside
      className="mt-4 flex shrink-0 flex-col overflow-hidden"
      style={{
        paddingLeft: 2,
        paddingRight: 8,
        paddingTop: 8,
        paddingBottom: 8,
        borderRadius: 8,
        backgroundColor: "var(--color-background-elevated)",
        boxShadow: "0px 2px 12px rgba(0, 0, 0, 0.13)",
        width: 2 + ROW_W + 8,
      }}
      aria-label="Review tool"
    >
      <div className="flex shrink-0 flex-row items-stretch" style={{ width: ROW_W }}>
        {/* Chevron — 32px column, vertically centered */}
        <div
          className="flex shrink-0 flex-col items-center justify-center self-stretch"
          style={{ width: CHEVRON_COL_W }}
        >
          <button
            type="button"
            onClick={onClose}
            className="flex cursor-pointer items-center justify-center overflow-hidden border-0 bg-transparent p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2"
            style={{ width: CHEVRON_COL_W, height: 32 }}
            aria-label="Close review tool"
          >
            <img src={CHEVRON_SVG} width={32} height={32} alt="" className="pointer-events-none block shrink-0" />
          </button>
        </div>

        {/* NIRI + IOC — 392px wide, spacing-02 (8px) between */}
        <div className="flex shrink-0 flex-col items-start" style={{ width: CONTENT_W, gap: 8 }}>
          <div
            className="relative shrink-0 overflow-hidden"
            style={{ width: CONTENT_W, height: BLOCK_H, borderRadius: 8 }}
          >
            <div className="pointer-events-none absolute inset-0">
              <img
                src={NIRI_SRC}
                alt=""
                className="h-full w-full object-cover"
                style={{ borderRadius: 4 }}
                draggable={false}
              />
            </div>
            <div className="pointer-events-auto absolute right-0 top-0">
              <ZoomInControl />
            </div>
          </div>

          <div
            className="relative shrink-0 overflow-hidden"
            style={{ width: CONTENT_W, height: BLOCK_H, borderRadius: 8 }}
          >
            <div className="pointer-events-none absolute inset-0">
              <img
                src={IOC_SRC}
                alt=""
                className="h-full w-full object-cover"
                style={{ borderRadius: 4 }}
                draggable={false}
              />
            </div>
            <div className="pointer-events-auto absolute right-0 top-0">
              <ZoomInControl />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
