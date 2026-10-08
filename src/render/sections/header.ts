import { copy } from '../../content/copy.ts';
import { site } from '../../content/site.ts';
import { esc } from '../html.ts';
import { renderPlainImage } from '../media.ts';
import { button } from '../ui.ts';

export function renderHeader(): string {
  const navItems = site.nav
    .map((link) => `<li><a class="primary-nav__link" href="${esc(link.href)}">${esc(link.label)}</a></li>`)
    .join('');

  return `
<a class="skip-link" href="#main">${esc(copy.header.skipToContent)}</a>
<header class="site-header" data-site-header>
  <div class="container site-header__inner">
    <a class="brand" href="#top" aria-label="${esc(site.name)}, back to top">
      ${renderPlainImage(site.logo, { className: 'brand__logo', fetchPriority: 'high' })}
    </a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-nav" data-nav-toggle>
      <span class="nav-toggle__label" data-nav-toggle-label>${esc(copy.header.menuLabel)}</span>
      <span class="nav-toggle__bars" aria-hidden="true"><span></span><span></span><span></span></span>
    </button>
    <nav class="primary-nav" id="primary-nav" aria-label="Primary" data-nav>
      <ul class="primary-nav__list">${navItems}</ul>
      ${button({ href: '#enquiry', label: copy.header.enquireCta, variant: 'accent', iconName: 'arrow', className: 'primary-nav__cta' })}
    </nav>
  </div>
</header>`;
}
