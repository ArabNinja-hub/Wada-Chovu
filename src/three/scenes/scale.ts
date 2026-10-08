import * as THREE from 'three';
import type { FrameState, SceneFactory, SceneHandle } from '../types.ts';
import { addGroundPool, addLighting, castShadows, contactShadowFor, seededRandom } from './common.ts';
import { bob, damp, frameCamera } from '../rig.ts';
import { arrangeGrid, boundsOf, fitLargest, fitWithin, frameContent, restBaseAt } from '../layout.ts';

/**
 * Scale scene: a warehouse rack filled with cartons and two loaded pallets in front. Cartons
 * are sized to fit each shelf bay, pallet stacks are measured from real heights, and the
 * camera frames the measured content and slides with scroll. Swapping any model keeps it all
 * correct.
 */
export const createScaleScene: SceneFactory = async (ctx) => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 100);

  addLighting(scene, ctx, {
    key: { color: 0xffe9c9, intensity: 2.5, position: [-4, 6, 6] },
    fill: { color: 0xc9e6ff, intensity: 0.6, position: [5, 2, 4] },
    rim: { color: 0x06fc07, intensity: 1.4, position: [4, 5, -6] },
    hemi: { sky: 0xdfeee2, ground: 0x0a2413, intensity: 0.9 },
    shadowExtent: 3,
    environmentIntensity: 0.45,
  });

  const ground = new THREE.Group();
  scene.add(ground);
  addGroundPool(ground, ctx, { radius: 3.4, color: 0x2f7a3d, opacity: 0.22, receiveShadow: ctx.profile.shadows });

  const root = new THREE.Group();
  scene.add(root);
  const random = seededRandom(42);

  // Rack.
  const rack = await ctx.models.instance('model.rack');
  root.add(rack);
  const rb = boundsOf(rack);
  const rackW = rb.size.x;
  const rackH = rb.size.y;
  const rackD = rb.size.z;
  const rackMinY = rb.min.y;
  const rackTop = rb.max.y;
  const rackCx = rb.center.x;
  const rackCz = rb.center.z;

  // Fill the shelves. Cartons are scaled to fit each bay (width, depth and shelf gap), so any
  // carton model fills the rack without clipping or floating.
  const shelfFractions = [0.21, 0.45, 0.69, 0.93];
  const shelfTops = shelfFractions.map((f) => rackMinY + f * rackH);
  const bays = 3;
  const bayW = (rackW * 0.92) / bays;
  const shelfGap = 0.02;

  for (let s = 0; s < shelfTops.length; s++) {
    const shelfY = shelfTops[s];
    const gapH = s < shelfTops.length - 1 ? shelfTops[s + 1] - shelfY : rackTop - shelfY;
    const cellH = gapH * 0.86;
    const cellD = rackD * 0.78;
    const cellW = bayW * 0.46;
    for (let b = 0; b < bays; b++) {
      const bayCx = rackCx + (b - (bays - 1) / 2) * bayW;
      for (let j = 0; j < 2; j++) {
        if (random() < 0.2) continue; // a few gaps, so the rack looks used
        const carton = await ctx.models.instance('model.carton');
        fitWithin(carton, { x: cellW, y: cellH, z: cellD });
        carton.rotation.y = (random() - 0.5) * 0.12;
        root.add(carton);
        const cw = boundsOf(carton).size.x;
        carton.position.x = bayCx + (j - 0.5) * (cw + shelfGap);
        carton.position.z = rackCz + (random() - 0.5) * 0.04;
        restBaseAt(carton, shelfY);
      }
    }
  }

  // Foreground pallets, each with a measured stack of cartons.
  const palletGap = 0.15;
  const palletTargetW = rackW * 0.4;
  const palletSpots = [-1, 1];
  for (const side of palletSpots) {
    const pallet = await ctx.models.instance('model.pallet');
    fitLargest(pallet, palletTargetW);
    root.add(pallet);
    restBaseAt(pallet, 0);
    const pw = boundsOf(pallet).size.x;
    const pd = boundsOf(pallet).size.z;
    pallet.position.x = side * (rackW / 2 + pw / 2 + palletGap);
    pallet.position.z = rackD * 0.35;
    const palletTop = boundsOf(pallet).max.y;

    // Three layers of four cartons (2x2), each layer resting on the one below.
    const cellW = pw * 0.46;
    const cellD = pd * 0.46;
    let layerY = palletTop;
    for (let layer = 0; layer < 3; layer++) {
      const items: THREE.Object3D[] = [];
      for (let i = 0; i < 4; i++) {
        const carton = await ctx.models.instance('model.carton');
        fitWithin(carton, { x: cellW, y: 1e6, z: cellD });
        carton.rotation.y = (random() - 0.5) * 0.08;
        root.add(carton);
        items.push(carton);
      }
      const cb = boundsOf(items[0]);
      const h = arrangeGrid(items, {
        y: layerY,
        cx: pallet.position.x,
        cz: pallet.position.z,
        cols: 2,
        spacingX: cb.size.x + shelfGap,
        spacingZ: cb.size.z + shelfGap,
      });
      layerY += h + shelfGap;
    }
    contactShadowFor(ground, ctx, pallet, 0.45);
  }

  castShadows(root, true);
  contactShadowFor(ground, ctx, rack, 0.35);

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
