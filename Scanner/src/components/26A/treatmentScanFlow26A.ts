/**
 * 26A — treatment-based scan experience.
 *
 * Model paths are URLs under `public/` (served from site root).
 *
 * The repo currently ships one iTero STL pair (`invisalign-study-stl/`). Per-treatment PLY/STL
 * files under `/models/treatments/<id>/` are optional; until those exist, every treatment falls
 * back to the same pair so Scan / View always load geometry (default UI uses `fixed-restorative`).
 */

/** Shipped STL pair — upper + lower jaws. */
export const INVISALIGN_STUDY_STL_PAIR = {
  upperUrl: "/models/treatments/invisalign-study-stl/upper_arch_view.stl",
  lowerUrl: "/models/treatments/invisalign-study-stl/lower_arch_view.stl",
  biteUrl: "/models/treatments/invisalign-study-stl/bite_view.stl",
} as const;

/** Default when `treatmentId` is unknown — must resolve to existing files under `public/`. */
export const DEFAULT_TREATMENT_PLY = INVISALIGN_STUDY_STL_PAIR;

/**
 * One row per `TREATMENT_OPTIONS` id in `FixedRestorativeForm26A`.
 * Swap URLs when dedicated assets exist; until then all rows use the shipped STL pair.
 */
export const TREATMENT_3D_PLY: Record<string, { upperUrl: string; lowerUrl: string; biteUrl: string }> = {
  "fixed-restorative": INVISALIGN_STUDY_STL_PAIR,
  "study-model": INVISALIGN_STUDY_STL_PAIR,
  invisalign: INVISALIGN_STUDY_STL_PAIR,
  appliance: INVISALIGN_STUDY_STL_PAIR,
  "dentures-removable": INVISALIGN_STUDY_STL_PAIR,
  "surgical-guide": INVISALIGN_STUDY_STL_PAIR,
};

export function getTreatmentPlyPair(treatmentId: string): {
  upperUrl: string;
  lowerUrl: string;
  biteUrl: string;
} {
  return TREATMENT_3D_PLY[treatmentId] ?? DEFAULT_TREATMENT_PLY;
}

/** Study model & Invisalign/Vivera labels use this pair by design (same URLs as fallback). */
export function treatmentUsesInvisalignStudyStl(treatmentId: string): boolean {
  return treatmentId === "study-model" || treatmentId === "invisalign";
}
