import * as THREE from 'three';
import type { SceneContext } from '../types.ts';
import { configureShadowLight } from '../rig.ts';
import { boundsOf } from '../layout.ts';

/**
 * Shared lighting, ground and contact-shadow helpers. Every scene uses the same rig, so the
 * three scenes feel like one photographic set. All placement helpers here are measured from
 * the real objects, so they keep working when a placeholder is swapped for a real model.
 */

type Vec3 = [number, number, number];

export interface LightingPreset {
  key: { color: THREE.ColorRepresentation; intensity: number; position: Vec3 };
  fill: { color: THREE.ColorRepresentation; intensity: number; position: Vec3 };
  rim: { color: THREE.ColorRepresentation; intensity: number; position: Vec3 };
  hemi: { sky: THREE.ColorRepresentation; ground: THREE.ColorRepresentation; intensity: number };
  /** Half-size of the shadow camera frustum, in scene units. */
  shadowExtent: number;
  /** Strength of image-based reflections (0 to 1). Only applied when an environment exists. */
  environmentIntensity: number;
}

/** Adds the lighting rig and returns the key light, which casts the scene's real shadows. */
export function addLighting(scene: THREE.Scene, ctx: SceneContext, preset: LightingPreset): THREE.DirectionalLight {
  const hemi = new THREE.HemisphereLight(preset.hemi.sky, preset.hemi.ground, preset.hemi.intensity);

  const key = new THREE.DirectionalLight(preset.key.color, preset.key.intensity);
  key.position.set(...preset.key.position);
  configureShadowLight(key, ctx.profile.shadows, ctx.profile.shadowMapSize, preset.shadowExtent);

  const fill = new THREE.DirectionalLight(preset.fill.color, preset.fill.intensity);
  fill.position.set(...preset.fill.position);

  const rim = new THREE.DirectionalLight(preset.rim.color, preset.rim.intensity);
  rim.position.set(...preset.rim.position);

  scene.add(hemi, key, fill, rim);

  if (ctx.environment) {
    scene.environment = ctx.environment;
    scene.environmentIntensity = preset.environmentIntensity;
  }
  return key;
}

/**
 * Soft radial "light pool" on the floor. Objects sit on a lit studio patch rather than
 * floating in empty space, and on the high quality tier the pool catches the real shadow maps.
 * The colour is tinted per scene to suit its backdrop.
 */
export function addGroundPool(
  parent: THREE.Object3D,
  ctx: SceneContext,
  options: { radius: number; color: THREE.ColorRepresentation; opacity?: number; receiveShadow?: boolean },
): THREE.Mesh {
  const material = new THREE.MeshStandardMaterial({
    color: options.color,
    map: ctx.textures.softDisc(),
    roughness: 1,
    metalness: 0,
    transparent: true,
    opacity: options.opacity ?? 1,
    depthWrite: false,
  });
  const disc = new THREE.Mesh(new THREE.CircleGeometry(1, 72), material);
  disc.scale.setScalar(options.radius);
  disc.rotation.x = -Math.PI / 2;
  disc.position.y = 0.001;
  disc.receiveShadow = options.receiveShadow ?? false;
  disc.renderOrder = -2;
  parent.add(disc);
  return disc;
}

/**
 * Soft contact shadow under an object. It is a textured plane, so it costs almost nothing and
 * works on every quality tier. Real shadow maps are reserved for the high tier, where the
 * ground pool catches them.
 */
export function addContactShadow(
  parent: THREE.Object3D,
  ctx: SceneContext,
  at: { x: number; y?: number; z: number },
  size: { width: number; depth: number },
  options: { opacity?: number; color?: THREE.ColorRepresentation } = {},
): void {
  const material = new THREE.MeshBasicMaterial({
    map: ctx.textures.blobShadow(),
    color: options.color ?? 0x000000,
    transparent: true,
    opacity: options.opacity ?? 0.35,
    depthWrite: false,
  });
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(size.width, size.depth), material);
  plane.rotation.x = -Math.PI / 2;
  plane.position.set(at.x, (at.y ?? 0) + 0.002, at.z);
  plane.renderOrder = -1;
  parent.add(plane);
}

/**
 * A contact shadow sized and centred from an object's measured footprint. Use this instead of
 * hard-coded shadow sizes so the shadow always matches whatever model is loaded.
 */
export function contactShadowFor(
  parent: THREE.Object3D,
  ctx: SceneContext,
  object: THREE.Object3D,
  opacity = 0.3,
): void {
  const b = boundsOf(object);
  addContactShadow(
    parent,
    ctx,
    { x: b.center.x, y: b.min.y, z: b.center.z },
    { width: Math.max(b.size.x, 0.05) * 1.15, depth: Math.max(b.size.z, 0.05) * 1.15 },
    { opacity },
  );
}

/** Small deterministic random source, so compositions are identical on every visit. */
export function seededRandom(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Enables shadow casting and receiving on every mesh in a subtree. */
export function castShadows(object: THREE.Object3D, receive = true): void {
  object.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh.isMesh) {
      mesh.castShadow = true;
      mesh.receiveShadow = receive;
    }
  });
}
