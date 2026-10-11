import { initEnquiryForm } from './enquiry-form.ts';
import { initHeader } from './header.ts';
import { initReveal } from './reveal.ts';

/**
 * Client entry point. Everything here is progressive enhancement: the page is complete and
 * usable before this runs. Each step is independent, so one failure cannot break the others.
 */
function boot(): void {
  initHeader();
  initReveal();
  initEnquiryForm();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
