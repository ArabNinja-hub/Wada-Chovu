/**
 * Decides how much 3D work this device should do.
 *
 * - high:   desktop-class hardware. Full-resolution rendering, soft shadows, environment lighting.
 * - medium: phones and mid-range laptops. Reduced pixel ratio, shadows kept.
 * - low:    weak hardware. Blob shadows only, no environment map, lowest pixel ratio.
 * - none:   no WebGL, data saver, or reduced data. The static fallback images are used.
 */

export type QualityTier = 'high' | 'medium' | 'low' | 'none';

export interface QualityProfile {
  tier: QualityTier;
  /** Upper bound for devicePixelRatio when sizing the drawing buffer. */
  maxPixelRatio: number;
  /** Real-time shadow maps. */
  shadows: boolean;
  shadowMapSize: number;
  /** Image-based lighting from a generated room environment. */
  environment: boolean;
  /** When false, the stage keeps this tier even if frames are slow (used for forced testing). */
  adaptive: boolean;
}

export const PROFILES: Record<QualityTier, QualityProfile> = {
  high: { tier: 'high', maxPixelRatio: 2, shadows: true, shadowMapSize: 2048, environment: true, adaptive: true },
  medium: { tier: 'medium', maxPixelRatio: 1.5, shadows: true, shadowMapSize: 1024, environment: true, adaptive: true },
  low: { tier: 'low', maxPixelRatio: 1.25, shadows: false, shadowMapSize: 512, environment: false, adaptive: true },
  none: { tier: 'none', maxPixelRatio: 1, shadows: false, shadowMapSize: 512, environment: false, adaptive: true },
};

type NetworkInfo = { saveData?: boolean };
type NavigatorExtra = Navigator & { deviceMemory?: number; connection?: NetworkInfo };

function webglAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    if (!gl) return false;
    // Release the test context right away.
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export function detectQuality(forced: QualityTier | null = null): QualityProfile {
  // Development-only override (`?quality=high`) for reviewing the look on any machine.
  if (forced && forced !== 'none') {
    return { ...PROFILES[forced], adaptive: false };
  }

  const nav = navigator as NavigatorExtra;

  if (nav.connection?.saveData || matchMedia('(prefers-reduced-data: reduce)').matches) {
    return PROFILES.none;
  }
  if (!webglAvailable()) {
    return PROFILES.none;
  }

  const cores = nav.hardwareConcurrency || 4;
  const memory = nav.deviceMemory || 8;
  const coarsePointer = matchMedia('(pointer: coarse)').matches;

  if (cores <= 2 || memory <= 2) return PROFILES.low;
  if (coarsePointer || cores <= 4 || memory <= 4) return PROFILES.medium;
  return PROFILES.high;
}

/** Returns the next lower tier, used by the adaptive frame-rate guard. */
export function lowerTier(profile: QualityProfile): QualityProfile {
  if (profile.tier === 'high') return PROFILES.medium;
  if (profile.tier === 'medium') return PROFILES.low;
  return PROFILES.none;
}
