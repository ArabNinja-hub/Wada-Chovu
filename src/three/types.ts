import type * as THREE from 'three';
import type { QualityProfile } from '../client/quality.ts';
import type { ModelLibrary } from './models.ts';
import type { TextureLibrary } from './textures.ts';

/** Per-frame information given to every scene. */
export interface FrameState {
  /** Seconds since the stage started. Advances only while the stage is running. */
  time: number;
  /** Seconds since the previous frame, clamped. */
  dt: number;
  /**
   * Where the slot sits in the viewport: -1 when it is entirely below the centre
   * line and about to leave, 0 when centred, +1 when it is entirely above.
   * Scenes use this for scroll-linked movement.
   */
  progress: number;
  /** Smoothed pointer position in [-1, 1] on both axes. Always 0 on touch devices. */
  pointer: { x: number; y: number };
  /** True when the visitor asked for reduced motion. Scenes must hold still. */
  reduced: boolean;
  /** Width / height of the slot on screen. */
  aspect: number;
}

/** A mounted scene: the object graph, its camera, and an update function. */
export interface SceneHandle {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  /** Advances the scene for one frame. Called only while the slot is near the viewport. */
  update(frame: FrameState): void;
}

/** The stage slot a scene is mounted into. Scenes read their configuration from its attributes. */
export interface SceneSlot {
  el: HTMLElement;
}

/** Shared services provided to every scene factory. */
export interface SceneContext {
  renderer: THREE.WebGLRenderer;
  profile: QualityProfile;
  models: ModelLibrary;
  textures: TextureLibrary;
  /** Generated room reflections when the quality tier allows it, otherwise null. */
  environment: THREE.Texture | null;
}

export type SceneFactory = (ctx: SceneContext, slot: SceneSlot) => Promise<SceneHandle>;
