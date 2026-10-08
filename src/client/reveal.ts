/**
 * Scroll reveal.
 *
 * Elements marked with `data-reveal` fade and rise once when they enter the viewport.
 * The hidden starting state is only applied when this function runs with motion allowed.
 * Without JavaScript, or with reduced motion, every element is visible from the start.
 */
export function initReveal(): void {
  const targets = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (targets.length === 0) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  document.documentElement.classList.add('motion-ready');

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
  );

  targets.forEach((el) => observer.observe(el));
}
