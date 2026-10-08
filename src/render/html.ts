/**
 * Small HTML helpers used by the render layer.
 * Everything here is pure, so it runs both at build time (prerender) and in tests.
 */

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Escapes text for use in HTML content or attribute values. */
export function esc(value: string | number): string {
  return String(value).replace(/[&<>"']/g, (ch) => ESCAPES[ch] ?? ch);
}

/** Joins class names, skipping falsy values. */
export function classes(...names: Array<string | false | null | undefined>): string {
  return names.filter(Boolean).join(' ');
}

export type AttrValue = string | number | boolean | null | undefined;

/**
 * Builds an attribute string.
 * - `undefined`, `null` and `false` are omitted.
 * - `true` becomes a bare attribute.
 * - Empty strings are kept (for example `alt=""` on decorative images).
 */
export function attrs(map: Record<string, AttrValue>): string {
  let out = '';
  for (const [name, value] of Object.entries(map)) {
    if (value === undefined || value === null || value === false) continue;
    if (value === true) {
      out += ` ${name}`;
    } else {
      out += ` ${name}="${esc(value)}"`;
    }
  }
  return out;
}

/** Wraps text in a placeholder marker when placeholder markers are enabled. */
export function ph(text: string, enabled: boolean): string {
  return enabled ? `<span class="ph">${esc(text)}</span>` : esc(text);
}
