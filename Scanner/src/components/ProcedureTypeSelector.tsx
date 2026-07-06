/**
 * Procedure type selector — Figma 205:40739.
 * "What are you scanning today?" heading + 3×2 grid of colored procedure cards
 * with white labels and illustrations.
 */

import studyModelSvg from "../assets/procedures/study-model.svg";
/** 26B procedure card — distinct asset from 26A (`ProcedureTypeSelector26A`). */
import invisalignSvg from "../assets/procedures/invisalign-26b.svg";
import fixedRestorativeSvg from "../assets/procedures/fixed-restorative.svg";
import applianceSvg from "../assets/procedures/appliance.svg";
import denturesRemovableSvg from "../assets/procedures/dentures-removable.svg";
import surgicalGuideSvg from "../assets/procedures/surgical-guide.svg";

export type ProcedureType =
  | "study-model"
  | "invisalign"
  | "fixed-restorative"
  | "appliance"
  | "dentures-removable"
  | "surgical-guide";

interface ProcedureOption {
  id: ProcedureType;
  label: string;
  illustration: string;
  /** Figma 205:40739 — per-card brand blue shade. */
  backgroundColor: string;
}

const PROCEDURES: ProcedureOption[] = [
  {
    id: "study-model",
    label: "Study model",
    illustration: studyModelSvg,
    backgroundColor: "var(--color-background-brand, #009ace)",
  },
  {
    id: "invisalign",
    label: "Invisalign",
    illustration: invisalignSvg,
    backgroundColor: "#0072a3",
  },
  {
    id: "fixed-restorative",
    label: "Fixed restorative",
    illustration: fixedRestorativeSvg,
    backgroundColor: "#005780",
  },
  {
    id: "appliance",
    label: "Appliance",
    illustration: applianceSvg,
    backgroundColor: "var(--color-background-brand-hovered, #008ec2)",
  },
  {
    id: "dentures-removable",
    label: "Dentures / Removable",
    illustration: denturesRemovableSvg,
    backgroundColor: "#006796",
  },
  {
    id: "surgical-guide",
    label: "Scan for surgical guide",
    illustration: surgicalGuideSvg,
    backgroundColor: "#004b70",
  },
];

export interface ProcedureTypeSelectorProps {
  selected?: ProcedureType;
  onSelect?: (procedure: ProcedureType) => void;
  /** Optional id for the heading (e.g. modal aria-labelledby) */
  headingId?: string;
}

export default function ProcedureTypeSelector({
  selected,
  onSelect,
  headingId,
}: ProcedureTypeSelectorProps) {
  const rowOne = PROCEDURES.slice(0, 3);
  const rowTwo = PROCEDURES.slice(3);

  return (
    <div
      className="flex w-full flex-1 flex-col items-start rounded-lg bg-[var(--color-background-layer-01)]"
      style={{ padding: "var(--spacing-06, 24px) clamp(24px, 5vw, 96px) var(--spacing-13, 96px)", gap: 24 }}
    >
      <div className="flex w-full shrink-0 flex-col justify-center py-[var(--spacing-04,16px)]">
        <h2 id={headingId} className="tp-headling-06 m-0 text-text-primary">What are you scanning today?</h2>
      </div>

      <div
        className="flex w-full shrink-0 flex-col"
        style={{ gap: 16, maxHeight: 536 }}
      >
        {[rowOne, rowTwo].map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="grid w-full min-h-[180px] flex-1 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
            style={{ gap: 16, minHeight: 260 }}
          >
            {row.map((proc) => {
              const isSelected = selected === proc.id;
              return (
                <button
                  key={proc.id}
                  type="button"
                  onClick={() => onSelect?.(proc.id)}
                  className="flex min-h-[180px] w-full min-w-0 cursor-pointer flex-col items-start overflow-hidden rounded-2xl border-0 p-[var(--spacing-06,24px)] text-left appearance-none outline-none transition-ui focus-visible:ring-2 focus-visible:ring-[var(--color-border-on-color-focus)] focus-visible:ring-offset-2 xl:min-h-[260px]"
                  style={{
                    backgroundColor: proc.backgroundColor,
                    boxShadow: isSelected
                      ? "inset 0 0 0 2px var(--color-border-on-color-strong, #ffffff)"
                      : undefined,
                  }}
                  aria-pressed={isSelected}
                >
                  <div className="flex h-full w-full min-h-0 flex-col items-end justify-between">
                    <span className="tp-heading-05 w-full min-w-0 text-[var(--color-text-on-color-primary,#ffffff)]">
                      {proc.label}
                    </span>
                    <div
                      className="flex shrink-0 items-center justify-center p-[var(--spacing-01,4px)]"
                      style={{ width: 114, height: 114 }}
                    >
                      <img
                        src={proc.illustration}
                        alt=""
                        aria-hidden
                        className="max-h-full max-w-full object-contain [filter:brightness(0)_invert(1)]"
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
