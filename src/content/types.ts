/**
 * Shared asset types.
 *
 * Every visual asset on the site is described once in `assets.ts` using this shape.
 * Components never hard-code file paths; they reference asset keys, so swapping a file
 * only means changing one entry in the manifest.
 */

export interface ImageAsset {
  kind: 'image';
  /** Path under /public, e.g. "/brand/wada-chovu-logo.jpeg". */
  src: string;
  /** Optional responsive sources, e.g. "/media/x-800.webp 800w, /media/x-1600.webp 1600w". */
  srcset?: string;
  /** `sizes` attribute that matches `srcset`. */
  sizes?: string;
  /** Intrinsic pixel size of the source file. Reserves space and prevents layout shift. */
  width?: number;
  height?: number;
  /** Descriptive alt text. Use an empty string for purely decorative images. */
  alt: string;
  /** True while this is stand-in artwork. Shows a "Placeholder" marker until cleared. */
  placeholder?: boolean;
  /** CSS object-position used when cropping, e.g. "50% 30%". */
  position?: string;
  /** Maintainer note. Never rendered. */
  note?: string;
}

export type AssetDefinition = ImageAsset;
