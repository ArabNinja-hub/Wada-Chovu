import { copy } from '../../content/copy.ts';
import { ASSETS } from '../../content/assets.ts';
import { site } from '../../content/site.ts';
import { esc } from '../html.ts';
import { icon } from '../icons.ts';
import { renderPlainImage } from '../media.ts';
import { renderContactValue } from './location.ts';

export function renderFooter(year: number): string {
  const nav = site.nav.map((link) => `<li><a href="${esc(link.href)}">${esc(link.label)}</a></li>`).join('');
  const social = site.social.length
    ? `<h2 class="site-footer__title">${esc(copy.footer.socialTitle)}</h2>
        <ul class="site-footer__links">${site.social
          .map((link) => `<li><a href="${esc(link.href)}" rel="noopener" target="_blank">${esc(link.label)}</a></li>`)
          .join('')}</ul>`
    : '';
  const logoAsset = ASSETS[site.logo];
  const logoLabel = logoAsset.kind === 'image' ? logoAsset.alt : site.name;

  return `
<footer class="site-footer">
  <div class="container site-footer__grid">
    <div class="site-footer__brand">
      <a class="logo-card" href="#top" aria-label="${esc(logoLabel)}, back to top">
        ${renderPlainImage(site.logo, { className: 'logo-card__img', loading: 'lazy' })}
      </a>
      <p class="site-footer__tagline">${esc(copy.footer.tagline)}</p>
    </div>

    <nav class="site-footer__nav" aria-label="Footer">
      <h2 class="site-footer__title">${esc(copy.footer.navTitle)}</h2>
      <ul class="site-footer__links">${nav}<li><a href="#enquiry">${esc(copy.header.enquireCta)}</a></li></ul>
    </nav>

    <div class="site-footer__contact">
      <h2 class="site-footer__title">${esc(copy.footer.contactTitle)}</h2>
      <ul class="site-footer__contact-list">
        <li>${renderContactValue(site.contact.email)}</li>
        <li>${renderContactValue(site.contact.phone)}</li>
      </ul>
      ${social}
    </div>
  </div>

  <div class="container site-footer__legal">
    <p>&copy; ${year} ${esc(site.legalName)}. ${esc(copy.footer.rights)}</p>
    <a class="site-footer__top" href="#top">${icon('up', 'site-footer__top-icon')}<span>${esc(copy.footer.backToTop)}</span></a>
  </div>
</footer>`;
}
