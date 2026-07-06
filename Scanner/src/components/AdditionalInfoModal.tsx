/**
 * Additional information modal — Figma 235:21138.
 * Opened from the tooth edit panel "+ Additional info" link in FixedRestorativeForm.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CloseIcon } from "./Icons";
import {
  DropdownField,
  isDropdownPortalTarget,
  MARGIN_DESIGN_OPTIONS,
  PREP_DESIGN_OPTIONS,
  SHADE_VALUE_OPTIONS,
  type ToothDetail,
} from "./FixedRestorativeForm";

const MODAL_Z_INDEX = 10000;
const DROPDOWN_LIST_Z_INDEX = MODAL_Z_INDEX + 1;

type AdditionalInfoField =
  | "prepDesignBuccal"
  | "prepDesignLingual"
  | "marginDesignBuccal"
  | "marginDesignLingual"
  | "incisal"
  | "gingival"
  | "stumpShade";

const ADDITIONAL_INFO_FIELDS: AdditionalInfoField[] = [
  "prepDesignBuccal",
  "prepDesignLingual",
  "marginDesignBuccal",
  "marginDesignLingual",
  "incisal",
  "gingival",
  "stumpShade",
];

/** Figma Label/$tp-label-01 — 16px regular sentence case (use tp-label-02, not tp-label-01 which is uppercase). */
const DROPDOWN_LABEL_CLASS = "tp-label-02 text-text-secondary";

function pickAdditionalInfo(detail: ToothDetail): Pick<ToothDetail, AdditionalInfoField> {
  return {
    prepDesignBuccal: detail.prepDesignBuccal,
    prepDesignLingual: detail.prepDesignLingual,
    marginDesignBuccal: detail.marginDesignBuccal,
    marginDesignLingual: detail.marginDesignLingual,
    incisal: detail.incisal,
    gingival: detail.gingival,
    stumpShade: detail.stumpShade,
  };
}

export interface AdditionalInfoModalProps {
  detail: ToothDetail;
  onSave: (fields: Pick<ToothDetail, AdditionalInfoField>) => void;
  onClose: () => void;
}

export default function AdditionalInfoModal({ detail, onSave, onClose }: AdditionalInfoModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const initial = useMemo(() => pickAdditionalInfo(detail), [detail]);
  const [draft, setDraft] = useState(initial);

  useEffect(() => {
    setDraft(pickAdditionalInfo(detail));
  }, [detail]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (isDropdownPortalTarget(e.target)) return;
      const target = e.target as Node;
      if (modalRef.current?.contains(target)) return;
      onClose();
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  useEffect(() => {
    if (!openDropdown) return;
    const handleClick = (e: MouseEvent) => {
      if (isDropdownPortalTarget(e.target)) return;
      const target = e.target as Node;
      if (target instanceof Element && target.closest(`#dropdown-${openDropdown}`)) return;
      setOpenDropdown(null);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openDropdown]);

  const hasChanges = ADDITIONAL_INFO_FIELDS.some((field) => draft[field] !== initial[field]);
  const hasSelection = ADDITIONAL_INFO_FIELDS.some((field) => draft[field] !== "");
  const canSave = hasChanges && hasSelection;

  function updateDraft(field: AdditionalInfoField, value: string) {
    setDraft((prev) => ({ ...prev, [field]: value }));
    setOpenDropdown(null);
  }

  function toggleDropdown(id: string) {
    setOpenDropdown((current) => (current === id ? null : id));
  }

  const dropdownProps = {
    backgroundVariant: "layer-02" as const,
    listZIndex: DROPDOWN_LIST_Z_INDEX,
    labelClassName: DROPDOWN_LABEL_CLASS,
    menuScopeClassName: "scan-flow",
  };

  return createPortal(
    <div
      className="scan-flow fixed inset-0 flex flex-col items-center justify-center"
      data-additional-info-modal=""
      style={{
        zIndex: MODAL_Z_INDEX,
        backgroundColor: "var(--color-background-overlay, rgba(0, 0, 0, 0.63))",
        padding: "var(--spacing-06, 24px)",
      }}
      role="presentation"
    >
      <div
        ref={modalRef}
        className="flex flex-col bg-[var(--color-background-layer-01)] shrink-0 w-full max-w-[1104px] rounded-2xl"
        style={{
          boxShadow: "var(--shadow-card, 0px 4px 12px rgba(0,0,0,0.08))",
          maxHeight: "calc(100vh - 48px)",
          paddingTop: "var(--spacing-02, 8px)",
          paddingBottom: "var(--spacing-06, 24px)",
          paddingLeft: "var(--spacing-06, 24px)",
          paddingRight: "var(--spacing-06, 24px)",
          gap: "var(--spacing-06, 24px)",
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="additional-info-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col w-full min-w-0" style={{ gap: "var(--spacing-06, 24px)" }}>
          <div className="flex items-center w-full min-h-[60px]" style={{ gap: "var(--spacing-04, 16px)" }}>
            <h2 id="additional-info-modal-title" className="tp-heading-03 text-text-primary flex-1 min-w-0 truncate">
              Additional information
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center shrink-0 cursor-pointer bg-transparent border-0 appearance-none outline-none transition-ui hover:bg-[var(--color-background-layer-hovered)] focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] rounded-lg"
              style={{ width: 60, height: 60 }}
              aria-label="Close"
            >
              <CloseIcon size={32} color="var(--color-icon-primary)" />
            </button>
          </div>

          <div
            className="grid w-full items-start"
            style={{
              gridTemplateColumns: "1fr 1fr 1fr",
              columnGap: "var(--spacing-06, 24px)",
              rowGap: 10,
            }}
          >
            <DropdownField
              id="additional-prep-buccal"
              label="Preparation Design- Buccal"
              value={draft.prepDesignBuccal}
              options={PREP_DESIGN_OPTIONS}
              onChange={(id) => updateDraft("prepDesignBuccal", id)}
              isOpen={openDropdown === "additional-prep-buccal"}
              onToggle={() => toggleDropdown("additional-prep-buccal")}
              {...dropdownProps}
            />
            <DropdownField
              id="additional-prep-lingual"
              label="Preparation Design- Lingual"
              value={draft.prepDesignLingual}
              options={PREP_DESIGN_OPTIONS}
              onChange={(id) => updateDraft("prepDesignLingual", id)}
              isOpen={openDropdown === "additional-prep-lingual"}
              onToggle={() => toggleDropdown("additional-prep-lingual")}
              {...dropdownProps}
            />
            <DropdownField
              id="additional-incisal"
              label="Incisal"
              value={draft.incisal}
              options={SHADE_VALUE_OPTIONS}
              onChange={(id) => updateDraft("incisal", id)}
              isOpen={openDropdown === "additional-incisal"}
              onToggle={() => toggleDropdown("additional-incisal")}
              {...dropdownProps}
            />
            <DropdownField
              id="additional-margin-buccal"
              label="Margin Design- Buccal"
              value={draft.marginDesignBuccal}
              options={MARGIN_DESIGN_OPTIONS}
              onChange={(id) => updateDraft("marginDesignBuccal", id)}
              isOpen={openDropdown === "additional-margin-buccal"}
              onToggle={() => toggleDropdown("additional-margin-buccal")}
              {...dropdownProps}
            />
            <DropdownField
              id="additional-margin-lingual"
              label="Margin Design- Lingual"
              value={draft.marginDesignLingual}
              options={MARGIN_DESIGN_OPTIONS}
              onChange={(id) => updateDraft("marginDesignLingual", id)}
              isOpen={openDropdown === "additional-margin-lingual"}
              onToggle={() => toggleDropdown("additional-margin-lingual")}
              {...dropdownProps}
            />
            <DropdownField
              id="additional-gingival"
              label="Gingival"
              value={draft.gingival}
              options={SHADE_VALUE_OPTIONS}
              onChange={(id) => updateDraft("gingival", id)}
              isOpen={openDropdown === "additional-gingival"}
              onToggle={() => toggleDropdown("additional-gingival")}
              {...dropdownProps}
            />
            <div aria-hidden className="min-w-0" />
            <div aria-hidden className="min-w-0" />
            <DropdownField
              id="additional-stump-shade"
              label="Stump Shade"
              value={draft.stumpShade}
              options={SHADE_VALUE_OPTIONS}
              onChange={(id) => updateDraft("stumpShade", id)}
              isOpen={openDropdown === "additional-stump-shade"}
              onToggle={() => toggleDropdown("additional-stump-shade")}
              {...dropdownProps}
            />
          </div>
        </div>

        <div className="flex items-center justify-end shrink-0" style={{ gap: "var(--spacing-02, 8px)" }}>
          <button
            type="button"
            onClick={onClose}
            className="tp-body-02 text-text-primary cursor-pointer appearance-none outline-none transition-ui focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] rounded-lg flex items-center justify-center shrink-0 border-2 border-solid border-border-subtle bg-[var(--color-background-layer-01)]"
            style={{ width: 120, height: 60, padding: "12px 16px" }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSave}
            onClick={() => {
              onSave(draft);
              onClose();
            }}
            className="tp-body-02 cursor-pointer appearance-none outline-none transition-ui focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] rounded-lg flex items-center justify-center shrink-0 border-0 disabled:cursor-not-allowed"
            style={{
              width: 120,
              height: 60,
              padding: "12px 16px",
              backgroundColor: canSave
                ? "var(--color-border-interactive, #009ace)"
                : "var(--color-background-brand-disabled, rgba(0, 0, 0, 0.04))",
              color: canSave
                ? "var(--color-text-on-color-primary, #fff)"
                : "var(--color-text-disabled, rgba(0, 0, 0, 0.23))",
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
