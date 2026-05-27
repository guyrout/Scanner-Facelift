/**
 * Search Patient modal — Figma XlaEc3ruziBu21Sqs4lJkI / node 4110:161234 (Modal window).
 */

import { useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import { CheckIcon, CloseIcon, SearchIcon } from "../Icons";
import Avatar from "../Avatar";
import VirtualKeyboard from "../VirtualKeyboard";
import type { Patient } from "../../data/patients";
import { useRuntimePatients } from "../../data/runtimeStore";

const KEYBOARD_HEIGHT = 340;

/**
 * Figma 06.-Scanner-core — Component01 / Checkbox indicator (node 1223:1396):
 * 24×24, 4px radius, dark stroke + white fill when off; brand fill + white check when on;
 * light focus halo on row keyboard focus (`group-focus-visible`).
 */
function ScannerCoreCheckboxIndicator({ checked }: { checked: boolean }) {
  return (
    <span
      className="pointer-events-none flex size-6 shrink-0 items-center justify-center rounded-[4px] shadow-none transition-shadow duration-200 ease-out group-focus-visible:shadow-[0_0_0_2px_var(--color-border-focus)]"
      aria-hidden
    >
      <span
        className="flex size-6 items-center justify-center rounded-[4px] border border-solid transition-[background-color,border-color] duration-200 ease-in-out"
        style={{
          borderColor: checked ? "var(--color-background-brand, #009ace)" : "var(--color-border-strong, #121212)",
          backgroundColor: checked
            ? "var(--color-background-brand, #009ace)"
            : "var(--color-surface, #ffffff)",
        }}
      >
        {checked ? <CheckIcon size={16} color="#fff" /> : null}
      </span>
    </span>
  );
}

export interface PatientSearchModal26AProps {
  open: boolean;
  onClose: () => void;
  onSelectPatient: (patient: Patient) => void;
}

export default function PatientSearchModal26A({ open, onClose, onSelectPatient }: PatientSearchModal26AProps) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  /** Avoid closing on the same pointer gesture that opened the modal (mouseup lands on the new backdrop). */
  const backdropCloseReadyRef = useRef(false);

  const searchActive = searchFocused || query.length > 0;

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedId(null);
      setSearchFocused(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      backdropCloseReadyRef.current = false;
      return;
    }
    backdropCloseReadyRef.current = false;
    const id = window.setTimeout(() => {
      backdropCloseReadyRef.current = true;
    }, 200);
    return () => window.clearTimeout(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (searchFocused) {
        e.preventDefault();
        searchInputRef.current?.blur();
        setSearchFocused(false);
        return;
      }
      onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, searchFocused]);

  const patients = useRuntimePatients();
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter(
      (p) =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
        p.patientId.toLowerCase().includes(q) ||
        p.gender.toLowerCase().includes(q),
    );
  }, [patients, query]);

  const selectedPatient = selectedId ? patients.find((p) => p.id === selectedId) : undefined;
  const canConfirm = Boolean(selectedPatient);

  if (!open || typeof document === "undefined") return null;

  function handleBackdropPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget) return;
    if (!backdropCloseReadyRef.current) e.preventDefault();
  }

  function handleBackdropClick(e: ReactMouseEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget) return;
    if (!backdropCloseReadyRef.current) return;
    onClose();
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[20050] flex flex-col items-center justify-start overscroll-contain scrollbar-overlay-y px-6 pt-6 sm:justify-center sm:py-6"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.63)",
        paddingBottom: searchFocused ? 24 + KEYBOARD_HEIGHT : 24,
        transition: "padding-bottom 0.2s ease",
      }}
      role="presentation"
      onPointerDown={handleBackdropPointerDown}
      onClick={handleBackdropClick}
    >
      <div
        className="mx-auto my-auto flex h-[758px] max-h-[calc(100vh-48px)] w-full max-w-[880px] shrink-0 flex-col overflow-hidden rounded-2xl bg-[var(--color-background-layer-01)]"
        style={{
          paddingTop: 8,
          paddingBottom: 24,
          paddingLeft: 24,
          paddingRight: 24,
          gap: 16,
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="patient-search-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 flex-col gap-4">
          <div className="flex h-[60px] w-full shrink-0 items-center gap-4">
            <h2 id="patient-search-modal-title" className="tp-heading-03 min-w-0 flex-1 truncate text-text-primary" style={{ fontSize: 20, lineHeight: "28px" }}>
              Search Patient
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="flex shrink-0 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent outline-none transition-ui appearance-none hover:opacity-70 focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]"
              style={{ width: 60, height: 60 }}
              aria-label="Close"
            >
              <CloseIcon size={32} color="var(--color-icon-primary)" />
            </button>
          </div>

          <div className="flex w-full shrink-0 items-start justify-between gap-2">
            <div
              role="search"
              className={`
                  flex h-[var(--height-row)] min-h-[60px] w-full min-w-0 cursor-text items-center gap-2 overflow-hidden rounded-lg border border-solid bg-surface-alt transition-ui
                  ${searchActive ? "border-border-interactive" : "border-border-subtle"}
                  focus-within:border-focus-border
                `}
              style={{ paddingLeft: 16, paddingRight: 16 }}
              onMouseDown={(e) => {
                if (e.target === searchInputRef.current) return;
                e.preventDefault();
                searchInputRef.current?.focus();
              }}
            >
              <SearchIcon
                size={24}
                color={searchActive ? "var(--color-icon-secondary)" : "var(--color-icon-tertiary)"}
                className="shrink-0"
                aria-hidden
              />
              <input
                ref={searchInputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search"
                className="tp-body-02 min-w-0 flex-1 cursor-text border-0 bg-transparent text-left text-text-primary outline-none placeholder:text-text-tertiary"
                autoComplete="off"
                aria-label="Filter patients"
              />
            </div>
          </div>
        </div>

        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-solid border-[var(--color-border-subtle)]">
          <div className="scrollbar-table min-h-0 flex-1 overflow-x-auto overflow-y-auto">
            <div
              className="grid items-center border-b-2 border-solid border-[var(--color-border-subtle)] bg-[var(--color-background-layer-01)] sticky top-0 z-[1] tp-body-02 font-medium text-text-secondary"
              style={{
                minHeight: 52,
                paddingLeft: 16,
                paddingRight: 16,
                gridTemplateColumns: "24px minmax(0,2fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)",
                gap: 16,
              }}
            >
              <span aria-hidden className="block" />
              <span>Name</span>
              <span>Gender</span>
              <span>Date of birth</span>
              <span>Chart</span>
            </div>
            {filtered.map((p) => {
              const isSel = selectedId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedId(p.id)}
                  className={`group grid w-full cursor-pointer items-center border-0 border-b border-solid border-[var(--color-border-subtle)] text-left transition-ui last:border-b-0 outline-none focus-visible:outline-none ${
                    isSel ? "bg-[var(--color-background-layer-02)]" : "bg-[var(--color-background-layer-01)] hover:bg-[var(--color-background-layer-hovered)]"
                  }`}
                  style={{
                    minHeight: 92,
                    paddingLeft: 16,
                    paddingRight: 16,
                    paddingTop: 12,
                    paddingBottom: 12,
                    gridTemplateColumns: "24px minmax(0,2fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)",
                    gap: 16,
                  }}
                >
                  <ScannerCoreCheckboxIndicator checked={isSel} />
                  <div className="flex min-w-0 gap-3 items-center">
                    <Avatar firstName={p.firstName} lastName={p.lastName} size={36} initialsFontSize={14} imageUrl={p.avatarUrl} />
                    <div className="flex min-w-0 flex-col gap-1">
                      <span className="tp-body-02 text-text-primary break-words">
                        {p.firstName} {p.lastName}
                      </span>
                      <span className="tp-body-02 text-text-secondary break-words">{p.doctor}</span>
                    </div>
                  </div>
                  <span className="tp-body-02 text-text-primary min-w-0 break-words">{p.gender}</span>
                  <span className="tp-body-02 text-text-primary min-w-0 break-words">{p.dateOfBirth}</span>
                  <span className="tp-body-02 text-text-primary min-w-0 break-words">{p.patientId}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-2 pt-0">
          <button
            type="button"
            onClick={onClose}
            className="tp-body-02 cursor-pointer appearance-none outline-none transition-ui focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] rounded-lg flex items-center justify-center shrink-0 border-2 border-solid border-[var(--color-border-subtle)] bg-[var(--color-background-layer-01)] text-text-primary"
            style={{ width: 120, minWidth: 100, height: 60, padding: "12px 16px" }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canConfirm}
            onClick={() => {
              if (selectedPatient) {
                onSelectPatient(selectedPatient);
                onClose();
              }
            }}
            className={`tp-body-02 cursor-pointer appearance-none outline-none transition-ui focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] rounded-lg flex items-center justify-center shrink-0 border-0 min-w-[72px] ${
              canConfirm
                ? "bg-[var(--color-background-brand)] text-[var(--color-text-inverse-primary)]"
                : "bg-[var(--color-background-brand-disabled)] text-[var(--color-text-disabled)] cursor-not-allowed"
            }`}
            style={{ height: 60, padding: "12px 16px" }}
          >
            Select Patient
          </button>
        </div>
      </div>

      {searchFocused && (
        <div
          className="pointer-events-auto absolute bottom-0 left-0 right-0 z-[10001]"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          role="presentation"
        >
          <VirtualKeyboard
            onKeyPress={(key) => setQuery((prev) => prev + key)}
            onBackspace={() => setQuery((prev) => prev.slice(0, -1))}
            onClose={() => {
              searchInputRef.current?.blur();
              setSearchFocused(false);
            }}
          />
        </div>
      )}
    </div>,
    document.body,
  );
}
