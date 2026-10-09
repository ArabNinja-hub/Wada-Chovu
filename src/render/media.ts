/**
 * Media components.
 *
 * `renderImage` is the only way images reach the page. It reads the asset manifest and
 * reserves the correct aspect ratio up front, so swapping a file never shifts the layout.
 *
 * `renderStageSlot` is the anchor for a 3D scene. It contains a static fallback image,
 * which stays visible until the scene is ready or when 3D is unavailable.
 */
import { getImage, type ImageKey } from '../content/assets.ts';
import type { StageSceneId } from '../content/types.ts';
import { site } from '../content/site.ts';
import { attrs, classes, esc } from './html.ts';

export interface ImageOptions {
  /** CSS aspect ratio of the frame, for example "4 / 3". Defaults to the asset's own ratio. */
  ratio?: string;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
  /** Overrides the asset's `sizes`. */
  sizes?: string;
  /** Overrides the asset's alt text. Pass "" for decorative use. */
  alt?: string;
  /** Layout modifiers, for example "media--arch". */
  className?: string;
}

export function placeholderBadge(): string {
  return site.features.placeholderMarkers ? '<span class="ph-badge">Placeholder</span>' : '';
}

export function renderImage(key: ImageKey, options: ImageOptions = {}): string {
  const asset = getImage(key);
  const ratio = options.ratio ?? (asset.width && asset.height ? `${asset.width} / ${asset.height}` : '4 / 3');
  const showBadge = Boolean(asset.placeholder) && site.features.placeholderMarkers;

  const img = `<img${attrs({
    src: asset.src,
    srcset: asset.srcset,
    sizes: asset.srcset ? (options.sizes ?? asset.sizes ?? '100vw') : undefined,
    alt: options.alt ?? asset.alt,
    width: asset.width,
    height: asset.height,
    loading: options.loading ?? 'lazy',
    decoding: 'async',
    fetchpriority: options.fetchPriority !== 'auto' ? options.fetchPriority : undefined,
    style: asset.position ? `object-position: ${asset.position}` : undefined,
  })}>`;

  return `<figure class="${classes('media', options.className, showBadge && 'media--placeholder')}" style="--ratio: ${esc(ratio)}">${img}${showBadge ? placeholderBadge() : ''}</figure>`;
}

export interface StageSlotOptions {
  scene: StageSceneId;
  /** Static image shown until the 3D scene is ready, or when 3D is unavailable. */
  fallback: ImageKey;
  /** Accessible description of the visual. Defaults to the fallback asset's alt text. */
  label?: string;
  /**
   * CSS aspect ratio reserved for the slot, for example "1 / 1". Omit it to let the
   * stylesheet decide, for example to change the ratio at breakpoints.
   */
  ratio?: string;
  className?: string;
  fetchPriority?: 'high' | 'low' | 'auto';
}

export function renderStageSlot({ scene, fallback, label, ratio, className, fetchPriority }: StageSlotOptions): string {
  const asset = getImage(fallback);
  const showBadge = Boolean(asset.placeholder) && site.features.placeholderMarkers;
  // The slot itself is the labelled image. The inner fallback is presentational so the
  // description is announced once, whether the 3D scene or the fallback is showing.
  const img = `<img${attrs({
    src: asset.src,
    alt: '',
    width: asset.width,
    height: asset.height,
    loading: 'eager',
    decoding: 'async',
    fetchpriority: fetchPriority,
    style: asset.position ? `object-position: ${asset.position}` : undefined,
  })}>`;

  // A photo fallback also names the photo for the 3D scene, which displaces it by its depth map.
  const photo = asset.kind === 'photo' ? ` data-photo="${esc(fallback)}"` : '';
  const style = ratio ? ` style="--ratio: ${esc(ratio)}"` : '';
  return `<div class="${classes('stage-slot', className)}" data-stage="${scene}"${photo} role="img" aria-label="${esc(label ?? asset.alt)}"${style}><div class="stage-fallback">${img}${showBadge ? placeholderBadge() : ''}</div></div>`;
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
