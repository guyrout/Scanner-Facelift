/**
 * Prep edit popover — Figma UI-Refresh-2026 Q2.
 * Three states wired via the `mode` prop:
 *  - "select"   → Figma 5386:98816 — initial CTA "Select and rescan" (active focus ring)
 *  - "selected" → Figma 5386:98770 — "Rescan" (active focus ring) + "Undo Selection"
 *  - "disabled" → Figma 5404:89938 — "Rescan" (disabled) + "Undo Selection"
 *
 * Visual spec (from Figma):
 *  - Card: white background, 16px corner radius, 8px top padding / 24px bottom / 24px sides, 24px gap between sections.
 *  - Header row 60px tall: title "Prep editing" (tp-heading-03) + 32px close glyph.
 *  - Subtitle (tp-body-02 / text-secondary): "Select the area you would like to rescan."
 *  - Buttons: full-width 60px tall pills, 2px subtle border, 8px radius, 16px gap row.
 *  - Active focus ring: 2px solid border-interactive sitting 4px outside the button (outline + offset).
 */

import lassoIcon from "../../assets/scan/prep-edit/lasso.png";
import brushIcon from "../../assets/scan/prep-edit/brush.png";
import brushDisabledIcon from "../../assets/scan/prep-edit/brush-disabled.png";
import undoIcon from "../../assets/scan/prep-edit/undo.png";

function IconClose() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="block shrink-0"
    >
      <path
        d="M24 8L8 24M8 8L24 24"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export type PrepEditMode = "select" | "selected" | "disabled";

export interface PrepEditPanelProps {
  onClose: () => void;
  /** Visual / interaction state. Defaults to "select". */
  mode?: PrepEditMode;
  /** State 1 — initial "Select and rescan" CTA. */
  onSelectAndRescan?: () => void;
  /** State 2 — confirm rescan after the user has made a selection. */
  onRescan?: () => void;
  /** States 2 & 3 — undo the current selection. */
  onUndoSelection?: () => void;
  className?: string;
}

interface PrepEditButtonProps {
  iconSrc: string;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
}

function PrepEditButton({ iconSrc, label, active = false, disabled = false, onClick, ariaLabel }: PrepEditButtonProps) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-label={ariaLabel ?? label}
      className="relative flex w-full items-center bg-[var(--color-background-layer-01)] transition-ui focus:outline-none disabled:cursor-not-allowed enabled:cursor-pointer enabled:hover:bg-[var(--color-background-layer-hovered)]"
      style={{
        height: 60,
        minWidth: 72,
        padding: "12px 16px",
        gap: 8,
        borderRadius: 8,
        border: `2px solid ${
          disabled
            ? "var(--color-border-disabled, rgba(0,0,0,0.09))"
            : "var(--color-border-subtle, rgba(0,0,0,0.09))"
        }`,
        outline: active ? "2px solid var(--color-border-interactive, #009ACE)" : "none",
        outlineOffset: active ? 4 : 0,
        color: disabled ? "var(--color-text-disabled)" : "var(--color-text-primary)",
      }}
    >
      <span
        className="flex shrink-0 items-center justify-center"
        style={{ width: 24, height: 24, opacity: disabled ? 0.5 : 1 }}
      >
        <img
          src={iconSrc}
          alt=""
          aria-hidden
          width={24}
          height={24}
          className="block shrink-0"
          style={{ width: 24, height: 24, objectFit: "contain" }}
          draggable={false}
        />
      </span>
      <span className="tp-body-02 text-left" style={{ whiteSpace: "nowrap" }}>
        {label}
      </span>
    </button>
  );
}

export default function PrepEditPanel26A({
  onClose,
  mode = "select",
  onSelectAndRescan,
  onRescan,
  onUndoSelection,
  className,
}: PrepEditPanelProps) {
  return (
    <div
      role="dialog"
      aria-labelledby="prep-edit-title"
      className={`flex flex-col bg-[var(--color-background-layer-01)] shadow-[0px_4px_12px_rgba(0,0,0,0.08)] ${className ?? ""}`}
      style={{
        width: 400,
        maxWidth: 400,
        paddingTop: 8,
        paddingBottom: 24,
        paddingLeft: 24,
        paddingRight: 24,
        gap: 24,
        borderRadius: 16,
        border: "1px solid var(--color-border-subtle)",
      }}
    >
      {/* Headline (title + subtitle) */}
      <div className="flex flex-col w-full" style={{ gap: 8 }}>
        <div className="flex items-center w-full" style={{ gap: 16, height: 60 }}>
          <h2
            id="prep-edit-title"
            className="tp-heading-03 text-text-primary flex-1 min-w-0 truncate"
          >
            Prep editing
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close prep edit"
            className="flex shrink-0 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-[var(--color-icon-primary)] transition-ui hover:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2"
            style={{ padding: 14 }}
          >
            <IconClose />
          </button>
        </div>
        <p className="tp-body-02 text-text-secondary w-full" style={{ margin: 0 }}>
          Select the area you would like to rescan.
        </p>
      </div>

      {/* Buttons */}
      <div className="flex flex-col w-full" style={{ gap: 16 }}>
        {mode === "select" && (
          <PrepEditButton
            iconSrc={lassoIcon}
            label="Select and rescan"
            active
            onClick={onSelectAndRescan}
          />
        )}
        {mode === "selected" && (
          <>
            <PrepEditButton iconSrc={brushIcon} label="Rescan" active onClick={onRescan} />
            <PrepEditButton iconSrc={undoIcon} label="Undo Selection" onClick={onUndoSelection} />
          </>
        )}
        {mode === "disabled" && (
          <>
            <PrepEditButton iconSrc={brushDisabledIcon} label="Rescan" disabled />
            <PrepEditButton iconSrc={undoIcon} label="Undo Selection" onClick={onUndoSelection} />
          </>
        )}
      </div>
    </div>
  );
}
