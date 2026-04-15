/**
 * Pre-wizard patient details — Figma UI-Refresh-2026 Q2 (node 4043:75545).
 * Shown after Home → Scan before the existing Info step. Next stays disabled until
 * required fields are complete, then continues into ScanFlowPage.
 *
 * Copy and casing match Figma (sentence case labels — not tp-label-01, which is uppercase).
 */

import { useMemo, useRef, useState } from "react";
import ScanFlowHeader from "./ScanFlowHeader";
import SearchInput from "./SearchInput";
import type { SearchInputRef } from "./SearchInput";
import VirtualKeyboard from "./VirtualKeyboard";
import { DatePickerField, DropdownField } from "./FixedRestorativeForm";
import { patients } from "../data/patients";
import type { Patient } from "../data/patients";
import type { ScanFlowPatientSnapshot } from "./ScanFlowPage";

const KEYBOARD_HEIGHT = 340;

/** Figma: filled text fields — layer-02, no border (4044:90646 Field). */
const textFieldShell =
  "flex w-full min-h-[60px] max-h-[64px] items-center gap-2 rounded-lg bg-[var(--color-background-layer-02)] px-4 py-4 outline-none transition-ui focus-within:ring-2 focus-within:ring-[var(--color-border-focus)] focus-within:ring-offset-0";

const GENDER_DROPDOWN_OPTIONS = [
  { id: "", label: "Select an option" },
  { id: "Male", label: "Male" },
  { id: "Female", label: "Female" },
] as const;

function parsePatientDobString(s: string): Date | null {
  const m = s.trim().match(/^(\d{2})[./](\d{2})[./](\d{4})$/);
  if (!m) return null;
  const month = Number(m[1]) - 1;
  const day = Number(m[2]);
  const year = Number(m[3]);
  const d = new Date(year, month, day);
  if (d.getFullYear() !== year || d.getMonth() !== month || d.getDate() !== day) return null;
  return d;
}

function formatDobForPatientSnapshot(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

export interface ScanPatientDetailsPageProps {
  selectedDoctorName?: string | null;
  onBack: () => void;
  onOpenSettings?: () => void;
  onContinue: (patient: ScanFlowPatientSnapshot) => void;
}

export default function ScanPatientDetailsPage({
  selectedDoctorName,
  onBack,
  onOpenSettings,
  onContinue,
}: ScanPatientDetailsPageProps) {
  const defaultTreatedBy = selectedDoctorName
    ? `${selectedDoctorName} | 12367854`
    : "Doctor Name | 12367854";

  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const searchInputRef = useRef<SearchInputRef>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState<"" | "Male" | "Female">("");
  const [genderDropdownOpen, setGenderDropdownOpen] = useState(false);
  const [dobDate, setDobDate] = useState<Date | null>(null);
  const [dobPickerOpen, setDobPickerOpen] = useState(false);
  const dobPickerRef = useRef<HTMLDivElement>(null);
  const [chartNumber, setChartNumber] = useState("");
  const [lastScanLine, setLastScanLine] = useState("—");
  const [treatedByLine, setTreatedByLine] = useState(defaultTreatedBy);

  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.trim().toLowerCase();
    return patients.filter(
      (p) =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
        p.patientId.toLowerCase().includes(q),
    ).slice(0, 8);
  }, [searchQuery]);

  const formComplete =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    gender !== "" &&
    dobDate !== null &&
    chartNumber.trim().length > 0;

  const applyPatient = (p: Patient) => {
    setFirstName(p.firstName);
    setLastName(p.lastName);
    setGender(p.gender);
    setDobDate(parsePatientDobString(p.dateOfBirth));
    setChartNumber(p.patientId);
    setLastScanLine(p.lastScanDate);
    setTreatedByLine(`${p.doctor} | ${p.patientId}`);
    setSearchQuery("");
    setSearchFocused(false);
    searchInputRef.current?.blur();
  };

  const handleNext = () => {
    if (!formComplete) return;
    onContinue({
      patientName: `${firstName.trim()} ${lastName.trim()}`,
      patientId: chartNumber.trim(),
      dateOfBirth: formatDobForPatientSnapshot(dobDate!),
      gender,
      lastScan: lastScanLine,
      treatedBy: treatedByLine,
    });
  };

  return (
    <div className="flex flex-col w-full h-full min-h-0 overflow-hidden bg-page-bg relative">
      <ScanFlowHeader
        currentStep="info"
        onStepClick={undefined}
        wizardStepperInteractive={false}
        onInfoClick={onBack}
        onSettingsClick={onOpenSettings}
      />

      <div
        className="flex flex-1 min-h-0 min-w-0 items-center justify-center transition-[padding] duration-[360ms] ease-[var(--motion-ease-out-soft)]"
        style={{
          padding: 16,
          paddingBottom: searchFocused ? KEYBOARD_HEIGHT : 16,
        }}
      >
        <div
          className="flex w-full max-w-[1807px] flex-col gap-6 rounded-lg bg-surface px-6 py-5"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <h1 className="tp-heading-04 text-text-primary">Patient details</h1>

          <div className="relative w-full max-w-[418px] shrink-0">
            <SearchInput
              ref={searchInputRef}
              id="scan-patient-search"
              value={searchQuery}
              isFocused={searchFocused}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              onChange={setSearchQuery}
              onClear={() => {
                setSearchQuery("");
                setSearchFocused(false);
              }}
              placeholder="Search"
              ariaLabel="Search"
              typographyClassName="tp-body-04"
              containerClassName="w-full max-w-[418px] min-w-0 shrink-0 rounded-lg"
            />
            {filteredPatients.length > 0 && (
              <ul
                className="absolute left-0 right-0 top-[calc(100%+4px)] z-20 max-h-[280px] overflow-y-auto rounded-lg border border-border-subtle bg-surface py-1 shadow-[var(--shadow-card)]"
                role="listbox"
              >
                {filteredPatients.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      className="tp-body-04 flex w-full cursor-pointer border-0 bg-transparent px-4 py-3 text-left text-text-primary transition-ui hover:bg-[var(--color-background-layer-hovered)]"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => applyPatient(p)}
                    >
                      {p.firstName} {p.lastName}
                      <span className="tp-body-01 text-text-secondary"> · {p.patientId}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="flex min-w-0 flex-col gap-2">
                <span className="tp-body-01 text-text-secondary">First name</span>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Placeholder text"
                  className={`${textFieldShell} tp-body-04 text-text-primary placeholder:text-text-tertiary`}
                  autoComplete="given-name"
                />
              </label>
              <label className="flex min-w-0 flex-col gap-2">
                <span className="tp-body-01 text-text-secondary">Last name</span>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Placeholder text"
                  className={`${textFieldShell} tp-body-04 text-text-primary placeholder:text-text-tertiary`}
                  autoComplete="family-name"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="min-w-0">
                <div style={{ paddingBottom: 8 }}>
                  <span className="tp-body-01 text-text-secondary">
                    Gender at birth
                    <span className="text-text-error"> *</span>
                  </span>
                </div>
                <DropdownField
                  id="patient-gender-at-birth"
                  ariaLabel="Gender at birth"
                  value={gender}
                  options={[...GENDER_DROPDOWN_OPTIONS]}
                  onChange={(id) => {
                    setGender(id as "" | "Male" | "Female");
                    setGenderDropdownOpen(false);
                  }}
                  isOpen={genderDropdownOpen}
                  onToggle={() => {
                    setDobPickerOpen(false);
                    setGenderDropdownOpen((o) => !o);
                  }}
                  backgroundVariant="layer-02"
                />
              </div>
              <div className="min-w-0">
                <DatePickerField
                  label="Date of birth"
                  value={dobDate}
                  onChange={setDobDate}
                  isOpen={dobPickerOpen}
                  onToggle={() => {
                    setGenderDropdownOpen(false);
                    setDobPickerOpen((o) => !o);
                  }}
                  onClose={() => setDobPickerOpen(false)}
                  containerRef={dobPickerRef}
                  calendarAriaLabel="Choose date of birth"
                />
              </div>
            </div>

            <label className="flex max-w-[758px] flex-col gap-2">
              <span className="tp-body-01 text-text-secondary">Chart number</span>
              <input
                type="text"
                value={chartNumber}
                onChange={(e) => setChartNumber(e.target.value)}
                placeholder="Placeholder text"
                className={`${textFieldShell} tp-body-04 text-text-primary placeholder:text-text-tertiary`}
                autoComplete="off"
              />
            </label>
          </div>

          <div
            className="h-px w-full shrink-0 bg-[var(--color-border-subtle)]"
            aria-hidden
          />

          <div className="flex justify-end pt-4">
            <button
              type="button"
              disabled={!formComplete}
              onClick={handleNext}
              className={`tp-body-04 flex h-[var(--height-row)] min-w-[140px] items-center justify-center rounded-lg border-0 px-4 transition-ui focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
                formComplete
                  ? "cursor-pointer bg-[var(--color-background-brand)] text-on-color hover:opacity-90"
                  : "cursor-not-allowed bg-[var(--color-background-brand-disabled)] text-[var(--color-text-disabled)]"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {searchFocused && (
        <VirtualKeyboard
          onKeyPress={(key) => setSearchQuery((prev) => prev + key)}
          onBackspace={() => setSearchQuery((prev) => prev.slice(0, -1))}
          onClose={() => {
            searchInputRef.current?.blur();
            setSearchFocused(false);
          }}
        />
      )}
    </div>
  );
}
