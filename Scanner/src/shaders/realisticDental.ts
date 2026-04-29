/**
 * Realistic dental shader — enamel + gingiva PBR-like appearance.
 *
 * Per-vertex `toothFactor` attribute (0.0 = gingiva, 1.0 = enamel) drives:
 *  - Color blend: coral pink gum ↔ warm cream tooth
 *  - Specular/shininess: matte soft tissue ↔ glossy enamel
 *  - Fresnel rim: absent for gums, present for enamel (mimics translucency)
 *  - Warm SSS hint: subtle back-lit scatter for gingiva only
 *
 * Segmentation strategy:
 *  - PLY with real vertex colors: pink/red vertices → gingiva (same logic as occlusal heatmap)
 *  - STL or uniform stone colors: Y-position gradient around mesh midpoint
 */

import * as THREE from "three";

// Stone color components (#e5d5c0) — used to detect synthetic vertex colors
const STONE_R = 0.898;
const STONE_G = 0.835;
const STONE_B = 0.753;

function hasRealVertexColors(geometry: THREE.BufferGeometry): boolean {
  const color = geometry.getAttribute("color") as THREE.BufferAttribute | null;
  if (!color) return false;
  const checkCount = Math.min(color.count, 500);
  for (let i = 0; i < checkCount; i++) {
    if (
      Math.abs(color.getX(i) - STONE_R) > 0.06 ||
      Math.abs(color.getY(i) - STONE_G) > 0.06 ||
      Math.abs(color.getZ(i) - STONE_B) > 0.06
    )
      return true;
  }
  return false;
}

/**
 * Clones `geometry` and adds a `toothFactor` Float32 attribute (per vertex).
 * 1.0 = tooth enamel, 0.0 = gingiva.
 *
 * Classification:
 *  - Real vertex colors present → pink/red vertex = gingiva, else tooth
 *  - No real colors (STL) → smooth gradient across Y midpoint (heuristic)
 */
export function buildRealisticGeometry(
  geometry: THREE.BufferGeometry,
): THREE.BufferGeometry {
  const pos = geometry.getAttribute("position") as THREE.BufferAttribute;
  const color = geometry.getAttribute("color") as THREE.BufferAttribute | null;
  const count = pos.count;
  const clone = geometry.clone();
  const toothFactor = new Float32Array(count);

  if (color && hasRealVertexColors(geometry)) {
    // PLY with real colors: classify by gingiva color signature
    for (let i = 0; i < count; i++) {
      const r = color.getX(i);
      const g = color.getY(i);
      const b = color.getZ(i);
      const isGingiva = r > 0.5 && r > g && r > b && r - Math.min(g, b) > 0.2;
      toothFactor[i] = isGingiva ? 0.0 : 1.0;
    }
  } else {
    // STL / no real colors: soft Y-gradient (upper Y half → tooth)
    let yMin = Infinity,
      yMax = -Infinity;
    for (let i = 0; i < count; i++) {
      const y = pos.getY(i);
      if (y < yMin) yMin = y;
      if (y > yMax) yMax = y;
    }
    const range = yMax - yMin || 1;
    const yMid = (yMin + yMax) * 0.5;
    const halfBlend = range * 0.12; // 24 % blend zone centred on midpoint
    for (let i = 0; i < count; i++) {
      const t = (pos.getY(i) - (yMid - halfBlend)) / (2 * halfBlend);
      toothFactor[i] = Math.max(0, Math.min(1, t));
    }
  }

  clone.setAttribute("toothFactor", new THREE.BufferAttribute(toothFactor, 1));
  return clone;
}

// ---------------------------------------------------------------------------
// GLSL shaders
// ---------------------------------------------------------------------------

const vertexShader = /* glsl */ `
  attribute float toothFactor;
  varying float vToothFactor;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    vToothFactor = toothFactor;
    vNormal      = normalize(normalMatrix * normal);
    vec4 mv      = modelViewMatrix * vec4(position, 1.0);
    vViewDir     = normalize(-mv.xyz);
    gl_Position  = projectionMatrix * mv;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3  uToothColor;
  uniform vec3  uGingivaColor;
  uniform float uOpacity;

  varying float vToothFactor;
  varying vec3  vNormal;
  varying vec3  vViewDir;

  void main() {
    vec3  N = normalize(vNormal);
    vec3  V = normalize(vViewDir);
    float t = vToothFactor;

    // Base color blend: gingiva ↔ enamel
    vec3 baseColor = mix(uGingivaColor, uToothColor, t);

    // ---------- scene lights (mirroring Canvas setup) ----------
    vec3 L1 = normalize(vec3( 3.0, 10.0,  5.0)); // key   intensity 1.5
    vec3 L2 = normalize(vec3(-5.0,  3.0, -2.0)); // fill  intensity 0.5
    vec3 L3 = normalize(vec3( 0.0, -2.0,  5.0)); // bottom intensity 0.3

    float d1 = max(dot(N, L1), 0.0) * 1.5;
    float d2 = max(dot(N, L2), 0.0) * 0.5;
    float d3 = max(dot(N, L3), 0.0) * 0.3;

    // Hemisphere sky/ground (white / mid-gray, intensity 0.4)
    float upness   = N.y * 0.5 + 0.5;
    float hemiDiff = mix(0.30, 0.40, upness); // ground 0.30 → sky 0.40

    float ambient  = 0.60; // matches ambientLight intensity

    // Diffuse
    vec3 diffuse = baseColor * (ambient + (d1 + d2 + d3) * 0.65 + hemiDiff);

    // ---------- Specular — Blinn-Phong on key light ----------
    float shininess = mix(14.0, 128.0, t);          // gingiva dull → enamel glossy
    vec3  H1        = normalize(L1 + V);
    float spec      = pow(max(dot(N, H1), 0.0), shininess);
    float specStr   = mix(0.04, 0.55, t);           // enamel much more specular

    // ---------- Fresnel — enamel translucency / rim ----------
    float NdotV     = max(dot(N, V), 0.0);
    float fresnel   = pow(1.0 - NdotV, 3.5);
    float fresnelStr = mix(0.0, 0.22, t);

    // ---------- Gingiva: warm subsurface scatter hint ----------
    float backlit = max(dot(N, -L1), 0.0) * 0.10 * (1.0 - t);
    vec3  sss     = uGingivaColor * backlit * 1.5;

    vec3 color =
        diffuse
      + vec3(1.00, 0.97, 0.93) * spec      * specStr
      + vec3(0.93, 0.96, 1.00) * fresnel   * fresnelStr
      + sss;

    gl_FragColor = vec4(color, uOpacity);
  }
`;

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createRealisticDentalMaterial(opacity = 1): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uToothColor:   { value: new THREE.Color(0.941, 0.878, 0.784) }, // #F0E0C8 — warm cream
      uGingivaColor: { value: new THREE.Color(0.784, 0.431, 0.392) }, // #C86E64 — coral pink
      uOpacity:      { value: opacity },
    },
    vertexShader,
    fragmentShader,
    side: THREE.DoubleSide,
    transparent: opacity < 1,
  });
}
