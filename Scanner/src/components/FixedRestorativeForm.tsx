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

import { useState, useRef, useEffect, useLayoutEffect, type CSSProperties, type Dispatch, type SetStateAction } from "react";
import { createPortal } from "react-dom";
import jawChartSvg from "../assets/procedures/jaw-tooth-chart.svg";
import calendarSvg from "../assets/procedures/calendar.svg";
import toothSprites from "../assets/procedures/tooth-sprites.svg";
import starFillSvg from "../assets/procedures/star-fill.svg";
import starOutlineSvg from "../assets/procedures/star-outline.svg";
import implantBasePlaceholder from "../assets/procedures/implant-base-placeholder.png";
import { CaretDownIcon, CaretUpIcon, CheckIcon, ChevronLeftIcon, ChevronRightSmallIcon, CloseIcon, TrashIcon } from "./Icons";
import ProcedureTypeSelector, { type ProcedureType } from "./ProcedureTypeSelector";
import AdditionalInfoModal from "./AdditionalInfoModal";

function NoImageIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M21 1.06057L19.9394 0L0 19.9394L1.06057 21L2.56058 19.5H18C18.3977 19.4995 18.7789 19.3413 19.0601 19.0601C19.3413 18.7789 19.4995 18.3977 19.5 18V2.56058L21 1.06057ZM18 18H4.06058L9.90525 12.1553L11.6894 13.9393C11.9707 14.2206 12.3522 14.3786 12.75 14.3786C13.1478 14.3786 13.5293 14.2206 13.8106 13.9393L15 12.75L18 15.748V18ZM18 13.6261L16.0606 11.6867C15.7793 11.4054 15.3978 11.2474 15 11.2474C14.6022 11.2474 14.2207 11.4054 13.9394 11.6867L12.75 12.8761L10.9672 11.0933L18 4.06058V13.6261Z" fill="var(--color-icon-primary)" />
      <path d="M3 15V12.75L6.75 9.00255L7.77997 10.0325L8.8419 8.97053L7.81065 7.93928C7.52935 7.65798 7.14782 7.49995 6.75 7.49995C6.35218 7.49995 5.97065 7.65798 5.68935 7.93928L3 10.6287V3H15V1.5H3C2.6023 1.5004 2.221 1.65856 1.93978 1.93978C1.65856 2.221 1.5004 2.6023 1.5 3V15H3Z" fill="var(--color-icon-primary)" />
    </svg>
  );
}

function SendIcon({ color = "#121212" }: { color?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M20.5875 11.3321L4.08754 3.08214C3.95821 3.01746 3.81295 2.99155 3.66924 3.00752C3.52554 3.02348 3.38951 3.08065 3.27754 3.17214C3.1706 3.26176 3.09079 3.37943 3.04707 3.51192C3.00334 3.64441 2.99745 3.78648 3.03004 3.92214L5.25004 11.9996L3.00004 20.0546C2.96946 20.1679 2.96589 20.2868 2.98961 20.4017C3.01334 20.5167 3.06371 20.6244 3.13665 20.7163C3.2096 20.8082 3.3031 20.8818 3.40964 20.931C3.51617 20.9802 3.63276 21.0037 3.75004 20.9996C3.86744 20.9989 3.98304 20.9707 4.08754 20.9171L20.5875 12.6671C20.7104 12.6042 20.8135 12.5086 20.8855 12.3908C20.9575 12.273 20.9956 12.1377 20.9956 11.9996C20.9956 11.8616 20.9575 11.7262 20.8855 11.6085C20.8135 11.4907 20.7104 11.3951 20.5875 11.3321ZM4.91254 18.8321L6.57004 12.7496H13.5V11.2496H6.57004L4.91254 5.16714L18.57 11.9996L4.91254 18.8321Z" fill={color} />
    </svg>
  );
}

interface SavedNote {
  id: string;
  author: string;
  text: string;
  date: string;
  timeLabel: string;
}

function formatNoteDate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}/${mm}/${dd}`;
}

function treatingDoctorFromTreatedBy(treatedBy: string): string {
  return treatedBy.split("|")[0]?.trim() || treatedBy.trim() || "Doctor Name";
}

function NoteIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M18 16.5V21H3V3H12V1.5H3C2.60218 1.5 2.22064 1.65804 1.93934 1.93934C1.65804 2.22064 1.5 2.60218 1.5 3V21C1.5 21.3978 1.65804 21.7794 1.93934 22.0607C2.22064 22.342 2.60218 22.5 3 22.5H18C18.3978 22.5 18.7794 22.342 19.0607 22.0607C19.342 21.7794 19.5 21.3978 19.5 21V16.5H18Z" fill="black" fillOpacity={0.93} />
      <path d="M22.1643 4.32L19.6877 1.845C19.4632 1.62513 19.1615 1.50197 18.8472 1.50197C18.5329 1.50197 18.2311 1.62513 18.0066 1.845L7.5 12.345V16.5H11.6501L22.1568 6C22.3768 5.77569 22.5 5.4741 22.5 5.16C22.5 4.8459 22.3768 4.54431 22.1568 4.32H22.1643ZM11.0272 15H9.00095V12.975L16.0854 5.8875L18.1192 7.92L11.0272 15ZM19.1774 6.8625L17.1436 4.83L18.8472 3.1275L20.8809 5.16L19.1774 6.8625Z" fill="black" fillOpacity={0.93} />
    </svg>
  );
}

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
  { id: "invisalign", label: "Invisalign" },
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

/** Additional information modal — Figma 235:21138. */
export const PREP_DESIGN_OPTIONS: { id: string; label: string }[] = [
  { id: "", label: "Select an option" },
  { id: "shoulder", label: "Shoulder" },
  { id: "chamfer", label: "Chamfer" },
  { id: "feather-edge", label: "Feather edge" },
  { id: "knife-edge", label: "Knife edge" },
  { id: "rounded-shoulder", label: "Rounded shoulder" },
];

export const MARGIN_DESIGN_OPTIONS: { id: string; label: string }[] = [
  { id: "", label: "Select an option" },
  { id: "supragingival", label: "Supragingival" },
  { id: "equigingival", label: "Equigingival" },
  { id: "subgingival", label: "Subgingival" },
];

export const SHADE_VALUE_OPTIONS: { id: string; label: string }[] = [
  { id: "", label: "Select an option" },
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

/** Mock implant options for Figma implant base modal (Recents grid) */
const IMPLANT_OPTIONS: { id: string; title: string; subtitle: string; isFavorite: boolean }[] = [
  { id: "imp-1", title: "Straumann® Group · 2.9 mm", subtitle: "· BioAbutment", isFavorite: true },
  { id: "imp-2", title: "Straumann® Group · 2.9 mm", subtitle: "· BioAbutment", isFavorite: false },
  { id: "imp-3", title: "Straumann® Group · 2.9 mm", subtitle: "· BioAbutment", isFavorite: true },
  { id: "imp-4", title: "Straumann® Group · 2.9 mm", subtitle: "· BioAbutment", isFavorite: false },
  { id: "imp-5", title: "Straumann® Group · 2.9 mm", subtitle: "· BioAbutment", isFavorite: true },
  { id: "imp-6", title: "Straumann® Group · 2.9 mm", subtitle: "· BioAbutment", isFavorite: false },
  { id: "imp-7", title: "Straumann® Group · 2.9 mm", subtitle: "· BioAbutment", isFavorite: true },
  { id: "imp-8", title: "Straumann® Group · 2.9 mm", subtitle: "· BioAbutment", isFavorite: false },
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
  /** Override label typography (default matches legacy field labels). */
  labelClassName?: string;
  /** Applied to portaled listbox so typography tokens match scan-flow when modal is outside `.scan-flow`. */
  menuScopeClassName?: string;
}

export interface TreatmentSplitFieldProps {
  value: string;
  options: { id: string; label: string }[];
  onChange: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  /** Figma 257:31019 — opens full treatment picker when main label is clicked */
  onMainClick?: () => void;
  /** Visual pressed state while inline picker is shown */
  mainActive?: boolean;
}

/** Figma 235:23542 / 205:53902 — brand split-button treatment selector */
export function TreatmentSplitField({
  value,
  options,
  onChange,
  isOpen,
  onToggle,
  onMainClick,
  mainActive = false,
}: TreatmentSplitFieldProps) {
  const selected = options.find((o) => o.id === value);
  const displayLabel = selected?.label ?? value;

  return (
    <div className="relative flex flex-col shrink-0" style={{ width: 411 }}>
      <div style={{ paddingBottom: 8 }}>
        <span className="tp-label-02 text-text-secondary">Treatment</span>
      </div>
      <div className="flex items-stretch w-full" style={{ height: 60 }}>
        <button
          type="button"
          onClick={onMainClick}
          className="flex flex-1 items-center min-w-[72px] cursor-pointer border-0 appearance-none outline-none transition-ui hover:brightness-95 active:brightness-90 focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2"
          style={{
            backgroundColor: mainActive
              ? "var(--color-background-brand-pressed, #0080b2)"
              : "var(--color-background-brand)",
            padding: "var(--spacing-03, 12px) var(--spacing-04, 16px)",
            borderTopLeftRadius: 8,
            borderBottomLeftRadius: 8,
            gap: "var(--spacing-02, 8px)",
          }}
          aria-label={`Treatment: ${displayLabel}. Open treatment picker`}
        >
          <span className="tp-body-04 text-on-color truncate flex-1 min-w-0 text-left">{displayLabel}</span>
        </button>
        <button
          type="button"
          id="dropdown-treatment"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label="Change treatment"
          className="flex items-center justify-center shrink-0 cursor-pointer border-0 appearance-none outline-none transition-ui hover:brightness-95 focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2"
          style={{
            backgroundColor: mainActive
              ? "var(--color-background-brand-pressed, #0080b2)"
              : "var(--color-background-brand)",
            padding: "var(--spacing-03, 12px)",
            borderTopRightRadius: 8,
            borderBottomRightRadius: 8,
            height: 60,
            width: 48,
          }}
        >
          <CaretDownIcon size={24} color="var(--color-text-on-color-primary)" className="shrink-0" />
        </button>
      </div>
      {isOpen && (
        <ul
          role="listbox"
          aria-labelledby="dropdown-treatment"
          className="absolute left-0 right-0 top-full mt-1 flex max-h-60 flex-col overflow-auto rounded-lg border border-border-subtle bg-[var(--color-background-layer-01)] [&>li+li]:border-t [&>li+li]:border-border-subtle scrollbar-table"
          style={{ boxShadow: "var(--shadow-card)", zIndex: 20 }}
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

/** Portaled listbox is under `document.body`; click-outside logic must treat it as part of the field (see edit panel mousedown handlers). */
export function isDropdownPortalTarget(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest("[data-dropdown-portal]") !== null;
}

function isAdditionalInfoModalTarget(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest("[data-additional-info-modal]") !== null;
}

const dropdownListContent = (
  id: string,
  value: string,
  options: { id: string; label: string }[],
  onChange: (id: string) => void,
  listStyle: CSSProperties,
  menuScopeClassName?: string
) => (
  <ul
    role="listbox"
    aria-labelledby={`dropdown-${id}`}
    data-dropdown-portal=""
    className={`flex max-h-60 flex-col overflow-auto rounded-lg border border-border-subtle bg-[var(--color-background-layer-01)] [&>li+li]:border-t [&>li+li]:border-border-subtle scrollbar-table${menuScopeClassName ? ` ${menuScopeClassName}` : ""}`}
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
  labelClassName = "tp-body-01 text-text-secondary",
  menuScopeClassName,
}: DropdownFieldProps) {
  const selected = options.find((o) => o.id === value);
  const displayLabel = selected?.label ?? value;
  const isPlaceholder = !selected || selected.id === "";
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
          <span className={labelClassName}>{label}</span>
        </div>
      )}
      <button
        ref={buttonRef}
        type="button"
        id={`dropdown-${id}`}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={ariaLabel ?? label ?? "Select"}
        className={`flex items-center justify-between w-full overflow-clip text-left transition-ui focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 hover:bg-[var(--color-background-layer-hovered)] ${
          !hideBorder && backgroundVariant === "layer-02" ? "border border-border-subtle bg-[var(--color-background-layer-02)]" : ""
        }`}
        style={{
          backgroundColor: backgroundVariant === "layer-02" ? (hideBorder ? bgLayer : undefined) : (isOpen && backgroundVariant === "layer-01" ? "var(--color-background-layer-01)" : bgLayer),
          borderRadius: 8,
          border: hideBorder ? "none" : (backgroundVariant === "layer-02" ? undefined : (error
            ? "1px solid var(--color-border-error, #d43f58)"
            : isOpen
              ? "1px solid var(--color-border-interactive)"
              : "1px solid var(--color-border-subtle)")),
          padding: "var(--spacing-03, 12px) var(--spacing-04, 16px)",
          gap: "var(--spacing-02, 8px)",
          minHeight: 60,
          borderColor: !hideBorder && backgroundVariant === "layer-02" ? (error ? "var(--color-border-error, #d43f58)" : isOpen ? "var(--color-border-interactive)" : undefined) : undefined,
        }}
      >
        <span
          className={`tp-body-02 flex-1 min-w-0 truncate ${
            isPlaceholder ? "text-text-tertiary" : "text-text-primary"
          }`}
        >
          {displayLabel}
        </span>
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
      {isOpen && usePortal && portalPosition && createPortal(
        dropdownListContent(id, value, options, onChange, {
          position: "fixed",
          top: portalPosition.top,
          left: portalPosition.left,
          width: portalPosition.width,
          zIndex: listZIndex,
          boxShadow: "var(--shadow-card)",
        }, menuScopeClassName),
        document.body
      )}
      {isOpen && !usePortal && (
        <ul
          role="listbox"
          aria-labelledby={`dropdown-${id}`}
          className="absolute left-0 right-0 top-full mt-1 flex max-h-60 flex-col overflow-auto rounded-lg border border-border-subtle bg-[var(--color-background-layer-01)] [&>li+li]:border-t [&>li+li]:border-border-subtle scrollbar-table"
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

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

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
  /** Override label typography (default matches legacy field labels). */
  labelClassName?: string;
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
  labelClassName = "tp-body-01 text-text-secondary",
}: DatePickerFieldProps) {
  const [viewDate, setViewDate] = useState(() => value ?? new Date());

  useEffect(() => {
    if (!isOpen) return;
    setViewDate((d) => value ?? d);
  }, [isOpen, value]);

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
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1));
  }
  function goNextMonth() {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1));
  }
  function selectDay(day: number) {
    const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    onChange(d);
    onClose();
  }

  return (
    <div ref={containerRef} className="relative flex flex-col flex-1 min-w-0">
      <div style={{ paddingBottom: 8 }}>
        <span className={labelClassName}>{label}</span>
      </div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={label}
        className="flex items-center justify-between w-full overflow-clip text-left border border-border-subtle bg-[var(--color-background-layer-02)] transition-ui focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 hover:bg-[var(--color-background-layer-hovered)]"
        style={{
          borderRadius: 8,
          padding: "var(--spacing-03, 12px) var(--spacing-04, 16px)",
          gap: "var(--spacing-02, 8px)",
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
          style={{ borderRadius: 8, boxShadow: "0px 2px 12px 0px rgba(0,0,0,0.13)", width: 375 }}
        >
          {/* Header — Figma: border-bottom, px-16 py-12, chevrons + "Month Year ▾" */}
          <div
            className="flex items-center w-full border-b border-border-subtle overflow-clip"
            style={{ padding: "12px 16px", gap: 8 }}
          >
            <button
              type="button"
              onClick={goPrevMonth}
              aria-label="Previous month"
              className="flex items-center justify-center shrink-0 rounded transition-ui hover:bg-[var(--color-background-layer-hovered)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] cursor-pointer bg-transparent border-0 appearance-none"
              style={{ width: 24, height: 24 }}
            >
              <ChevronLeftIcon size={24} color="var(--color-icon-primary)" />
            </button>
            <div className="flex flex-1 items-center justify-center" style={{ gap: 8 }}>
              <span className="tp-headling-02 text-text-primary text-center whitespace-nowrap">
                {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
              </span>
              <CaretDownIcon size={24} color="var(--color-icon-primary)" />
            </div>
            <button
              type="button"
              onClick={goNextMonth}
              aria-label="Next month"
              className="flex items-center justify-center shrink-0 rounded transition-ui hover:bg-[var(--color-background-layer-hovered)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] cursor-pointer bg-transparent border-0 appearance-none"
              style={{ width: 24, height: 24 }}
            >
              <ChevronRightSmallIcon size={24} color="var(--color-icon-primary)" />
            </button>
          </div>

          {/* Date container — CSS Grid ensures weekday headers and day cells share the same 7-column track */}
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
  prepDesignBuccal: string;
  prepDesignLingual: string;
  marginDesignBuccal: string;
  marginDesignLingual: string;
  incisal: string;
  gingival: string;
  stumpShade: string;
}

const EMPTY_TOOTH_DETAIL: ToothDetail = {
  specification: "",
  material: "",
  shadeSystem: "",
  body: "",
  prepDesignBuccal: "",
  prepDesignLingual: "",
  marginDesignBuccal: "",
  marginDesignLingual: "",
  incisal: "",
  gingival: "",
  stumpShade: "",
};

/** Figma 243:25126 — badge fill for Missing vs colored restoration types. */
function restorationBadgeBackground(category: string, restorationColor?: string): string {
  if (category === "Missing") return "var(--color-gray-30, #b6b6b6)";
  return restorationColor ?? "var(--color-gray-30, #b6b6b6)";
}

/** Figma 243:25126 — summary line under tooth number on selected-tooth cards. */
function formatSelectedToothSummary(detail: ToothDetail, implantCaseLabel?: string | null): string {
  if (implantCaseLabel) return implantCaseLabel;

  const parts: string[] = [];
  const spec = SPEC_OPTIONS.find((o) => o.id === detail.specification)?.label;
  const material = MATERIAL_OPTIONS.find((o) => o.id === detail.material)?.label;
  const shade = SHADE_OPTIONS.find((o) => o.id === detail.shadeSystem)?.label;
  const body = BODY_OPTIONS.find((o) => o.id === detail.body)?.label;

  if (spec && spec !== "Specification") parts.push(spec);
  if (material && material !== "Material") parts.push(`Ceramic: ${material}`);
  if (shade && shade !== "Shade system") parts.push(shade);
  if (body && body !== "Body") parts.push(body);

  return parts.length > 0 ? parts.join(" · ") : "—";
}

export interface ToggleState {
  niri: boolean;
  sleeve: boolean;
  multiBite: boolean;
  preTreatment: boolean;
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
  /** Patient header "Treated by" line — doctor name is shown on saved notes */
  treatedBy?: string;
  /** Notifies parent when user picks a treatment from the full picker modal */
  onTreatmentChange?: (treatmentId: string) => void;
}

export default function FixedRestorativeForm({
  treatmentId, setTreatmentId,
  sendToId, setSendToId,
  dueDate, setDueDate,
  toothSelections, setToothSelections,
  toothDetails, setToothDetails,
  toggles, setToggles,
  noteText: _noteText, setNoteText,
  treatedBy = "Doctor Name | 12367854",
  onTreatmentChange,
}: FixedRestorativeFormProps) {
  const treatingDoctorName = treatingDoctorFromTreatedBy(treatedBy);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [treatmentPickerOpen, setTreatmentPickerOpen] = useState(false);
  const [savedNotes, setSavedNotes] = useState<SavedNote[]>([]);
  const [draftNote, setDraftNote] = useState("");
  const [noteInputFocused, setNoteInputFocused] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [pendingTeeth, setPendingTeeth] = useState<number[]>([]);
  const [editingTooth, setEditingTooth] = useState<number | null>(null);
  const [openEditDropdown, setOpenEditDropdown] = useState<string | null>(null);
  const [additionalInfoModalOpen, setAdditionalInfoModalOpen] = useState(false);
  const [implantBaseModalOpen, setImplantBaseModalOpen] = useState(false);
  const [implantBaseModalTeeth, setImplantBaseModalTeeth] = useState<number[]>([]);
  const [implantBaseModalCaseId, setImplantBaseModalCaseId] = useState("");
  const [implantCaseByTooth, setImplantCaseByTooth] = useState<Record<number, string>>({});
  const [implantBaseModalTab, setImplantBaseModalTab] = useState<"Recents" | "Favorites" | "Library">("Recents");
  const [selectedImplantId, setSelectedImplantId] = useState<string | null>(null);
  const [restorationTypeAccordionOpen, setRestorationTypeAccordionOpen] = useState(false);
  const [crownAccordionOpen, setCrownAccordionOpen] = useState(false);
  const [implantModalRestorationType, setImplantModalRestorationType] = useState("");
  const [implantModalAbutmentMaterial, setImplantModalAbutmentMaterial] = useState("");
  const [implantModalAbutmentType, setImplantModalAbutmentType] = useState("");
  const [implantModalTiBase, setImplantModalTiBase] = useState(false);
  const [implantModalSpec, setImplantModalSpec] = useState("");
  const [implantModalShade, setImplantModalShade] = useState("");
  const [implantModalMaterial, setImplantModalMaterial] = useState("");
  const [implantModalBody, setImplantModalBody] = useState("");
  const [implantModalRestorationDropdown, setImplantModalRestorationDropdown] = useState<string | null>(null);
  const [implantModalCrownDropdown, setImplantModalCrownDropdown] = useState<string | null>(null);
  const implantBaseModalRef = useRef<HTMLDivElement>(null);
  const restorationTypeLabel = "Crown";
  const dropdownRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const editPanelRef = useRef<HTMLDivElement>(null);

  function handleSendNote() {
    const trimmed = draftNote.trim();
    if (!trimmed) return;
    const newNote: SavedNote = {
      id: `${Date.now()}`,
      author: treatingDoctorName,
      text: trimmed,
      date: formatNoteDate(new Date()),
      timeLabel: "Just now",
    };
    setSavedNotes((prev) => {
      const next = [newNote, ...prev];
      setNoteText(next.map((n) => n.text).join("\n"));
      return next;
    });
    setDraftNote("");
    setNoteInputFocused(false);
  }

  function handleDeleteNote(noteId: string) {
    setSavedNotes((prev) => {
      const next = prev.filter((n) => n.id !== noteId);
      setNoteText(next.map((n) => n.text).join("\n"));
      return next;
    });
  }

  function handleToothClick(toothNum: number) {
    if (activeCategory) {
      const isDeselect = toothSelections[toothNum] === activeCategory;
      setToothSelections(prev => {
        const next = { ...prev };
        if (next[toothNum] === activeCategory) {
          delete next[toothNum];
        } else {
          next[toothNum] = activeCategory;
        }
        return next;
      });
      if (isDeselect) {
        setEditingTooth((current) => (current === toothNum ? null : current));
        setOpenEditDropdown(null);
      } else {
        setEditingTooth(toothNum);
        setOpenEditDropdown(null);
      }
      setPendingTeeth(prev => prev.filter((t) => t !== toothNum));
    } else {
      setPendingTeeth(prev =>
        prev.includes(toothNum) ? prev.filter((t) => t !== toothNum) : [...prev, toothNum]
      );
    }
  }

  useEffect(() => {
    if (editingTooth === null) setAdditionalInfoModalOpen(false);
  }, [editingTooth]);

  function getToothDetail(toothNum: number): ToothDetail {
    return toothDetails[toothNum] ?? EMPTY_TOOTH_DETAIL;
  }

  function updateToothDetail(toothNum: number, field: string, value: string) {
    setToothDetails(prev => ({
      ...prev,
      [toothNum]: { ...getToothDetail(toothNum), [field]: value },
    }));
  }

  function handleDeleteTooth(toothNum: number) {
    setToothSelections(prev => {
      const next = { ...prev };
      delete next[toothNum];
      return next;
    });
    setToothDetails(prev => {
      const next = { ...prev };
      delete next[toothNum];
      return next;
    });
    setImplantCaseByTooth(prev => {
      const next = { ...prev };
      delete next[toothNum];
      return next;
    });
    setPendingTeeth(prev => prev.filter((t) => t !== toothNum));
    setEditingTooth(null);
    setOpenEditDropdown(null);
  }

  const selectedTeethEntries = Object.entries(toothSelections).sort(
    ([a], [b]) => Number(a) - Number(b)
  );

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
    if (!openEditDropdown) return;
    const handleClick = (e: MouseEvent) => {
      if (isDropdownPortalTarget(e.target)) return;
      if (isAdditionalInfoModalTarget(e.target)) return;
      if (editPanelRef.current && !editPanelRef.current.contains(e.target as Node)) {
        setOpenEditDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openEditDropdown]);

  useEffect(() => {
    if (editingTooth !== null && !toothSelections[editingTooth]) {
      setEditingTooth(null);
      setOpenEditDropdown(null);
    }
  }, [toothSelections, editingTooth]);

  useEffect(() => {
    if (editingTooth === null) return;
    const handleClick = (e: MouseEvent) => {
      if (isDropdownPortalTarget(e.target)) return;
      if (isAdditionalInfoModalTarget(e.target)) return;
      if (editPanelRef.current && !editPanelRef.current.contains(e.target as Node)) {
        setEditingTooth(null);
        setOpenEditDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [editingTooth]);

  useEffect(() => {
    if (!implantBaseModalOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (implantBaseModalRef.current && !implantBaseModalRef.current.contains(e.target as Node)) {
        setImplantBaseModalOpen(false);
        setSelectedImplantId(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [implantBaseModalOpen]);

  function handleTreatmentPickerSelect(procedure: ProcedureType) {
    setTreatmentId(procedure);
    onTreatmentChange?.(procedure);
    if (procedure === "fixed-restorative") {
      setTreatmentPickerOpen(false);
    }
    setOpenDropdown(null);
  }

  function handleImplantBaseDone() {
    const implantId = selectedImplantId ?? implantBaseModalCaseId.trim();
    if (!implantId) return;
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
    setPendingTeeth([]);
    setActiveCategory("Implant based");
    setImplantBaseModalOpen(false);
    setEditingTooth(null);
    setSelectedImplantId(null);
  }

  return (
    <>
    <div className="flex flex-col w-full" style={{ gap: 16 }}>
      {/* Section 1: Treatment type row — Figma 235:23542 */}
      <div
        ref={dropdownRef}
        className="bg-[var(--color-background-layer-01)] w-full min-w-0"
        style={{ borderRadius: 8, padding: "8px 24px" }}
      >
        <div className="flex w-full items-center" style={{ gap: 16 }}>
          <TreatmentSplitField
            value={treatmentId}
            options={TREATMENT_OPTIONS}
            onChange={(id) => { setTreatmentId(id); setOpenDropdown(null); }}
            isOpen={openDropdown === "treatment"}
            onToggle={() => setOpenDropdown(openDropdown === "treatment" ? null : "treatment")}
            onMainClick={() => { setOpenDropdown(null); setTreatmentPickerOpen((open) => !open); }}
            mainActive={treatmentPickerOpen}
          />
          <DropdownField
            id="sendto"
            label="Send to"
            labelClassName="tp-label-02 text-text-secondary"
            value={sendToId}
            options={SEND_TO_OPTIONS}
            onChange={(id) => { setSendToId(id); setOpenDropdown(null); }}
            isOpen={openDropdown === "sendto"}
            onToggle={() => setOpenDropdown(openDropdown === "sendto" ? null : "sendto")}
            backgroundVariant="layer-02"
          />
          <DatePickerField
            label="Due date"
            labelClassName="tp-label-02 text-text-secondary"
            value={dueDate}
            onChange={setDueDate}
            isOpen={datePickerOpen}
            onToggle={() => setDatePickerOpen((o) => !o)}
            onClose={() => setDatePickerOpen(false)}
            containerRef={datePickerRef}
          />
        </div>
      </div>

      {treatmentPickerOpen ? (
        /* Treatment picker — Figma 257:31019 / 257:31023, inline below treatment row */
        <ProcedureTypeSelector
          headingId="treatment-picker-title"
          selected={treatmentId as ProcedureType}
          onSelect={handleTreatmentPickerSelect}
        />
      ) : (
      <>
      {/* Section 2: Interactive tooth chart — Figma 4069-83039 */}
      <div
        className="bg-[var(--color-background-layer-01)] w-full min-w-0"
        style={{ borderRadius: 8, padding: 24, minHeight: 528 }}
      >
        <div className="flex flex-col xl:flex-row w-full xl:min-h-[480px] items-stretch" style={{ gap: 0 }}>
          {/* Left: jaw + restoration-type buttons — shrink-0 on narrow viewports so chart is never clipped */}
          <div className="flex flex-col items-center w-full shrink-0 xl:flex-1 xl:min-w-0 xl:min-h-0 min-w-0" style={{ gap: 48, padding: "0 16px" }}>
            <div className="relative w-full shrink-0 min-w-0 overflow-x-auto scrollbar-table" style={{ maxWidth: 1171 }}>
              <img src={jawChartSvg} alt="Tooth chart" style={{ width: "100%", height: "auto", display: "block" }} />
              <svg viewBox="0 0 1171 277" className="tooth-chart-svg absolute inset-0 w-full h-full" aria-hidden focusable={false} tabIndex={-1}>
                <defs>
                  {/* Figma TR65595: Select state uses rounded-[18px] container */}
                  <clipPath id="tooth-select-clip">
                    <rect x="0" y="0" width={58} height={105} rx={18} ry={18} />
                  </clipPath>
                </defs>
                {UPPER_TEETH.map((tooth, i) => {
                  const x = TOOTH_X[i];
                  const sel = toothSelections[tooth];
                  const pending = pendingTeeth.includes(tooth);
                  const sprite = pending && !sel ? TOOTH_SPRITES[tooth]?.Select : sel ? TOOTH_SPRITES[tooth]?.[sel] : undefined;
                  const showSelect = pending && !sel && sprite;
                  const color = sel ? RESTORATION_TYPES.find(r => r.label === sel)?.color : undefined;
                  return (
                    <g key={tooth} onClick={() => handleToothClick(tooth)} onMouseDown={(e) => e.preventDefault()} className="outline-none" style={{ cursor: "pointer" }} focusable={false} tabIndex={-1}>
                      <rect x={x - 29} y={5} width={58} height={105} fill="transparent" stroke="none" focusable={false} />
                      {showSelect && (
                        <g transform={`translate(${x - 29}, 5)`} clipPath="url(#tooth-select-clip)" style={{ pointerEvents: "none" }}>
                          <rect x={0} y={0} width={58} height={105} fill="var(--color-background-layer-01)" />
                          <svg x={0} y={0} width={58} height={105} viewBox={`${sprite[0]} ${sprite[1]} ${sprite[2]} ${sprite[3]}`} style={{ overflow: "hidden" }}>
                            <image href={toothSprites} width={SPRITE_W} height={SPRITE_H} />
                          </svg>
                        </g>
                      )}
                      {sel && sprite && !showSelect && (
                        <>
                          <rect x={x - 29} y={5} width={58} height={105} fill="var(--color-background-layer-01)" style={{ pointerEvents: "none" }} />
                          <svg x={x - 29} y={5} width={58} height={105} viewBox={`${sprite[0]} ${sprite[1]} ${sprite[2]} ${sprite[3]}`} style={{ pointerEvents: "none", overflow: "hidden" }}>
                            <image href={toothSprites} width={SPRITE_W} height={SPRITE_H} />
                          </svg>
                        </>
                      )}
                      {sel && !sprite && color && (
                        <rect x={x - 28} y={6} width={56} height={103} fill="none" stroke={color} strokeWidth={2.5} rx={6} style={{ pointerEvents: "none" }} />
                      )}
                    </g>
                  );
                })}
                {LOWER_TEETH.map((tooth, i) => {
                  const x = TOOTH_X[i];
                  const sel = toothSelections[tooth];
                  const pending = pendingTeeth.includes(tooth);
                  const sprite = pending && !sel ? TOOTH_SPRITES[tooth]?.Select : sel ? TOOTH_SPRITES[tooth]?.[sel] : undefined;
                  const showSelect = pending && !sel && sprite;
                  const color = sel ? RESTORATION_TYPES.find(r => r.label === sel)?.color : undefined;
                  return (
                    <g key={tooth} onClick={() => handleToothClick(tooth)} onMouseDown={(e) => e.preventDefault()} className="outline-none" style={{ cursor: "pointer" }} focusable={false} tabIndex={-1}>
                      <rect x={x - 29} y={167} width={58} height={105} fill="transparent" stroke="none" focusable={false} />
                      {showSelect && (
                        <g transform={`translate(${x - 29}, 167)`} clipPath="url(#tooth-select-clip)" style={{ pointerEvents: "none" }}>
                          <rect x={0} y={0} width={58} height={105} fill="var(--color-background-layer-01)" />
                          <svg x={0} y={0} width={58} height={105} viewBox={`${sprite[0]} ${sprite[1]} ${sprite[2]} ${sprite[3]}`} style={{ overflow: "hidden" }}>
                            <image href={toothSprites} width={SPRITE_W} height={SPRITE_H} />
                          </svg>
                        </g>
                      )}
                      {sel && sprite && !showSelect && (
                        <>
                          <rect x={x - 29} y={167} width={58} height={105} fill="var(--color-background-layer-01)" style={{ pointerEvents: "none" }} />
                          <svg x={x - 29} y={167} width={58} height={105} viewBox={`${sprite[0]} ${sprite[1]} ${sprite[2]} ${sprite[3]}`} style={{ pointerEvents: "none", overflow: "hidden" }}>
                            <image href={toothSprites} width={SPRITE_W} height={SPRITE_H} />
                          </svg>
                        </>
                      )}
                      {sel && !sprite && color && (
                        <rect x={x - 28} y={168} width={56} height={103} fill="none" stroke={color} strokeWidth={2.5} rx={6} style={{ pointerEvents: "none" }} />
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Restoration type buttons — wrap to additional rows on narrow viewports */}
            <div
              className="flex items-center justify-center flex-wrap w-full shrink-0 min-w-0"
              style={{ gap: 12 }}
            >
              {RESTORATION_TYPES.map((rt) => {
                const isImplantBased = rt.label === "Implant based";
                return (
                  <button
                    key={rt.label}
                    type="button"
                    onClick={() => {
                      if (pendingTeeth.length === 0) return;
                      if (isImplantBased) {
                        setImplantBaseModalTeeth([...pendingTeeth]);
                        setImplantBaseModalCaseId("");
                        setImplantBaseModalTab("Recents");
                        setSelectedImplantId(null);
                        setImplantBaseModalOpen(true);
                      } else {
                        const teethToAssign = [...pendingTeeth];
                        setToothSelections(prev => {
                          const next = { ...prev };
                          teethToAssign.forEach((t) => { next[t] = rt.label; });
                          return next;
                        });
                        setPendingTeeth([]);
                        setActiveCategory(null);
                        setEditingTooth(
                          teethToAssign.length === 1
                            ? teethToAssign[0]
                            : teethToAssign[teethToAssign.length - 1],
                        );
                        setOpenEditDropdown(null);
                      }
                    }}
                    className="relative flex items-center justify-center cursor-pointer bg-transparent appearance-none outline-none transition-ui overflow-visible shrink-0 rounded-lg hover:bg-[var(--color-background-layer-hovered)] active:bg-[var(--color-background-layer-02)] focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2"
                    style={{
                      height: 60,
                      padding: "10px 12px",
                      gap: 6,
                      border: "2px solid var(--color-border-subtle)",
                      borderRadius: 8,
                      minWidth: 64,
                    }}
                  >
                    <div className="shrink-0" style={{ width: 20, height: 20, borderRadius: "50%", backgroundColor: rt.color }} />
                    <span className="tp-body-02 text-text-primary whitespace-nowrap">{rt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Vertical separator */}
          <div
            className="hidden xl:block shrink-0"
            style={{ width: 1, marginLeft: 24, marginRight: 24, backgroundColor: "var(--color-border-subtle)", alignSelf: "stretch" }}
          />

          {/* Right: edit form, selected teeth cards, or placeholder — width 429 on xl */}
          <div className="flex flex-col items-center justify-center w-full min-w-0 xl:w-[429px] xl:shrink-0 xl:min-h-0 xl:max-h-[480px] xl:overflow-auto pt-6 xl:pt-0 px-4 xl:px-0 border-t border-border-subtle xl:border-t-0">
            {editingTooth !== null && toothSelections[editingTooth] ? (() => {
              const category = toothSelections[editingTooth];
              const rt = RESTORATION_TYPES.find(r => r.label === category);
              const detail = getToothDetail(editingTooth);
              return (
                <div ref={editPanelRef} className="flex flex-col h-full w-full" style={{ gap: 12 }}>
                  {/* Header: badge + title + delete */}
                  <div className="flex flex-col" style={{ gap: 12 }}>
                    <div className="flex flex-col" style={{ gap: 8 }}>
                      <span
                        className="tp-body-02 self-start"
                        style={{
                          backgroundColor: rt?.color,
                          color: "#fff",
                          borderRadius: 4,
                          padding: "4px 8px",
                          minWidth: 24,
                          textAlign: "center",
                          border: "1px solid rgba(0,0,0,0.04)",
                        }}
                      >
                        {category}
                      </span>
                      <div className="flex items-center" style={{ gap: 14 }}>
                        <span className="tp-headling-03 text-text-primary flex-1 min-w-0">
                          Tooth #{editingTooth}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteTooth(editingTooth)}
                          className="flex items-center justify-center shrink-0 cursor-pointer bg-transparent border-0 appearance-none outline-none text-[var(--color-icon-primary)] hover:bg-[var(--color-background-layer-hovered)] transition-ui focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]"
                          style={{ width: 32, height: 32, borderRadius: 8, padding: 4 }}
                          aria-label="Delete tooth"
                        >
                          <TrashIcon size={24} color="var(--color-icon-primary)" />
                        </button>
                      </div>
                    </div>
                    <div style={{ height: 1, backgroundColor: "var(--color-border-subtle)" }} />
                  </div>

                  {/* Dropdowns — same background and stroke as Send to dropdown (layer-02); portal so list isn't clipped by overflow-hidden */}
                  <DropdownField
                    id={`edit-spec-${editingTooth}`}
                    value={detail.specification}
                    options={SPEC_OPTIONS}
                    onChange={(id) => { updateToothDetail(editingTooth, "specification", id); setOpenEditDropdown(null); }}
                    isOpen={openEditDropdown === "spec"}
                    onToggle={() => setOpenEditDropdown(openEditDropdown === "spec" ? null : "spec")}
                    backgroundVariant="layer-02"
                    listZIndex={10001}
                  />
                  <DropdownField
                    id={`edit-material-${editingTooth}`}
                    value={detail.material}
                    options={MATERIAL_OPTIONS}
                    onChange={(id) => { updateToothDetail(editingTooth, "material", id); setOpenEditDropdown(null); }}
                    isOpen={openEditDropdown === "material"}
                    onToggle={() => setOpenEditDropdown(openEditDropdown === "material" ? null : "material")}
                    backgroundVariant="layer-02"
                    listZIndex={10001}
                  />
                  <DropdownField
                    id={`edit-shade-${editingTooth}`}
                    value={detail.shadeSystem}
                    options={SHADE_OPTIONS}
                    onChange={(id) => { updateToothDetail(editingTooth, "shadeSystem", id); setOpenEditDropdown(null); }}
                    isOpen={openEditDropdown === "shade"}
                    onToggle={() => setOpenEditDropdown(openEditDropdown === "shade" ? null : "shade")}
                    backgroundVariant="layer-02"
                    listZIndex={10001}
                  />
                  <DropdownField
                    id={`edit-body-${editingTooth}`}
                    value={detail.body}
                    options={BODY_OPTIONS}
                    onChange={(id) => { updateToothDetail(editingTooth, "body", id); setOpenEditDropdown(null); }}
                    isOpen={openEditDropdown === "body"}
                    onToggle={() => setOpenEditDropdown(openEditDropdown === "body" ? null : "body")}
                    backgroundVariant="layer-02"
                    listZIndex={10001}
                  />

                  {/* + Additional info link */}
                  <div className="flex items-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="var(--color-icon-primary)" fillOpacity={0.5} />
                    </svg>
                    <button
                      type="button"
                      onClick={() => setAdditionalInfoModalOpen(true)}
                      className="tp-body-02 text-[var(--color-text-link,#009ace)] bg-transparent border-0 cursor-pointer appearance-none outline-none hover:underline"
                      style={{ padding: "16px 8px" }}
                    >
                      Additional info
                    </button>
                  </div>
                </div>
              );
            })() : selectedTeethEntries.length > 0 ? (
              <div
                className="flex w-full flex-col items-stretch justify-center overflow-y-auto scrollbar-table"
                style={{ gap: 8, maxHeight: 417 }}
              >
                {selectedTeethEntries.map(([num, category]) => {
                  const toothNum = Number(num);
                  const rt = RESTORATION_TYPES.find((r) => r.label === category);
                  const detail = getToothDetail(toothNum);
                  const isImplantBased = category === "Implant based";
                  const implantCaseId = implantCaseByTooth[toothNum];
                  const implantCaseLabel =
                    isImplantBased && implantCaseId
                      ? IMPLANT_OPTIONS.find((o) => o.id === implantCaseId)?.title ??
                        IMPLANT_CASE_OPTIONS.find((o) => o.id === implantCaseId)?.label ??
                        implantCaseId
                      : null;
                  const summary = formatSelectedToothSummary(detail, implantCaseLabel);

                  return (
                    <button
                      key={num}
                      type="button"
                      className="relative flex w-full shrink-0 cursor-pointer flex-col justify-center rounded-lg border-0 bg-[var(--color-background-layer-02)] p-4 text-left outline-none transition-ui hover:bg-[var(--color-background-layer-hovered)] focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]"
                      style={{ minHeight: 124 }}
                      onClick={() => {
                        if (isImplantBased) {
                          setImplantBaseModalTeeth([toothNum]);
                          setImplantBaseModalCaseId(implantCaseByTooth[toothNum] ?? "");
                          setImplantBaseModalTab("Recents");
                          setSelectedImplantId(implantCaseByTooth[toothNum] ?? null);
                          setImplantBaseModalOpen(true);
                          setEditingTooth(null);
                        } else {
                          setEditingTooth(toothNum);
                          setOpenEditDropdown(null);
                        }
                      }}
                    >
                      <div className="relative flex w-full min-w-0 items-start pr-8">
                        <div className="flex min-w-0 flex-1 flex-col items-start" style={{ gap: 8 }}>
                          <span
                            className="tp-body-02 shrink-0 text-on-color"
                            style={{
                              backgroundColor: restorationBadgeBackground(category, rt?.color),
                              borderRadius: 4,
                              padding: "4px 8px",
                              minWidth: 24,
                              textAlign: "center",
                            }}
                          >
                            {category}
                          </span>
                          <span className="tp-body-04 text-text-primary">#{num}</span>
                          <span className="tp-body-01 text-text-secondary w-full" style={{ wordBreak: "break-word" }}>
                            {summary}
                          </span>
                        </div>
                        <ChevronRightSmallIcon
                          size={24}
                          color="var(--color-icon-primary)"
                          className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 shrink-0"
                          aria-hidden
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : pendingTeeth.length > 0 ? (
              <div className="flex flex-col items-center justify-center py-4 xl:py-0 xl:h-full" style={{ width: 333, gap: 7 }}>
                <span className="tp-heading-03 text-text-secondary w-full text-center">Select restoration</span>
                <span className="tp-body-02 text-text-secondary text-center" style={{ width: 315 }}>
                  Choose a restoration type below to define the selected {pendingTeeth.length === 1 ? "tooth" : "teeth"}.
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4 xl:py-0 xl:h-full" style={{ width: 333, gap: 7 }}>
                <span className="tp-heading-03 text-text-secondary w-full text-center">Select tooth</span>
                <span className="tp-body-02 text-text-secondary text-center" style={{ width: 315 }}>
                  Select one or more teeth and the type of restoration to define them here.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 3: Toggles */}
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

      {/* Section 4: Attachments + Note */}
      <div className="flex" style={{ gap: 16, height: 460 }}>
        {/* Attachments card */}
        <div
          className="flex flex-col flex-1 min-w-0 bg-[var(--color-background-layer-01)] overflow-clip"
          style={{
            borderRadius: 16,
            boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
            padding: 12,
          }}
        >
          <div className="flex flex-col flex-1" style={{ padding: 16 }}>
            <div className="flex flex-col flex-1" style={{ gap: 12 }}>
              <span className="tp-heading-04 text-text-primary">Attachments</span>
              <div className="flex flex-col flex-1 items-center justify-center" style={{ gap: 31 }}>
                <div className="flex flex-col items-center" style={{ gap: 16 }}>
                  <NoImageIcon />
                  <div className="flex flex-col items-center text-center" style={{ gap: 4 }}>
                    <span className="tp-body-02 text-text-secondary">No Attachments</span>
                    <span className="tp-body-01 text-text-tertiary">
                      You can share external-related files, including images, videos and X-rays, with your lab.
                      <br />
                      To upload files use MyiTero.com
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Note card — Figma 205:56529 */}
        <div
          className="flex flex-col flex-1 min-w-0 min-h-0 bg-[var(--color-background-layer-01)] overflow-clip"
          style={{
            borderRadius: 16,
            boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <div
            className="flex flex-col flex-1 min-h-0 w-full"
            style={{ padding: "var(--spacing-06, 24px) var(--spacing-03, 12px)" }}
          >
            <div
              className="flex flex-col flex-1 min-h-0 w-full justify-between"
              style={{ padding: "var(--spacing-03, 12px) var(--spacing-04, 16px)" }}
            >
              <div className="shrink-0 w-full">
                <span className="tp-heading-04 text-text-primary">Note</span>
              </div>

              <div className="flex flex-col items-center justify-center w-full min-h-0 flex-1">
                {savedNotes.length > 0 ? (
                  <div
                    className="flex flex-col w-full overflow-hidden shrink-0"
                    style={{ height: 212 }}
                  >
                    <div
                      className="flex flex-col w-full overflow-y-auto scrollbar-table"
                      style={{
                        gap: "var(--spacing-02, 8px)",
                        height: 288,
                        paddingTop: "var(--spacing-01, 4px)",
                        paddingRight: "var(--spacing-03, 12px)",
                        paddingBottom: "var(--spacing-01, 4px)",
                        paddingLeft: 0,
                        borderRadius: 8,
                        backgroundColor: "var(--color-background-elevated)",
                        boxShadow: "0px 2px 6px rgba(0,0,0,0.13)",
                      }}
                    >
                      {savedNotes.map((note) => (
                        <div
                          key={note.id}
                          className="flex w-full shrink-0 flex-col items-start justify-center overflow-clip rounded-lg bg-[var(--color-background-layer-02)]"
                        >
                          <div
                            className="flex w-full items-center rounded-lg"
                            style={{ gap: "var(--spacing-02, 8px)", padding: "var(--spacing-03, 12px)" }}
                          >
                            <div
                              className="flex flex-1 min-w-0 items-start"
                              style={{ gap: 0 }}
                            >
                              <div
                                className="flex flex-1 min-w-0 flex-col items-start"
                                style={{ gap: "var(--spacing-01, 4px)" }}
                              >
                                <span className="tp-body-04 text-text-primary w-full truncate">{note.author}</span>
                                <span className="tp-body-01 text-text-secondary w-full break-words">{note.text}</span>
                              </div>
                            </div>
                            <div className="flex shrink-0 items-center" style={{ gap: "var(--spacing-03, 12px)" }}>
                              <span className="tp-body-01 text-text-secondary whitespace-nowrap">{note.date}</span>
                              <span
                                className="shrink-0"
                                style={{ width: 1, height: 19.261, backgroundColor: "var(--color-border-subtle)" }}
                                aria-hidden
                              />
                              <span className="tp-body-01 text-text-secondary whitespace-nowrap">{note.timeLabel}</span>
                              <button
                                type="button"
                                onClick={() => handleDeleteNote(note.id)}
                                className="relative flex shrink-0 cursor-pointer items-center justify-center bg-transparent border-0 appearance-none outline-none transition-ui hover:bg-[var(--color-background-layer-hovered)] focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] rounded"
                                style={{ width: 20, height: 20, padding: 0 }}
                                aria-label="Delete note"
                              >
                                <TrashIcon size={20} color="var(--color-icon-primary)" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : !draftNote && !noteInputFocused ? (
                  <div className="flex flex-col items-center justify-center w-full" style={{ gap: 31 }}>
                    <div className="flex flex-col items-center" style={{ gap: 16 }}>
                      <NoteIcon />
                      <div className="flex flex-col items-center text-center" style={{ gap: 4 }}>
                        <span className="tp-body-04 text-text-secondary">No notes yet</span>
                        <span className="tp-body-02 text-text-tertiary">
                          Type below to add your first note
                        </span>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="flex items-start shrink-0 w-full" style={{ gap: "var(--spacing-02, 8px)" }}>
                <div className="relative flex flex-1 min-w-0">
                  <textarea
                    className="w-full resize-none tp-body-04 text-text-primary placeholder:text-text-tertiary"
                    placeholder="Add your note here..."
                    maxLength={100}
                    value={draftNote}
                    onChange={(e) => setDraftNote(e.target.value)}
                    onFocus={() => setNoteInputFocused(true)}
                    onBlur={() => setNoteInputFocused(false)}
                    rows={1}
                    style={{
                      backgroundColor: "var(--color-background-layer-01)",
                      border: `1px solid ${
                        noteInputFocused || draftNote
                          ? "var(--color-border-focus)"
                          : "var(--color-border-subtle)"
                      }`,
                      borderRadius: 8,
                      padding: "var(--spacing-04, 16px)",
                      paddingRight: draftNote ? 48 : "var(--spacing-04, 16px)",
                      outline: "none",
                      minHeight: 60,
                    }}
                  />
                  {draftNote && (
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setDraftNote("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer bg-transparent border-0 appearance-none outline-none transition-ui hover:bg-[var(--color-background-layer-hovered)] focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] rounded"
                      style={{ width: 24, height: 24 }}
                      aria-label="Clear note"
                    >
                      <CloseIcon size={24} color="var(--color-icon-primary)" />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleSendNote}
                  disabled={!draftNote.trim()}
                  className="flex items-center justify-center shrink-0 cursor-pointer border-0 appearance-none outline-none transition-ui focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: draftNote.trim()
                      ? "var(--color-background-brand)"
                      : "var(--color-background-brand-disabled)",
                    borderRadius: 8,
                    width: 60,
                    height: 60,
                  }}
                  aria-label="Send note"
                >
                  <SendIcon color="var(--color-text-on-color-primary)" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      </>
      )}
    </div>

    {/* Implant base selection modal — Figma 4209:174869 (UI-Refresh-2025 Q2) */}
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
            height: 920,
          }}
        >
          {/* Headline: Header + Badge — Figma Headline */}
          <div className="flex flex-col w-full shrink-0" style={{ gap: 0 }}>
            <div className="flex items-center w-full" style={{ gap: "var(--spacing-04)", height: 60 }}>
              <h2 id="implant-base-modal-title" className="tp-heading-04 text-text-primary flex-1 min-w-0 truncate">
                {implantBaseModalTeeth.length === 1
                  ? `Tooth ${implantBaseModalTeeth[0]}`
                  : `Tooth ${[...implantBaseModalTeeth].sort((a, b) => a - b).join(",")}`}
              </h2>
              <button
                type="button"
                onClick={() => { setImplantBaseModalOpen(false); setSelectedImplantId(null); }}
                className="flex items-center justify-center shrink-0 cursor-pointer bg-transparent border-0 appearance-none outline-none transition-ui hover:bg-[var(--color-background-layer-02)] focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] rounded-lg"
                style={{ width: 60, height: 60 }}
                aria-label="Close"
              >
                <CloseIcon size={32} color="var(--color-icon-primary)" />
              </button>
            </div>
            <span
              className="tp-body-02 text-[var(--color-text-inverse-primary)] inline-flex items-center justify-center self-start"
              style={{
                backgroundColor: "#ff8133",
                borderRadius: 4,
                padding: "var(--spacing-01) var(--spacing-02)",
                minWidth: 24,
              }}
            >
              Implant based
            </span>
          </div>

          {/* Tabs + scrollable body — Figma: 16px gap between tabs and content */}
          <div className="flex flex-col flex-1 min-h-0 w-full min-w-0" style={{ gap: "var(--spacing-04)" }}>
            {/* Tabs: Recents, Favorites, Library — Figma _Tab item: h 60, pb 12, px 24 */}
            <div className="flex items-center w-full shrink-0" style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
              {(["Recents", "Favorites", "Library"] as const).map((tab) => {
                const isActive = implantBaseModalTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setImplantBaseModalTab(tab)}
                    className="tp-headling-02 cursor-pointer bg-transparent border-0 appearance-none outline-none transition-ui focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] shrink-0"
                    style={{
                      height: 60,
                      paddingBottom: "var(--spacing-03)",
                      paddingLeft: "var(--spacing-06)",
                      paddingRight: "var(--spacing-06)",
                      borderBottom: isActive ? "2px solid var(--color-border-interactive)" : "2px solid transparent",
                      marginBottom: -1,
                      color: isActive ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                    }}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* Scrollable body: cards + accordions — Figma gap 24 between sections */}
            <div className="flex flex-col flex-1 min-h-0 overflow-auto scrollbar-table w-full" style={{ gap: "var(--spacing-06)", height: "fit-content" }}>
          {/* Implant cards grid — Figma gap 12 between rows, 16 between cards */}
          <div className="flex flex-col w-full shrink-0" style={{ gap: "var(--spacing-03)" }}>
            <div className="flex flex-wrap w-full" style={{ gap: "var(--spacing-04)" }}>
              {IMPLANT_OPTIONS.map((opt) => {
                const isSelected = selectedImplantId === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedImplantId(opt.id)}
                    className="flex flex-col flex-1 min-w-0 min-h-0 text-left cursor-pointer border appearance-none outline-none transition-ui focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] rounded-lg"
                    style={{
                      minWidth: 243,
                      maxWidth: 280,
                      padding: 8,
                      gap: 16,
                      backgroundColor: "var(--color-background-layer-01)",
                      borderColor: isSelected ? "var(--color-border-interactive)" : "var(--color-border-accent)",
                      borderWidth: isSelected ? 2 : 1,
                    }}
                  >
                    <div
                      className="relative flex items-start justify-end w-full rounded-lg"
                      style={{
                        height: 143,
                        paddingTop: 8,
                        paddingRight: 8,
                        paddingLeft: 8,
                        backgroundColor: "var(--color-background-layer-02)",
                      }}
                    >
                      <span className="shrink-0 flex items-center justify-center" style={{ width: 24, height: 24 }} aria-hidden>
                        <img src={opt.isFavorite ? starFillSvg : starOutlineSvg} alt="" width={24} height={24} className="block" />
                      </span>
                      <img
                        src={implantBasePlaceholder}
                        alt=""
                        className="absolute left-1/2 top-1/2 block object-contain pointer-events-none"
                        style={{ width: 68, height: 70, transform: "translate(-50%, -50%)" }}
                      />
                    </div>
                    <div className="flex flex-col w-full" style={{ gap: 8 }}>
                      <span className="tp-body-02 text-text-primary leading-[28px]">{opt.title}</span>
                      <span className="tp-body-01 text-text-secondary whitespace-nowrap">{opt.subtitle}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Accordion group — Figma 02 Accordion group, gap 8 */}
          <div className="flex flex-col w-full shrink-0" style={{ gap: "var(--spacing-02)" }}>
            {/* 01 Restoration type */}
            <div className="flex flex-col w-full overflow-hidden rounded-2xl" style={{ backgroundColor: "var(--color-background-layer-02)" }}>
              <button
                type="button"
                onClick={() => setRestorationTypeAccordionOpen((o) => !o)}
                className="flex items-center w-full cursor-pointer border-0 appearance-none outline-none transition-ui focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] rounded-t-2xl"
                style={{ gap: 8, padding: 16, height: 60 }}
              >
                <span className="tp-headling-02 text-text-primary flex-1 min-w-0 text-left">Restoration type</span>
                <span className="shrink-0 flex items-center justify-center" style={{ width: 24, height: 24, transform: restorationTypeAccordionOpen ? "rotate(180deg)" : "none" }}>
                  <CaretDownIcon size={24} color="var(--color-icon-primary)" />
                </span>
              </button>
              {restorationTypeAccordionOpen && (
                <div className="flex flex-col w-full" style={{ gap: 10, padding: "0 16px 16px", paddingTop: 0 }}>
                  {/* Row 1 — Figma 4222:69964: gap 24px, two equal columns */}
                  <div className="flex w-full" style={{ gap: 24 }}>
                    <div className="flex flex-col flex-1 min-w-0">
                      <DropdownField
                        id="implant-restoration-type"
                        label="Restoration type"
                        value={implantModalRestorationType}
                        options={RESTORATION_TYPE_OPTIONS}
                        onChange={(id) => { setImplantModalRestorationType(id); setImplantModalRestorationDropdown(null); }}
                        isOpen={implantModalRestorationDropdown === "restoration"}
                        onToggle={() => setImplantModalRestorationDropdown((o) => (o === "restoration" ? null : "restoration"))}
                        listZIndex={10001}
                        hideBorder
                      />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <DropdownField
                        id="implant-abutment-material"
                        label="Abutment material"
                        value={implantModalAbutmentMaterial}
                        options={ABUTMENT_MATERIAL_OPTIONS}
                        onChange={(id) => { setImplantModalAbutmentMaterial(id); setImplantModalRestorationDropdown(null); }}
                        isOpen={implantModalRestorationDropdown === "abutment-material"}
                        onToggle={() => setImplantModalRestorationDropdown((o) => (o === "abutment-material" ? null : "abutment-material"))}
                        listZIndex={10001}
                        hideBorder
                      />
                    </div>
                  </div>
                  {/* Row 2 — Figma 4222:69990: Abutment type + Ti Base (pt 32px) */}
                  <div className="flex w-full" style={{ gap: 24 }}>
                    <div className="flex flex-col flex-1 min-w-0">
                      <DropdownField
                        id="implant-abutment-type"
                        label="Abutment type"
                        value={implantModalAbutmentType}
                        options={ABUTMENT_TYPE_OPTIONS}
                        onChange={(id) => { setImplantModalAbutmentType(id); setImplantModalRestorationDropdown(null); }}
                        isOpen={implantModalRestorationDropdown === "abutment-type"}
                        onToggle={() => setImplantModalRestorationDropdown((o) => (o === "abutment-type" ? null : "abutment-type"))}
                        listZIndex={10001}
                        hideBorder
                      />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0 w-full items-start justify-start" style={{ paddingTop: 32 }}>
                      <ToggleSwitch label="Ti Base" checked={implantModalTiBase} onChange={setImplantModalTiBase} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 02 Crown */}
            <div className="flex flex-col w-full overflow-hidden rounded-2xl" style={{ backgroundColor: "var(--color-background-layer-02)" }}>
              <button
                type="button"
                onClick={() => setCrownAccordionOpen((o) => !o)}
                className="flex items-center w-full cursor-pointer border-0 appearance-none outline-none transition-ui focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] rounded-t-2xl"
                style={{ gap: 8, padding: 16, height: 60 }}
              >
                <span className="tp-headling-02 text-text-primary flex-1 min-w-0 text-left">{restorationTypeLabel}</span>
                <span className="shrink-0 flex items-center justify-center" style={{ width: 24, height: 24, transform: crownAccordionOpen ? "rotate(180deg)" : "none" }}>
                  <CaretDownIcon size={24} color="var(--color-icon-primary)" />
                </span>
              </button>
              {crownAccordionOpen && (
                <div className="flex flex-col w-full" style={{ gap: 10, padding: "0 16px 16px", paddingTop: 0 }}>
                  {/* Row 1 — Figma 4222:70517: Specification + Shade system, gap 24px */}
                  <div className="flex w-full" style={{ gap: 24 }}>
                    <div className="flex flex-col flex-1 min-w-0">
                      <DropdownField
                        id="implant-crown-spec"
                        label="Specification"
                        value={implantModalSpec}
                        options={SPEC_OPTIONS}
                        onChange={(id) => { setImplantModalSpec(id); setImplantModalCrownDropdown(null); }}
                        isOpen={implantModalCrownDropdown === "spec"}
                        onToggle={() => setImplantModalCrownDropdown((o) => (o === "spec" ? null : "spec"))}
                        listZIndex={10001}
                        hideBorder
                      />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <DropdownField
                        id="implant-crown-shade"
                        label="Shade system"
                        value={implantModalShade}
                        options={SHADE_OPTIONS}
                        onChange={(id) => { setImplantModalShade(id); setImplantModalCrownDropdown(null); }}
                        isOpen={implantModalCrownDropdown === "shade"}
                        onToggle={() => setImplantModalCrownDropdown((o) => (o === "shade" ? null : "shade"))}
                        listZIndex={10001}
                        hideBorder
                      />
                    </div>
                  </div>
                  {/* Row 2 — Figma 4222:70520: Material + Body */}
                  <div className="flex w-full" style={{ gap: 24 }}>
                    <div className="flex flex-col flex-1 min-w-0">
                      <DropdownField
                        id="implant-crown-material"
                        label="Material"
                        value={implantModalMaterial}
                        options={MATERIAL_OPTIONS}
                        onChange={(id) => { setImplantModalMaterial(id); setImplantModalCrownDropdown(null); }}
                        isOpen={implantModalCrownDropdown === "material"}
                        onToggle={() => setImplantModalCrownDropdown((o) => (o === "material" ? null : "material"))}
                        listZIndex={10001}
                        hideBorder
                      />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <DropdownField
                        id="implant-crown-body"
                        label="Body"
                        value={implantModalBody}
                        options={BODY_OPTIONS}
                        onChange={(id) => { setImplantModalBody(id); setImplantModalCrownDropdown(null); }}
                        isOpen={implantModalCrownDropdown === "body"}
                        onToggle={() => setImplantModalCrownDropdown((o) => (o === "body" ? null : "body"))}
                        listZIndex={10001}
                        hideBorder
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          </div>
            {/* End scrollable body */}
          </div>

          {/* Footer: Done button — Figma 01 Button: h 60, min-w 72, w 120 */}
          <div className="flex items-center justify-end w-full shrink-0" style={{ gap: "var(--spacing-02)" }}>
            <button
              type="button"
              onClick={handleImplantBaseDone}
              disabled={!selectedImplantId}
              className="tp-body-02 cursor-pointer border-0 appearance-none outline-none transition-ui focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] disabled:cursor-not-allowed rounded-lg flex items-center justify-center shrink-0"
              style={{
                width: 120,
                minWidth: 72,
                height: 60,
                padding: "var(--spacing-03) var(--spacing-04)",
                borderRadius: 8,
                backgroundColor: selectedImplantId ? "var(--color-background-brand)" : "var(--color-background-brand-disabled)",
                color: selectedImplantId ? "var(--color-text-inverse-primary)" : "var(--color-text-disabled)",
              }}
            >
              Done
            </button>
          </div>
        </div>
      </div>,
      document.body
    )}

    {additionalInfoModalOpen && editingTooth !== null && (
      <AdditionalInfoModal
        detail={getToothDetail(editingTooth)}
        onClose={() => setAdditionalInfoModalOpen(false)}
        onSave={(fields) => {
          setToothDetails((prev) => ({
            ...prev,
            [editingTooth]: { ...getToothDetail(editingTooth), ...fields },
          }));
        }}
      />
    )}
    </>
  );
}
