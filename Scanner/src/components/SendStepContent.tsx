/**
 * Send step summary — Figma 4174:217663.
 * Review / confirm page shown when wizard step === "send".
 *
 * Layout (top → bottom):
 * 1. Dropdowns card   — Treatment / Send-to* / Due-date
 * 2. Tooth chart card  — Tooth Chart | Table View tabs, jaw diagram + TP cards
 * 3. Badge summary row — toggle states as compact pills
 * 4. Attachments + Note cards (side-by-side)
 * 5. Sticky bottom bar — "Confirm" button
 */

import { useState, useRef, useCallback, useEffect, type Dispatch, type SetStateAction } from "react";
import { createPortal } from "react-dom";
import {
  type ToothDetail,
  type ToggleState,
  RESTORATION_TYPES,
  TREATMENT_OPTIONS,
  SEND_TO_OPTIONS,
  SPEC_OPTIONS,
  MATERIAL_OPTIONS,
  SHADE_OPTIONS,
  BODY_OPTIONS,
  UPPER_TEETH,
  LOWER_TEETH,
  TOOTH_X,
  TOOTH_SPRITES,
  SPRITE_W,
  SPRITE_H,
  DropdownField,
  DatePickerField,
} from "./FixedRestorativeForm";
import jawChartSvg from "../assets/procedures/jaw-tooth-chart.svg";
import toothSprites from "../assets/procedures/tooth-sprites.svg";

function NoImageIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M21 1.06057L19.9394 0L0 19.9394L1.06057 21L2.56058 19.5H18C18.3977 19.4995 18.7789 19.3413 19.0601 19.0601C19.3413 18.7789 19.4995 18.3977 19.5 18V2.56058L21 1.06057ZM18 18H4.06058L9.90525 12.1553L11.6894 13.9393C11.9707 14.2206 12.3522 14.3786 12.75 14.3786C13.1478 14.3786 13.5293 14.2206 13.8106 13.9393L15 12.75L18 15.748V18ZM18 13.6261L16.0606 11.6867C15.7793 11.4054 15.3978 11.2474 15 11.2474C14.6022 11.2474 14.2207 11.4054 13.9394 11.6867L12.75 12.8761L10.9672 11.0933L18 4.06058V13.6261Z" fill="var(--color-icon-primary)" />
      <path d="M3 15V12.75L6.75 9.00255L7.77997 10.0325L8.8419 8.97053L7.81065 7.93928C7.52935 7.65798 7.14782 7.49995 6.75 7.49995C6.35218 7.49995 5.97065 7.65798 5.68935 7.93928L3 10.6287V3H15V1.5H3C2.6023 1.5004 2.221 1.65856 1.93978 1.93978C1.65856 2.221 1.5004 2.6023 1.5 3V15H3Z" fill="var(--color-icon-primary)" />
    </svg>
  );
}

function NoteIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M18 16.5V21H3V3H12V1.5H3C2.60218 1.5 2.22064 1.65804 1.93934 1.93934C1.65804 2.22064 1.5 2.60218 1.5 3V21C1.5 21.3978 1.65804 21.7794 1.93934 22.0607C2.22064 22.342 2.60218 22.5 3 22.5H18C18.3978 22.5 18.7794 22.342 19.0607 22.0607C19.342 21.7794 19.5 21.3978 19.5 21V16.5H18Z" fill="black" fillOpacity={0.93} />
      <path d="M22.1643 4.32L19.6877 1.845C19.4632 1.62513 19.1615 1.50197 18.8472 1.50197C18.5329 1.50197 18.2311 1.62513 18.0066 1.845L7.5 12.345V16.5H11.6501L22.1568 6C22.3768 5.77569 22.5 5.4741 22.5 5.16C22.5 4.8459 22.3768 4.54431 22.1568 4.32H22.1643ZM11.0272 15H9.00095V12.975L16.0854 5.8875L18.1192 7.92L11.0272 15ZM19.1774 6.8625L17.1436 4.83L18.8472 3.1275L20.8809 5.16L19.1774 6.8625Z" fill="black" fillOpacity={0.93} />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M20.5875 11.3321L4.08754 3.08214C3.95821 3.01746 3.81295 2.99155 3.66924 3.00752C3.52554 3.02348 3.38951 3.08065 3.27754 3.17214C3.1706 3.26176 3.09079 3.37943 3.04707 3.51192C3.00334 3.64441 2.99745 3.78648 3.03004 3.92214L5.25004 11.9996L3.00004 20.0546C2.96946 20.1679 2.96589 20.2868 2.98961 20.4017C3.01334 20.5167 3.06371 20.6244 3.13665 20.7163C3.2096 20.8082 3.3031 20.8818 3.40964 20.931C3.51617 20.9802 3.63276 21.0037 3.75004 20.9996C3.86744 20.9989 3.98304 20.9707 4.08754 20.9171L20.5875 12.6671C20.7104 12.6042 20.8135 12.5086 20.8855 12.3908C20.9575 12.273 20.9956 12.1377 20.9956 11.9996C20.9956 11.8616 20.9575 11.7262 20.8855 11.6085C20.8135 11.4907 20.7104 11.3951 20.5875 11.3321ZM4.91254 18.8321L6.57004 12.7496H13.5V11.2496H6.57004L4.91254 5.16714L18.57 11.9996L4.91254 18.8321Z" fill="#121212" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M8.75 7.5H7.5V15H8.75V7.5Z" fill="currentColor" />
      <path d="M12.5 7.5H11.25V15H12.5V7.5Z" fill="currentColor" />
      <path d="M2.5 3.75V5H3.75V17.5C3.75 17.8315 3.8817 18.1495 4.11612 18.3839C4.35054 18.6183 4.66848 18.75 5 18.75H15C15.3315 18.75 15.6495 18.6183 15.8839 18.3839C16.1183 18.1495 16.25 17.8315 16.25 17.5V5H17.5V3.75H2.5ZM5 17.5V5H15V17.5H5Z" fill="currentColor" />
      <path d="M12.5 1.25H7.5V2.5H12.5V1.25Z" fill="currentColor" />
    </svg>
  );
}

function optionLabel(options: { id: string; label: string }[], id: string): string {
  return options.find((o) => o.id === id)?.label ?? id;
}

function formatToothDetail(detail: ToothDetail): string {
  const parts: string[] = [];
  if (detail.specification) parts.push(optionLabel(SPEC_OPTIONS, detail.specification));
  if (detail.material) parts.push(optionLabel(MATERIAL_OPTIONS, detail.material));
  if (detail.shadeSystem) parts.push(optionLabel(SHADE_OPTIONS, detail.shadeSystem));
  if (detail.body) parts.push(optionLabel(BODY_OPTIONS, detail.body));
  return parts.length > 0 ? parts.join(" · ") : "No details specified";
}

export interface SendStepContentProps {
  treatmentId: string;
  setTreatmentId: Dispatch<SetStateAction<string>>;
  sendToId: string;
  setSendToId: Dispatch<SetStateAction<string>>;
  dueDate: Date | null;
  setDueDate: Dispatch<SetStateAction<Date | null>>;
  toothSelections: Record<number, string>;
  setToothSelections: Dispatch<SetStateAction<Record<number, string>>>;
  toothDetails: Record<number, ToothDetail>;
  toggles: ToggleState;
  noteText: string;
  setNoteText: Dispatch<SetStateAction<string>>;
}

const ASSIGNED_DOCTOR_OPTIONS = [
  { id: "", label: "Select an option" },
  { id: "dr-smith", label: "Dr. Smith" },
  { id: "dr-jones", label: "Dr. Jones" },
  { id: "dr-williams", label: "Dr. Williams" },
];


function CheckboxIcon({ checked }: { checked: boolean }) {
  if (!checked) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <rect x="3" y="3" width="18" height="18" rx="3" stroke="var(--color-border-subtle, rgba(0,0,0,0.09))" strokeWidth="2" fill="none" />
      </svg>
    );
  }
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="3" fill="var(--color-border-interactive, #009ace)" />
      <path d="M9.5 16.17L5.33 12L4 13.33L9.5 18.83L20.5 7.83L19.17 6.5L9.5 16.17Z" fill="white" />
    </svg>
  );
}

function EraseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M22.5001 20.2494H5.25008V21.7494H22.5001V20.2494Z" fill="currentColor" fillOpacity={0.2275} />
      <path d="M20.5351 7.88188L14.5876 1.94188C14.4483 1.80242 14.2828 1.69178 14.1007 1.61629C13.9186 1.54081 13.7235 1.50195 13.5263 1.50195C13.3292 1.50195 13.134 1.54081 12.9519 1.61629C12.7698 1.69178 12.6044 1.80242 12.4651 1.94188L1.96508 12.4419C1.82561 12.5812 1.71497 12.7466 1.63949 12.9287C1.564 13.1108 1.52515 13.306 1.52515 13.5031C1.52515 13.7003 1.564 13.8954 1.63949 14.0775C1.71497 14.2596 1.82561 14.4251 1.96508 14.5644L5.34758 17.9994H12.5401L20.5351 10.0044C20.6745 9.86507 20.7852 9.69964 20.8607 9.51754C20.9362 9.33545 20.975 9.14026 20.975 8.94313C20.975 8.74601 20.9362 8.55082 20.8607 8.36872C20.7852 8.18663 20.6745 8.02119 20.5351 7.88188ZM11.9176 16.4994H6.00008L3.00008 13.4994L7.73258 8.76688L13.6801 14.7069L11.9176 16.4994ZM14.7376 13.6794L8.79758 7.73188L13.5001 2.99938L19.5001 8.94688L14.7376 13.6794Z" fill="currentColor" fillOpacity={0.2275} />
    </svg>
  );
}

export default function SendStepContent({
  treatmentId, setTreatmentId,
  sendToId, setSendToId,
  dueDate, setDueDate,
  toothSelections, setToothSelections,
  toothDetails,
  toggles,
  noteText, setNoteText,
}: SendStepContentProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [chartTab, setChartTab] = useState<"tooth" | "table">("tooth");
  const datePickerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [sendToError, setSendToError] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [modalDoctorId, setModalDoctorId] = useState("");
  const [modalDoctorOpen, setModalDoctorOpen] = useState(false);
  const [saveSignature, setSaveSignature] = useState(true);
  const [consentChecked, setConsentChecked] = useState(true);
  const [initiateSimulation, setInitiateSimulation] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);

  const getCanvasPoint = useCallback((e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      const touch = e.touches[0];
      return { x: (touch.clientX - rect.left) * scaleX, y: (touch.clientY - rect.top) * scaleY };
    }
    const mouse = e as React.MouseEvent;
    return { x: (mouse.clientX - rect.left) * scaleX, y: (mouse.clientY - rect.top) * scaleY };
  }, []);

  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    isDrawingRef.current = true;
    const pt = getCanvasPoint(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pt.x, pt.y);
  }, [getCanvasPoint]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawingRef.current) return;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pt = getCanvasPoint(e, canvas);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#121212";
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();
    setHasSignature(true);
  }, [getCanvasPoint]);

  const stopDrawing = useCallback(() => {
    isDrawingRef.current = false;
  }, []);

  const clearSignature = useCallback(() => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  }, []);

  useEffect(() => {
    if (!showConfirmModal) return;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const container = canvas.parentElement;
    if (!container) return;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
  }, [showConfirmModal]);

  const handleConfirm = useCallback(() => {
    if (!sendToId) {
      setSendToError(true);
      return;
    }
    setSendToError(false);
    setShowConfirmModal(true);
  }, [sendToId]);

  const selectedTeeth = Object.entries(toothSelections).sort(
    ([a], [b]) => Number(a) - Number(b),
  );

  const usedCategories = [...new Set(Object.values(toothSelections))];

  const activeToggles: string[] = [];
  if (toggles.niri) activeToggles.push("NIRI");
  if (toggles.sleeve) activeToggles.push("Sleeve");
  if (toggles.multiBite) activeToggles.push("Multi bite");
  if (toggles.preTreatment) activeToggles.push("Pre-treat");

  function handleRemoveTooth(toothNum: number) {
    setToothSelections((prev) => {
      const next = { ...prev };
      delete next[toothNum];
      return next;
    });
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 min-w-0">
      {/* Scrollable content */}
      <div className="flex-1 min-h-0 min-w-0 overflow-auto scrollbar-hidden bg-[var(--color-page-background)]" style={{ paddingBottom: 92 }}>
        <div className="flex flex-col w-full" style={{ padding: 16, gap: 16 }}>

          {/* Section 1: Dropdowns row — match FixedRestorativeForm: 16px 24px padding, layer-02 dropdowns */}
          <div
            ref={dropdownRef}
            className="bg-[var(--color-background-layer-01)]"
            style={{ borderRadius: 8, padding: "16px 24px" }}
          >
            <div className="flex w-full" style={{ gap: 16 }}>
              <DropdownField
                id="send-treatment"
                label="Treatment"
                value={treatmentId}
                options={TREATMENT_OPTIONS}
                onChange={(id) => { setTreatmentId(id); setOpenDropdown(null); }}
                isOpen={openDropdown === "treatment"}
                onToggle={() => setOpenDropdown(openDropdown === "treatment" ? null : "treatment")}
                backgroundVariant="layer-02"
              />
              <div className="relative flex flex-col flex-1 min-w-0">
                <div style={{ paddingBottom: 8 }}>
                  <span className="tp-body-01 text-text-secondary">
                    Send to{" "}
                    <span className="text-[var(--color-text-error,#d43f58)]">*</span>
                  </span>
                </div>
                <DropdownField
                  id="send-sendto"
                  value={sendToId}
                  options={SEND_TO_OPTIONS}
                  onChange={(id) => { setSendToId(id); setSendToError(false); setOpenDropdown(null); }}
                  isOpen={openDropdown === "sendto"}
                  onToggle={() => setOpenDropdown(openDropdown === "sendto" ? null : "sendto")}
                  error={sendToError}
                  backgroundVariant="layer-02"
                />
              </div>
              <DatePickerField
                label="Due date"
                value={dueDate}
                onChange={setDueDate}
                isOpen={datePickerOpen}
                onToggle={() => setDatePickerOpen((o) => !o)}
                onClose={() => setDatePickerOpen(false)}
                containerRef={datePickerRef}
              />
            </div>
          </div>

          {/* Section 2: Tooth chart — Figma 4174:217736 */}
          <div
            className="bg-[var(--color-background-layer-01)]"
            style={{ borderRadius: 8, padding: "24px", height: 500 }}
          >
            <div className="flex flex-col xl:flex-row w-full h-full items-stretch" style={{ gap: 0 }}>
              {/* Left: Jaw diagram + tab bar + legend — Figma 4174:217737: tabs at top in both Tooth Chart and Table View */}
              <div className="flex flex-col items-center justify-start flex-1 min-w-0" style={{ gap: 32, paddingTop: 0, paddingBottom: 20 }}>
                {/* Tab bar — at top of section per Figma */}
                <div className="flex items-center self-start shrink-0" style={{ borderBottom: "1px solid var(--color-border-subtle)", width: "fit-content", height: 60 }}>
                  {(["tooth", "table"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setChartTab(tab)}
                      className="cursor-pointer bg-transparent border-0 appearance-none outline-none transition-ui focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]"
                      style={{
                        padding: "16px 24px",
                        borderBottom: chartTab === tab
                          ? "2px solid var(--color-border-interactive)"
                          : "2px solid transparent",
                        marginBottom: -1,
                      }}
                    >
                      <span className={`tp-headling-02 ${chartTab === tab ? "text-text-primary" : "text-text-secondary"}`}>
                        {tab === "tooth" ? "Tooth Chart" : "Table View"}
                      </span>
                    </button>
                  ))}
                </div>

                {chartTab === "tooth" ? (
                  <>
                    <div className="relative w-full" style={{ maxWidth: 1171 }}>
                      <img src={jawChartSvg} alt="Tooth chart" style={{ width: "100%", height: "auto", display: "block" }} />
                      <svg viewBox="0 0 1171 277" className="absolute inset-0 w-full h-full" aria-hidden>
                        {UPPER_TEETH.map((tooth, i) => {
                          const x = TOOTH_X[i];
                          const sel = toothSelections[tooth];
                          const sprite = sel ? TOOTH_SPRITES[tooth]?.[sel] : undefined;
                          const color = sel ? RESTORATION_TYPES.find((r) => r.label === sel)?.color : undefined;
                          return (
                            <g key={tooth}>
                              <rect x={x - 29} y={5} width={58} height={105} fill="transparent" />
                              {sel && sprite && (
                                <>
                                  <rect x={x - 29} y={5} width={58} height={105} fill="var(--color-background-layer-01)" style={{ pointerEvents: "none" }} />
                                  <svg x={x - 29} y={5} width={58} height={105} viewBox={`${sprite[0]} ${sprite[1]} ${sprite[2]} ${sprite[3]}`} style={{ pointerEvents: "none", overflow: "hidden" }}>
                                    <image href={toothSprites} width={SPRITE_W} height={SPRITE_H} />
                                  </svg>
                                </>
                              )}
                              {sel && !sprite && color && (
                                <rect x={x - 28} y={6} width={56} height={103} fill="none" stroke={color} strokeWidth={2.5} rx={6} style={{ pointerEvents: "none" }} />
                              )}
                            </g>
                          );
                        })}
                        {LOWER_TEETH.map((tooth, i) => {
                          const x = TOOTH_X[i];
                          const sel = toothSelections[tooth];
                          const sprite = sel ? TOOTH_SPRITES[tooth]?.[sel] : undefined;
                          const color = sel ? RESTORATION_TYPES.find((r) => r.label === sel)?.color : undefined;
                          return (
                            <g key={tooth}>
                              <rect x={x - 29} y={167} width={58} height={105} fill="transparent" />
                              {sel && sprite && (
                                <>
                                  <rect x={x - 29} y={167} width={58} height={105} fill="var(--color-background-layer-01)" style={{ pointerEvents: "none" }} />
                                  <svg x={x - 29} y={167} width={58} height={105} viewBox={`${sprite[0]} ${sprite[1]} ${sprite[2]} ${sprite[3]}`} style={{ pointerEvents: "none", overflow: "hidden" }}>
                                    <image href={toothSprites} width={SPRITE_W} height={SPRITE_H} />
                                  </svg>
                                </>
                              )}
                              {sel && !sprite && color && (
                                <rect x={x - 28} y={168} width={56} height={103} fill="none" stroke={color} strokeWidth={2.5} rx={6} style={{ pointerEvents: "none" }} />
                              )}
                            </g>
                          );
                        })}
                      </svg>
                    </div>

                    {/* Legend: only used categories */}
                    {usedCategories.length > 0 && (
                      <div
                        className="flex items-center flex-nowrap w-full"
                        style={{ gap: "clamp(4px, 0.8vw, 16px)", padding: "8px 0" }}
                      >
                        {usedCategories.map((cat) => {
                          const rt = RESTORATION_TYPES.find((r) => r.label === cat);
                          return (
                            <div
                              key={cat}
                              className="flex items-center justify-center"
                              style={{
                                height: 52,
                                padding: "clamp(8px, 0.6vw, 12px) clamp(8px, 0.8vw, 16px)",
                                gap: 8,
                                border: "2px solid var(--color-border-subtle)",
                                borderRadius: 8,
                              }}
                            >
                              <div className="shrink-0" style={{ width: 20, height: 20, borderRadius: "50%", backgroundColor: rt?.color }} />
                              <span className="tp-body-02 text-text-primary whitespace-nowrap">{cat}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-1 items-center justify-center">
                    <span className="tp-body-02 text-text-tertiary">Table view coming soon</span>
                  </div>
                )}
              </div>

              {/* Vertical separator */}
              <div
                className="hidden xl:block shrink-0"
                style={{ width: 1, marginLeft: 24, marginRight: 24, backgroundColor: "var(--color-border-subtle)", alignSelf: "stretch" }}
              />

              {/* Right: TP cards — same structure as FixedRestorativeForm right panel */}
              <div className="flex flex-col w-full max-w-[774px] xl:pt-0 xl:w-[480px] xl:max-w-none xl:shrink-0 min-w-0">
                {selectedTeeth.length > 0 ? (
                  <div className="flex flex-col overflow-auto scrollbar-table" style={{ gap: 8, maxHeight: 450 }}>
                    {selectedTeeth.map(([num, category]) => {
                      const rt = RESTORATION_TYPES.find((r) => r.label === category);
                      const detail = toothDetails[Number(num)];
                      return (
                        <div
                          key={num}
                          className="flex flex-col shrink-0"
                          style={{
                            background: "#f4f4f4",
                            border: "1px solid rgba(0,0,0,0.09)",
                            borderRadius: 8,
                            padding: 16,
                            gap: 16,
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className="tp-body-02"
                              style={{
                                backgroundColor: rt?.color,
                                color: "#fff",
                                borderRadius: 4,
                                padding: "4px 8px",
                                minWidth: 24,
                                textAlign: "center",
                              }}
                            >
                              {category}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTooth(Number(num))}
                              className="flex items-center justify-center cursor-pointer bg-transparent border-0 appearance-none outline-none text-[var(--color-icon-secondary)] hover:text-[var(--color-icon-primary)] transition-ui shrink-0"
                              style={{ width: 20, height: 20 }}
                              aria-label={`Remove tooth ${num}`}
                            >
                              <DeleteIcon />
                            </button>
                          </div>
                          <div className="flex flex-col" style={{ gap: 8 }}>
                            <span className="tp-headling-02 text-text-primary">#{num}</span>
                            <span className="tp-body-02 text-text-secondary" style={{ wordBreak: "break-word" }}>
                              {detail ? formatToothDetail(detail) : "No details specified"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center" style={{ gap: 7, maxWidth: 315, margin: "0 auto" }}>
                    <span className="tp-heading-03 text-text-secondary">No teeth selected</span>
                    <span className="tp-body-02 text-text-secondary">
                      Go back to the Info step to select teeth and restoration types.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Badge summary row — Figma 4174:219079 */}
          <div
            className="bg-[var(--color-background-layer-01)]"
            style={{ borderRadius: 8, padding: "32px 28px" }}
          >
            <div className="flex items-center justify-between">
              <span className="tp-heading-04 text-text-primary">
                {noteText || "Scanned:"}
              </span>
              <div className="flex items-center" style={{ gap: 16 }}>
                {activeToggles.map((label) => (
                  <span
                    key={label}
                    className="tp-body-02 text-center"
                    style={{
                      backgroundColor: "var(--color-background-highlight-blue, #e6f7ff)",
                      border: "1px solid var(--color-border-highlight-blue, #d1f1ff)",
                      borderRadius: 4,
                      padding: "4px 8px",
                      color: "var(--color-text-on-highlight-blue, #005780)",
                    }}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Attachments + Note — same layout as FixedRestorativeForm */}
          <div className="flex" style={{ gap: 16, height: 460 }}>
            {/* Attachments card */}
            <div
              className="flex flex-col flex-1 min-w-0 bg-[var(--color-background-layer-01)] overflow-clip"
              style={{
                borderRadius: 16,
                boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
                padding: 12,
              }}
            >
              <div className="flex flex-col flex-1" style={{ padding: 16 }}>
                <div className="flex flex-col flex-1" style={{ gap: 12 }}>
                  <span className="tp-heading-04 text-text-primary">Attachments</span>
                  <div className="flex flex-col flex-1 items-center justify-center" style={{ gap: 31 }}>
                    <div className="flex flex-col items-center" style={{ gap: 16 }}>
                      <NoImageIcon />
                      <div className="flex flex-col items-center text-center" style={{ gap: 4 }}>
                        <span className="tp-body-02 text-text-secondary">No Attachments</span>
                        <span className="tp-body-01 text-text-tertiary">
                          You can share external-related files, including images, videos and X-rays, with your lab.
                          <br />
                          To upload files use MyiTero.com
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Note card */}
            <div
              className="flex flex-col flex-1 min-w-0 bg-[var(--color-background-layer-01)] overflow-clip"
              style={{
                borderRadius: 16,
                boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
                padding: 12,
              }}
            >
              <div className="flex flex-col flex-1" style={{ padding: 16, gap: 39 }}>
                <div className="flex flex-col flex-1" style={{ gap: 12 }}>
                  <span className="tp-heading-04 text-text-primary">Note</span>

                  {!noteText && (
                    <div className="flex flex-col flex-1 items-center justify-center" style={{ gap: 31 }}>
                      <div className="flex flex-col items-center" style={{ gap: 16 }}>
                        <NoteIcon />
                        <div className="flex flex-col items-center" style={{ gap: 4 }}>
                          <span className="tp-body-02 text-text-secondary">No notes yet</span>
                          <span className="tp-body-01 text-text-tertiary">
                            Type below to add your first note
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-start shrink-0" style={{ gap: 10 }}>
                  <textarea
                    className="flex-1 resize-none"
                    placeholder="Progress notes here"
                    maxLength={100}
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    rows={1}
                    style={{
                      backgroundColor: "var(--color-background-layer-01)",
                      border: "1px solid #e0e0e0",
                      borderRadius: 8,
                      padding: "12px 16px",
                      outline: "none",
                      fontFamily: "var(--font-roboto)",
                      fontSize: 18,
                      fontWeight: 400,
                      lineHeight: "28px",
                      color: "rgba(0,0,0,0.93)",
                      height: 60,
                    }}
                  />
                  <button
                    type="button"
                    className="flex items-center justify-center shrink-0 cursor-pointer bg-transparent appearance-none outline-none transition-ui hover:bg-surface-alt focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]"
                    style={{
                      border: "2px solid var(--color-border-subtle)",
                      borderRadius: 8,
                      width: 60,
                      height: 60,
                    }}
                    aria-label="Send note"
                  >
                    <SendIcon />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky bottom bar — Figma 4174:219111 */}
      <div
        className="shrink-0 flex items-center justify-end w-full bg-[var(--color-background-layer-01)] border-t border-border-subtle"
        style={{ padding: "16px 24px", height: 92 }}
      >
        <button
          type="button"
          onClick={handleConfirm}
          className="flex items-center justify-center cursor-pointer appearance-none outline-none transition-ui focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2"
          style={{
            backgroundColor: "var(--color-border-interactive, #009ace)",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            height: 60,
            minWidth: 120,
            padding: "12px 32px",
            gap: 8,
          }}
        >
          <span className="tp-body-02" style={{ color: "#fff" }}>Confirm</span>
        </button>
      </div>

      {/* Confirm modal — Figma 4174:220664 — rendered via portal to sit above wizard */}
      {showConfirmModal && createPortal(
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.4)", zIndex: 9998 }}
            onClick={() => setShowConfirmModal(false)}
          />

          {/* Side panel — Figma: 656px, right-aligned, full height */}
          <div
            className="fixed top-0 right-0 flex flex-col bg-[var(--color-background-layer-01,#fff)]"
            style={{ width: 656, height: "100%", padding: 24, gap: 32, zIndex: 9999 }}
          >
            {/* Section 1: Content — close + dropdown + textarea (shrink-0) */}
            <div className="flex flex-col shrink-0" style={{ gap: 32 }}>
              {/* Close button row */}
              <div className="flex items-center justify-end" style={{ height: 60 }}>
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="flex items-center justify-center cursor-pointer bg-transparent border-0 appearance-none outline-none transition-ui hover:opacity-70"
                  style={{ width: 60, height: 60 }}
                  aria-label="Close"
                >
                  <svg width="32" height="32" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M12.5 4.5L11.5 3.5L8 7L4.5 3.5L3.5 4.5L7 8L3.5 11.5L4.5 12.5L8 9L11.5 12.5L12.5 11.5L9 8L12.5 4.5Z" fill="currentColor" />
                  </svg>
                </button>
              </div>

              {/* Assigned doctor dropdown */}
              <DropdownField
                id="modal-assigned-doctor"
                label="Assigned doctor"
                value={modalDoctorId}
                options={ASSIGNED_DOCTOR_OPTIONS}
                onChange={(id) => { setModalDoctorId(id); setModalDoctorOpen(false); }}
                isOpen={modalDoctorOpen}
                onToggle={() => setModalDoctorOpen((o) => !o)}
                backgroundVariant="layer-02"
                hideBorder
              />

              {/* Signature canvas + Clear bar */}
              <div className="flex flex-col">
                <div
                  style={{
                    width: "100%",
                    height: 200,
                    backgroundColor: "var(--color-background-layer-02, #f4f4f4)",
                    border: "1px solid var(--color-border-subtle, rgba(0,0,0,0.09))",
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                    borderBottom: "none",
                    position: "relative",
                    touchAction: "none",
                  }}
                >
                  <canvas
                    ref={signatureCanvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "block",
                      cursor: "crosshair",
                      borderTopLeftRadius: 8,
                      borderTopRightRadius: 8,
                    }}
                  />
                </div>
                <div
                  className="flex items-center justify-end"
                  style={{
                    backgroundColor: "var(--color-background-subtle-02, #f4f4f4)",
                    border: "1px solid var(--color-border-subtle, rgba(0,0,0,0.09))",
                    borderTop: "none",
                    borderBottomLeftRadius: 8,
                    borderBottomRightRadius: 8,
                    padding: "8px 16px",
                    gap: 8,
                  }}
                >
                  <button
                    type="button"
                    onClick={clearSignature}
                    className={`flex items-center cursor-pointer bg-transparent border-0 appearance-none outline-none transition-ui ${hasSignature ? "opacity-100" : "opacity-40"}`}
                    style={{ gap: 8, padding: "12px 16px", borderRadius: 8, minWidth: 72, height: 64 }}
                  >
                    <span className={hasSignature ? "text-text-secondary" : "text-[var(--color-text-disabled,rgba(0,0,0,0.23))]"}><EraseIcon /></span>
                    <span className={`tp-body-04 ${hasSignature ? "text-text-secondary" : "text-[var(--color-text-disabled,rgba(0,0,0,0.23))]"}`}>Clear</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Section 2: Checkboxes + Toggle — flex-1 to fill remaining space */}
            <div className="flex flex-col flex-1 min-h-0" style={{ gap: 32 }}>
              {/* Save signature */}
              <button
                type="button"
                onClick={() => setSaveSignature((v) => !v)}
                className="flex items-center cursor-pointer bg-transparent border-0 appearance-none outline-none shrink-0"
                style={{ gap: 8, height: 44 }}
              >
                <CheckboxIcon checked={saveSignature} />
                <span className="tp-body-02 text-text-primary">Save signature</span>
              </button>

              {/* Consent checkbox */}
              <button
                type="button"
                onClick={() => setConsentChecked((v) => !v)}
                className="flex items-start cursor-pointer bg-transparent border-0 appearance-none outline-none text-left shrink-0"
                style={{ gap: 8 }}
              >
                <span className="shrink-0 mt-0.5"><CheckboxIcon checked={consentChecked} /></span>
                <span className="tp-body-02 text-text-primary">
                  By checking this box, I represent that my patient has consented to the collection and processing of their personal health data and the processing of that data by Align Technology for the purposes of providing customized dental care.
                  <br />
                  <span className="text-text-secondary">View more</span>
                </span>
              </button>

              {/* Initiate simulation — same checkbox style as Save signature / Consent */}
              <button
                type="button"
                onClick={() => setInitiateSimulation((v) => !v)}
                className="flex items-center cursor-pointer bg-transparent border-0 appearance-none outline-none shrink-0"
                style={{ gap: 8, height: 44 }}
              >
                <CheckboxIcon checked={initiateSimulation} />
                <span className="tp-body-02 text-text-primary">Initiate Invisalign Outcome Simulation Pro</span>
              </button>
            </div>

            {/* Section 3: Bottom buttons — Send + Send and view */}
            <div className="flex items-center justify-end shrink-0" style={{ gap: 16 }}>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex items-center justify-center cursor-pointer appearance-none outline-none transition-ui focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]"
                style={{
                  border: "2px solid var(--color-border-subtle, rgba(0,0,0,0.09))",
                  borderRadius: 8,
                  height: 60,
                  width: 148,
                  padding: "12px 16px",
                  backgroundColor: "transparent",
                  gap: 8,
                }}
              >
                <span className="tp-body-02 text-text-primary">Send</span>
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex items-center justify-center cursor-pointer appearance-none outline-none transition-ui focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]"
                style={{
                  backgroundColor: "var(--color-border-interactive, #009ace)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  height: 60,
                  minWidth: 72,
                  padding: "16px 16px",
                  gap: 8,
                }}
              >
                <span className="tp-body-02" style={{ color: "#fff" }}>Send and view</span>
              </button>
            </div>
          </div>
        </>,
        document.body,
      )}
    </div>
  );
}
