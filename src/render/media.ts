/**
 * Media components.
 *
 * `renderPlainImage` renders bare <img> tags with intrinsic size attributes, for logos
 * and icons that need no frame.
 */
import { getImage, type ImageKey } from '../content/assets.ts';
import { attrs } from './html.ts';
import { site } from '../content/site.ts';

export function placeholderBadge(): string {
  return site.features.placeholderMarkers ? '<span class="ph-badge">Placeholder</span>' : '';
}

export interface PlainImageOptions {
  className?: string;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low';
  /** Overrides the asset alt text. Pass "" for decorative use. */
  alt?: string;
}

/** Bare <img> with intrinsic size attributes, for logos and icons that need no frame. */
export function renderPlainImage(key: ImageKey, options: PlainImageOptions = {}): string {
  const asset = getImage(key);
  return `<img${attrs({
    class: options.className,
    src: asset.src,
    alt: options.alt ?? asset.alt,
    width: asset.width,
    height: asset.height,
    loading: options.loading ?? 'eager',
    decoding: 'async',
    fetchpriority: options.fetchPriority,
  })}>`;
}
