/**
 * Procedure type selector — Figma 4087:38424.
 * "What are you scanning today?" heading + 3×2 grid of procedure cards.
 * Each card has a title and illustration; selected card gets blue border,
 * highlight-blue background, and a checkmark badge.
 */

import studyModelSvg from "../assets/procedures/study-model.svg";
import invisalignSvg from "../assets/procedures/invisalign.svg";
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
}

const PROCEDURES: ProcedureOption[] = [
  { id: "study-model", label: "Study model", illustration: studyModelSvg },
  { id: "invisalign", label: "Invisalign", illustration: invisalignSvg },
  { id: "fixed-restorative", label: "Fixed restorative", illustration: fixedRestorativeSvg },
  { id: "appliance", label: "Appliance", illustration: applianceSvg },
  { id: "dentures-removable", label: "Dentures / Removable", illustration: denturesRemovableSvg },
  { id: "surgical-guide", label: "Scan for surgical guide", illustration: surgicalGuideSvg },
];

function CheckmarkBadge() {
  return (
    <svg
      width="44"
      height="44"
      viewBox="0 0 38.5 38.5"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute -top-3 -right-3 z-10"
      aria-hidden
    >
      <path
        d="M19.25 0C15.4427 0 11.7209 1.12899 8.55528 3.24421C5.38963 5.35943 2.92231 8.36587 1.46533 11.8833C0.00834071 15.4008 -0.372873 19.2714 0.369892 23.0055C1.11266 26.7396 2.94604 30.1696 5.6382 32.8618C8.33036 35.554 11.7604 37.3874 15.4945 38.1301C19.2287 38.8729 23.0992 38.4917 26.6167 37.0347C30.1341 35.5777 33.1406 33.1104 35.2558 29.9447C37.371 26.7791 38.5 23.0573 38.5 19.25C38.5 14.1446 36.4719 9.24827 32.8618 5.63819C29.2517 2.02812 24.3554 0 19.25 0V0ZM16.5 26.9373L9.62501 20.0623L11.8121 17.875L16.5 22.5627L26.6888 12.375L28.8828 14.5556L16.5 26.9373Z"
        fill="var(--color-border-interactive)"
      />
    </svg>
  );
}

export interface ProcedureTypeSelectorProps {
  selected?: ProcedureType;
  onSelect?: (procedure: ProcedureType) => void;
}

export default function ProcedureTypeSelector({
  selected,
  onSelect,
}: ProcedureTypeSelectorProps) {
  return (
    <div
      className="flex flex-col items-start justify-center w-full flex-1 rounded-lg bg-[var(--color-background-layer-01)]"
      style={{ padding: "16px 24px", gap: 24 }}
    >
      <div
        className="w-full shrink-0"
        style={{ padding: "0 clamp(24px, 5vw, 96px)" }}
      >
        <h2
          className="tp-headling-06 text-text-primary"
          style={{ margin: 0 }}
        >
          What are you scanning today?
        </h2>
      </div>

      <div
        className="grid w-full"
        style={{
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          padding: "16px clamp(24px, 5vw, 96px)",
        }}
      >
        {PROCEDURES.map((proc) => {
          const isSelected = selected === proc.id;
          return (
            <div key={proc.id} className="relative">
              {isSelected && <CheckmarkBadge />}
              <button
                type="button"
                onClick={() => onSelect?.(proc.id)}
                className="flex flex-col justify-between w-full text-left cursor-pointer border-2 border-solid appearance-none outline-none transition-ui focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2"
                style={{
                  aspectRatio: "533 / 261",
                  borderRadius: 16,
                  padding: "clamp(16px, 1.5vw, 28px) clamp(16px, 1.6vw, 30px)",
                  backgroundColor: isSelected
                    ? "var(--color-background-highlight-blue)"
                    : "var(--color-background-layer-02)",
                  borderColor: isSelected
                    ? "var(--color-border-interactive)"
                    : "var(--color-border-subtle)",
                }}
                aria-pressed={isSelected}
              >
                <span
                  className="text-text-primary w-full"
                  style={{
                    fontFamily: "var(--font-roboto)",
                    fontSize: "clamp(22px, 1.7vw, 32px)",
                    fontWeight: 500,
                    lineHeight: 1.25,
                  }}
                >
                  {proc.label}
                </span>

                <img
                  src={proc.illustration}
                  alt=""
                  aria-hidden
                  className="self-end"
                  style={{ height: "clamp(80px, 8vw, 140px)", objectFit: "contain" }}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
