/**
 * Scan toolbar — Figma 4001:104091, 4025:218644, 4025:218623, 4025:218650, 4025:218647.
 * Floating white toolbar in the top-right of the scan viewport.
 * Spacing follows 4px layout grid: 2u = 8px, 3u = 12px.
 *
 * States:
 * - Collapsed (default): icon-only 60×60 buttons + chevron ∨
 * - Expanded (chevron toggle): icons with text labels below + chevron ∧
 *
 * Each tool button has:
 * - Default: white background
 * - Active: light-blue background (#A6E2F9) on icon only, blue label text (#009ACE)
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";

export type ScanToolbarToolId = "scan-color" | "feedback" | "edit" | "swap";

interface ScanToolbarProps {
  className?: string;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  onToolClick?: (toolId: string, isActive: boolean) => void;
  activeTools?: Set<ScanToolbarToolId>;
  onActiveToolsChange?: (tools: Set<ScanToolbarToolId>) => void;
  /** Increment to clear the Edit tool active state (e.g. when Prep edit panel closes). */
  deselectEditNonce?: number;
  /** Increment to clear the Swap tool active state (e.g. when Swap modal closes). */
  deselectSwapNonce?: number;
  /**
   * When false (study-model / invisalign), Edit and Swap are not shown; fixed-restorative keeps full toolbar.
   * @default true
   */
  showEditAndSwapTools?: boolean;
  /** Tools that stay active (cannot be toggled off). */
  stickyActiveToolIds?: ScanToolbarToolId[];
}

type ToolId = ScanToolbarToolId;

function IconScanColor() {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(6 6)">
        <mask id="scan-mono-mask0" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="2" y="2" width="44" height="44">
          <circle cx="24" cy="24" r="22" fill="#D9D9D9" />
        </mask>
        <g mask="url(#scan-mono-mask0)">
          <mask id="scan-mono-mask1" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="2" y="2" width="44" height="44">
            <circle cx="24" cy="24" r="22" fill="#D9D9D9" />
          </mask>
          <g mask="url(#scan-mono-mask1)">
            <rect x="2.875" y="25.25" width="45" height="21" fill="#FFD6D6" />
          </g>
          <path d="M45.59 32.36L47 24H32.9958C32.9958 24 31.6079 26.0965 30.7083 29.1765C29.8088 32.2565 24 30.5894 24 30.5894L24 46C36.9187 46 45.59 41.2987 45.59 32.36Z" fill="#BAAD9E" />
          <path d="M36.266 30.8021C35.5854 31.958 34.7829 33.0638 33.7574 33.8837C32.9196 34.5482 31.9739 35.002 30.9813 35.3155C29.9699 35.6389 28.9185 35.7894 27.8625 35.8345L24.0023 36L20.142 35.8345C19.0883 35.7894 18.037 35.6389 17.0233 35.3155C16.0306 35.0045 15.0802 34.5507 14.2471 33.8837C13.2193 33.0638 12.4144 31.958 11.7338 30.8021C9.85886 27.6076 8.53768 23.5331 9.15251 19.7443C9.64766 16.7204 11.7362 12.6859 15.0872 13.0194C15.4721 13.052 15.8335 13.1699 15.8335 13.1699C16.1339 13.2651 16.4061 13.4081 16.6713 13.561C17.6827 14.1477 18.8982 14.7621 20.3062 15.3212C20.3203 15.3262 20.3321 15.3313 20.3461 15.3363C22.7022 16.249 25.2953 16.249 27.6537 15.3363C27.6678 15.3313 27.6795 15.3262 27.6936 15.3212C29.1016 14.7646 30.3172 14.1477 31.3286 13.561C31.5938 13.4081 31.866 13.2651 32.1663 13.1699C32.1663 13.1699 32.5277 13.0545 32.9126 13.0194C36.2636 12.6859 38.3545 16.7204 38.8473 19.7443C39.4622 23.5331 38.1433 27.6076 36.266 30.8021Z" fill="white" stroke="#3E3D40" strokeWidth="1.5" />
          <mask id="scan-mono-mask2" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="24" y="11" width="18" height="27">
            <rect x="24" y="11" width="18" height="27" fill="#D9D9D9" />
          </mask>
          <g mask="url(#scan-mono-mask2)">
            <path d="M36.266 30.8021C35.5854 31.958 34.7829 33.0638 33.7574 33.8837C32.9196 34.5482 31.9739 35.002 30.9813 35.3155C29.9699 35.6389 28.9185 35.7894 27.8625 35.8345L24.0023 36L20.142 35.8345C19.0883 35.7894 18.037 35.6389 17.0233 35.3155C16.0306 35.0045 15.0802 34.5507 14.2471 33.8837C13.2193 33.0638 12.4144 31.958 11.7338 30.8021C9.85886 27.6076 8.53768 23.5331 9.15251 19.7443C9.64766 16.7204 11.7362 12.6859 15.0872 13.0194C15.4721 13.052 15.8335 13.1699 15.8335 13.1699C16.1339 13.2651 16.4061 13.4081 16.6713 13.561C17.6827 14.1477 18.8982 14.7621 20.3062 15.3212C20.3203 15.3262 20.3321 15.3313 20.3461 15.3363C22.7022 16.249 25.2953 16.249 27.6537 15.3363C27.6678 15.3313 27.6795 15.3262 27.6936 15.3212C29.1016 14.7646 30.3172 14.1477 31.3286 13.561C31.5938 13.4081 31.866 13.2651 32.1663 13.1699C32.1663 13.1699 32.5277 13.0545 32.9126 13.0194C36.2636 12.6859 38.3545 16.7204 38.8473 19.7443C39.4622 23.5331 38.1433 27.6076 36.266 30.8021Z" fill="#BAAD9E" stroke="#796E61" strokeWidth="1.5" />
          </g>
          <path d="M6.26599 30.8021C5.58545 31.958 4.78288 33.0638 3.75739 33.8837C2.91962 34.5482 1.97392 35.002 0.981274 35.3155C-0.0301437 35.6389 -1.08145 35.7894 -2.13746 35.8345L-5.99774 36L-9.85802 35.8345C-10.9117 35.7894 -11.963 35.6389 -12.9767 35.3155C-13.9694 35.0045 -14.9198 34.5507 -15.7529 33.8837C-16.7807 33.0638 -17.5856 31.958 -18.2662 30.8021C-20.1411 27.6076 -21.4623 23.5331 -20.8475 19.7443C-20.3523 16.7204 -18.2638 12.6859 -14.9128 13.0194C-14.5279 13.052 -14.1665 13.1699 -14.1665 13.1699C-13.8661 13.2651 -13.5939 13.4081 -13.3287 13.561C-12.3173 14.1477 -11.1018 14.7621 -9.69375 15.3212C-9.67967 15.3262 -9.66794 15.3313 -9.65386 15.3363C-7.29779 16.249 -4.70472 16.249 -2.34631 15.3363C-2.33223 15.3313 -2.3205 15.3262 -2.30642 15.3212C-0.898413 14.7646 0.317165 14.1477 1.32858 13.561C1.59376 13.4081 1.86597 13.2651 2.16634 13.1699C2.16634 13.1699 2.52773 13.0545 2.91259 13.0194C6.26364 12.6859 8.35452 16.7204 8.84733 19.7443C9.46215 23.5331 8.14332 27.6076 6.26599 30.8021Z" fill="white" stroke="#3E3D40" strokeWidth="1.5" />
          <path d="M67.266 30.8021C66.5854 31.958 65.7829 33.0638 64.7574 33.8837C63.9196 34.5482 62.9739 35.002 61.9813 35.3155C60.9699 35.6389 59.9185 35.7894 58.8625 35.8345L55.0023 36L51.142 35.8345C50.0883 35.7894 49.037 35.6389 48.0233 35.3155C47.0306 35.0045 46.0802 34.5507 45.2471 33.8837C44.2193 33.0638 43.4144 31.958 42.7338 30.8021C40.8589 27.6076 39.5377 23.5331 40.1525 19.7443C40.6477 16.7204 42.7362 12.6859 46.0872 13.0194C46.4721 13.052 46.8335 13.1699 46.8335 13.1699C47.1339 13.2651 47.4061 13.4081 47.6713 13.561C48.6827 14.1477 49.8982 14.7621 51.3062 15.3212C51.3203 15.3262 51.3321 15.3313 51.3461 15.3363C53.7022 16.249 56.2953 16.249 58.6537 15.3363C58.6678 15.3313 58.6795 15.3262 58.6936 15.3212C60.1016 14.7646 61.3172 14.1477 62.3286 13.561C62.5938 13.4081 62.866 13.2651 63.1663 13.1699C63.1663 13.1699 63.5277 13.0545 63.9126 13.0194C67.2636 12.6859 69.3545 16.7204 69.8473 19.7443C70.4622 23.5331 69.1433 27.6076 67.266 30.8021Z" fill="#BAAD9E" stroke="#796E61" strokeWidth="1.5" />
        </g>
      </g>
    </svg>
  );
}

function IconFeedback() {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <svg x="6" y="6" width="48" height="48" viewBox="0 0 48 48" fill="none">
        <g clipPath="url(#lfClip0)">
          <mask id="lfMask0" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="2" y="2" width="44" height="44">
            <circle cx="24" cy="24" r="22" fill="#D9D9D9" />
          </mask>
          <g mask="url(#lfMask0)">
            <rect x="2.91663" y="29.5833" width="44.9167" height="16.5" fill="#FFD6D6" />
          </g>
          <path d="M37.9068 31.3547C37.1355 32.6112 36.2206 33.8131 35.0584 34.7043C34.1089 35.4266 33.0371 35.9199 31.9121 36.2606C30.7658 36.6122 29.5744 36.7757 28.3775 36.8248L24.0026 37.0046L19.6276 36.8248C18.4334 36.7757 17.242 36.6122 16.093 36.2606C14.968 35.9226 13.8909 35.4293 12.9468 34.7043C11.7819 33.8131 10.8696 32.6112 10.0984 31.3547C7.97337 27.8825 6.47604 23.4536 7.17284 19.3354C7.73401 16.0485 10.101 11.6632 13.8989 12.0257C14.335 12.0612 14.7446 12.1893 14.7446 12.1893C15.085 12.2928 15.3936 12.4482 15.6941 12.6144C16.8404 13.2522 18.218 13.9199 19.8138 14.5277C19.8297 14.5332 19.843 14.5386 19.859 14.5441C22.5292 15.5361 25.468 15.5361 28.1408 14.5441C28.1568 14.5386 28.1701 14.5332 28.1861 14.5277C29.7818 13.9227 31.1595 13.2522 32.3057 12.6144C32.6063 12.4482 32.9148 12.2928 33.2552 12.1893C33.2552 12.1893 33.6648 12.0639 34.1009 12.0257C37.8988 11.6632 40.2685 16.0485 40.827 19.3354C41.5238 23.4536 40.0291 27.8825 37.9015 31.3547H37.9068Z" fill="white" stroke="#3E3D40" strokeWidth="1.5" />
          <rect x="22" y="5" width="20" height="20" rx="10" fill="#408DC1" />
          <path d="M32 11V11" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M32 20V14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </g>
        <defs>
          <clipPath id="lfClip0">
            <rect width="48" height="48" rx="24" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </svg>
  );
}

function IconEdit() {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <svg x="6" y="6" width="48" height="48" viewBox="0 0 48 48" fill="none">
        <mask id="peMask0" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="2" y="2" width="44" height="44">
          <circle cx="24" cy="24" r="22" fill="#D9D9D9" />
        </mask>
        <g mask="url(#peMask0)">
          <rect x="2.91663" y="29.5833" width="44.9167" height="16.5" fill="#FFD6D6" />
        </g>
        <path d="M36 34.2604L34.1615 16.5093C34.0538 14.3225 32.825 12.7074 31.6 13.0446C26.4934 14.452 21.2422 14.4545 16 13.0446C14.7707 12.7148 13.7589 14.3176 13.6835 16.5167L12 34.578C19 38 27 38.5 36 34.2628V34.2604Z" fill="white" stroke="#3E3D40" strokeWidth="1.5" strokeMiterlimit="10" strokeDasharray="2 2" />
        <path d="M38.8278 11.1667C39.3188 11.1667 39.7929 11.3369 40.1705 11.6442L40.3268 11.7839L40.3287 11.7858L41.5895 13.0475L41.5914 13.0495C41.9875 13.4486 42.2076 13.9877 42.2076 14.5475C42.2076 15.1092 41.9853 15.6468 41.5905 16.0446L39.3795 18.2555L39.3785 18.2546L39.2633 18.3708L29.1266 28.5065L29.1198 28.5143L29.1119 28.5212C28.4026 29.1913 27.6031 29.7587 26.7369 30.2067L26.7272 30.2116L26.7184 30.2165L23.0192 31.9987H23.0172C22.799 32.1033 22.5578 32.1866 22.3121 32.2038C22.0666 32.2209 21.7293 32.1741 21.4645 31.9098C21.1993 31.645 21.152 31.3068 21.1696 31.0602C21.1872 30.8141 21.2711 30.5725 21.3766 30.3542L23.1578 26.6559L23.1627 26.6471L23.1676 26.6374C23.6146 25.7713 24.1817 24.9711 24.8522 24.2624L24.859 24.2546L24.8668 24.2467L35.0026 14.11L35.5328 13.5798L35.649 13.4645L37.3297 11.7839C37.7279 11.3887 38.2667 11.1668 38.8278 11.1667Z" fill="#408DC1" stroke="white" strokeWidth="1.5" />
      </svg>
    </svg>
  );
}

function ChevronIcon({ up }: { up: boolean }) {
  return (
    <svg width="60" height="60" viewBox="0 0 61 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0.5 60L0.499997 0L60.5 0L60.5 60L0.5 60Z" fill="white" />
      <path d="M0.5 60L1 60L0.999997 0L0.5 0L0 0L0 60L0.5 60Z" fill="#F0F0F0" />
      <rect
        x="18.5"
        y="18"
        width="24"
        height="24"
        rx="3"
        stroke="#3E3D40"
        strokeWidth="2"
        fill="none"
      />
      <line
        x1="18.5"
        y1="25"
        x2="42.5"
        y2="25"
        stroke="#3E3D40"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M25.5 35L30.5 30L35.5 35"
        stroke="#3E3D40"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        style={{
          transformOrigin: "30.5px 32px",
          transform: up ? "none" : "scaleY(-1)",
          transition: "transform 0.2s ease",
        }}
      />
    </svg>
  );
}

const TOOLS: { id: ToolId; label: string; Icon: () => React.JSX.Element }[] = [
  { id: "scan-color", label: "Color", Icon: IconScanColor },
  { id: "feedback", label: "Feedback", Icon: IconFeedback },
  { id: "edit", label: "Edit", Icon: IconEdit },
];

export default function ScanToolbar26A({
  className,
  expanded: controlledExpanded,
  onExpandedChange,
  onToolClick,
  activeTools: controlledActiveTools,
  onActiveToolsChange,
  deselectEditNonce = 0,
  deselectSwapNonce = 0,
  showEditAndSwapTools = true,
  stickyActiveToolIds,
}: ScanToolbarProps) {
  const [internalExpanded, setInternalExpanded] = useState(true);
  const expanded = controlledExpanded ?? internalExpanded;
  const [internalActiveTools, setInternalActiveTools] = useState<Set<ToolId>>(() => new Set());
  const activeTools = controlledActiveTools ?? internalActiveTools;

  const setActiveTools = useCallback(
    (next: Set<ToolId>) => {
      if (onActiveToolsChange) onActiveToolsChange(next);
      else setInternalActiveTools(next);
    },
    [onActiveToolsChange],
  );

  const prevDeselectEditNonce = useRef(0);
  const prevDeselectSwapNonce = useRef(0);

  useEffect(() => {
    if (deselectEditNonce <= prevDeselectEditNonce.current) return;
    prevDeselectEditNonce.current = deselectEditNonce;
    if (!activeTools.has("edit")) return;
    const next = new Set(activeTools);
    next.delete("edit");
    setActiveTools(next);
  }, [deselectEditNonce, activeTools, setActiveTools]);

  useEffect(() => {
    if (deselectSwapNonce <= prevDeselectSwapNonce.current) return;
    prevDeselectSwapNonce.current = deselectSwapNonce;
    if (!activeTools.has("swap")) return;
    const next = new Set(activeTools);
    next.delete("swap");
    setActiveTools(next);
  }, [deselectSwapNonce, activeTools, setActiveTools]);

  function toggleExpanded() {
    const next = !expanded;
    onExpandedChange?.(next);
    setInternalExpanded(next);
  }

  const visibleTools = useMemo(
    () =>
      showEditAndSwapTools ? TOOLS : TOOLS.filter((t) => t.id !== "edit" && t.id !== "swap"),
    [showEditAndSwapTools],
  );

  return (
    <div
      className={className ?? ""}
      style={{
        padding: 8,
        borderRadius: 8,
        backgroundColor: "#ffffff",
        boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
      }}
    >
      <div
        className="flex items-stretch justify-center"
        style={{ gap: 8 }}
      >
        <div
          className="flex items-start"
          style={{ gap: 12 }}
        >
          {visibleTools.map((tool) => {
            const isActive = activeTools.has(tool.id);
            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => {
                  const sticky = stickyActiveToolIds?.includes(tool.id);
                  const next = new Set(activeTools);
                  if (next.has(tool.id)) {
                    if (!sticky) next.delete(tool.id);
                  } else {
                    next.add(tool.id);
                  }
                  setActiveTools(next);
                  onToolClick?.(tool.id, next.has(tool.id));
                }}
                className="flex flex-col items-center justify-center cursor-pointer border-0 appearance-none outline-none transition-ui focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2"
                style={{
                  width: expanded ? 96.67 : 60,
                  height: expanded ? 90 : 60,
                  padding: 0,
                  gap: expanded ? 4 : 0,
                  backgroundColor: "transparent",
                }}
                aria-label={tool.label}
                aria-pressed={isActive}
              >
                <span
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: isActive ? "#A6E2F9" : "white",
                  }}
                >
                  <tool.Icon />
                </span>
                {expanded && (
                  <span
                    className="tp-body-01"
                    style={{
                      color: isActive ? "#009ACE" : "var(--color-text-primary)",
                      whiteSpace: "nowrap",
                      width: "fit-content",
                    }}
                  >
                    {tool.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={toggleExpanded}
          className="flex items-center justify-center cursor-pointer border-0 appearance-none outline-none transition-ui focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2"
          style={{
            width: 60,
            backgroundColor: "white",
            padding: 0,
            flexShrink: 0,
          }}
          aria-label={expanded ? "Collapse toolbar" : "Expand toolbar"}
          aria-expanded={expanded}
        >
          <ChevronIcon up={expanded} />
        </button>
      </div>
    </div>
  );
}
