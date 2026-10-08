import { site } from '../content/site.ts';
import { initEnquiryForm } from './enquiry-form.ts';
import { initHeader } from './header.ts';
import { detectQuality, type QualityTier } from './quality.ts';
import { initReveal } from './reveal.ts';

/**
 * Client entry point. Everything here is progressive enhancement: the page is complete and
 * usable before this runs. Each step is independent, so one failure cannot break the others.
 */
function boot(): void {
  initHeader();
  initReveal();
  initEnquiryForm();
  void startThreeD();
}

/**
 * Loads the 3D stage only when this device can run it and the site has it enabled. The
 * three.js bundle is fetched on demand. If anything fails, the static images stay in place.
 */
async function startThreeD(): Promise<void> {
  if (!site.features.threeD) return;
  const slots = Array.from(document.querySelectorAll<HTMLElement>('[data-stage]'));
  if (slots.length === 0) return;

  const profile = detectQuality(devQualityOverride());
  if (profile.tier === 'none') return;

  try {
    const { mountStage } = await import('../three/stage.ts');
    mountStage(slots, profile);
  } catch (error) {
    console.warn('3D scenes are unavailable; the static images remain in place.', error);
  }
}

/** `?quality=high|medium|low` is honoured in development only, so the look can be reviewed on any machine. */
function devQualityOverride(): QualityTier | null {
  if (!import.meta.env.DEV) return null;
  const value = new URLSearchParams(window.location.search).get('quality');
  return value === 'high' || value === 'medium' || value === 'low' ? value : null;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
