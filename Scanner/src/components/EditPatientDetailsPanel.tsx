/**
 * Edit patient details panel — Figma 4108:127732, 4108:127838 (overlay), 4108:127876 (panel).
 * Full-width top sheet below header: title row, form (First/Last name, Gender at birth, DOB, Chart number), Confirm.
 * Closed via header X button (4108:127873).
 */

import React from "react";
import { createPortal } from "react-dom";

export interface EditPatientDetailsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  patientId: string;
  dateOfBirth: string;
  gender: string;
  treatedBy: string;
  lastScan: string;
  onSave?: (data: {
    patientName: string;
    patientId: string;
    dateOfBirth: string;
    gender: string;
    treatedBy: string;
    lastScan: string;
  }) => void;
}

const GENDER_OPTIONS = [
  { id: "female", label: "Female" },
  { id: "male", label: "Male" },
  { id: "other", label: "Other" },
];

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col flex-1 min-w-0" style={{ gap: 8 }}>
      <label htmlFor={id} className="tp-body-01 text-text-secondary normal-case flex items-center gap-1">
        {label}
        {required && <span className="text-[var(--color-text-error)]">*</span>}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="tp-body-02 text-text-primary w-full rounded-lg border-0 bg-[var(--color-background-layer-02)] transition-ui focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 placeholder:text-text-tertiary"
        style={{ padding: "16px", minHeight: 60 }}
      />
    </div>
  );
}

export default function EditPatientDetailsPanel({
  isOpen,
  onClose,
  patientName,
  patientId,
  dateOfBirth,
  gender,
  treatedBy,
  lastScan,
  onSave,
}: EditPatientDetailsPanelProps) {
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [genderVal, setGenderVal] = React.useState(gender);
  const [dob, setDob] = React.useState(dateOfBirth);
  const [chartNumber, setChartNumber] = React.useState(patientId);
  const [genderOpen, setGenderOpen] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      const parts = patientName.trim().split(/\s+/);
      setFirstName(parts[0] ?? "");
      setLastName(parts.slice(1).join(" ") ?? "");
      setGenderVal(gender);
      setDob(dateOfBirth);
      setChartNumber(patientId);
    }
  }, [isOpen, patientName, patientId, dateOfBirth, gender]);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setGenderOpen(false);
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleConfirm = () => {
    onSave?.({
      patientName: [firstName, lastName].filter(Boolean).join(" ").trim() || patientName,
      patientId: chartNumber,
      dateOfBirth: dob,
      gender: genderVal,
      treatedBy,
      lastScan,
    });
    onClose();
  };

  const handleClear = () => {
    setFirstName("");
    setLastName("");
    setGenderVal("");
    setDob("");
    setChartNumber("");
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      {/* Overlay starts below scan header + patient header (77 + 164 = 241px) */}
      <div
        className="fixed left-0 right-0 bottom-0 animate-modal-backdrop-enter"
        style={{ top: 241, backgroundColor: "var(--color-background-overlay)", zIndex: 9998 }}
        onClick={onClose}
        aria-hidden
      />
      {/* Panel — full width, directly below patient header, content height with max, rounded bottom 8px */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Edit patient details"
        className="fixed left-0 right-0 flex flex-col bg-[var(--color-background-layer-01)] animate-edit-panel-enter overflow-hidden"
        style={{
          top: 241,
          maxHeight: "calc(100vh - 241px)",
          minHeight: 0,
          padding: "20px 24px",
          gap: 16,
          zIndex: 9999,
          borderBottomLeftRadius: 8,
          borderBottomRightRadius: 8,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header row — title + Change patient / Clear */}
        <div className="flex items-center justify-between shrink-0 w-full">
          <h2 className="tp-heading-04 text-text-primary">Edit Patient details</h2>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {}}
              className="tp-body-02 flex items-center justify-center cursor-pointer rounded-lg border-2 border-border-subtle bg-transparent transition-ui focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 text-text-primary hover:bg-[var(--color-background-layer-hovered)]"
              style={{ minHeight: 60, padding: "12px 16px", minWidth: 100 }}
            >
              Change patient
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="tp-body-02 flex items-center justify-center cursor-pointer rounded-lg border-2 border-border-subtle bg-transparent transition-ui focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 text-text-primary hover:bg-[var(--color-background-layer-hovered)]"
              style={{ minHeight: 60, padding: "12px 16px", width: 100 }}
            >
              Clear
            </button>
          </div>
        </div>

        {/* Form — Figma: gap 16 between rows, gap 16 between fields in row */}
        <div className="flex flex-col flex-1 min-h-0 overflow-auto" style={{ gap: 20 }}>
          <div className="flex flex-col shrink-0" style={{ gap: 16 }}>
            <div className="flex gap-4 w-full">
              <Field
                id="edit-patient-firstname"
                label="First name"
                value={firstName}
                onChange={setFirstName}
                placeholder="First name"
              />
              <Field
                id="edit-patient-lastname"
                label="Last name"
                value={lastName}
                onChange={setLastName}
                placeholder="Last name"
              />
            </div>
            <div className="flex gap-4 w-full">
              <div className="flex flex-col flex-1 min-w-0" style={{ gap: 8 }}>
                <label className="tp-body-01 text-text-secondary normal-case flex items-center gap-1">
                  Gender at birth
                  <span className="text-[var(--color-text-error)]">*</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setGenderOpen((o) => !o)}
                    aria-expanded={genderOpen}
                    aria-haspopup="listbox"
                    className="tp-body-02 flex items-center justify-between w-full rounded-lg border-0 bg-[var(--color-background-layer-02)] text-left transition-ui focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2"
                    style={{ padding: "16px", minHeight: 60 }}
                  >
                    <span className={genderVal ? "text-text-primary" : "text-text-tertiary"}>
                      {GENDER_OPTIONS.find((o) => o.label === genderVal)?.label ?? "Select"}
                    </span>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
                      <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {genderOpen && (
                    <ul
                      role="listbox"
                      className="absolute left-0 right-0 top-full z-20 mt-1 flex flex-col overflow-auto rounded-lg border border-border-subtle bg-[var(--color-background-layer-01)] [&>li+li]:border-t [&>li+li]:border-border-subtle"
                      style={{ boxShadow: "var(--shadow-card)" }}
                    >
                      {GENDER_OPTIONS.map((opt) => (
                        <li key={opt.id} role="option">
                          <button
                            type="button"
                            onClick={() => {
                              setGenderVal(opt.label);
                              setGenderOpen(false);
                            }}
                            className="tp-body-02 flex w-full items-center gap-3 text-left px-4 py-3 transition-ui hover:bg-[var(--color-background-layer-hovered)] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-border-focus)]"
                          >
                            {opt.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            <Field
              id="edit-patient-dob"
              label="Date of birth"
              value={dob}
              onChange={setDob}
              placeholder="mm.dd.yyyy"
            />
            </div>
            <div className="flex gap-4 w-full">
              <Field
                id="edit-patient-chart"
                label="Chart number"
                value={chartNumber}
                onChange={setChartNumber}
                placeholder="Placeholder text"
              />
              <div className="flex-1 min-w-0" aria-hidden />
            </div>
          </div>

          <div style={{ height: 1, backgroundColor: "var(--color-border-subtle)" }} />

          <div className="flex justify-end shrink-0">
            <button
              type="button"
              onClick={handleConfirm}
              className="tp-body-02 flex items-center justify-center cursor-pointer rounded-lg border-0 transition-ui focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 text-[var(--color-text-on-color-primary)] hover:opacity-90"
              style={{
                width: 140,
                minHeight: 60,
                backgroundColor: "var(--color-background-brand)",
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
