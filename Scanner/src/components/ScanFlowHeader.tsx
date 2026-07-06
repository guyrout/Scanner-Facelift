/**
 * Scanning flow header — same layout as OrdersHeader/Header (grid, left/center/right).
 * Left: Home + separator + flow title (New scan).
 * Center: Wizard topbar switcher (Figma 6096-19093).
 * Right: Help, Battery, Settings.
 */

import { useState } from "react";
import { HomeIcon, AlarmIcon, CameraIcon, HelpIcon, BatteryIcon, SettingsIcon } from "./Icons";
import BatteryModal from "./BatteryModal";
import WizardTopbarSwitcher, { type ScanWizardStep } from "./WizardTopbarSwitcher";

const FLOW_TITLE = "New scan";

export type { ScanWizardStep };

export interface ScanFlowHeaderProps {
  currentStep: ScanWizardStep;
  onStepClick?: (step: ScanWizardStep) => void;
  /** When false, wizard segments are not clickable (pre-wizard screens). */
  wizardStepperInteractive?: boolean;
  onInfoClick: () => void;
  onHelpClick?: () => void;
  onBatteryClick?: () => void;
  onSettingsClick?: () => void;
  onCameraClick?: () => void;
}

export default function ScanFlowHeader({
  currentStep,
  onStepClick,
  wizardStepperInteractive = true,
  onInfoClick,
  onHelpClick,
  onBatteryClick,
  onSettingsClick,
  onCameraClick,
}: ScanFlowHeaderProps) {
  const [batteryModalOpen, setBatteryModalOpen] = useState(false);
  const handleBatteryClick = () => {
    if (onBatteryClick) {
      onBatteryClick();
      return;
    }
    setBatteryModalOpen((prev) => !prev);
  };

  return (
    <>
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
          {FLOW_TITLE}
        </span>
      </div>

      {/* Center: Wizard topbar switcher (Figma 6096-19093) */}
      <div className="flex items-center justify-center min-w-0">
        <WizardTopbarSwitcher
          currentStep={currentStep}
          onStepClick={onStepClick}
          interactive={wizardStepperInteractive}
        />
      </div>

      {/* Right: Camera + Alarm (View & Send only), then Help, Battery, Settings */}
      <div className="flex items-center justify-end gap-1 h-[var(--height-row)] min-w-0">
        {(currentStep === "view" || currentStep === "send") && (
          <>
            <button
              type="button"
              onClick={() => onCameraClick?.()}
              className="flex items-center justify-center p-3 rounded-lg size-[var(--height-row)] border-0 bg-transparent cursor-pointer hover:bg-surface-alt transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              aria-label="Camera"
            >
              <CameraIcon size={32} color="var(--color-icon-primary)" />
            </button>
            <button
              type="button"
              className="flex items-center justify-center p-3 rounded-lg size-[var(--height-row)] border-0 bg-transparent cursor-pointer hover:bg-surface-alt transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              aria-label="Alarm"
            >
              <AlarmIcon size={32} color="var(--color-icon-primary)" />
            </button>
          </>
        )}
        <button
          type="button"
          onClick={() => onHelpClick?.()}
          className="flex items-center justify-center p-3 rounded-lg size-[var(--height-row)] border-0 bg-transparent cursor-pointer hover:bg-surface-alt transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          aria-label="Support"
        >
          <HelpIcon size={32} color="var(--color-icon-primary)" />
        </button>
        <button
          type="button"
          onClick={handleBatteryClick}
          aria-label="Battery status"
          className={`flex items-center justify-center p-3 rounded-lg size-[var(--height-row)] border-0 cursor-pointer hover:bg-surface-alt transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${batteryModalOpen ? "bg-[var(--color-background-highlight-blue)]" : "bg-transparent"}`}
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
    {batteryModalOpen && !onBatteryClick && (
      <BatteryModal onClose={() => setBatteryModalOpen(false)} level={100} />
    )}
    </>
  );
}
