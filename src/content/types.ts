/**
 * Shared asset types.
 *
 * Every visual asset on the site (photo, texture, 3D model) is described once in
 * `assets.ts` using one of these shapes. Components never hard-code file paths;
 * they reference asset keys, so swapping a placeholder for a real file only means
 * changing one entry in the manifest.
 */

export interface ImageAsset {
  kind: 'image';
  /** Path under /public, e.g. "/media/products/rice-25kg.jpg". */
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
  /** Where a stand-in photograph came from, and the licence that allows publishing it. */
  source?: string;
  license?: string;
  /** Maintainer note. Never rendered. */
  note?: string;
}

/**
 * A real photograph with a depth map from scripts/depth/process-photos.py. The renderer
 * (src/three/photo-depth.ts) uses `depth` to displace the photo in 3D. Where WebGL is not
 * available the photo itself is shown, so the static fallback is always a real image.
 */
export interface PhotoAsset {
  kind: 'photo';
  /** Display photograph under /public, e.g. "/media/photos/counter.jpg". */
  src: string;
  /** 8-bit greyscale depth map, same aspect ratio. White = near, black = far. */
  depth: string;
  /** Pixel size of `src` and `depth`. Reserves space and fixes the 3D plane's aspect. */
  width: number;
  height: number;
  /** Depth displacement in scene units, relative to the plane's height. Typical 0.2 to 0.4. */
  depthScale?: number;
  alt: string;
  placeholder?: boolean;
  position?: string;
  /** Optional responsive sources, as for ImageAsset. */
  srcset?: string;
  sizes?: string;
  /** Where the photograph came from, and the licence that allows publishing it. */
  source?: string;
  license?: string;
  note?: string;
}

export interface TextureAsset {
  kind: 'texture';
  /** Path under /public. Used as a surface texture on 3D objects. */
  src: string;
  placeholder?: boolean;
  source?: string;
  license?: string;
  note?: string;
}

/**
 * Placeholder geometry the 3D system can build in code. `card` is a product-photo panel: it
 * lets a scene show product imagery in place of a 3D object, with no scene-code change.
 * `plinth` is a round display base and `card` is a flat product-photo panel.
 */
export type ProceduralBuilder = 'carton' | 'tin' | 'pouch' | 'plinth' | 'card';

export interface ModelAsset {
  kind: 'model';
  /** Built-in placeholder geometry. Used when `url` is empty or fails to load. */
  builder: ProceduralBuilder;
  /** Optional .glb / .gltf file under /public, e.g. "/models/carton.glb". */
  url?: string;
  /**
   * Target size of the model's largest bounding-box dimension, in scene units.
   * Every model (placeholder or real) is normalised to this size and its base is
   * centred on the origin, so scene layout does not change when a model is swapped.
   */
  fit?: number;
  note?: string;
}

export type AssetDefinition = ImageAsset | PhotoAsset | TextureAsset | ModelAsset;

/** Identifiers for the 3D scenes that can be mounted into a stage slot. */
export type StageSceneId = 'hero' | 'scale' | 'featured';
