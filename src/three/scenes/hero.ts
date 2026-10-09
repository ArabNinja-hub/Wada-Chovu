import * as THREE from 'three';
import type { FrameState, SceneFactory, SceneHandle } from '../types.ts';
import { addGroundPool, addLighting, castShadows, contactShadowFor, seededRandom } from './common.ts';
import { bob, damp, frameCamera } from '../rig.ts';
import { arrangeGrid, boundsOf, fitLargest, fitWithin, frameContent, heightOf, restBaseAt } from '../layout.ts';

/**
 * Hero scene: a stack of product boxes on a shop display counter, with containers and a pouch
 * beside it and one box floating above. Everything is placed from measured sizes, so swapping
 * any model keeps the layout. The camera frames the measured content, so a different-sized
 * model is framed automatically.
 */
export const createHeroScene: SceneFactory = async (ctx) => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);

  addLighting(scene, ctx, {
    key: { color: 0xfff1dc, intensity: 2.7, position: [-3.5, 6, 5] },
    fill: { color: 0xd6ecff, intensity: 0.7, position: [4, 2.5, 3] },
    rim: { color: 0x06fc07, intensity: 1.1, position: [3.5, 4, -5] },
    hemi: { sky: 0xe7f7ea, ground: 0x143a1f, intensity: 1.1 },
    shadowExtent: 2.4,
    environmentIntensity: 0.55,
  });

  // Ground pool and content are separate groups, so the camera frames only the content.
  const ground = new THREE.Group();
  scene.add(ground);
  addGroundPool(ground, ctx, { radius: 2.4, color: 0x3a8a4a, opacity: 0.5, receiveShadow: ctx.profile.shadows });

  const root = new THREE.Group();
  scene.add(root);
  const random = seededRandom(7);

  // Display counter as the base.
  const counter = await ctx.models.instance('model.counter');
  root.add(counter);
  const pb = boundsOf(counter);
  const counterTop = pb.max.y;
  const counterW = pb.size.x;
  const counterD = pb.size.z;

  // Stack of cartons: 4 on the counter, 2 above, 1 on top. Each carton is scaled to fit a
  // cell on the counter, so any carton model produces a neat, non-overlapping stack.
  const stack = new THREE.Group();
  root.add(stack);
  const gap = 0.015;
  const margin = 0.92;
  const cellW = (counterW * margin) / 2 - gap / 2;
  const cellD = (counterD * margin) / 2 - gap / 2;

  const makeCarton = async () => {
    const c = await ctx.models.instance('model.carton');
    fitWithin(c, { x: cellW, y: 1e6, z: cellD });
    c.rotation.y = (random() - 0.5) * 0.05;
    stack.add(c);
    return c;
  };

  const layer1: THREE.Object3D[] = [];
  for (let i = 0; i < 4; i++) layer1.push(await makeCarton());
  const cb = boundsOf(layer1[0]);
  const spacingX = cb.size.x + gap;
  const spacingZ = cb.size.z + gap;
  const h1 = arrangeGrid(layer1, { y: counterTop, cols: 2, spacingX, spacingZ });

  const layer2: THREE.Object3D[] = [];
  for (let i = 0; i < 2; i++) layer2.push(await makeCarton());
  const h2 = arrangeGrid(layer2, { y: counterTop + h1 + gap, cols: 2, spacingX, spacingZ });

  const topCarton = await makeCarton();
  topCarton.position.x = 0;
  topCarton.position.z = 0;
  restBaseAt(topCarton, counterTop + h1 + gap + h2 + gap);
  const stackTop = counterTop + h1 + gap + h2 + gap + heightOf(topCarton);

  // Floating carton above the stack.
  const floatGap = 0.28;
  const floating = await makeCarton();
  floating.position.x = 0;
  floating.position.z = 0;
  restBaseAt(floating, stackTop + floatGap);
  const floatBaseY = floating.position.y;

  // Containers on the ground beside the counter, sized relative to the counter.
  const tinA = await ctx.models.instance('model.tin');
  fitLargest(tinA, counterW * 0.24);
  root.add(tinA);
  restBaseAt(tinA, 0);
  tinA.position.x = counterW / 2 + boundsOf(tinA).size.x / 2 + 0.07;
  tinA.position.z = counterD * 0.14;

  const tinB = await ctx.models.instance('model.tin');
  fitLargest(tinB, counterW * 0.2);
  root.add(tinB);
  restBaseAt(tinB, 0);
  tinB.position.x = tinA.position.x;
  tinB.position.z = -counterD * 0.14 - boundsOf(tinB).size.z * 0.6;

  const pouch = await ctx.models.instance('model.pouch');
  fitLargest(pouch, counterW * 0.26);
  root.add(pouch);
  restBaseAt(pouch, 0);
  pouch.position.x = -(counterW / 2 + boundsOf(pouch).size.x / 2 + 0.07);
  pouch.position.z = 0;

  castShadows(root, true);
  // Measured contact shadows under the ground items.
  contactShadowFor(ground, ctx, counter, 0.4);
  contactShadowFor(ground, ctx, tinA, 0.3);
  contactShadowFor(ground, ctx, tinB, 0.28);
  contactShadowFor(ground, ctx, pouch, 0.28);

  // Adaptive camera: frame the measured content.
  const frame = frameContent(root, 1.24);
  const { target, halfW, halfH } = frame;
  const direction = new THREE.Vector3(0, 0.24, 1);
  const base = { yaw: -0.5 };

  const tins = [tinA, tinB];

  const update = (frameState: FrameState): void => {
    frameCamera(camera, target, direction, halfW, halfH, frameState.aspect);

    if (frameState.reduced) {
      root.rotation.y = base.yaw;
      floating.position.y = floatBaseY;
      return;
    }

    // Pointer and idle motion, plus a gentle scroll-linked turn and sink.
    const idle = bob(frameState.time, 0.05, 0.22);
    const scrollTurn = -frameState.progress * 0.42;
    const targetYaw = base.yaw + idle + frameState.pointer.x * 0.32 + scrollTurn;
    root.rotation.y = damp(root.rotation.y, targetYaw, 3, frameState.dt);
    root.rotation.x = damp(root.rotation.x, frameState.pointer.y * 0.08, 3, frameState.dt);
    root.position.y = damp(root.position.y, -frameState.progress * 0.08, 3, frameState.dt);

    floating.position.y = floatBaseY + bob(frameState.time, 0.05, 1.05);
    floating.rotation.y += frameState.dt * 0.32;
    floating.rotation.z = bob(frameState.time, 0.035, 0.7);

    tins.forEach((tin, i) => {
      tin.rotation.y += frameState.dt * (0.18 + i * 0.07);
    });
  };

  const handle: SceneHandle = { scene, camera, update };
  return handle;
};
