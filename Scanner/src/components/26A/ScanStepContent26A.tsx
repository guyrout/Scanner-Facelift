/**
 * Scan step content — Figma 4138:125804.
 * Full scan page layout shown when wizard step === "scan".
 *
 * Layout:
 * ┌──────────────────────────────────────────────────────┐
 * │           │                          │   ScanToolbar │
 * │ ToothMap  │   3D Scan Viewport       │               │
 * │           │   (placeholder image)    │               │
 * │           │                          │               │
 * │ JawSel.   │                          │               │
 * │           │                          │               │
 * │ [Camera]  │                          │               │
 * └───────────┴──────────────────────────┴───────────────┘
 */

import { useState, lazy, Suspense, type MutableRefObject } from "react";
import ScanToolbar26A from "./ScanToolbar26A";
import PrepEditPanel26A from "./PrepEditPanel26A";
import SwapScansModal26A from "./SwapScansModal26A";
import ToothMap26A from "./ToothMap26A";
import JawSelector26A, { type JawSelection } from "./JawSelector26A";
import { getTreatmentPlyPair } from "./treatmentScanFlow26A";
import type { ViewMode, CameraState } from "./PlyModelViewer26A";

const PlyModelViewer = lazy(() => import("./PlyModelViewer26A"));

const JAW_ORDER: JawSelection[] = ["upper", "bite", "lower"];

interface ScanStepContentProps {
  toolbarExpanded?: boolean;
  onToolbarExpandedChange?: (expanded: boolean) => void;
  cameraStateRef?: MutableRefObject<CameraState>;
  /** Drives PLY pair for the active order treatment (26A). */
  treatmentId: string;
  /** Must match the Info step tooth chart — single source of truth for map + jaw sync. */
  toothSelections: Record<number, string>;
  selectedJaw: JawSelection;
  onSelectedJawChange: (jaw: JawSelection) => void;
}

export default function ScanStepContent26A({
  toolbarExpanded,
  onToolbarExpandedChange,
  cameraStateRef,
  treatmentId,
  toothSelections,
  selectedJaw,
  onSelectedJawChange,
}: ScanStepContentProps) {
  const { upperUrl, lowerUrl } = getTreatmentPlyPair(treatmentId);
  const [viewMode, setViewMode] = useState<ViewMode>("color");
  const [prepEditOpen, setPrepEditOpen] = useState(false);
  const [prepSelectionMode, setPrepSelectionMode] = useState(false);
  const [eraseSelectionNonce, setEraseSelectionNonce] = useState(0);
  const [deselectEditNonce, setDeselectEditNonce] = useState(0);
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [deselectSwapNonce, setDeselectSwapNonce] = useState(0);

  function cycleJaw(dir: 1 | -1) {
    const idx = JAW_ORDER.indexOf(selectedJaw);
    const next = (idx + dir + JAW_ORDER.length) % JAW_ORDER.length;
    onSelectedJawChange(JAW_ORDER[next]);
  }

  return (
    <div className="relative flex flex-col flex-1 min-h-0 min-w-0">
      <div className="relative flex-1 min-h-0 min-w-0" style={{ backgroundColor: "var(--color-page-background)" }}>
        {/* 3D model viewport — fills entire area */}
        <div className="absolute inset-0 overflow-hidden">
          <Suspense
            fallback={
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="tp-body-02 text-text-secondary">Loading 3D model…</span>
              </div>
            }
          >
            <PlyModelViewer
              key={treatmentId}
              url={upperUrl}
              lowerUrl={lowerUrl}
              jawView={selectedJaw}
              viewMode={viewMode}
              cameraStateRef={cameraStateRef}
              editSelectionMode={prepSelectionMode}
              eraseSelectionNonce={eraseSelectionNonce}
            />
          </Suspense>
        </div>

        {/* Top-left: tooth map — same chart also shown on View (26A replaces multi-layer panel there) */}
        <div
          className="absolute z-10"
          style={{
            top: 12,
            left: 23,
            display: "flex",
            flexDirection: "column",
            textAlign: "center",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ToothMap26A
            className="shrink-0"
            selectedJaw={selectedJaw}
            onJawChange={onSelectedJawChange}
            toothSelections={toothSelections}
          />
        </div>

        {/* Left: jaw selector */}
        <div className="absolute z-10" style={{ left: 23, top: 418, width: 240 }}>
          <JawSelector26A
            selected={selectedJaw}
            onPrev={() => cycleJaw(-1)}
            onNext={() => cycleJaw(1)}
          />
        </div>

        {/* Right: floating toolbar */}
        <div
          className="absolute flex items-center justify-end"
          style={{ top: 12, right: 23, width: 603 }}
        >
          <ScanToolbar26A
            expanded={toolbarExpanded}
            onExpandedChange={onToolbarExpandedChange}
            deselectEditNonce={deselectEditNonce}
            deselectSwapNonce={deselectSwapNonce}
            onToolClick={(toolId, isActive) => {
              if (toolId === "scan-color") {
                setViewMode(isActive ? "stone" : "color");
              }
              if (toolId === "edit") {
                setPrepEditOpen(isActive);
                if (!isActive) {
                  setPrepSelectionMode(false);
                }
              }
              if (toolId === "swap") {
                setSwapModalOpen(isActive);
              }
            }}
          />
        </div>

        {/* Bottom-left: dark preview rectangle — Figma 4014:72504 when Edit (prep edit) is not active */}
        {!prepEditOpen && (
          <div
            className="absolute z-10 shrink-0"
            style={{
              left: 28,
              bottom: 28,
              width: 400,
              height: 227,
              borderRadius: 16,
              backgroundColor: "var(--color-background-inverse)",
              border: "1px solid var(--color-border-subtle)",
              padding: 10,
            }}
            aria-hidden
          />
        )}

        {/* Bottom-left: Prep edit menu — Figma 4285:156904 when Edit tool is active */}
        {prepEditOpen && (
          <div className="absolute z-20" style={{ left: 28, bottom: 28 }}>
            <PrepEditPanel26A
              onClose={() => {
                setPrepEditOpen(false);
                setPrepSelectionMode(false);
                setDeselectEditNonce((n) => n + 1);
              }}
              onSelect={() => {
                setPrepSelectionMode(true);
              }}
              onEraseAndScan={() => {
                setEraseSelectionNonce((n) => n + 1);
                setPrepSelectionMode(false);
              }}
              selectActive={prepSelectionMode}
            />
          </div>
        )}
      </div>

      {/* Swap scans — Figma 4291:158458 */}
      <SwapScansModal26A
        open={swapModalOpen}
        onClose={() => {
          setSwapModalOpen(false);
          setDeselectSwapNonce((n) => n + 1);
        }}
        onConfirm={() => {
          /* apply swap */
        }}
      />
    </div>
  );
}
