/**
 * ScanFlowVersionManager — Manages switching between Scan flow versions 26A and 26B.
 * Persists the selected version in localStorage and provides a simple API for
 * getting/setting the active version.
 */

export type ScanFlowVersion = "26A" | "26B";

const STORAGE_KEY = "scanner-scanflow-version";
const DEFAULT_VERSION: ScanFlowVersion = "26B";

export function getScanFlowVersion(): ScanFlowVersion {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "26A" || stored === "26B") {
      return stored;
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_VERSION;
}

export function setScanFlowVersion(version: ScanFlowVersion): void {
  try {
    localStorage.setItem(STORAGE_KEY, version);
  } catch {
    /* ignore */
  }
}
