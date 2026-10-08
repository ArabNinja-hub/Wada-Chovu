import { copy } from '../content/copy.ts';

/**
 * Sticky header state (shadow after scrolling) and the mobile navigation sheet.
 */
export function initHeader(): void {
  const header = document.querySelector<HTMLElement>('[data-site-header]');
  if (!header) return;

  // Scroll state, throttled to one update per frame.
  let ticking = false;
  const update = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
    ticking = false;
  };
  update();
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );

  // Mobile navigation.
  const toggle = header.querySelector<HTMLButtonElement>('[data-nav-toggle]');
  const label = header.querySelector<HTMLElement>('[data-nav-toggle-label]');
  const nav = header.querySelector<HTMLElement>('[data-nav]');
  if (!toggle || !nav) return;

  const desktop = matchMedia('(min-width: 900px)');

  const setOpen = (open: boolean) => {
    header.classList.toggle('is-menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    if (label) label.textContent = open ? copy.header.closeMenu : copy.header.menuLabel;
    document.documentElement.classList.toggle('menu-open', open);
  };

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  // Close after choosing a section, so the page is visible at the target.
  nav.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest('a')) setOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && header.classList.contains('is-menu-open')) {
      setOpen(false);
      toggle.focus();
    }
  });

  // Leaving the mobile layout closes the sheet so the desktop nav is never hidden.
  desktop.addEventListener('change', (event) => {
    if (event.matches) setOpen(false);
  });
}
