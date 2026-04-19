/**
 * Crown configuration modal — Figma 4513:191332 (Modal window — Crown).
 * Overlay + card: back + title, tooth preview, Specification / Shade / Material / Body,
 * Additional information accordion, Delete.
 */

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import toothSprites from "../../assets/procedures/tooth-sprites.svg";
import { CaretDownIcon, ChevronLeftIcon } from "../Icons";
import {
  BODY_OPTIONS,
  DropdownField,
  MATERIAL_OPTIONS,
  SHADE_OPTIONS,
  SPEC_OPTIONS,
  SPRITE_H,
  SPRITE_W,
  TOOTH_SPRITES,
  type ToothDetail,
} from "./FixedRestorativeForm26A";

function isDropdownPortalTarget(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest("[data-dropdown-portal]") !== null;
}

export interface CrownModal26AProps {
  tooth: number;
  detail: ToothDetail;
  onDetailChange: (field: keyof ToothDetail, value: string) => void;
  onClose: () => void;
  onDelete: () => void;
}

export default function CrownModal26A({ tooth, detail, onDetailChange, onClose, onDelete }: CrownModal26AProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [additionalOpen, setAdditionalOpen] = useState(false);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (isDropdownPortalTarget(e.target)) return;
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  const sprite = TOOTH_SPRITES[tooth]?.Crown;

  return createPortal(
    <div
      className="fixed inset-0 flex flex-col items-center justify-center p-6"
      style={{
        zIndex: 9999,
        backgroundColor: "rgba(0, 0, 0, 0.63)",
      }}
      role="presentation"
    >
      <div
        ref={modalRef}
        className="flex flex-col bg-[var(--color-background-layer-01)] shrink-0 w-full max-w-[1104px] overflow-hidden rounded-2xl"
        style={{
          paddingTop: 8,
          paddingBottom: 24,
          paddingLeft: 24,
          paddingRight: 24,
          gap: 24,
          boxShadow: "var(--shadow-card, 0px 4px 12px rgba(0,0,0,0.08))",
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="crown-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col w-full min-w-0" style={{ gap: 24 }}>
          <div className="flex flex-col w-full">
            <div className="flex items-center w-full min-h-[60px]" style={{ gap: 4 }}>
              <button
                type="button"
                onClick={onClose}
                className="flex items-center justify-center shrink-0 cursor-pointer bg-transparent border-0 appearance-none outline-none transition-ui hover:opacity-70 focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] rounded-lg"
                style={{ width: 32, height: 32 }}
                aria-label="Back"
              >
                <ChevronLeftIcon size={32} color="var(--color-icon-primary)" />
              </button>
              <h2 id="crown-modal-title" className="tp-heading-03 text-text-primary flex-1 min-w-0 truncate">
                Crown
              </h2>
            </div>
          </div>

          <div className="flex flex-col w-full" style={{ gap: 12 }}>
            <div
              className="flex w-full items-center justify-center overflow-hidden rounded border border-solid border-border-subtle bg-[var(--color-background-subtle-02,#f4f4f4)] relative"
              style={{ height: 146, paddingTop: 10, paddingBottom: 9 }}
            >
              {sprite ? (
                <div className="flex flex-col items-center justify-center" style={{ width: 58 }}>
                  <div className="relative shrink-0" style={{ width: 58, height: 102 }}>
                    <svg
                      width={58}
                      height={102}
                      viewBox={`${sprite[0]} ${sprite[1]} ${sprite[2]} ${sprite[3]}`}
                      className="overflow-hidden block"
                      aria-hidden
                    >
                      <image href={toothSprites} width={SPRITE_W} height={SPRITE_H} />
                    </svg>
                  </div>
                  <span className="tp-body-02 text-text-primary" style={{ marginTop: 4 }}>
                    {tooth}
                  </span>
                </div>
              ) : (
                <span className="tp-body-02 text-text-secondary">{tooth}</span>
              )}
            </div>

            <div className="flex w-full" style={{ gap: 24 }}>
              <div className="flex-1 min-w-0">
                <DropdownField
                  id="crown-spec"
                  label="Specification"
                  value={detail.specification}
                  options={SPEC_OPTIONS}
                  onChange={(id) => {
                    onDetailChange("specification", id);
                    setOpenDropdown(null);
                  }}
                  isOpen={openDropdown === "spec"}
                  onToggle={() => setOpenDropdown(openDropdown === "spec" ? null : "spec")}
                  backgroundVariant="layer-02"
                  listZIndex={10001}
                />
              </div>
              <div className="flex-1 min-w-0">
                <DropdownField
                  id="crown-shade"
                  label="Shade system"
                  value={detail.shadeSystem}
                  options={SHADE_OPTIONS}
                  onChange={(id) => {
                    onDetailChange("shadeSystem", id);
                    setOpenDropdown(null);
                  }}
                  isOpen={openDropdown === "shade"}
                  onToggle={() => setOpenDropdown(openDropdown === "shade" ? null : "shade")}
                  backgroundVariant="layer-02"
                  listZIndex={10001}
                />
              </div>
            </div>

            <div className="flex flex-col w-full gap-5">
              <div className="flex w-full items-start justify-end gap-6 rounded-lg overflow-hidden">
                <div className="flex-1 min-w-0">
                  <DropdownField
                    id="crown-material"
                    label="Material"
                    value={detail.material}
                    options={MATERIAL_OPTIONS}
                    onChange={(id) => {
                      onDetailChange("material", id);
                      setOpenDropdown(null);
                    }}
                    isOpen={openDropdown === "material"}
                    onToggle={() => setOpenDropdown(openDropdown === "material" ? null : "material")}
                    backgroundVariant="layer-02"
                    listZIndex={10001}
                  />
                </div>
                <div className="flex-1 min-w-0" style={{ height: 92 }}>
                  <DropdownField
                    id="crown-body"
                    label="Body"
                    value={detail.body}
                    options={BODY_OPTIONS}
                    onChange={(id) => {
                      onDetailChange("body", id);
                      setOpenDropdown(null);
                    }}
                    isOpen={openDropdown === "body"}
                    onToggle={() => setOpenDropdown(openDropdown === "body" ? null : "body")}
                    backgroundVariant="layer-02"
                    listZIndex={10001}
                  />
                </div>
              </div>

              <div className="flex flex-col w-full min-w-0">
                <div
                  className="flex flex-col w-full items-start justify-end rounded-lg border border-solid border-border-subtle bg-[var(--color-page-background)] overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setAdditionalOpen((o) => !o)}
                    className="flex w-full items-center cursor-pointer border-0 appearance-none outline-none transition-ui focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] bg-transparent text-left rounded-t-lg"
                    style={{ gap: 8, padding: 16 }}
                    aria-expanded={additionalOpen}
                  >
                    <span className="tp-headling-02 text-text-primary flex-1 min-w-0">Additional information</span>
                    <span
                      className="shrink-0 flex items-center justify-center"
                      style={{ width: 24, height: 24, transform: additionalOpen ? "rotate(180deg)" : "none" }}
                    >
                      <CaretDownIcon size={24} color="var(--color-icon-primary)" />
                    </span>
                  </button>
                  {additionalOpen && (
                    <div
                      className="w-full border-t border-solid border-border-subtle bg-[var(--color-background-layer-01)] rounded-b-lg"
                      style={{ minHeight: 40 }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-full justify-end" style={{ gap: 8 }}>
          <button
            type="button"
            onClick={onDelete}
            className="tp-body-02 cursor-pointer appearance-none outline-none transition-ui focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] rounded-lg flex items-center justify-center shrink-0 border border-solid border-border-subtle bg-[var(--color-background-layer-01)]"
            style={{
              width: 120,
              minWidth: 72,
              height: 60,
              padding: "12px 16px",
              color: "var(--color-text-error, #d43f58)",
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
