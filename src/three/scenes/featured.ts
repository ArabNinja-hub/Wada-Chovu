import * as THREE from 'three';
import type { FrameState, SceneFactory, SceneHandle } from '../types.ts';
import { addContactShadow, addLighting, castShadows } from './common.ts';
import { bob, damp, frameCamera } from '../rig.ts';

/** Height of the plinth top in scene units, after the plinth scale below is applied. */
const PLINTH_TOP = 0.1 * 0.72;

/**
 * Featured scene: a small display group on a round plinth (two containers, two sacks and a
 * carton). It turns slowly and follows the pointer, which suits a product showcase.
 */
export const createFeaturedScene: SceneFactory = async (ctx) => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(24, 1, 0.1, 100);

  addLighting(scene, ctx, {
    key: { color: 0xfff4e6, intensity: 2.4, position: [4, 6, 5] },
    fill: { color: 0xdff5e4, intensity: 0.8, position: [-4, 3, 3] },
    rim: { color: 0x06fc07, intensity: 0.9, position: [-3, 4, -5] },
    hemi: { sky: 0xffffff, ground: 0x9bb59b, intensity: 1.15 },
    shadowExtent: 1.6,
    environmentIntensity: 0.5,
  });

  const group = new THREE.Group();
  scene.add(group);

  const plinth = await ctx.models.instance('model.plinth');
  plinth.scale.setScalar(0.72);
  group.add(plinth);
  addContactShadow(group, ctx, { x: 0, y: PLINTH_TOP, z: 0 }, { width: 1.7, depth: 1.7 }, { opacity: 0.22 });

  // Each item rests on the plinth and has its own float phase, so the group never moves in unison.
  const items: Array<{ object: THREE.Object3D; phase: number }> = [];
  const place = async (
    key: 'model.tin' | 'model.sack' | 'model.carton',
    at: { x: number; z: number },
    scale: number,
    turn: number,
  ) => {
    const object = await ctx.models.instance(key);
    object.position.set(at.x, PLINTH_TOP, at.z);
    object.scale.setScalar(scale);
    object.rotation.y = turn;
    group.add(object);
    items.push({ object, phase: items.length * 1.7 });
    addContactShadow(group, ctx, { x: at.x, y: PLINTH_TOP, z: at.z }, { width: scale * 1.1, depth: scale * 1.0 }, { opacity: 0.3 });
  };

  await place('model.tin', { x: -0.36, z: 0.02 }, 0.86, 0);
  await place('model.tin', { x: 0.02, z: -0.2 }, 0.66, 0.8);
  await place('model.sack', { x: -0.12, z: 0.36 }, 0.74, -0.3);
  await place('model.sack', { x: 0.44, z: 0.2 }, 0.6, 0.5);
  await place('model.carton', { x: -0.5, z: -0.32 }, 0.46, 0.4);

  castShadows(group, true);

  const target = new THREE.Vector3(0, 0.42, 0);
  const direction = new THREE.Vector3(0, 0.22, 1);
  const framing = { halfW: 0.96, halfH: 0.66 };

  let spin = 0;
  let pointerYaw = 0;

  const update = (frame: FrameState): void => {
    frameCamera(camera, target, direction, framing.halfW, framing.halfH, frame.aspect);

    if (frame.reduced) {
      group.rotation.set(0, 0, 0);
      for (const item of items) item.object.position.y = PLINTH_TOP;
      return;
    }

    spin += frame.dt * 0.14;
    pointerYaw = damp(pointerYaw, frame.pointer.x * 0.35, 3, frame.dt);
    group.rotation.y = spin + pointerYaw;
    group.rotation.x = damp(group.rotation.x, frame.pointer.y * 0.06, 3.5, frame.dt);

    for (const item of items) {
      item.object.position.y = PLINTH_TOP + bob(frame.time, 0.012, 1.1, item.phase);
    }
  };

  const handle: SceneHandle = { scene, camera, update };
  return handle;
};
