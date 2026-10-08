import type { StageSceneId } from '../../content/types.ts';
import type { SceneFactory } from '../types.ts';

/**
 * Scene registry. Each scene is a separate chunk that loads only when its slot approaches
 * the viewport. To add a scene, create a module that exports a SceneFactory, register it
 * here, and add a `data-stage` slot to the page.
 */
export const SCENE_LOADERS: Record<StageSceneId, () => Promise<SceneFactory>> = {
  hero: () => import('./hero.ts').then((m) => m.createHeroScene),
  scale: () => import('./scale.ts').then((m) => m.createScaleScene),
  featured: () => import('./featured.ts').then((m) => m.createFeaturedScene),
};
