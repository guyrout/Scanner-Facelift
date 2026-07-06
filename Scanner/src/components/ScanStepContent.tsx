/**
 * Scan step content — Figma 4138:125804.
 * Full scan page layout shown when wizard step === "scan".
 *
 * Layout:
 * ┌──────────────────────────────────────────────────────┐
 * │  ScanTabBar (Pre-treatment | Treatment Scan | +)     │
 * ├───────────┬──────────────────────────┬───────────────┤
 * │           │                          │   ScanToolbar │
 * │ ToothMap  │   3D Scan Viewport       │               │
 * │           │   (placeholder image)    │               │
 * │           │                          │               │
 * │ JawSel.   │                          │               │
 * │           │                          │               │
 * │ [Camera]  │                          │               │
 * └───────────┴──────────────────────────┴───────────────┘
 */

import { useState, useCallback, useRef, lazy, Suspense, type MutableRefObject } from "react";
import ScanLongTapMenuOverlay26A from "./26A/ScanLongTapMenu26A";
import ScanTabBar, { type TabData } from "./ScanTabBar";
import ScanToolbar, { type ScanToolbarToolId } from "./ScanToolbar";
import PrepEditPanel from "./PrepEditPanel";
import SwapScansModal from "./SwapScansModal";
import ToothMap from "./ToothMap";
import ToothMap26A from "./26A/ToothMap26A";
import JawSelector, { type JawSelection as LegacyJawSelection } from "./JawSelector";
import JawSelector26A, { type JawSelection } from "./26A/JawSelector26A";
import PlyModelViewer26A from "./26A/PlyModelViewer26A";
import { FIXED_RESTORATIVE_STL_PAIR } from "./26A/treatmentScanFlow26A";
import VirtualKeyboard from "./VirtualKeyboard";
import type { ProcedureType } from "./ProcedureTypeSelector";
import type { ViewMode, CameraState } from "./PlyModelViewer";

const PlyModelViewer = lazy(() => import("./PlyModelViewer"));

const LEGACY_JAW_ORDER: LegacyJawSelection[] = ["upper", "lower", "both"];
const JAW_ORDER: JawSelection[] = ["upper", "bite", "lower"];

const DEFAULT_TABS: TabData[] = [
  { id: "pre-treatment", label: "Pre-treatment", hasScanData: false },
  { id: "treatment-scan", label: "Treatment scan", hasScanData: false },
];

let nextTabId = 1;

interface ScanStepContentProps {
  toolbarExpanded?: boolean;
  onToolbarExpandedChange?: (expanded: boolean) => void;
  cameraStateRef?: MutableRefObject<CameraState>;
  /** Procedure chosen on the Info step — drives 3D mesh when Fixed restorative is selected. */
  selectedProcedure?: ProcedureType | null;
  /** Tooth selections from the Info step — shown on ToothMap26A for Fixed restorative. */
  toothSelections?: Record<number, string>;
  /** Upper / bite / lower — shared with View step (26A scan behaviour). */
  selectedJaw?: JawSelection;
  onSelectedJawChange?: (jaw: JawSelection) => void;
}

export default function ScanStepContent({
  toolbarExpanded,
  onToolbarExpandedChange,
  cameraStateRef,
  selectedProcedure = null,
  toothSelections = {},
  selectedJaw = "upper",
  onSelectedJawChange,
}: ScanStepContentProps) {
  const isFixedRestorative = selectedProcedure === "fixed-restorative";
  const [tabs, setTabs] = useState<TabData[]>(DEFAULT_TABS);
  const [activeTabId, setActiveTabId] = useState(DEFAULT_TABS[0].id);
  const [legacySelectedJaw, setLegacySelectedJaw] = useState<LegacyJawSelection>("lower");

  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [scanToolbarActiveTools, setScanToolbarActiveTools] = useState<Set<ScanToolbarToolId>>(
    () => new Set<ScanToolbarToolId>(["scan-color"]),
  );
  const viewMode: ViewMode = scanToolbarActiveTools.has("scan-color") ? "color" : "stone";
  const [prepEditOpen, setPrepEditOpen] = useState(false);
  const [deselectEditNonce, setDeselectEditNonce] = useState(0);
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [deselectSwapNonce, setDeselectSwapNonce] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);

  function cycleLegacyJaw(dir: 1 | -1) {
    const idx = LEGACY_JAW_ORDER.indexOf(legacySelectedJaw);
    const next = (idx + dir + LEGACY_JAW_ORDER.length) % LEGACY_JAW_ORDER.length;
    setLegacySelectedJaw(LEGACY_JAW_ORDER[next]);
  }

  function cycleJaw(dir: 1 | -1) {
    const idx = JAW_ORDER.indexOf(selectedJaw);
    const next = (idx + dir + JAW_ORDER.length) % JAW_ORDER.length;
    onSelectedJawChange?.(JAW_ORDER[next]);
  }

  const handleAddTab = useCallback((label: string) => {
    const id = `tab-${nextTabId++}`;
    const newTab: TabData = { id, label, hasScanData: false };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(id);
  }, []);

  const handleDeleteTab = useCallback(
    (id: string) => {
      setTabs((prev) => {
        const tab = prev.find((t) => t.id === id);
        if (!tab || tab.hasScanData) return prev;

        const filtered = prev.filter((t) => t.id !== id);
        if (filtered.length === 0) return prev;

        if (activeTabId === id) {
          const oldIdx = prev.findIndex((t) => t.id === id);
          const nextActive = filtered[Math.min(oldIdx, filtered.length - 1)];
          setActiveTabId(nextActive.id);
        }
        return filtered;
      });
    },
    [activeTabId],
  );

  const handleStartEditing = useCallback(
    (tabId: string) => {
      const tab = tabs.find((t) => t.id === tabId);
      if (!tab) return;
      setEditingTabId(tabId);
      setEditDraft(tab.label);
    },
    [tabs],
  );

  const commitEdit = useCallback(() => {
    if (!editingTabId) return;
    const trimmed = editDraft.trim();
    if (trimmed) {
      setTabs((prev) =>
        prev.map((t) => (t.id === editingTabId ? { ...t, label: trimmed } : t)),
      );
    }
    setEditingTabId(null);
    setEditDraft("");
  }, [editingTabId, editDraft]);

  const handleKeyPress = useCallback(
    (key: string) => setEditDraft((prev) => prev + key),
    [],
  );

  const handleBackspace = useCallback(
    () => setEditDraft((prev) => prev.slice(0, -1)),
    [],
  );

  const handleCloseKeyboard = useCallback(() => {
    commitEdit();
  }, [commitEdit]);

  return (
    <div className="relative flex flex-col flex-1 min-h-0 min-w-0">
      <ScanTabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onTabChange={setActiveTabId}
        onAddTab={handleAddTab}
        onDeleteTab={handleDeleteTab}
        editingTabId={editingTabId}
        editDraft={editDraft}
        onStartEditing={handleStartEditing}
      />

      <div className="relative flex-1 min-h-0 min-w-0" style={{ backgroundColor: "var(--color-page-background)" }}>
        {/* 3D model viewport — fills entire area */}
        <div ref={viewportRef} className="absolute inset-0 overflow-hidden">
          <Suspense
            fallback={
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="tp-body-02 text-text-secondary">Loading 3D model…</span>
              </div>
            }
          >
            {isFixedRestorative ? (
              <PlyModelViewer26A
                key="fixed-restorative-scan"
                url={FIXED_RESTORATIVE_STL_PAIR.upperUrl}
                lowerUrl={FIXED_RESTORATIVE_STL_PAIR.lowerUrl}
                biteUrl={FIXED_RESTORATIVE_STL_PAIR.biteUrl}
                upperTextureUrl={FIXED_RESTORATIVE_STL_PAIR.upperTextureUrl}
                lowerTextureUrl={FIXED_RESTORATIVE_STL_PAIR.lowerTextureUrl}
                jawView={selectedJaw}
                viewMode={viewMode}
                cameraStateRef={cameraStateRef}
              />
            ) : (
              <PlyModelViewer url="/models/301538675_shell_occlusion_u.ply" viewMode={viewMode} cameraStateRef={cameraStateRef} />
            )}
          </Suspense>

          {isFixedRestorative && !prepEditOpen && (
            <ScanLongTapMenuOverlay26A enabled containerRef={viewportRef} />
          )}
        </div>

        {/* Top-left: tooth map — ToothMap26A for Fixed restorative (syncs with jaw selector like 26A) */}
        <div
          className="absolute z-10"
          style={
            isFixedRestorative
              ? {
                  top: 12,
                  left: 23,
                  display: "flex",
                  flexDirection: "column",
                  textAlign: "center",
                  justifyContent: "center",
                  alignItems: "center",
                }
              : { top: 12, left: 23 }
          }
        >
          {isFixedRestorative ? (
            <ToothMap26A
              className="shrink-0"
              selectedJaw={selectedJaw}
              onJawChange={(jaw) => onSelectedJawChange?.(jaw)}
              toothSelections={toothSelections}
            />
          ) : (
            <ToothMap className="shrink-0" />
          )}
        </div>

        {/* Left: jaw selector — 26A layout (240px) for Fixed restorative; legacy selector otherwise */}
        <div className="absolute z-10" style={{ left: 23, top: 418, width: isFixedRestorative ? 240 : undefined }}>
          {isFixedRestorative ? (
            <JawSelector26A
              selected={selectedJaw}
              onPrev={() => cycleJaw(-1)}
              onNext={() => cycleJaw(1)}
            />
          ) : (
            <JawSelector
              selected={legacySelectedJaw}
              onPrev={() => cycleLegacyJaw(-1)}
              onNext={() => cycleLegacyJaw(1)}
            />
          )}
        </div>

        {/* Right: floating toolbar */}
        <div
          className="absolute flex items-center justify-end"
          style={{ top: 12, right: 23, width: 603 }}
        >
          <ScanToolbar
            expanded={toolbarExpanded}
            onExpandedChange={onToolbarExpandedChange}
            activeTools={scanToolbarActiveTools}
            onActiveToolsChange={setScanToolbarActiveTools}
            deselectEditNonce={deselectEditNonce}
            deselectSwapNonce={deselectSwapNonce}
            onToolClick={(toolId, isActive) => {
              if (toolId === "edit") {
                setPrepEditOpen(isActive);
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
            <PrepEditPanel
              onClose={() => {
                setPrepEditOpen(false);
                setDeselectEditNonce((n) => n + 1);
              }}
              onSelect={() => {
                /* hook for Select action */
              }}
              onEraseAndScan={() => {
                /* hook for Erase and scan */
              }}
            />
          </div>
        )}
      </div>

      {editingTabId !== null && (
        <VirtualKeyboard
          onKeyPress={handleKeyPress}
          onBackspace={handleBackspace}
          onClose={handleCloseKeyboard}
        />
      )}

      {/* Swap scans — Figma 4291:158458 */}
      <SwapScansModal
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
