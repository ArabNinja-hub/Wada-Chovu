import * as THREE from 'three';
import type { FrameState, SceneFactory, SceneHandle } from '../types.ts';
import { addGroundPool, addLighting, castShadows, contactShadowFor, seededRandom } from './common.ts';
import { bob, damp, frameCamera } from '../rig.ts';
import { arrangeGrid, boundsOf, fitLargest, fitWithin, frameContent, restBaseAt } from '../layout.ts';
import { SHELF_DECK_FRACTIONS, SHELF_DECK_TOP, SHELF_HEADER_H } from '../placeholders.ts';
import type { ModelKey } from '../../content/assets.ts';

/**
 * Shop-floor scene: a retail gondola filled with products, and two display counters in front
 * with neat product stacks. Products are sized to fit each shelf bay and rest on the top of
 * each deck. The camera frames the measured content and slides with scroll. Swapping any
 * model keeps it all correct.
 */
export const createScaleScene: SceneFactory = async (ctx) => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 100);

  addLighting(scene, ctx, {
    key: { color: 0xfff1de, intensity: 2.5, position: [-4, 6, 6] },
    fill: { color: 0xe6f0ff, intensity: 0.6, position: [5, 2, 4] },
    rim: { color: 0x06fc07, intensity: 1.2, position: [4, 5, -6] },
    hemi: { sky: 0xf4f8f1, ground: 0x0a2413, intensity: 0.95 },
    shadowExtent: 3,
    environmentIntensity: 0.5,
  });

  const ground = new THREE.Group();
  scene.add(ground);
  addGroundPool(ground, ctx, { radius: 3.4, color: 0x2f7a3d, opacity: 0.22, receiveShadow: ctx.profile.shadows });

  const root = new THREE.Group();
  scene.add(root);
  const random = seededRandom(42);

  // Products for the shelves: a mix of boxes, tins and pouches, chosen at random per slot.
  const productKeys: ModelKey[] = ['model.carton', 'model.carton', 'model.tin', 'model.pouch'];
  const pickProduct = (): ModelKey => productKeys[Math.floor(random() * productKeys.length)];

  // Gondola shelving.
  const shelf = await ctx.models.instance('model.shelf');
  root.add(shelf);
  const sb = boundsOf(shelf);
  const shelfW = sb.size.x;
  const shelfH = sb.size.y;
  const shelfD = sb.size.z;
  const shelfMinY = sb.min.y;
  const shelfCx = sb.center.x;
  const shelfCz = sb.center.z;
  // The header sign sits above the top deck, so the top bay stops below it.
  const shelfUsableTop = sb.max.y - SHELF_HEADER_H;

  // Fill the shelves. Products are scaled to fit each bay (width, depth and shelf gap), so any
  // product model fills the shelves without clipping or floating.
  const deckTops = SHELF_DECK_FRACTIONS.map((f) => shelfMinY + f * shelfH);
  const bays = 3;
  const bayW = (shelfW * 0.92) / bays;
  const shelfGap = 0.02;

  for (let s = 0; s < deckTops.length; s++) {
    const deckY = deckTops[s] + SHELF_DECK_TOP;
    const gapH = (s < deckTops.length - 1 ? deckTops[s + 1] : shelfUsableTop) - deckY;
    const cellH = gapH * 0.86;
    const cellD = shelfD * 0.78;
    const cellW = bayW * 0.46;
    for (let b = 0; b < bays; b++) {
      const bayCx = shelfCx + (b - (bays - 1) / 2) * bayW;
      for (let j = 0; j < 2; j++) {
        if (random() < 0.2) continue; // a few gaps, so the shelves look well stocked, not full
        const product = await ctx.models.instance(pickProduct());
        fitWithin(product, { x: cellW, y: cellH, z: cellD });
        product.rotation.y = (random() - 0.5) * 0.12;
        root.add(product);
        const pw = boundsOf(product).size.x;
        product.position.x = bayCx + (j - 0.5) * (pw + shelfGap);
        product.position.z = shelfCz + (random() - 0.5) * 0.04;
        restBaseAt(product, deckY);
      }
    }
  }

  // Display counters in front of the shelving, each with a neat stack of product boxes.
  const counterGap = 0.15;
  const counterTargetW = shelfW * 0.4;
  for (const side of [-1, 1]) {
    const counter = await ctx.models.instance('model.counter');
    fitLargest(counter, counterTargetW);
    root.add(counter);
    restBaseAt(counter, 0);
    const cw = boundsOf(counter).size.x;
    const cd = boundsOf(counter).size.z;
    counter.position.x = side * (shelfW / 2 + cw / 2 + counterGap);
    counter.position.z = shelfD * 0.35;
    const counterTop = boundsOf(counter).max.y;

    // Two layers of four boxes (2x2), each layer resting on the one below.
    const cellW = cw * 0.46;
    const cellD = cd * 0.46;
    let layerY = counterTop;
    for (let layer = 0; layer < 2; layer++) {
      const items: THREE.Object3D[] = [];
      for (let i = 0; i < 4; i++) {
        const box = await ctx.models.instance('model.carton');
        fitWithin(box, { x: cellW, y: 1e6, z: cellD });
        box.rotation.y = (random() - 0.5) * 0.08;
        root.add(box);
        items.push(box);
      }
      const ib = boundsOf(items[0]);
      const h = arrangeGrid(items, {
        y: layerY,
        cx: counter.position.x,
        cz: counter.position.z,
        cols: 2,
        spacingX: ib.size.x + shelfGap,
        spacingZ: ib.size.z + shelfGap,
      });
      layerY += h + shelfGap;
    }
    contactShadowFor(ground, ctx, counter, 0.45);
  }

  castShadows(root, true);
  contactShadowFor(ground, ctx, shelf, 0.35);

  // Adaptive camera: frame the measured content.
  const { target, halfW, halfH } = frameContent(root, 1.18);
  const direction = new THREE.Vector3(0, 0.1, 1);

  const update = (frameState: FrameState): void => {
    // The camera slides sideways with scroll for parallax depth.
    const slide = frameState.reduced ? 0 : frameState.progress * 0.5;
    const cameraTarget = new THREE.Vector3(target.x + slide * 0.5, target.y, target.z);
    frameCamera(camera, cameraTarget, direction, halfW, halfH, frameState.aspect);

    if (frameState.reduced) {
      root.rotation.y = 0;
      return;
    }

    root.rotation.y = damp(root.rotation.y, frameState.pointer.x * 0.1 + bob(frameState.time, 0.02, 0.3), 3, frameState.dt);
    root.rotation.x = damp(root.rotation.x, frameState.pointer.y * 0.03, 3, frameState.dt);
  };

  const handle: SceneHandle = { scene, camera, update };
  return handle;
};
