import { copy } from '../../content/copy.ts';
import { esc } from '../html.ts';
import { icon } from '../icons.ts';
import { renderStageSlot } from '../media.ts';
import { eyebrow } from '../ui.ts';

/**
 * Dark band with the warehouse 3D scene. The copy sits above the stage, so the
 * 3D composition never overlaps text.
 */
export function renderScale(): string {
  const points = copy.scale.points
    .map((point) => `<li>${icon('check', 'check-list__icon')}<span>${esc(point)}</span></li>`)
    .join('');

  return `
<section class="section band-dark scale" id="scale" aria-labelledby="scale-title">
  <div class="container scale__grid">
    <div class="scale__copy" data-reveal>
      ${eyebrow(copy.scale.eyebrow, 'dark')}
      <h2 class="h2 on-dark" id="scale-title">${esc(copy.scale.title)}</h2>
      <p class="lead on-dark-muted">${esc(copy.scale.lead)}</p>
      <ul class="check-list check-list--dark scale__points">${points}</ul>
    </div>
    <div class="scale__stage" data-reveal style="--d: 120ms">
      ${renderStageSlot({
        scene: 'scale',
        fallback: 'scale.fallback',
        label: copy.scale.visualLabel,
        className: 'scale__slot',
      })}
    </div>
  </div>
</section>`;
}
