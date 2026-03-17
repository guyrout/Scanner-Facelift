/**
 * Scan tab bar — Figma 4138:125808, 4011:72300, 4138:125186, 4138:125817.
 * Dynamic tabs: default set + user-added tabs via + menu.
 * Features:
 *  - Add tabs via dropdown menu (Additional scan / Additional Bite types)
 *  - Close tabs with X button (only on the active tab, and only when it has no scan data)
 *  - Rename tabs: double-click opens VirtualKeyboard (rendered by parent)
 */

import { useState, useRef, useEffect, useCallback } from "react";
import additionalCentricSvg from "../assets/scan/additional-centric.svg";
import leftLateralSvg from "../assets/scan/left-lateral.svg";
import rightLateralSvg from "../assets/scan/right-lateral.svg";
import protrusiveSvg from "../assets/scan/protrusive.svg";
import retrusiveSvg from "../assets/scan/retrusive.svg";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface TabData {
  id: string;
  label: string;
  hasScanData: boolean;
}

export interface ScanTabBarProps {
  tabs: TabData[];
  activeTabId: string;
  onTabChange: (id: string) => void;
  onAddTab: (label: string) => void;
  onDeleteTab: (id: string) => void;
  /** The id of the tab currently being renamed (null = none). Controlled by parent. */
  editingTabId: string | null;
  /** The current draft text while renaming. Controlled by parent. */
  editDraft: string;
  /** Called on double-click of a tab label to start renaming. */
  onStartEditing: (tabId: string) => void;
}

/* ------------------------------------------------------------------ */
/*  Bite types for the submenu                                         */
/* ------------------------------------------------------------------ */

interface BiteType {
  id: string;
  label: string;
  icon: string;
}

const BITE_TYPES: BiteType[] = [
  { id: "additional-centric", label: "Additional Centric", icon: additionalCentricSvg },
  { id: "left-lateral", label: "Left lateral", icon: leftLateralSvg },
  { id: "right-lateral", label: "Right lateral", icon: rightLateralSvg },
  { id: "protrusive", label: "Protrusive", icon: protrusiveSvg },
  { id: "retrusive", label: "Retrusive", icon: retrusiveSvg },
];

/* ------------------------------------------------------------------ */
/*  Small icons                                                        */
/* ------------------------------------------------------------------ */

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M15 5L5 15M5 5L15 15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightSmall() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M9 18L15 12L9 6" stroke="var(--color-icon-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronDownSmall() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 9L12 15L18 9" stroke="var(--color-icon-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckboxIcon({ checked }: { checked: boolean }) {
  if (checked) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="2" y="2" width="20" height="20" rx="4" fill="var(--color-border-interactive)" />
        <path d="M7 12L10.5 15.5L17 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="2.5" y="2.5" width="19" height="19" rx="3.5" stroke="var(--color-border-accent)" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  ScanTabBar                                                         */
/* ------------------------------------------------------------------ */

export default function ScanTabBar({
  tabs,
  activeTabId,
  onTabChange,
  onAddTab,
  onDeleteTab,
  editingTabId,
  editDraft,
  onStartEditing,
}: ScanTabBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [biteExpanded, setBiteExpanded] = useState(false);
  const [selectedBites, setSelectedBites] = useState<Set<string>>(new Set());
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setBiteExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const toggleBite = useCallback((id: string) => {
    setSelectedBites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  function handleAddScan(label: string) {
    onAddTab(label);
    setMenuOpen(false);
    setBiteExpanded(false);
  }

  return (
    <div
      className="flex flex-col shrink-0 w-full border-b"
      style={{
        backgroundColor: "var(--color-background-layer-01)",
        borderColor: "var(--color-border-subtle)",
        paddingLeft: 24,
        paddingRight: 24,
        paddingTop: 4,
      }}
    >
      <div className="flex items-start w-full">
        <div className="flex items-start shrink-0">
          <div className="flex items-center shrink-0" style={{ gap: 16 }}>
            {tabs.map((tab) => {
              const isActive = activeTabId === tab.id;
              const isEditing = editingTabId === tab.id;
              const showClose = isActive && !tab.hasScanData;

              return (
                <div
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  className="tp-heading-01"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    height: 60,
                    paddingLeft: 8,
                    paddingRight: 8,
                    borderBottom: isActive
                      ? "2px solid var(--color-border-interactive)"
                      : "2px solid transparent",
                    color: isActive
                      ? "var(--color-text-primary)"
                      : "var(--color-text-secondary)",
                    fontWeight: isActive ? 500 : 400,
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    if (!isEditing) onTabChange(tab.id);
                  }}
                >
                  {isEditing ? (
                    <span
                      style={{
                        borderBottom: "2px solid var(--color-border-interactive)",
                        paddingBottom: 2,
                        minWidth: 40,
                      }}
                    >
                      {editDraft}
                      <span
                        style={{
                          display: "inline-block",
                          width: 2,
                          height: "1em",
                          backgroundColor: "var(--color-text-primary)",
                          marginLeft: 1,
                          verticalAlign: "text-bottom",
                          animation: "blink 1s step-end infinite",
                        }}
                      />
                    </span>
                  ) : (
                    <span
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        onStartEditing(tab.id);
                      }}
                    >
                      {tab.label}
                    </span>
                  )}

                  {showClose && !isEditing && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTab(tab.id);
                      }}
                      className="flex items-center justify-center cursor-pointer border-0 bg-transparent appearance-none outline-none transition-ui p-0"
                      style={{
                        width: 20,
                        height: 20,
                        color: "var(--color-text-primary)",
                        opacity: 0.6,
                        flexShrink: 0,
                      }}
                      aria-label={`Close ${tab.label} tab`}
                    >
                      <CloseIcon />
                    </button>
                  )}
                </div>
              );
            })}

            {/* + button inside the tabs row */}
            <div
              ref={menuRef}
              className="relative"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 60, height: 60 }}
            >
              <button
                type="button"
                onClick={() => {
                  if (menuOpen) {
                    setMenuOpen(false);
                    setBiteExpanded(false);
                  } else {
                    setMenuOpen(true);
                  }
                }}
                className="flex items-center justify-center cursor-pointer border-2 border-solid rounded-lg bg-[var(--color-background-layer-01)] appearance-none outline-none transition-ui focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2"
                style={{
                  borderColor: "var(--color-border-subtle)",
                  padding: 12,
                }}
                aria-label="Add scan tab"
                aria-expanded={menuOpen}
                aria-haspopup="menu"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M12 6V18M6 12H18" stroke="var(--color-icon-primary)" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    marginTop: 4,
                    width: 280,
                    padding: 4,
                    borderRadius: 8,
                    backgroundColor: "var(--color-background-elevated, white)",
                    border: "1px solid var(--color-border-subtle)",
                    boxShadow: "0px 2px 12px rgba(0, 0, 0, 0.13)",
                    zIndex: 50,
                  }}
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => handleAddScan("Additional scan")}
                    className="tp-body-02 cursor-pointer border-0 bg-transparent appearance-none outline-none w-full text-left transition-ui"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: 12,
                      borderRadius: 8,
                      color: "var(--color-text-primary)",
                      height: 52,
                    }}
                  >
                    Additional scan
                  </button>

                  <div style={{ height: 8, position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", left: 0, right: 0, top: 3, height: 1, backgroundColor: "var(--color-border-subtle)" }} />
                  </div>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => setBiteExpanded((prev) => !prev)}
                    className="tp-body-02 cursor-pointer border-0 bg-transparent appearance-none outline-none w-full text-left transition-ui"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: 12,
                      borderRadius: 8,
                      color: "var(--color-text-primary)",
                      height: 52,
                    }}
                    aria-expanded={biteExpanded}
                  >
                    <span>Additional Bite</span>
                    {biteExpanded ? <ChevronDownSmall /> : <ChevronRightSmall />}
                  </button>

                  {biteExpanded && (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {BITE_TYPES.map((bite) => {
                        const checked = selectedBites.has(bite.id);
                        return (
                          <button
                            key={bite.id}
                            type="button"
                            role="menuitemcheckbox"
                            aria-checked={checked}
                            onClick={() => {
                              toggleBite(bite.id);
                              handleAddScan(bite.label);
                            }}
                            className="tp-body-02 cursor-pointer border-0 bg-transparent appearance-none outline-none w-full text-left transition-ui"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              padding: 12,
                              borderRadius: 8,
                              color: "var(--color-text-primary)",
                              height: 52,
                            }}
                          >
                            <CheckboxIcon checked={checked} />
                            <img
                              src={bite.icon}
                              alt=""
                              aria-hidden
                              width={40}
                              height={40}
                              style={{ borderRadius: 4, objectFit: "contain" }}
                            />
                            <span>{bite.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
