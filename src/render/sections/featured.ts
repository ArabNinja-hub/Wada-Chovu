import { featuredProducts, type FeaturedProduct } from '../../content/products.ts';
import { copy } from '../../content/copy.ts';
import { esc } from '../html.ts';
import { renderImage, renderStageSlot } from '../media.ts';
import { button, eyebrow, placeholderText } from '../ui.ts';

export function renderFeaturedCard(product: FeaturedProduct, index: number): string {
  const name = product.placeholder ? placeholderText(product.name) : esc(product.name);
  return `
<li class="grid__item" data-reveal style="--d: ${index * 80}ms">
  <article class="product-card product-card--featured">
    ${renderImage(product.image, { className: 'product-card__media', ratio: '4 / 3' })}
    <div class="product-card__body">
      <p class="product-card__meta">${esc(product.packSize)}</p>
      <h3 class="h4">${name}</h3>
      <p class="product-card__text">${esc(product.summary)}</p>
      ${button({
        href: '#enquiry',
        label: copy.featured.cta,
        variant: 'ghost',
        className: 'btn--small',
        extra: { 'data-enquire-product': product.name },
      })}
    </div>
  </article>
</li>`;
}

export function renderFeatured(): string {
  const cards = featuredProducts.map(renderFeaturedCard).join('');
  return `
<section class="section featured" id="featured" aria-labelledby="featured-title">
  <div class="container">
    <div class="featured__head">
      <div class="featured__intro" data-reveal>
        ${eyebrow(copy.featured.eyebrow)}
        <h2 class="h2" id="featured-title">${esc(copy.featured.title)}</h2>
        <p class="lead">${esc(copy.featured.lead)}</p>
      </div>
      <div class="featured__stage" data-reveal style="--d: 120ms">
        ${renderStageSlot({
          scene: 'featured',
          fallback: 'featured.fallback',
          label: copy.featured.visualLabel,
          className: 'featured__slot',
        })}
      </div>
    </div>
    <ul class="card-grid card-grid--4" role="list">${cards}</ul>
  </div>
</section>`;
}
