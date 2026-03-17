import { useEffect, useRef, useState, type ReactNode } from "react";
import { CaretDownIcon, CaretUpIcon, CheckIcon, CloseIcon, EraseIcon } from "./Icons";

type SettingsView = "main" | "brightness" | "volume" | "wifi" | "timezone" | "license" | "screen-casting" | "diagnostics" | "signature" | "localization" | "export" | "rx" | "system" | "account-pairing" | "itero" | "login" | "scan";

interface SettingsModalProps {
  onClose: () => void;
  brightness: number;
  onBrightnessChange: (value: number) => void;
  volume: number;
  onVolumeChange: (value: number) => void;
  initialView?: SettingsView;
}

const DEVICE_ITEMS: { id: string; label: string; icon: string }[] = [
  { id: "brightness", label: "Brightness", icon: "/settings/Icon-13.svg" },
  { id: "volume", label: "Volume", icon: "/settings/Icon-12.svg" },
  { id: "wifi", label: "WiFi", icon: "/settings/Vector-1.svg" },
  { id: "timezone", label: "Time Zone", icon: "/settings/Icon-11.svg" },
  { id: "screen-casting", label: "Screen Casting", icon: "/settings/Icon-10.svg" },
];

const USER_ITEMS: { id: string; label: string; icon: string }[] = [
  { id: "scan", label: "Scan Settings", icon: "/settings/Icon-8.svg" },
  { id: "rx", label: "RX Settings", icon: "/settings/Icon-7.svg" },
  { id: "signature", label: "Signature Settings", icon: "/settings/New%20message.svg" },
  { id: "localization", label: "Localization", icon: "/settings/Icon-5.svg" },
  { id: "account-pairing", label: "Account pairing", icon: "/settings/Icon-9.svg" },
  { id: "pin", label: "PIN", icon: "/settings/Icon-pin-code.svg" },
];

const LANGUAGE_OPTIONS: { id: string; label: string }[] = [
  { id: "en", label: "English" },
  { id: "de", label: "German - Deutsch" },
  { id: "es", label: "Spanish - Español" },
  { id: "fr", label: "French - Français" },
  { id: "fr-ca", label: "French - Canadian" },
  { id: "it", label: "Italian - Italiano" },
];

const DATE_FORMAT_OPTIONS: { id: string; label: string }[] = [
  { id: "ddmmyyyy", label: "DD/MM/YYYY" },
  { id: "mmddyyyy", label: "MM/DD/YYYY" },
  { id: "yyyymmdd", label: "YYYY/MM/DD" },
];

const EXPORT_DAYS_OPTIONS: { id: string; label: string }[] = [
  { id: "2", label: "2 Days" },
  { id: "4", label: "4 Days" },
  { id: "5", label: "5 Days" },
  { id: "6", label: "6 Days" },
  { id: "7", label: "7 Days" },
  { id: "8", label: "8 Days" },
];

const TOOTH_ID_OPTIONS: { id: string; label: string }[] = [
  { id: "quadrant", label: "Quadrant" },
  { id: "fda", label: "FDA" },
  { id: "ada", label: "ADA" },
  { id: "no-default", label: "No Default" },
];

const SHADE_SYSTEM_OPTIONS: { id: string; label: string }[] = [
  { id: "vita-lumin", label: "VITA Lumin" },
  { id: "vitapan-3d", label: "VITApan 3D master" },
  { id: "other", label: "Other" },
];

const PROCEDURE_OPTIONS: { id: string; label: string }[] = [
  { id: "denture", label: "Denture/Removable" },
  { id: "fixed", label: "Fixed Restorative" },
  { id: "implant", label: "Implant Planning" },
  { id: "invisalign", label: "Invisalign | Vivera" },
  { id: "study-model", label: "Study Model/iRecord" },
  { id: "no-default", label: "No Default" },
];

const TIMEZONE_OPTIONS: { id: string; label: string }[] = [
  { id: "jerusalem", label: "(UTC+02:00) Jerusalem" },
  { id: "juba", label: "(UTC+02:00) Juba" },
  { id: "kaliningrad", label: "(UTC+02:00) Kaliningrad" },
  { id: "khartoum", label: "(UTC+02:00) Khartoum" },
  { id: "tripoli", label: "(UTC+02:00) Tripoli" },
  { id: "windhoek", label: "(UTC+02:00) Windhoek" },
];

const LOGIN_HOURS_OPTIONS: { id: string; label: string }[] = [
  { id: "0", label: "0" },
  { id: "1", label: "1" },
  { id: "2", label: "2" },
  { id: "3", label: "3" },
  { id: "4", label: "4" },
  { id: "5", label: "5" },
  { id: "6", label: "6" },
  { id: "7", label: "7" },
  { id: "8", label: "8" },
];

const LOGIN_MINUTES_OPTIONS: { id: string; label: string }[] = [
  { id: "00", label: "00" },
  { id: "10", label: "10" },
  { id: "20", label: "20" },
  { id: "30", label: "30" },
  { id: "40", label: "40" },
  { id: "50", label: "50" },
];

const THIRD_PARTY_LICENSES: { id: string; label: string; licenseText: string }[] = [
  { id: "boost", label: "Boost", licenseText: "Boost Software License - Version 1.0. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
  { id: "ogre3d", label: "Ogre3d", licenseText: "MIT License. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris." },
  { id: "nlog", label: "NLog", licenseText: "BSD 3-Clause License. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat." },
  { id: "caliburn", label: "Caliburn.Micro", licenseText: "MIT License. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
  { id: "logofx", label: "LogoFX", licenseText: "Apache License 2.0. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation." },
  { id: "mahapps", label: "MahApps.Metro", licenseText: "MIT License. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
  { id: "simpleni", label: "Simpleni", licenseText: "License terms. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam." },
  { id: "writeablebitmapex", label: "WriteableBitmapEX", licenseText: "Microsoft Public License. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
  { id: "cefsharp", label: "CefSharp", licenseText: "BSD 3-Clause License. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur." },
];

const SYSTEM_ITEMS: { id: string; label: string; icon: string }[] = [
  { id: "login", label: "Login Settings", icon: "/settings/Icon-4.svg" },
  { id: "diagnostics", label: "Diagnostics", icon: "/settings/Icon-3.svg" },
  { id: "license", label: "License", icon: "/settings/Document%20signed1.svg" },
  { id: "system", label: "System", icon: "/settings/Icon-2.svg" },
  { id: "sync", label: "Sync Configuration", icon: "/settings/Icon-6.svg" },
  { id: "export", label: "Export Settings", icon: "/settings/Icon-1.svg" },
  { id: "itero", label: "iTero Lumina upgrade", icon: "/settings/Iconup.svg" },
];

const DIAGNOSTIC_ITEMS: { label: string; status: string }[] = [
  { label: "Network Connection...", status: "OK" },
  { label: "Align Servers...", status: "OK" },
  { label: "File Servers...", status: "OK" },
  { label: "Download Speed", status: "OK, 77.22 Mbps" },
  { label: "Upload Speed", status: "OK, 11.24 Mbps" },
];

function SettingsSection({
  title,
  items,
  activeId,
  onItemClick,
  columns,
}: {
  title: string;
  items: { id: string; label: string; icon: string }[];
  activeId: string | null;
  onItemClick: (id: string) => void;
  columns: number;
}) {
  return (
    <div className="flex flex-col" style={{ gap: "var(--spacing-04)" }}>
      <h3 className="tp-label-02 text-text-secondary">{title}</h3>
      <div
        className="grid w-full"
        style={{ gridTemplateColumns: `repeat(${columns}, 120px)`, gap: "var(--spacing-04)" }}
      >
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onItemClick(item.id)}
              className={`settings-tile flex flex-col items-center justify-start w-[120px] min-w-[120px] rounded-xl transition-ui-focus focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 ${
                isActive
                  ? "bg-[var(--color-background-highlight-gray)] text-text-primary"
                  : "bg-transparent text-text-primary hover:bg-surface-alt"
              }`}
              style={{ padding: "var(--spacing-03) var(--spacing-02)", gap: "var(--spacing-02)" }}
            >
              <img src={item.icon} alt="" className="w-9 h-9 object-contain object-center pointer-events-none shrink-0" aria-hidden />
              <span className="tp-body-03 text-center leading-tight break-words w-full">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MainSettingsView({ onClose, onNavigate }: { onClose: () => void; onNavigate: (view: SettingsView) => void }) {
  const handleItemClick = (id: string) => {
    if (id === "brightness") onNavigate("brightness");
    else if (id === "volume") onNavigate("volume");
    else if (id === "wifi") onNavigate("wifi");
    else if (id === "timezone") onNavigate("timezone");
    else if (id === "license") onNavigate("license");
    else if (id === "screen-casting") onNavigate("screen-casting");
    else if (id === "diagnostics") onNavigate("diagnostics");
    else if (id === "signature") onNavigate("signature");
    else if (id === "localization") onNavigate("localization");
    else if (id === "export") onNavigate("export");
    else if (id === "rx") onNavigate("rx");
    else if (id === "system") onNavigate("system");
    else if (id === "account-pairing") onNavigate("account-pairing");
    else if (id === "itero") onNavigate("itero");
    else if (id === "login") onNavigate("login");
    else if (id === "scan") onNavigate("scan");
  };

  return (
    <>
      <div className="flex items-center justify-between shrink-0" style={{ paddingBottom: "var(--spacing-04)" }}>
        <h2 className="tp-heading-04 text-text-primary">Settings</h2>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center justify-center p-2 rounded-lg border-0 bg-transparent cursor-pointer hover:bg-surface-alt transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 touch-target-min"
          aria-label="Close settings"
        >
          <CloseIcon size={24} color="var(--color-icon-primary)" />
        </button>
      </div>
      <div className="flex flex-col flex-1 min-h-0 overflow-y-auto scrollbar-table" style={{ gap: "var(--spacing-08)", paddingTop: "var(--spacing-04)" }}>
        {/* Device Settings */}
        <div className="flex flex-col">
          <SettingsSection
            title="Device Settings"
            items={DEVICE_ITEMS}
            activeId={null}
            onItemClick={handleItemClick}
            columns={5}
          />
        </div>
        <div className="border-t border-border-subtle" aria-hidden />
        {/* User Settings */}
        <div className="flex flex-col">
          <SettingsSection
            title="User Settings"
            items={USER_ITEMS}
            activeId={null}
            onItemClick={handleItemClick}
            columns={6}
          />
        </div>
        <div className="border-t border-border-subtle" aria-hidden />
        {/* System Settings */}
        <div className="flex flex-col">
          <SettingsSection
            title="System Settings"
            items={SYSTEM_ITEMS}
            activeId={null}
            onItemClick={handleItemClick}
            columns={7}
          />
        </div>
      </div>
    </>
  );
}

function BrightnessView({
  onBack,
  onClose,
  brightness,
  onBrightnessChange,
}: {
  onBack: () => void;
  onClose: () => void;
  brightness: number;
  onBrightnessChange: (value: number) => void;
}) {
  const [isAdjusting, setIsAdjusting] = useState(false);

  useEffect(() => {
    if (!isAdjusting) return;
    const clearAdjusting = () => setIsAdjusting(false);
    document.addEventListener("pointerup", clearAdjusting);
    return () => document.removeEventListener("pointerup", clearAdjusting);
  }, [isAdjusting]);

  return (
    <>
      <div
        className="flex items-center justify-between shrink-0 box-content"
        style={{ paddingBottom: "var(--spacing-04)" }}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center justify-center p-2 rounded-lg border-0 bg-transparent cursor-pointer hover:bg-surface-alt transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 touch-target-min"
            aria-label="Back"
          >
            <img src="/settings/Chevron left.svg" alt="" className="w-8 h-8" aria-hidden />
          </button>
          <h2 className="tp-heading-04 text-text-primary">Brightness</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center justify-center p-2 rounded-lg border-0 bg-transparent cursor-pointer hover:bg-surface-alt transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 shrink-0 touch-target-min"
          aria-label="Close"
        >
          <CloseIcon size={24} color="var(--color-icon-primary)" />
        </button>
      </div>
      <div
        className="flex flex-col flex-1 min-w-0 h-fit justify-start items-start w-full"
        style={{
          gap: "var(--spacing-04)",
          paddingTop: "calc(19 * var(--spacing-01))",
          paddingLeft: "calc(14 * var(--spacing-01))",
        }}
      >
        <div
          className="flex flex-col min-w-0 justify-center items-start"
          style={{ width: 532, gap: "var(--spacing-02)" }}
        >
          <div
            className={`flex items-center gap-2 w-full ${isAdjusting ? "brightness-adjusting" : ""}`}
            style={{ maxWidth: 476 }}
          >
            <div
              className="relative flex-1 min-w-0 flex flex-col justify-center items-center"
              style={{ ["--slider-value" as string]: `${brightness}%` }}
            >
              <input
                type="range"
                min={0}
                max={100}
                value={brightness}
                onChange={(e) => onBrightnessChange(Number(e.target.value))}
                onPointerDown={() => setIsAdjusting(true)}
                onPointerUp={() => setIsAdjusting(false)}
                onPointerLeave={() => setIsAdjusting(false)}
                style={{ ["--slider-value" as string]: `${brightness}%` }}
                className="brightness-slider w-full block"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={brightness}
                aria-valuetext={isAdjusting ? `${brightness}% adjusting` : `${brightness}%`}
              />
              <span
                className="brightness-value-tooltip tp-label-02 text-white tabular-nums"
                style={{ bottom: "calc(100% + 28px)" }}
                aria-live="polite"
              >
                {brightness}
              </span>
            </div>
            <img src="/settings/Brightness-contrast.svg" alt="" className="w-8 h-8 shrink-0 pointer-events-none opacity-70" aria-hidden />
          </div>
          <div
            className="flex justify-between items-center tp-label-02 text-text-primary"
            style={{ width: 476 }}
          >
            <span>0</span>
            <span>100</span>
          </div>
        </div>
      </div>
    </>
  );
}

function VolumeView({
  onBack,
  onClose,
  volume,
  onVolumeChange,
}: {
  onBack: () => void;
  onClose: () => void;
  volume: number;
  onVolumeChange: (value: number) => void;
}) {
  const [isAdjusting, setIsAdjusting] = useState(false);

  useEffect(() => {
    if (!isAdjusting) return;
    const clearAdjusting = () => setIsAdjusting(false);
    document.addEventListener("pointerup", clearAdjusting);
    return () => document.removeEventListener("pointerup", clearAdjusting);
  }, [isAdjusting]);

  return (
    <>
      <div
        className="flex items-center justify-between shrink-0 box-content"
        style={{ paddingBottom: "var(--spacing-04)" }}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center justify-center p-2 rounded-lg border-0 bg-transparent cursor-pointer hover:bg-surface-alt transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 touch-target-min"
            aria-label="Back"
          >
            <img src="/settings/Chevron left.svg" alt="" className="w-8 h-8" aria-hidden />
          </button>
          <h2 className="tp-heading-04 text-text-primary">Volume</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center justify-center p-2 rounded-lg border-0 bg-transparent cursor-pointer hover:bg-surface-alt transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 shrink-0 touch-target-min"
          aria-label="Close"
        >
          <CloseIcon size={24} color="var(--color-icon-primary)" />
        </button>
      </div>
      <div
        className="flex flex-col flex-1 min-w-0 h-fit justify-start items-start w-full"
        style={{
          gap: "var(--spacing-04)",
          paddingTop: "calc(19 * var(--spacing-01))",
          paddingLeft: "calc(14 * var(--spacing-01))",
        }}
      >
        <div
          className="flex flex-col min-w-0 justify-center items-start"
          style={{ width: 532, gap: "var(--spacing-02)" }}
        >
          <div
            className={`flex items-center gap-2 w-full ${isAdjusting ? "brightness-adjusting" : ""}`}
            style={{ maxWidth: 476 }}
          >
            <div
              className="relative flex-1 min-w-0 flex flex-col justify-center items-center"
              style={{ ["--slider-value" as string]: `${volume}%` }}
            >
              <input
                type="range"
                min={0}
                max={100}
                value={volume}
                onChange={(e) => onVolumeChange(Number(e.target.value))}
                onPointerDown={() => setIsAdjusting(true)}
                onPointerUp={() => setIsAdjusting(false)}
                onPointerLeave={() => setIsAdjusting(false)}
                style={{ ["--slider-value" as string]: `${volume}%` }}
                className="brightness-slider w-full block"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={volume}
                aria-valuetext={isAdjusting ? `${volume}% adjusting` : `${volume}%`}
              />
              <span
                className="volume-value-tooltip tp-label-02 text-white tabular-nums"
                style={{ bottom: "calc(100% + 28px)" }}
                aria-live="polite"
              >
                {volume}
              </span>
            </div>
            <img
              src="/settings/Volume-up-outline.svg"
              alt=""
              className="w-8 h-8 shrink-0 pointer-events-none opacity-70"
              aria-hidden
            />
          </div>
          <div
            className="flex justify-between items-center tp-label-02 text-text-primary"
            style={{ width: 476 }}
          >
            <span>0</span>
            <span>100</span>
          </div>
        </div>
      </div>
    </>
  );
}

/** Scan Settings — Figma 928-20703 (UI Refresh 2025 Settings). Structure, gaps, row 816px, pl 76 / pr 60. */
const SCAN_POSITION_OPTIONS: { id: string; label: string }[] = [
  { id: "in-front", label: "In front of the patient" },
  { id: "behind", label: "Behind the patient" },
];
const GYRO_ORIENTATION_OPTIONS: { id: string; label: string }[] = [
  { id: "wand-toward-screen", label: "Wand Tip Toward Screen" },
  { id: "wand-away-screen", label: "Wand Tip Away from Screen" },
];
const SCAN_ORDER_OPTIONS: { id: string; label: string }[] = [
  { id: "upper-first", label: "Upper Jaw first" },
  { id: "lower-first", label: "Lower Jaw first" },
];
const RESTORATIVE_JAW_ORDER_OPTIONS: { id: string; label: string }[] = [
  { id: "prep-first", label: "Prep Jaw first" },
  { id: "crown-first", label: "Crown Jaw first" },
];
const RESTORATIVE_PREPS_ORDER_OPTIONS: { id: string; label: string }[] = [
  { id: "upper-first", label: "Upper Jaw first" },
  { id: "lower-first", label: "Lower Jaw first" },
];

function ScanSettingsView({ onBack, onClose }: { onBack: () => void; onClose: () => void }) {
  const [scanningPositionId, setScanningPositionId] = useState("in-front");
  const [gyroOrientationId, setGyroOrientationId] = useState("wand-toward-screen");
  const [touchpadOrientationId, setTouchpadOrientationId] = useState("wand-toward-screen");
  const [scanOrderId, setScanOrderId] = useState("upper-first");
  const [restorativeJawOrderId, setRestorativeJawOrderId] = useState("prep-first");
  const [restorativePrepsOrderId, setRestorativePrepsOrderId] = useState("upper-first");
  const [mirrorViewfinder, setMirrorViewfinder] = useState(false);
  const [showColorWhileScanning, setShowColorWhileScanning] = useState(true);
  const [enableGuidanceHints, setEnableGuidanceHints] = useState(true);
  const [highlightScanningRange, setHighlightScanningRange] = useState(true);
  const [orthodonticFeedback, setOrthodonticFeedback] = useState(true);
  const [restorativeFeedback, setRestorativeFeedback] = useState(true);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contentRef.current?.contains(e.target as Node)) return;
      setOpenDropdown(null);
    };
    document.addEventListener("pointerdown", handleClickOutside);
    return () => document.removeEventListener("pointerdown", handleClickOutside);
  }, []);

  const renderDropdown = (
    id: string,
    label: string,
    value: string,
    options: { id: string; label: string }[],
    onChange: (id: string) => void
  ) => {
    const isOpen = openDropdown === id;
    const selected = options.find((o) => o.id === value) ?? options[0];
    return (
      <div className="relative flex flex-col flex-1 min-w-0">
        <button
          type="button"
          onClick={() => setOpenDropdown(isOpen ? null : id)}
          className={`flex items-center justify-between w-full rounded-lg border text-left transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 ${
            isOpen ? "border-[var(--color-border-interactive)] bg-[var(--color-background-layer-02)]" : "border-border-subtle bg-[var(--color-background-layer-02)] hover:bg-[var(--color-background-layer-hovered)]"
          }`}
          style={{ padding: "var(--spacing-03) var(--spacing-04)", height: "var(--height-row)" }}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label={label}
        >
          <span className="tp-body-02 text-text-primary truncate">{selected.label}</span>
          {isOpen ? <CaretUpIcon size={24} color="var(--color-icon-primary)" className="shrink-0" /> : <CaretDownIcon size={24} color="var(--color-icon-secondary)" className="shrink-0" />}
        </button>
        {isOpen && (
          <ul
            role="listbox"
            aria-label={label}
            className="absolute left-0 right-0 top-full z-20 mt-1 flex max-h-60 flex-col overflow-auto rounded-lg border border-border-subtle bg-[var(--color-background-elevated)] [&>li+li]:border-t [&>li+li]:border-border-subtle scrollbar-table"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            {options.map((opt) => (
              <li key={opt.id} role="option" aria-selected={opt.id === value}>
                <button
                  type="button"
                  onClick={() => { onChange(opt.id); setOpenDropdown(null); }}
                  className={`flex w-full items-center gap-3 text-left transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-border-focus)] text-text-primary ${opt.id === value ? "bg-[var(--color-background-layer-01)]" : "hover:bg-[var(--color-background-layer-hovered)]"}`}
                  style={{ padding: "var(--spacing-03) var(--spacing-04)", height: 60 }}
                >
                  {opt.id === value ? <CheckIcon size={24} color="var(--color-icon-primary)" className="shrink-0" /> : <span className="w-6 shrink-0" aria-hidden />}
                  <span className="tp-body-02">{opt.label}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  /** Figma 928-20703: row w-[816px], label w-[448px], gap 8px, dropdown flex-1 (360px). */
  const renderRow = (label: string, control: ReactNode) => (
    <div className="flex items-center w-full" style={{ width: 816, maxWidth: "100%", gap: "var(--spacing-02)" }}>
      <div className="min-w-0 overflow-hidden" style={{ width: 448, maxWidth: "55%" }}>
        <span className="tp-heading-02 text-text-primary truncate block">{label}</span>
      </div>
      <div className="flex flex-1 min-w-0">{control}</div>
    </div>
  );

  /** Figma 928-20744: same row layout as dropdown rows (816px, label 448px, gap 8px) so toggles align with dropdowns */
  const renderToggle = (label: string, checked: boolean, onChange: (v: boolean) => void) => (
    <div className="flex items-center w-full rounded-lg" style={{ width: 816, maxWidth: "100%", minHeight: 60, paddingTop: "var(--spacing-03)", paddingBottom: "var(--spacing-03)", gap: "var(--spacing-02)" }}>
      <div className="min-w-0 overflow-hidden" style={{ width: 448, maxWidth: "55%" }}>
        <span className="tp-heading-02 text-text-primary truncate block">{label}</span>
      </div>
      <div className="flex flex-1 min-w-0 justify-end shrink-0">
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={label}
          onClick={() => onChange(!checked)}
          className="relative inline-flex h-7 w-12 shrink-0 rounded-full border-0 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background-layer-01)]"
          style={{ backgroundColor: checked ? "var(--color-border-interactive)" : "var(--color-background-layer-02)" }}
        >
          <span className="pointer-events-none inline-block h-6 w-6 translate-y-0.5 rounded-full bg-white shadow ring-0 transition-transform" style={{ transform: checked ? "translateX(22px)" : "translateX(4px)" }} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col flex-1 min-h-0 min-w-0">
      <div className="flex items-center justify-between shrink-0 h-[60px]" style={{ paddingBottom: "var(--spacing-04)", gap: "var(--spacing-04)" }}>
        <div className="flex items-center" style={{ gap: "var(--spacing-04)" }}>
          <button type="button" onClick={onBack} className="flex items-center justify-center rounded-lg border-0 bg-transparent cursor-pointer hover:bg-surface-alt transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 shrink-0" style={{ width: 60, height: 60 }} aria-label="Back to Settings">
            <img src="/settings/Chevron left.svg" alt="" className="w-8 h-8" aria-hidden />
          </button>
          <h2 className="tp-heading-04 text-text-primary">Scan settings</h2>
        </div>
        <button type="button" onClick={onClose} className="flex items-center justify-center rounded-lg border-0 bg-transparent cursor-pointer hover:bg-surface-alt transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 shrink-0" style={{ width: 60, height: 60 }} aria-label="Close settings">
          <CloseIcon size={24} color="var(--color-icon-primary)" />
        </button>
      </div>

      {/* Figma 928:20712–20713: content pl 76px (19×4), pt 16px, pr 60px (15×4), pb 24px — 4px grid */}
      <div ref={contentRef} className="flex flex-1 flex-col min-h-0 min-w-0 overflow-y-auto scrollbar-hidden" style={{ marginLeft: 76, marginRight: 60, paddingTop: "var(--spacing-04)", paddingBottom: "var(--spacing-06)" }}>
        {/* Figma 928-20715: content width 816, gap spacing-06 (24px) between sections */}
        <div className="flex flex-col" style={{ width: 816, maxWidth: "100%", gap: "var(--spacing-06)" }}>
          {/* 928:20716 — Section 1: dropdowns + Mirror/Show toggles, gap spacing-03. Inner 20718 gap spacing-04 (16px) between the two groups. */}
          <div className="flex flex-col w-full" style={{ gap: "var(--spacing-03)" }}>
            <div className="flex flex-col w-full" style={{ gap: "var(--spacing-04)" }}>
              {/* 928:20720 — 3 dropdown rows, gap spacing-03 */}
              <div className="flex flex-col w-full" style={{ gap: "var(--spacing-03)" }}>
                {renderRow("Scanning Position", renderDropdown("scanning-position", "Scanning Position", scanningPositionId, SCAN_POSITION_OPTIONS, setScanningPositionId))}
                {renderRow("Gyro Orientation", renderDropdown("gyro", "Gyro Orientation", gyroOrientationId, GYRO_ORIENTATION_OPTIONS, setGyroOrientationId))}
                {renderRow("Touchpad Orientation", renderDropdown("touchpad", "Touchpad Orientation", touchpadOrientationId, GYRO_ORIENTATION_OPTIONS, setTouchpadOrientationId))}
              </div>
              {/* 928:20743 — Mirror / Show color toggles, gap spacing-03 */}
              <div className="flex flex-col w-full" style={{ gap: "var(--spacing-03)" }}>
                {renderToggle("Mirror Viewfinder for upper Jaw", mirrorViewfinder, setMirrorViewfinder)}
                {renderToggle("Show color while scanning", showColorWhileScanning, setShowColorWhileScanning)}
              </div>
            </div>
          </div>
          {/* Figma 928:20750 — Scan Order + Restorative Jaw Order + Restorative Preps Order, gap spacing-03 (12px) */}
          <div className="flex flex-col w-full" style={{ width: 816, maxWidth: "100%", gap: "var(--spacing-03)" }}>
            {renderRow("Scan Order", renderDropdown("scan-order", "Scan Order", scanOrderId, SCAN_ORDER_OPTIONS, setScanOrderId))}
            {renderRow("Restorative Jaw Order", renderDropdown("restorative-jaw", "Restorative Jaw Order", restorativeJawOrderId, RESTORATIVE_JAW_ORDER_OPTIONS, setRestorativeJawOrderId))}
            {renderRow("Restorative Preps Order", renderDropdown("restorative-preps", "Restorative Preps Order", restorativePrepsOrderId, RESTORATIVE_PREPS_ORDER_OPTIONS, setRestorativePrepsOrderId))}
          </div>
          {/* 928:20766 — Section 3: Enable guidance + Highlight, gap spacing-03 */}
          <div className="flex flex-col w-full" style={{ gap: "var(--spacing-03)" }}>
            {renderToggle("Enable guidance hints", enableGuidanceHints, setEnableGuidanceHints)}
            {renderToggle("Highlight recommended scanning range", highlightScanningRange, setHighlightScanningRange)}
          </div>
          {/* 928:20769 — Section 4: Additional Scan Feedback — gap spacing-02 (label + divider), then gap spacing-03 (toggles) */}
          <div className="flex flex-col w-full" style={{ gap: "var(--spacing-02)" }}>
            <p className="tp-body-02 text-text-secondary">Additional Scan Feedback</p>
            {/* 928:20925 — Divider h-8, border at top 3px */}
            <div className="w-full overflow-hidden relative" style={{ height: 8 }} aria-hidden>
              <div className="absolute left-0 right-0 border-t border-border-subtle" style={{ top: 3 }} />
            </div>
            <div className="flex flex-col w-full" style={{ gap: "var(--spacing-03)" }}>
              {renderToggle("Orthodontic", orthodonticFeedback, setOrthodonticFeedback)}
              {renderToggle("Restorative", restorativeFeedback, setRestorativeFeedback)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** WiFi network row: name, strength (0–100), status (connected | connection_error | null). Figma 147:4179. */
type WifiNetwork = { id: string; name: string; strength: number; status: "connected" | "connection_error" | null };

const WIFI_NETWORKS_MOCK: WifiNetwork[] = [
  { id: "lia", name: "lia", strength: 81, status: "connected" },
  { id: "hidden", name: "Hidden Network", strength: 80, status: null },
  { id: "shamai", name: "Shamai-2.4", strength: 34, status: null },
  { id: "nokino", name: "nokino", strength: 30, status: "connection_error" },
  { id: "sk24", name: "Sk2.4", strength: 30, status: null },
  { id: "romys", name: "ROMYS", strength: 28, status: null },
];

/** Status pills per Figma/PNG: Connected = light green bg + white text; Connection Error = light grey bg + dark text. */
function WifiStatusBadge({ status }: { status: "connected" | "connection_error" }) {
  if (status === "connected") {
    return (
      <span
        className="shrink-0 inline-flex items-center justify-center tp-label-02 whitespace-nowrap rounded-md py-1.5 px-3"
        style={{
          backgroundColor: "var(--color-background-highlight-green)",
          color: "var(--color-text-on-highlight-green)",
        }}
      >
        Connected
      </span>
    );
  }
  return (
    <span
      className="shrink-0 inline-flex items-center justify-center tp-label-02 whitespace-nowrap rounded-md py-1.5 px-3"
      style={{
        backgroundColor: "var(--color-background-highlight-gray)",
        color: "var(--color-text-primary)",
      }}
    >
      Connection Error
    </span>
  );
}

function WiFiSettingsView({ onBack, onClose }: { onBack: () => void; onClose: () => void }) {
  const [wifiSubView, setWifiSubView] = useState<"list" | "advanced">("list");
  const [selectedNetworkId, setSelectedNetworkId] = useState<string | null>(null);
  /** "no_internet" = empty list + "No Internet Access" in header; "none" = normal list; "no_selection" = "No network selected" when none selected */
  const [headerStatus, _setHeaderStatus] = useState<"none" | "no_network_selected" | "no_internet_access">("no_network_selected");
  const [networks, _setNetworks] = useState<WifiNetwork[]>(WIFI_NETWORKS_MOCK);
  const [automaticIp, setAutomaticIp] = useState(true);
  const [automaticDns, setAutomaticDns] = useState(true);
  const adapterRef = useRef<HTMLDivElement>(null);
  const [adapterOpen, setAdapterOpen] = useState(false);
  const ADAPTER_OPTIONS = [{ id: "wifi", label: "Wifi" }];
  const selectedAdapter = ADAPTER_OPTIONS[0];

  useEffect(() => {
    if (!adapterOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (adapterRef.current && !adapterRef.current.contains(e.target as Node)) setAdapterOpen(false);
    };
    document.addEventListener("pointerdown", handleClickOutside);
    return () => document.removeEventListener("pointerdown", handleClickOutside);
  }, [adapterOpen]);

  const selectedNetwork = selectedNetworkId ? networks.find((n) => n.id === selectedNetworkId) : null;
  const showForget = selectedNetwork && (selectedNetwork.status === "connected" || selectedNetwork.status === "connection_error");
  const showEmptyList = headerStatus === "no_internet_access";

  if (wifiSubView === "advanced") {
    return (
      <>
        <div
          className="flex items-center justify-between shrink-0 box-content"
          style={{ paddingBottom: "var(--spacing-04)" }}
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setWifiSubView("list")}
              className="flex items-center justify-center p-2 rounded-lg border-0 bg-transparent cursor-pointer hover:bg-surface-alt transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 touch-target-min"
              aria-label="Back"
            >
              <img src="/settings/Chevron left.svg" alt="" className="w-8 h-8" aria-hidden />
            </button>
            <h2 className="tp-heading-04 text-text-primary">IP Adress</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center p-2 rounded-lg border-0 bg-transparent cursor-pointer hover:bg-surface-alt transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 shrink-0 touch-target-min"
            aria-label="Close"
          >
            <CloseIcon size={24} color="var(--color-icon-primary)" />
          </button>
        </div>
        <div
          className="flex flex-col flex-1 min-w-0 overflow-y-auto"
          style={{
            paddingTop: "var(--spacing-06)",
            paddingLeft: "calc(14 * var(--spacing-01))",
            paddingRight: "calc(14 * var(--spacing-01))",
          }}
        >
          <div className="flex flex-col w-full" style={{ maxWidth: 816, gap: "var(--spacing-06)" }}>
            <div className="flex flex-col" style={{ gap: "var(--spacing-02)" }}>
              <label htmlFor="wifi-adapter" className="tp-label-01 text-text-primary">
                Adapter *
              </label>
              <div ref={adapterRef} className="relative flex flex-col w-full">
                <button
                  id="wifi-adapter"
                  type="button"
                  onClick={() => setAdapterOpen((o) => !o)}
                  className={`flex items-center justify-between w-full rounded-lg border text-left transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 ${
                    adapterOpen ? "border-[var(--color-border-interactive)] bg-[var(--color-background-layer-02)]" : "border-border-subtle bg-[var(--color-background-layer-02)] hover:bg-[var(--color-background-layer-hovered)]"
                  }`}
                  style={{ padding: "var(--spacing-03) var(--spacing-04)", height: "var(--height-row)" }}
                  aria-expanded={adapterOpen}
                  aria-haspopup="listbox"
                  aria-label="Adapter"
                >
                  <span className="tp-body-02 text-text-primary">{selectedAdapter.label}</span>
                  {adapterOpen ? (
                    <CaretUpIcon size={24} color="var(--color-icon-primary)" className="shrink-0" />
                  ) : (
                    <CaretDownIcon size={24} color="var(--color-icon-secondary)" className="shrink-0" />
                  )}
                </button>
                {adapterOpen && (
                  <ul
                    role="listbox"
                    aria-labelledby="wifi-adapter"
                    className="absolute left-0 top-full z-20 mt-1 flex max-h-60 w-full flex-col overflow-auto rounded-lg border border-border-subtle bg-[var(--color-background-elevated)] [&>li+li]:border-t [&>li+li]:border-border-subtle"
                    style={{ minHeight: 0, boxShadow: "var(--shadow-card)" }}
                  >
                    {ADAPTER_OPTIONS.map((opt) => (
                      <li key={opt.id} role="option" aria-selected={selectedAdapter.id === opt.id}>
                        <button
                          type="button"
                          onClick={() => { setAdapterOpen(false); }}
                          className="flex w-full items-center gap-3 text-left transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-border-focus)] hover:bg-[var(--color-background-layer-hovered)] text-text-primary"
                          style={{ padding: "var(--spacing-03) var(--spacing-04)", height: "var(--height-row)" }}
                        >
                          <span className="tp-body-02">{opt.label}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="wifi-auto-ip"
                checked={automaticIp}
                onChange={(e) => setAutomaticIp(e.target.checked)}
                className="checkbox-scanner rounded"
                aria-label="Automatic IP Adress"
              />
              <label htmlFor="wifi-auto-ip" className="tp-body-02 text-text-primary cursor-pointer">
                Automatic IP Adress
              </label>
            </div>
            {!automaticIp && (
              <div className="flex flex-col" style={{ gap: "var(--spacing-04)" }}>
                <div className="flex flex-col" style={{ gap: "var(--spacing-02)" }}>
                  <label htmlFor="wifi-ip" className="tp-label-01 text-text-primary">IP Adress</label>
                  <input
                    id="wifi-ip"
                    type="text"
                    placeholder="Placeholder text"
                    className="w-full rounded-lg border border-border-subtle bg-[var(--color-background-layer-02)] tp-body-02 text-text-primary placeholder:text-text-secondary"
                    style={{ padding: "var(--spacing-03) var(--spacing-04)", height: "var(--height-row)" }}
                  />
                </div>
                <div className="flex flex-col" style={{ gap: "var(--spacing-02)" }}>
                  <label htmlFor="wifi-subnet" className="tp-label-01 text-text-primary">Subnet maslic</label>
                  <input
                    id="wifi-subnet"
                    type="text"
                    placeholder="Placeholder text"
                    className="w-full rounded-lg border border-border-subtle bg-[var(--color-background-layer-02)] tp-body-02 text-text-primary placeholder:text-text-secondary"
                    style={{ padding: "var(--spacing-03) var(--spacing-04)", height: "var(--height-row)" }}
                  />
                </div>
                <div className="flex flex-col" style={{ gap: "var(--spacing-02)" }}>
                  <label htmlFor="wifi-gateway" className="tp-label-01 text-text-primary">Default gateway</label>
                  <input
                    id="wifi-gateway"
                    type="text"
                    placeholder="Placeholder text"
                    className="w-full rounded-lg border border-border-subtle bg-[var(--color-background-layer-02)] tp-body-02 text-text-primary placeholder:text-text-secondary"
                    style={{ padding: "var(--spacing-03) var(--spacing-04)", height: "var(--height-row)" }}
                  />
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="wifi-auto-dns"
                checked={automaticDns}
                onChange={(e) => setAutomaticDns(e.target.checked)}
                className="checkbox-scanner rounded"
                aria-label="Automatic DNS"
              />
              <label htmlFor="wifi-auto-dns" className="tp-body-02 text-text-primary cursor-pointer">
                Automatic DNS
              </label>
            </div>
            {!automaticDns && (
              <div className="flex flex-col" style={{ gap: "var(--spacing-02)" }}>
                <label htmlFor="wifi-primary-dns" className="tp-label-01 text-text-primary">Primary DNS</label>
                <input
                  id="wifi-primary-dns"
                  type="text"
                  placeholder="Placeholder text"
                  className="w-full rounded-lg border border-border-subtle bg-[var(--color-background-layer-02)] tp-body-02 text-text-primary placeholder:text-text-secondary"
                  style={{ padding: "var(--spacing-03) var(--spacing-04)", height: "var(--height-row)" }}
                />
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  /* Figma 147:4179 — Wi-Fi list: header (back + title), table, footer (Connect + Advanced only) */
  return (
    <>
      {/* Header: back chevron + "Wi-Fi" title; Close for modal */}
      <div
        className="flex items-center justify-between shrink-0"
        style={{ paddingBottom: "var(--spacing-04)" }}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center justify-center p-2 rounded-lg border-0 bg-transparent cursor-pointer hover:bg-surface-alt transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 touch-target-min"
            aria-label="Back"
          >
            <img src="/settings/Chevron left.svg" alt="" className="w-8 h-8" aria-hidden />
          </button>
          <h2 className="tp-heading-04 text-text-primary">Wi-Fi</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center justify-center p-2 rounded-lg border-0 bg-transparent cursor-pointer hover:bg-surface-alt transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 shrink-0 touch-target-min"
          aria-label="Close"
        >
          <CloseIcon size={24} color="var(--color-icon-primary)" />
        </button>
      </div>
      {/* Table: "Connected" label above Status column, then column headers, then rows. No left indent per design. */}
      <div
        className="flex flex-col flex-1 min-h-0 min-w-0 overflow-hidden"
        style={{
          minHeight: 0,
          paddingLeft: "64px",
          paddingRight: "60px",
        }}
      >
        {/* Row above headers: overall connection status (Figma) */}
        <div
          className="grid w-full shrink-0 bg-[var(--color-background-layer-01)] items-center"
          style={{
            gridTemplateColumns: "1fr 80px 120px",
            minHeight: "var(--height-row)",
            paddingLeft: 0,
            paddingRight: "var(--spacing-04)",
            columnGap: "var(--spacing-04)",
          }}
        >
          <span className="min-w-0" aria-hidden />
          <span className="text-center" aria-hidden />
          <span className="tp-body-02 text-text-primary text-right">Connected</span>
        </div>
        <div
          className="grid w-full shrink-0 bg-[var(--color-background-layer-01)] border-b border-border-subtle items-center"
          style={{
            gridTemplateColumns: "1fr 80px 120px",
            minHeight: "var(--height-row)",
            paddingLeft: 0,
            paddingRight: "var(--spacing-04)",
            columnGap: "var(--spacing-04)",
          }}
        >
          <span className="tp-label-02 text-text-secondary min-w-0 text-left truncate">Network</span>
          <span className="tp-label-02 text-text-secondary text-center">Strength</span>
          <span className="tp-label-02 text-text-secondary text-right">Status</span>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto">
          {showEmptyList ? (
            <div className="min-h-[120px]" aria-hidden />
          ) : (
            networks.map((net) => {
              const isSelected = selectedNetworkId === net.id;
              return (
                <button
                  key={net.id}
                  type="button"
                  onClick={() => setSelectedNetworkId(isSelected ? null : net.id)}
                  className={`grid w-full text-left border-b border-border-subtle transition-ui transition-ui-focus focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-border-focus)] hover:bg-[var(--color-background-layer-hovered)] items-center ${
                    isSelected ? "bg-[var(--color-background-highlight-blue)]" : ""
                  }`}
                  style={{
                    gridTemplateColumns: "1fr 80px 120px",
                    minHeight: "var(--height-row)",
                    paddingLeft: 0,
                    paddingRight: "var(--spacing-04)",
                    columnGap: "var(--spacing-04)",
                  }}
                >
                  <span className="tp-body-02 text-text-primary min-w-0 truncate">{net.name}</span>
                  <span className="tp-body-02 text-text-primary tabular-nums text-center">{net.strength}</span>
<span className="flex justify-center items-start min-w-0">
                      {net.status ? <WifiStatusBadge status={net.status} /> : null}
                    </span>
                </button>
              );
            })
          )}
        </div>
      </div>
      {/* Footer: spacing-04 above buttons per design */}
      <div
        className="flex items-center justify-end shrink-0 bg-[var(--color-background-layer-01)] border-t border-border-subtle"
        style={{
          paddingTop: "var(--spacing-04)",
          paddingBottom: "var(--spacing-04)",
          paddingLeft: "var(--spacing-04)",
          paddingRight: "var(--spacing-04)",
          gap: "var(--spacing-04)",
        }}
      >
        {showForget && (
          <button
            type="button"
            className="tp-label-02 h-[var(--height-row)] min-h-[36px] px-4 rounded-lg border border-border-subtle bg-[var(--color-background-layer-01)] text-text-primary hover:bg-surface-alt transition-ui transition-ui-focus transition-press active-press cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2"
          >
            Forget
          </button>
        )}
        <button
          type="button"
          className="tp-label-02 h-[var(--height-row)] min-h-[36px] px-4 rounded-lg border border-border-subtle bg-[var(--color-background-layer-01)] text-text-primary hover:bg-surface-alt transition-ui transition-ui-focus transition-press active-press cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2"
        >
          Connect
        </button>
        <button
          type="button"
          onClick={() => setWifiSubView("advanced")}
          className="tp-label-02 h-[var(--height-row)] min-h-[36px] px-4 rounded-lg border border-border-subtle bg-[var(--color-background-layer-01)] text-text-primary hover:bg-surface-alt transition-ui transition-ui-focus transition-press active-press cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2"
        >
          Advanced...
        </button>
      </div>
    </>
  );
}

function TimeZoneView({ onBack, onClose }: { onBack: () => void; onClose: () => void }) {
  const [selectedId, setSelectedId] = useState("jerusalem");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = TIMEZONE_OPTIONS.find((o) => o.id === selectedId) ?? TIMEZONE_OPTIONS[0];

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("pointerdown", handleClickOutside);
    return () => document.removeEventListener("pointerdown", handleClickOutside);
  }, [isOpen]);

  return (
    <>
      <div
        className="flex items-center justify-between shrink-0 box-content"
        style={{ paddingBottom: "var(--spacing-04)" }}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center justify-center p-2 rounded-lg border-0 bg-transparent cursor-pointer hover:bg-surface-alt transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 touch-target-min"
            aria-label="Back"
          >
            <img src="/settings/Chevron left.svg" alt="" className="w-8 h-8" aria-hidden />
          </button>
          <h2 className="tp-heading-04 text-text-primary">Time Zone</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center justify-center p-2 rounded-lg border-0 bg-transparent cursor-pointer hover:bg-surface-alt transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 shrink-0 touch-target-min"
          aria-label="Close"
        >
          <CloseIcon size={24} color="var(--color-icon-primary)" />
        </button>
      </div>
      <div
        className="flex flex-col flex-1 min-w-0 overflow-y-auto"
        style={{ paddingTop: "var(--spacing-06)", paddingLeft: "calc(14 * var(--spacing-01))" }}
      >
        <div ref={containerRef} className="relative flex flex-col w-full" style={{ width: 816 }}>
          <button
            type="button"
            onClick={() => setIsOpen((o) => !o)}
            className={`flex items-center justify-between w-full rounded-lg border text-left transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 ${
              isOpen
                ? "border-[var(--color-border-interactive)] bg-[#f4f4f4]"
                : "border-border-subtle bg-[#f4f4f4] hover:bg-[var(--color-background-layer-hovered)]"
            }`}
            style={{ padding: "var(--spacing-03) var(--spacing-04)", width: 816, height: "var(--height-row)" }}
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-label="Time zone"
            id="timezone-trigger"
          >
            <span className="tp-body-02 text-text-primary">{selectedOption.label}</span>
            {isOpen ? (
              <CaretUpIcon size={24} color="var(--color-icon-primary)" className="shrink-0" />
            ) : (
              <CaretDownIcon size={24} color="var(--color-icon-secondary)" className="shrink-0" />
            )}
          </button>

          {isOpen && (
            <ul
              role="listbox"
              aria-labelledby="timezone-trigger"
              className="absolute left-0 top-full z-20 mt-1 flex max-h-60 w-full flex-col overflow-auto rounded-lg border border-border-subtle bg-[var(--color-background-elevated)] [&>li+li]:border-t [&>li+li]:border-border-subtle"
              style={{ minHeight: 0, boxShadow: "var(--shadow-card)", width: 816 }}
            >
              {TIMEZONE_OPTIONS.map((opt) => {
                const isSelected = opt.id === selectedId;
                return (
                  <li key={opt.id} role="option" aria-selected={isSelected}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedId(opt.id);
                        setIsOpen(false);
                      }}
                      className="flex w-full items-center gap-3 text-left transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-border-focus)] hover:bg-[var(--color-background-layer-hovered)] text-text-primary"
                      style={{ padding: "var(--spacing-03) var(--spacing-04)", height: "var(--height-row)" }}
                    >
                      {isSelected ? (
                        <CheckIcon size={24} color="var(--color-icon-primary)" className="shrink-0" />
                      ) : (
                        <span className="w-6 shrink-0" aria-hidden />
                      )}
                      <span className="tp-body-02">{opt.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

function LoginSettingsView({ onBack, onClose }: { onBack: () => void; onClose: () => void }) {
  const [hoursId, setHoursId] = useState("1");
  const [minutesId, setMinutesId] = useState("00");
  const [hoursOpen, setHoursOpen] = useState(false);
  const [minutesOpen, setMinutesOpen] = useState(false);
  const hoursRef = useRef<HTMLDivElement>(null);
  const minutesRef = useRef<HTMLDivElement>(null);

  const selectedHours = LOGIN_HOURS_OPTIONS.find((o) => o.id === hoursId) ?? LOGIN_HOURS_OPTIONS[0];
  const selectedMinutes = LOGIN_MINUTES_OPTIONS.find((o) => o.id === minutesId) ?? LOGIN_MINUTES_OPTIONS[0];

  useEffect(() => {
    if (!hoursOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (hoursRef.current && !hoursRef.current.contains(e.target as Node)) setHoursOpen(false);
    };
    document.addEventListener("pointerdown", handleClickOutside);
    return () => document.removeEventListener("pointerdown", handleClickOutside);
  }, [hoursOpen]);

  useEffect(() => {
    if (!minutesOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (minutesRef.current && !minutesRef.current.contains(e.target as Node)) setMinutesOpen(false);
    };
    document.addEventListener("pointerdown", handleClickOutside);
    return () => document.removeEventListener("pointerdown", handleClickOutside);
  }, [minutesOpen]);

  return (
    <>
      <div
        className="flex items-center justify-between shrink-0 box-content"
        style={{ paddingBottom: "var(--spacing-04)" }}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center justify-center p-2 rounded-lg border-0 bg-transparent cursor-pointer hover:bg-surface-alt transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 touch-target-min"
            aria-label="Back"
          >
            <img src="/settings/Chevron left.svg" alt="" className="w-8 h-8" aria-hidden />
          </button>
          <h2 className="tp-heading-04 text-text-primary">Login Settings</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center justify-center p-2 rounded-lg border-0 bg-transparent cursor-pointer hover:bg-surface-alt transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 shrink-0 touch-target-min"
          aria-label="Close"
        >
          <CloseIcon size={24} color="var(--color-icon-primary)" />
        </button>
      </div>
      <div
        className="login-settings-content flex flex-col flex-1 min-w-0 overflow-y-auto justify-start items-start"
        style={{
          paddingTop: "60px",
          paddingLeft: "calc(14 * var(--spacing-01))",
        }}
      >
        {/* Row: vertical center align so "Log out After", triggers, and "of inactivity" share same midline */}
        <div
          className="flex items-center"
          style={{ gap: "var(--spacing-04)" }}
        >
          <span className="tp-body-04 text-text-primary shrink-0">Log out After</span>

          {/* Hours: 76×60px trigger; H label above (Figma 772-25589, 763-15059) */}
          <div
            ref={hoursRef}
            className="login-settings-time-field relative shrink-0"
            style={{ height: 60 }}
          >
            <span
              className="tp-label-02 text-text-secondary absolute left-0 right-0 text-center"
              style={{ bottom: "calc(100% + var(--spacing-01))" }}
              aria-hidden
            >
              H
            </span>
            <button
              type="button"
              onClick={() => {
                setHoursOpen((o) => !o);
                setMinutesOpen(false);
              }}
              className={`login-settings-trigger flex items-center justify-between rounded-lg border transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 bg-[var(--color-background-layer-02)] hover:bg-[var(--color-background-layer-hovered)] ${
                hoursOpen ? "border-[var(--color-border-interactive)]" : "border-border-subtle"
              }`}
              style={{
                width: 76,
                height: 60,
                paddingLeft: "var(--spacing-02)",
                paddingRight: "var(--spacing-02)",
              }}
              aria-expanded={hoursOpen}
              aria-haspopup="listbox"
              aria-label="Hours"
              id="login-hours-trigger"
            >
              <span className="tp-body-04 text-text-primary tabular-nums">{selectedHours.label}</span>
              {hoursOpen ? (
                <CaretUpIcon size={24} color="var(--color-icon-primary)" className="shrink-0" aria-hidden />
              ) : (
                <CaretDownIcon size={24} color="var(--color-icon-secondary)" className="shrink-0" aria-hidden />
              )}
            </button>
            {hoursOpen && (
              <ul
                role="listbox"
                aria-labelledby="login-hours-trigger"
                className="login-settings-list absolute left-0 top-full z-20 flex max-h-60 w-full flex-col overflow-auto rounded-lg border border-border-subtle bg-[var(--color-background-elevated)] [&>li+li]:border-t [&>li+li]:border-border-subtle"
                style={{
                  minHeight: 0,
                  boxShadow: "var(--shadow-card)",
                  width: 76,
                  marginTop: "var(--spacing-02)",
                }}
              >
                {LOGIN_HOURS_OPTIONS.map((opt) => {
                  const isSelected = opt.id === hoursId;
                  return (
                    <li key={opt.id} role="option" aria-selected={isSelected}>
                      <button
                        type="button"
                        onClick={() => {
                          setHoursId(opt.id);
                          setHoursOpen(false);
                        }}
                        className={`flex w-full items-center gap-2 text-left tp-body-04 tabular-nums transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-border-focus)] text-text-primary ${
                          isSelected ? "bg-[var(--color-background-layer-01)]" : "hover:bg-[var(--color-background-layer-hovered)]"
                        }`}
                        style={{
                          padding: "var(--spacing-03) var(--spacing-04)",
                          minHeight: "var(--height-row)",
                        }}
                      >
                        {isSelected ? (
                          <CheckIcon size={24} color="var(--color-icon-primary)" className="shrink-0" aria-hidden />
                        ) : (
                          <span className="w-6 shrink-0" aria-hidden />
                        )}
                        <span>{opt.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Minutes: same 76×60px, M label above (Figma 762-14671) */}
          <div
            ref={minutesRef}
            className="login-settings-time-field relative shrink-0"
            style={{ height: 60 }}
          >
            <span
              className="tp-label-02 text-text-secondary absolute left-0 right-0 text-center"
              style={{ bottom: "calc(100% + var(--spacing-01))" }}
              aria-hidden
            >
              M
            </span>
            <button
              type="button"
              onClick={() => {
                setMinutesOpen((o) => !o);
                setHoursOpen(false);
              }}
              className={`login-settings-trigger flex items-center justify-between rounded-lg border transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 bg-[var(--color-background-layer-02)] hover:bg-[var(--color-background-layer-hovered)] ${
                minutesOpen ? "border-[var(--color-border-interactive)]" : "border-border-subtle"
              }`}
              style={{
                width: 76,
                height: 60,
                paddingLeft: "var(--spacing-02)",
                paddingRight: "var(--spacing-02)",
              }}
              aria-expanded={minutesOpen}
              aria-haspopup="listbox"
              aria-label="Minutes"
              id="login-minutes-trigger"
            >
              <span className="tp-body-04 text-text-primary tabular-nums">{selectedMinutes.label}</span>
              {minutesOpen ? (
                <CaretUpIcon size={24} color="var(--color-icon-primary)" className="shrink-0" aria-hidden />
              ) : (
                <CaretDownIcon size={24} color="var(--color-icon-secondary)" className="shrink-0" aria-hidden />
              )}
            </button>
            {minutesOpen && (
              <ul
                role="listbox"
                aria-labelledby="login-minutes-trigger"
                className="login-settings-list absolute left-0 top-full z-20 flex max-h-60 w-full flex-col overflow-auto rounded-lg border border-border-subtle bg-[var(--color-background-elevated)] [&>li+li]:border-t [&>li+li]:border-border-subtle"
                style={{
                  minHeight: 0,
                  boxShadow: "var(--shadow-card)",
                  width: 76,
                  marginTop: "var(--spacing-02)",
                }}
              >
                {LOGIN_MINUTES_OPTIONS.map((opt) => {
                  const isSelected = opt.id === minutesId;
                  return (
                    <li key={opt.id} role="option" aria-selected={isSelected}>
                      <button
                        type="button"
                        onClick={() => {
                          setMinutesId(opt.id);
                          setMinutesOpen(false);
                        }}
                        className={`flex w-full items-center gap-2 text-left tp-body-04 tabular-nums transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-border-focus)] text-text-primary ${
                          isSelected ? "bg-[var(--color-background-layer-01)]" : "hover:bg-[var(--color-background-layer-hovered)]"
                        }`}
                        style={{
                          padding: "var(--spacing-03) var(--spacing-04)",
                          minHeight: "var(--height-row)",
                        }}
                      >
                        {isSelected ? (
                          <CheckIcon size={24} color="var(--color-icon-primary)" className="shrink-0" aria-hidden />
                        ) : (
                          <span className="w-6 shrink-0" aria-hidden />
                        )}
                        <span>{opt.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <span className="tp-body-04 text-text-primary shrink-0">of inactivity</span>
        </div>
      </div>
    </>
  );
}

function LicensingInformationView({ onBack, onClose }: { onBack: () => void; onClose: () => void }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <>
      <div
        className="flex items-center justify-between shrink-0 bg-[var(--color-background-layer-01)]"
        style={{
          marginTop: "calc(-1 * var(--spacing-06))",
          marginLeft: "calc(-1 * var(--spacing-06))",
          marginRight: "calc(-1 * var(--spacing-06))",
          padding: "var(--spacing-06) var(--spacing-06) var(--spacing-04)",
        }}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center justify-center p-2 rounded-lg border-0 bg-transparent cursor-pointer hover:bg-[var(--color-background-layer-hovered)] transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 touch-target-min"
            aria-label="Back"
          >
            <img src="/settings/Chevron left.svg" alt="" className="w-8 h-8" aria-hidden />
          </button>
          <h2 className="tp-heading-04 text-text-primary">Licensing Information</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center justify-center p-2 rounded-lg border-0 bg-transparent cursor-pointer hover:bg-[var(--color-background-layer-hovered)] transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 shrink-0 touch-target-min"
          aria-label="Close"
        >
          <CloseIcon size={24} color="var(--color-icon-primary)" />
        </button>
      </div>
      <div
        className="flex flex-1 flex-col min-h-0 min-w-0 overflow-y-auto scrollbar-hidden"
        style={{
          marginLeft: "60px",
          marginRight: "calc(-1 * var(--spacing-06))",
          marginBottom: "calc(-1 * var(--spacing-06))",
          paddingTop: "var(--spacing-06)",
          paddingRight: "64px",
          paddingBottom: "var(--spacing-06)",
          paddingLeft: 0,
          background: "unset",
        }}
      >
        <h3
          className="tp-heading-02 text-text-primary shrink-0"
          style={{ marginBottom: "var(--spacing-03)" }}
        >
          Third Party
        </h3>
        <ul className="flex flex-col w-full" style={{ gap: "var(--spacing-02)" }}>
          {THIRD_PARTY_LICENSES.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <li
                key={item.id}
                className="flex flex-col min-h-[var(--height-row)] justify-center items-start rounded-lg overflow-hidden border border-border-subtle bg-[var(--color-background-layer-02)]"
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="flex w-full items-center justify-between text-left transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 hover:bg-[var(--color-background-layer-hovered)] first:rounded-t-lg last:rounded-b-lg"
                  style={{ padding: "var(--spacing-03) var(--spacing-04)", background: "unset" }}
                  aria-expanded={isExpanded}
                  aria-controls={isExpanded ? `license-content-${item.id}` : undefined}
                  id={`license-heading-${item.id}`}
                >
                  <span className="tp-body-04 text-text-primary">{item.label}</span>
                  {isExpanded ? (
                    <CaretUpIcon size={24} color="var(--color-icon-primary)" className="shrink-0" />
                  ) : (
                    <CaretDownIcon size={24} color="var(--color-icon-secondary)" className="shrink-0" />
                  )}
                </button>
                {isExpanded && (
                  <div
                    id={`license-content-${item.id}`}
                    role="region"
                    aria-labelledby={`license-heading-${item.id}`}
                    className="bg-[var(--color-background-layer-02)]"
                    style={{
                      padding: "var(--spacing-02) var(--spacing-04) var(--spacing-04)",
                      paddingTop: "var(--spacing-03)",
                    }}
                  >
                    <p className="tp-body-03 text-text-secondary whitespace-pre-wrap break-words">
                      {item.licenseText}
                    </p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}

function DiagnosticsView({ onBack, onClose }: { onBack: () => void; onClose: () => void }) {
  return (
    <>
      <div
        className="flex items-center justify-between shrink-0 bg-[var(--color-background-layer-01)] text-left"
        style={{
          marginTop: "calc(-1 * var(--spacing-06))",
          marginLeft: "calc(-1 * var(--spacing-06))",
          marginRight: "calc(-1 * var(--spacing-06))",
          padding: "var(--spacing-06) var(--spacing-06) var(--spacing-04)",
        }}
      >
        <div className="flex items-center justify-start gap-2 text-left min-w-0 flex-1">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center justify-center p-2 rounded-lg border-0 bg-transparent cursor-pointer hover:bg-[var(--color-background-layer-hovered)] transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 shrink-0 touch-target-min"
            aria-label="Back"
          >
            <img src="/settings/Chevron left.svg" alt="" className="w-8 h-8" aria-hidden />
          </button>
          <h2 className="tp-heading-04 text-text-primary text-left">Diagnostics</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center justify-center p-2 rounded-lg border-0 bg-transparent cursor-pointer hover:bg-[var(--color-background-layer-hovered)] transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 shrink-0 touch-target-min"
          aria-label="Close"
        >
          <CloseIcon size={24} color="var(--color-icon-primary)" />
        </button>
      </div>
      <div
        className="flex flex-1 flex-col min-h-0 min-w-0 overflow-y-auto text-left items-start scrollbar-hidden"
        style={{
          marginLeft: "60px",
          marginRight: "60px",
          marginBottom: "calc(-1 * var(--spacing-06))",
          paddingTop: "var(--spacing-06)",
          paddingRight: 0,
          paddingBottom: "var(--spacing-06)",
          background: "unset",
        }}
      >
        <div
          className="shrink-0 w-full"
          style={{ marginBottom: "var(--spacing-04)", paddingBottom: "var(--spacing-04)" }}
        >
          <h3 className="tp-label-02 text-text-secondary text-left">System diagnostics</h3>
        </div>
        <div className="flex flex-col w-full text-left items-start">
          {DIAGNOSTIC_ITEMS.map((item) => (
            <div
              key={item.label}
              className="flex flex-col border-b border-border-subtle items-start text-left w-full"
              style={{
                paddingTop: "var(--spacing-03)",
                paddingBottom: "var(--spacing-03)",
                gap: "var(--spacing-01)",
              }}
            >
              <span className="tp-body-02 text-text-primary text-left">{item.label}</span>
              <span className="tp-body-03 text-text-secondary text-left">{item.status}</span>
            </div>
          ))}
          <div
            className="flex items-center justify-start gap-2 text-left w-full"
            style={{
              paddingTop: "var(--spacing-03)",
              paddingBottom: "var(--spacing-03)",
              marginTop: "var(--spacing-02)",
            }}
          >
            <CheckIcon size={24} color="var(--color-icon-success)" className="shrink-0" />
            <span className="tp-body-02 text-[var(--color-text-success)] text-left">Completed</span>
          </div>
        </div>
      </div>
    </>
  );
}

function SignatureSettingsView({ onBack, onClose }: { onBack: () => void; onClose: () => void }) {
  const padRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const logicalSizeRef = useRef({ width: 0, height: 0 });

  useEffect(() => {
    const pad = padRef.current;
    const canvas = canvasRef.current;
    if (!pad || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const setSize = () => {
      const rect = pad.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const w = rect.width;
      const h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      ctx.strokeStyle = "var(--color-text-primary)";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      logicalSizeRef.current = { width: w, height: h };
    };
    setSize();
    const ro = new ResizeObserver(setSize);
    ro.observe(pad);
    return () => ro.disconnect();
  }, []);

  const getPoint = (e: React.PointerEvent) => {
    const pad = padRef.current;
    if (!pad) return null;
    const rect = pad.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const pt = getPoint(e);
    if (!pt) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    isDrawingRef.current = true;
    lastPointRef.current = pt;
    ctx.beginPath();
    ctx.moveTo(pt.x, pt.y);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDrawingRef.current) return;
    const pt = getPoint(e);
    if (!pt) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();
    lastPointRef.current = pt;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    isDrawingRef.current = false;
    lastPointRef.current = null;
  };

  const onClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const { width, height } = logicalSizeRef.current;
    ctx.clearRect(0, 0, width, height);
  };

  return (
    <>
      <div
        className="flex items-center justify-between shrink-0 bg-[var(--color-background-layer-01)]"
        style={{
          marginTop: "calc(-1 * var(--spacing-06))",
          marginLeft: "calc(-1 * var(--spacing-06))",
          marginRight: "calc(-1 * var(--spacing-06))",
          padding: "var(--spacing-06) var(--spacing-06) var(--spacing-04)",
        }}
      >
        <div className="flex items-center justify-start gap-2 min-w-0 flex-1">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center justify-center p-2 rounded-lg border-0 bg-transparent cursor-pointer hover:bg-[var(--color-background-layer-hovered)] transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 shrink-0 touch-target-min"
            aria-label="Back"
          >
            <img src="/settings/Chevron left.svg" alt="" className="w-8 h-8" aria-hidden />
          </button>
          <h2 className="tp-heading-04 text-text-primary">Signature Settings</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center justify-center p-2 rounded-lg border-0 bg-transparent cursor-pointer hover:bg-[var(--color-background-layer-hovered)] transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 shrink-0 touch-target-min"
          aria-label="Close"
        >
          <CloseIcon size={24} color="var(--color-icon-primary)" />
        </button>
      </div>
      <div
        className="flex flex-1 flex-col min-h-0 min-w-0 overflow-y-auto text-left items-start scrollbar-hidden"
        style={{
          marginLeft: "60px",
          marginRight: "60px",
          marginBottom: "calc(-1 * var(--spacing-06))",
          paddingTop: "var(--spacing-06)",
          paddingRight: 0,
          paddingBottom: "var(--spacing-06)",
          background: "unset",
        }}
      >
        <div className="flex flex-col w-full" style={{ gap: "var(--spacing-06)" }}>
          <div className="flex flex-col" style={{ gap: "var(--spacing-02)" }}>
            <label htmlFor="signature-license" className="tp-heading-02 text-text-primary">
              License
            </label>
            <input
              id="signature-license"
              type="text"
              readOnly
              value="The License"
              className="w-full rounded-lg border border-border-subtle bg-[var(--color-background-layer-02)] tp-body-02 text-text-primary"
              style={{ padding: "var(--spacing-03) var(--spacing-04)", height: "var(--height-row)" }}
              aria-label="License"
            />
          </div>
          <div className="flex flex-col flex-1 min-h-0" style={{ gap: "var(--spacing-02)" }}>
            <span className="tp-heading-02 text-text-primary">Sign here</span>
            <div
              className="flex flex-col w-full rounded-xl border border-border-subtle overflow-hidden"
              style={{ minHeight: 320 }}
              role="img"
              aria-label="Signature pad"
            >
              <div
                ref={padRef}
                className="relative flex-1 w-full min-h-[280] flex flex-col"
                style={{ backgroundColor: "#EDEDED" }}
              >
                <canvas
                  ref={canvasRef}
                  className="block w-full flex-1 min-h-0 touch-none"
                  style={{ display: "block", width: "100%", height: "100%" }}
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerLeave={onPointerUp}
                />
              </div>
              <div
                className="flex items-center justify-end w-full shrink-0"
                style={{
                  padding: "0 var(--spacing-04)",
                  backgroundColor: "#EDEDED",
                  borderTop: "1px solid var(--color-border-subtle)",
                }}
              >
                <button
                  type="button"
                  onClick={onClear}
                  className="flex items-center justify-center gap-2 rounded-lg border-0 bg-transparent cursor-pointer hover:bg-[var(--color-background-layer-hovered)] transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 tp-body-04 text-text-primary touch-target-min"
                  style={{ padding: "var(--spacing-02) var(--spacing-03)", height: "60px" }}
                  aria-label="Clear signature"
                >
                  <EraseIcon size={24} color="var(--color-icon-secondary)" className="shrink-0" />
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function LocalizationView({ onBack, onClose }: { onBack: () => void; onClose: () => void }) {
  const [languageId, setLanguageId] = useState("en");
  const [dateFormatId, setDateFormatId] = useState("ddmmyyyy");
  const [languageOpen, setLanguageOpen] = useState(false);
  const [dateFormatOpen, setDateFormatOpen] = useState(false);
  const languageRef = useRef<HTMLDivElement>(null);
  const dateFormatRef = useRef<HTMLDivElement>(null);

  const selectedLanguage = LANGUAGE_OPTIONS.find((o) => o.id === languageId) ?? LANGUAGE_OPTIONS[0];
  const selectedDateFormat = DATE_FORMAT_OPTIONS.find((o) => o.id === dateFormatId) ?? DATE_FORMAT_OPTIONS[0];

  useEffect(() => {
    if (!languageOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (languageRef.current && !languageRef.current.contains(e.target as Node)) {
        setLanguageOpen(false);
      }
    };
    document.addEventListener("pointerdown", handleClickOutside);
    return () => document.removeEventListener("pointerdown", handleClickOutside);
  }, [languageOpen]);

  useEffect(() => {
    if (!dateFormatOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dateFormatRef.current && !dateFormatRef.current.contains(e.target as Node)) {
        setDateFormatOpen(false);
      }
    };
    document.addEventListener("pointerdown", handleClickOutside);
    return () => document.removeEventListener("pointerdown", handleClickOutside);
  }, [dateFormatOpen]);

  return (
    <>
      <div
        className="flex items-center justify-between shrink-0 bg-[var(--color-background-layer-01)]"
        style={{
          marginTop: "calc(-1 * var(--spacing-06))",
          marginLeft: "calc(-1 * var(--spacing-06))",
          marginRight: "calc(-1 * var(--spacing-06))",
          padding: "var(--spacing-06) var(--spacing-06) var(--spacing-04)",
        }}
      >
        <div className="flex items-center justify-start gap-2 min-w-0 flex-1">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center justify-center p-2 rounded-lg border-0 bg-transparent cursor-pointer hover:bg-[var(--color-background-layer-hovered)] transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 shrink-0 touch-target-min"
            aria-label="Back"
          >
            <img src="/settings/Chevron left.svg" alt="" className="w-8 h-8" aria-hidden />
          </button>
          <h2 className="tp-heading-04 text-text-primary">Localization</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center justify-center p-2 rounded-lg border-0 bg-transparent cursor-pointer hover:bg-[var(--color-background-layer-hovered)] transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 shrink-0 touch-target-min"
          aria-label="Close"
        >
          <CloseIcon size={24} color="var(--color-icon-primary)" />
        </button>
      </div>
      <div
        className="flex flex-1 flex-col min-h-0 min-w-0 overflow-y-auto text-left items-start scrollbar-hidden"
        style={{
          marginLeft: "60px",
          marginRight: "60px",
          marginBottom: "calc(-1 * var(--spacing-06))",
          paddingTop: "var(--spacing-06)",
          paddingRight: 0,
          paddingBottom: "var(--spacing-06)",
          background: "unset",
        }}
      >
        <div className="flex flex-col w-full" style={{ gap: "var(--spacing-06)" }}>
          {/* Language */}
          <div ref={languageRef} className="relative flex flex-col" style={{ gap: "var(--spacing-02)" }}>
            <label htmlFor="localization-language" className="tp-heading-02 text-text-primary">
              Language
            </label>
            <div className="relative">
              <button
                type="button"
                id="localization-language"
                onClick={() => {
                  setLanguageOpen((o) => !o);
                  setDateFormatOpen(false);
                }}
                className={`flex items-center justify-between w-full rounded-lg border text-left transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 ${
                  languageOpen
                    ? "border-[var(--color-border-interactive)] bg-[var(--color-background-layer-02)]"
                    : "border-border-subtle bg-[var(--color-background-layer-02)] hover:bg-[var(--color-background-layer-hovered)]"
                }`}
                style={{ padding: "var(--spacing-03) var(--spacing-04)", height: "var(--height-row)" }}
                aria-expanded={languageOpen}
                aria-haspopup="listbox"
                aria-label="Language"
              >
                <span className="tp-body-02 text-text-primary">{selectedLanguage.label}</span>
                {languageOpen ? (
                  <CaretUpIcon size={24} color="var(--color-icon-primary)" className="shrink-0" />
                ) : (
                  <CaretDownIcon size={24} color="var(--color-icon-secondary)" className="shrink-0" />
                )}
              </button>
              {languageOpen && (
                <ul
                role="listbox"
                aria-labelledby="localization-language"
                className="absolute left-0 top-full z-20 flex max-h-60 w-full flex-col overflow-auto rounded-lg border border-border-subtle bg-[var(--color-background-elevated)] [&>li+li]:border-t [&>li+li]:border-border-subtle"
                style={{ minHeight: 0, boxShadow: "var(--shadow-card)", marginTop: "4px" }}
              >
                {LANGUAGE_OPTIONS.map((opt) => {
                  const isSelected = opt.id === languageId;
                  return (
                    <li key={opt.id} role="option" aria-selected={isSelected}>
                      <button
                        type="button"
                        onClick={() => {
                          setLanguageId(opt.id);
                          setLanguageOpen(false);
                        }}
                        className={`flex w-full items-center gap-3 text-left transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-border-focus)] text-text-primary ${
                          isSelected ? "bg-[var(--color-background-layer-01)]" : "hover:bg-[var(--color-background-layer-hovered)]"
                        }`}
                        style={{ padding: "var(--spacing-03) var(--spacing-04)", height: "60px" }}
                      >
                        {isSelected ? (
                          <CheckIcon size={24} color="var(--color-icon-primary)" className="shrink-0" />
                        ) : (
                          <span className="w-6 shrink-0" aria-hidden />
                        )}
                        <span className="tp-body-02">{opt.label}</span>
                      </button>
                    </li>
                  );
                })}
                </ul>
              )}
            </div>
            <p className="tp-label-02 text-text-secondary">
              Choose the language you'd like to use with iTero.
            </p>
          </div>

          {/* Date format */}
          <div ref={dateFormatRef} className="relative flex flex-col" style={{ gap: "var(--spacing-02)" }}>
            <label htmlFor="localization-date-format" className="tp-heading-02 text-text-primary">
              Date format
            </label>
            <div className="relative">
              <button
                type="button"
                id="localization-date-format"
                onClick={() => {
                  setDateFormatOpen((o) => !o);
                  setLanguageOpen(false);
                }}
                className={`flex items-center justify-between w-full rounded-lg border text-left transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 ${
                  dateFormatOpen
                    ? "border-[var(--color-border-interactive)] bg-[var(--color-background-layer-02)]"
                    : "border-border-subtle bg-[var(--color-background-layer-02)] hover:bg-[var(--color-background-layer-hovered)]"
                }`}
                style={{ padding: "var(--spacing-03) var(--spacing-04)", height: "var(--height-row)" }}
                aria-expanded={dateFormatOpen}
                aria-haspopup="listbox"
                aria-label="Date format"
              >
                <span className="tp-body-02 text-text-primary">{selectedDateFormat.label}</span>
                {dateFormatOpen ? (
                  <CaretUpIcon size={24} color="var(--color-icon-primary)" className="shrink-0" />
                ) : (
                  <CaretDownIcon size={24} color="var(--color-icon-secondary)" className="shrink-0" />
                )}
              </button>
              {dateFormatOpen && (
                <ul
                role="listbox"
                aria-labelledby="localization-date-format"
                className="absolute left-0 top-full z-20 flex max-h-60 w-full flex-col overflow-auto rounded-lg border border-border-subtle bg-[var(--color-background-elevated)] [&>li+li]:border-t [&>li+li]:border-border-subtle"
                style={{ minHeight: 0, boxShadow: "var(--shadow-card)", marginTop: "4px" }}
              >
                {DATE_FORMAT_OPTIONS.map((opt) => {
                  const isSelected = opt.id === dateFormatId;
                  return (
                    <li key={opt.id} role="option" aria-selected={isSelected}>
                      <button
                        type="button"
                        onClick={() => {
                          setDateFormatId(opt.id);
                          setDateFormatOpen(false);
                        }}
                        className={`flex w-full items-center gap-3 text-left transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-border-focus)] text-text-primary ${
                          isSelected ? "bg-[var(--color-background-layer-01)]" : "hover:bg-[var(--color-background-layer-hovered)]"
                        }`}
                        style={{ padding: "var(--spacing-03) var(--spacing-04)", height: "60px" }}
                      >
                        {isSelected ? (
                          <CheckIcon size={24} color="var(--color-icon-primary)" className="shrink-0" />
                        ) : (
                          <span className="w-6 shrink-0" aria-hidden />
                        )}
                        <span className="tp-body-02">{opt.label}</span>
                      </button>
                    </li>
                  );
                })}
                </ul>
              )}
            </div>
            <p className="tp-label-02 text-text-secondary">
              iTero uses your time zone to send summary and notification emails, for times in your activity feeds, and for reminders.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function ExportSettingsView({ onBack, onClose }: { onBack: () => void; onClose: () => void }) {
  const [daysId, setDaysId] = useState("6");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedDays = EXPORT_DAYS_OPTIONS.find((o) => o.id === daysId) ?? EXPORT_DAYS_OPTIONS[3];

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("pointerdown", handleClickOutside);
    return () => document.removeEventListener("pointerdown", handleClickOutside);
  }, [dropdownOpen]);

  const handleClearExportData = () => {
    setShowConfirmClear(false);
    // In a real app would clear export data here
  };

  return (
    <>
      <div
        className="flex items-center justify-between shrink-0 bg-[var(--color-background-layer-01)]"
        style={{
          marginTop: "calc(-1 * var(--spacing-06))",
          marginLeft: "calc(-1 * var(--spacing-06))",
          marginRight: "calc(-1 * var(--spacing-06))",
          padding: "var(--spacing-06) var(--spacing-06) var(--spacing-04)",
        }}
      >
        <div className="flex items-center justify-start gap-2 min-w-0 flex-1">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center justify-center p-2 rounded-lg border-0 bg-transparent cursor-pointer hover:bg-[var(--color-background-layer-hovered)] transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 shrink-0 touch-target-min"
            aria-label="Back"
          >
            <img src="/settings/Chevron left.svg" alt="" className="w-8 h-8" aria-hidden />
          </button>
          <h2 className="tp-heading-04 text-text-primary">Export settings</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center justify-center p-2 rounded-lg border-0 bg-transparent cursor-pointer hover:bg-[var(--color-background-layer-hovered)] transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 shrink-0 touch-target-min"
          aria-label="Close"
        >
          <CloseIcon size={24} color="var(--color-icon-primary)" />
        </button>
      </div>
      <div
        className="flex flex-1 flex-col min-h-0 min-w-0 overflow-y-auto text-left items-start scrollbar-hidden"
        style={{
          marginLeft: "60px",
          marginRight: "60px",
          marginBottom: "calc(-1 * var(--spacing-06))",
          paddingTop: "var(--spacing-06)",
          paddingRight: 0,
          paddingBottom: "var(--spacing-06)",
          background: "unset",
        }}
      >
        <div className="flex flex-col w-full" style={{ gap: "var(--spacing-06)" }}>
          {/* Delete export data files */}
          <div ref={dropdownRef} className="relative flex flex-col" style={{ gap: "var(--spacing-02)" }}>
            <label htmlFor="export-days" className="tp-heading-02 text-text-primary">
              Delete export data files older then:
            </label>
            <div className="relative">
              <button
                type="button"
                id="export-days"
                onClick={() => setDropdownOpen((o) => !o)}
                className={`flex items-center justify-between w-full rounded-lg border text-left transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 ${
                  dropdownOpen
                    ? "border-[var(--color-border-interactive)] bg-[var(--color-background-layer-02)]"
                    : "border-border-subtle bg-[var(--color-background-layer-02)] hover:bg-[var(--color-background-layer-hovered)]"
                }`}
                style={{ padding: "var(--spacing-03) var(--spacing-04)", height: "var(--height-row)" }}
                aria-expanded={dropdownOpen}
                aria-haspopup="listbox"
                aria-label="Delete export data files older than"
              >
                <span className="tp-body-02 text-text-primary">{selectedDays.label}</span>
                {dropdownOpen ? (
                  <CaretUpIcon size={24} color="var(--color-icon-primary)" className="shrink-0" />
                ) : (
                  <CaretDownIcon size={24} color="var(--color-icon-secondary)" className="shrink-0" />
                )}
              </button>
              {dropdownOpen && (
                <ul
                  role="listbox"
                  aria-labelledby="export-days"
                  className="absolute left-0 top-full z-20 flex max-h-60 w-full flex-col overflow-auto rounded-lg border border-border-subtle bg-[var(--color-background-elevated)] [&>li+li]:border-t [&>li+li]:border-border-subtle"
                  style={{ minHeight: 0, boxShadow: "var(--shadow-card)", marginTop: "4px" }}
                >
                  {EXPORT_DAYS_OPTIONS.map((opt) => {
                    const isSelected = opt.id === daysId;
                    return (
                      <li key={opt.id} role="option" aria-selected={isSelected}>
                        <button
                          type="button"
                          onClick={() => {
                            setDaysId(opt.id);
                            setDropdownOpen(false);
                          }}
                          className={`flex w-full items-center gap-3 text-left transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-border-focus)] text-text-primary ${
                            isSelected ? "bg-[var(--color-background-layer-01)]" : "hover:bg-[var(--color-background-layer-hovered)]"
                          }`}
                          style={{ padding: "var(--spacing-03) var(--spacing-04)", height: "60px" }}
                        >
                          {isSelected ? (
                            <CheckIcon size={24} color="var(--color-icon-primary)" className="shrink-0" />
                          ) : (
                            <span className="w-6 shrink-0" aria-hidden />
                          )}
                          <span className="tp-body-02">{opt.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowConfirmClear(true)}
              className="flex items-center justify-center w-full rounded-lg border border-border-accent bg-[var(--color-background-layer-01)] tp-body-02 text-text-primary transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 hover:bg-[var(--color-background-layer-hovered)] hover:border-[var(--color-border-accent-hovered)]"
              style={{ padding: "var(--spacing-03) var(--spacing-04)", height: "var(--height-row)" }}
            >
              Clear Export Data Now
            </button>
          </div>

          {/* Exported files location */}
          <div className="flex flex-col" style={{ gap: "var(--spacing-02)" }}>
            <p className="tp-body-02 text-text-secondary">
              Exported files are accessible from any computer within the local network using the following address:
            </p>
            <p className="tp-heading-02 text-text-primary">
              \\YUCJCVSW01A029\Export
            </p>
            <p className="tp-label-02 text-text-secondary">
              For repeated access, we recommend mapping a network drive for simplified connectivity. If you are not sure how to map a network drive, please contact your local IT resource for assistance.
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation dialog */}
      {showConfirmClear && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-background-overlay)]"
          aria-modal="true"
          role="alertdialog"
          aria-labelledby="export-confirm-title"
          aria-describedby="export-confirm-desc"
        >
          <div
            className="relative z-10 flex flex-col rounded-xl border border-border-subtle bg-[var(--color-background-layer-01)] shadow-xl max-w-[calc(100vw-2*var(--spacing-06))] w-full"
            style={{ maxWidth: 440, margin: "var(--spacing-06)" }}
          >
            <div className="flex items-center gap-2 shrink-0" style={{ padding: "var(--spacing-06)" }}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#22c55e] bg-[#22c55e]/10" aria-hidden>
                <span className="tp-heading-04 text-[#22c55e]" aria-hidden>?</span>
              </div>
              <h3 id="export-confirm-title" className="tp-heading-04 text-text-primary">Confirmation</h3>
            </div>
            <p id="export-confirm-desc" className="tp-body-02 text-text-secondary shrink-0" style={{ padding: "0 var(--spacing-06) var(--spacing-06)" }}>
              You are attempting to clear the export folder. Are you sure you want to delete all the export files?
            </p>
            <div
              className="flex items-center justify-end gap-2 shrink-0 border-t border-border-subtle"
              style={{ padding: "var(--spacing-04) var(--spacing-06)" }}
            >
              <button
                type="button"
                onClick={() => setShowConfirmClear(false)}
                className="flex items-center justify-center rounded-lg border border-border-accent bg-[var(--color-background-layer-01)] tp-body-02 text-text-primary transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 hover:bg-[var(--color-background-layer-hovered)] hover:border-[var(--color-border-accent-hovered)]"
                style={{ padding: "var(--spacing-02) var(--spacing-04)", minHeight: 40 }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearExportData}
                className="flex items-center justify-center rounded-lg border-0 bg-[var(--color-border-interactive)] tp-body-02 text-white transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 hover:bg-[var(--color-border-interactive-hovered)]"
                style={{ padding: "var(--spacing-02) var(--spacing-04)", minHeight: 40 }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function RXSettingsView({ onBack, onClose }: { onBack: () => void; onClose: () => void }) {
  const [toothId, setToothId] = useState("quadrant");
  const [shadeId, setShadeId] = useState("vitapan-3d");
  const [procedureId, setProcedureId] = useState("no-default");
  const [niriEnabled, setNiriEnabled] = useState(true);
  const [toothOpen, setToothOpen] = useState(false);
  const [shadeOpen, setShadeOpen] = useState(false);
  const [procedureOpen, setProcedureOpen] = useState(false);
  const [showNiriConfirm, setShowNiriConfirm] = useState(false);
  const toothRef = useRef<HTMLDivElement>(null);
  const shadeRef = useRef<HTMLDivElement>(null);
  const procedureRef = useRef<HTMLDivElement>(null);

  const selectedTooth = TOOTH_ID_OPTIONS.find((o) => o.id === toothId) ?? TOOTH_ID_OPTIONS[0];
  const selectedShade = SHADE_SYSTEM_OPTIONS.find((o) => o.id === shadeId) ?? SHADE_SYSTEM_OPTIONS[1];
  const selectedProcedure = PROCEDURE_OPTIONS.find((o) => o.id === procedureId) ?? PROCEDURE_OPTIONS[5];

  const closeAllDropdowns = () => {
    setToothOpen(false);
    setShadeOpen(false);
    setProcedureOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (toothRef.current?.contains(target) || shadeRef.current?.contains(target) || procedureRef.current?.contains(target)) return;
      closeAllDropdowns();
    };
    document.addEventListener("pointerdown", handleClickOutside);
    return () => document.removeEventListener("pointerdown", handleClickOutside);
  }, []);

  const handleNiriToggle = () => {
    if (niriEnabled) {
      setShowNiriConfirm(true);
    } else {
      setNiriEnabled(true);
    }
  };

  const confirmNiriDisable = () => {
    setNiriEnabled(false);
    setShowNiriConfirm(false);
  };

  return (
    <>
      <div
        className="flex items-center justify-between shrink-0 bg-[var(--color-background-layer-01)]"
        style={{
          marginTop: "calc(-1 * var(--spacing-06))",
          marginLeft: "calc(-1 * var(--spacing-06))",
          marginRight: "calc(-1 * var(--spacing-06))",
          padding: "var(--spacing-06) var(--spacing-06) var(--spacing-04)",
        }}
      >
        <div className="flex items-center justify-start gap-2 min-w-0 flex-1">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center justify-center p-2 rounded-lg border-0 bg-transparent cursor-pointer hover:bg-[var(--color-background-layer-hovered)] transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 shrink-0 touch-target-min"
            aria-label="Back"
          >
            <img src="/settings/Chevron left.svg" alt="" className="w-8 h-8" aria-hidden />
          </button>
          <h2 className="tp-heading-04 text-text-primary">Rx Settings</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center justify-center p-2 rounded-lg border-0 bg-transparent cursor-pointer hover:bg-[var(--color-background-layer-hovered)] transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 shrink-0 touch-target-min"
          aria-label="Close"
        >
          <CloseIcon size={24} color="var(--color-icon-primary)" />
        </button>
      </div>
      <div
        className="flex flex-1 flex-col min-h-0 min-w-0 overflow-y-auto text-left items-start scrollbar-hidden"
        style={{
          marginLeft: "60px",
          marginRight: "60px",
          marginBottom: "calc(-1 * var(--spacing-06))",
          paddingTop: "var(--spacing-06)",
          paddingRight: 0,
          paddingBottom: "var(--spacing-06)",
          background: "unset",
        }}
      >
        <div className="flex flex-col w-full" style={{ gap: "var(--spacing-06)" }}>
          {/* Tooth ID */}
          <div ref={toothRef} className="relative flex flex-col" style={{ gap: "var(--spacing-02)" }}>
            <label htmlFor="rx-tooth-id" className="tp-heading-02 text-text-primary">
              Tooth ID
            </label>
            <div className="relative">
              <button
                type="button"
                id="rx-tooth-id"
                onClick={() => { closeAllDropdowns(); setToothOpen((o) => !o); }}
                className={`flex items-center justify-between w-full rounded-lg border text-left transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 ${
                  toothOpen ? "border-[var(--color-border-interactive)] bg-[var(--color-background-layer-02)]" : "border-border-subtle bg-[var(--color-background-layer-02)] hover:bg-[var(--color-background-layer-hovered)]"
                }`}
                style={{ padding: "var(--spacing-03) var(--spacing-04)", height: "var(--height-row)" }}
                aria-expanded={toothOpen}
                aria-haspopup="listbox"
                aria-label="Tooth ID"
              >
                <span className="tp-body-02 text-text-primary">{selectedTooth.label}</span>
                {toothOpen ? <CaretUpIcon size={24} color="var(--color-icon-primary)" className="shrink-0" /> : <CaretDownIcon size={24} color="var(--color-icon-secondary)" className="shrink-0" />}
              </button>
              {toothOpen && (
                <ul role="listbox" aria-labelledby="rx-tooth-id" className="absolute left-0 top-full z-20 flex max-h-60 w-full flex-col overflow-auto rounded-lg border border-border-subtle bg-[var(--color-background-elevated)] [&>li+li]:border-t [&>li+li]:border-border-subtle" style={{ minHeight: 0, boxShadow: "var(--shadow-card)", marginTop: "4px" }}>
                  {TOOTH_ID_OPTIONS.map((opt) => (
                    <li key={opt.id} role="option" aria-selected={opt.id === toothId}>
                      <button type="button" onClick={() => { setToothId(opt.id); setToothOpen(false); }} className={`flex w-full items-center gap-3 text-left transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-border-focus)] text-text-primary ${opt.id === toothId ? "bg-[var(--color-background-layer-01)]" : "hover:bg-[var(--color-background-layer-hovered)]"}`} style={{ padding: "var(--spacing-03) var(--spacing-04)", height: "60px" }}>
                        {opt.id === toothId ? <CheckIcon size={24} color="var(--color-icon-primary)" className="shrink-0" /> : <span className="w-6 shrink-0" aria-hidden />}
                        <span className="tp-body-02">{opt.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Shade System */}
          <div ref={shadeRef} className="relative flex flex-col" style={{ gap: "var(--spacing-02)" }}>
            <label htmlFor="rx-shade-system" className="tp-heading-02 text-text-primary">
              Shade System
            </label>
            <div className="relative">
              <button
                type="button"
                id="rx-shade-system"
                onClick={() => { closeAllDropdowns(); setShadeOpen((o) => !o); }}
                className={`flex items-center justify-between w-full rounded-lg border text-left transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 ${
                  shadeOpen ? "border-[var(--color-border-interactive)] bg-[var(--color-background-layer-02)]" : "border-border-subtle bg-[var(--color-background-layer-02)] hover:bg-[var(--color-background-layer-hovered)]"
                }`}
                style={{ padding: "var(--spacing-03) var(--spacing-04)", height: "var(--height-row)" }}
                aria-expanded={shadeOpen}
                aria-haspopup="listbox"
                aria-label="Shade System"
              >
                <span className="tp-body-02 text-text-primary">{selectedShade.label}</span>
                {shadeOpen ? <CaretUpIcon size={24} color="var(--color-icon-primary)" className="shrink-0" /> : <CaretDownIcon size={24} color="var(--color-icon-secondary)" className="shrink-0" />}
              </button>
              {shadeOpen && (
                <ul role="listbox" aria-labelledby="rx-shade-system" className="absolute left-0 top-full z-20 flex max-h-60 w-full flex-col overflow-auto rounded-lg border border-border-subtle bg-[var(--color-background-elevated)] [&>li+li]:border-t [&>li+li]:border-border-subtle" style={{ minHeight: 0, boxShadow: "var(--shadow-card)", marginTop: "4px" }}>
                  {SHADE_SYSTEM_OPTIONS.map((opt) => (
                    <li key={opt.id} role="option" aria-selected={opt.id === shadeId}>
                      <button type="button" onClick={() => { setShadeId(opt.id); setShadeOpen(false); }} className={`flex w-full items-center gap-3 text-left transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-border-focus)] text-text-primary ${opt.id === shadeId ? "bg-[var(--color-background-layer-01)]" : "hover:bg-[var(--color-background-layer-hovered)]"}`} style={{ padding: "var(--spacing-03) var(--spacing-04)", height: "60px" }}>
                        {opt.id === shadeId ? <CheckIcon size={24} color="var(--color-icon-primary)" className="shrink-0" /> : <span className="w-6 shrink-0" aria-hidden />}
                        <span className="tp-body-02">{opt.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Procedure */}
          <div ref={procedureRef} className="relative flex flex-col" style={{ gap: "var(--spacing-02)" }}>
            <label htmlFor="rx-procedure" className="tp-heading-02 text-text-primary">
              Procedure
            </label>
            <div className="relative">
              <button
                type="button"
                id="rx-procedure"
                onClick={() => { closeAllDropdowns(); setProcedureOpen((o) => !o); }}
                className={`flex items-center justify-between w-full rounded-lg border text-left transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 ${
                  procedureOpen ? "border-[var(--color-border-interactive)] bg-[var(--color-background-layer-02)]" : "border-border-subtle bg-[var(--color-background-layer-02)] hover:bg-[var(--color-background-layer-hovered)]"
                }`}
                style={{ padding: "var(--spacing-03) var(--spacing-04)", height: "var(--height-row)" }}
                aria-expanded={procedureOpen}
                aria-haspopup="listbox"
                aria-label="Procedure"
              >
                <span className="tp-body-02 text-text-primary">{selectedProcedure.label}</span>
                {procedureOpen ? <CaretUpIcon size={24} color="var(--color-icon-primary)" className="shrink-0" /> : <CaretDownIcon size={24} color="var(--color-icon-secondary)" className="shrink-0" />}
              </button>
              {procedureOpen && (
                <ul role="listbox" aria-labelledby="rx-procedure" className="absolute left-0 top-full z-20 flex max-h-60 w-full flex-col overflow-auto rounded-lg border border-border-subtle bg-[var(--color-background-elevated)] [&>li+li]:border-t [&>li+li]:border-border-subtle" style={{ minHeight: 0, boxShadow: "var(--shadow-card)", marginTop: "4px" }}>
                  {PROCEDURE_OPTIONS.map((opt) => (
                    <li key={opt.id} role="option" aria-selected={opt.id === procedureId}>
                      <button type="button" onClick={() => { setProcedureId(opt.id); setProcedureOpen(false); }} className={`flex w-full items-center gap-3 text-left transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-border-focus)] text-text-primary ${opt.id === procedureId ? "bg-[var(--color-background-layer-01)]" : "hover:bg-[var(--color-background-layer-hovered)]"}`} style={{ padding: "var(--spacing-03) var(--spacing-04)", height: "60px" }}>
                        {opt.id === procedureId ? <CheckIcon size={24} color="var(--color-icon-primary)" className="shrink-0" /> : <span className="w-6 shrink-0" aria-hidden />}
                        <span className="tp-body-02">{opt.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Niri Capture */}
          <div className="flex items-center justify-between w-full">
            <span className="tp-heading-02 text-text-primary">Niri Capture</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                role="switch"
                aria-checked={niriEnabled}
                aria-label="Niri Capture"
                onClick={handleNiriToggle}
                className="relative inline-flex h-7 w-12 shrink-0 rounded-full border-0 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background-layer-01)]"
                style={{ backgroundColor: niriEnabled ? "var(--color-border-interactive)" : "var(--color-background-layer-02)" }}
              >
                <span className="pointer-events-none inline-block h-6 w-6 translate-y-0.5 rounded-full bg-white shadow ring-0 transition-transform" style={{ transform: niriEnabled ? "translateX(22px)" : "translateX(4px)" }} />
              </button>
              <span className="tp-body-02 text-text-primary w-16">{niriEnabled ? "Enabled" : "Disabled"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Are you sure? confirmation */}
      {showNiriConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0, 0, 0, 0)" }} aria-modal="true" role="alertdialog" aria-labelledby="rx-niri-confirm-title" aria-describedby="rx-niri-confirm-desc">
          <div className="relative z-10 flex flex-col rounded-xl border border-border-subtle bg-[var(--color-background-layer-01)] shadow-xl max-w-[calc(100vw-2*var(--spacing-06))] w-full" style={{ maxWidth: 440, margin: "var(--spacing-06)" }}>
            <div className="flex items-center gap-2 shrink-0" style={{ padding: "var(--spacing-06)" }}>
              <img src="/settings/Icon-info.svg" alt="" className="w-8 h-8 shrink-0" aria-hidden />
              <h3 id="rx-niri-confirm-title" className="tp-heading-04 text-text-primary">Are you sure?</h3>
            </div>
            <p id="rx-niri-confirm-desc" className="tp-body-04 text-text-secondary shrink-0" style={{ padding: "0 var(--spacing-06) var(--spacing-06)" }}>
              From now on, all Rx forms will be displayed with the NIRI option disabled by default, and you will need to manually turn on the option to scan in NIRI mode.
            </p>
            <div className="flex items-center justify-end gap-2 shrink-0" style={{ padding: "var(--spacing-04) var(--spacing-06)" }}>
              <button type="button" onClick={() => setShowNiriConfirm(false)} className="flex items-center justify-center rounded-lg border border-border-accent bg-[var(--color-background-layer-01)] tp-body-02 text-text-primary transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 hover:bg-[var(--color-background-layer-hovered)] hover:border-[var(--color-border-accent-hovered)]" style={{ padding: "var(--spacing-02) 16px", height: "60px" }}>Cancel</button>
              <button type="button" onClick={confirmNiriDisable} className="flex items-center justify-center rounded-lg border-0 bg-[var(--color-border-interactive)] tp-body-02 text-white transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 hover:bg-[var(--color-border-interactive-hovered)]" style={{ padding: "var(--spacing-02) 16px", height: "60px", width: "83px" }}>OK</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* Figma 20:229 — iTero Lumina Pro Mobile key-value list (no Wand Serial Number row) */
const SYSTEM_INFO_ENTRIES: { key: string; value: string }[] = [
  { key: "UDI:", value: "3.2.50.105" },
  { key: "REF:", value: "2.17.0.62" },
  { key: "Software Version:", value: "2.17.0.62" },
  { key: "Element Version:", value: "2.2.4.55" },
  { key: "Lumina Version:", value: "0.21.0.2216" },
  { key: "Firmware Version:", value: "1.0.0.4" },
  { key: "Environment:", value: "4.2.1.359" },
  { key: "Base Unit Type:", value: "https://e3-export-mycadent.mycadent.com" },
  { key: "Base Serial Number:", value: "ElementPanelPC" },
  { key: "Office ID:", value: "90383" },
];

function SystemInformationView({ onBack, onClose }: { onBack: () => void; onClose: () => void }) {
  return (
    <>
      <div
        className="flex items-center justify-between shrink-0 bg-[var(--color-background-layer-01)]"
        style={{
          marginTop: "calc(-1 * var(--spacing-06))",
          marginLeft: "calc(-1 * var(--spacing-06))",
          marginRight: "calc(-1 * var(--spacing-06))",
          padding: "var(--spacing-06) var(--spacing-06) var(--spacing-04)",
        }}
      >
        <div className="flex items-center justify-start gap-2 min-w-0 flex-1">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center justify-center p-2 rounded-lg border-0 bg-transparent cursor-pointer hover:bg-[var(--color-background-layer-hovered)] transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 shrink-0 touch-target-min"
            aria-label="Back"
          >
            <img src="/settings/Chevron left.svg" alt="" className="w-8 h-8" aria-hidden />
          </button>
          <h2 className="tp-heading-04 text-text-primary">System Information</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center justify-center p-2 rounded-lg border-0 bg-transparent cursor-pointer hover:bg-[var(--color-background-layer-hovered)] transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 shrink-0 touch-target-min"
          aria-label="Close"
        >
          <CloseIcon size={24} color="var(--color-icon-primary)" />
        </button>
      </div>
      <div
        className="flex flex-1 flex-col min-h-0 min-w-0 overflow-y-auto text-left items-start scrollbar-hidden"
        style={{
          marginLeft: "60px",
          marginRight: "60px",
          marginBottom: "calc(-1 * var(--spacing-06))",
          paddingTop: "var(--spacing-06)",
          paddingRight: 0,
          paddingBottom: "var(--spacing-06)",
          background: "unset",
        }}
      >
        <div className="flex flex-col w-full" style={{ gap: "var(--spacing-06)" }}>
          {/* Figma 20:229 — title x-large (tp-heading-04); labels secondary, values primary; 16px body; thin row dividers; uniform row spacing */}
          <div className="flex flex-col w-full" style={{ gap: "var(--spacing-04)" }}>
            <h3 className="tp-heading-04 text-text-primary">iTero Lumina Pro Mobile</h3>
            <div className="flex flex-col w-full">
              {SYSTEM_INFO_ENTRIES.map(({ key: label, value }, index) => (
                <div
                  key={`${label}-${index}`}
                  className={`flex items-baseline justify-between w-full gap-4 ${
                    index === 0 ? "" : "border-b border-border-subtle"
                  }`}
                  style={{
                    minHeight: "var(--tp-body-03-height)",
                    paddingTop: "var(--spacing-02)",
                    paddingBottom: "var(--spacing-02)",
                  }}
                >
                  <span className="tp-body-03 text-text-secondary shrink-0">{label}</span>
                  <span className="tp-body-03 text-text-primary text-right break-all">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Regulatory and address footer — Figma 20-217: icon size 24px, tp-body-04/tp-label-02, grid spacing-04/06 */}
          <div className="flex flex-col w-full" style={{ gap: "var(--spacing-04)" }}>
            {/* Row 1: icons left, Israeli address right (same row per Figma) */}
            <div
              className="flex flex-col sm:flex-row sm:items-start w-full"
              style={{ gap: "var(--spacing-06)" }}
            >
              <div
                className="flex items-center flex-wrap"
                style={{ gap: "var(--spacing-02)", minHeight: 24 }}
              >
                <img src="/settings/regulatory-MD.png" alt="MD" width={24} height={24} className="h-6 w-6 object-contain shrink-0" aria-hidden />
                <img src="/settings/regulatory-R-NZ.png" alt="R-NZ" width={24} height={24} className="h-6 w-6 object-contain shrink-0" aria-hidden />
                <img src="/settings/regulatory-check.png" alt="" width={24} height={24} className="h-6 w-6 object-contain shrink-0" aria-hidden />
                <img src="/settings/regulatory-Rx-ONLY.png" alt="Rx ONLY" width={24} height={24} className="h-6 w-6 object-contain shrink-0" aria-hidden />
                <span className="flex items-center shrink-0" style={{ gap: "var(--spacing-02)" }}>
                  <img src="/settings/regulatory-itero.png" alt="" width={24} height={24} className="h-6 w-6 object-contain" aria-hidden />
                  <span className="tp-label-02 text-text-secondary">www.itero.com</span>
                </span>
              </div>
              <p className="tp-body-04 text-text-secondary flex-1 min-w-0 sm:flex-none">
                Align Technology Ltd. 1 Yitzhak Rabin Rd. Petach Tikva 4925110 Israel
              </p>
            </div>

            {/* EEA Market: heading (tp-body-03) then two-column grid, gap spacing-06 */}
            <div className="flex flex-col w-full" style={{ gap: "var(--spacing-03)" }}>
              <p className="tp-body-03 text-text-primary">Applicable in the EEA Market:</p>
              <div
                className="grid w-full"
                style={{
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "var(--spacing-06)",
                }}
              >
                <div className="flex flex-col min-w-0" style={{ gap: "var(--spacing-02)" }}>
                  <div className="flex items-center flex-wrap" style={{ gap: "var(--spacing-02)", minHeight: 24 }}>
                    <img src="/settings/regulatory-CE-0483.png" alt="CE 0483" width={24} height={24} className="h-6 w-6 object-contain shrink-0" aria-hidden />
                    <span className="tp-label-02 text-text-secondary">EU REP</span>
                  </div>
                  <p className="tp-body-04 text-text-secondary">
                    Align Technology B.V. Herikerbergweg 312 1101 CT, Amsterdam The Netherlands
                  </p>
                </div>
                <div className="flex flex-col min-w-0" style={{ gap: "var(--spacing-02)" }}>
                  <div className="flex items-center flex-wrap" style={{ minHeight: 24 }}>
                    <span className="tp-label-02 text-text-secondary">CH REP</span>
                  </div>
                  <p className="tp-body-04 text-text-secondary">
                    Align Technology Switzerland GmbH., Suurstoffi 22 6343 Risch-Rotkreuz, Switzerland
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ScreenCastingView({ onBack, onClose }: { onBack: () => void; onClose: () => void }) {
  const [screenCastingEnabled, setScreenCastingEnabled] = useState(true);

  return (
    <>
      <div
        className="flex items-center justify-between shrink-0"
        style={{ paddingBottom: "var(--spacing-04)" }}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center justify-center p-2 rounded-lg border-0 bg-transparent cursor-pointer hover:bg-surface-alt transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 touch-target-min"
            aria-label="Back"
          >
            <img src="/settings/Chevron left.svg" alt="" className="w-8 h-8" aria-hidden />
          </button>
          <h2 className="tp-heading-04 text-text-primary">Screen Casting</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center justify-center p-2 rounded-lg border-0 bg-transparent cursor-pointer hover:bg-surface-alt transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 touch-target-min"
          aria-label="Close"
        >
          <CloseIcon size={24} color="var(--color-icon-primary)" />
        </button>
      </div>

      {/* Content — Figma 15-24994 / 15-24977: single row, label + toggle */}
      <div
        className="flex flex-col w-full"
        style={{
          paddingTop: "var(--spacing-06)",
          gap: "var(--spacing-04)",
          marginRight: 0,
          paddingRight: "60px",
          paddingLeft: "64px",
        }}
      >
        <div className="flex items-center justify-between w-full gap-4">
          <span className="tp-heading-02 text-text-primary flex-1 min-w-0">
            Enable the Screen Casting feature on the scanner
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={screenCastingEnabled}
            aria-label="Enable the Screen Casting feature on the scanner"
            onClick={() => setScreenCastingEnabled((prev) => !prev)}
            className="relative inline-flex h-7 w-12 shrink-0 rounded-full border-0 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background-layer-01)]"
            style={{
              backgroundColor: screenCastingEnabled
                ? "var(--color-border-interactive)"
                : "var(--color-background-layer-02)",
            }}
          >
            <span
              className="pointer-events-none inline-block h-6 w-6 translate-y-0.5 rounded-full bg-white shadow ring-0 transition-transform"
              style={{
                transform: screenCastingEnabled ? "translateX(22px)" : "translateX(4px)",
              }}
            />
          </button>
        </div>
      </div>
    </>
  );
}

function AccountPairingView({ onBack, onClose }: { onBack: () => void; onClose: () => void }) {
  return (
    <>
      <div
        className="flex items-center justify-between shrink-0"
        style={{ paddingBottom: "var(--spacing-04)" }}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center justify-center p-2 rounded-lg border-0 bg-transparent cursor-pointer hover:bg-surface-alt transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 touch-target-min"
            aria-label="Back"
          >
            <img src="/settings/Chevron left.svg" alt="" className="w-8 h-8" aria-hidden />
          </button>
          <h2 className="tp-heading-04 text-text-primary">Account Pairing</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center justify-center p-2 rounded-lg border-0 bg-transparent cursor-pointer hover:bg-surface-alt transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 touch-target-min"
          aria-label="Close"
        >
          <CloseIcon size={24} color="var(--color-icon-primary)" />
        </button>
      </div>

      <div
        className="flex flex-col w-full"
        style={{
          paddingTop: "var(--spacing-06)",
          gap: "var(--spacing-06)",
          marginRight: 0,
          paddingRight: "60px",
          paddingLeft: "64px",
        }}
      >
        <h3 className="tp-label-02 text-text-secondary">Account Pairing</h3>

        <div className="flex flex-col" style={{ gap: "var(--spacing-04)" }}>
          <div className="flex items-center gap-3">
            <img
              src="/settings/Group.svg"
              alt=""
              className="h-9 w-auto object-contain object-center shrink-0"
              aria-hidden
            />
          </div>
          <p className="tp-body-02 text-text-secondary">
            Your iTero Doctor Account is not paired with your WeChat Account.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {}}
          className="settings-btn-primary flex items-center justify-center rounded-lg border-0 bg-[var(--color-border-interactive)] tp-body-02 text-white transition-ui-focus focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 hover:bg-[var(--color-border-interactive-hovered)] w-fit"
          style={{ padding: "var(--spacing-02) var(--spacing-05)", height: "60px" }}
        >
          Pair Account
        </button>
      </div>
    </>
  );
}

const UPGRADE_STEPS = [
  "Checking for Lumina version...",
  "Downloading Lumina version...",
  "Validating iTero Lumina Wand...",
  "Installing for Lumina version...",
] as const;

type StepStatus = "pending" | "running" | "done" | "failed";

function IteroLuminaView({ onBack, onClose }: { onBack: () => void; onClose: () => void }) {
  const [phase, setPhase] = useState<"intro" | "running" | "failed" | "success">("intro");
  const [stepStatuses, setStepStatuses] = useState<StepStatus[]>(["pending", "pending", "pending", "pending"]);
  const [_failedStepIndex, setFailedStepIndex] = useState<number | null>(null);
  const stepTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearStepTimeout = () => {
    if (stepTimeoutRef.current) {
      clearTimeout(stepTimeoutRef.current);
      stepTimeoutRef.current = null;
    }
  };

  const scheduledStepRef = useRef<number>(-1);

  const startUpgrade = () => {
    setPhase("running");
    setStepStatuses(["running", "pending", "pending", "pending"]);
    setFailedStepIndex(null);
    scheduledStepRef.current = -1;
  };

  useEffect(() => {
    if (phase !== "running") return;
    const runningIndex = stepStatuses.findIndex((s) => s === "running");
    if (runningIndex < 0 || scheduledStepRef.current === runningIndex) return;
    scheduledStepRef.current = runningIndex;
    clearStepTimeout();
    stepTimeoutRef.current = setTimeout(() => {
      setStepStatuses((prev) => {
        const next = [...prev];
        const failForDemo = Math.random() < 0.25 && runningIndex > 0;
        if (failForDemo) {
          next[runningIndex] = "failed";
          setFailedStepIndex(runningIndex);
          setPhase("failed");
          scheduledStepRef.current = -1;
          return next;
        }
        next[runningIndex] = "done";
        if (runningIndex === UPGRADE_STEPS.length - 1) {
          setPhase("success");
          scheduledStepRef.current = -1;
          return next;
        }
        next[runningIndex + 1] = "running";
        return next;
      });
    }, 1800);
  }, [phase, stepStatuses]);

  useEffect(() => {
    return () => clearStepTimeout();
  }, []);

  const currentStepIndex = stepStatuses.findIndex((s) => s === "running");
  const showWarning = phase === "running" && currentStepIndex >= 1;

  return (
    <div className="itero-lumina-view flex flex-col w-full flex-1 min-h-0">
      <div
        className="flex items-center justify-between shrink-0"
        style={{ paddingBottom: "var(--spacing-04)" }}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center justify-center p-2 rounded-lg border-0 bg-transparent cursor-pointer hover:bg-surface-alt transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 touch-target-min"
            aria-label="Back"
          >
            <img src="/settings/Chevron left.svg" alt="" className="w-8 h-8" aria-hidden />
          </button>
          <h2 className="tp-heading-04 text-text-primary">Upgrade Status</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center justify-center p-2 rounded-lg border-0 bg-transparent cursor-pointer hover:bg-surface-alt transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 touch-target-min"
          aria-label="Close"
        >
          <CloseIcon size={24} color="var(--color-icon-primary)" />
        </button>
      </div>

      <div
        className="flex flex-col w-full flex-1 min-h-0"
        style={{
          paddingTop: "var(--spacing-06)",
          gap: "var(--spacing-06)",
          paddingRight: "60px",
          paddingLeft: "64px",
        }}
      >
        <h3 className="tp-label-02 text-text-secondary">Upgrade Status</h3>

        {phase === "intro" ? (
          <>
            <div className="itero-lumina-intro flex flex-col flex-1 min-h-0">
              <p className="tp-body-02 text-text-primary flex-1 min-h-0">
                This system is registered for an iTero Lumina upgrade. To continue, ensure the iTero Lumina wand is
                connected to the system and tap Upgrade to continue. If you have not installed or received an iTero
                Element 5D wand yet, press Cancel.
              </p>
            </div>
            <div className="flex items-end justify-end gap-3 shrink-0" style={{ paddingTop: "var(--spacing-06)" }}>
              <button
                type="button"
                onClick={onBack}
                className="flex items-center justify-center rounded-lg border border-border-accent bg-[var(--color-background-layer-01)] tp-body-02 text-text-primary transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 hover:bg-[var(--color-background-layer-hovered)] hover:border-[var(--color-border-accent-hovered)]"
                style={{ padding: "var(--spacing-02) var(--spacing-05)", height: "60px", minWidth: 120 }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={startUpgrade}
                className="settings-btn-primary flex items-center justify-center rounded-lg border-0 bg-[var(--color-border-interactive)] tp-body-02 text-white transition-ui-focus focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 hover:bg-[var(--color-border-interactive-hovered)]"
                style={{ padding: "var(--spacing-02) var(--spacing-05)", height: "60px", minWidth: 120 }}
              >
                Upgrade
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col" style={{ gap: "var(--spacing-03)" }}>
              {UPGRADE_STEPS.map((label, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between w-full"
                  style={{ minHeight: 28 }}
                >
                  <span className="tp-body-02 text-text-primary">{label}</span>
                  <span className="shrink-0 flex items-center justify-center" style={{ width: 56, textAlign: "right" }}>
                    {stepStatuses[i] === "running" && <span className="upgrade-spinner" aria-hidden />}
                    {stepStatuses[i] === "done" && (
                      <span className="tp-body-02 text-text-primary">Done</span>
                    )}
                    {stepStatuses[i] === "failed" && (
                      <span className="tp-body-02 text-text-primary">Failed</span>
                    )}
                    {stepStatuses[i] === "pending" && null}
                  </span>
                </div>
              ))}
            </div>

            {phase === "failed" && (
              <div
                className="flex items-center gap-2"
                role="alert"
                style={{ marginTop: "var(--spacing-04)" }}
              >
                <span
                  className="flex items-center justify-center rounded-full bg-[var(--color-background-destructive)] text-white tp-body-02 font-medium shrink-0"
                  style={{ width: 24, height: 24 }}
                  aria-hidden
                >
                  !
                </span>
                <span className="tp-body-02 font-medium text-[var(--color-text-error)]">Failed</span>
              </div>
            )}

            {showWarning && (
              <div
                className="flex items-start gap-2 rounded-lg"
                style={{
                  padding: "var(--spacing-03) var(--spacing-04)",
                  backgroundColor: "var(--color-background-highlight-blue)",
                  marginTop: "var(--spacing-04)",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  className="shrink-0 mt-0.5"
                  aria-hidden
                >
                  <circle cx="10" cy="10" r="9" fill="var(--color-border-interactive)" />
                  <path
                    d="M10 6v4M10 13v1"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                <p className="tp-body-02 text-[var(--color-text-on-highlight-blue)]">
                  Do not disconnect power, wand or turn off while upgrading.
                </p>
              </div>
            )}

            {phase === "success" && (
              <div className="flex items-center gap-2" style={{ marginTop: "var(--spacing-04)" }}>
                <CheckIcon size={24} color="var(--color-text-success)" className="shrink-0" />
                <span className="tp-body-02 text-[var(--color-text-success)]">Upgrade complete.</span>
              </div>
            )}

            {(phase === "failed" || phase === "success") && (
              <button
                type="button"
                onClick={onBack}
                className="settings-btn-primary flex items-center justify-center rounded-lg border-0 bg-[var(--color-border-interactive)] tp-body-02 text-white transition-ui-focus focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 hover:bg-[var(--color-border-interactive-hovered)] w-fit"
                style={{ padding: "var(--spacing-02) var(--spacing-05)", height: "60px", marginTop: "var(--spacing-06)" }}
              >
                {phase === "success" ? "Close" : "Back"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function SettingsModal({
  onClose,
  brightness,
  onBrightnessChange,
  volume,
  onVolumeChange,
  initialView = "main",
}: SettingsModalProps) {
  const [view, setView] = useState<SettingsView>(initialView);
  const hasNavigated = useRef(false);

  const handleNavigate = (v: SettingsView) => {
    hasNavigated.current = true;
    setView(v);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex min-h-dvh w-full items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={
        view === "main"
          ? "Settings"
          : view === "brightness"
            ? "Brightness"
            : view === "volume"
              ? "Volume"
              : view === "wifi"
                ? "Wi-Fi"
                : view === "timezone"
                ? "Time Zone"
                : view === "license"
                  ? "Licensing Information"
                  : view === "diagnostics"
                    ? "Diagnostics"
                    : view === "signature"
                      ? "Signature Settings"
                      : view === "localization"
                        ? "Localization"
                        : view === "export"
                          ? "Export settings"
                          : view === "rx"
                            ? "Rx Settings"
                            : view === "system"
                              ? "System Information"
                              : view === "account-pairing"
                                ? "Account Pairing"
                                : view === "itero"
                                  ? "Upgrade Status"
                                  : view === "login"
                                    ? "Login Settings"
                                    : view === "scan"
                                      ? "Scan Settings"
                                      : "Screen Casting"
      }
    >
      <div
        className="absolute inset-0 animate-modal-backdrop-enter"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.63)" }}
        onClick={onClose}
        aria-hidden
      />
      <div
        className="settings-modal-panel relative z-10 flex flex-col rounded-2xl border border-border-subtle bg-[var(--color-background-layer-01)] shadow-xl animate-modal-content-enter overflow-hidden max-w-[calc(100vw-2*var(--spacing-06))] max-h-[calc(100dvh-2*var(--spacing-06))]"
        style={{
          boxShadow: "var(--shadow-card)",
          padding: "var(--spacing-06)",
          width: 1000,
          height: view === "scan" ? 1095 : 808,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          key={view}
          className={`flex flex-col flex-1 min-h-0 min-w-0 overflow-hidden${hasNavigated.current ? " animate-settings-view-enter" : ""}`}
        >
          {view === "main" && (
            <MainSettingsView onClose={onClose} onNavigate={(v) => handleNavigate(v)} />
          )}
          {view === "brightness" && (
          <BrightnessView
            onBack={() => handleNavigate("main")}
            onClose={onClose}
            brightness={brightness}
            onBrightnessChange={onBrightnessChange}
          />
        )}
        {view === "volume" && (
          <VolumeView
            onBack={() => handleNavigate("main")}
            onClose={onClose}
            volume={volume}
            onVolumeChange={onVolumeChange}
          />
        )}
        {view === "wifi" && (
          <WiFiSettingsView onBack={() => handleNavigate("main")} onClose={onClose} />
        )}
        {view === "timezone" && (
          <TimeZoneView onBack={() => handleNavigate("main")} onClose={onClose} />
        )}
        {view === "license" && (
          <LicensingInformationView onBack={() => handleNavigate("main")} onClose={onClose} />
        )}
        {view === "diagnostics" && (
          <DiagnosticsView onBack={() => handleNavigate("main")} onClose={onClose} />
        )}
        {view === "signature" && (
          <SignatureSettingsView onBack={() => handleNavigate("main")} onClose={onClose} />
        )}
        {view === "localization" && (
          <LocalizationView onBack={() => handleNavigate("main")} onClose={onClose} />
        )}
        {view === "export" && (
          <ExportSettingsView onBack={() => handleNavigate("main")} onClose={onClose} />
        )}
        {view === "rx" && (
          <RXSettingsView onBack={() => handleNavigate("main")} onClose={onClose} />
        )}
        {view === "system" && (
          <SystemInformationView onBack={() => handleNavigate("main")} onClose={onClose} />
        )}
        {view === "screen-casting" && (
          <ScreenCastingView onBack={() => handleNavigate("main")} onClose={onClose} />
        )}
        {view === "account-pairing" && (
          <AccountPairingView onBack={() => handleNavigate("main")} onClose={onClose} />
        )}
        {view === "itero" && (
          <IteroLuminaView onBack={() => handleNavigate("main")} onClose={onClose} />
        )}
        {view === "login" && (
          <LoginSettingsView onBack={() => handleNavigate("main")} onClose={onClose} />
        )}
        {view === "scan" && (
          <ScanSettingsView onBack={() => handleNavigate("main")} onClose={onClose} />
        )}
        </div>
      </div>
    </div>
  );
}
