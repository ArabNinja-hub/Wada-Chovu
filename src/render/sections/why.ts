import { copy } from '../../content/copy.ts';
import { esc } from '../html.ts';
import { icon, type IconName } from '../icons.ts';
import { sectionHead } from '../ui.ts';

export function renderWhy(): string {
  const pillars = copy.why.pillars
    .map(
      (pillar, index) => `
    <li class="pillar" data-reveal style="--d: ${index * 90}ms">
      <span class="pillar__icon">${icon(pillar.icon as IconName)}</span>
      <h3 class="h4">${esc(pillar.title)}</h3>
      <p>${esc(pillar.text)}</p>
    </li>`,
    )
    .join('');

  return `
<section class="section why" id="why" aria-labelledby="why-title">
  <div class="container">
    ${sectionHead({
      eyebrow: copy.why.eyebrow,
      title: copy.why.title,
      lead: copy.why.lead,
      id: 'why-title',
    })}
    <ul class="pillar-grid" role="list">${pillars}</ul>
  </div>
</section>`;
}
