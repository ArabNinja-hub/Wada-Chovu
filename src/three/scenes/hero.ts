import * as THREE from 'three';
import type { FrameState, SceneFactory, SceneHandle } from '../types.ts';
import { addContactShadow, addLighting, castShadows, seededRandom } from './common.ts';
import { bob, damp, frameCamera } from '../rig.ts';

/**
 * Hero scene: a wholesale stack on a pallet, with two containers at the base and one carton
 * floating above. It is calm and lit as a studio product set. It holds still for reduced motion.
 */
export const createHeroScene: SceneFactory = async (ctx) => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);

  addLighting(scene, ctx, {
    key: { color: 0xfff1dc, intensity: 2.7, position: [-3.5, 6, 5] },
    fill: { color: 0xd6ecff, intensity: 0.6, position: [4, 2.5, 3] },
    rim: { color: 0x06fc07, intensity: 1.1, position: [3.5, 4, -5] },
    hemi: { sky: 0xe7f7ea, ground: 0x143a1f, intensity: 1.1 },
    shadowExtent: 2.4,
    environmentIntensity: 0.55,
  });

  const root = new THREE.Group();
  scene.add(root);

  // Base: pallet and two containers.
  const pallet = await ctx.models.instance('model.pallet');
  root.add(pallet);

  const tinA = await ctx.models.instance('model.tin');
  tinA.position.set(0.92, 0, 0.36);
  tinA.scale.setScalar(0.5);
  const tinB = await ctx.models.instance('model.tin');
  tinB.position.set(0.98, 0, -0.26);
  tinB.scale.setScalar(0.42);
  const sack = await ctx.models.instance('model.sack');
  sack.position.set(-0.94, 0, -0.12);
  sack.scale.setScalar(0.62);
  root.add(tinA, tinB, sack);

  // Stack: two layers of four and two rotated cartons, then one floating above.
  const CARTON = 0.56;
  const layerOne: Array<[number, number, number]> = [
    [-0.3, 0.12, -0.2],
    [0.3, 0.12, -0.2],
    [-0.3, 0.12, 0.2],
    [0.3, 0.12, 0.2],
  ];
  const layerTwo: Array<[number, number, number]> = [
    [-0.2, 0.456, 0],
    [0.2, 0.456, 0],
  ];
  const random = seededRandom(7);
  const stack: THREE.Object3D[] = [];
  for (const [x, y, z] of layerOne) {
    const c = await ctx.models.instance('model.carton');
    c.position.set(x, y, z);
    c.scale.setScalar(CARTON);
    c.rotation.y = (random() - 0.5) * 0.05;
    stack.push(c);
  }
  for (const [x, y, z] of layerTwo) {
    const c = await ctx.models.instance('model.carton');
    c.position.set(x, y, z);
    c.scale.setScalar(CARTON);
    c.rotation.y = Math.PI / 2;
    stack.push(c);
  }
  root.add(...stack);

  const floating = await ctx.models.instance('model.carton');
  floating.scale.setScalar(CARTON * 0.92);
  floating.position.set(0.04, 1.3, 0.02);
  root.add(floating);

  // Contact shadows are cheap on every tier. Real shadows come from the key light on high.
  castShadows(root, true);
  addContactShadow(root, ctx, { x: 0, z: 0 }, { width: 1.55, depth: 1.35 }, { opacity: 0.38 });
  addContactShadow(root, ctx, { x: 0.94, z: 0.02 }, { width: 0.7, depth: 0.9 }, { opacity: 0.28 });
  addContactShadow(root, ctx, { x: -0.94, z: -0.12 }, { width: 0.6, depth: 0.6 }, { opacity: 0.26 });

  const target = new THREE.Vector3(0, 0.82, 0);
  const direction = new THREE.Vector3(0, 0.26, 1);
  const framing = { halfW: 1.22, halfH: 1.05 };
  const base = { yaw: -0.5 };

  // Floating carton spins slowly. Tins turn at a different pace, so the motion never repeats.
  const tins = [tinA, tinB];

  const update = (frame: FrameState): void => {
    frameCamera(camera, target, direction, framing.halfW, framing.halfH, frame.aspect);

    if (frame.reduced) {
      root.rotation.y = base.yaw;
      floating.position.y = 1.3;
      return;
    }

    // Pointer and idle motion. Scroll pulls the stack gently as the section leaves the screen.
    const idle = bob(frame.time, 0.05, 0.22);
    const scrollTurn = -frame.progress * 0.42;
    const targetYaw = base.yaw + idle + frame.pointer.x * 0.32 + scrollTurn;
    root.rotation.y = damp(root.rotation.y, targetYaw, 3, frame.dt);
    root.rotation.x = damp(root.rotation.x, frame.pointer.y * 0.08, 3, frame.dt);
    root.position.y = damp(root.position.y, -frame.progress * 0.08, 3, frame.dt);

    floating.position.y = 1.3 + bob(frame.time, 0.05, 1.05);
    floating.rotation.y += frame.dt * 0.32;
    floating.rotation.z = bob(frame.time, 0.035, 0.7);

    tins.forEach((tin, i) => {
      tin.rotation.y += frame.dt * (0.18 + i * 0.07);
    });
  };

  const handle: SceneHandle = { scene, camera, update };
  return handle;
};
