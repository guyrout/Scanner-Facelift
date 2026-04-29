import { useState } from "react";

const IMAGE_W = 392;
const CHEVRON_COL_W = 32;
const ZOOM_BTN = 60;
const SLIDER_COL_W = 60;
const EXPANDED_SLIDER_TRACK_H = 313;
const COMPACT_SLIDER_TRACK_H = 138;
const SLIDER_THUMB = 32;
const COMPACT_ROW_W = CHEVRON_COL_W + IMAGE_W;

const NIRI_SRC = "/review-tool/niri.png";
const IOC_SRC = "/review-tool/ioc.png";

type ReviewViewMode = "compact" | "expanded";
type ZoomTarget = "niri" | "ioc";

export interface ReviewToolPanelProps {
  onClose: () => void;
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <g style={direction === "right" ? { transform: "translate(32px, 0) scale(-1, 1)" } : undefined}>
        <path d="M21 6L11 16L21 26" stroke="#121212" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

function ZoomInIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M18 12H14V8H12V12H8V14H12V18H14V14H18V12Z" fill="#121212" />
      <path d="M21.4479 20C23.0978 18.0408 24.0017 15.5613 24 13C24 10.8244 23.3549 8.69767 22.1462 6.88873C20.9375 5.07979 19.2195 3.66989 17.2095 2.83733C15.1995 2.00477 12.9878 1.78693 10.854 2.21137C8.72022 2.6358 6.76021 3.68345 5.22183 5.22183C3.68345 6.76021 2.6358 8.72022 2.21137 10.854C1.78693 12.9878 2.00477 15.1995 2.83733 17.2095C3.66989 19.2195 5.07979 20.9375 6.88873 22.1462C8.69767 23.3549 10.8244 24 13 24C15.5613 24.0017 18.0408 23.0978 20 21.4479L27.5859 29L29 27.5859L21.4479 20ZM13 22C11.22 22 9.47992 21.4722 7.99987 20.4832C6.51983 19.4943 5.36628 18.0887 4.68509 16.4442C4.0039 14.7996 3.82567 12.99 4.17294 11.2442C4.5202 9.49836 5.37737 7.89472 6.63604 6.63604C7.89472 5.37737 9.49836 4.5202 11.2442 4.17294C12.99 3.82567 14.7996 4.0039 16.4442 4.68509C18.0887 5.36628 19.4943 6.51983 20.4832 7.99987C21.4722 9.47992 22 11.22 22 13C21.9974 15.3861 21.0483 17.6738 19.361 19.361C17.6738 21.0483 15.3861 21.9974 13 22Z" fill="#121212" />
    </svg>
  );
}

function ZoomOutIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M18 12H8V14H18V12Z" fill="#121212" />
      <path d="M21.4479 20C23.0978 18.0408 24.0017 15.5613 24 13C24 10.8244 23.3549 8.69767 22.1462 6.88873C20.9375 5.07979 19.2195 3.66989 17.2095 2.83733C15.1995 2.00477 12.9878 1.78693 10.854 2.21137C8.72022 2.6358 6.76021 3.68345 5.22183 5.22183C3.68345 6.76021 2.6358 8.72022 2.21137 10.854C1.78693 12.9878 2.00477 15.1995 2.83733 17.2095C3.66989 19.2195 5.07979 20.9375 6.88873 22.1462C8.69767 23.3549 10.8244 24 13 24C15.5613 24.0017 18.0408 23.0978 20 21.4479L27.5859 29L29 27.5859L21.4479 20ZM13 22C11.22 22 9.47992 21.4722 7.99987 20.4832C6.51983 19.4943 5.36628 18.0887 4.68509 16.4442C4.0039 14.7996 3.82567 12.99 4.17294 11.2442C4.5202 9.49836 5.37737 7.89472 6.63604 6.63604C7.89472 5.37737 9.49836 4.5202 11.2442 4.17294C12.99 3.82567 14.7996 4.0039 16.4442 4.68509C18.0887 5.36628 19.4943 6.51983 20.4832 7.99987C21.4722 9.47992 22 11.22 22 13C21.9974 15.3861 21.0483 17.6738 19.361 19.361C17.6738 21.0483 15.3861 21.9974 13 22Z" fill="#121212" />
    </svg>
  );
}

function LightFillIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M12.75 1.5H11.25V5.25H12.75V1.5Z" fill="#121212" />
      <path d="M18.8943 4.04517L16.2649 6.67454L17.3255 7.7351L19.9549 5.10572L18.8943 4.04517Z" fill="#121212" />
      <path d="M22.5 11.25H18.75V12.75H22.5V11.25Z" fill="#121212" />
      <path d="M17.3255 16.2649L16.2649 17.3255L18.8943 19.9548L19.9548 18.8943L17.3255 16.2649Z" fill="#121212" />
      <path d="M12.75 18.75H11.25V22.5H12.75V18.75Z" fill="#121212" />
      <path d="M6.67455 16.2649L4.04517 18.8943L5.10573 19.9548L7.7351 17.3255L6.67455 16.2649Z" fill="#121212" />
      <path d="M5.25 11.25H1.5V12.75H5.25V11.25Z" fill="#121212" />
      <path d="M5.10573 4.04516L4.04518 5.10571L6.67456 7.73509L7.73511 6.67454L5.10573 4.04516Z" fill="#121212" />
      <path d="M12 7.5C11.11 7.5 10.24 7.76392 9.49993 8.25839C8.75991 8.75285 8.18314 9.45566 7.84254 10.2779C7.50195 11.1002 7.41283 12.005 7.58647 12.8779C7.7601 13.7508 8.18868 14.5526 8.81802 15.182C9.44736 15.8113 10.2492 16.2399 11.1221 16.4135C11.995 16.5872 12.8998 16.4981 13.7221 16.1575C14.5443 15.8169 15.2471 15.2401 15.7416 14.5001C16.2361 13.76 16.5 12.89 16.5 12C16.5 10.8065 16.0259 9.66193 15.182 8.81802C14.3381 7.97411 13.1935 7.5 12 7.5Z" fill="#121212" />
    </svg>
  );
}

function NiriIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M12 22.5V1.5C14.7848 1.5 17.4555 2.60625 19.4246 4.57538C21.3938 6.54451 22.5 9.21523 22.5 12C22.5 14.7848 21.3938 17.4555 19.4246 19.4246C17.4555 21.3938 14.7848 22.5 12 22.5Z" fill="#121212" />
      <path d="M12.0073 21.9971C9.35632 21.9971 6.8139 20.944 4.93936 19.0694C3.06482 17.1949 2.01172 14.6525 2.01172 12.0015C2.01172 9.35047 3.06482 6.80804 4.93936 4.9335C6.8139 3.05896 9.35632 2.00586 12.0073 2.00586" stroke="#121212" />
    </svg>
  );
}

function SliderUnit({ value, onChange, trackHeight }: { value: number; onChange: (value: number) => void; trackHeight: number }) {
  const thumbTravel = trackHeight - SLIDER_THUMB;
  const thumbTopPx = Math.round(((100 - value) / 100) * thumbTravel);

  return (
    <div className="relative flex w-[60px] items-center justify-center" style={{ height: trackHeight }}>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="absolute z-20 cursor-pointer opacity-0"
        style={{ width: trackHeight, transform: "rotate(-90deg)" }}
        aria-label="Review slider"
      />
      <div
        className="absolute rounded-sm"
        style={{ left: 28, top: 0, bottom: 0, width: 4, backgroundColor: "var(--color-border-subtle)" }}
      />
      <div
        className="absolute rounded-sm"
        style={{ left: 28, bottom: 0, height: `${value}%`, width: 4, backgroundColor: "var(--color-border-interactive)" }}
      />
      <div
        className="absolute rounded-full"
        style={{
          left: 30,
          top: thumbTopPx,
          width: SLIDER_THUMB,
          height: SLIDER_THUMB,
          transform: "translateX(-50%)",
          border: "2px solid var(--color-border-subtle)",
          backgroundColor: "var(--color-background-layer-01)",
          boxShadow: "var(--shadow-card)",
        }}
      />
    </div>
  );
}

function ZoomButton({ zoomed, onClick }: { zoomed?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex cursor-pointer items-center justify-center border-0 p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2"
      style={{
        width: ZOOM_BTN,
        height: ZOOM_BTN,
        borderRadius: 8,
        backgroundColor: "var(--color-background-elevated)",
        border: "2px solid var(--color-border-subtle)",
      }}
      aria-label={zoomed ? "Zoom out" : "Zoom in"}
    >
      {zoomed ? <ZoomOutIcon /> : <ZoomInIcon />}
    </button>
  );
}

function ImageCard({ src, onZoom, filter }: { src: string; onZoom: () => void; filter: string }) {
  return (
    <div
      className="relative shrink-0 flex items-start justify-end overflow-hidden rounded-lg p-1"
      style={{ width: "100%", height: "calc((100% - 8px) / 2)", boxSizing: "border-box" }}
    >
      <div className="pointer-events-none absolute inset-0">
        <img src={src} alt="" className="h-full w-full rounded object-cover" style={{ filter }} draggable={false} />
      </div>
      <div className="pointer-events-auto relative shrink-0">
        <ZoomButton onClick={onZoom} />
      </div>
    </div>
  );
}

export default function ReviewToolPanel26A({ onClose: _onClose }: ReviewToolPanelProps) {
  const [mode, setMode] = useState<ReviewViewMode>("compact");
  const [showSliders, setShowSliders] = useState(false);
  const [zoomTarget, setZoomTarget] = useState<ZoomTarget>("ioc");
  const [upperLight, setUpperLight] = useState(57);
  const [upperNiri, setUpperNiri] = useState(57);
  const [lowerLight, setLowerLight] = useState(57);
  const [lowerNiri, setLowerNiri] = useState(57);

  const handleChevron = () => {
    setShowSliders((prev) => !prev);
  };

  const openZoom = (target: ZoomTarget) => {
    setZoomTarget(target);
    setMode("expanded");
    setShowSliders(false);
  };

  const imageFilter = (light: number, niri: number) => {
    const brightness = 0.6 + light / 125;
    const contrast = 0.6 + niri / 125;
    return `brightness(${brightness}) contrast(${contrast})`;
  };

  const upperFilter = imageFilter(upperLight, upperNiri);
  const lowerFilter = imageFilter(lowerLight, lowerNiri);

  const stackHeight = "min(714px, calc(100vh - 220px))";
  const compactImageWidth = "min(392px, calc(100vw - 240px))";
  const expandedImageWidth = "min(602px, calc(100vw - 160px))";
  const selectedLight = zoomTarget === "niri" ? upperLight : lowerLight;
  const selectedNiri = zoomTarget === "niri" ? upperNiri : lowerNiri;
  const selectedFilter = zoomTarget === "niri" ? upperFilter : lowerFilter;
  const setSelectedLight = (value: number) => {
    if (zoomTarget === "niri") {
      setUpperLight(value);
      return;
    }
    setLowerLight(value);
  };
  const setSelectedNiri = (value: number) => {
    if (zoomTarget === "niri") {
      setUpperNiri(value);
      return;
    }
    setLowerNiri(value);
  };

  const collapsedSingleWidth = CHEVRON_COL_W + 602 + 10;
  const expandedSingleWidth = CHEVRON_COL_W + SLIDER_COL_W + 602 + 10;
  const collapsedStackWidth = COMPACT_ROW_W + 10;
  const expandedStackWidth = CHEVRON_COL_W + SLIDER_COL_W + IMAGE_W + 10;

  return (
    <aside
      className="mt-4 flex shrink-0 flex-col overflow-hidden"
      style={{
        paddingLeft: 2,
        paddingRight: 8,
        paddingTop: 8,
        paddingBottom: 8,
        borderRadius: 8,
        backgroundColor: "var(--color-background-elevated)",
        boxShadow: "0px 2px 12px rgba(0, 0, 0, 0.13)",
        width:
          mode === "compact"
            ? showSliders
              ? expandedStackWidth
              : collapsedStackWidth
            : showSliders
              ? expandedSingleWidth
              : collapsedSingleWidth,
        maxWidth: "calc(100vw - 24px)",
        maxHeight: `calc(${stackHeight} + 16px)`,
      }}
      aria-label="Review tool"
    >
      <div className="flex shrink-0 flex-row items-stretch">
        <div className="flex shrink-0 flex-col items-center justify-center self-stretch" style={{ width: CHEVRON_COL_W }}>
          <button
            type="button"
            onClick={handleChevron}
            className="flex cursor-pointer items-center justify-center overflow-hidden border-0 bg-transparent p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2"
            style={{ width: CHEVRON_COL_W, height: 32 }}
            aria-label={showSliders ? "Hide sliders" : "Show sliders"}
          >
            <ChevronIcon direction={showSliders ? "right" : "left"} />
          </button>
        </div>

        {mode === "compact" && (
          <>
            {showSliders && (
              <div className="flex shrink-0 flex-col items-center justify-center" style={{ width: SLIDER_COL_W, height: stackHeight, gap: 16 }}>
                <div
                  className="flex w-full flex-1 flex-col items-center justify-center"
                  style={{ gap: 8 }}
                >
                  <div className="flex h-6 w-6 items-center justify-center">
                    <LightFillIcon />
                  </div>
                  <SliderUnit value={upperLight} onChange={setUpperLight} trackHeight={COMPACT_SLIDER_TRACK_H} />
                  <div className="flex h-6 w-6 items-center justify-center">
                    <NiriIcon />
                  </div>
                  <SliderUnit value={upperNiri} onChange={setUpperNiri} trackHeight={COMPACT_SLIDER_TRACK_H} />
                </div>
                <div
                  className="flex w-full flex-1 flex-col items-center justify-center"
                  style={{ gap: 8 }}
                >
                  <div className="flex h-6 w-6 items-center justify-center">
                    <LightFillIcon />
                  </div>
                  <SliderUnit value={lowerLight} onChange={setLowerLight} trackHeight={COMPACT_SLIDER_TRACK_H} />
                  <div className="flex h-6 w-6 items-center justify-center">
                    <NiriIcon />
                  </div>
                  <SliderUnit value={lowerNiri} onChange={setLowerNiri} trackHeight={COMPACT_SLIDER_TRACK_H} />
                </div>
              </div>
            )}
            <div className="flex shrink-0 flex-col items-start" style={{ width: compactImageWidth, height: stackHeight, gap: 8 }}>
              <ImageCard src={NIRI_SRC} onZoom={() => openZoom("niri")} filter={upperFilter} />
              <ImageCard src={IOC_SRC} onZoom={() => openZoom("ioc")} filter={lowerFilter} />
            </div>
          </>
        )}

        {mode === "expanded" && (
          <>
            {showSliders && (
            <div className="flex shrink-0 flex-col items-center justify-center" style={{ width: SLIDER_COL_W, height: stackHeight, gap: 16 }}>
              <div
                className="flex w-full flex-1 flex-col items-center justify-center"
                style={{ gap: 8 }}
              >
                <div className="flex h-6 w-6 items-center justify-center">
                  <LightFillIcon />
                </div>
                <SliderUnit value={selectedLight} onChange={setSelectedLight} trackHeight={EXPANDED_SLIDER_TRACK_H} />
              </div>
              <div className="flex h-6 w-6 items-center justify-center">
                <NiriIcon />
              </div>
              <div className="flex w-full flex-1 flex-col items-center justify-center">
                <SliderUnit value={selectedNiri} onChange={setSelectedNiri} trackHeight={EXPANDED_SLIDER_TRACK_H} />
              </div>
            </div>
            )}
            <div className="flex shrink-0 flex-col items-start" style={{ width: expandedImageWidth, height: stackHeight, gap: 8 }}>
              <div className="relative shrink-0 overflow-hidden rounded-lg p-1" style={{ width: "100%", height: "100%", boxSizing: "border-box" }}>
                <img
                  src={zoomTarget === "niri" ? NIRI_SRC : IOC_SRC}
                  alt=""
                  className="h-full w-full rounded object-cover"
                  style={{ filter: selectedFilter }}
                  draggable={false}
                />
                <div className="pointer-events-auto absolute right-1 top-1">
                  <ZoomButton
                    zoomed
                    onClick={() => {
                      setMode("compact");
                      setShowSliders(false);
                    }}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
