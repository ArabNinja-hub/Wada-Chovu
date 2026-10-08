import { categories, type ProductCategory } from '../../content/products.ts';
import { copy } from '../../content/copy.ts';
import { esc } from '../html.ts';
import { icon } from '../icons.ts';
import { renderImage } from '../media.ts';
import { placeholderText, sectionHead } from '../ui.ts';

/** Product category card. Used by the categories grid. */
export function renderCategoryCard(category: ProductCategory, index: number): string {
  const name = category.placeholder ? placeholderText(category.name) : esc(category.name);
  const summary = esc(category.summary);
  return `
<li class="grid__item" data-reveal style="--d: ${index * 80}ms">
  <article class="product-card">
    ${renderImage(category.image, { className: 'product-card__media', ratio: '4 / 3' })}
    <div class="product-card__body">
      <h3 class="h4">${name}</h3>
      <p class="product-card__text">${summary}</p>
      <a class="text-link" href="#enquiry" data-enquire-product="${esc(category.name)}">${esc(copy.categories.cta)}${icon('arrow', 'text-link__icon')}</a>
    </div>
  </article>
</li>`;
}

export function renderCategories(): string {
  const cards = categories.map(renderCategoryCard).join('');
  return `
<section class="section categories" id="categories" aria-labelledby="categories-title">
  <div class="container">
    ${sectionHead({
      eyebrow: copy.categories.eyebrow,
      title: copy.categories.title,
      lead: copy.categories.lead,
      id: 'categories-title',
    })}
    <ul class="card-grid card-grid--4" role="list">${cards}</ul>
  </div>
</section>`;
}
