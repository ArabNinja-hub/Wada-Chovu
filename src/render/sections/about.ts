import { copy } from '../../content/copy.ts';
import { esc } from '../html.ts';
import { icon } from '../icons.ts';
import { renderImage } from '../media.ts';
import { button, eyebrow } from '../ui.ts';

export function renderAbout(): string {
  const paragraphs = copy.about.paragraphs.map((text) => `<p>${esc(text)}</p>`).join('');
  const points = copy.about.points
    .map((point) => `<li>${icon('check', 'check-list__icon')}<span>${esc(point)}</span></li>`)
    .join('');

  return `
<section class="section about" id="about" aria-labelledby="about-title">
  <div class="container about__grid">
    <div class="about__media" data-reveal>
      ${renderImage('about.image', { className: 'media--arch', ratio: '4 / 5' })}
    </div>
    <div class="about__copy" data-reveal style="--d: 100ms">
      ${eyebrow(copy.about.eyebrow)}
      <h2 class="h2" id="about-title">${esc(copy.about.title)}</h2>
      <div class="prose">${paragraphs}</div>
      <ul class="check-list">${points}</ul>
      <div class="cta-row">
        ${button({ href: '#enquiry', label: copy.hero.primaryCta, variant: 'primary', iconName: 'arrow' })}
      </div>
    </div>
  </div>
</section>`;
}
