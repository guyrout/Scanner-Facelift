/**
 * Fixed Restorative RX form — Figma 4069:82966.
 * Shown when user selects "Fixed restorative" from ProcedureTypeSelector.
 *
 * Sections (top → bottom, all inside a scrollable container):
 * 1. Treatment / Send-to / Due-date row
 * 2. Tooth chart with jaw diagram + legend + right-side placeholder
 * 3. Toggle row (NIRI capture, New sleeve attached, Multi bite, Pre-treatment)
 * 4. Attachments + Note cards
 */

import { useState, useRef, useEffect, useLayoutEffect, type CSSProperties, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { createPortal } from "react-dom";
import jawChartSvg from "../../assets/procedures/jaw-tooth-chart.svg";
import calendarSvg from "../../assets/procedures/calendar.svg";
import toothSprites from "../../assets/procedures/tooth-sprites.svg";
/** Figma 4515:194756 — TOOTH - large (1_implant_sel) */
import implantToothLarge from "../../assets/procedures/implant-tooth-large.svg";
import { AddEmptyIcon, CaretDownIcon, CaretUpIcon, CheckIcon, ChevronLeftIcon, ChevronRightSmallIcon } from "../Icons";
import CrownModal26A from "./CrownModal26A";

export const RESTORATION_TYPES = [
  { color: "#9F00A7", label: "Crown" },
  { color: "#5FD4C4", label: "Bridge" },
  { color: "#F5C563", label: "Veneer" },
  { color: "#F9A8D4", label: "Inlay" },
  { color: "#AB8ED9", label: "Onlay" },
  { color: "#6B8BF5", label: "Eggshell" },
  { color: "#7C3AED", label: "Mockup" },
  { color: "#D4D4D8", label: "Missing" },
  { color: "#EF4444", label: "Implant based" },
];

export const TREATMENT_OPTIONS: { id: string; label: string }[] = [
  { id: "fixed-restorative", label: "Fixed restorative" },
  { id: "study-model", label: "Study Model/iRecord" },
  { id: "invisalign", label: "Invisalign/Vivera" },
  { id: "appliance", label: "Appliance" },
  { id: "dentures-removable", label: "Dentures / Removable" },
  { id: "surgical-guide", label: "Scan for surgical guide" },
];

export const SEND_TO_OPTIONS: { id: string; label: string }[] = [
  { id: "", label: "Select an option" },
  { id: "lab-a", label: "Lab A" },
  { id: "lab-b", label: "Lab B" },
  { id: "lab-c", label: "Lab C" },
];

export const SPEC_OPTIONS: { id: string; label: string }[] = [
  { id: "", label: "Specification" },
  { id: "pfm-pfz", label: "PFM/PFZ" },
  { id: "full-ceramic", label: "Full Ceramic" },
  { id: "full-gold", label: "Full Gold" },
  { id: "full-metal", label: "Full Metal" },
  { id: "temporary", label: "Temporary" },
];

export const MATERIAL_OPTIONS: { id: string; label: string }[] = [
  { id: "", label: "Material" },
  { id: "zirconia", label: "Zirconia" },
  { id: "lithium-disilicate", label: "Lithium Disilicate" },
  { id: "emax", label: "E.max" },
  { id: "porcelain", label: "Porcelain" },
  { id: "composite", label: "Composite" },
];

export const SHADE_OPTIONS: { id: string; label: string }[] = [
  { id: "", label: "Shade system" },
  { id: "vita-lumin", label: "Vita Lumin" },
  { id: "vita-3d", label: "Vita 3D Master" },
  { id: "chromascop", label: "Chromascop" },
];

export const BODY_OPTIONS: { id: string; label: string }[] = [
  { id: "", label: "Body" },
  { id: "a1", label: "A1" },
  { id: "a2", label: "A2" },
  { id: "a3", label: "A3" },
  { id: "a3.5", label: "A3.5" },
  { id: "b1", label: "B1" },
  { id: "b2", label: "B2" },
  { id: "b3", label: "B3" },
  { id: "c1", label: "C1" },
  { id: "c2", label: "C2" },
  { id: "d2", label: "D2" },
  { id: "d3", label: "D3" },
];

export const IMPLANT_CASE_OPTIONS: { id: string; label: string }[] = [
  { id: "", label: "Select case" },
  { id: "case-a", label: "Case A" },
  { id: "case-b", label: "Case B" },
  { id: "case-c", label: "Case C" },
];

/** Implant Based modal — Figma 4515:194320 (UI-Refresh-2026 Q2) */
export const IMPLANT_MANUFACTURER_OPTIONS: { id: string; label: string }[] = [
  { id: "", label: "Select an option" },
  { id: "straumann", label: "Straumann® Group" },
];

export const IMPLANT_CONNECTION_OPTIONS: { id: string; label: string }[] = [
  { id: "", label: "Select an option" },
  { id: "internal-hex", label: "Internal hex" },
];

export const IMPLANT_DIAMETER_PLATFORM_OPTIONS: { id: string; label: string }[] = [
  { id: "", label: "Select an option" },
  { id: "29mm", label: "2.9 mm" },
];

export const IMPLANT_SCAN_BODY_TYPE_OPTIONS: { id: string; label: string }[] = [
  { id: "", label: "Select an option" },
  { id: "bioabutment", label: "BioAbutment" },
];

export const RESTORATION_TYPE_OPTIONS: { id: string; label: string }[] = [
  { id: "", label: "Select an option" },
  { id: "crown", label: "Crown" },
  { id: "bridge", label: "Bridge" },
  { id: "veneer", label: "Veneer" },
];

export const ABUTMENT_MATERIAL_OPTIONS: { id: string; label: string }[] = [
  { id: "", label: "Select an option" },
  { id: "titanium", label: "Titanium" },
  { id: "zirconia", label: "Zirconia" },
  { id: "gold", label: "Gold" },
];

export const ABUTMENT_TYPE_OPTIONS: { id: string; label: string }[] = [
  { id: "", label: "Select an option" },
  { id: "stock", label: "Stock" },
  { id: "custom", label: "Custom" },
];

export const UPPER_TEETH = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
export const LOWER_TEETH = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];
export const TOOTH_X = [32, 106, 182, 256, 329, 403, 477, 550, 618, 692, 766, 840, 914, 988, 1062, 1136];

export type SpriteRect = [x: number, y: number, w: number, h: number];
export const SPRITE_W = 530;
export const SPRITE_H = 4205;

export const TOOTH_SPRITES: Record<number, Partial<Record<string, SpriteRect>>> = {
  18: { Crown: [163, -1, 58, 93], Missing: [234, -1, 58, 93], "Implant based": [301, -1, 58, 93], Select: [98, -1, 58, 93] },
  17: { Crown: [163, 124, 58, 93], Missing: [234, 124, 58, 93], "Implant based": [301, 134, 58, 93], Select: [94, 124, 58, 93] },
  16: { Crown: [163, 240, 58, 95], Missing: [234, 239, 58, 95], "Implant based": [301, 249, 58, 95], Select: [94, 242, 58, 95] },
  15: { Crown: [163, 367, 58, 110], Missing: [234, 369, 58, 96], "Implant based": [301, 368, 58, 110], Select: [94, 369, 58, 95] },
  14: { Crown: [163, 492, 58, 102], Missing: [234, 488, 58, 106], "Implant based": [301, 498, 58, 106], Select: [94, 488, 58, 102] },
  13: { Crown: [163, 616, 58, 102], Missing: [234, 619, 58, 102], "Implant based": [301, 629, 58, 102], Select: [94, 616, 58, 102] },
  12: { Crown: [163, 744, 58, 102], Missing: [234, 741, 58, 102], "Implant based": [301, 751, 58, 102], Select: [94, 744, 58, 102] },
  11: { Crown: [163, 867, 58, 102], Missing: [234, 868, 58, 102], "Implant based": [301, 878, 58, 102], Select: [94, 866, 58, 102] },
  21: { Crown: [163, 978, 58, 102], Missing: [231, 977, 58, 102], "Implant based": [301, 987, 58, 102], Select: [94, 979, 58, 102] },
  22: { Crown: [163, 1111, 58, 102], Missing: [234, 1111, 58, 102], "Implant based": [301, 1121, 58, 102], Select: [94, 1111, 58, 102] },
  23: { Crown: [163, 1224, 58, 102], Missing: [234, 1226, 58, 102], "Implant based": [301, 1236, 58, 102], Select: [94, 1227, 58, 102] },
  24: { Crown: [163, 1364, 58, 102], Missing: [234, 1365, 58, 102], "Implant based": [301, 1375, 58, 102], Select: [94, 1364, 58, 102] },
  25: { Crown: [163, 1492, 58, 102], Missing: [234, 1492, 58, 102], "Implant based": [301, 1502, 58, 102], Select: [94, 1492, 58, 102] },
  26: { Crown: [163, 1615, 58, 102], Missing: [234, 1615, 58, 102], "Implant based": [301, 1625, 58, 102], Select: [94, 1615, 58, 102] },
  27: { Crown: [163, 1734, 58, 102], Missing: [234, 1734, 58, 102], "Implant based": [301, 1744, 58, 102], Select: [94, 1734, 58, 102] },
  28: { Crown: [163, 1867, 58, 102], Missing: [232, 1867, 58, 102], "Implant based": [301, 1877, 58, 102], Select: [94, 1867, 58, 102] },
  48: { Crown: [165, 1977, 58, 102], Missing: [232, 1977, 58, 102], "Implant based": [301, 1987, 58, 102], Select: [96, 1977, 58, 102] },
  47: { Crown: [163, 2079, 58, 102], Missing: [232, 2079, 58, 102], "Implant based": [301, 2077, 58, 102], Select: [96, 2079, 58, 102] },
  46: { Crown: [163, 2169, 58, 102], Missing: [232, 2169, 58, 102], "Implant based": [301, 2167, 58, 102], Select: [96, 2172, 58, 102] },
  45: { Crown: [213, 2285, 58, 99], Missing: [284, 2287, 58, 97], "Implant based": [351, 2285, 58, 97], Select: [144, 2285, 58, 99] },
  44: { Crown: [164, 2398, 58, 102], Missing: [232, 2399, 58, 102], "Implant based": [301, 2407, 58, 102], Select: [95, 2398, 58, 102] },
  43: { Crown: [164, 2532, 58, 102], Missing: [232, 2532, 58, 102], "Implant based": [301, 2540, 58, 102], Select: [95, 2532, 58, 102] },
  42: { Crown: [163, 2665, 58, 102], Missing: [232, 2665, 58, 102], "Implant based": [301, 2673, 58, 102], Select: [95, 2666, 58, 102] },
  41: { Select: [95, 2788, 58, 102] },
  31: { Crown: [163, 2910, 58, 102], Missing: [231, 2910, 58, 102], "Implant based": [301, 2918, 58, 102], Select: [102, 2910, 58, 102] },
  32: { Crown: [166, 3030, 58, 102], Missing: [234, 3031, 58, 102], "Implant based": [301, 3039, 58, 102], Select: [100, 3031, 58, 102] },
  33: { Crown: [169, 3149, 58, 102], Missing: [238, 3149, 58, 102], "Implant based": [301, 3157, 58, 102], Select: [102, 3149, 58, 102] },
  34: { Crown: [170, 3276, 58, 102], Missing: [241, 3276, 58, 102], "Implant based": [301, 3284, 58, 102], Select: [108, 3274, 58, 102] },
  35: { Crown: [169, 3410, 58, 102], Missing: [234, 3410, 58, 102], "Implant based": [301, 3418, 58, 102], Select: [100, 3409, 58, 102] },
  36: { Crown: [169, 3544, 58, 102], Missing: [234, 3544, 58, 102], "Implant based": [301, 3552, 58, 102], Select: [100, 3544, 58, 102] },
  37: { Crown: [176, 3670, 58, 102], Missing: [238, 3669, 58, 102], "Implant based": [301, 3677, 58, 102], Select: [107, 3669, 58, 102] },
  38: { Crown: [169, 3779, 58, 102], Missing: [238, 3773, 58, 102], "Implant based": [301, 3781, 58, 102], Select: [100, 3779, 58, 102] },
};

export interface DropdownFieldProps {
  id: string;
  label?: string;
  /** When `label` is omitted, used as the trigger’s accessible name (otherwise falls back to `label`). */
  ariaLabel?: string;
  value: string;
  options: { id: string; label: string }[];
  onChange: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  error?: boolean;
  errorText?: string;
  /** Optional z-index for the listbox (e.g. 10001 in modals so menu appears above overlay) */
  listZIndex?: number;
  /** Use layer-02 background to match DatePickerField in top row */
  backgroundVariant?: "layer-01" | "layer-02";
  /** When true, no border (stroke) is shown on the trigger button */
  hideBorder?: boolean;
  /** Optional icon or element shown before the selected label in the trigger (e.g. Study model artwork). */
  triggerLeading?: ReactNode;
  /** When true, the trigger is non-interactive and the list does not open. */
  disabled?: boolean;
  /** When set, shown in the trigger instead of the selected option label (e.g. disabled placeholder). */
  placeholderOverride?: string;
}

const dropdownListContent = (
  id: string,
  value: string,
  options: { id: string; label: string }[],
  onChange: (id: string) => void,
  listStyle: CSSProperties
) => (
  <ul
    role="listbox"
    aria-labelledby={`dropdown-${id}`}
    data-dropdown-portal=""
    className="flex max-h-[min(15rem,calc(100svh-8rem))] min-h-0 flex-col rounded-lg border border-border-subtle bg-[var(--color-background-layer-01)] [&>li+li]:border-t [&>li+li]:border-border-subtle scrollbar-table-y"
    style={listStyle}
  >
    {options.map((opt) => (
      <li key={opt.id} role="option" aria-selected={opt.id === value}>
        <button
          type="button"
          onClick={() => onChange(opt.id)}
          className={`flex w-full items-center gap-3 text-left transition-ui focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-border-focus)] text-text-primary ${
            opt.id === value ? "bg-[var(--color-background-layer-02)]" : "hover:bg-[var(--color-background-layer-hovered)]"
          }`}
          style={{ padding: "16px 16px", height: 60 }}
        >
          {opt.id === value ? (
            <CheckIcon size={24} color="var(--color-icon-primary)" className="shrink-0" />
          ) : (
            <span className="w-6 shrink-0" aria-hidden />
          )}
          <span className="tp-body-02 truncate">{opt.label}</span>
        </button>
      </li>
    ))}
  </ul>
);

export function DropdownField({
  id,
  label,
  ariaLabel,
  value,
  options,
  onChange,
  isOpen,
  onToggle,
  error,
  errorText,
  listZIndex,
  backgroundVariant = "layer-01",
  hideBorder = false,
  triggerLeading,
  disabled = false,
  placeholderOverride,
}: DropdownFieldProps) {
  const selected = options.find((o) => o.id === value);
  const displayLabel = placeholderOverride ?? selected?.label ?? value;
  const isPlaceholder = placeholderOverride != null || !selected || selected.id === "";
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [portalPosition, setPortalPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const bgLayer = backgroundVariant === "layer-02" ? "var(--color-background-layer-02)" : "var(--color-background-layer-01)";

  useLayoutEffect(() => {
    if (isOpen && listZIndex != null && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPortalPosition({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    } else {
      setPortalPosition(null);
    }
  }, [isOpen, listZIndex]);

  const usePortal = isOpen && listZIndex != null;

  return (
    <div className="relative flex flex-col flex-1 min-w-0 w-full">
      {label && (
        <div style={{ paddingBottom: 8 }}>
          <span className="tp-body-01 text-text-secondary">{label}</span>
        </div>
      )}
      <button
        ref={buttonRef}
        type="button"
        id={`dropdown-${id}`}
        disabled={disabled}
        onClick={disabled ? undefined : onToggle}
        aria-expanded={disabled ? false : isOpen}
        aria-haspopup="listbox"
        aria-disabled={disabled}
        aria-label={ariaLabel ?? label ?? "Select"}
        className={`flex items-center justify-between w-full overflow-clip text-left transition-ui focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 ${
          disabled
            ? "cursor-not-allowed opacity-60"
            : "hover:bg-[var(--color-background-layer-hovered)]"
        } ${!hideBorder && backgroundVariant === "layer-02" ? "border border-border-subtle bg-[var(--color-background-layer-02)]" : ""}`}
        style={{
          backgroundColor: backgroundVariant === "layer-02" ? (hideBorder ? bgLayer : undefined) : (isOpen && backgroundVariant === "layer-01" ? "var(--color-background-layer-01)" : bgLayer),
          borderRadius: 8,
          border: hideBorder ? "none" : (backgroundVariant === "layer-02" ? undefined : (error
            ? "1px solid var(--color-border-error, #d43f58)"
            : isOpen
              ? "1px solid var(--color-border-interactive)"
              : "1px solid var(--color-border-subtle)")),
          padding: "16px 16px",
          gap: 8,
          minHeight: 60,
          borderColor: !hideBorder && backgroundVariant === "layer-02" ? (error ? "var(--color-border-error, #d43f58)" : isOpen ? "var(--color-border-interactive)" : undefined) : undefined,
        }}
      >
        <div className="flex min-w-0 flex-1 items-center" style={{ gap: 8 }}>
          {triggerLeading}
          <span
            className={`tp-body-02 min-w-0 flex-1 truncate ${
              isPlaceholder ? "text-text-tertiary" : "text-text-primary"
            }`}
          >
            {displayLabel}
          </span>
        </div>
        <span className="shrink-0 text-[var(--color-icon-primary)]">
          {isOpen ? (
            <CaretUpIcon size={24} color="var(--color-icon-primary)" className="shrink-0" />
          ) : (
            <CaretDownIcon size={24} color="var(--color-icon-secondary)" className="shrink-0" />
          )}
        </span>
      </button>
      {error && errorText && (
        <div style={{ paddingTop: 8 }}>
          <span className="tp-label-01 text-[var(--color-text-error,#d43f58)]">{errorText}</span>
        </div>
      )}
      {isOpen && !disabled && usePortal && portalPosition && createPortal(
        dropdownListContent(id, value, options, onChange, {
          position: "fixed",
          top: portalPosition.top,
          left: portalPosition.left,
          width: portalPosition.width,
          zIndex: listZIndex,
          boxShadow: "var(--shadow-card)",
        }),
        document.body
      )}
      {isOpen && !disabled && !usePortal && (
        <ul
          role="listbox"
          aria-labelledby={`dropdown-${id}`}
          className="absolute left-0 right-0 top-full mt-1 flex max-h-[min(15rem,calc(100svh-8rem))] min-h-0 flex-col rounded-lg border border-border-subtle bg-[var(--color-background-layer-01)] [&>li+li]:border-t [&>li+li]:border-border-subtle scrollbar-table-y"
          style={{ boxShadow: "var(--shadow-card)", zIndex: listZIndex ?? 20 }}
        >
          {options.map((opt) => (
            <li key={opt.id} role="option" aria-selected={opt.id === value}>
              <button
                type="button"
                onClick={() => onChange(opt.id)}
                className={`flex w-full items-center gap-3 text-left transition-ui focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-border-focus)] text-text-primary ${
                  opt.id === value ? "bg-[var(--color-background-layer-02)]" : "hover:bg-[var(--color-background-layer-hovered)]"
                }`}
                style={{ padding: "16px 16px", height: 60 }}
              >
                {opt.id === value ? (
                  <CheckIcon size={24} color="var(--color-icon-primary)" className="shrink-0" />
                ) : (
                  <span className="w-6 shrink-0" aria-hidden />
                )}
                <span className="tp-body-02 truncate">{opt.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function formatDateMmDdYyyy(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}.${dd}.${yyyy}`;
}

function getCalendarDays(year: number, month: number): (number | null)[] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startDay = first.getDay();
  const daysInMonth = last.getDate();
  const result: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) result.push(null);
  for (let d = 1; d <= daysInMonth; d++) result.push(d);
  return result;
}

/** Month step that keeps the day-of-month when possible (avoids Date rollover quirks). */
function addMonthsPreserveDay(date: Date, delta: number): Date {
  const day = date.getDate();
  const next = new Date(date.getFullYear(), date.getMonth() + delta, 1);
  const lastDayOfMonth = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
  next.setDate(Math.min(day, lastDayOfMonth));
  return next;
}

function setYearKeepingMonthAndDay(d: Date, year: number): Date {
  const m = d.getMonth();
  const day = d.getDate();
  const last = new Date(year, m + 1, 0).getDate();
  return new Date(year, m, Math.min(day, last));
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const MONTH_ABBREVS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Year picker range — Figma 21235:30460 (scrollable 4-column grid). */
const YEAR_PICKER_MIN = 1900;
const YEAR_PICKER_MAX = 2026;
const YEAR_PICKER_YEARS: number[] = (() => {
  const ys: number[] = [];
  for (let y = YEAR_PICKER_MIN; y <= YEAR_PICKER_MAX; y++) ys.push(y);
  return ys;
})();

export interface DatePickerFieldProps {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** Accessible name for the calendar popover (default: choose due date). */
  calendarAriaLabel?: string;
}

export function DatePickerField({
  label,
  value,
  onChange,
  isOpen,
  onToggle,
  onClose,
  containerRef,
  calendarAriaLabel = "Choose due date",
}: DatePickerFieldProps) {
  const [viewDate, setViewDate] = useState(() => value ?? new Date());
  const [calendarPanel, setCalendarPanel] = useState<"days" | "months" | "years">("days");
  const yearScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setCalendarPanel("days");
      return;
    }
    setViewDate((d) => value ?? d);
    setCalendarPanel("days");
  }, [isOpen, value]);

  useLayoutEffect(() => {
    if (!isOpen || calendarPanel !== "years") return;
    const root = yearScrollRef.current;
    if (!root) return;
    const y = viewDate.getFullYear();
    const el = root.querySelector<HTMLElement>(`[data-year="${y}"]`);
    el?.scrollIntoView({ block: "nearest", behavior: "auto" });
  }, [isOpen, calendarPanel, viewDate]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, onClose, containerRef]);

  const displayValue = value ? formatDateMmDdYyyy(value) : "mm.dd.yyyy";
  const days = getCalendarDays(viewDate.getFullYear(), viewDate.getMonth());

  function goPrevMonth() {
    setViewDate((d) => addMonthsPreserveDay(d, -1));
  }
  function goNextMonth() {
    setViewDate((d) => addMonthsPreserveDay(d, 1));
  }
  function goPrevYear() {
    setViewDate((d) => setYearKeepingMonthAndDay(d, d.getFullYear() - 1));
  }
  function goNextYear() {
    setViewDate((d) => setYearKeepingMonthAndDay(d, d.getFullYear() + 1));
  }
  function selectMonth(monthIndex: number) {
    setViewDate((d) => {
      const y = d.getFullYear();
      const last = new Date(y, monthIndex + 1, 0).getDate();
      const day = Math.min(d.getDate(), last);
      return new Date(y, monthIndex, day);
    });
    setCalendarPanel("days");
  }
  function selectYear(year: number) {
    setViewDate((d) => setYearKeepingMonthAndDay(d, year));
    setCalendarPanel("months");
  }
  function selectDay(day: number) {
    const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    onChange(d);
    onClose();
  }
  /** Days → months → years; year header returns to months (Figma 21235:30460 / 30660). */
  function onCalendarHeaderClick() {
    setCalendarPanel((p) => {
      if (p === "days") return "months";
      if (p === "months") return "years";
      if (p === "years") return "months";
      return "days";
    });
  }

  const triggerAriaLabel = label.trim() || calendarAriaLabel;

  return (
    <div ref={containerRef} className="relative flex flex-col flex-1 min-w-0">
      {label ? (
        <div style={{ paddingBottom: 8 }}>
          <span className="tp-body-01 text-text-secondary">{label}</span>
        </div>
      ) : null}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={triggerAriaLabel}
        className="flex items-center justify-between w-full overflow-clip text-left border border-border-subtle bg-[var(--color-background-layer-02)] transition-ui focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 hover:bg-[var(--color-background-layer-hovered)]"
        style={{
          borderRadius: 8,
          padding: "16px 16px",
          gap: 8,
          height: 60,
          borderColor: isOpen ? "var(--color-border-interactive)" : undefined,
        }}
      >
        <span
          className={`tp-body-02 flex-1 min-w-0 text-left ${
            value ? "text-text-primary" : "text-text-tertiary"
          }`}
        >
          {displayValue}
        </span>
        <img src={calendarSvg} alt="" aria-hidden width={24} height={24} className="shrink-0" />
      </button>
      {isOpen && (
        <div
          role="dialog"
          aria-label={calendarAriaLabel}
          className="absolute left-0 top-full z-20 mt-1 flex flex-col items-start overflow-clip bg-[var(--color-background-elevated)]"
          style={{
            borderRadius: 8,
            boxShadow: "0px 2px 12px 0px rgba(0,0,0,0.13)",
            width: 375,
            minHeight: calendarPanel === "months" || calendarPanel === "years" ? 350 : undefined,
          }}
        >
          {calendarPanel === "years" ? (
            /* Year picker header — Figma 21235:30460: centered year only, no chevrons */
            <div
              className="flex items-center justify-center w-full border-b border-border-subtle overflow-clip"
              style={{ padding: "12px 16px" }}
            >
              <button
                type="button"
                onClick={onCalendarHeaderClick}
                aria-label="Back to month selection"
                className="flex min-w-0 items-center justify-center rounded transition-ui hover:bg-[var(--color-background-layer-hovered)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] cursor-pointer bg-transparent border-0 appearance-none"
                style={{ padding: "4px 8px" }}
              >
                <span className="tp-headling-02 text-text-primary text-center whitespace-nowrap">
                  {viewDate.getFullYear()}
                </span>
              </button>
            </div>
          ) : (
            /* Day / month header — Figma 21235:30660 */
            <div
              className="flex items-center w-full border-b border-border-subtle overflow-clip"
              style={{ padding: "12px 16px", gap: 8 }}
            >
              <button
                type="button"
                onClick={calendarPanel === "days" ? goPrevMonth : goPrevYear}
                aria-label={calendarPanel === "days" ? "Previous month" : "Previous year"}
                className="flex items-center justify-center shrink-0 rounded transition-ui hover:bg-[var(--color-background-layer-hovered)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] cursor-pointer bg-transparent border-0 appearance-none"
                style={{ width: 24, height: 24 }}
              >
                <ChevronLeftIcon size={24} color="var(--color-icon-primary)" />
              </button>
              <button
                type="button"
                onClick={onCalendarHeaderClick}
                aria-expanded={calendarPanel !== "days"}
                aria-label={
                  calendarPanel === "days" ? "Choose month" : "Choose year"
                }
                className="flex flex-1 min-w-0 items-center justify-center rounded transition-ui hover:bg-[var(--color-background-layer-hovered)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] cursor-pointer bg-transparent border-0 appearance-none"
                style={{ gap: 8, padding: "4px 8px" }}
              >
                <span className="tp-headling-02 text-text-primary text-center whitespace-nowrap truncate">
                  {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
                </span>
                <CaretDownIcon size={24} color="var(--color-icon-primary)" className="shrink-0" />
              </button>
              <button
                type="button"
                onClick={calendarPanel === "days" ? goNextMonth : goNextYear}
                aria-label={calendarPanel === "days" ? "Next month" : "Next year"}
                className="flex items-center justify-center shrink-0 rounded transition-ui hover:bg-[var(--color-background-layer-hovered)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] cursor-pointer bg-transparent border-0 appearance-none"
                style={{ width: 24, height: 24 }}
              >
                <ChevronRightSmallIcon size={24} color="var(--color-icon-primary)" />
              </button>
            </div>
          )}

          {calendarPanel === "days" ? (
            <div className="w-full" style={{ padding: 8 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((wd) => (
                  <div
                    key={wd}
                    className="flex items-center justify-center"
                    style={{ height: 36, padding: 4 }}
                  >
                    <span className="tp-body-01 text-text-tertiary text-center">{wd}</span>
                  </div>
                ))}
                {(() => {
                  const padded = [...days];
                  while (padded.length % 7 !== 0) padded.push(null);
                  const now = new Date();
                  return padded.map((day, i) => {
                    if (day === null) {
                      return <div key={`e-${i}`} style={{ height: 52 }} />;
                    }
                    const isSelected =
                      value &&
                      value.getDate() === day &&
                      value.getMonth() === viewDate.getMonth() &&
                      value.getFullYear() === viewDate.getFullYear();
                    const isToday =
                      day === now.getDate() &&
                      viewDate.getMonth() === now.getMonth() &&
                      viewDate.getFullYear() === now.getFullYear();
                    return (
                      <div
                        key={day}
                        className="flex items-center justify-center"
                        style={{ height: 52 }}
                      >
                        <button
                          type="button"
                          onClick={() => selectDay(day)}
                          className={`flex flex-col items-center justify-center cursor-pointer border-0 appearance-none outline-none transition-ui focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] bg-transparent hover:bg-[var(--color-background-layer-hovered)] ${isToday ? "ring-1 ring-[var(--color-border-subtle)]" : ""}`}
                          style={{ width: 44, height: 44, borderRadius: 8 }}
                        >
                          <span
                            className={`tp-body-01 text-center ${
                              isSelected ? "text-[var(--color-text-interactive)]" : "text-text-primary"
                            }`}
                          >
                            {day}
                          </span>
                          {isSelected && (
                            <div
                              style={{
                                width: 16,
                                height: 2,
                                borderRadius: 1,
                                backgroundColor: "var(--color-border-interactive)",
                                marginTop: 2,
                              }}
                            />
                          )}
                        </button>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          ) : calendarPanel === "months" ? (
            /* Month grid — Figma 21235:30660, 4×3, abbreviations + interactive underline */
            <div className="w-full flex-1 min-h-0" style={{ padding: 8 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                }}
              >
                {MONTH_ABBREVS.map((abbr, monthIndex) => {
                  const isActiveMonth = viewDate.getMonth() === monthIndex;
                  return (
                    <div
                      key={abbr}
                      className="flex items-center justify-center"
                      style={{ minHeight: 52, padding: 4 }}
                    >
                      <button
                        type="button"
                        onClick={() => selectMonth(monthIndex)}
                        className="flex flex-col items-center justify-center cursor-pointer border-0 appearance-none outline-none transition-ui focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] bg-transparent hover:bg-[var(--color-background-layer-hovered)]"
                        style={{ width: 50, height: 50, borderRadius: 8 }}
                      >
                        <span
                          className={`tp-body-01 text-center ${isActiveMonth ? "text-[var(--color-text-interactive)]" : "text-text-primary"}`}
                        >
                          {abbr}
                        </span>
                        {isActiveMonth && (
                          <div
                            style={{
                              width: 24,
                              height: 2,
                              borderRadius: 1,
                              backgroundColor: "var(--color-border-interactive)",
                              marginTop: 4,
                            }}
                          />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Year grid — Figma 21235:30460: scrollable 4-col, tp-body-01, underline on active year */
            <div
              ref={yearScrollRef}
              className="w-full min-h-0 scrollbar-table-y"
              style={{ padding: 8, maxHeight: 319, overflowY: "auto" }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
                {YEAR_PICKER_YEARS.map((year) => {
                  const isActiveYear = viewDate.getFullYear() === year;
                  return (
                    <div
                      key={year}
                      className="flex items-center justify-center"
                      style={{ minHeight: 52, padding: 4 }}
                    >
                      <button
                        type="button"
                        data-year={year}
                        onClick={() => selectYear(year)}
                        className="flex flex-col items-center justify-center cursor-pointer border-0 appearance-none outline-none transition-ui focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] bg-transparent hover:bg-[var(--color-background-layer-hovered)]"
                        style={{ width: 50, height: 50, borderRadius: 8 }}
                      >
                        <span
                          className={`tp-body-01 text-center ${isActiveYear ? "text-[var(--color-text-interactive)]" : "text-text-primary"}`}
                        >
                          {year}
                        </span>
                        {isActiveYear && (
                          <div
                            style={{
                              width: 24,
                              height: 2,
                              borderRadius: 1,
                              backgroundColor: "var(--color-border-interactive)",
                              marginTop: 4,
                            }}
                          />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function ToggleSwitch({ label, checked, onChange }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      className="flex items-center shrink-0 cursor-pointer border-0 appearance-none bg-transparent outline-none"
      style={{ gap: 8, height: 60, padding: "0 16px" }}
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
    >
      <div
        className="shrink-0 relative"
        style={{
          width: 51.2,
          height: 32,
          borderRadius: 16,
          backgroundColor: checked ? "var(--color-border-interactive)" : "var(--color-border-subtle)",
          transition: "background-color 200ms ease",
        }}
      >
        <div
          className="absolute"
          style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            backgroundColor: "#fff",
            top: 3,
            left: checked ? 22.2 : 3,
            transition: "left 200ms ease",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          }}
        />
      </div>
      <span className="tp-body-02 text-text-primary whitespace-nowrap">{label}</span>
    </button>
  );
}

/** Figma 4228:69379 — checkbox item (24×24, gap 8px, tp-body-02 label, padding 18px vertical) */
export interface CheckboxItemProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function CheckboxItem({ label, checked, onChange }: CheckboxItemProps) {
  return (
    <label
      className="flex items-center cursor-pointer border-0 appearance-none bg-transparent outline-none w-full"
      style={{ gap: 8, paddingTop: 18, paddingBottom: 18 }}
    >
      <span
        className="shrink-0 flex items-center justify-center"
        style={{
          width: 24,
          height: 24,
          borderRadius: 4,
          border: "1px solid var(--color-border-strong, #121212)",
          backgroundColor: checked ? "var(--color-background-brand, #009ace)" : "var(--color-background-layer-01, #fff)",
          transition: "background-color 200ms ease, border-color 200ms ease",
        }}
        aria-hidden
      >
        {checked && <CheckIcon size={16} color="#fff" />}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
        aria-label={label}
      />
      <span className="tp-body-02 text-text-primary flex-1 min-w-0">{label}</span>
    </label>
  );
}

export interface ToothDetail {
  specification: string;
  material: string;
  shadeSystem: string;
  body: string;
}

export interface ToggleState {
  niri: boolean;
  sleeve: boolean;
  /** Study model Scan Options — middle column (Palatal & gingival feedback). */
  palatalGingivalFeedback: boolean;
  multiBite: boolean;
  preTreatment: boolean;
  /** Study model Info Order — Ortho Model/iCast row (not shown in fixed restorative toggles). */
  orthoModelICast: boolean;
}

export interface FixedRestorativeFormProps {
  treatmentId: string;
  setTreatmentId: Dispatch<SetStateAction<string>>;
  sendToId: string;
  setSendToId: Dispatch<SetStateAction<string>>;
  dueDate: Date | null;
  setDueDate: Dispatch<SetStateAction<Date | null>>;
  toothSelections: Record<number, string>;
  setToothSelections: Dispatch<SetStateAction<Record<number, string>>>;
  toothDetails: Record<number, ToothDetail>;
  setToothDetails: Dispatch<SetStateAction<Record<number, ToothDetail>>>;
  toggles: ToggleState;
  setToggles: Dispatch<SetStateAction<ToggleState>>;
  noteText: string;
  setNoteText: Dispatch<SetStateAction<string>>;
  /** When true, hides the Treatment / Send-to / Due-date top row (shown elsewhere in the parent). */
  hideTopRow?: boolean;
  /** When true, hides the toggle row (shown as a separate card in the parent). */
  hideToggles?: boolean;
  /** When true, only the Attachments + Note cards are rendered (Study model / Invisalign RX flow). */
  attachmentsNoteOnly?: boolean;
}

export default function FixedRestorativeForm26A({
  treatmentId, setTreatmentId,
  sendToId, setSendToId,
  dueDate, setDueDate,
  toothSelections, setToothSelections,
  toothDetails, setToothDetails,
  toggles, setToggles,
  noteText, setNoteText,
  hideTopRow = false,
  hideToggles = false,
  attachmentsNoteOnly = false,
}: FixedRestorativeFormProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  /** Per-tooth contextual menu: which tooth is being assigned, and where on screen */
  const [toothContextMenu, setToothContextMenu] = useState<{ tooth: number; x: number; y: number } | null>(null);
  const [implantBaseModalOpen, setImplantBaseModalOpen] = useState(false);
  const [implantBaseModalTeeth, setImplantBaseModalTeeth] = useState<number[]>([]);
  const [, setImplantCaseByTooth] = useState<Record<number, string>>({});
  const [implantManufacturerId, setImplantManufacturerId] = useState("");
  const [implantConnectionId, setImplantConnectionId] = useState("");
  const [implantDiameterPlatformId, setImplantDiameterPlatformId] = useState("");
  const [implantScanBodyTypeId, setImplantScanBodyTypeId] = useState("");
  const [implantModalRestorationType, setImplantModalRestorationType] = useState("");
  const [implantModalCrownRowId, setImplantModalCrownRowId] = useState("crown");
  const [implantModalOpenDropdown, setImplantModalOpenDropdown] = useState<string | null>(null);
  const implantBaseModalRef = useRef<HTMLDivElement>(null);
  const [crownModalTooth, setCrownModalTooth] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const toothChartSvgRef = useRef<SVGSVGElement>(null);
  const toothContextMenuRef = useRef<HTMLUListElement>(null);

  function handleToothClick(toothNum: number, svgEl: SVGSVGElement, x: number, y: number) {
    // Open the contextual restoration-type menu for this tooth.
    const rect = svgEl.getBoundingClientRect();
    setToothContextMenu({
      tooth: toothNum,
      x: rect.left + (x / 1171) * rect.width,
      y: rect.top + (y / 277) * rect.height,
    });
  }

  function handleRemoveTooth(toothNum: number) {
    setToothSelections(prev => {
      const next = { ...prev };
      delete next[toothNum];
      return next;
    });
    setImplantCaseByTooth(prev => {
      const next = { ...prev };
      delete next[toothNum];
      return next;
    });
    if (crownModalTooth === toothNum) setCrownModalTooth(null);
  }

  function getToothDetail(toothNum: number) {
    return toothDetails[toothNum] ?? { specification: "", material: "", shadeSystem: "", body: "" };
  }

  function updateToothDetail(toothNum: number, field: string, value: string) {
    setToothDetails(prev => ({
      ...prev,
      [toothNum]: { ...getToothDetail(toothNum), [field]: value },
    }));
  }

  const selectedTeethEntries = Object.entries(toothSelections).sort(
    ([a], [b]) => Number(a) - Number(b)
  );

  function resetImplantModalForm() {
    setImplantManufacturerId("");
    setImplantConnectionId("");
    setImplantDiameterPlatformId("");
    setImplantScanBodyTypeId("");
    setImplantModalRestorationType("");
    setImplantModalCrownRowId("crown");
    setImplantModalOpenDropdown(null);
  }

  function closeImplantModal() {
    setImplantBaseModalOpen(false);
    resetImplantModalForm();
  }

  function handleImplantBaseDone() {
    if (!implantManufacturerId) return;
    const idPieces = [
      IMPLANT_MANUFACTURER_OPTIONS.find((o) => o.id === implantManufacturerId)?.label,
      IMPLANT_CONNECTION_OPTIONS.find((o) => o.id === implantConnectionId)?.label,
      IMPLANT_DIAMETER_PLATFORM_OPTIONS.find((o) => o.id === implantDiameterPlatformId)?.label,
      IMPLANT_SCAN_BODY_TYPE_OPTIONS.find((o) => o.id === implantScanBodyTypeId)?.label,
    ].filter((s): s is string => Boolean(s) && s !== "Select an option");
    const implantId = idPieces.join(" · ");
    setToothSelections(prev => {
      const next = { ...prev };
      implantBaseModalTeeth.forEach((t) => { next[t] = "Implant based"; });
      return next;
    });
    setImplantCaseByTooth(prev => {
      const next = { ...prev };
      implantBaseModalTeeth.forEach((t) => { next[t] = implantId; });
      return next;
    });
    closeImplantModal();
  }

  useEffect(() => {
    if (!openDropdown) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openDropdown]);

  useEffect(() => {
    if (!implantBaseModalOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (implantBaseModalRef.current && !implantBaseModalRef.current.contains(e.target as Node)) {
        closeImplantModal();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [implantBaseModalOpen]);

  useEffect(() => {
    if (!toothContextMenu) return;
    const handleClick = (e: MouseEvent) => {
      if (toothContextMenuRef.current && !toothContextMenuRef.current.contains(e.target as Node)) {
        setToothContextMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [toothContextMenu]);

  return (
    <>
    <div className="flex flex-col w-full" style={{ gap: 16 }}>
      {/* Sections 1–3 omitted for Study model flow (attachments + note only). */}
      {!attachmentsNoteOnly && (
      <>
      {/* Section 1: Dropdowns row — hidden when shown as a separate card above */}
      {!hideTopRow && (
      <div
        ref={dropdownRef}
        className="bg-[var(--color-background-layer-01)]"
        style={{ borderRadius: 8, padding: "16px 24px" }}
      >
        <div className="flex w-full" style={{ gap: 16 }}>
          <DropdownField
            id="treatment"
            label="Treatment"
            value={treatmentId}
            options={TREATMENT_OPTIONS}
            onChange={(id) => { setTreatmentId(id); setOpenDropdown(null); }}
            isOpen={openDropdown === "treatment"}
            onToggle={() => setOpenDropdown(openDropdown === "treatment" ? null : "treatment")}
            backgroundVariant="layer-02"
          />
          <DropdownField
            id="sendto"
            label="Send to"
            value={sendToId}
            options={SEND_TO_OPTIONS}
            onChange={(id) => { setSendToId(id); setOpenDropdown(null); }}
            isOpen={openDropdown === "sendto"}
            onToggle={() => setOpenDropdown(openDropdown === "sendto" ? null : "sendto")}
            backgroundVariant="layer-02"
          />
          <DatePickerField
            label="Due date"
            value={dueDate}
            onChange={setDueDate}
            isOpen={datePickerOpen}
            onToggle={() => setDatePickerOpen((o) => !o)}
            onClose={() => setDatePickerOpen(false)}
            containerRef={datePickerRef}
          />
        </div>
      </div>
      )}

      {/* Section 2: Interactive tooth chart — Figma 6171:2248 */}
      <div
        className="bg-surface w-full min-w-0 overflow-hidden"
        style={{
          borderRadius: 16,
          border: "1px solid var(--color-border-subtle)",
          boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
          padding: "28px 28px 32px 28px",
        }}
      >
        <h2 className="tp-heading-04 text-text-primary" style={{ fontSize: 24, lineHeight: "36px", marginBottom: 24 }}>
          Tooth Selector
        </h2>
        <div className="flex flex-col w-full min-h-0 items-stretch" style={{ gap: 0 }}>
          {/* Jaw chart — full width */}
          <div className="relative w-full shrink-0">
            <img src={jawChartSvg} alt="Tooth chart" style={{ width: "100%", height: "auto", display: "block" }} />
            <svg
              ref={toothChartSvgRef}
              viewBox="0 0 1171 277"
              className="tooth-chart-svg absolute inset-0 w-full h-full"
              aria-hidden
              focusable={false}
              tabIndex={-1}
            >
              <defs>
                <clipPath id="tooth-select-clip">
                  <rect x="0" y="0" width={58} height={105} rx={18} ry={18} />
                </clipPath>
                {/* Glow follows sprite / implant alpha — no rectangular selection stroke */}
                <filter id="tooth-sprite-glow-26a" x="-60%" y="-60%" width="220%" height="220%" colorInterpolationFilters="sRGB">
                  <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="var(--color-border-interactive, #009ace)" floodOpacity="0.95" />
                </filter>
                <filter id="tooth-sprite-glow-strong-26a" x="-80%" y="-80%" width="260%" height="260%" colorInterpolationFilters="sRGB">
                  <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="var(--color-border-interactive, #009ace)" floodOpacity="1" />
                </filter>
              </defs>
              {UPPER_TEETH.map((tooth, i) => {
                const x = TOOTH_X[i];
                const sel = toothSelections[tooth];
                const sprite = sel ? TOOTH_SPRITES[tooth]?.[sel] : undefined;
                const hasSpriteVisual = Boolean(sel && sprite);
                const contextHere = toothContextMenu?.tooth === tooth;
                const spriteFilter = hasSpriteVisual
                  ? (contextHere ? "url(#tooth-sprite-glow-strong-26a)" : "url(#tooth-sprite-glow-26a)")
                  : undefined;
                return (
                  <g
                    key={tooth}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToothClick(tooth, toothChartSvgRef.current!, x, 57);
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                    className="outline-none"
                    style={{ cursor: "pointer" }}
                    focusable={false}
                    tabIndex={-1}
                  >
                    <rect x={x - 29} y={5} width={58} height={105} fill="transparent" stroke="none" focusable={false} />
                    {hasSpriteVisual && (
                      <>
                        <rect x={x - 29} y={5} width={58} height={105} fill="var(--color-background-layer-01)" style={{ pointerEvents: "none" }} />
                        <g filter={spriteFilter}>
                          <svg x={x - 29} y={5} width={58} height={105} viewBox={`${sprite![0]} ${sprite![1]} ${sprite![2]} ${sprite![3]}`} style={{ pointerEvents: "none", overflow: "hidden" }}>
                            <image href={toothSprites} width={SPRITE_W} height={SPRITE_H} />
                          </svg>
                        </g>
                      </>
                    )}
                    {contextHere && !hasSpriteVisual && (
                      <circle
                        cx={x}
                        cy={57.5}
                        r={32}
                        fill="var(--color-border-interactive)"
                        fillOpacity={0.14}
                        style={{ pointerEvents: "none" }}
                      />
                    )}
                  </g>
                );
              })}
              {LOWER_TEETH.map((tooth, i) => {
                const x = TOOTH_X[i];
                const sel = toothSelections[tooth];
                const sprite = sel ? TOOTH_SPRITES[tooth]?.[sel] : undefined;
                const hasSpriteVisual = Boolean(sel && sprite);
                const contextHere = toothContextMenu?.tooth === tooth;
                const spriteFilter = hasSpriteVisual
                  ? (contextHere ? "url(#tooth-sprite-glow-strong-26a)" : "url(#tooth-sprite-glow-26a)")
                  : undefined;
                return (
                  <g
                    key={tooth}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToothClick(tooth, toothChartSvgRef.current!, x, 220);
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                    className="outline-none"
                    style={{ cursor: "pointer" }}
                    focusable={false}
                    tabIndex={-1}
                  >
                    <rect x={x - 29} y={167} width={58} height={105} fill="transparent" stroke="none" focusable={false} />
                    {hasSpriteVisual && (
                      <>
                        <rect x={x - 29} y={167} width={58} height={105} fill="var(--color-background-layer-01)" style={{ pointerEvents: "none" }} />
                        <g filter={spriteFilter}>
                          <svg x={x - 29} y={167} width={58} height={105} viewBox={`${sprite![0]} ${sprite![1]} ${sprite![2]} ${sprite![3]}`} style={{ pointerEvents: "none", overflow: "hidden" }}>
                            <image href={toothSprites} width={SPRITE_W} height={SPRITE_H} />
                          </svg>
                        </g>
                      </>
                    )}
                    {contextHere && !hasSpriteVisual && (
                      <circle
                        cx={x}
                        cy={219.5}
                        r={32}
                        fill="var(--color-border-interactive)"
                        fillOpacity={0.14}
                        style={{ pointerEvents: "none" }}
                      />
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

        </div>
      </div>

      {/* Section 2b: Treatment Information — separate card, shown when at least one tooth is assigned */}
      {selectedTeethEntries.length > 0 && (
        <div
          className="bg-surface w-full min-w-0 overflow-hidden"
          style={{
            borderRadius: 16,
            border: "1px solid var(--color-border-subtle)",
            boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
            padding: "28px 28px 32px 28px",
          }}
        >
          <span className="tp-heading-04 text-text-primary" style={{ display: "block", marginBottom: 16 }}>Treatment Information</span>

          {/* Column header */}
          <div className="flex w-full" style={{ paddingBottom: 8, borderBottom: "1px solid var(--color-border-subtle)" }}>
            <div className="flex-1 min-w-0"><span className="tp-body-02 font-medium text-text-primary">Tooth No.</span></div>
            <div className="flex-1 min-w-0"><span className="tp-body-02 font-medium text-text-primary">Treatment</span></div>
            <div className="flex-1 min-w-0"><span className="tp-body-02 font-medium text-text-primary">Material</span></div>
            <div className="flex-1 min-w-0">
              <span className="tp-body-02 font-medium text-text-primary">Preparation Design</span>
              <div><span className="tp-body-01 text-text-secondary" style={{ fontSize: 14 }}>Buccal/Lingual</span></div>
            </div>
            <div className="flex-1 min-w-0">
              <span className="tp-body-02 font-medium text-text-primary">Shade</span>
              <div><span className="tp-body-01 text-text-secondary" style={{ fontSize: 14 }}>Incisal/Body/Gingival</span></div>
            </div>
            <div className="flex-1 min-w-0" />
          </div>

          {/* Rows */}
          <div className="flex flex-col w-full" style={{ gap: 4, marginTop: 4 }}>
            {selectedTeethEntries.map(([num, category]) => {
              const toothNum = Number(num);
              const detail = getToothDetail(toothNum);
              const rt = RESTORATION_TYPES.find(r => r.label === category);
              const isCrownModalOpen = crownModalTooth === toothNum;
              const matLabel = MATERIAL_OPTIONS.find(o => o.id === detail.material)?.label ?? "-";
              const specLabel = SPEC_OPTIONS.find(o => o.id === detail.specification)?.label ?? "-/-";
              const shadeLabel = detail.shadeSystem || detail.body
                ? [SHADE_OPTIONS.find(o => o.id === detail.shadeSystem)?.label, BODY_OPTIONS.find(o => o.id === detail.body)?.label].filter(Boolean).join("/") || "-/-/-"
                : "-/-/-";

              return (
                <div
                  key={num}
                  className="flex w-full items-center"
                  style={{
                    border: "1px solid var(--color-border-subtle)",
                    borderRadius: 8,
                    padding: "16px 20px",
                    gap: 0,
                    background: isCrownModalOpen ? "var(--color-background-layer-02, #f5f5f5)" : "var(--color-surface, white)",
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <span className="tp-body-02 text-text-primary">{toothNum}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="tp-body-02 text-text-primary flex items-center gap-2">
                      {rt && <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", backgroundColor: rt.color, flexShrink: 0 }} />}
                      {category}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="tp-body-02 text-text-primary">{matLabel === "Material" ? "-" : matLabel}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="tp-body-02 text-text-primary">{specLabel === "Specification" ? "-/-" : specLabel}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="tp-body-02 text-text-primary">{shadeLabel}</span>
                  </div>
                  <div className="flex-1 min-w-0 flex items-center justify-end">
                    <button
                      type="button"
                      className="tp-body-02 bg-transparent border-0 cursor-pointer appearance-none outline-none hover:underline"
                      style={{ color: "var(--color-text-link, #009ace)", padding: 0 }}
                      onClick={() => setCrownModalTooth(toothNum)}
                    >
                      Show Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Section 3: Toggles — hidden when shown as a separate card above */}
      {!hideToggles && (
      <div
        className="bg-[var(--color-background-layer-01)]"
        style={{ borderRadius: 8, padding: "16px 24px" }}
      >
        <div className="flex items-center" style={{ gap: 64 }}>
          <ToggleSwitch
            label="NIRI capture"
            checked={toggles.niri}
            onChange={(v) => setToggles((p) => ({ ...p, niri: v }))}
          />
          <ToggleSwitch
            label="New sleeve attached"
            checked={toggles.sleeve}
            onChange={(v) => setToggles((p) => ({ ...p, sleeve: v }))}
          />
          <ToggleSwitch
            label="Multi bite"
            checked={toggles.multiBite}
            onChange={(v) => setToggles((p) => ({ ...p, multiBite: v }))}
          />
          <ToggleSwitch
            label="Pre-treatment"
            checked={toggles.preTreatment}
            onChange={(v) => setToggles((p) => ({ ...p, preTreatment: v }))}
          />
        </div>
      </div>
      )}
      </>
      )}

      {/* Section 4: Attachments + Note — Figma 6171:2250 / 6171:2251 */}
      <div className="flex flex-col" style={{ gap: 16 }}>
        {/* Attachments card — Figma 6171:2250 */}
        <div
          className="flex flex-col flex-1 min-w-0 bg-surface overflow-clip"
          style={{
            borderRadius: 16,
            border: "1px solid var(--color-border-subtle)",
            boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <div className="flex flex-col flex-1" style={{ padding: "28px 28px 28px 28px", gap: 16 }}>
            <span className="tp-heading-04 text-text-primary">Attachments</span>
            {/* Dashed upload area */}
            <div
              className="flex flex-col flex-1 items-center justify-center"
              style={{
                border: "1px dashed rgba(224, 224, 224, 1)",
                borderRadius: 4,
                padding: "14px",
                height: 276,
                minHeight: 276,
              }}
            >
              <div className="flex flex-col items-center" style={{ gap: 23 }}>
                <div className="flex flex-col items-center" style={{ gap: 16 }}>
                  {/* Attachment icon */}
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M21.0008 11.2192L11.9308 20.2892C10.9708 21.2492 9.67077 21.7892 8.31077 21.7892C6.95077 21.7892 5.65077 21.2492 4.69077 20.2892C3.73077 19.3292 3.19077 18.0292 3.19077 16.6692C3.19077 15.3092 3.73077 14.0092 4.69077 13.0492L13.7508 3.99922C14.3908 3.35922 15.2608 2.99922 16.1608 2.99922C17.0608 2.99922 17.9308 3.35922 18.5708 3.99922C19.2108 4.63922 19.5708 5.50922 19.5708 6.40922C19.5708 7.30922 19.2108 8.17922 18.5708 8.81922L9.50077 17.8792C9.18077 18.1992 8.74077 18.3792 8.29077 18.3792C7.84077 18.3792 7.40077 18.1992 7.08077 17.8792C6.76077 17.5592 6.58077 17.1192 6.58077 16.6692C6.58077 16.2192 6.76077 15.7792 7.08077 15.4592L15.4508 7.09922L14.3908 6.03922L6.02077 14.3992C5.42077 14.9992 5.08077 15.8092 5.08077 16.6592C5.08077 17.5092 5.42077 18.3192 6.02077 18.9192C6.62077 19.5192 7.43077 19.8592 8.28077 19.8592C9.13077 19.8592 9.94077 19.5192 10.5408 18.9192L19.6108 9.85922C20.6308 8.83922 21.2008 7.45922 21.2008 6.00922C21.2008 4.55922 20.6308 3.17922 19.6108 2.15922C18.5908 1.13922 17.2108 0.569219 15.7608 0.569219C14.3108 0.569219 12.9308 1.13922 11.9108 2.15922L2.84077 11.2292C1.49077 12.5792 0.740771 14.3892 0.740771 16.2892C0.740771 18.1892 1.49077 19.9992 2.84077 21.3492C4.19077 22.6992 6.00077 23.4492 7.90077 23.4492C9.80077 23.4492 11.6108 22.6992 12.9608 21.3492L22.0508 12.2592L21.0008 11.2192Z" fill="var(--color-icon-secondary)"/>
                  </svg>
                  <div className="flex flex-col items-center text-center" style={{ gap: 11 }}>
                    <span className="tp-body-02 text-text-secondary">Attachments Overview</span>
                    <span className="tp-body-01 text-text-tertiary">Easily upload and attach files to the RX</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 cursor-pointer bg-transparent appearance-none outline-none transition-ui hover:bg-[var(--color-background-layer-02)] focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]"
                  style={{
                    border: "2px solid var(--color-border-subtle)",
                    borderRadius: 8,
                    height: 64,
                    padding: "12px 32px",
                    minWidth: 72,
                  }}
                  aria-label="Add attachment"
                >
                  <AddEmptyIcon size={24} color="var(--color-icon-primary)" />
                  <span className="tp-body-02 text-text-primary">Add</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Note card — Figma 6171:2251 */}
        <div
          className="flex flex-col flex-1 min-w-0 bg-surface overflow-clip"
          style={{
            borderRadius: 16,
            border: "1px solid var(--color-border-subtle)",
            boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <div className="flex flex-col flex-1" style={{ padding: "28px 28px 28px 28px", gap: 39 }}>
            <div className="flex flex-col flex-1" style={{ gap: 12 }}>
              <span className="tp-heading-04 text-text-primary">Note</span>
              {/* Text area with label + counter */}
              <div className="flex flex-col flex-1 isolate" style={{ gap: 0 }}>
                <div className="flex items-start justify-between" style={{ paddingBottom: 8 }}>
                  <span className="tp-body-01 text-text-secondary">Optional text note here</span>
                  <span className="tp-label-01 text-text-secondary text-[16px]">{noteText.length}/100</span>
                </div>
                <textarea
                  className="flex-1 resize-none tp-body-02 text-text-primary placeholder:text-text-tertiary"
                  placeholder="Progress notes here"
                  maxLength={100}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  style={{
                    backgroundColor: "var(--color-background-layer-01)",
                    border: "1px solid rgba(224, 224, 224, 1)",
                    borderRadius: 8,
                    padding: "12px 16px",
                    outline: "none",
                    minHeight: 160,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Implant Based modal — Figma 4515:194320 (UI-Refresh-2026 Q2) */}
    {implantBaseModalOpen && createPortal(
      <div
        className="fixed inset-0 flex flex-col items-center justify-center"
        style={{
          zIndex: 9999,
          backgroundColor: "var(--color-background-overlay)",
          padding: "var(--spacing-06)",
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="implant-base-modal-title"
      >
        <div
          ref={implantBaseModalRef}
          className="flex flex-col bg-[var(--color-background-layer-01)] shrink-0 w-full max-w-[1156px] overflow-hidden"
          style={{
            borderRadius: 16,
            paddingTop: "var(--spacing-02)",
            paddingBottom: "var(--spacing-06)",
            paddingLeft: "var(--spacing-06)",
            paddingRight: "var(--spacing-06)",
            gap: "var(--spacing-06)",
            maxHeight: "min(920px, calc(100vh - 48px))",
            overflowY: "auto",
          }}
        >
          <div className="flex w-full min-w-0 flex-col" style={{ gap: 24 }}>
            {/* Header — back + title */}
            <div className="flex w-full items-center" style={{ gap: 4, height: 60 }}>
              <button
                type="button"
                onClick={closeImplantModal}
                className="flex shrink-0 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent appearance-none outline-none transition-ui hover:bg-[var(--color-background-layer-02)] focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]"
                style={{ width: 32, height: 32 }}
                aria-label="Back"
              >
                <ChevronLeftIcon size={32} color="var(--color-icon-primary)" />
              </button>
              <h2 id="implant-base-modal-title" className="tp-heading-03 min-w-0 flex-1 truncate text-text-primary">
                Implant Based
              </h2>
            </div>

            {/* Tooth strip + main row — gap 16 */}
            <div className="flex w-full flex-col" style={{ gap: 16 }}>
              <div
                className="flex w-full items-center justify-center border border-solid border-border-subtle bg-[var(--color-background-subtle-02,#f4f4f4)]"
                style={{ borderRadius: 4, minHeight: 146, paddingTop: 10, paddingBottom: 9 }}
              >
                <div className="flex w-full flex-col items-center justify-center" style={{ gap: 12, paddingLeft: 16, paddingRight: 16 }}>
                  {implantBaseModalTeeth.length === 0 ? (
                    <span className="tp-body-02 text-text-tertiary">—</span>
                  ) : (
                    <div className="flex flex-wrap items-end justify-center" style={{ gap: 20 }}>
                      {[...implantBaseModalTeeth].sort((a, b) => a - b).map((tooth) => (
                        <div key={tooth} className="flex flex-col items-center justify-center" style={{ gap: 6 }}>
                          {/* Figma 4515:194756 — TOOTH - large (viewBox 58×84), centered in 58×93 strip */}
                          <div className="flex h-[93px] w-[58px] shrink-0 items-center justify-center">
                            <img
                              src={implantToothLarge}
                              alt=""
                              width={58}
                              height={84}
                              className="block h-auto max-h-[93px] w-[58px] object-contain"
                              draggable={false}
                              aria-hidden
                            />
                          </div>
                          <span className="text-[16px] font-medium leading-6 text-[#3e3d40]">{tooth}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex w-full flex-row items-stretch" style={{ gap: 24 }}>
                <div className="flex min-w-0 flex-1 flex-col" style={{ gap: 8 }}>
                  <DropdownField
                    id="implant-manufacturer"
                    label="implant manufacturer"
                    value={implantManufacturerId}
                    options={IMPLANT_MANUFACTURER_OPTIONS}
                    onChange={(id) => { setImplantManufacturerId(id); setImplantModalOpenDropdown(null); }}
                    isOpen={implantModalOpenDropdown === "mfr"}
                    onToggle={() => setImplantModalOpenDropdown((o) => (o === "mfr" ? null : "mfr"))}
                    listZIndex={10001}
                    backgroundVariant="layer-02"
                  />
                  <DropdownField
                    id="implant-connection"
                    label="connection"
                    value={implantConnectionId}
                    options={IMPLANT_CONNECTION_OPTIONS}
                    onChange={(id) => { setImplantConnectionId(id); setImplantModalOpenDropdown(null); }}
                    isOpen={implantModalOpenDropdown === "conn"}
                    onToggle={() => setImplantModalOpenDropdown((o) => (o === "conn" ? null : "conn"))}
                    listZIndex={10001}
                    backgroundVariant="layer-02"
                  />
                  <DropdownField
                    id="implant-diameter"
                    label="Diameter/Platform"
                    value={implantDiameterPlatformId}
                    options={IMPLANT_DIAMETER_PLATFORM_OPTIONS}
                    onChange={(id) => { setImplantDiameterPlatformId(id); setImplantModalOpenDropdown(null); }}
                    isOpen={implantModalOpenDropdown === "diam"}
                    onToggle={() => setImplantModalOpenDropdown((o) => (o === "diam" ? null : "diam"))}
                    listZIndex={10001}
                    backgroundVariant="layer-02"
                  />
                  <DropdownField
                    id="implant-scan-body"
                    label="Scan body type"
                    value={implantScanBodyTypeId}
                    options={IMPLANT_SCAN_BODY_TYPE_OPTIONS}
                    onChange={(id) => { setImplantScanBodyTypeId(id); setImplantModalOpenDropdown(null); }}
                    isOpen={implantModalOpenDropdown === "scan"}
                    onToggle={() => setImplantModalOpenDropdown((o) => (o === "scan" ? null : "scan"))}
                    listZIndex={10001}
                    backgroundVariant="layer-02"
                  />
                </div>
                <div
                  className="flex w-[430px] shrink-0 flex-col self-stretch"
                  style={{ paddingTop: 32 }}
                >
                  <div
                    className="flex min-h-[380px] flex-1 flex-col items-center justify-center overflow-hidden rounded-lg bg-[var(--color-background-layer-02)]"
                    style={{ padding: 24 }}
                  >
                    <div className="flex max-w-[333px] flex-col items-center" style={{ gap: 7 }}>
                      <span className="tp-heading-03 text-center text-text-secondary">Select parameters</span>
                      <p className="tp-body-02 max-w-[315px] text-center text-text-secondary">
                        Select all parameters to see the preview here
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Restoration + Crown — gap 8 */}
            <div className="flex w-full flex-col" style={{ gap: 8 }}>
              <DropdownField
                id="implant-restoration-type-bottom"
                label="Restoration type"
                value={implantModalRestorationType}
                options={RESTORATION_TYPE_OPTIONS}
                onChange={(id) => { setImplantModalRestorationType(id); setImplantModalOpenDropdown(null); }}
                isOpen={implantModalOpenDropdown === "rest"}
                onToggle={() => setImplantModalOpenDropdown((o) => (o === "rest" ? null : "rest"))}
                listZIndex={10001}
                backgroundVariant="layer-02"
              />
              <DropdownField
                id="implant-crown-bottom"
                label="Crown"
                value={implantModalCrownRowId}
                options={RESTORATION_TYPE_OPTIONS}
                onChange={(id) => { setImplantModalCrownRowId(id); setImplantModalOpenDropdown(null); }}
                isOpen={implantModalOpenDropdown === "crown"}
                onToggle={() => setImplantModalOpenDropdown((o) => (o === "crown" ? null : "crown"))}
                listZIndex={10001}
                backgroundVariant="layer-02"
              />
            </div>
          </div>

          <div className="flex w-full shrink-0 justify-end" style={{ gap: 8 }}>
            <button
              type="button"
              onClick={handleImplantBaseDone}
              disabled={!implantManufacturerId}
              className="tp-body-02 flex shrink-0 cursor-pointer items-center justify-center rounded-lg border-0 appearance-none outline-none transition-ui focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] disabled:cursor-not-allowed"
              style={{
                width: 120,
                minWidth: 72,
                height: 60,
                padding: "var(--spacing-03) var(--spacing-04)",
                borderRadius: 8,
                backgroundColor: implantManufacturerId ? "var(--color-background-brand)" : "var(--color-background-brand-disabled)",
                color: implantManufacturerId ? "var(--color-text-inverse-primary)" : "var(--color-text-disabled)",
              }}
            >
              Done
            </button>
          </div>
        </div>
      </div>,
      document.body
    )}

    {/* Crown configuration modal — Figma 4513:191332 */}
    {crownModalTooth !== null && (
      <CrownModal26A
        tooth={crownModalTooth}
        detail={getToothDetail(crownModalTooth)}
        onDetailChange={(field, value) => updateToothDetail(crownModalTooth, field, value)}
        onClose={() => setCrownModalTooth(null)}
        onDelete={() => {
          handleRemoveTooth(crownModalTooth);
          setCrownModalTooth(null);
        }}
      />
    )}

    {/* Contextual tooth-treatment popover */}
    {toothContextMenu && typeof document !== "undefined" && createPortal(
      <ul
        ref={toothContextMenuRef}
        role="listbox"
        aria-label={`Tooth ${toothContextMenu.tooth} restoration`}
        className="flex min-h-0 w-max min-w-[min(280px,calc(100vw-2rem))] max-h-[min(26.25rem,calc(100svh-8rem))] max-w-[calc(100vw-2rem)] flex-col rounded-lg border border-border-subtle bg-[var(--color-background-layer-01)] [&>li+li]:border-t [&>li+li]:border-border-subtle scrollbar-table-y"
        style={{
          position: "fixed",
          left: toothContextMenu.x,
          top: toothContextMenu.y + 4,
          zIndex: 20000,
          boxShadow: "var(--shadow-card)",
          transform: "translateX(-50%)",
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <li role="presentation" className="shrink-0">
          <div className="tp-body-02 flex h-[60px] items-center text-text-secondary" style={{ padding: "16px 16px" }}>
            Tooth #{toothContextMenu.tooth}
          </div>
        </li>

        {toothSelections[toothContextMenu.tooth] && (
          <li role="presentation" className="shrink-0">
            <button
              type="button"
              className="flex h-[60px] w-full cursor-pointer items-center gap-3 border-0 bg-transparent text-left text-[var(--color-text-danger,#d32f2f)] outline-none transition-ui appearance-none hover:bg-[var(--color-background-layer-hovered)] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-border-focus)]"
              style={{ padding: "16px 16px" }}
              onClick={() => {
                handleRemoveTooth(toothContextMenu.tooth);
                setToothContextMenu(null);
              }}
            >
              <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor" />
              </svg>
              <span className="tp-body-02 truncate">Remove selection</span>
            </button>
          </li>
        )}

        {RESTORATION_TYPES.map((rt) => {
          const isCurrent = toothSelections[toothContextMenu.tooth] === rt.label;
          const isImplantBased = rt.label === "Implant based";
          return (
            <li key={rt.label} role="option" aria-selected={isCurrent}>
              <button
                type="button"
                className={`flex h-[60px] w-full cursor-pointer items-center gap-3 border-0 bg-transparent text-left outline-none transition-ui appearance-none focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-border-focus)] text-text-primary ${
                  isCurrent ? "bg-[var(--color-background-layer-02)]" : "hover:bg-[var(--color-background-layer-hovered)]"
                }`}
                style={{ padding: "16px 16px" }}
                onClick={() => {
                  if (isImplantBased) {
                    setImplantBaseModalTeeth([toothContextMenu.tooth]);
                    resetImplantModalForm();
                    setImplantBaseModalOpen(true);
                  } else if (rt.label === "Crown") {
                    setToothSelections((prev) => ({ ...prev, [toothContextMenu.tooth]: "Crown" }));
                    setCrownModalTooth(toothContextMenu.tooth);
                  } else {
                    setToothSelections((prev) => ({ ...prev, [toothContextMenu.tooth]: rt.label }));
                  }
                  setToothContextMenu(null);
                }}
              >
                <span
                  className="shrink-0 rounded-full"
                  style={{ width: 14, height: 14, backgroundColor: rt.color }}
                  aria-hidden
                />
                <span className="tp-body-02 min-w-0 flex-1 truncate">{rt.label}</span>
              </button>
            </li>
          );
        })}
      </ul>,
      document.body
    )}
    </>
  );
}
