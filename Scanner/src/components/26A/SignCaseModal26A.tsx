/**
 * Sign case modal — Figma 6172:8673 (Modal window — Sign case).
 * Centered dialog on rgba(0,0,0,0.63) overlay: signature, checkboxes, Confirm & Send.
 */

import { useState, useRef, useCallback, useEffect } from "react";

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

export interface SignCaseModal26AProps {
  sendToId: string;
  onConfirmSend: () => void;
  /** Close control in header — e.g. return to View step */
  onRequestClose?: () => void;
}

export default function SignCaseModal26A({ sendToId, onConfirmSend, onRequestClose }: SignCaseModal26AProps) {
  const [saveSignature, setSaveSignature] = useState(true);
  const [createSimulation, setCreateSimulation] = useState(false);
  const [consentChecked, setConsentChecked] = useState(true);
  const [hasSignature, setHasSignature] = useState(false);
  const [sendToError, setSendToError] = useState(false);

  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef({ x: 0, y: 0 });

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

  const startDrawing = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const canvas = signatureCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      isDrawingRef.current = true;
      const pt = getCanvasPoint(e, canvas);
      lastPointRef.current = pt;
      ctx.beginPath();
      ctx.moveTo(pt.x, pt.y);
    },
    [getCanvasPoint],
  );

  const draw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
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
      ctx.beginPath();
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(pt.x, pt.y);
      ctx.stroke();
      lastPointRef.current = pt;
      setHasSignature(true);
    },
    [getCanvasPoint],
  );

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
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const container = canvas.parentElement;
    if (!container) return;
    const resize = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  const handleConfirmClick = useCallback(() => {
    if (!sendToId) {
      setSendToError(true);
      return;
    }
    setSendToError(false);
    onConfirmSend();
  }, [sendToId, onConfirmSend]);

  return (
    <div
      className="absolute inset-0 z-[100] flex items-center justify-center p-6"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.63)" }}
      role="presentation"
    >
      <div
        className="flex flex-col bg-[var(--color-background-layer-01)] w-full max-w-[656px] rounded-2xl p-6 gap-6 shrink-0 max-h-[min(900px,calc(100vh-48px))] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sign-case-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-6 w-full min-w-0">
          <div className="flex flex-col gap-0 w-full">
            <div className="flex gap-4 items-center min-h-[60px] w-full">
              <div className="flex flex-col flex-1 min-w-0 justify-center">
                <h2 id="sign-case-title" className="tp-heading-03 text-text-primary truncate w-full">
                  Sign case
                </h2>
                <p className="tp-body-02 text-text-secondary w-full">Please sign to authorize case</p>
                {sendToError && (
                  <p className="tp-body-02 text-[var(--color-text-error,#d43f58)] mt-2">Select a &quot;Send to&quot; recipient before sending.</p>
                )}
              </div>
              {onRequestClose && (
                <div className="flex items-center justify-center shrink-0 py-0.5 w-[60px] self-stretch">
                  <button
                    type="button"
                    onClick={onRequestClose}
                    className="flex items-center justify-center cursor-pointer bg-transparent border-0 appearance-none outline-none transition-ui hover:opacity-70 focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] rounded-lg"
                    style={{ width: 60, height: 60 }}
                    aria-label="Close"
                  >
                    <svg width="32" height="32" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                      <path d="M12.5 4.5L11.5 3.5L8 7L4.5 3.5L3.5 4.5L7 8L3.5 11.5L4.5 12.5L8 9L11.5 12.5L12.5 11.5L9 8L12.5 4.5Z" fill="currentColor" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col w-full">
            <div className="flex h-[246px] min-h-0 flex-col isolate w-full rounded-lg border border-solid border-border-subtle overflow-hidden">
              <div
                className="flex min-h-0 flex-1 w-full bg-[var(--color-background-layer-02)] px-4 py-3 overflow-hidden relative"
                style={{ touchAction: "none" }}
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
                  className="block w-full h-full cursor-crosshair"
                />
              </div>
              <div
                className="flex shrink-0 items-center justify-between w-full border-t border-solid border-border-subtle bg-[var(--color-background-subtle-02,#f4f4f4)] px-4 py-2"
              >
                <div className="flex items-center justify-center min-w-[72px] h-16 px-4 py-3 rounded-lg">
                  <span className={`tp-body-02 ${hasSignature ? "text-text-secondary" : "text-[var(--color-text-disabled,rgba(0,0,0,0.23))]"}`}>
                    Signature
                  </span>
                </div>
                <button
                  type="button"
                  onClick={clearSignature}
                  className={`flex items-center justify-center gap-2 min-w-[72px] h-16 px-4 py-3 rounded-lg cursor-pointer bg-transparent border-0 appearance-none outline-none transition-ui ${hasSignature ? "opacity-100" : "opacity-40"}`}
                  disabled={!hasSignature}
                >
                  <span className={hasSignature ? "text-text-secondary" : "text-[var(--color-text-disabled,rgba(0,0,0,0.23))]"}>
                    <EraseIcon />
                  </span>
                  <span className={`tp-body-02 ${hasSignature ? "text-text-secondary" : "text-[var(--color-text-disabled,rgba(0,0,0,0.23))]"}`}>
                    Clear
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full">
            <button
              type="button"
              onClick={() => setSaveSignature((v) => !v)}
              className="flex items-center cursor-pointer bg-transparent border-0 appearance-none outline-none shrink-0 min-h-[60px] gap-2 w-full text-left"
            >
              <CheckboxIcon checked={saveSignature} />
              <span className="tp-body-02 text-text-primary">Save signature</span>
            </button>
            <button
              type="button"
              onClick={() => setCreateSimulation((v) => !v)}
              className="flex items-center cursor-pointer bg-transparent border-0 appearance-none outline-none shrink-0 min-h-[60px] gap-2 w-full text-left py-[18px]"
            >
              <CheckboxIcon checked={createSimulation} />
              <span className="tp-body-02 text-text-primary">Create Invisalign Simulation+</span>
            </button>
            <button
              type="button"
              onClick={() => setConsentChecked((v) => !v)}
              className="flex items-start cursor-pointer bg-transparent border-0 appearance-none outline-none shrink-0 gap-2 w-full text-left pt-5"
            >
              <span className="shrink-0 mt-0.5">
                <CheckboxIcon checked={consentChecked} />
              </span>
              <span className="tp-body-02 text-text-primary">
                By checking this box, I represent that my patient has consented to the collection and processing of their personal health data and the processing of that data by Align Technology for the purposes of providing customized dental care.
                <br />
                <button type="button" className="tp-link-01 text-text-secondary bg-transparent border-0 p-0 cursor-pointer underline">
                  View more
                </button>
              </span>
            </button>
          </div>

          <div className="flex justify-end w-full">
            <button
              type="button"
              onClick={handleConfirmClick}
              className="flex items-center justify-center cursor-pointer appearance-none outline-none transition-ui focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] min-w-[72px] px-4 py-4 rounded-lg gap-2 bg-[var(--color-border-interactive,#009ace)] border-0"
            >
              <span className="tp-body-02 text-[var(--color-text-on-color-primary)]">Confirm &amp; Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
