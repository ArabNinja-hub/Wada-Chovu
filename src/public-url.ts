/**
 * Resolves a public-directory path for the configured Vite base.
 *
 * HTML tags are rewritten by Vite. Runtime fetches (textures, models) are plain strings,
 * so they have to include the base themselves or they 404 when the site is not at `/`.
 */
export function publicAssetUrl(path: string): string {
  if (!path.startsWith('/') || path.startsWith('//')) return path;

  const base = import.meta.env.BASE_URL;
  if (!base || base === '/') return path;
  if (path === base.slice(0, -1) || path.startsWith(base)) return path;
  return `${base}${path.slice(1)}`;
}
