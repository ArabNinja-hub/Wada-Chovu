import { copy } from '../../content/copy.ts';
import { esc } from '../html.ts';
import { icon } from '../icons.ts';
import { renderStageSlot } from '../media.ts';
import { button, eyebrow } from '../ui.ts';

/**
 * Hero: headline and calls to action on the left, the arch-framed 3D stage on the right.
 * The arch echoes the supplied logo. On small screens the stage sits below the copy.
 */
export function renderHero(): string {
  const points = copy.hero.points
    .map((point) => `<li>${icon('check', 'hero__check')}<span>${esc(point)}</span></li>`)
    .join('');

  return `
<section class="hero" id="top" aria-labelledby="hero-title">
  <div class="container hero__grid">
    <div class="hero__copy" data-reveal>
      ${eyebrow(copy.hero.eyebrow)}
      <h1 class="display" id="hero-title">${esc(copy.hero.title)}</h1>
      <p class="lead">${esc(copy.hero.lead)}</p>
      <div class="cta-row">
        ${button({ href: '#enquiry', label: copy.hero.primaryCta, variant: 'primary', iconName: 'arrow' })}
        ${button({ href: '#categories', label: copy.hero.secondaryCta, variant: 'ghost' })}
      </div>
      <ul class="hero__points" aria-label="Highlights">${points}</ul>
    </div>
    <div class="hero__visual" data-reveal style="--d: 140ms">
      <div class="arch" aria-hidden="true"><span class="arch__sun"></span></div>
      ${renderStageSlot({
        scene: 'hero',
        fallback: 'photo.hero',
        label: copy.hero.visualLabel,
        className: 'hero__stage',
        fetchPriority: 'high',
      })}
    </div>
  </div>
</section>`;
}
