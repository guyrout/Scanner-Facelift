import { useState, useRef, useEffect, forwardRef } from "react";
import {
  ChevronLeftIcon,
  HelpIcon,
  BatteryIcon,
  SettingsIcon,
  TagIcon,
  UserIcon,
  CaretDownIcon,
  CaretUpIcon,
  CheckIcon,
} from "./Icons";
import BatteryModal from "./BatteryModal";

/** Mock data for companies and dentists */
const COMPANIES = [
  { id: "1", name: "QACompanyQA Exclusively Dental Practice" },
  { id: "2", name: "Align Technology Demo Lab" },
  { id: "3", name: "Smile Care Dental Group" },
];

const DENTISTS = [
  { id: "1", name: "Dr. Rudnik, QAPerson", role: "Dentist - General" },
  { id: "2", name: "Dr. Mitra Malini", role: "Dentist - Orthodontist" },
  { id: "3", name: "Dr. Sarah Chen", role: "Dentist - Pediatric" },
];

interface HeaderProps {
  title?: string;
  onBack?: () => void;
  onSettingsClick?: () => void;
}

export default function Header({ title = "Patients", onBack, onSettingsClick }: HeaderProps) {
  const [selectedCompanyId, setSelectedCompanyId] = useState(COMPANIES[0].id);
  const [selectedDentistId, setSelectedDentistId] = useState(DENTISTS[0].id);
  const [companyOpen, setCompanyOpen] = useState(false);
  const [dentistOpen, setDentistOpen] = useState(false);
  const [batteryModalOpen, setBatteryModalOpen] = useState(false);
  const companyRef = useRef<HTMLDivElement>(null);
  const dentistRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (companyRef.current && !companyRef.current.contains(target)) setCompanyOpen(false);
      if (dentistRef.current && !dentistRef.current.contains(target)) setDentistOpen(false);
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setCompanyOpen(false);
        setDentistOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const selectedCompany = COMPANIES.find((c) => c.id === selectedCompanyId) ?? COMPANIES[0];
  const selectedDentist = DENTISTS.find((d) => d.id === selectedDentistId) ?? DENTISTS[0];

  return (
    <>
    <header
      className="grid grid-cols-[1fr_2fr_1fr] items-center w-full bg-surface border-b border-border-subtle py-1.5 shrink-0"
      style={{ paddingLeft: 16, paddingRight: 16 }}
    >
      {/* Left: Back button + title */}
      <div className="flex items-center gap-4 min-w-0 pr-4">
        {onBack ? (
          <button
            type="button"
            className="flex items-center gap-2 h-[var(--height-row)] min-w-[72px] py-3 pr-4 rounded-lg border-0 bg-transparent cursor-pointer hover:bg-surface-alt transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            onClick={onBack}
          >
            <ChevronLeftIcon size={32} color="var(--color-icon-primary)" />
            <span className="tp-heading-03 text-text-primary text-center whitespace-nowrap">
              {title}
            </span>
          </button>
        ) : (
          <span className="tp-heading-03 text-text-primary whitespace-nowrap">{title}</span>
        )}
      </div>

      {/* Center: Two dropdowns — always centered in header */}
      <div className="flex items-center justify-center gap-4 min-w-0">
        <HeaderDropdown
          ref={companyRef}
          icon={<TagIcon size={20} color="var(--color-icon-secondary)" />}
          label={selectedCompany.name}
          isOpen={companyOpen}
          onToggle={() => {
            setCompanyOpen(!companyOpen);
            setDentistOpen(false);
          }}
          options={COMPANIES.map((c) => ({ id: c.id, label: c.name }))}
          selectedId={selectedCompanyId}
          onSelect={(id) => {
            setSelectedCompanyId(id);
            setCompanyOpen(false);
          }}
          ariaLabel="Select company"
        />
        <HeaderDropdown
          ref={dentistRef}
          icon={<UserIcon size={20} color="var(--color-icon-secondary)" />}
          label={`${selectedDentist.name} - ${selectedDentist.role}`}
          isOpen={dentistOpen}
          onToggle={() => {
            setDentistOpen(!dentistOpen);
            setCompanyOpen(false);
          }}
          options={[
            { id: "show-all-drs", label: "Show all Drs" },
            ...DENTISTS.map((d) => ({ id: d.id, label: `${d.name} - ${d.role}` })),
          ]}
          selectedId={selectedDentistId}
          onSelect={(id) => {
            if (id === "show-all-drs") {
              setDentistOpen(false);
              return;
            }
            setSelectedDentistId(id);
            setDentistOpen(false);
          }}
          ariaLabel="Select dentist"
        />
      </div>

      {/* Right: Help, Battery, Settings */}
      <div className="flex items-center justify-end gap-1 h-[var(--height-row)] min-w-0">
        <button type="button" className="flex items-center justify-center p-3 rounded-lg size-[var(--height-row)] border-0 bg-transparent cursor-pointer hover:bg-surface-alt transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-surface">
          <HelpIcon size={32} />
        </button>
        <button
          type="button"
          onClick={() => setBatteryModalOpen((o) => !o)}
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
          <SettingsIcon size={32} />
        </button>
      </div>

    </header>

    {batteryModalOpen && (
      <BatteryModal onClose={() => setBatteryModalOpen(false)} level={100} />
    )}
    </>
  );
}

interface HeaderDropdownProps {
  icon: React.ReactNode;
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  options: { id: string; label: string }[];
  selectedId: string;
  onSelect: (id: string) => void;
  ariaLabel: string;
}

const HeaderDropdown = forwardRef<HTMLDivElement, HeaderDropdownProps>(
  function HeaderDropdown({ icon, label, isOpen, onToggle, options, selectedId, onSelect, ariaLabel }, ref) {
    return (
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={onToggle}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={ariaLabel}
          className={`flex items-center gap-2 h-[var(--height-row)] w-[323px] shrink-0 px-3 rounded-lg border cursor-pointer transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 text-left ${
            isOpen
              ? "border-[var(--color-border-interactive)] bg-[var(--color-background-layer-02)]"
              : "border-border-subtle bg-[var(--color-background-layer-02)] hover:bg-[var(--color-background-layer-hovered)]"
          }`}
        >
          <span className="shrink-0" aria-hidden>
            {icon}
          </span>
          <span className="tp-body-02 text-text-primary truncate flex-1 min-w-0">{label}</span>
          {isOpen ? (
            <CaretUpIcon size={24} color="var(--color-icon-primary)" className="shrink-0" />
          ) : (
            <CaretDownIcon size={24} color="var(--color-icon-secondary)" className="shrink-0" />
          )}
        </button>

        {isOpen && (
          <ul
            role="listbox"
            aria-label={ariaLabel}
            className="absolute left-0 top-full z-20 flex max-h-60 w-full flex-col overflow-auto rounded-lg border border-border-subtle bg-[var(--color-background-elevated)] [&>li+li]:border-t [&>li+li]:border-border-subtle scrollbar-table"
            style={{ minHeight: 0, boxShadow: "var(--shadow-card)", marginTop: "4px" }}
          >
            {options.map((opt) => {
              const isSelected = opt.id === selectedId;
              return (
                <li key={opt.id} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onClick={() => onSelect(opt.id)}
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
                    <span className="tp-body-02 truncate">{opt.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  }
);
