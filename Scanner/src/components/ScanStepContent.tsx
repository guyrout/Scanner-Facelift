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

import { useState, useCallback, lazy, Suspense, type MutableRefObject } from "react";
import ScanTabBar, { type TabData } from "./ScanTabBar";
import ScanToolbar from "./ScanToolbar";
import ToothMap from "./ToothMap";
import JawSelector, { type JawSelection } from "./JawSelector";
import VirtualKeyboard from "./VirtualKeyboard";
import type { ViewMode, CameraState } from "./PlyModelViewer";

const PlyModelViewer = lazy(() => import("./PlyModelViewer"));

const JAW_ORDER: JawSelection[] = ["upper", "lower", "both"];

const DEFAULT_TABS: TabData[] = [
  { id: "pre-treatment", label: "Pre-treatment", hasScanData: false },
  { id: "treatment-scan", label: "Treatment Scan", hasScanData: false },
  { id: "additional-scan", label: "Additional scan", hasScanData: false },
];

let nextTabId = 1;

interface ScanStepContentProps {
  toolbarExpanded?: boolean;
  onToolbarExpandedChange?: (expanded: boolean) => void;
  cameraStateRef?: MutableRefObject<CameraState>;
}

export default function ScanStepContent({ toolbarExpanded, onToolbarExpandedChange, cameraStateRef }: ScanStepContentProps) {
  const [tabs, setTabs] = useState<TabData[]>(DEFAULT_TABS);
  const [activeTabId, setActiveTabId] = useState(DEFAULT_TABS[0].id);
  const [selectedJaw, setSelectedJaw] = useState<JawSelection>("upper");

  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("color");

  function cycleJaw(dir: 1 | -1) {
    const idx = JAW_ORDER.indexOf(selectedJaw);
    const next = (idx + dir + JAW_ORDER.length) % JAW_ORDER.length;
    setSelectedJaw(JAW_ORDER[next]);
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
        <div className="absolute inset-0 overflow-hidden">
          <Suspense
            fallback={
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="tp-body-02 text-text-secondary">Loading 3D model…</span>
              </div>
            }
          >
            <PlyModelViewer url="/models/upper-jaw.ply" viewMode={viewMode} cameraStateRef={cameraStateRef} />
          </Suspense>
        </div>

        {/* Top-left: tooth map */}
        <div className="absolute z-10" style={{ top: 12, left: 23 }}>
          <ToothMap className="shrink-0" />
        </div>

        {/* Left: jaw selector */}
        <div className="absolute z-10" style={{ left: 23, top: 418 }}>
          <JawSelector
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
          <ScanToolbar
            expanded={toolbarExpanded}
            onExpandedChange={onToolbarExpandedChange}
            onToolClick={(toolId, isActive) => {
              if (toolId === "scan-color") {
                setViewMode(isActive ? "stone" : "color");
              }
            }}
          />
        </div>

        {/* Bottom-left: camera preview */}
        <div
          className="absolute"
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
        />
      </div>

      {editingTabId !== null && (
        <VirtualKeyboard
          onKeyPress={handleKeyPress}
          onBackspace={handleBackspace}
          onClose={handleCloseKeyboard}
        />
      )}
    </div>
  );
}
