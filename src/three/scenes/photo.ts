import * as THREE from 'three';
import { getPhoto, type PhotoKey } from '../../content/assets.ts';
import { createDepthPhoto } from '../photo-depth.ts';
import { damp, frameCamera } from '../rig.ts';
import type { FrameState, SceneFactory, SceneHandle } from '../types.ts';

/**
 * Photo scene: a real photograph displaced in 3D by its depth map (see photo-depth.ts).
 *
 * The photo is chosen by the slot's `data-photo` attribute, which renderStageSlot sets from
 * the `fallback` photo key. So a section adds a 3D photo by pointing at a `photo.*` entry, with
 * no scene code. The view is a gentle idle turn and a pointer-driven turn, so the displaced
 * relief is seen from changing angles. Reduced motion holds the plane still (the relief remains).
 */
export const createPhotoScene: SceneFactory = async (ctx, slot) => {
  const key = slot.el.dataset.photo as PhotoKey | undefined;
  if (!key) throw new Error('Photo scene needs a data-photo attribute.');
  const photo = getPhoto(key);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  scene.add(new THREE.AmbientLight(0xffffff, 1));

  const depthPhoto = await createDepthPhoto(photo, { height: 2, segments: ctx.profile.shadows ? 180 : 120 });
  const group = new THREE.Group();
  group.add(depthPhoto.mesh);
  scene.add(group);

  // Frame the plane with a little margin, for any slot shape.
  const target = new THREE.Vector3(0, 0, 0);
  const direction = new THREE.Vector3(0, 0, 1);
  const halfW = (depthPhoto.width / 2) * 1.08;
  const halfH = (depthPhoto.height / 2) * 1.08 + depthPhoto.depthScale * 0.5;

  let yaw = 0;
  let pitch = 0;

  const update = (frame: FrameState): void => {
    frameCamera(camera, target, direction, halfW, halfH, frame.aspect);
    if (frame.reduced) {
      group.rotation.set(0, 0, 0);
      return;
    }
    const targetYaw = Math.sin(frame.time * 0.35) * 0.07 + frame.pointer.x * 0.2;
    const targetPitch = Math.sin(frame.time * 0.27 + 1.1) * 0.035 - frame.pointer.y * 0.12;
    yaw = damp(yaw, targetYaw, 2.4, frame.dt);
    pitch = damp(pitch, targetPitch, 2.4, frame.dt);
    group.rotation.set(pitch, yaw, 0);
  };

  const handle: SceneHandle = { scene, camera, update };
  return handle;
};

