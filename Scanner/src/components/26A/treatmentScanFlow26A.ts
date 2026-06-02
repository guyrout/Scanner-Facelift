/**
 * 26A — treatment-based scan experience.
 *
 * Model paths are URLs under `public/` (served from site root).
 *
 * Default 26A jaw meshes come from OrthoCAD export PLY files copied to `public/models/`.
 * Bite view uses a combined bite mesh PLY (`Bite.ply`). Per-treatment overrides under
 * `/models/treatments/<id>/` are optional; until those exist,
 * every treatment falls back to the same upper/lower pair so Scan / View always load geometry
 * (default UI uses `fixed-restorative`).
 */

/**
 * Per-treatment mesh assets. Texture URLs are optional and only meaningful
 * for iTero-style PLY exports whose colour data lives in an external JPG
 * mapped via per-face texcoords. When absent, the viewer falls back to
 * vertex colours or a synthesised dental gradient.
 */
export interface TreatmentMeshAssets {
  upperUrl: string;
  lowerUrl: string;
  biteUrl: string;
  upperTextureUrl?: string;
  lowerTextureUrl?: string;
}

/** Default PLY pair — upper + lower jaws from OrthoCAD export. */
export const DEFAULT_ORTHOCAD_PLY_PAIR: TreatmentMeshAssets = {
  upperUrl: "/models/301538675_shell_occlusion_u.ply",
  lowerUrl: "/models/301538675_shell_occlusion_l.ply",
  biteUrl: "/models/Bite.ply",
};

/**
 * Fixed restorative — iTero ditch jaws with their matching texture JPGs.
 * Both arches are binary PLYs with per-face UV coords; colour comes from the
 * texture maps. Bite stays an STL (iTero doesn't export a textured bite).
 * Files live under `public/models/fixed-restorative/`.
 */
export const FIXED_RESTORATIVE_STL_PAIR: TreatmentMeshAssets = {
  upperUrl: "/models/fixed-restorative/upper_jaw_with_ditch_281175878.ply",
  lowerUrl: "/models/fixed-restorative/lower_jaw_with_ditch_281175878.ply",
  biteUrl: "/models/fixed-restorative/Bite.ply",
  upperTextureUrl: "/models/fixed-restorative/upper_jaw_with_ditch_281175878_texture.jpg",
  lowerTextureUrl: "/models/fixed-restorative/lower_jaw_with_ditch_281175878_texture.jpg",
};

/** Default when `treatmentId` is unknown — must resolve to existing files under `public/`. */
export const DEFAULT_TREATMENT_PLY = DEFAULT_ORTHOCAD_PLY_PAIR;

/**
 * One row per `TREATMENT_OPTIONS` id in `FixedRestorativeForm26A`.
 * Scan / View use `PlyModelViewer26A`, which loads PLY or STL via the same URLs.
 */
export const TREATMENT_3D_PLY: Record<string, TreatmentMeshAssets> = {
  "fixed-restorative": FIXED_RESTORATIVE_STL_PAIR,
  "study-model": DEFAULT_ORTHOCAD_PLY_PAIR,
  invisalign: DEFAULT_ORTHOCAD_PLY_PAIR,
  appliance: DEFAULT_ORTHOCAD_PLY_PAIR,
  "dentures-removable": DEFAULT_ORTHOCAD_PLY_PAIR,
  "surgical-guide": DEFAULT_ORTHOCAD_PLY_PAIR,
};

export function getTreatmentPlyPair(treatmentId: string): TreatmentMeshAssets {
  return TREATMENT_3D_PLY[treatmentId] ?? DEFAULT_TREATMENT_PLY;
}

/** Study model & Invisalign/Vivera labels use the default OrthoCAD pair by design. */
export function treatmentUsesInvisalignStudyStl(treatmentId: string): boolean {
  return treatmentId === "study-model" || treatmentId === "invisalign";
}

/**
 * Study Model/iRecord or Invisalign/Vivera — scan toolbar omits Edit + Swap;
 * view toolbar omits Prep qc + Margin line (fixed-restorative-only tools).
 */
export function treatmentRestrictsScanViewToolbarTools(treatmentId: string): boolean {
  return treatmentId === "study-model" || treatmentId === "invisalign";
}
