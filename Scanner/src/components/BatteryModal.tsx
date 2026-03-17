import { useEffect, useRef } from "react";
import { BatteryIcon } from "./Icons";

interface BatteryModalProps {
  onClose: () => void;
  level?: number;
}

export default function BatteryModal({ onClose, level = 100 }: BatteryModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={cardRef}
      role="dialog"
      aria-modal="true"
      aria-label="Battery status"
      className="fixed z-50 rounded-xl bg-background-layer-01"
      style={{
        top: "calc(var(--height-row) + var(--spacing-03))",
        right: "var(--page-padding)",
        width: 500,
        padding: "var(--spacing-06)",
        boxShadow: "var(--shadow-card)",
        border: "1px solid var(--color-border-subtle)",
      }}
    >
      {/* Title */}
      <div
        className="flex items-center"
        style={{ gap: "var(--spacing-02)", marginBottom: "var(--spacing-03)" }}
      >
        <BatteryIcon size={32} color="var(--color-icon-primary)" />
        <span className="tp-heading-04 text-text-primary">Battery</span>
      </div>

      {/* Body */}
      <p
        className="tp-body-04 text-text-secondary"
        style={{ marginBottom: "var(--spacing-06)" }}
      >
        Battery level {level}%
      </p>

      {/* Footer */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="tp-body-04 flex items-center justify-center h-[var(--height-row)] min-w-[120px] px-5 rounded-lg border-0 text-on-color cursor-pointer hover:opacity-90 transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background-brand)]"
          style={{ backgroundColor: "var(--color-background-brand)" }}
        >
          OK
        </button>
      </div>
    </div>
  );
}
