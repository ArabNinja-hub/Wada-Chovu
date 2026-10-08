import * as THREE from 'three';
import type { FrameState, SceneFactory, SceneHandle } from '../types.ts';
import { addContactShadow, addLighting, castShadows, seededRandom } from './common.ts';
import { bob, damp, frameCamera } from '../rig.ts';

/**
 * Scale scene: a warehouse rack filled with cartons, with two loaded pallets in the foreground.
 * The camera drifts sideways with scroll to give parallax depth. The palette is lit to read on
 * the dark forest band.
 */
export const createScaleScene: SceneFactory = async (ctx) => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 100);

  addLighting(scene, ctx, {
    key: { color: 0xffe9c9, intensity: 2.5, position: [-4, 6, 6] },
    fill: { color: 0xc9e6ff, intensity: 0.5, position: [5, 2, 4] },
    rim: { color: 0x06fc07, intensity: 1.4, position: [4, 5, -6] },
    hemi: { sky: 0xdfeee2, ground: 0x0a2413, intensity: 0.9 },
    shadowExtent: 3,
    environmentIntensity: 0.45,
  });

  const root = new THREE.Group();
  scene.add(root);
  const random = seededRandom(42);

  // Rack: normalised so its width is the manifest's `fit`.
  const rack = await ctx.models.instance('model.rack');
  root.add(rack);
  const rackBox = new THREE.Box3().setFromObject(rack);
  const rackSize = rackBox.getSize(new THREE.Vector3());
  const shelfFractions = [0.21, 0.45, 0.69, 0.93];
  const bayX = [-0.8, 0, 0.8].map((x) => x * (rackSize.x / 2.6));
  const cartonScale = 0.4;

  // Cartons fill the shelves. A few positions stay empty so the rack looks used, not staged.
  for (const fraction of shelfFractions) {
    const shelfY = rackBox.min.y + fraction * rackSize.y + 0.025;
    for (const x of bayX) {
      for (const offset of [-0.19, 0.19]) {
        if (random() < 0.18) continue;
        const carton = await ctx.models.instance('model.carton');
        carton.scale.setScalar(cartonScale);
        carton.position.set(x + offset * (rackSize.x / 2.6), shelfY, (random() - 0.5) * 0.06);
        carton.rotation.y = (random() - 0.5) * 0.12;
        root.add(carton);
      }
    }
  }

  // Foreground pallets, each with a three-layer stack of cartons.
  const palletSpots: Array<{ x: number; z: number }> = [
    { x: -1.02, z: 0.46 },
    { x: 0.98, z: 0.52 },
  ];
  for (const spot of palletSpots) {
    const pallet = await ctx.models.instance('model.pallet');
    pallet.position.set(spot.x, 0, spot.z);
    root.add(pallet);
    const palletTop = 0.12;
    for (let layer = 0; layer < 3; layer++) {
      for (const [dx, dz] of [
        [-0.19, -0.14],
        [0.19, -0.14],
        [-0.19, 0.14],
        [0.19, 0.14],
      ]) {
        const carton = await ctx.models.instance('model.carton');
        carton.scale.setScalar(cartonScale);
        carton.position.set(spot.x + dx, palletTop + layer * 0.27, spot.z + dz);
        carton.rotation.y = (random() - 0.5) * 0.08;
        root.add(carton);
      }
    }
    addContactShadow(root, ctx, { x: spot.x, z: spot.z }, { width: 1.5, depth: 1.25 }, { opacity: 0.5, color: 0x000000 });
  }

  castShadows(root, true);
  addContactShadow(root, ctx, { x: 0, z: 0 }, { width: 3.2, depth: 1.5 }, { opacity: 0.35, color: 0x000000 });

  const target = new THREE.Vector3(0, 1.15, 0.2);
  const direction = new THREE.Vector3(0, 0.1, 1);
  const framing = { halfW: 1.55, halfH: 1.4 };

  const update = (frame: FrameState): void => {
    // Camera slides with scroll for parallax. It holds still for reduced motion.
    const slide = frame.reduced ? 0 : frame.progress * 0.5;
    const cameraTarget = new THREE.Vector3(target.x + slide * 0.5, target.y, target.z);
    frameCamera(camera, cameraTarget, direction, framing.halfW, framing.halfH, frame.aspect);

    if (frame.reduced) {
      root.rotation.y = 0;
      return;
    }

    root.rotation.y = damp(root.rotation.y, frame.pointer.x * 0.1 + bob(frame.time, 0.02, 0.3), 3, frame.dt);
    root.rotation.x = damp(root.rotation.x, frame.pointer.y * 0.03, 3, frame.dt);
  };

  const handle: SceneHandle = { scene, camera, update };
  return handle;
};
