/**
 * Occlusal heatmap shader for dental pressure/occlusion visualization.
 * Blue → cyan → green → yellow → red gradient.
 * Heat intensity computed from distance to pressure points.
 */

import * as THREE from "three";

/** Heat point: position in model space + intensity strength (0–1). */
export interface HeatPoint {
  position: THREE.Vector3;
  strength: number;
}

/**
 * Generate heat points from occlusal vertices to simulate pressure contacts.
 * Uses dense 9-bin grid (3x3) to ensure complete coverage of all teeth surfaces.
 */
export function generateHeatPoints(
  pos: THREE.BufferAttribute,
  isOcclusal: boolean[],
  count: number = 80,
): HeatPoint[] {
  const points: THREE.Vector3[] = [];
  let minX = Infinity, maxX = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;
  for (let i = 0; i < pos.count; i++) {
    if (!isOcclusal[i]) continue;
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    points.push(new THREE.Vector3(x, y, z));
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minZ = Math.min(minZ, z);
    maxZ = Math.max(maxZ, z);
  }
  if (points.length === 0) return [];

  const rangeX = maxX - minX || 1;
  const rangeZ = maxZ - minZ || 1;
  
  const bins: THREE.Vector3[][] = Array.from({ length: 9 }, () => []);
  for (const p of points) {
    const tx = (p.x - minX) / rangeX;
    const tz = (p.z - minZ) / rangeZ;
    const xBin = tx < 0.33 ? 0 : tx < 0.67 ? 1 : 2;
    const zBin = tz < 0.33 ? 0 : tz < 0.67 ? 1 : 2;
    const bin = zBin * 3 + xBin;
    bins[bin].push(p);
  }

  const result: HeatPoint[] = [];
  const minDist = 0.08;
  const taken: THREE.Vector3[] = [];

  for (const bin of bins) {
    bin.sort((a, b) => b.y - a.y);
    for (const p of bin) {
      if (result.length >= count) break;
      const tooClose = taken.some((t) => p.distanceTo(t) < minDist);
      if (tooClose) continue;
      taken.push(p.clone());
      result.push({
        position: p.clone(),
        strength: 0.75 + Math.random() * 0.25,
      });
    }
  }

  if (result.length < count) {
    const all = bins.flat().sort((a, b) => b.y - a.y);
    const step = Math.max(1, Math.floor(all.length / (count - result.length)));
    for (let i = 0; i < all.length && result.length < count; i += step) {
      const p = all[i];
      const tooClose = taken.some((t) => p.distanceTo(t) < minDist * 0.7);
      if (!tooClose) {
        taken.push(p.clone());
        result.push({
          position: p.clone(),
          strength: 0.65 + Math.random() * 0.35,
        });
      }
    }
  }

  return result;
}

/**
 * Compute per-vertex heat intensity from heat points.
 * Uses Gaussian falloff: intensity += strength * exp(-d² / (2 * sigma²))
 * Applies boosted normalization to make colors more visible.
 */
export function computeHeatIntensity(
  pos: THREE.BufferAttribute,
  heatPoints: HeatPoint[],
  sigma: number = 0.25,
): Float32Array {
  const count = pos.count;
  const intensity = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const vz = pos.getZ(i);
    let sum = 0;
    for (const hp of heatPoints) {
      const dx = vx - hp.position.x;
      const dy = vy - hp.position.y;
      const dz = vz - hp.position.z;
      const d2 = dx * dx + dy * dy + dz * dz;
      const g = Math.exp(-d2 / (2 * sigma * sigma));
      sum += hp.strength * g;
    }
    intensity[i] = sum;
  }

  let maxVal = 0;
  for (let i = 0; i < count; i++) {
    if (intensity[i] > maxVal) maxVal = intensity[i];
  }
  if (maxVal > 0.0001) {
    for (let i = 0; i < count; i++) {
      const t = intensity[i] / maxVal;
      intensity[i] = Math.pow(t, 0.75);
    }
  }
  return intensity;
}

/** Vertex shader: pass position, normal, heat intensity, base color. */
export const vertexShader = `
  attribute float heatIntensity;
  attribute vec3 baseColor;
  varying float vHeatIntensity;
  varying vec3 vBaseColor;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vHeatIntensity = heatIntensity;
    vBaseColor = baseColor;
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

/** Fragment shader: blend base color with heatmap on occlusal surfaces. */
export const fragmentShader = `
  uniform float heatOpacity;

  varying float vHeatIntensity;
  varying vec3 vBaseColor;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  vec3 heatMapColor(float t) {
    float r, g, b;
    if (t < 0.25) {
      float u = t / 0.25;
      r = 0.0;
      g = u;
      b = 1.0;
    } else if (t < 0.5) {
      float u = (t - 0.25) / 0.25;
      r = 0.0;
      g = 1.0;
      b = 1.0 - u;
    } else if (t < 0.75) {
      float u = (t - 0.5) / 0.25;
      r = u;
      g = 1.0;
      b = 0.0;
    } else {
      float u = (t - 0.75) / 0.25;
      r = 1.0;
      g = 1.0 - u;
      b = 0.0;
    }
    float satBoost = 1.6;
    float L = (r + g + b) / 3.0;
    if (L > 0.001) {
      r = clamp(L + (r - L) * satBoost, 0.0, 1.0);
      g = clamp(L + (g - L) * satBoost, 0.0, 1.0);
      b = clamp(L + (b - L) * satBoost, 0.0, 1.0);
    }
    return vec3(r, g, b);
  }

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.0);

    vec3 heatColor = heatMapColor(clamp(vHeatIntensity, 0.0, 1.0));
    vec3 base = vBaseColor;

    float blend = vHeatIntensity > 0.001 ? 1.0 * heatOpacity : 0.0;
    blend = mix(blend, blend * (1.0 - fresnel * 0.1), 0.2);

    vec3 color = mix(base, heatColor, blend);

    vec3 lightDir = normalize(vec3(0.4, 0.8, 0.5));
    float diff = max(dot(normal, lightDir), 0.0);
    color *= 0.6 + 0.4 * diff;

    gl_FragColor = vec4(color, 1.0);
  }
`;

/** Create the occlusal heatmap ShaderMaterial. */
export function createHeatmapMaterial(
  heatOpacity: number = 1,
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      heatOpacity: { value: heatOpacity },
    },
    side: THREE.DoubleSide,
  });
}
