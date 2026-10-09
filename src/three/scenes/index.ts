import type { StageSceneId } from '../../content/types.ts';
import type { SceneFactory } from '../types.ts';

/**
 * Scene registry. Each scene is a separate chunk that loads only when its slot approaches
 * the viewport. To add a scene, create a module that exports a SceneFactory, register it
 * here, and add a `data-stage` slot to the page.
 */
export const SCENE_LOADERS: Record<StageSceneId, () => Promise<SceneFactory>> = {
  // Hero and shop-floor slots are depth-displaced photographs. Each slot's `data-photo`
  // attribute picks the photo, so both use the same scene module.
  hero: () => import('./photo.ts').then((m) => m.createPhotoScene),
  scale: () => import('./photo.ts').then((m) => m.createPhotoScene),
  featured: () => import('./featured.ts').then((m) => m.createFeaturedScene),
  assembly: () => import('./assembly.ts').then((m) => m.createAssemblyScene),
};
