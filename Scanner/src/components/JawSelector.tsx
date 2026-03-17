/**
 * Jaw selector — Figma 4138:125921.
 * Dropdown-style navigation for switching between upper jaw, lower jaw, etc.
 * Shows left/right chevron arrows with dividers and current jaw label.
 */

export type JawSelection = "upper" | "lower" | "both";

interface JawSelectorProps {
  selected: JawSelection;
  onPrev?: () => void;
  onNext?: () => void;
  className?: string;
}

const JAW_LABELS: Record<JawSelection, string> = {
  upper: "Upper Jaw",
  lower: "Lower Jaw",
  both: "Both Jaws",
};

function ChevronLeft() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15 18L9 12L15 6"
        stroke="var(--color-icon-primary)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 18L15 12L9 6"
        stroke="var(--color-icon-primary)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Divider() {
  return (
    <div
      style={{
        width: 0,
        height: 24,
        borderLeft: "1px solid var(--color-border-subtle)",
      }}
      aria-hidden
    />
  );
}

export default function JawSelector({
  selected,
  onPrev,
  onNext,
  className,
}: JawSelectorProps) {
  return (
    <div
      className={`flex items-center overflow-hidden ${className ?? ""}`}
      style={{
        backgroundColor: "var(--color-background-layer-01)",
        borderRadius: 8,
        height: 64,
        gap: 8,
        paddingLeft: 8,
        paddingRight: 8,
        paddingTop: 12,
        paddingBottom: 12,
        width: "100%",
      }}
    >
      <div className="flex items-center shrink-0">
        <button
          type="button"
          onClick={onPrev}
          className="flex items-center justify-center cursor-pointer border-0 bg-transparent appearance-none outline-none rounded transition-ui focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]"
          style={{ width: 60, height: 60 }}
          aria-label="Previous jaw"
        >
          <ChevronLeft />
        </button>
        <Divider />
      </div>

      <div
        className="tp-body-02 flex-1 text-center overflow-hidden text-ellipsis whitespace-nowrap"
        style={{ color: "var(--color-text-primary)" }}
      >
        {JAW_LABELS[selected]}
      </div>

      <div className="flex items-center shrink-0">
        <Divider />
        <button
          type="button"
          onClick={onNext}
          className="flex items-center justify-center cursor-pointer border-0 bg-transparent appearance-none outline-none rounded transition-ui focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]"
          style={{ width: 60, height: 60 }}
          aria-label="Next jaw"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
}
