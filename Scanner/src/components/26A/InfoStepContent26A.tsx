/**
 * 26A — Consolidated Info step (Figma EwzmVGJYao5GeAUngUIYak / node 6171:2243).
 *
 * Single scrollable page. Section order (top → bottom):
 *   1. Doctor details   — Figma 6171:2244
 *   2. Patient          — Figma 6171:2245
 *   3. Order            — Figma 6171:2246
 *   4. Scan Options     — Figma 6171:2247
 *   5–8. Tooth Selector + Treatment Info + Attachments + Note — Figma 6171:2248–2251
 *        (delegated to FixedRestorativeForm26A with hideTopRow + hideToggles)
 *   Study model (treatment = study-model): Order + Scan Options match Figma 6172:3809; only
 *   Attachments + Note below (no tooth chart) — FixedRestorativeForm26A attachmentsNoteOnly.
 */

import { useMemo, useRef, useState, type Dispatch, type SetStateAction } from "react";
import SearchInput from "../SearchInput";
import type { SearchInputRef } from "../SearchInput";
import VirtualKeyboard from "../VirtualKeyboard";
import {
  DropdownField,
  DatePickerField,
  ToggleSwitch,
  TREATMENT_OPTIONS,
  SEND_TO_OPTIONS,
  type ToothDetail,
  type ToggleState,
} from "./FixedRestorativeForm26A";
import FixedRestorativeForm26A from "./FixedRestorativeForm26A";
import { patients } from "../../data/patients";
import type { Patient } from "../../data/patients";
import type { ScanFlowPatientSnapshot } from "./ScanFlowPage26A";
import Avatar from "../Avatar";
import studyModelSvg from "../../assets/procedures/study-model.svg";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const KEYBOARD_HEIGHT = 340;

const textFieldShell =
  "flex w-full min-h-[60px] items-center gap-2 rounded-lg bg-[var(--color-background-layer-02)] px-4 py-4 outline-none transition-ui focus-within:ring-2 focus-within:ring-[var(--color-border-focus)] focus-within:ring-offset-0";

const CARD_STYLE: React.CSSProperties = {
  border: "1px solid var(--color-border-subtle)",
  boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
  borderRadius: 16,
  backgroundColor: "var(--color-surface, white)",
};

const GENDER_OPTIONS = [
  { id: "", label: "Select an option" },
  { id: "Male", label: "Male" },
  { id: "Female", label: "Female" },
] as const;

/** Order card — Study model / Invisalign RX (Figma 6172:3813) */
const STUDY_ALIGNER_PRODUCT_OPTIONS: { id: string; label: string }[] = [
  { id: "", label: "Select an option" },
  { id: "invisalign-aligners", label: "Invisalign Aligners" },
];

const STUDY_TREATMENT_STAGE_OPTIONS: { id: string; label: string }[] = [
  { id: "", label: "Select an option" },
  { id: "treatment-stage", label: "Treatment Stage" },
];

/** Figma 6172:3813 uses generic “Label” + required asterisk on all four order fields. */
function OrderFieldLabelFigma() {
  return (
    <span className="tp-body-01 text-text-secondary">
      Label{" "}
      <span className="text-[var(--color-text-error,#d43f58)]">*</span>
    </span>
  );
}

function parsePatientDob(s: string): Date | null {
  const m = s.trim().match(/^(\d{2})[./](\d{2})[./](\d{4})$/);
  if (!m) return null;
  const month = Number(m[1]) - 1;
  const day = Number(m[2]);
  const year = Number(m[3]);
  const d = new Date(year, month, day);
  if (d.getFullYear() !== year || d.getMonth() !== month || d.getDate() !== day) return null;
  return d;
}

function formatDob(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

/* ------------------------------------------------------------------ */
/*  Doctor details — Figma 6171:2244                                   */
/* Horizontal card: avatar (48px) | name + subtitle | License label + value */
/* ------------------------------------------------------------------ */

function DoctorDetailsSection({ doctorName }: { doctorName: string | null | undefined }) {
  const name = doctorName ?? "Dr. Thomas Smith";
  const parts = name.trim().split(/\s+/);
  const first = parts[0] ?? "D";
  const last = parts.slice(1).join(" ") || "S";
  return (
    <div
      className="flex w-full items-center"
      style={{ ...CARD_STYLE, height: 124, padding: "12px 16px", gap: 12 }}
    >
      {/* Avatar */}
      <div className="flex flex-row items-center shrink-0" style={{ marginTop: 8 }}>
        <Avatar firstName={first} lastName={last} size={48} initialsFontSize={18} />
      </div>

      {/* Name + subtitle */}
      <div className="flex flex-col gap-1 min-w-0 shrink-0" style={{ width: 568 }}>
        <span className="tp-heading-03 text-text-primary whitespace-nowrap">{name}</span>
        <span className="tp-body-02 text-text-secondary whitespace-nowrap">QA Person - Dentist - Michael QA</span>
      </div>

      {/* License */}
      <div className="flex flex-1 flex-col gap-1 min-w-0">
        <span className="tp-heading-03 text-text-primary">License</span>
        <span className="tp-body-02 text-text-secondary truncate">123456789012345678901234567890123</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Props                                                               */
/* ------------------------------------------------------------------ */

export interface InfoStepContent26AProps {
  patient: ScanFlowPatientSnapshot;
  onPatientChange: (p: ScanFlowPatientSnapshot) => void;
  doctorName?: string | null;
  treatmentId: string;
  setTreatmentId: Dispatch<SetStateAction<string>>;
  sendToId: string;
  setSendToId: Dispatch<SetStateAction<string>>;
  dueDate: Date | null;
  setDueDate: Dispatch<SetStateAction<Date | null>>;
  toothSelections: Record<number, string>;
  setToothSelections: Dispatch<SetStateAction<Record<number, string>>>;
  toothDetails: Record<number, ToothDetail>;
  setToothDetails: Dispatch<SetStateAction<Record<number, ToothDetail>>>;
  toggles: ToggleState;
  setToggles: Dispatch<SetStateAction<ToggleState>>;
  noteText: string;
  setNoteText: Dispatch<SetStateAction<string>>;
}

/* ------------------------------------------------------------------ */
/*  Main component                                                      */
/* ------------------------------------------------------------------ */

export default function InfoStepContent26A({
  patient,
  onPatientChange,
  doctorName,
  treatmentId, setTreatmentId,
  sendToId, setSendToId,
  dueDate, setDueDate,
  toothSelections, setToothSelections,
  toothDetails, setToothDetails,
  toggles, setToggles,
  noteText, setNoteText,
}: InfoStepContent26AProps) {
  /* ---- Patient fields ---- */
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const searchInputRef = useRef<SearchInputRef>(null);

  const nameParts = patient.patientName.trim().split(/\s+/);
  const [firstName, setFirstName] = useState(nameParts[0] ?? "");
  const [lastName, setLastName] = useState(nameParts.slice(1).join(" ") ?? "");
  const [gender, setGender] = useState<"" | "Male" | "Female">(
    (patient.gender === "Male" || patient.gender === "Female" ? patient.gender : "") as "" | "Male" | "Female"
  );
  const [genderDropdownOpen, setGenderDropdownOpen] = useState(false);
  const [dobDate, setDobDate] = useState<Date | null>(() => parsePatientDob(patient.dateOfBirth));
  const [dobPickerOpen, setDobPickerOpen] = useState(false);
  const dobPickerRef = useRef<HTMLDivElement>(null);
  const [chartNumber, setChartNumber] = useState(patient.patientId ?? "");

  /* ---- Order dropdowns ---- */
  const [treatmentDropdownOpen, setTreatmentDropdownOpen] = useState(false);
  const [sendToDropdownOpen, setSendToDropdownOpen] = useState(false);
  /** Study model order row (Figma 6172:3813) */
  const [studyAlignerProductId, setStudyAlignerProductId] = useState("invisalign-aligners");
  const [studyTreatmentStageId, setStudyTreatmentStageId] = useState("treatment-stage");
  const [studyCurrentAligner, setStudyCurrentAligner] = useState("");
  const [studyAlignerDropdownOpen, setStudyAlignerDropdownOpen] = useState(false);
  const [studyStageDropdownOpen, setStudyStageDropdownOpen] = useState(false);

  const isStudyModel = treatmentId === "study-model";

  /* ---- Patient search ---- */
  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.trim().toLowerCase();
    return patients
      .filter(
        (p) =>
          `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
          p.patientId.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [searchQuery]);

  function applyPatient(p: Patient) {
    setFirstName(p.firstName);
    setLastName(p.lastName);
    setGender(p.gender as "" | "Male" | "Female");
    setDobDate(parsePatientDob(p.dateOfBirth));
    setChartNumber(p.patientId);
    setSearchQuery("");
    setSearchFocused(false);
    searchInputRef.current?.blur();
    commitPatient(p.firstName, p.lastName, p.gender as "" | "Male" | "Female", parsePatientDob(p.dateOfBirth), p.patientId);
  }

  function commitPatient(fn: string, ln: string, g: "" | "Male" | "Female", dob: Date | null, chart: string) {
    onPatientChange({
      ...patient,
      patientName: `${fn.trim()} ${ln.trim()}`.trim(),
      patientId: chart.trim(),
      dateOfBirth: dob ? formatDob(dob) : patient.dateOfBirth,
      gender: g || patient.gender,
    });
  }

  function setToggle(key: keyof ToggleState, value: boolean) {
    setToggles((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div
      className="flex-1 min-h-0 min-w-0 overflow-auto scrollbar-hidden bg-[var(--color-page-background)]"
      style={{ paddingBottom: searchFocused ? KEYBOARD_HEIGHT + 16 : 16 }}
    >
      <div className="flex flex-col mx-auto" style={{ padding: "16px 24px", gap: 16, maxWidth: 1400 }}>

        {/* ── 1. Doctor details — Figma 6171:2244 ─────────────────── */}
        <DoctorDetailsSection doctorName={doctorName} />

        {/* ── 2. Patient — Figma 6171:2245 ────────────────────────── */}
        <div className="flex flex-col w-full" style={{ ...CARD_STYLE, padding: "32px 28px 60px 28px", gap: 16 }}>
          {/* Header row: title + search */}
          <div className="flex items-center justify-between w-full" style={{ height: 64 }}>
            <h2 className="tp-heading-04 text-text-primary" style={{ fontSize: 24, lineHeight: "32px" }}>Patient</h2>
            <div className="relative" style={{ flexShrink: 0 }}>
              <SearchInput
                ref={searchInputRef}
                id="info-patient-search"
                value={searchQuery}
                isFocused={searchFocused}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                onChange={setSearchQuery}
                onClear={() => { setSearchQuery(""); setSearchFocused(false); }}
                placeholder="Search"
                ariaLabel="Search patient"
                typographyClassName="tp-body-04"
                containerClassName="rounded-lg"
              />
              {filteredPatients.length > 0 && (
                <ul
                  className="absolute right-0 top-[calc(100%+4px)] z-20 max-h-[280px] overflow-y-auto rounded-lg border border-border-subtle bg-surface py-1 shadow-[var(--shadow-card)]"
                  style={{ minWidth: 280 }}
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
          </div>

          {/* Fields grid */}
          <div className="flex w-full" style={{ gap: 23 }}>
            {/* Left column */}
            <div className="flex flex-col flex-1 min-w-0" style={{ gap: 18 }}>
              <label className="flex min-w-0 flex-col" style={{ gap: 8 }}>
                <span className="tp-body-01 text-text-secondary">
                  Name <span className="text-[var(--color-text-error,#d43f58)]">*</span>
                </span>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => { setFirstName(e.target.value); commitPatient(e.target.value, lastName, gender, dobDate, chartNumber); }}
                  placeholder="First name"
                  className={`${textFieldShell} tp-body-04 text-text-primary placeholder:text-text-tertiary`}
                  autoComplete="given-name"
                />
              </label>
              <label className="flex min-w-0 flex-col" style={{ gap: 8 }}>
                <span className="tp-body-01 text-text-secondary">Date of Birth <span className="text-[var(--color-text-error,#d43f58)]">*</span></span>
                <DatePickerField
                  label=""
                  value={dobDate}
                  onChange={(d) => { setDobDate(d); commitPatient(firstName, lastName, gender, d, chartNumber); }}
                  isOpen={dobPickerOpen}
                  onToggle={() => { setGenderDropdownOpen(false); setDobPickerOpen((o) => !o); }}
                  onClose={() => setDobPickerOpen(false)}
                  containerRef={dobPickerRef}
                  calendarAriaLabel="Choose date of birth"
                />
              </label>
              <label className="flex min-w-0 flex-col" style={{ gap: 8 }}>
                <span className="tp-body-01 text-text-secondary">Chart Number</span>
                <input
                  type="text"
                  value={chartNumber}
                  onChange={(e) => { setChartNumber(e.target.value); commitPatient(firstName, lastName, gender, dobDate, e.target.value); }}
                  placeholder="Chart number"
                  className={`${textFieldShell} tp-body-04 text-text-primary placeholder:text-text-tertiary`}
                  autoComplete="off"
                />
              </label>
            </div>

            {/* Right column */}
            <div className="flex flex-col flex-1 min-w-0" style={{ gap: 18 }}>
              <label className="flex min-w-0 flex-col" style={{ gap: 8 }}>
                <span className="tp-body-01 text-text-secondary">
                  Last Name <span className="text-[var(--color-text-error,#d43f58)]">*</span>
                </span>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => { setLastName(e.target.value); commitPatient(firstName, e.target.value, gender, dobDate, chartNumber); }}
                  placeholder="Last name"
                  className={`${textFieldShell} tp-body-04 text-text-primary placeholder:text-text-tertiary`}
                  autoComplete="family-name"
                />
              </label>
              <div className="flex min-w-0 flex-col" style={{ gap: 8 }} ref={dobPickerRef}>
                <span className="tp-body-01 text-text-secondary">
                  Gender at birth <span className="text-[var(--color-text-error,#d43f58)]">*</span>
                </span>
                <DropdownField
                  id="info-gender"
                  ariaLabel="Gender at birth"
                  value={gender}
                  options={[...GENDER_OPTIONS]}
                  onChange={(id) => {
                    const g = id as "" | "Male" | "Female";
                    setGender(g);
                    setGenderDropdownOpen(false);
                    commitPatient(firstName, lastName, g, dobDate, chartNumber);
                  }}
                  isOpen={genderDropdownOpen}
                  onToggle={() => { setDobPickerOpen(false); setGenderDropdownOpen((o) => !o); }}
                  backgroundVariant="layer-02"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. Order — Figma 6171:2246; Study model: Figma 6172:3813 ─ */}
        <div className="flex flex-col w-full" style={{ ...CARD_STYLE, padding: "32px 28px", gap: 16 }}>
          <h2 className="tp-heading-04 text-text-primary" style={{ fontSize: 24, lineHeight: "36px" }}>Order</h2>
          {isStudyModel ? (
            <div className="flex w-full" style={{ gap: 23 }}>
              <div className="flex flex-col flex-1 min-w-0" style={{ gap: 18 }}>
                <div className="flex flex-col min-w-0" style={{ gap: 8 }}>
                  <OrderFieldLabelFigma />
                  <DropdownField
                    id="info-treatment"
                    ariaLabel="Treatment type"
                    value={treatmentId}
                    options={TREATMENT_OPTIONS}
                    onChange={(id) => { setTreatmentId(id); setTreatmentDropdownOpen(false); }}
                    isOpen={treatmentDropdownOpen}
                    onToggle={() => {
                      setSendToDropdownOpen(false);
                      setStudyAlignerDropdownOpen(false);
                      setStudyStageDropdownOpen(false);
                      setTreatmentDropdownOpen((o) => !o);
                    }}
                    backgroundVariant="layer-02"
                    triggerLeading={
                      treatmentId === "study-model" ? (
                        <img src={studyModelSvg} alt="" width={30} height={30} className="shrink-0" aria-hidden />
                      ) : undefined
                    }
                  />
                </div>
                <div className="flex flex-col min-w-0" style={{ gap: 8 }}>
                  <OrderFieldLabelFigma />
                  <DropdownField
                    id="info-study-treatment-stage"
                    ariaLabel="Treatment stage"
                    value={studyTreatmentStageId}
                    options={STUDY_TREATMENT_STAGE_OPTIONS}
                    onChange={(id) => { setStudyTreatmentStageId(id); setStudyStageDropdownOpen(false); }}
                    isOpen={studyStageDropdownOpen}
                    onToggle={() => {
                      setTreatmentDropdownOpen(false);
                      setSendToDropdownOpen(false);
                      setStudyAlignerDropdownOpen(false);
                      setStudyStageDropdownOpen((o) => !o);
                    }}
                    backgroundVariant="layer-02"
                  />
                </div>
              </div>
              <div className="flex flex-col flex-1 min-w-0" style={{ gap: 18 }}>
                <div className="flex flex-col min-w-0" style={{ gap: 8 }}>
                  <OrderFieldLabelFigma />
                  <DropdownField
                    id="info-study-aligner-product"
                    ariaLabel="Aligner product"
                    value={studyAlignerProductId}
                    options={STUDY_ALIGNER_PRODUCT_OPTIONS}
                    onChange={(id) => { setStudyAlignerProductId(id); setStudyAlignerDropdownOpen(false); }}
                    isOpen={studyAlignerDropdownOpen}
                    onToggle={() => {
                      setTreatmentDropdownOpen(false);
                      setSendToDropdownOpen(false);
                      setStudyStageDropdownOpen(false);
                      setStudyAlignerDropdownOpen((o) => !o);
                    }}
                    backgroundVariant="layer-02"
                  />
                </div>
                <div className="flex flex-col min-w-0" style={{ gap: 8 }}>
                  <OrderFieldLabelFigma />
                  <input
                    type="text"
                    value={studyCurrentAligner}
                    onChange={(e) => setStudyCurrentAligner(e.target.value)}
                    placeholder="Current Aligner #:"
                    className={`${textFieldShell} tp-body-04 text-text-primary placeholder:text-text-tertiary`}
                    autoComplete="off"
                    aria-label="Current aligner number"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex w-full" style={{ gap: 23 }}>
              <div className="flex flex-col flex-1 min-w-0" style={{ gap: 18 }}>
                <div className="flex flex-col min-w-0" style={{ gap: 8 }}>
                  <span className="tp-body-01 text-text-secondary">
                    Treatment <span className="text-[var(--color-text-error,#d43f58)]">*</span>
                  </span>
                  <DropdownField
                    id="info-treatment"
                    ariaLabel="Treatment type"
                    value={treatmentId}
                    options={TREATMENT_OPTIONS}
                    onChange={(id) => { setTreatmentId(id); setTreatmentDropdownOpen(false); }}
                    isOpen={treatmentDropdownOpen}
                    onToggle={() => { setSendToDropdownOpen(false); setStudyAlignerDropdownOpen(false); setStudyStageDropdownOpen(false); setTreatmentDropdownOpen((o) => !o); }}
                    backgroundVariant="layer-02"
                  />
                </div>
                <div className="flex flex-col min-w-0" style={{ gap: 8 }}>
                  <span className="tp-body-01 text-text-secondary">Treatment Stage</span>
                  <DropdownField
                    id="info-treatment-stage"
                    ariaLabel="Treatment stage"
                    value=""
                    options={[{ id: "", label: "Treatment Stage" }]}
                    onChange={() => {}}
                    isOpen={false}
                    onToggle={() => {}}
                    backgroundVariant="layer-02"
                  />
                </div>
              </div>
              <div className="flex flex-col flex-1 min-w-0" style={{ gap: 18 }}>
                <div className="flex flex-col min-w-0" style={{ gap: 8 }}>
                  <span className="tp-body-01 text-text-secondary">
                    Send to <span className="text-[var(--color-text-error,#d43f58)]">*</span>
                  </span>
                  <DropdownField
                    id="info-sendto"
                    ariaLabel="Send to"
                    value={sendToId}
                    options={SEND_TO_OPTIONS}
                    onChange={(id) => { setSendToId(id); setSendToDropdownOpen(false); }}
                    isOpen={sendToDropdownOpen}
                    onToggle={() => { setTreatmentDropdownOpen(false); setStudyAlignerDropdownOpen(false); setStudyStageDropdownOpen(false); setSendToDropdownOpen((o) => !o); }}
                    backgroundVariant="layer-02"
                  />
                </div>
                <div className="flex flex-col min-w-0" style={{ gap: 8 }}>
                  <span className="tp-body-01 text-text-secondary">Current Aligner</span>
                  <input
                    type="text"
                    placeholder="Current Aligner #:"
                    className={`${textFieldShell} tp-body-04 text-text-primary placeholder:text-text-tertiary`}
                    autoComplete="off"
                    readOnly
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── 4. Scan Options — Figma 6171:2247; Study model: Figma 6172:3814 (2 toggles) ─ */}
        <div className="flex flex-col w-full" style={{ ...CARD_STYLE, padding: "32px 28px", gap: isStudyModel ? 16 : 24 }}>
          <h2 className="tp-heading-04 text-text-primary" style={{ fontSize: 24, lineHeight: "36px" }}>Scan Options</h2>
          {isStudyModel ? (
            <div className="flex items-start justify-between w-full" style={{ paddingTop: 10, paddingBottom: 10 }}>
              <div className="flex items-center min-w-0" style={{ gap: 23 }}>
                <div className="flex flex-col min-w-0" style={{ gap: 11, maxWidth: 508 }}>
                  <span className="tp-body-02 font-medium text-text-primary">NIRI Capture</span>
                  <span className="tp-body-02 text-text-secondary">Receive emails about your upcoming appointments</span>
                </div>
                <ToggleSwitch label="" checked={toggles.niri} onChange={(v) => setToggle("niri", v)} />
              </div>
              <div className="flex items-center min-w-0" style={{ gap: 23 }}>
                <div className="flex flex-col min-w-0" style={{ gap: 11, maxWidth: 508 }}>
                  <span className="tp-body-02 font-medium text-text-primary">New Sleeve Attached</span>
                  <span className="tp-body-02 text-text-secondary">Receive emails about your upcoming appointments</span>
                </div>
                <ToggleSwitch label="" checked={toggles.sleeve} onChange={(v) => setToggle("sleeve", v)} />
              </div>
            </div>
          ) : (
            <div className="flex w-full flex-col" style={{ gap: 60 }}>
              {/* Row 1: NIRI + New Sleeve — space-between fills the row between the two groups */}
              <div className="flex w-full min-w-0 items-center justify-between">
                <div className="flex min-w-0 items-center" style={{ gap: 23 }}>
                  <div className="flex min-w-0 flex-col" style={{ gap: 11, maxWidth: 508 }}>
                    <span className="tp-body-02 font-medium text-text-primary">NIRI Capture</span>
                    <span className="tp-body-02 text-text-secondary">Receive emails about your upcoming appointments</span>
                  </div>
                  <ToggleSwitch label="" checked={toggles.niri} onChange={(v) => setToggle("niri", v)} />
                </div>
                <div className="flex min-w-0 items-center" style={{ gap: 23 }}>
                  <div className="flex min-w-0 flex-col" style={{ gap: 11, maxWidth: 508 }}>
                    <span className="tp-body-02 font-medium text-text-primary">New Sleeve Attached</span>
                    <span className="tp-body-02 text-text-secondary">Receive emails about your upcoming appointments</span>
                  </div>
                  <ToggleSwitch label="" checked={toggles.sleeve} onChange={(v) => setToggle("sleeve", v)} />
                </div>
              </div>
              {/* Row 2: Pre-treatment + Multi bite */}
              <div className="flex w-full min-w-0 items-center justify-between">
                <div className="flex min-w-0 items-center" style={{ gap: 23 }}>
                  <div className="flex min-w-0 flex-col" style={{ gap: 11, maxWidth: 508 }}>
                    <span className="tp-body-02 font-medium text-text-primary">Pre Treatment Scan</span>
                    <span className="tp-body-02 text-text-secondary">Receive emails about your upcoming appointments</span>
                  </div>
                  <ToggleSwitch label="" checked={toggles.preTreatment} onChange={(v) => setToggle("preTreatment", v)} />
                </div>
                <div className="flex min-w-0 items-center" style={{ gap: 23 }}>
                  <div className="flex min-w-0 flex-col" style={{ gap: 11, maxWidth: 508 }}>
                    <span className="tp-body-02 font-medium text-text-primary">Multi Bite</span>
                    <span className="tp-body-02 text-text-secondary">Receive emails about your upcoming appointments</span>
                  </div>
                  <ToggleSwitch label="" checked={toggles.multiBite} onChange={(v) => setToggle("multiBite", v)} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── 5–8. Tooth Selector + Treatment Info + Attachments + Note */}
        {/* FixedRestorativeForm26A with top-row and toggle duplicates hidden */}
        <FixedRestorativeForm26A
          treatmentId={treatmentId}
          setTreatmentId={setTreatmentId}
          sendToId={sendToId}
          setSendToId={setSendToId}
          dueDate={dueDate}
          setDueDate={setDueDate}
          toothSelections={toothSelections}
          setToothSelections={setToothSelections}
          toothDetails={toothDetails}
          setToothDetails={setToothDetails}
          toggles={toggles}
          setToggles={setToggles}
          noteText={noteText}
          setNoteText={setNoteText}
          hideTopRow
          hideToggles
          attachmentsNoteOnly={isStudyModel}
        />
      </div>

      {searchFocused && (
        <VirtualKeyboard
          onKeyPress={(key) => setSearchQuery((prev) => prev + key)}
          onBackspace={() => setSearchQuery((prev) => prev.slice(0, -1))}
          onClose={() => { searchInputRef.current?.blur(); setSearchFocused(false); }}
        />
      )}
    </div>
  );
}
