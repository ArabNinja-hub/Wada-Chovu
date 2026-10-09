import { ASSEMBLY_IMAGE_KEYS, getImage } from '../../content/assets.ts';
import { copy } from '../../content/copy.ts';
import { esc } from '../html.ts';
import { placeholderBadge } from '../media.ts';
import { eyebrow } from '../ui.ts';

/**
 * Product assembly section. It is a complete static layout: the four photographs in a grid.
 * With 3D available, the stage draws the pinned, scroll-driven arrangement over the same slot.
 * The grid is the fallback when 3D is unavailable, when motion is reduced, or before the
 * scene has loaded.
 */
export function renderAssembly(): string {
  const photos = ASSEMBLY_IMAGE_KEYS.map((key) => {
    const asset = getImage(key);
    return `<img src="${esc(asset.src)}" alt="" width="${asset.width}" height="${asset.height}" loading="lazy" decoding="async">`;
  }).join('');

  return `
<section class="section assembly" id="assembly" data-stage-section aria-labelledby="assembly-title">
  <div class="assembly__pin">
    <div class="container assembly__head">
      ${eyebrow(copy.assembly.eyebrow)}
      <h2 class="h2" id="assembly-title">${esc(copy.assembly.title)}</h2>
      <p class="lead">${esc(copy.assembly.lead)}</p>
    </div>
    <div class="stage-slot assembly__slot" data-stage="assembly" role="img" aria-label="${esc(copy.assembly.visualLabel)}">
      <div class="stage-fallback assembly__fallback">${photos}</div>
      ${placeholderBadge()}
    </div>
  </div>
</section>`;
}
