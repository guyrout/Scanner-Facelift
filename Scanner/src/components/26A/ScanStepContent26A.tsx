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

import { useCallback, useEffect, useRef, useState, lazy, Suspense, type MutableRefObject } from "react";
import ScanToolbar26A, { type ScanToolbarToolId } from "./ScanToolbar26A";
import PrepEditPanel26A, { type PrepEditMode } from "./PrepEditPanel26A";
import SwapScansModal26A from "./SwapScansModal26A";
import ToothMap26A from "./ToothMap26A";
import JawSelector26A, { type JawSelection } from "./JawSelector26A";
import LassoDrawingOverlay26A, { type LassoPoint } from "./LassoDrawingOverlay26A";
import ScanLongTapMenuOverlay26A from "./ScanLongTapMenu26A";
import { getTreatmentPlyPair, treatmentRestrictsScanViewToolbarTools } from "./treatmentScanFlow26A";
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
  /** Increments when the sleeve confirmation modal closes — opens upper-jaw guidance in the tooth map. */
  postSleeveUpperGuidanceNonce?: number;
  /** Mirror of `postSleeveUpperGuidanceNonce` — opens lower-jaw guidance when the case starts on the lower arch. */
  postSleeveLowerGuidanceNonce?: number;
  /** While false, upper-jaw guidance may auto-open or open from the upper arch control (once per scan-flow visit). */
  upperJawGuidanceDismissedThisFlow?: boolean;
  onUpperJawGuidanceDismissed?: () => void;
  lowerJawGuidanceDismissedThisFlow?: boolean;
  onLowerJawGuidanceDismissed?: () => void;
  biteGuidanceDismissedThisFlow?: boolean;
  onBiteGuidanceDismissed?: () => void;
  /**
   * When false, the 3D viewport is hidden until the sleeve step is confirmed (26A scan step).
   * Guidance modals still appear on top of the viewer when `true`.
   */
  showScanViewport3d?: boolean;
}

export default function ScanStepContent26A({
  toolbarExpanded,
  onToolbarExpandedChange,
  cameraStateRef,
  treatmentId,
  toothSelections,
  selectedJaw,
  onSelectedJawChange,
  postSleeveUpperGuidanceNonce = 0,
  postSleeveLowerGuidanceNonce = 0,
  upperJawGuidanceDismissedThisFlow = false,
  onUpperJawGuidanceDismissed,
  lowerJawGuidanceDismissedThisFlow = false,
  onLowerJawGuidanceDismissed,
  biteGuidanceDismissedThisFlow = false,
  onBiteGuidanceDismissed,
  showScanViewport3d = true,
}: ScanStepContentProps) {
  const { upperUrl, lowerUrl, biteUrl, upperTextureUrl, lowerTextureUrl } = getTreatmentPlyPair(treatmentId);
  const restrictToolbar = treatmentRestrictsScanViewToolbarTools(treatmentId);
  const [scanToolbarActiveTools, setScanToolbarActiveTools] = useState<Set<ScanToolbarToolId>>(
    () => new Set<ScanToolbarToolId>(["feedback", "scan-color"]),
  );
  const viewMode: ViewMode = scanToolbarActiveTools.has("scan-color") ? "color" : "stone";
  const [prepEditOpen, setPrepEditOpen] = useState(false);
  const [prepSelectionMode, setPrepSelectionMode] = useState(false);
  const [eraseSelectionNonce, setEraseSelectionNonce] = useState(0);
  const [deselectEditNonce, setDeselectEditNonce] = useState(0);
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [deselectSwapNonce, setDeselectSwapNonce] = useState(0);

  // Lasso drawing state for prep-edit "Select and rescan" — mirrors the View
  // step's Trim tool: closed paths are projected to 3D and cut on Rescan.
  const [prepLassoPaths, setPrepLassoPaths] = useState<LassoPoint[][]>([]);
  const [prepLassoCurrent, setPrepLassoCurrent] = useState<LassoPoint[]>([]);
  const viewportRef = useRef<HTMLDivElement>(null);
  const isFixedRestorativeScan = treatmentId === "fixed-restorative";

  // Clearing the lasso must happen AFTER PlyMesh has performed its cut.
  // Child effects fire before parent effects in the same commit, so by the
  // time this effect runs the cut is already applied — at which point we can
  // safely drop the now-rendered overlay paths.
  const lastClearedEraseNonceRef = useRef(0);
  useEffect(() => {
    if (eraseSelectionNonce <= lastClearedEraseNonceRef.current) return;
    lastClearedEraseNonceRef.current = eraseSelectionNonce;
    setPrepLassoPaths([]);
    setPrepLassoCurrent([]);
  }, [eraseSelectionNonce]);

  // Derive panel mode: the Rescan button is only enabled (mode === "selected")
  // once the user has actually drawn something to cut. Until then we fall back
  // to the panel's "disabled" mode which renders Rescan as a disabled button.
  const prepEditMode: PrepEditMode = !prepSelectionMode
    ? "select"
    : prepLassoPaths.length > 0
      ? "selected"
      : "disabled";

  const handlePrepDrawStart = useCallback((p: LassoPoint) => {
    setPrepLassoCurrent([p]);
  }, []);
  const handlePrepDrawMove = useCallback((p: LassoPoint) => {
    setPrepLassoCurrent((prev) => [...prev, p]);
  }, []);
  const handlePrepDrawEnd = useCallback(() => {
    setPrepLassoCurrent((prev) => {
      if (prev.length > 2) {
        setPrepLassoPaths((paths) => [...paths, prev]);
      }
      return [];
    });
  }, []);

  useEffect(() => {
    if (!treatmentRestrictsScanViewToolbarTools(treatmentId)) return;
    setPrepEditOpen(false);
    setPrepSelectionMode(false);
    setPrepLassoPaths([]);
    setPrepLassoCurrent([]);
    setSwapModalOpen(false);
    setScanToolbarActiveTools((prev) => {
      const next = new Set(prev);
      next.delete("edit");
      next.delete("swap");
      return next;
    });
    setDeselectEditNonce((n) => n + 1);
    setDeselectSwapNonce((n) => n + 1);
  }, [treatmentId]);

  function cycleJaw(dir: 1 | -1) {
    const idx = JAW_ORDER.indexOf(selectedJaw);
    const next = (idx + dir + JAW_ORDER.length) % JAW_ORDER.length;
    onSelectedJawChange(JAW_ORDER[next]);
  }

  return (
    <div className="relative flex flex-col flex-1 min-h-0 min-w-0">
      <div className="relative flex-1 min-h-0 min-w-0" style={{ backgroundColor: "var(--color-page-background)" }}>
        {/* 3D model viewport — fills entire area */}
        <div ref={viewportRef} className="absolute inset-0 overflow-hidden">
          {showScanViewport3d ? (
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
                biteUrl={biteUrl}
                upperTextureUrl={upperTextureUrl}
                lowerTextureUrl={lowerTextureUrl}
                jawView={selectedJaw}
                viewMode={viewMode}
                cameraStateRef={cameraStateRef}
                editSelectionMode={prepSelectionMode}
                eraseSelectionNonce={eraseSelectionNonce}
                lassoPaths={prepLassoPaths}
              />
            </Suspense>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: "var(--color-page-background)" }}>
              <p className="tp-body-02 text-text-secondary text-center max-w-sm px-6">
                The 3D scan view appears after you confirm the sleeve step.
              </p>
            </div>
          )}

          {isFixedRestorativeScan && showScanViewport3d && !prepSelectionMode && (
            <ScanLongTapMenuOverlay26A enabled containerRef={viewportRef} />
          )}
        </div>

        {/* Prep-edit lasso overlay — mirrors the View step's Trim drawing overlay.
            Sits above the 3D viewport but below z-10 UI (tooth map / jaw selector)
            and the z-20 prep-edit panel, so those remain interactive. */}
        {prepEditOpen && prepSelectionMode && showScanViewport3d && (
          <LassoDrawingOverlay26A
            paths={prepLassoPaths}
            currentPath={prepLassoCurrent}
            onDrawStart={handlePrepDrawStart}
            onDrawMove={handlePrepDrawMove}
            onDrawEnd={handlePrepDrawEnd}
          />
        )}

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
            postSleeveUpperGuidanceNonce={postSleeveUpperGuidanceNonce}
            postSleeveLowerGuidanceNonce={postSleeveLowerGuidanceNonce}
            upperJawGuidanceDismissedThisFlow={upperJawGuidanceDismissedThisFlow}
            onUpperJawGuidanceDismissed={onUpperJawGuidanceDismissed}
            lowerJawGuidanceDismissedThisFlow={lowerJawGuidanceDismissedThisFlow}
            onLowerJawGuidanceDismissed={onLowerJawGuidanceDismissed}
            biteGuidanceDismissedThisFlow={biteGuidanceDismissedThisFlow}
            onBiteGuidanceDismissed={onBiteGuidanceDismissed}
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
            activeTools={scanToolbarActiveTools}
            onActiveToolsChange={setScanToolbarActiveTools}
            deselectEditNonce={deselectEditNonce}
            deselectSwapNonce={deselectSwapNonce}
            showEditAndSwapTools={!restrictToolbar}
            stickyActiveToolIds={["feedback"]}
            onToolClick={(toolId, isActive) => {
              if (toolId === "edit") {
                setPrepEditOpen(isActive);
                if (!isActive) {
                  // Leaving Edit also drops any in-progress selection so the
                  // derived panel mode falls back to "select" next time.
                  setPrepSelectionMode(false);
                  setPrepLassoPaths([]);
                  setPrepLassoCurrent([]);
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

        {/* Bottom-left: Prep edit menu — Figma 5386:98816 / 5386:98770 / 5404:89938 when Edit tool is active */}
        {prepEditOpen && (
          <div className="absolute z-20" style={{ left: 28, bottom: 28 }}>
            <PrepEditPanel26A
              mode={prepEditMode}
              onClose={() => {
                setPrepEditOpen(false);
                setPrepSelectionMode(false);
                setPrepLassoPaths([]);
                setPrepLassoCurrent([]);
                setDeselectEditNonce((n) => n + 1);
              }}
              onSelectAndRescan={() => {
                setPrepSelectionMode(true);
                setPrepLassoPaths([]);
                setPrepLassoCurrent([]);
              }}
              onRescan={() => {
                // Triggers the projection + cut inside PlyMesh. The lasso paths
                // are NOT cleared here — that happens in a useEffect after this
                // commit so PlyMesh's child effect still sees the paths when it
                // performs the cut. (Clearing in the same batch would race the
                // cut and leave the model intact.)
                setEraseSelectionNonce((n) => n + 1);
              }}
              onUndoSelection={() => {
                // Clears the in-progress lasso but keeps the user in selection
                // mode so they can re-draw without re-opening the panel.
                setPrepLassoPaths([]);
                setPrepLassoCurrent([]);
              }}
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
