import { copy } from '../../content/copy.ts';
import { esc } from '../html.ts';
import { icon } from '../icons.ts';
import { button, eyebrow } from '../ui.ts';

/**
 * Hero: headline and calls to action.
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
  </div>
</section>`;
}
