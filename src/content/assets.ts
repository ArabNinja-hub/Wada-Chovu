/**
 * ASSET MANIFEST
 * ==============
 * Every photograph, depth map, texture and 3D model used by the site is listed here, once.
 *
 * ADDING A PHOTO (no animation code needed)
 *   1. Put the original file in a folder outside the repository, and add an entry to
 *      scripts/depth/photos.json (id, file, sourceUrl, license, subject).
 *   2. Run:  python3 scripts/depth/process-photos.py --sources <folder>
 *      This writes public/media/photos/<id>.jpg and <id>-depth.png and prints the size.
 *   3. Add a `photo.<name>` entry below with those paths and the printed width and height.
 *   4. Use it in a section with renderStageSlot({ fallback: 'photo.<name>' }) to make it a
 *      3D depth scene, or with renderImage('photo.<name>') for a plain photograph.
 *
 * REPLACING A 3D MODEL
 *   Copy the .glb / .gltf into /public/models and set `url` on the matching `model.*` entry.
 *   Its size is normalised to `fit`, so scene layout does not change.
 *
 * Components refer to these keys only. Renaming a key is a compile-time error everywhere it
 * is used, which is intentional.
 */
import type { AssetDefinition, ImageAsset, ModelAsset, PhotoAsset, TextureAsset } from './types.ts';

// Before launch: link each Pexels entry to the exact photo page, not the search page.
const SOURCE_TINS = 'https://www.pexels.com/search/canned%20food/';
const LICENSE_PEXELS = 'Pexels License (free to use; attribution not required)';
const SOURCE_SHELVES = 'https://www.pexels.com/search/empty%20shelves/';
const SOURCE_COUNTER = 'https://unsplash.com/photos/a-minimalist-shop-with-shelves-and-products-nzisN6dYiV8';
const SOURCE_OWNER = 'Supplied by the business owner';
const LICENSE_OWNER = 'unverified, supplied by owner';
const LICENSE_UNSPLASH = 'Unsplash License (free to use; attribution not required)';

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

  // ---------------------------------------------------------------------------
  // Product assembly section. Owner-supplied photographs, used at their real paths.
  // Scene order is set by ASSEMBLY_IMAGE_KEYS below. Each is a flat photograph in 3D.
  // ---------------------------------------------------------------------------
  'assembly.bike': {
    kind: 'image',
    src: '/media/products/bike.jpeg',
    width: 1080,
    height: 1080,
    alt: 'Five black bicycles standing side by side.',
    placeholder: true,
    source: SOURCE_OWNER,
    license: LICENSE_OWNER,
    note: 'Supplied by the business owner. Licence and right to publish are unverified. Replace with the owner\'s own photograph when confirmed.',
  },
  'assembly.stack': {
    kind: 'image',
    src: '/media/products/stack.jpeg',
    width: 1080,
    height: 601,
    alt: 'Supermarket shelves stocked with drinks and snacks.',
    placeholder: true,
    source: SOURCE_OWNER,
    license: LICENSE_OWNER,
    note: 'Supplied by the business owner. Shows several third-party brands (drinks and snack packaging). Brand use and licence must be cleared before launch, or replaced with a neutral photograph.',
  },
  'assembly.water': {
    kind: 'image',
    src: '/media/products/water.jpeg',
    width: 1080,
    height: 1080,
    alt: 'Drinks in bottles and cans, arranged on a white background.',
    placeholder: true,
    source: SOURCE_OWNER,
    license: LICENSE_OWNER,
    note: 'Supplied by the business owner. Shows several third-party drink brands. Brand use and licence must be cleared before launch, or replaced with a neutral photograph.',
  },
  'assembly.bicycles': {
    kind: 'image',
    src: '/media/products/bicycles.jpeg',
    width: 1079,
    height: 669,
    alt: 'Silver and black city bicycles with coloured baskets on a rack.',
    placeholder: true,
    source: SOURCE_OWNER,
    license: LICENSE_OWNER,
    note: 'Supplied by the business owner. Licence and right to publish are unverified. Replace with the owner\'s own photograph when confirmed.',
  },

  // ---------------------------------------------------------------------------
  // 3D photo scenes. Each is a real photograph displaced by its depth map.
  // The `fallback` image shown without WebGL is the same photograph.
  // ---------------------------------------------------------------------------
  'photo.hero': {
    kind: 'photo',
    src: '/media/photos/counter.jpg',
    depth: '/media/photos/counter-depth.png',
    width: 960,
    height: 1280,
    depthScale: 0.2,
    alt: 'Stand-in photograph of a shop counter with shelves behind it. It is not a photograph of Chovu Chovu Brothers Ltd.',
    placeholder: true,
    source: SOURCE_COUNTER,
    license: LICENSE_UNSPLASH,
    note: 'Hero 3D photo. Depth map from FastDepth (scripts/depth). Replace with a portrait photo of the shop counter.',
  },
  'photo.shopFloor': {
    kind: 'photo',
    src: '/media/photos/tins.jpg',
    depth: '/media/photos/tins-depth.png',
    width: 500,
    height: 333,
    depthScale: 0.2,
    alt: 'Stand-in photograph of stacked canned goods. It is not a photograph of Chovu Chovu Brothers Ltd.',
    placeholder: true,
    source: SOURCE_TINS,
    license: LICENSE_PEXELS,
    note: 'Shop-floor 3D photo. Depth map from FastDepth (scripts/depth). The earlier shop-floor photograph showed another business and was removed. Replace with a landscape photo of the Chovu Chovu shop floor.',
  },
  // ---------------------------------------------------------------------------
  // Static photographs (fallbacks and plain images)
  // ---------------------------------------------------------------------------
  'featured.fallback': {
    kind: 'image',
    src: '/media/photos/tins.jpg',
    width: 500,
    height: 333,
    alt: 'Stand-in photograph of stacked canned goods. It is not a photograph of Chovu Chovu Brothers Ltd.',
    placeholder: true,
    source: SOURCE_TINS,
    license: LICENSE_PEXELS,
    note: 'Static image shown when WebGL is unavailable for the featured 3D scene. Replace with a product group photo (3:2).',
  },
  'about.image': {
    kind: 'image',
    src: '/media/photos/counter.jpg',
    width: 960,
    height: 1280,
    alt: 'Stand-in photograph of a shop counter with shelves behind it. It is not a photograph of Chovu Chovu Brothers Ltd.',
    placeholder: true,
    source: SOURCE_COUNTER,
    license: LICENSE_UNSPLASH,
    note: 'Shown in an arch frame. Portrait crop (4:5) works best. Replace with a photo of the shop front or team.',
  },
  'location.image': {
    kind: 'image',
    src: '/media/photos/tins.jpg',
    width: 500,
    height: 333,
    alt: 'Stand-in photograph of stacked canned goods. It is not a photograph of the shop exterior.',
    placeholder: true,
    source: SOURCE_TINS,
    license: LICENSE_PEXELS,
    note: 'Shop exterior or street view (16:10). No licensed exterior photograph is in the repository yet.',
  },

  // ---------------------------------------------------------------------------
  // Product category and featured product images (stand-ins until real photos are supplied)
  // ---------------------------------------------------------------------------
  'category.one': {
    kind: 'image',
    src: '/media/photos/shelves.jpg',
    width: 500,
    height: 750,
    alt: 'Stand-in photograph of empty wooden shelves against a plain wall. It is not a photograph of Chovu Chovu Brothers Ltd.',
    placeholder: true,
    source: SOURCE_SHELVES,
    license: LICENSE_PEXELS,
    note: 'Category photo. Each category has its own key so each can be swapped independently.',
  },
  'category.two': {
    kind: 'image',
    src: '/media/photos/counter.jpg',
    width: 960,
    height: 1280,
    alt: 'Stand-in photograph of a shop counter with shelves behind it. It is not a photograph of Chovu Chovu Brothers Ltd.',
    placeholder: true,
    source: SOURCE_COUNTER,
    license: LICENSE_UNSPLASH,
    note: 'Category photo.',
  },
  'category.three': {
    kind: 'image',
    src: '/media/photos/tins.jpg',
    width: 500,
    height: 333,
    alt: 'Stand-in photograph of stacked canned goods. It is not a photograph of Chovu Chovu Brothers Ltd.',
    placeholder: true,
    source: SOURCE_TINS,
    license: LICENSE_PEXELS,
    note: 'Category photo.',
  },
  'category.four': {
    kind: 'image',
    src: '/media/photos/shelves.jpg',
    width: 500,
    height: 750,
    alt: 'Stand-in photograph of empty wooden shelves against a plain wall. It is not a photograph of Chovu Chovu Brothers Ltd.',
    placeholder: true,
    source: SOURCE_SHELVES,
    license: LICENSE_PEXELS,
    note: 'Category photo.',
  },
  'product.one': {
    kind: 'image',
    src: '/media/photos/tins.jpg',
    width: 500,
    height: 333,
    alt: 'Stand-in photograph of stacked canned goods. It is not a photograph of Chovu Chovu Brothers Ltd.',
    placeholder: true,
    source: SOURCE_TINS,
    license: LICENSE_PEXELS,
    note: 'Product photo, ideally on a plain background.',
  },
  'product.two': {
    kind: 'image',
    src: '/media/photos/counter.jpg',
    width: 960,
    height: 1280,
    alt: 'Stand-in photograph of a shop counter with shelves behind it. It is not a photograph of Chovu Chovu Brothers Ltd.',
    placeholder: true,
    source: SOURCE_COUNTER,
    license: LICENSE_UNSPLASH,
    note: 'Product photo.',
  },
  'product.three': {
    kind: 'image',
    src: '/media/photos/tins.jpg',
    width: 500,
    height: 333,
    alt: 'Stand-in photograph of stacked canned goods. It is not a photograph of Chovu Chovu Brothers Ltd.',
    placeholder: true,
    source: SOURCE_TINS,
    license: LICENSE_PEXELS,
    note: 'Product photo.',
  },
  'product.four': {
    kind: 'image',
    src: '/media/photos/shelves.jpg',
    width: 500,
    height: 750,
    alt: 'Stand-in photograph of empty wooden shelves against a plain wall. It is not a photograph of Chovu Chovu Brothers Ltd.',
    placeholder: true,
    source: SOURCE_SHELVES,
    license: LICENSE_PEXELS,
    note: 'Product photo.',
  },

  // ---------------------------------------------------------------------------
  // 3D surface textures
  // ---------------------------------------------------------------------------
  'texture.cartonLabel': {
    kind: 'texture',
    src: '/media/photos/tins.jpg',
    placeholder: true,
    source: SOURCE_TINS,
    license: LICENSE_PEXELS,
    note: 'Printed on the front label of the box fallback geometry. Replace with label artwork.',
  },
  'texture.productCard': {
    kind: 'texture',
    src: '/media/photos/tins.jpg',
    placeholder: true,
    source: SOURCE_TINS,
    license: LICENSE_PEXELS,
    note: 'Product photo shown on the flat product-photo card (the `card` model). The card is a flat photograph, not a 3D object.',
  },

  // ---------------------------------------------------------------------------
  // 3D models. Real GLB files; the builder is the fallback if a file fails to load.
  // Only generic packaging is used, so no product category is implied. Attribution is in
  // public/models/CREDITS.md.
  // ---------------------------------------------------------------------------
  'model.box': {
    kind: 'model',
    url: '/models/box-textured.glb',
    builder: 'carton',
    fit: 0.9,
    note: 'Khronos BoxTextured sample (CC BY 4.0, attribution in public/models/CREDITS.md). Generic placeholder packaging, not a product sold by the shop.',
  },
  'model.plinth': {
    kind: 'model',
    builder: 'plinth',
    fit: 2,
    note: 'Round display base (procedural geometry, no file).',
  },
  'model.card': {
    kind: 'model',
    builder: 'card',
    fit: 1,
    note: 'Flat product-photo card using texture.productCard. Use only for product imagery, not as a 3D object.',
  },
} satisfies Record<string, AssetDefinition>;

/**
 * Photographs for the product assembly section, in the order the scene places them. The
 * order is part of the layout, so change it only together with motion/assembly-plan.ts.
 */
export const ASSEMBLY_IMAGE_KEYS = ['assembly.bike', 'assembly.stack', 'assembly.water', 'assembly.bicycles'] as const satisfies readonly ImageKey[];

/** Every asset key in the manifest. */
export type AssetKey = keyof typeof ASSETS;

type KindOf<K extends AssetKey> = (typeof ASSETS)[K] extends { kind: infer T } ? T : never;

/** Keys whose asset is a plain image (includes photographs used as images). */
export type ImageKey = { [K in AssetKey]: KindOf<K> extends 'image' | 'photo' ? K : never }[AssetKey];
/** Keys whose asset is a photograph with a depth map (3D photo scenes). */
export type PhotoKey = { [K in AssetKey]: KindOf<K> extends 'photo' ? K : never }[AssetKey];
/** Keys whose asset is a texture. */
export type TextureKey = { [K in AssetKey]: KindOf<K> extends 'texture' ? K : never }[AssetKey];
/** Keys whose asset is a 3D model. */
export type ModelKey = { [K in AssetKey]: KindOf<K> extends 'model' ? K : never }[AssetKey];

function requireKind<T extends AssetDefinition>(key: AssetKey, kinds: ReadonlyArray<T['kind']>): T {
  const asset = ASSETS[key] as AssetDefinition;
  if (!(kinds as ReadonlyArray<string>).includes(asset.kind)) {
    throw new Error(`Asset "${key}" is a ${asset.kind}, expected ${kinds.join(' or ')}.`);
  }
  return asset as T;
}

/** Shared shape for anything rendered as an <img>. Photographs carry the same fields. */
export type ImageLike = ImageAsset | PhotoAsset;

export function getImage(key: ImageKey): ImageLike {
  return requireKind<ImageLike>(key, ['image', 'photo']);
}

export function getPhoto(key: PhotoKey): PhotoAsset {
  return requireKind<PhotoAsset>(key, ['photo']);
}

export function getTexture(key: TextureKey): TextureAsset {
  return requireKind<TextureAsset>(key, ['texture']);
}

export function getModel(key: ModelKey): ModelAsset {
  return requireKind<ModelAsset>(key, ['model']);
}
