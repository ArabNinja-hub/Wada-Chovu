import { categories, featuredProducts } from '../../content/products.ts';
import { copy } from '../../content/copy.ts';
import { enquiryChannel, site } from '../../content/site.ts';
import { attrs, esc } from '../html.ts';
import { icon } from '../icons.ts';
import { placeholderText, sectionHead } from '../ui.ts';
import { placeholderBadge as placeholderBadgeHtml } from '../media.ts';

type FieldKind = 'text' | 'email' | 'tel';

interface FieldOptions {
  name: string;
  label: string;
  kind?: FieldKind;
  placeholder?: string;
  required?: boolean;
  autocomplete?: string;
  wide?: boolean;
}

function inputField({ name, label, kind = 'text', placeholder, required, autocomplete, wide }: FieldOptions): string {
  const id = `enquiry-${name}`;
  const errorId = `${id}-error`;
  return `
  <div class="field${wide ? ' field--wide' : ''}" data-field>
    <label class="field__label" for="${id}">${esc(label)}${required ? ' <span class="field__req" aria-hidden="true">*</span>' : ''}</label>
    <input class="field__input" id="${id}" name="${name}" type="${kind}"${attrs({
      placeholder,
      autocomplete,
      required,
      'aria-required': required ? 'true' : undefined,
      'aria-describedby': errorId,
    })}>
    <p class="field__error" id="${errorId}" data-error hidden></p>
  </div>`;
}

function productOptions(): string {
  const names = [
    ...categories.map((c) => c.name),
    ...featuredProducts.map((p) => p.name),
  ];
  const options = names.map((name) => `<option value="${esc(name)}">${esc(name)}</option>`).join('');
  return `<option value="">${esc(copy.enquiry.productPlaceholderOption)}</option>${options}`;
}

/**
 * Without JavaScript the form cannot send itself. In email mode it submits to a mailto: link, so
 * the browser opens the visitor's email app with the fields in the body. In any other mode the
 * form has no action: it is either disabled, or sent by the script to the endpoint. method="dialog"
 * stops a script-less submit from putting the visitor's details into the page URL.
 */
function formAttributes(channel: ReturnType<typeof enquiryChannel>): string {
  if (channel === 'email') {
    const mailto = `mailto:${encodeURIComponent(site.enquiry.emailTo)}?subject=${encodeURIComponent(site.enquiry.subject)}`;
    return `action="${esc(mailto)}" method="post" enctype="text/plain"`;
  }
  return 'method="dialog"';
}

export function renderEnquiry(): string {
  const f = copy.enquiry.fields;
  const p = copy.enquiry.placeholders;
  const channel = enquiryChannel();
  const unconfigured = channel === 'unconfigured';
  const include = copy.enquiry.include.map((item) => `<li>${icon('check', 'check-list__icon')}<span>${esc(item)}</span></li>`).join('');

  return `
<section class="section enquiry" id="enquiry" aria-labelledby="enquiry-title">
  <div class="container enquiry__grid">
    <div class="enquiry__copy" data-reveal>
      ${sectionHead({
        eyebrow: copy.enquiry.eyebrow,
        title: copy.enquiry.title,
        lead: copy.enquiry.lead,
        id: 'enquiry-title',
      })}
      <div class="enquiry__include">
        <h3 class="h5">${esc(copy.enquiry.includeTitle)}</h3>
        <ul class="check-list">${include}</ul>
      </div>
      <p class="enquiry__direct">
        ${icon('phone', 'enquiry__direct-icon')}
        <span>${placeholderText(site.contact.phone.label)}</span>
      </p>
      <p class="fine-print">${esc(copy.enquiry.privacy)}</p>
    </div>

    <div class="enquiry__card" data-reveal style="--d: 120ms">
      ${unconfigured ? `<div class="form-notice" role="note" data-channel-notice>${site.features.placeholderMarkers ? placeholderBadgeHtml() : ''}<p>${esc(copy.enquiry.notConnected)}</p></div>` : ''}
      <form class="enquiry-form" id="enquiry-form" data-enquiry-form data-channel="${channel}" ${formAttributes(channel)}>
        <fieldset class="enquiry-form__fields"${unconfigured ? ' disabled' : ''}>
        <div class="form-grid">
          ${inputField({ name: 'name', label: f.name, placeholder: p.name, required: true, autocomplete: 'name' })}
          ${inputField({ name: 'company', label: f.company, placeholder: p.company, autocomplete: 'organization' })}
          ${inputField({ name: 'email', label: f.email, kind: 'email', placeholder: p.email, required: true, autocomplete: 'email' })}
          ${inputField({ name: 'phone', label: f.phone, kind: 'tel', placeholder: p.phone, autocomplete: 'tel' })}
          <div class="field field--wide" data-field>
            <label class="field__label" for="enquiry-product">${esc(f.product)}</label>
            <select class="field__input field__select" id="enquiry-product" name="product">${productOptions()}</select>
          </div>
          ${inputField({ name: 'quantity', label: f.quantity, placeholder: p.quantity })}
          ${inputField({ name: 'location', label: f.location, placeholder: p.location })}
          <div class="field field--wide" data-field>
            <label class="field__label" for="enquiry-message">${esc(f.message)} <span class="field__req" aria-hidden="true">*</span></label>
            <textarea class="field__input field__textarea" id="enquiry-message" name="message" rows="5" required aria-required="true" aria-describedby="enquiry-message-error" placeholder="${esc(p.message)}"></textarea>
            <p class="field__error" id="enquiry-message-error" data-error hidden></p>
          </div>
        </div>

        <div class="hp" aria-hidden="true">
          <label>Leave this field empty<input type="text" name="website" tabindex="-1" autocomplete="off"></label>
        </div>

        </fieldset>

        <div class="form-actions">
          <button class="btn btn--primary btn--submit" type="submit" data-submit${unconfigured ? ' disabled aria-disabled="true"' : ''}>
            <span data-submit-label>${esc(copy.enquiry.submit)}</span>${icon('arrow', 'btn__icon')}
          </button>
        </div>
        <p class="form-status" role="status" aria-live="polite" data-form-status></p>
      </form>
    </div>
  </div>
</section>`;
}
