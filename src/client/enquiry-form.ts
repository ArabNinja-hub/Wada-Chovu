import { copy } from '../content/copy.ts';
import { site } from '../content/site.ts';

/**
 * Enquiry form.
 *
 * - Validates in the browser and marks each field with an accessible error message.
 * - Sends JSON to `site.enquiry.endpoint` when one is configured.
 * - Otherwise opens the visitor's email app with the enquiry filled in, addressed to
 *   `site.enquiry.emailTo`. This works with no server and no third-party service.
 * - Includes a honeypot field. Filled-in honeypots are discarded silently.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^[+\d\s().-]{6,}$/;

type FieldName = 'name' | 'company' | 'email' | 'phone' | 'product' | 'quantity' | 'location' | 'message';

interface EnquiryPayload {
  name: string;
  company: string;
  email: string;
  phone: string;
  product: string;
  quantity: string;
  location: string;
  message: string;
  page: string;
  submittedAt: string;
}

function value(form: HTMLFormElement, name: FieldName): string {
  const el = form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
  return el?.value.trim() ?? '';
}

/** Returns an error message key for the field, or null when it is valid. */
function validate(name: FieldName, text: string): string | null {
  switch (name) {
    case 'name':
      return text.length < 2 ? copy.enquiry.errors.name : null;
    case 'email':
      if (!text) return copy.enquiry.errors.required;
      return EMAIL_PATTERN.test(text) ? null : copy.enquiry.errors.email;
    case 'message':
      if (!text) return copy.enquiry.errors.required;
      return text.length < 10 ? copy.enquiry.errors.tooShort : null;
    case 'phone':
      if (!text) return null;
      return PHONE_PATTERN.test(text) ? null : copy.enquiry.errors.phone;
    default:
      return null;
  }
}

function fieldWrapper(input: Element): HTMLElement | null {
  return input.closest<HTMLElement>('[data-field]');
}

function setError(form: HTMLFormElement, name: FieldName, message: string | null): boolean {
  const input = form.elements.namedItem(name) as HTMLElement | null;
  if (!input) return true;
  const wrapper = fieldWrapper(input);
  const error = wrapper?.querySelector<HTMLElement>('[data-error]');
  const invalid = Boolean(message);
  input.setAttribute('aria-invalid', String(invalid));
  wrapper?.classList.toggle('is-invalid', invalid);
  if (error) {
    error.textContent = message ?? '';
    error.hidden = !invalid;
  }
  return !invalid;
}

function buildMailto(payload: EnquiryPayload): string {
  const subject = `${site.enquiry.subject}: ${payload.product || 'General enquiry'}${payload.company ? ` (${payload.company})` : ''}`;
  const lines = [
    `Name: ${payload.name}`,
    `Company: ${payload.company || '-'}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone || '-'}`,
    `Product: ${payload.product || '-'}`,
    `Approximate quantity: ${payload.quantity || '-'}`,
    `Location: ${payload.location || '-'}`,
    '',
    'Message:',
    payload.message,
  ];
  return `mailto:${encodeURIComponent(site.enquiry.emailTo)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
}

export function initEnquiryForm(): void {
  const form = document.querySelector<HTMLFormElement>('[data-enquiry-form]');
  if (!form) return;

  // The script validates and reports errors itself. Without it, the browser's own validation applies.
  form.noValidate = true;

  const select = form.querySelector<HTMLSelectElement>('#enquiry-product');
  const status = form.querySelector<HTMLElement>('[data-form-status]');
  const submit = form.querySelector<HTMLButtonElement>('[data-submit]');
  const submitLabel = form.querySelector<HTMLElement>('[data-submit-label]');

  const preselect = (product: string | null | undefined) => {
    if (!select || !product) return;
    const match = Array.from(select.options).some((option) => option.value === product);
    if (match) select.value = product;
  };

  // "Enquire about this range" and "Request a quote" links pass the product name along.
  document.addEventListener('click', (event) => {
    const link = (event.target as Element | null)?.closest<HTMLElement>('[data-enquire-product]');
    if (link) preselect(link.dataset.enquireProduct);
  });

  // Support direct links such as /?product=Name#enquiry.
  preselect(new URLSearchParams(window.location.search).get('product'));

  // Clear an error as soon as the visitor corrects the field.
  const names: FieldName[] = ['name', 'email', 'phone', 'message'];
  for (const name of names) {
    const input = form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | null;
    input?.addEventListener('input', () => {
      if (input.getAttribute('aria-invalid') === 'true') {
        setError(form, name, validate(name, value(form, name)));
      }
    });
  }

  const showStatus = (kind: 'success' | 'error', message: string) => {
    if (!status) return;
    status.textContent = message;
    status.classList.toggle('is-success', kind === 'success');
    status.classList.toggle('is-error', kind === 'error');
  };

  const setBusy = (busy: boolean) => {
    if (submit) submit.disabled = busy;
    if (submitLabel) submitLabel.textContent = busy ? copy.enquiry.sending : copy.enquiry.submit;
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (status) {
      status.textContent = '';
      status.classList.remove('is-success', 'is-error');
    }

    // Honeypot: real visitors never see or fill this field. Bots do, so drop the submission quietly.
    const honeypot = (form.elements.namedItem('website') as HTMLInputElement | null)?.value.trim();
    if (honeypot) {
      form.reset();
      showStatus('success', copy.enquiry.successWithEndpoint);
      return;
    }

    const fieldNames: FieldName[] = ['name', 'email', 'phone', 'message'];
    let firstInvalid: HTMLElement | null = null;
    let allValid = true;
    for (const name of fieldNames) {
      const ok = setError(form, name, validate(name, value(form, name)));
      if (!ok) {
        allValid = false;
        firstInvalid ??= form.elements.namedItem(name) as HTMLElement | null;
      }
    }

    if (!allValid) {
      showStatus('error', copy.enquiry.errorValidation);
      firstInvalid?.focus();
      return;
    }

    const payload: EnquiryPayload = {
      name: value(form, 'name'),
      company: value(form, 'company'),
      email: value(form, 'email'),
      phone: value(form, 'phone'),
      product: value(form, 'product'),
      quantity: value(form, 'quantity'),
      location: value(form, 'location'),
      message: value(form, 'message'),
      page: window.location.href,
      submittedAt: new Date().toISOString(),
    };

    if (!site.enquiry.endpoint) {
      // No backend configured: hand the enquiry to the visitor's email app.
      window.location.href = buildMailto(payload);
      showStatus('success', copy.enquiry.successWithEmail);
      return;
    }

    setBusy(true);
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(site.enquiry.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`Enquiry endpoint responded with ${response.status}`);
      form.reset();
      showStatus('success', copy.enquiry.successWithEndpoint);
    } catch (error) {
      console.error('Enquiry submission failed', error);
      showStatus('error', copy.enquiry.errorGeneric);
    } finally {
      window.clearTimeout(timer);
      setBusy(false);
    }
  });
}
