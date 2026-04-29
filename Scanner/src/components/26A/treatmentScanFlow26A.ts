/**
 * 26A — treatment-based scan experience.
 *
 * Model paths are URLs under `public/` (served from site root).
 *
 * Default 26A jaw meshes come from OrthoCAD export PLY files copied to `public/models/`.
 * Per-treatment PLY/STL files under `/models/treatments/<id>/` are optional; until those exist,
 * every treatment falls back to the same upper/lower pair so Scan / View always load geometry
 * (default UI uses `fixed-restorative`).
 */

/** Default PLY pair — upper + lower jaws from OrthoCAD export. */
export const DEFAULT_ORTHOCAD_PLY_PAIR = {
  upperUrl: "/models/301538675_shell_occlusion_u.ply",
  lowerUrl: "/models/301538675_shell_occlusion_l.ply",
  // Bite scene currently uses STL loader in BiteOcclusionScene26A, so keep bite STL asset.
  biteUrl: "/models/treatments/invisalign-study-stl/bite_view.stl",
} as const;

/** Default when `treatmentId` is unknown — must resolve to existing files under `public/`. */
export const DEFAULT_TREATMENT_PLY = DEFAULT_ORTHOCAD_PLY_PAIR;

/**
 * One row per `TREATMENT_OPTIONS` id in `FixedRestorativeForm26A`.
 * Swap URLs when dedicated assets exist; until then all rows use the shipped STL pair.
 */
export const TREATMENT_3D_PLY: Record<string, { upperUrl: string; lowerUrl: string; biteUrl: string }> = {
  "fixed-restorative": DEFAULT_ORTHOCAD_PLY_PAIR,
  "study-model": DEFAULT_ORTHOCAD_PLY_PAIR,
  invisalign: DEFAULT_ORTHOCAD_PLY_PAIR,
  appliance: DEFAULT_ORTHOCAD_PLY_PAIR,
  "dentures-removable": DEFAULT_ORTHOCAD_PLY_PAIR,
  "surgical-guide": DEFAULT_ORTHOCAD_PLY_PAIR,
};

export function getTreatmentPlyPair(treatmentId: string): {
  upperUrl: string;
  lowerUrl: string;
  biteUrl: string;
} {
  return TREATMENT_3D_PLY[treatmentId] ?? DEFAULT_TREATMENT_PLY;
}

/** Study model & Invisalign/Vivera labels use the default OrthoCAD pair by design. */
export function treatmentUsesInvisalignStudyStl(treatmentId: string): boolean {
  return treatmentId === "study-model" || treatmentId === "invisalign";
}
