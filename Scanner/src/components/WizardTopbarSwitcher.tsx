/**
 * Wizard topbar stepper — Figma 4150:130997 / 4118:169256.
 * Four overlapping pill+arrow segments: Info → Scan → View → Send.
 * Each segment uses the same SVG shape (rounded rect + curved arrow tip).
 * Interlocking is from overlap + z-index + 4px white stroke.
 * States: current (blue bg, white text), complete (gray bg, dark text),
 *         incomplete (white bg, dark text), inactive (white bg, lighter text).
 */

export type ScanWizardStep = "info" | "scan" | "view" | "send";

const STEPS: { id: ScanWizardStep; label: string }[] = [
  { id: "info", label: "Info" },
  { id: "scan", label: "Scan" },
  { id: "view", label: "View" },
  { id: "send", label: "Send" },
];

const W = 176;
const H = 64;
const OVERLAP = 32;
const TOTAL_W = W + (STEPS.length - 1) * (W - OVERLAP);

/**
 * Exact Figma path (viewBox 0 0 180 72).
 * Rounded-rect body (18px corners) + curved arrow tip on right (cubic bezier).
 * 2px inset from edges to leave room for the 4px stroke.
 */
const SHAPE_PATH =
  "M148 2C153.666 2 159.001 4.66769 162.4 9.2002L174.4 25.2002" +
  "C179.2 31.6001 179.2 40.3999 174.4 46.7998L162.4 62.7998" +
  "C159.001 67.3323 153.666 70 148 70H20" +
  "C10.0589 70 2 61.9411 2 52V20" +
  "C2 10.0589 10.0589 2 20 2H148Z";

export interface WizardTopbarSwitcherProps {
  currentStep: ScanWizardStep;
  onStepClick?: (step: ScanWizardStep) => void;
}

export default function WizardTopbarSwitcher({
  currentStep,
  onStepClick,
}: WizardTopbarSwitcherProps) {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <nav
      className="flex items-center justify-center shrink-0"
      style={{ width: TOTAL_W }}
      aria-label="Scanning steps"
    >
      <div className="relative" style={{ width: TOTAL_W, height: H }}>
        {STEPS.map((step, index) => {
          const isCurrent = index === currentIndex;
          const isComplete = index < currentIndex;
          const isInactive =
            !isCurrent && !isComplete && index > currentIndex + 2;

          const fill = isCurrent
            ? "var(--color-background-brand)"
            : isComplete
              ? "var(--color-background-layer-02)"
              : "#FFFFFF";

          const textColor = isCurrent
            ? "var(--color-text-on-color-primary)"
            : isInactive
              ? "rgba(0,0,0,0.44)"
              : "rgba(0,0,0,0.93)";

          const left = index * (W - OVERLAP);

          return (
            <div
              key={step.id}
              className="absolute top-0"
              style={{
                left,
                width: W,
                height: H,
                zIndex: STEPS.length - index,
              }}
            >
              <svg
                className="absolute pointer-events-none"
                style={{
                  top: "-6.25%",
                  bottom: "-6.25%",
                  left: "-2.27%",
                  right: 0,
                }}
                viewBox="0 0 180 72"
                preserveAspectRatio="none"
                overflow="visible"
                aria-hidden
              >
                <path
                  d={SHAPE_PATH}
                  fill={fill}
                  stroke="white"
                  strokeWidth={4}
                />
              </svg>

              <button
                type="button"
                onClick={() => onStepClick?.(step.id)}
                aria-selected={isCurrent}
                aria-label={`Step ${index + 1}: ${step.label}`}
                role="tab"
                className="wizard-step-label absolute inset-0 flex items-center justify-center cursor-pointer bg-transparent border-0 appearance-none outline-none transition-ui focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2"
                style={{ color: textColor }}
              >
                {step.label}
              </button>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
