/**
 * Page assembly.
 *
 * `renderPage` and `renderHeadMeta` are used by the Vite plugin in vite.config.ts to
 * prerender the full page into index.html at build (and dev) time. The result is
 * readable and complete before any JavaScript runs. Sections are composed in this order.
 */
import { ASSETS } from '../content/assets.ts';
import { site } from '../content/site.ts';
import { esc } from './html.ts';
import { renderHeader } from './sections/header.ts';
import { renderHero } from './sections/hero.ts';
import { renderAbout } from './sections/about.ts';
import { renderCategories } from './sections/categories.ts';
import { renderFeatured } from './sections/featured.ts';
import { renderScale } from './sections/scale.ts';
import { renderWhy } from './sections/why.ts';
import { renderEnquiry } from './sections/enquiry.ts';
import { renderLocation } from './sections/location.ts';
import { renderFooter } from './sections/footer.ts';

export function renderPage(year: number = new Date().getFullYear()): string {
  return [
    renderHeader(),
    '<main id="main" tabindex="-1">',
    renderHero(),
    renderAbout(),
    renderCategories(),
    renderFeatured(),
    renderScale(),
    renderWhy(),
    renderEnquiry(),
    renderLocation(),
    '</main>',
    renderFooter(year),
  ].join('\n');
}

/** Head tags that depend on the site config: title, description, social previews, structured data. */
export function renderHeadMeta(): string {
  const title = `${site.name} | Wholesale & bulk supply`;
  const logo = ASSETS[site.logo];
  const logoSrc = logo.kind === 'image' ? logo.src : '';
  const absolute = (path: string) => (site.url ? `${site.url.replace(/\/$/, '')}${path}` : path);

  const socialLinks = site.social.map((link) => link.href).filter(Boolean);
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: site.name,
    legalName: site.legalName,
    description: site.description,
    ...(site.url ? { url: site.url, logo: absolute(logoSrc) } : {}),
    ...(socialLinks.length ? { sameAs: socialLinks } : {}),
  };

  const tags = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(site.description)}">`,
    `<meta name="theme-color" content="${esc(site.themeColor)}">`,
    `<meta name="color-scheme" content="light">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="${esc(site.name)}">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(site.description)}">`,
    `<meta property="og:image" content="${esc(absolute(logoSrc))}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    site.url ? `<link rel="canonical" href="${esc(absolute('/'))}">` : '',
    site.url ? `<meta property="og:url" content="${esc(absolute('/'))}">` : '',
    `<link rel="icon" href="${esc(ASSETS['brand.favicon'].kind === 'image' ? ASSETS['brand.favicon'].src : '/brand/favicon.svg')}" type="image/svg+xml">`,
    `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`,
  ];

  return tags.filter(Boolean).join('\n    ');
}
