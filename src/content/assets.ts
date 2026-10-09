/**
 * ASSET MANIFEST
 * ==============
 * Every photo, texture and 3D model used by the site is listed here, once.
 *
 * To replace a placeholder with a real file:
 *   1. Copy the file into /public (for example /public/media/products/rice-25kg.jpg).
 *   2. Change `src` below to that path, set `alt` to a real description,
 *      and remove `placeholder: true`.
 *   3. Rebuild. No component or layout code needs to change.
 *
 * To replace a placeholder 3D object with a .glb / .gltf model:
 *   1. Copy the file into /public/models (for example /public/models/carton.glb).
 *   2. Set `url` on the matching `model.*` entry. Its size is normalised to `fit`,
 *      so the scenes keep the same composition and animation.
 *
 * Components refer to these keys only (for example 'category.one'). Renaming a key
 * is a compile-time error everywhere it is used, which is intentional.
 */
import type { AssetDefinition, ImageAsset, ModelAsset, TextureAsset } from './types.ts';

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
    note: 'Supplied logo. Shown as-is on white surfaces.',
  },
  'brand.favicon': {
    kind: 'image',
    src: '/brand/favicon.svg',
    width: 64,
    height: 64,
    alt: '',
    note: 'Simplified mark drawn from the supplied logo. Replace with an official icon when available.',
  },

  // ---------------------------------------------------------------------------
  // Hero and 3D fallbacks (shown when the 3D scene is off or unsupported)
  // ---------------------------------------------------------------------------
  'hero.fallback': {
    kind: 'image',
    src: '/media/placeholders/hero-fallback.svg',
    width: 1000,
    height: 1000,
    alt: 'Illustration of wholesale cartons and containers',
    placeholder: true,
    note: 'Static stand-in for the hero 3D scene. Replace with a square product or stack photo.',
  },
  'scale.fallback': {
    kind: 'image',
    src: '/media/placeholders/scale-fallback.svg',
    width: 1600,
    height: 1000,
    alt: 'Illustration of a warehouse rack with cartons',
    placeholder: true,
    note: 'Static stand-in for the warehouse 3D scene. Replace with a warehouse photo (16:10).',
  },
  'featured.fallback': {
    kind: 'image',
    src: '/media/placeholders/featured-fallback.svg',
    width: 1200,
    height: 900,
    alt: 'Illustration of tins and sacks on a plinth',
    placeholder: true,
    note: 'Static stand-in for the featured 3D scene. Replace with a product group photo (4:3).',
  },

  // ---------------------------------------------------------------------------
  // Business, warehouse and location photography
  // ---------------------------------------------------------------------------
  'about.image': {
    kind: 'image',
    src: '/media/placeholders/warehouse.svg',
    width: 800,
    height: 1000,
    alt: 'Placeholder: warehouse or team photo',
    placeholder: true,
    note: 'Shown in an arch frame. Portrait crop (4:5) works best.',
  },
  'location.image': {
    kind: 'image',
    src: '/media/placeholders/location.svg',
    width: 1280,
    height: 800,
    alt: 'Placeholder: business location photo',
    placeholder: true,
    note: 'Exterior or location photo (16:10).',
  },

  // ---------------------------------------------------------------------------
  // Product category images
  // ---------------------------------------------------------------------------
  'category.one': {
    kind: 'image',
    src: '/media/placeholders/product.svg',
    width: 800,
    height: 600,
    alt: 'Placeholder: product category photo',
    placeholder: true,
    note: 'Category photo (4:3). Each category has its own key so each can be swapped independently.',
  },
  'category.two': {
    kind: 'image',
    src: '/media/placeholders/product.svg',
    width: 800,
    height: 600,
    alt: 'Placeholder: product category photo',
    placeholder: true,
    note: 'Category photo (4:3).',
  },
  'category.three': {
    kind: 'image',
    src: '/media/placeholders/product.svg',
    width: 800,
    height: 600,
    alt: 'Placeholder: product category photo',
    placeholder: true,
    note: 'Category photo (4:3).',
  },
  'category.four': {
    kind: 'image',
    src: '/media/placeholders/product.svg',
    width: 800,
    height: 600,
    alt: 'Placeholder: product category photo',
    placeholder: true,
    note: 'Category photo (4:3).',
  },

  // ---------------------------------------------------------------------------
  // Featured product images
  // ---------------------------------------------------------------------------
  'product.one': {
    kind: 'image',
    src: '/media/placeholders/product.svg',
    width: 800,
    height: 600,
    alt: 'Placeholder: featured product photo',
    placeholder: true,
    note: 'Product photo (4:3), ideally on a plain background.',
  },
  'product.two': {
    kind: 'image',
    src: '/media/placeholders/product.svg',
    width: 800,
    height: 600,
    alt: 'Placeholder: featured product photo',
    placeholder: true,
    note: 'Product photo (4:3).',
  },
  'product.three': {
    kind: 'image',
    src: '/media/placeholders/product.svg',
    width: 800,
    height: 600,
    alt: 'Placeholder: featured product photo',
    placeholder: true,
    note: 'Product photo (4:3).',
  },
  'product.four': {
    kind: 'image',
    src: '/media/placeholders/product.svg',
    width: 800,
    height: 600,
    alt: 'Placeholder: featured product photo',
    placeholder: true,
    note: 'Product photo (4:3).',
  },

  // ---------------------------------------------------------------------------
  // 3D surface textures
  // ---------------------------------------------------------------------------
  'texture.cartonLabel': {
    kind: 'texture',
    src: '/brand/wada-chovu-logo.jpeg',
    note: 'Printed on the front label of placeholder cartons. Swap for product label artwork or a product photo.',
  },
  'texture.productCard': {
    kind: 'texture',
    src: '/brand/wada-chovu-logo.jpeg',
    note: 'Product photo shown on 3D product-photo cards (the `card` placeholder). Defaults to the logo so the demo shows the brand mark, not an empty frame. Replace with a real product photo.',
  },

  // ---------------------------------------------------------------------------
  // 3D models (placeholder geometry until a .glb / .gltf url is set)
  // ---------------------------------------------------------------------------
  'model.carton': {
    kind: 'model',
    builder: 'carton',
    fit: 1,
    note: 'Set url to "/models/carton.glb" to use a real carton model.',
  },
  'model.pallet': {
    kind: 'model',
    builder: 'pallet',
    fit: 1.2,
    note: 'Wooden pallet. Largest dimension is the width.',
  },
  'model.tin': {
    kind: 'model',
    builder: 'tin',
    fit: 0.72,
    note: 'Abstract product container (tin or canister).',
  },
  'model.sack': {
    kind: 'model',
    builder: 'sack',
    fit: 0.9,
    note: 'Abstract product bag or sack.',
  },
  'model.rack': {
    kind: 'model',
    builder: 'rack',
    fit: 2.6,
    note: 'Warehouse racking frame. Cartons are placed by the scene, not by the model.',
  },
  'model.plinth': {
    kind: 'model',
    builder: 'plinth',
    fit: 2,
    note: 'Round display base.',
  },
  'model.card': {
    kind: 'model',
    builder: 'card',
    fit: 1,
    note: 'Product-photo card (product imagery in a 3D scene). To show a product photo instead of a 3D object, set that model key\'s `builder` to \'card\' and point `texture.productCard` at the photo.',
  },
} satisfies Record<string, AssetDefinition>;

/** Every asset key in the manifest. */
export type AssetKey = keyof typeof ASSETS;

type KindOf<K extends AssetKey> = (typeof ASSETS)[K] extends { kind: infer T } ? T : never;

/** Keys whose asset is an image (photos, illustrations, fallbacks). */
export type ImageKey = { [K in AssetKey]: KindOf<K> extends 'image' ? K : never }[AssetKey];
/** Keys whose asset is a texture. */
export type TextureKey = { [K in AssetKey]: KindOf<K> extends 'texture' ? K : never }[AssetKey];
/** Keys whose asset is a 3D model. */
export type ModelKey = { [K in AssetKey]: KindOf<K> extends 'model' ? K : never }[AssetKey];

function requireKind<T extends AssetDefinition>(key: AssetKey, kind: T['kind']): T {
  const asset = ASSETS[key] as AssetDefinition;
  if (asset.kind !== kind) {
    throw new Error(`Asset "${key}" is a ${asset.kind}, expected ${kind}.`);
  }
  return asset as T;
}

export function getImage(key: ImageKey): ImageAsset {
  return requireKind<ImageAsset>(key, 'image');
}

export function getTexture(key: TextureKey): TextureAsset {
  return requireKind<TextureAsset>(key, 'texture');
}

export function getModel(key: ModelKey): ModelAsset {
  return requireKind<ModelAsset>(key, 'model');
}
