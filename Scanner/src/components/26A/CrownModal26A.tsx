/**
 * Crown configuration modal — Figma 4513:191332 (Modal window — Crown).
 * Overlay + card: back + title, tooth preview, Specification / Shade / Material / Body,
 * Additional information accordion, Delete.
 */

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import toothSprites from "../../assets/procedures/tooth-sprites.svg";
import { CaretDownIcon } from "../Icons";
import {
  BODY_OPTIONS,
  DropdownField,
  MARGIN_DESIGN_OPTIONS,
  MATERIAL_OPTIONS,
  PREP_DESIGN_OPTIONS,
  SHADE_OPTIONS,
  SHADE_VALUE_OPTIONS,
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
        className="flex flex-col bg-[var(--color-background-layer-01)] shrink-0 w-full max-w-[1104px] rounded-2xl overflow-hidden"
        style={{
          boxShadow: "var(--shadow-card, 0px 4px 12px rgba(0,0,0,0.08))",
          maxHeight: "calc(100vh - 48px)",
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="crown-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
      <div
        className="flex flex-col w-full min-w-0"
        style={{
          paddingTop: 8,
          paddingBottom: 24,
          paddingLeft: 24,
          paddingRight: 24,
          gap: 24,
          overflowY: "auto",
        }}
      >
        <div className="flex flex-col w-full min-w-0" style={{ gap: 24 }}>
          <div className="flex flex-col w-full">
            <div className="flex items-center w-full min-h-[60px]">
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

            {/* Two columns matching the additional-info grid below: col-span-2 [Specification, Material] / col-span-1 [Shade system, Body] */}
            <div
              className="grid w-full"
              style={{ gridTemplateColumns: "1fr 1fr 1fr", columnGap: 24 }}
            >
              <div className="col-span-2 flex flex-col min-w-0" style={{ gap: 12 }}>
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
                  required
                />
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
                  required
                />
              </div>
              <div className="flex flex-col min-w-0" style={{ gap: 12 }}>
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
                  required
                />
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
                  required
                />
              </div>
            </div>

            <div className="flex flex-col w-full">
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
                      style={{
                        width: 24,
                        height: 24,
                        transform: additionalOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 280ms cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    >
                      <CaretDownIcon size={24} color="var(--color-icon-primary)" />
                    </span>
                  </button>
                  <div
                    className="grid w-full"
                    style={{
                      gridTemplateRows: additionalOpen ? "1fr" : "0fr",
                      transition: "grid-template-rows 280ms cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                    aria-hidden={!additionalOpen}
                  >
                    <div
                      className="flex flex-col w-full"
                      style={{
                        minHeight: 0,
                        overflow: "hidden",
                        padding: additionalOpen ? "0 16px 16px 16px" : "0 16px 0 16px",
                        opacity: additionalOpen ? 1 : 0,
                        transform: additionalOpen ? "translateY(0)" : "translateY(-4px)",
                        transition:
                          "opacity 220ms cubic-bezier(0.4, 0, 0.2, 1), transform 280ms cubic-bezier(0.4, 0, 0.2, 1), padding 280ms cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    >
                      {/* 3-column grid: cols 1–2 = Prep + Margin (2×2 sub-grid), col 3 = Incisal / Gingival / Stump Shade */}
                      <div
                        className="grid w-full items-start"
                        style={{ gridTemplateColumns: "1fr 1fr 1fr", columnGap: 24 }}
                      >
                        {/* Group 3: Prep Design + Margin Design (Buccal / Lingual) — 2×2 sub-grid */}
                        <div
                          className="grid col-span-2 min-w-0"
                          style={{
                            gridTemplateColumns: "repeat(2, 1fr)",
                            columnGap: 24,
                            rowGap: 24,
                          }}
                        >
                          <DropdownField
                            id="crown-prep-buccal"
                            label="Preparation Design- Buccal"
                            value={detail.prepDesignBuccal}
                            options={PREP_DESIGN_OPTIONS}
                            onChange={(id) => {
                              onDetailChange("prepDesignBuccal", id);
                              setOpenDropdown(null);
                            }}
                            isOpen={openDropdown === "prep-buccal"}
                            onToggle={() =>
                              setOpenDropdown(openDropdown === "prep-buccal" ? null : "prep-buccal")
                            }
                            listZIndex={10001}
                            placeholderTone="primary"
                            hideBorder
                          />
                          <DropdownField
                            id="crown-prep-lingual"
                            label="Preparation Design- Lingual"
                            value={detail.prepDesignLingual}
                            options={PREP_DESIGN_OPTIONS}
                            onChange={(id) => {
                              onDetailChange("prepDesignLingual", id);
                              setOpenDropdown(null);
                            }}
                            isOpen={openDropdown === "prep-lingual"}
                            onToggle={() =>
                              setOpenDropdown(openDropdown === "prep-lingual" ? null : "prep-lingual")
                            }
                            listZIndex={10001}
                            placeholderTone="primary"
                            hideBorder
                          />
                          <DropdownField
                            id="crown-margin-buccal"
                            label="Margin Design- Buccal"
                            value={detail.marginDesignBuccal}
                            options={MARGIN_DESIGN_OPTIONS}
                            onChange={(id) => {
                              onDetailChange("marginDesignBuccal", id);
                              setOpenDropdown(null);
                            }}
                            isOpen={openDropdown === "margin-buccal"}
                            onToggle={() =>
                              setOpenDropdown(openDropdown === "margin-buccal" ? null : "margin-buccal")
                            }
                            listZIndex={10001}
                            placeholderTone="primary"
                            hideBorder
                          />
                          <DropdownField
                            id="crown-margin-lingual"
                            label="Margin Design- Lingual"
                            value={detail.marginDesignLingual}
                            options={MARGIN_DESIGN_OPTIONS}
                            onChange={(id) => {
                              onDetailChange("marginDesignLingual", id);
                              setOpenDropdown(null);
                            }}
                            isOpen={openDropdown === "margin-lingual"}
                            onToggle={() =>
                              setOpenDropdown(openDropdown === "margin-lingual" ? null : "margin-lingual")
                            }
                            listZIndex={10001}
                            placeholderTone="primary"
                            hideBorder
                          />
                        </div>

                        {/* Group 4: Incisal / Gingival / Stump Shade — vertical stack in col 3 */}
                        <div className="flex flex-col min-w-0" style={{ gap: 24 }}>
                          <DropdownField
                            id="crown-incisal"
                            label="Incisal"
                            value={detail.incisal}
                            options={SHADE_VALUE_OPTIONS}
                            onChange={(id) => {
                              onDetailChange("incisal", id);
                              setOpenDropdown(null);
                            }}
                            isOpen={openDropdown === "incisal"}
                            onToggle={() =>
                              setOpenDropdown(openDropdown === "incisal" ? null : "incisal")
                            }
                            listZIndex={10001}
                            placeholderTone="primary"
                            hideBorder
                          />
                          <DropdownField
                            id="crown-gingival"
                            label="Gingival"
                            value={detail.gingival}
                            options={SHADE_VALUE_OPTIONS}
                            onChange={(id) => {
                              onDetailChange("gingival", id);
                              setOpenDropdown(null);
                            }}
                            isOpen={openDropdown === "gingival"}
                            onToggle={() =>
                              setOpenDropdown(openDropdown === "gingival" ? null : "gingival")
                            }
                            listZIndex={10001}
                            placeholderTone="primary"
                            hideBorder
                          />
                          <DropdownField
                            id="crown-stump-shade"
                            label="Stump Shade"
                            value={detail.stumpShade}
                            options={SHADE_VALUE_OPTIONS}
                            onChange={(id) => {
                              onDetailChange("stumpShade", id);
                              setOpenDropdown(null);
                            }}
                            isOpen={openDropdown === "stump-shade"}
                            onToggle={() =>
                              setOpenDropdown(openDropdown === "stump-shade" ? null : "stump-shade")
                            }
                            listZIndex={10001}
                            placeholderTone="primary"
                            hideBorder
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-full items-center justify-between">
          <button
            type="button"
            onClick={onDelete}
            className="tp-body-02 cursor-pointer appearance-none outline-none transition-ui focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] rounded-lg flex items-center justify-center shrink-0 border border-solid border-border-subtle bg-[var(--color-background-layer-01)]"
            style={{
              minWidth: 72,
              height: 60,
              padding: "12px 16px",
              color: "var(--color-text-error, #d43f58)",
            }}
          >
            Delete
          </button>

          <div className="flex items-center" style={{ gap: 16 }}>
            <button
              type="button"
              onClick={onClose}
              className="tp-body-02 text-text-primary cursor-pointer appearance-none outline-none transition-ui focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] rounded-lg flex items-center justify-center shrink-0 border border-solid border-border-subtle bg-[var(--color-background-layer-01)]"
              style={{
                minWidth: 72,
                height: 60,
                padding: "12px 16px",
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onClose}
              className="tp-body-02 cursor-pointer appearance-none outline-none transition-ui focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] rounded-lg flex items-center justify-center shrink-0 border-0 bg-[var(--color-border-interactive,#009ace)]"
              style={{
                minWidth: 72,
                height: 60,
                padding: "12px 16px",
                color: "var(--color-text-on-color-primary)",
              }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>,
    document.body,
  );
}
