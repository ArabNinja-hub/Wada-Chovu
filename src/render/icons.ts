/**
 * Inline line icons (24px grid, stroke-based, currentColor).
 * Kept inline so no icon-font or icon-library dependency is needed.
 */
import { classes } from './html.ts';

const PATHS = {
  arrow: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
  check: '<path d="m5 12.5 4.2 4.2L19 7.5"/>',
  box: '<path d="M12 3 4 7.2v9.6L12 21l8-4.2V7.2L12 3Z"/><path d="M4 7.2l8 4.2 8-4.2"/><path d="M12 11.4V21"/>',
  repeat:
    '<path d="M4 11.5a8 8 0 0 1 13.7-5.5L20 8.5"/><path d="M20 4.5v4h-4"/><path d="M20 12.5a8 8 0 0 1-13.7 5.5L4 15.5"/><path d="M4 19.5v-4h4"/>',
  quote: '<path d="M6.5 3.5h7.8L19 8.2v12.3H6.5z"/><path d="M14.3 3.5v4.7H19"/><path d="M9.5 12.5h7M9.5 16h7"/>',
  shield:
    '<path d="M12 3 5 5.8v5.4c0 4.6 2.9 8.4 7 9.8 4.1-1.4 7-5.2 7-9.8V5.8L12 3Z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
  phone:
    '<path d="M5 4.5h3.2l1.6 4.3-2 1.3a11 11 0 0 0 6.1 6.1l1.3-2 4.3 1.6V19a1.5 1.5 0 0 1-1.5 1.5A15.5 15.5 0 0 1 3.5 6 1.5 1.5 0 0 1 5 4.5Z"/>',
  mail: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="m4 7 8 6 8-6"/>',
  pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.4"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  chat: '<path d="M4.5 5.5h15v10h-9l-4.5 3.5v-3.5h-1.5z"/>',
  up: '<path d="M12 19V5"/><path d="m6 11 6-6 6 6"/>',
  grid:
    '<rect x="4" y="4" width="6.5" height="6.5" rx="1.2"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.2"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.2"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.2"/>',
} as const;

export type IconName = keyof typeof PATHS;

export function icon(name: IconName, className?: string): string {
  return `<svg class="${classes('icon', className)}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${PATHS[name]}</svg>`;
}
