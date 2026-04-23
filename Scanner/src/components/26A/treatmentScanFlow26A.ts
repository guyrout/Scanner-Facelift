/**
 * 26A — treatment-based scan experience.
 *
 * Each order treatment is mapped to its own upper/lower PLY pair so Scan / View / Send
 * can show the correct 3D assets when the user’s treatment selection changes.
 *
 * Place model files under `public/` (served as absolute paths below). If an entry is
 * missing at runtime, the PLY loader will error until the asset is added.
 */

/** Default pair used when an unknown `treatmentId` is present (e.g. legacy data). */
export const DEFAULT_TREATMENT_PLY = {
  upperUrl: "/models/upper-jaw.ply",
  lowerUrl: "/models/lower-jaw.ply",
} as const;

/**
 * One row per `TREATMENT_OPTIONS` id in `FixedRestorativeForm26A`.
 * Swap paths when per-treatment assets are available.
 */
export const TREATMENT_3D_PLY: Record<string, { upperUrl: string; lowerUrl: string }> = {
  "fixed-restorative": {
    upperUrl: "/models/treatments/fixed-restorative/upper.ply",
    lowerUrl: "/models/treatments/fixed-restorative/lower.ply",
  },
  "study-model": {
    upperUrl: "/models/treatments/study-model/upper.ply",
    lowerUrl: "/models/treatments/study-model/lower.ply",
  },
  invisalign: {
    upperUrl: "/models/treatments/invisalign/upper.ply",
    lowerUrl: "/models/treatments/invisalign/lower.ply",
  },
  appliance: {
    upperUrl: "/models/treatments/appliance/upper.ply",
    lowerUrl: "/models/treatments/appliance/lower.ply",
  },
  "dentures-removable": {
    upperUrl: "/models/treatments/dentures-removable/upper.ply",
    lowerUrl: "/models/treatments/dentures-removable/lower.ply",
  },
  "surgical-guide": {
    upperUrl: "/models/treatments/surgical-guide/upper.ply",
    lowerUrl: "/models/treatments/surgical-guide/lower.ply",
  },
};

export function getTreatmentPlyPair(treatmentId: string): { upperUrl: string; lowerUrl: string } {
  return TREATMENT_3D_PLY[treatmentId] ?? DEFAULT_TREATMENT_PLY;
}
