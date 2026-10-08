import { copy } from '../../content/copy.ts';
import { site, type ContactItem } from '../../content/site.ts';
import { esc } from '../html.ts';
import { icon, type IconName } from '../icons.ts';
import { renderImage } from '../media.ts';
import { placeholderText, sectionHead } from '../ui.ts';

/** Renders a contact value as a link when a target exists, otherwise as plain (or placeholder) text. */
export function renderContactValue(item: ContactItem): string {
  const text = item.placeholder ? placeholderText(item.label) : esc(item.label);
  return item.href ? `<a href="${esc(item.href)}">${text}</a>` : text;
}

function contactRow(iconName: IconName, label: string, value: string): string {
  return `
    <div class="contact-item">
      <dt class="contact-item__label">${icon(iconName, 'contact-item__icon')}<span>${esc(label)}</span></dt>
      <dd class="contact-item__value">${value}</dd>
    </div>`;
}

export function renderLocation(): string {
  const labels = copy.location.labels;
  const address = site.contact.address.map((line) => renderContactValue(line)).join('<br>');

  const rows = [
    contactRow('pin', labels.address, address),
    contactRow('phone', labels.phone, renderContactValue(site.contact.phone)),
    contactRow('mail', labels.email, renderContactValue(site.contact.email)),
    site.contact.whatsapp.label ? contactRow('chat', labels.whatsapp, renderContactValue(site.contact.whatsapp)) : '',
    contactRow('clock', labels.hours, renderContactValue(site.contact.hours)),
  ].join('');

  return `
<section class="section location" id="location" aria-labelledby="location-title">
  <div class="container location__grid">
    <div class="location__copy" data-reveal>
      ${sectionHead({
        eyebrow: copy.location.eyebrow,
        title: copy.location.title,
        lead: copy.location.lead,
        id: 'location-title',
      })}
      <dl class="contact-list">${rows}
      </dl>
    </div>
    <div class="location__media" data-reveal style="--d: 120ms">
      ${renderImage('location.image', { className: 'media--rounded', ratio: '16 / 10' })}
    </div>
  </div>
</section>`;
}
