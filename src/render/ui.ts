/**
 * Reusable UI building blocks: buttons, eyebrows, section headings and reveal wrappers.
 */
import { icon, type IconName } from './icons.ts';
import { attrs, classes, esc, ph, type AttrValue } from './html.ts';
import { site } from '../content/site.ts';

export type ButtonVariant = 'primary' | 'accent' | 'ghost' | 'light';

export interface ButtonOptions {
  href: string;
  label: string;
  variant?: ButtonVariant;
  iconName?: IconName;
  className?: string;
  /** Extra attributes, for example data-product for enquiry pre-fill. */
  extra?: Record<string, AttrValue>;
}

export function button({ href, label, variant = 'primary', iconName, className, extra }: ButtonOptions): string {
  const trailing = iconName ? icon(iconName, 'btn__icon') : '';
  return `<a class="${classes('btn', `btn--${variant}`, className)}" href="${esc(href)}"${attrs(extra ?? {})}><span>${esc(label)}</span>${trailing}</a>`;
}

export function eyebrow(text: string, tone: 'light' | 'dark' = 'light'): string {
  return `<p class="${classes('eyebrow', tone === 'dark' && 'eyebrow--dark')}"><span class="eyebrow__dot" aria-hidden="true"></span>${esc(text)}</p>`;
}

export interface SectionHeadOptions {
  eyebrow: string;
  title: string;
  lead?: string;
  /** id of the h2, used for aria-labelledby on the parent section. */
  id: string;
  tone?: 'light' | 'dark';
  align?: 'start' | 'center';
  className?: string;
}

export function sectionHead({ eyebrow: eyebrowText, title, lead, id, tone = 'light', align = 'start', className }: SectionHeadOptions): string {
  return `
  <header class="${classes('section-head', `section-head--${align}`, className)}" data-reveal>
    ${eyebrow(eyebrowText, tone)}
    <h2 class="h2${tone === 'dark' ? ' on-dark' : ''}" id="${esc(id)}">${esc(title)}</h2>
    ${lead ? `<p class="lead${tone === 'dark' ? ' on-dark-muted' : ''}">${esc(lead)}</p>` : ''}
  </header>`;
}

/** Inline placeholder text, for example "[Street address]". Respects the markers switch. */
export function placeholderText(text: string): string {
  return ph(text, site.features.placeholderMarkers);
}
