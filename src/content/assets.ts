/**
 * ASSET MANIFEST
 * ==============
 * Every image used by the site is listed here, once.
 *
 * Components refer to these keys only. Renaming a key is a compile-time error everywhere it
 * is used, which is intentional.
 */
import type { AssetDefinition, ImageAsset } from './types.ts';

export const ASSETS = {
  // ---------------------------------------------------------------------------
  // Brand
  // ---------------------------------------------------------------------------
  'brand.logo': {
    kind: 'image',
    src: '/brand/wada-chovu-logo.jpeg',
    width: 900,
    height: 529,
    alt: 'Chovu Chovu Brothers Ltd logo',
    note: 'Supplied logo, used unaltered. NOTE: the artwork itself reads "WADA CHOVU SERVICES LTD". Replace the file with the Chovu Chovu Brothers Ltd logo when it is available; the alt text above already uses the correct name.',
  },
  'brand.favicon': {
    kind: 'image',
    src: '/brand/favicon.png',
    width: 64,
    height: 64,
    alt: '',
    note: 'Raster icon cropped from the supplied logo. Replace with an official icon when available.',
  },
} satisfies Record<string, AssetDefinition>;

/** Every asset key in the manifest. */
export type AssetKey = keyof typeof ASSETS;

/** Keys whose asset is a plain image. */
export type ImageKey = { [K in AssetKey]: (typeof ASSETS)[K]['kind'] extends 'image' ? K : never }[AssetKey];

export function getImage(key: ImageKey): ImageAsset {
  return ASSETS[key] as ImageAsset;
}
