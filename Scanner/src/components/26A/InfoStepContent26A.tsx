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
 *   Study model (treatment = study-model): Order is two rows (Procedure | Ortho bottom-aligned, Due Date | Send to dropdown); Scan Options (3 toggles: NIRI, Palatal & gingival feedback, Multi-Bite); Attachments + Note only — FixedRestorativeForm26A attachmentsNoteOnly.
 *   Invisalign: Order in two rows (Procedure | Type, then Treatment Stages | Current Aligner with items-center); Type dropdown lists aligner/retainer products; stage options Initial–Final record; Scan Options (NIRI + Palatal & gingival feedback); Attachments + Note only.
 *   Fixed restorative: Order — Procedure + Due Date (picker) | inactive Type (“Select procedure type”) + Send to; Scan Options — one row, NIRI + Pre- treatment Scan only (no New Sleeve / Multi Bite row).
 */

import { useMemo, useRef, useState, type Dispatch, type SetStateAction, type FocusEvent } from "react";
import { SearchIcon } from "../Icons";
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
import PatientSearchModal26A from "./PatientSearchModal26A";
import type { Patient } from "../../data/patients";
import type { ScanFlowPatientSnapshot } from "./ScanFlowPage26A";
import Avatar from "../Avatar";
import invisalignSvg from "../../assets/procedures/invisalign.svg";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

/** Matches DatePickerField + DropdownField (layer-02): subtle stroke, interactive border on focus. */
const textFieldShell =
  "flex w-full min-h-[60px] items-center gap-2 rounded-lg border border-solid border-border-subtle bg-[var(--color-background-layer-02)] px-4 py-4 outline-none transition-ui focus-within:border-[var(--color-border-interactive)] focus-within:ring-2 focus-within:ring-[var(--color-border-focus)] focus-within:ring-offset-0";

const CARD_STYLE: React.CSSProperties = {
  border: "1px solid var(--color-border-subtle)",
  boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
  borderRadius: 16,
  backgroundColor: "var(--color-surface, white)",
};

/** Reserves space when the in-app virtual keyboard is open (matches Orders / Patient list). */
const VIRTUAL_KEYBOARD_HEIGHT = 340;

type ActiveInfoTextField = "firstName" | "lastName" | "chartNumber" | "studyCurrentAligner";

const GENDER_OPTIONS = [
  { id: "", label: "Select an option" },
  { id: "Male", label: "Male" },
  { id: "Female", label: "Female" },
] as const;

/** Invisalign Order — Type (aligner product) dropdown */
const INVISALIGN_TYPE_OPTIONS: { id: string; label: string }[] = [
  { id: "", label: "Select an option" },
  { id: "invisalign-aligners", label: "Invisalign Aligners" },
  { id: "invisalign-first-aligners", label: "Invisalign First Aligners" },
  { id: "invisalign-palatal-expander", label: "Invisalign Palatal Expander" },
  { id: "vivera-retainer", label: "Vivera Retainer" },
  { id: "invisalign-retainer", label: "Invisalign Retainer" },
];

/** Fixed restorative Order — Type row is inactive; trigger shows placeholder copy only. */
const FIXED_TYPE_PLACEHOLDER_OPTIONS: { id: string; label: string }[] = [
  { id: "", label: "Select procedure type" },
];

/** Invisalign Order — treatment stage dropdown */
const INVISALIGN_TREATMENT_STAGE_OPTIONS: { id: string; label: string }[] = [
  { id: "", label: "Select an option" },
  { id: "initial-record", label: "Initial Record" },
  { id: "progress-record", label: "Progress record" },
  { id: "final-record", label: "Final Record" },
];

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
  const [dueDatePickerOpen, setDueDatePickerOpen] = useState(false);
  const dueDatePickerRef = useRef<HTMLDivElement>(null);
  const [chartNumber, setChartNumber] = useState(patient.patientId ?? "");
  /** Which patient/order text field drives the on-screen keyboard (kiosk / touch parity with Orders search). */
  const [activeInfoTextField, setActiveInfoTextField] = useState<ActiveInfoTextField | null>(null);
  const firstNameInputRef = useRef<HTMLInputElement>(null);
  const lastNameInputRef = useRef<HTMLInputElement>(null);
  const chartNumberInputRef = useRef<HTMLInputElement>(null);
  const studyCurrentAlignerInputRef = useRef<HTMLInputElement>(null);

  /* ---- Order dropdowns ---- */
  const [treatmentDropdownOpen, setTreatmentDropdownOpen] = useState(false);
  const [sendToDropdownOpen, setSendToDropdownOpen] = useState(false);
  /** Study model order row (Figma 6172:3813) */
  const [studyAlignerProductId, setStudyAlignerProductId] = useState("invisalign-aligners");
  const [studyTreatmentStageId, setStudyTreatmentStageId] = useState("");
  const [studyCurrentAligner, setStudyCurrentAligner] = useState("");
  const [studyAlignerDropdownOpen, setStudyAlignerDropdownOpen] = useState(false);
  const [studyStageDropdownOpen, setStudyStageDropdownOpen] = useState(false);

  /** Study model + Invisalign: same Order (Figma 6172:3813); Scan Options (3 toggles for study-model, NIRI + Palatal & gingival for Invisalign); attachments-only form. */
  const studyStyleInfoOrderAndScan = treatmentId === "study-model" || treatmentId === "invisalign";
  const attachmentsNoteOnly = studyStyleInfoOrderAndScan;

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

  function handleInfoTextFieldBlur(e: FocusEvent<HTMLInputElement>) {
    const next = e.relatedTarget;
    const kb = document.getElementById("scanner-virtual-keyboard");
    if (next instanceof Node && kb?.contains(next)) {
      return;
    }
    if (next === firstNameInputRef.current) {
      setActiveInfoTextField("firstName");
      return;
    }
    if (next === lastNameInputRef.current) {
      setActiveInfoTextField("lastName");
      return;
    }
    if (next === chartNumberInputRef.current) {
      setActiveInfoTextField("chartNumber");
      return;
    }
    if (next === studyCurrentAlignerInputRef.current) {
      setActiveInfoTextField("studyCurrentAligner");
      return;
    }
    setActiveInfoTextField(null);
  }

  function closeInfoVirtualKeyboard() {
    if (activeInfoTextField === "firstName") firstNameInputRef.current?.blur();
    else if (activeInfoTextField === "lastName") lastNameInputRef.current?.blur();
    else if (activeInfoTextField === "chartNumber") chartNumberInputRef.current?.blur();
    else if (activeInfoTextField === "studyCurrentAligner") studyCurrentAlignerInputRef.current?.blur();
    setActiveInfoTextField(null);
  }

  function applyVirtualKey(key: string) {
    if (activeInfoTextField === "firstName") {
      setFirstName((f) => {
        const n = f + key;
        commitPatient(n, lastName, gender, dobDate, chartNumber);
        return n;
      });
    } else if (activeInfoTextField === "lastName") {
      setLastName((l) => {
        const n = l + key;
        commitPatient(firstName, n, gender, dobDate, chartNumber);
        return n;
      });
    } else if (activeInfoTextField === "chartNumber") {
      setChartNumber((c) => {
        const n = c + key;
        commitPatient(firstName, lastName, gender, dobDate, n);
        return n;
      });
    } else if (activeInfoTextField === "studyCurrentAligner") {
      setStudyCurrentAligner((a) => a + key);
    }
  }

  function applyVirtualBackspace() {
    if (activeInfoTextField === "firstName") {
      setFirstName((f) => {
        const n = f.slice(0, -1);
        commitPatient(n, lastName, gender, dobDate, chartNumber);
        return n;
      });
    } else if (activeInfoTextField === "lastName") {
      setLastName((l) => {
        const n = l.slice(0, -1);
        commitPatient(firstName, n, gender, dobDate, chartNumber);
        return n;
      });
    } else if (activeInfoTextField === "chartNumber") {
      setChartNumber((c) => {
        const n = c.slice(0, -1);
        commitPatient(firstName, lastName, gender, dobDate, n);
        return n;
      });
    } else if (activeInfoTextField === "studyCurrentAligner") {
      setStudyCurrentAligner((a) => a.slice(0, -1));
    }
  }

  return (
    <div
      className="flex-1 min-h-0 min-w-0 scrollbar-overlay-y bg-[var(--color-page-background)]"
      style={{
        paddingBottom: activeInfoTextField ? 16 + VIRTUAL_KEYBOARD_HEIGHT : 16,
        transition: "padding-bottom 360ms var(--motion-ease-out-soft)",
      }}
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
                  ref={firstNameInputRef}
                  type="text"
                  value={firstName}
                  readOnly
                  onChange={(e) => { setFirstName(e.target.value); commitPatient(e.target.value, lastName, gender, dobDate, chartNumber); }}
                  onFocus={() => { setDobPickerOpen(false); setDueDatePickerOpen(false); setGenderDropdownOpen(false); setActiveInfoTextField("firstName"); }}
                  onBlur={handleInfoTextFieldBlur}
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
                  ref={lastNameInputRef}
                  type="text"
                  value={lastName}
                  readOnly
                  onChange={(e) => { setLastName(e.target.value); commitPatient(firstName, e.target.value, gender, dobDate, chartNumber); }}
                  onFocus={() => { setDobPickerOpen(false); setDueDatePickerOpen(false); setGenderDropdownOpen(false); setActiveInfoTextField("lastName"); }}
                  onBlur={handleInfoTextFieldBlur}
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
                  <span className="tp-body-01 text-text-secondary">Date of Birth</span>
                  <DatePickerField
                    label=""
                    value={dobDate}
                    onChange={(d) => { setDobDate(d); commitPatient(firstName, lastName, gender, d, chartNumber); }}
                    isOpen={dobPickerOpen}
                    onToggle={() => { setGenderDropdownOpen(false); setDueDatePickerOpen(false); setDobPickerOpen((o) => !o); }}
                    onClose={() => setDobPickerOpen(false)}
                    containerRef={dobPickerRef}
                    calendarAriaLabel="Choose date of birth"
                  />
                </label>
                <div className="flex min-w-0 flex-1 flex-col self-stretch" style={{ gap: 8 }}>
                  <span className="tp-body-01 text-text-secondary">Gender at birth</span>
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
                    onToggle={() => { setDobPickerOpen(false); setDueDatePickerOpen(false); setGenderDropdownOpen((o) => !o); }}
                    backgroundVariant="layer-02"
                  />
                </div>
              </div>
            </div>

            <div className="flex w-full" style={{ gap: 23 }}>
              <label className="flex min-w-0 flex-1 flex-col" style={{ gap: 8 }}>
                <span className="tp-body-01 text-text-secondary">Chart Number</span>
                <input
                  ref={chartNumberInputRef}
                  type="text"
                  value={chartNumber}
                  readOnly
                  onChange={(e) => { setChartNumber(e.target.value); commitPatient(firstName, lastName, gender, dobDate, e.target.value); }}
                  onFocus={() => { setDobPickerOpen(false); setDueDatePickerOpen(false); setGenderDropdownOpen(false); setActiveInfoTextField("chartNumber"); }}
                  onBlur={handleInfoTextFieldBlur}
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
          {studyStyleInfoOrderAndScan ? (
            treatmentId === "study-model" ? (
              <div className="flex w-full flex-col" style={{ gap: 18 }}>
                <div className="flex w-full min-w-0" style={{ gap: 23 }}>
                  <label className="flex min-w-0 flex-1 flex-col" style={{ gap: 8 }}>
                    <span className="tp-body-01 text-text-secondary">
                      Procedure <span className="text-[var(--color-text-error,#d43f58)]">*</span>
                    </span>
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
                        setDobPickerOpen(false);
                        setDueDatePickerOpen(false);
                        setTreatmentDropdownOpen((o) => !o);
                      }}
                      backgroundVariant="layer-02"
                      triggerLeading={
                        <img src={invisalignSvg} alt="" width={30} height={30} className="shrink-0 object-contain" aria-hidden />
                      }
                    />
                  </label>
                  <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-end">
                    <div className="flex min-w-0 items-center" style={{ gap: 23 }}>
                      <div className="flex min-w-0 flex-col" style={{ maxWidth: 508 }}>
                        <span className="tp-body-02 font-medium text-text-primary">Ortho Model/iCast</span>
                      </div>
                      <ToggleSwitch
                        label=""
                        checked={toggles.orthoModelICast}
                        onChange={(v) => setToggle("orthoModelICast", v)}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex w-full min-w-0 items-center" style={{ gap: 23 }}>
                  <label className="flex min-w-0 flex-1 flex-col" style={{ gap: 8 }}>
                    <span className="tp-body-01 text-text-secondary">
                      Due Date <span className="text-[var(--color-text-error,#d43f58)]">*</span>
                    </span>
                    <DatePickerField
                      label=""
                      value={dueDate}
                      onChange={setDueDate}
                      isOpen={dueDatePickerOpen}
                      onToggle={() => {
                        setTreatmentDropdownOpen(false);
                        setSendToDropdownOpen(false);
                        setStudyAlignerDropdownOpen(false);
                        setStudyStageDropdownOpen(false);
                        setDobPickerOpen(false);
                        setGenderDropdownOpen(false);
                        setDueDatePickerOpen((o) => !o);
                      }}
                      onClose={() => setDueDatePickerOpen(false)}
                      containerRef={dueDatePickerRef}
                      calendarAriaLabel="Choose due date"
                    />
                  </label>
                  <div className="flex flex-col min-w-0 flex-1" style={{ gap: 8 }}>
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
                      onToggle={() => {
                        setTreatmentDropdownOpen(false);
                        setStudyAlignerDropdownOpen(false);
                        setStudyStageDropdownOpen(false);
                        setDueDatePickerOpen(false);
                        setSendToDropdownOpen((o) => !o);
                      }}
                      backgroundVariant="layer-02"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex w-full flex-col" style={{ gap: 18 }}>
                <div className="flex w-full min-w-0 items-center" style={{ gap: 23 }}>
                  <div className="flex min-w-0 flex-1 flex-col" style={{ gap: 8 }}>
                    <span className="tp-body-01 text-text-secondary">
                      Procedure <span className="text-[var(--color-text-error,#d43f58)]">*</span>
                    </span>
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
                        setDueDatePickerOpen(false);
                        setTreatmentDropdownOpen((o) => !o);
                      }}
                      backgroundVariant="layer-02"
                      triggerLeading={
                        <img src={invisalignSvg} alt="" width={30} height={30} className="shrink-0 object-contain" aria-hidden />
                      }
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col" style={{ gap: 8 }}>
                    <span className="tp-body-01 text-text-secondary">
                      Type <span className="text-[var(--color-text-error,#d43f58)]">*</span>
                    </span>
                    <DropdownField
                      id="info-study-aligner-product"
                      ariaLabel="Type"
                      value={studyAlignerProductId}
                      options={INVISALIGN_TYPE_OPTIONS}
                      onChange={(id) => { setStudyAlignerProductId(id); setStudyAlignerDropdownOpen(false); }}
                      isOpen={studyAlignerDropdownOpen}
                      onToggle={() => {
                        setTreatmentDropdownOpen(false);
                        setSendToDropdownOpen(false);
                        setStudyStageDropdownOpen(false);
                        setDueDatePickerOpen(false);
                        setStudyAlignerDropdownOpen((o) => !o);
                      }}
                      backgroundVariant="layer-02"
                    />
                  </div>
                </div>
                <div className="flex w-full min-w-0 items-center" style={{ gap: 23 }}>
                  <div className="flex min-w-0 flex-1 flex-col" style={{ gap: 8 }}>
                    <span className="tp-body-01 text-text-secondary">
                      Treatment Stages <span className="text-[var(--color-text-error,#d43f58)]">*</span>
                    </span>
                    <DropdownField
                      id="info-study-treatment-stage"
                      ariaLabel="Treatment stages"
                      value={studyTreatmentStageId}
                      options={INVISALIGN_TREATMENT_STAGE_OPTIONS}
                      onChange={(id) => { setStudyTreatmentStageId(id); setStudyStageDropdownOpen(false); }}
                      isOpen={studyStageDropdownOpen}
                      onToggle={() => {
                        setTreatmentDropdownOpen(false);
                        setSendToDropdownOpen(false);
                        setStudyAlignerDropdownOpen(false);
                        setDueDatePickerOpen(false);
                        setStudyStageDropdownOpen((o) => !o);
                      }}
                      backgroundVariant="layer-02"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col" style={{ gap: 8 }}>
                    <span className="tp-body-01 text-text-secondary">Current Aligner</span>
                    <input
                      ref={studyCurrentAlignerInputRef}
                      type="text"
                      value={studyCurrentAligner}
                      readOnly
                      onChange={(e) => setStudyCurrentAligner(e.target.value)}
                      onFocus={() => {
                        setTreatmentDropdownOpen(false);
                        setSendToDropdownOpen(false);
                        setStudyAlignerDropdownOpen(false);
                        setStudyStageDropdownOpen(false);
                        setDobPickerOpen(false);
                        setDueDatePickerOpen(false);
                        setGenderDropdownOpen(false);
                        setActiveInfoTextField("studyCurrentAligner");
                      }}
                      onBlur={handleInfoTextFieldBlur}
                      placeholder="Current Aligner #:"
                      className={`${textFieldShell} tp-body-04 text-text-primary placeholder:text-text-tertiary`}
                      autoComplete="off"
                      aria-label="Current aligner number"
                    />
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="flex w-full" style={{ gap: 23 }}>
              <div className="flex flex-col flex-1 min-w-0" style={{ gap: 18 }}>
                <div className="flex flex-col min-w-0" style={{ gap: 8 }}>
                  <span className="tp-body-01 text-text-secondary">
                    Procedure <span className="text-[var(--color-text-error,#d43f58)]">*</span>
                  </span>
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
                      setDueDatePickerOpen(false);
                      setTreatmentDropdownOpen((o) => !o);
                    }}
                    backgroundVariant="layer-02"
                    triggerLeading={
                      treatmentId === "study-model" || treatmentId === "invisalign" ? (
                        <img src={invisalignSvg} alt="" width={30} height={30} className="shrink-0 object-contain" aria-hidden />
                      ) : undefined
                    }
                  />
                </div>
                <label className="flex min-w-0 flex-1 flex-col self-stretch" style={{ gap: 8 }}>
                  <span className="tp-body-01 text-text-secondary">
                    Due Date <span className="text-[var(--color-text-error,#d43f58)]">*</span>
                  </span>
                  <DatePickerField
                    label=""
                    value={dueDate}
                    onChange={setDueDate}
                    isOpen={dueDatePickerOpen}
                    onToggle={() => {
                      setTreatmentDropdownOpen(false);
                      setSendToDropdownOpen(false);
                      setStudyAlignerDropdownOpen(false);
                      setStudyStageDropdownOpen(false);
                      setDobPickerOpen(false);
                      setGenderDropdownOpen(false);
                      setDueDatePickerOpen((o) => !o);
                    }}
                    onClose={() => setDueDatePickerOpen(false)}
                    containerRef={dueDatePickerRef}
                    calendarAriaLabel="Choose due date"
                  />
                </label>
              </div>
              <div className="flex flex-col flex-1 min-w-0" style={{ gap: 18 }}>
                <div className="flex flex-col min-w-0" style={{ gap: 8 }}>
                  <span className="tp-body-01 text-text-secondary">
                    Type <span className="text-[var(--color-text-error,#d43f58)]">*</span>
                  </span>
                  <DropdownField
                    id="info-fixed-type"
                    ariaLabel="Select procedure type"
                    value=""
                    options={FIXED_TYPE_PLACEHOLDER_OPTIONS}
                    onChange={() => {}}
                    isOpen={false}
                    onToggle={() => {}}
                    disabled
                    backgroundVariant="layer-02"
                  />
                </div>
                <div className="flex flex-col min-w-0" style={{ gap: 8 }}>
                  <span className="tp-body-01 text-text-secondary">
                    Send to <span className="text-[var(--color-text-error,#d43f58)]">*</span>
                  </span>
                  <DropdownField
                    id="info-sendto"
                    ariaLabel="Send to"
                    value={sendToId}
                    options={SEND_TO_OPTIONS}
                    onChange={(id) => {
                      setSendToId(id);
                      setSendToDropdownOpen(false);
                    }}
                    isOpen={sendToDropdownOpen}
                    onToggle={() => {
                      setTreatmentDropdownOpen(false);
                      setStudyAlignerDropdownOpen(false);
                      setStudyStageDropdownOpen(false);
                      setDueDatePickerOpen(false);
                      setSendToDropdownOpen((o) => !o);
                    }}
                    backgroundVariant="layer-02"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── 4. Scan Options — Figma 6171:2247; Study model: 3 toggles; Invisalign: NIRI + Palatal & gingival feedback (Figma 6172:3814) ─ */}
        <div className="flex flex-col w-full" style={{ ...CARD_STYLE, padding: "32px 28px", gap: studyStyleInfoOrderAndScan ? 16 : 24 }}>
          <h2 className="tp-heading-04 text-text-primary" style={{ fontSize: 24, lineHeight: "36px" }}>Scan Options</h2>
          {studyStyleInfoOrderAndScan ? (
            treatmentId === "study-model" ? (
              <div
                className="ml-0 flex w-full min-w-0 items-center justify-between gap-16"
                style={{ paddingTop: 10, paddingBottom: 10 }}
              >
                <div className="flex min-w-0 w-full flex-1 flex-col">
                  <div
                    className="flex min-w-0 w-full items-center border-0 border-b border-solid border-b-[#e0e0e0] pb-4"
                    style={{ gap: 24 }}
                  >
                    <div className="flex min-w-0 flex-col" style={{ maxWidth: 508 }}>
                      <span className="tp-body-02 !font-medium text-text-primary">NIRI Capture</span>
                    </div>
                    <ToggleSwitch label="" checked={toggles.niri} onChange={(v) => setToggle("niri", v)} />
                  </div>
                </div>
                <div className="flex min-w-0 w-full flex-1 flex-col">
                  <div
                    className="flex min-w-0 w-full items-center border-0 border-b border-solid border-b-[#e0e0e0] pb-4"
                    style={{ gap: 24 }}
                  >
                    <div className="flex min-w-0 flex-col" style={{ maxWidth: 508 }}>
                      <span className="tp-body-02 !font-medium text-text-primary">Palatal & gingival feedback</span>
                    </div>
                    <ToggleSwitch
                      label=""
                      checked={toggles.palatalGingivalFeedback}
                      onChange={(v) => setToggle("palatalGingivalFeedback", v)}
                    />
                  </div>
                </div>
                <div className="flex min-w-0 w-full flex-1 flex-col">
                  <div
                    className="flex min-w-0 w-full items-center border-0 border-b border-solid border-b-[#e0e0e0] pb-4"
                    style={{ gap: 24 }}
                  >
                    <div className="flex min-w-0 flex-col" style={{ maxWidth: 508 }}>
                      <span className="tp-body-02 !font-medium text-text-primary">Multi-Bite</span>
                    </div>
                    <ToggleSwitch label="" checked={toggles.multiBite} onChange={(v) => setToggle("multiBite", v)} />
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="ml-0 flex w-full min-w-0 items-center justify-between gap-16"
                style={{ paddingTop: 10, paddingBottom: 10 }}
              >
                <div className="flex min-w-0 w-full flex-1 flex-col">
                  <div
                    className="flex min-w-0 w-full items-center border-0 border-b border-solid border-b-[#e0e0e0] pb-4"
                    style={{ gap: 24 }}
                  >
                    <div className="flex min-w-0 flex-col" style={{ maxWidth: 508 }}>
                      <span className="tp-body-02 !font-medium text-text-primary">NIRI Capture</span>
                    </div>
                    <ToggleSwitch label="" checked={toggles.niri} onChange={(v) => setToggle("niri", v)} />
                  </div>
                </div>
                <div className="flex min-w-0 w-full flex-1 flex-col">
                  <div
                    className="flex min-w-0 w-full items-center border-0 border-b border-solid border-b-[#e0e0e0] pb-4"
                    style={{ gap: 24 }}
                  >
                    <div className="flex min-w-0 flex-col" style={{ maxWidth: 508 }}>
                      <span className="tp-body-02 !font-medium text-text-primary">Palatal & gingival feedback</span>
                    </div>
                    <ToggleSwitch
                      label=""
                      checked={toggles.palatalGingivalFeedback}
                      onChange={(v) => setToggle("palatalGingivalFeedback", v)}
                    />
                  </div>
                </div>
              </div>
            )
          ) : treatmentId === "fixed-restorative" ? (
            <div
              className="ml-0 flex w-full min-w-0 items-center justify-between gap-16"
              style={{ paddingTop: 10, paddingBottom: 10 }}
            >
              <div className="flex min-w-0 w-full flex-1 flex-col">
                <div
                  className="flex min-w-0 w-full items-center border-0 border-b border-solid border-b-[#e0e0e0] pb-4"
                  style={{ gap: 24 }}
                >
                  <div className="flex min-w-0 flex-col" style={{ maxWidth: 508 }}>
                    <span className="tp-body-02 !font-medium text-text-primary">NIRI Capture</span>
                  </div>
                  <ToggleSwitch label="" checked={toggles.niri} onChange={(v) => setToggle("niri", v)} />
                </div>
              </div>
              <div className="flex min-w-0 w-full flex-1 flex-col">
                <div
                  className="flex min-w-0 w-full items-center border-0 border-b border-solid border-b-[#e0e0e0] pb-4"
                  style={{ gap: 24 }}
                >
                  <div className="flex min-w-0 flex-col" style={{ maxWidth: 508 }}>
                    <span className="tp-body-02 !font-medium text-text-primary">Pre- treatment Scan</span>
                  </div>
                  <ToggleSwitch label="" checked={toggles.preTreatment} onChange={(v) => setToggle("preTreatment", v)} />
                </div>
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
                    <span className="tp-body-02 font-medium text-text-primary">Pre- treatment Scan</span>
                    <span className="tp-body-02 text-text-secondary">Receive emails about your upcoming appointments</span>
                  </div>
                  <ToggleSwitch label="" checked={toggles.preTreatment} onChange={(v) => setToggle("preTreatment", v)} />
                </div>
                <div className="flex min-w-0 items-center" style={{ gap: 23 }}>
                  <div className="flex min-w-0 flex-col" style={{ gap: 11, maxWidth: 508 }}>
                    <span className="tp-body-02 font-medium text-text-primary">Multi-Bite</span>
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
          attachmentsNoteOnly={attachmentsNoteOnly}
        />
      </div>

      {activeInfoTextField && (
        <VirtualKeyboard
          position="fixed"
          onKeyPress={applyVirtualKey}
          onBackspace={applyVirtualBackspace}
          onClose={closeInfoVirtualKeyboard}
        />
      )}

      <PatientSearchModal26A
        open={patientSearchModalOpen}
        onClose={() => setPatientSearchModalOpen(false)}
        onSelectPatient={applyPatient}
      />
    </div>
  );
}
