/**
 * Scanning flow header — same layout as OrdersHeader/Header (grid, left/center/right).
 * Left: Home + separator + current step label (Info | Scan | View | Send).
 * Center: Wizard topbar switcher (Figma 6096-19093).
 * Right: Help, Battery, Settings.
 */

import { HomeIcon, HelpIcon, BatteryIcon, SettingsIcon } from "./Icons";
import WizardTopbarSwitcher, { type ScanWizardStep } from "./WizardTopbarSwitcher";

const STEP_LABELS: Record<ScanWizardStep, string> = {
  info: "Info",
  scan: "Scan",
  view: "View",
  send: "Send",
};

export type { ScanWizardStep };

export interface ScanFlowHeaderProps {
  currentStep: ScanWizardStep;
  onStepClick?: (step: ScanWizardStep) => void;
  onInfoClick: () => void;
  onHelpClick?: () => void;
  onBatteryClick?: () => void;
  onSettingsClick?: () => void;
}

export default function ScanFlowHeader({
  currentStep,
  onStepClick,
  onInfoClick,
  onHelpClick,
  onBatteryClick,
  onSettingsClick,
}: ScanFlowHeaderProps) {
  const stepLabel = STEP_LABELS[currentStep];

  return (
    <header
      className="grid grid-cols-[1fr_2fr_1fr] items-center w-full bg-surface border-b border-border-subtle py-1.5 shrink-0"
      style={{ paddingLeft: 16, paddingRight: 16 }}
    >
      {/* Left: Home icon + separator + step label — same layout for every step (Figma 4138:125807). */}
      <div className="flex items-center gap-4 min-w-0">
        <button
          type="button"
          onClick={onInfoClick}
          className="flex items-center justify-center p-2 rounded-lg border-0 bg-transparent cursor-pointer hover:bg-surface-alt transition-ui transition-ui-focus focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2"
          aria-label="Go to home"
        >
          <HomeIcon size={24} color="var(--color-icon-primary)" />
        </button>
        <div
          className="w-px h-6 shrink-0"
          style={{ backgroundColor: "var(--color-border-subtle)" }}
          aria-hidden
        />
        <span className="tp-heading-03 text-text-primary whitespace-nowrap truncate">
          {stepLabel}
        </span>
      </div>

      {/* Center: Wizard topbar switcher (Figma 6096-19093) */}
      <div className="flex items-center justify-center min-w-0">
        <WizardTopbarSwitcher currentStep={currentStep} onStepClick={onStepClick} />
      </div>

      {/* Right: Help, Battery, Settings (same as OrdersHeader — always visible) */}
      <div className="flex items-center justify-end gap-1 h-[var(--height-row)] min-w-0">
        <button
          type="button"
          onClick={onHelpClick}
          className="flex items-center justify-center p-3 rounded-lg size-[var(--height-row)] border-0 bg-transparent cursor-pointer hover:bg-surface-alt transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          aria-label="Help"
        >
          <HelpIcon size={32} color="var(--color-icon-primary)" />
        </button>
        <button
          type="button"
          onClick={onBatteryClick}
          aria-label="Battery status"
          className="flex items-center justify-center p-3 rounded-lg size-[var(--height-row)] border-0 cursor-pointer hover:bg-surface-alt transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          <BatteryIcon size={32} color="var(--color-icon-primary)" />
        </button>
        <button
          type="button"
          onClick={onSettingsClick}
          className="flex items-center justify-center p-3 rounded-lg size-[var(--height-row)] border-0 bg-transparent cursor-pointer hover:bg-surface-alt transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          aria-label="Open settings"
        >
          <SettingsIcon size={32} color="var(--color-icon-primary)" />
        </button>
      </div>
    </header>
  );
}
