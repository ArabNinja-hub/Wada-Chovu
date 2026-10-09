import * as THREE from 'three';
import type { FrameState, SceneFactory, SceneHandle } from '../types.ts';
import { addGroundPool, addLighting, castShadows, contactShadowFor } from './common.ts';
import { bob, damp, frameCamera } from '../rig.ts';
import { boundsOf, fitLargest, frameContent, restBaseAt, ring } from '../layout.ts';

/**
 * Featured scene: a small display group on a round plinth. It mixes 3D containers and pouches
 * with a product-photo card, showing that a placeholder object and product imagery can occupy
 * the same composition. Items are placed on a measured ring inside the plinth, so any model sizes
 * fit. The camera frames the measured content.
 */
export const createFeaturedScene: SceneFactory = async (ctx) => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(24, 1, 0.1, 100);

  addLighting(scene, ctx, {
    key: { color: 0xfff4e6, intensity: 2.4, position: [4, 6, 5] },
    fill: { color: 0xdff5e4, intensity: 0.85, position: [-4, 3, 3] },
    rim: { color: 0x06fc07, intensity: 0.9, position: [-3, 4, -5] },
    hemi: { sky: 0xffffff, ground: 0x9bb59b, intensity: 1.15 },
    shadowExtent: 1.6,
    environmentIntensity: 0.5,
  });

  const ground = new THREE.Group();
  scene.add(ground);
  addGroundPool(ground, ctx, { radius: 1.8, color: 0x0a2413, opacity: 0.07, receiveShadow: ctx.profile.shadows });

  const group = new THREE.Group();
  scene.add(group);

  // Plinth, scaled to a target diameter.
  const plinth = await ctx.models.instance('model.plinth');
  fitLargest(plinth, 1.5);
  group.add(plinth);
  const pb = boundsOf(plinth);
  const plinthTop = pb.max.y;
  const plinthR = pb.size.x / 2;

  // A display group: containers plus a product-photo card. Each item is sized relative to the
  // plinth and placed on a ring inside it, resting on the plinth top.
  const itemKeys = ['model.card', 'model.tin', 'model.pouch', 'model.tin', 'model.pouch'] as const;
  const positions = ring(itemKeys.length, plinthR * 0.6, Math.PI / 2);
  const items: Array<{ object: THREE.Object3D; phase: number }> = [];
  for (let i = 0; i < itemKeys.length; i++) {
    const object = await ctx.models.instance(itemKeys[i]);
    fitLargest(object, plinthR * 0.65);
    object.position.x = positions[i].x;
    object.position.z = positions[i].z;
    object.rotation.y = (i / itemKeys.length) * Math.PI * 2 + 0.4;
    restBaseAt(object, plinthTop);
    group.add(object);
    items.push({ object, phase: i * 1.7 });
    contactShadowFor(ground, ctx, object, 0.3);
  }
  contactShadowFor(ground, ctx, plinth, 0.22);

  castShadows(group, true);

  // Adaptive camera: frame the measured content.
  const { target, halfW, halfH } = frameContent(group, 1.22);
  const direction = new THREE.Vector3(0, 0.22, 1);

  let spin = 0;
  let pointerYaw = 0;

  const update = (frameState: FrameState): void => {
    frameCamera(camera, target, direction, halfW, halfH, frameState.aspect);

    if (frameState.reduced) {
      group.rotation.set(0, 0, 0);
      for (const item of items) item.object.position.y = plinthTop;
      return;
    }

    spin += frameState.dt * 0.14;
    pointerYaw = damp(pointerYaw, frameState.pointer.x * 0.35, 3, frameState.dt);
    group.rotation.y = spin + pointerYaw;
    group.rotation.x = damp(group.rotation.x, frameState.pointer.y * 0.06, 3.5, frameState.dt);

    for (const item of items) {
      item.object.position.y = plinthTop + bob(frameState.time, 0.012, 1.1, item.phase);
    }
  };

  const handle: SceneHandle = { scene, camera, update };
  return handle;
};
