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
import { SearchIcon } from "../Icons";
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
import PatientSearchModal26A from "./PatientSearchModal26A";
import type { Patient } from "../../data/patients";
import type { ScanFlowPatientSnapshot } from "./ScanFlowPage26A";
import Avatar from "../Avatar";
import studyModelSvg from "../../assets/procedures/study-model.svg";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

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
/*  Doctor details — Figma UI-Refresh 6171:2244 (Rx Form — doctor details) */
/* Card: p-12 outer → row px-16 py-17 gap-12; avatar column 8px top spacer + 48px avatar; */
/* name column fixed 568px; license column flex-1; gap-4 between stacked lines. */
/* ------------------------------------------------------------------ */

function DoctorDetailsSection({ doctorName }: { doctorName: string | null | undefined }) {
  const name = doctorName ?? "Dr. Thomas Smith";
  const parts = name.trim().split(/\s+/);
  const first = parts[0] ?? "D";
  const last = parts.slice(1).join(" ") || "S";
  return (
    <div className="flex w-full flex-col items-stretch overflow-hidden rounded-2xl p-3" style={CARD_STYLE}>
      <div className="flex w-full items-center gap-3 px-4 py-[17px]">
        {/* Avatar — Figma: 8px spacer above 48px circle, column aligned with name block */}
        <div className="flex shrink-0 flex-row items-center self-stretch">
          <div className="flex h-full min-h-0 flex-col items-start justify-center">
            <div className="h-2 w-[43px] shrink-0" aria-hidden />
            <Avatar firstName={first} lastName={last} size={48} initialsFontSize={18} />
          </div>
        </div>

        {/* Name + role — fixed width 568px (Figma) */}
        <div className="flex w-[568px] shrink-0 flex-col justify-center gap-1 whitespace-nowrap">
          <span className="tp-heading-03 text-text-primary">{name}</span>
          <span className="tp-body-02 text-text-secondary">QA Person - Dentist - Michael QA</span>
        </div>

        {/* License — fills remainder (Figma: flex 1 0 0) */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-row items-center self-stretch">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col items-start justify-center gap-1 whitespace-nowrap">
            <span className="tp-heading-03 text-text-primary">License</span>
            <span className="tp-body-02 text-text-secondary">123456789012345678901234567890123</span>
          </div>
        </div>
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
  const [patientSearchModalOpen, setPatientSearchModalOpen] = useState(false);

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

  const hasPatientFieldData = useMemo(
    () =>
      firstName.trim().length > 0 ||
      lastName.trim().length > 0 ||
      gender !== "" ||
      dobDate !== null ||
      chartNumber.trim().length > 0,
    [firstName, lastName, gender, dobDate, chartNumber],
  );

  function applyPatient(p: Patient) {
    setFirstName(p.firstName);
    setLastName(p.lastName);
    setGender(p.gender as "" | "Male" | "Female");
    setDobDate(parsePatientDob(p.dateOfBirth));
    setChartNumber(p.patientId);
    commitPatient(p.firstName, p.lastName, p.gender as "" | "Male" | "Female", parsePatientDob(p.dateOfBirth), p.patientId);
  }

  function clearPatientFields() {
    setFirstName("");
    setLastName("");
    setGender("");
    setDobDate(null);
    setChartNumber("");
    onPatientChange({
      ...patient,
      patientName: "",
      patientId: "",
      dateOfBirth: "",
      gender: "",
    });
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
      style={{ paddingBottom: 16 }}
    >
      <div className="flex flex-col mx-auto" style={{ padding: "16px 24px", gap: 16, maxWidth: 1400 }}>

        {/* ── 1. Doctor details — Figma 6171:2244 ─────────────────── */}
        <DoctorDetailsSection doctorName={doctorName} />

        {/* ── 2. Patient — Figma 6171:2245 ────────────────────────── */}
        <div className="flex flex-col w-full" style={{ ...CARD_STYLE, padding: "32px 28px 60px 28px", gap: 16 }}>
          {/* Header row: title + search / clear — Figma 6182:32724 */}
          <div className="flex items-center justify-between w-full gap-4" style={{ minHeight: 64 }}>
            <h2 className="tp-heading-04 text-text-primary flex-1 min-w-0" style={{ fontSize: 24, lineHeight: "32px" }}>Patient</h2>
            <div className="flex items-center shrink-0" style={{ gap: 16 }}>
              <button
                type="button"
                onClick={() => setPatientSearchModalOpen(true)}
                className="flex items-center justify-center cursor-pointer bg-transparent rounded-lg border-2 border-solid border-border-subtle transition-ui hover:bg-[var(--color-background-layer-02)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]"
                style={{ width: 60, height: 60, padding: 12 }}
                aria-label="Search patient"
              >
                <SearchIcon size={24} color="var(--color-icon-primary)" />
              </button>
              <button
                type="button"
                onClick={clearPatientFields}
                disabled={!hasPatientFieldData}
                className={`tp-body-02 flex items-center justify-center rounded-lg border-2 border-solid transition-ui focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] ${
                  hasPatientFieldData
                    ? "cursor-pointer border-border-subtle bg-transparent text-text-primary hover:bg-[var(--color-background-layer-02)]"
                    : "cursor-not-allowed border-border-subtle bg-transparent text-[var(--color-text-disabled)]"
                }`}
                style={{ minWidth: 72, height: 60, padding: "12px 16px" }}
              >
                Clear
              </button>
            </div>
          </div>

          {/* Fields: Name row, then DOB+Gender as one group, then Chart */}
          <div className="flex w-full flex-col" style={{ gap: 18 }}>
            <div className="flex w-full" style={{ gap: 23 }}>
              <label className="flex min-w-0 flex-1 flex-col" style={{ gap: 8 }}>
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
              <label className="flex min-w-0 flex-1 flex-col" style={{ gap: 8 }}>
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
            </div>

            <div
              className="flex w-full min-w-0 flex-col"
              style={{ gap: 16 }}
              role="group"
              aria-label="Date of birth and gender at birth"
            >
              <div className="flex w-full items-start" style={{ gap: 23 }}>
                <label className="flex min-w-0 flex-1 flex-col self-stretch" style={{ gap: 8 }}>
                  <span className="tp-body-01 text-text-secondary">
                    Date of Birth <span className="text-[var(--color-text-error,#d43f58)]">*</span>
                  </span>
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
                <div className="flex min-w-0 flex-1 flex-col self-stretch" style={{ gap: 8 }}>
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

            <div className="flex w-full" style={{ gap: 23 }}>
              <label className="flex min-w-0 flex-1 flex-col" style={{ gap: 8 }}>
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
              <div className="min-w-0 flex-1" aria-hidden />
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

      <PatientSearchModal26A
        open={patientSearchModalOpen}
        onClose={() => setPatientSearchModalOpen(false)}
        onSelectPatient={applyPatient}
      />
    </div>
  );
}
