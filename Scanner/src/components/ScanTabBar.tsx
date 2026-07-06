/**
 * Scan tab bar — Figma UI-Facelift-2026 Q2 (nodes 5605:149798, 5605:148016).
 * Dynamic tabs: default set + user-added tabs via + menu.
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

function tabGroupBorderClass(index: number, total: number): string {
  if (index === 0) return "";
  if (index === total - 1 && total > 2) {
    return "border-r border-[var(--color-border-subtle)]";
  }
  return "border-x border-[var(--color-border-subtle)]";
}

/* ------------------------------------------------------------------ */
/*  Small icons                                                        */
/* ------------------------------------------------------------------ */

function CloseEmptyIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M18 7.05L16.95 6L12 10.95L7.05 6L6 7.05L10.95 12L6 16.95L7.05 18L12 13.05L16.95 18L18 16.95L13.05 12L18 7.05Z"
        fill="currentColor"
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
      className="flex w-full shrink-0 items-center gap-3 border-b border-[var(--color-border-subtle)] bg-[var(--color-background-layer-01)] pr-6"
      data-node-id="5605:149798"
    >
      <div className="flex min-w-0 flex-wrap items-start gap-3">
        <div className="flex shrink-0 items-center">
          {tabs.map((tab, index) => {
            const isActive = activeTabId === tab.id;
            const isEditing = editingTabId === tab.id;
            const showClose = index > 0 && !tab.hasScanData && !isActive;

            return (
              <div
                key={tab.id}
                className={`flex shrink-0 items-center ${index === 0 ? "w-[161px]" : ""}`}
              >
                <div
                  className={`flex w-full shrink-0 items-center ${tabGroupBorderClass(index, tabs.length)}`}
                >
                  <div
                    role="tab"
                    aria-selected={isActive}
                    className={`tp-headling-02 flex h-[60px] shrink-0 cursor-pointer items-center justify-center whitespace-nowrap px-4 ${
                      index === 0 ? "w-full" : ""
                    } ${
                      isActive
                        ? "border-b-2 border-[var(--color-border-interactive)] text-text-primary"
                        : "text-text-secondary"
                    } ${showClose ? "gap-2" : ""}`}
                    onClick={() => {
                      if (!isEditing) onTabChange(tab.id);
                    }}
                  >
                    {isEditing ? (
                      <span className="inline-flex min-w-[40px] items-baseline border-b-2 border-[var(--color-border-interactive)] pb-0.5">
                        {editDraft}
                        <span
                          className="ml-px inline-block h-[1em] w-0.5 animate-[blink_1s_step-end_infinite] bg-text-primary align-text-bottom"
                          aria-hidden
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
                        className="flex size-6 shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-text-primary outline-none transition-ui focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-1"
                        aria-label={`Close ${tab.label} tab`}
                      >
                        <CloseEmptyIcon />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add tab — Figma 5605:149718 */}
        <div ref={menuRef} className="relative flex size-[60px] shrink-0 items-center justify-center">
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
            className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-solid border-[var(--color-border-subtle)] bg-[var(--color-background-layer-01)] p-3 outline-none transition-ui focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2"
            aria-label="Add scan tab"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M12 6V18M6 12H18"
                stroke="var(--color-icon-primary)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute left-0 top-full z-50 mt-1 w-[280px] rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-background-elevated,white)] p-1"
              style={{ boxShadow: "0px 2px 12px rgba(0, 0, 0, 0.13)" }}
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => handleAddScan("Additional scan")}
                className="tp-body-02 flex h-[52px] w-full cursor-pointer items-center rounded-lg border-0 bg-transparent px-3 text-left text-text-primary outline-none transition-ui hover:bg-[var(--color-background-layer-hovered)]"
              >
                Additional scan
              </button>

              <div className="relative h-2 overflow-hidden">
                <div className="absolute inset-x-0 top-[3px] h-px bg-[var(--color-border-subtle)]" aria-hidden />
              </div>

              <button
                type="button"
                role="menuitem"
                onClick={() => setBiteExpanded((prev) => !prev)}
                className="tp-body-02 flex h-[52px] w-full cursor-pointer items-center justify-between rounded-lg border-0 bg-transparent px-3 text-left text-text-primary outline-none transition-ui hover:bg-[var(--color-background-layer-hovered)]"
                aria-expanded={biteExpanded}
              >
                <span>Additional Bite</span>
                {biteExpanded ? <ChevronDownSmall /> : <ChevronRightSmall />}
              </button>

              {biteExpanded && (
                <div className="flex flex-col">
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
                        className="tp-body-02 flex h-[52px] w-full cursor-pointer items-center gap-2 rounded-lg border-0 bg-transparent px-3 text-left text-text-primary outline-none transition-ui hover:bg-[var(--color-background-layer-hovered)]"
                      >
                        <CheckboxIcon checked={checked} />
                        <img
                          src={bite.icon}
                          alt=""
                          aria-hidden
                          width={40}
                          height={40}
                          className="shrink-0 rounded object-contain"
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
  );
}
