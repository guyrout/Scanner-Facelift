/**
 * Prep edit popover — Figma UI-Refresh-2025 Q2 (node 4285:156904).
 * Shown when the user activates Edit on the scan toolbar: title, close, Select, Erase and scan.
 */

function IconClose() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Wand — from wand icon.svg (Select) */
function IconSelectWand() {
  return (
    <svg width={24} height={24} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden className="block shrink-0">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18.5152 19.3896C18.2176 19.7175 17.7022 19.7175 17.4046 19.3896L11.2047 12.56C10.9451 12.2741 10.9451 11.8377 11.2047 11.5518L12.2318 10.4203C12.5295 10.0925 13.0448 10.0925 13.3425 10.4203L19.5423 17.2499C19.8019 17.5359 19.8019 17.9722 19.5423 18.2581L18.5152 19.3896Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.49973 10.2861C9.08625 10.6761 8.44046 10.6761 8.02698 10.2861L6.46366 8.81176C6.01447 8.38813 6.01447 7.67378 6.46366 7.25015L7.84811 5.94447C8.26159 5.55452 8.90738 5.55452 9.32086 5.94447L10.8842 7.41884C11.3334 7.84247 11.3334 8.55682 10.8842 8.98045L9.49973 10.2861Z"
        fill="currentColor"
      />
      <path
        d="M7.58736 11.6957C7.8385 11.7416 8.00714 11.9718 7.96334 12.2093L7.36373 15.4515C7.31992 15.689 7.08159 15.8449 6.83053 15.7992C6.57949 15.7532 6.41174 15.523 6.45553 15.2855L7.05318 12.0424C7.0972 11.8051 7.3364 11.6499 7.58736 11.6957ZM4.24557 8.75427C4.49705 8.71263 4.73231 8.87219 4.77096 9.11072C4.80936 9.34926 4.63672 9.57668 4.38521 9.61853L0.638144 10.2416C0.386819 10.2831 0.151545 10.1234 0.112753 9.88513C0.0743897 9.6467 0.247179 9.4193 0.498496 9.37732L4.24557 8.75427ZM15.601 4.09021C15.8257 3.97688 16.097 4.06222 16.2065 4.28161C16.316 4.50112 16.2221 4.77171 15.9975 4.88513L12.7963 6.50036C12.5719 6.61358 12.3006 6.52788 12.1909 6.30896C12.0814 6.08943 12.1743 5.81884 12.3989 5.70544L15.601 4.09021ZM2.10006 2.07849C2.27584 1.90296 2.56115 1.90286 2.73678 2.07849L5.51314 4.85876C5.68851 5.03464 5.68795 5.31995 5.51217 5.49548C5.33625 5.6704 5.05083 5.67014 4.87545 5.4945L2.10006 2.71521C1.92468 2.53958 1.92489 2.25416 2.10006 2.07849ZM10.8725 0.124388C11.1176 0.194648 11.2603 0.438878 11.1909 0.670286L10.1899 4.00525C10.1204 4.23664 9.86473 4.36806 9.61959 4.29822C9.37473 4.22801 9.23222 3.98357 9.30123 3.75232L10.3022 0.41638C10.3717 0.184882 10.6273 0.054327 10.8725 0.124388Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Undo — from Undo.svg (Erase and scan) */
function IconEraseScan() {
  return (
    <svg width={24} height={24} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden className="block shrink-0">
      <path
        d="M12.5 6.25H4.88431L7.12644 4.00881L6.25 3.125L2.5 6.875L6.25 10.625L7.12644 9.74087L4.88619 7.5H12.5C13.4946 7.5 14.4484 7.89509 15.1517 8.59835C15.8549 9.30161 16.25 10.2554 16.25 11.25C16.25 12.2446 15.8549 13.1984 15.1517 13.9017C14.4484 14.6049 13.4946 15 12.5 15H7.5V16.25H12.5C13.8261 16.25 15.0979 15.7232 16.0355 14.7855C16.9732 13.8479 17.5 12.5761 17.5 11.25C17.5 9.92392 16.9732 8.65215 16.0355 7.71447C15.0979 6.77678 13.8261 6.25 12.5 6.25Z"
        fill="currentColor"
      />
    </svg>
  );
}

export interface PrepEditPanelProps {
  onClose: () => void;
  onSelect?: () => void;
  onEraseAndScan?: () => void;
  className?: string;
}

export default function PrepEditPanel({ onClose, onSelect, onEraseAndScan, className }: PrepEditPanelProps) {
  const rowClass =
    "flex w-full items-center gap-3 rounded-lg border-0 bg-transparent cursor-pointer text-left transition-ui hover:bg-[var(--color-background-layer-hovered)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2";

  return (
    <div
      role="dialog"
      aria-labelledby="prep-edit-title"
      className={`flex flex-col overflow-hidden rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-background-layer-01)] shadow-[0px_4px_12px_rgba(0,0,0,0.08)] ${className ?? ""}`}
      style={{ minWidth: 280, maxWidth: 400 }}
    >
      {/* Header */}
      <div
        className="flex shrink-0 items-center justify-between border-b border-[var(--color-border-subtle)]"
        style={{ padding: "12px 16px" }}
      >
        <h2 id="prep-edit-title" className="tp-heading-04 text-text-primary">
          Prep edit
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="flex shrink-0 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent p-1 text-[var(--color-icon-primary)] transition-ui hover:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2"
          aria-label="Close prep edit"
        >
          <IconClose />
        </button>
      </div>

      {/* Actions */}
      <div className="flex flex-col" style={{ padding: "8px" }}>
        <button type="button" className={rowClass} style={{ padding: "12px 12px" }} onClick={() => onSelect?.()}>
          <span className="flex shrink-0 text-[var(--color-icon-primary)]">
            <IconSelectWand />
          </span>
          <span className="tp-body-02 text-text-primary">Select</span>
        </button>
        <button type="button" className={rowClass} style={{ padding: "12px 12px" }} onClick={() => onEraseAndScan?.()}>
          <span className="flex shrink-0 text-[var(--color-icon-primary)]">
            <IconEraseScan />
          </span>
          <span className="tp-body-02 text-text-primary">Erase and scan</span>
        </button>
      </div>
    </div>
  );
}
