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
  /** Maintainer note. Never rendered. */
  note?: string;
}

export interface TextureAsset {
  kind: 'texture';
  /** Path under /public. Used as a surface texture on 3D objects. */
  src: string;
  placeholder?: boolean;
  note?: string;
}

/**
 * Placeholder geometry the 3D system can build in code. `card` is a product-photo panel: it
 * lets a scene show product imagery in place of a 3D object, with no scene-code change.
 * `counter` is a shop display counter, `shelf` is retail gondola shelving and `pouch` is a
 * product bag.
 */
export type ProceduralBuilder = 'carton' | 'counter' | 'tin' | 'pouch' | 'shelf' | 'plinth' | 'card';

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

export type AssetDefinition = ImageAsset | TextureAsset | ModelAsset;

/** Identifiers for the 3D scenes that can be mounted into a stage slot. */
export type StageSceneId = 'hero' | 'scale' | 'featured';
