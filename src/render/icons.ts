/**
 * Icons are drawn with CSS (see components.css, `.icon--*`), so the site ships no vector artwork.
 * `icon()` returns an empty, decorative element carrying the icon's modifier class.
 */
import { classes } from './html.ts';

const MODIFIERS = {
  arrow: 'icon--arrow',
  check: 'icon--check',
  phone: 'icon--phone',
  pin: 'icon--pin',
  mail: 'icon--mail',
  chat: 'icon--chat',
  clock: 'icon--clock',
  up: 'icon--arrow icon--up',
} as const;

export type IconName = keyof typeof MODIFIERS;

export function icon(name: IconName, className?: string): string {
  return `<span class="${classes('icon', MODIFIERS[name], className)}" aria-hidden="true"></span>`;
}
