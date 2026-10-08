import * as THREE from 'three';

/**
 * Animation and camera helpers shared by every scene. Scenes use these instead of
 * hand-written maths, so motion feels consistent across the page.
 */

/** Frame-rate independent exponential smoothing. Larger `lambda` settles faster. */
export function damp(current: number, target: number, lambda: number, dt: number): number {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** A slow sine used for floating and breathing motion. Returns a value in [-amplitude, amplitude]. */
export function bob(time: number, amplitude: number, speed: number, phase = 0): number {
  return Math.sin(time * speed + phase) * amplitude;
}

/**
 * Camera distance that keeps a rectangle of half-width `halfW` and half-height `halfH`
 * fully in view for the given vertical field of view and aspect ratio. This is what keeps a
 * composition framed on a narrow phone slot as well as on a wide desktop band.
 */
export function fitDistance(verticalFovDeg: number, aspect: number, halfW: number, halfH: number): number {
  const tanHalfV = Math.tan(THREE.MathUtils.degToRad(verticalFovDeg) / 2);
  const byHeight = halfH / tanHalfV;
  const byWidth = halfW / (tanHalfV * aspect);
  return Math.max(byHeight, byWidth);
}

/**
 * Places the camera along `direction` from `target`, at the distance needed to frame
 * the given half-extents for `aspect`. Call it again whenever the aspect changes.
 */
export function frameCamera(
  camera: THREE.PerspectiveCamera,
  target: THREE.Vector3,
  direction: THREE.Vector3,
  halfW: number,
  halfH: number,
  aspect: number,
): void {
  camera.aspect = aspect;
  const distance = fitDistance(camera.fov, aspect, halfW, halfH);
  camera.position.copy(target).addScaledVector(direction.clone().normalize(), distance);
  camera.lookAt(target);
  camera.updateProjectionMatrix();
}

/**
 * Pointer-driven tilt. The target is the pointer position scaled to `range` radians.
 * Returns smoothed rotation values for the group.
 */
export function pointerTilt(
  group: THREE.Object3D,
  pointer: { x: number; y: number },
  range: { yaw: number; pitch: number },
  dt: number,
  lambda = 3.5,
): void {
  group.rotation.y = damp(group.rotation.y, pointer.x * range.yaw, lambda, dt);
  group.rotation.x = damp(group.rotation.x, pointer.y * range.pitch, lambda, dt);
}

/** Enables real shadows for a light when the quality profile allows it. */
export function configureShadowLight(
  light: THREE.DirectionalLight,
  shadows: boolean,
  mapSize: number,
  extent = 2.5,
): void {
  light.castShadow = shadows;
  if (!shadows) return;
  light.shadow.mapSize.set(mapSize, mapSize);
  light.shadow.camera.left = -extent;
  light.shadow.camera.right = extent;
  light.shadow.camera.top = extent;
  light.shadow.camera.bottom = -extent;
  light.shadow.camera.near = 0.5;
  light.shadow.camera.far = 20;
  light.shadow.bias = -0.0008;
  light.shadow.normalBias = 0.02;
  light.shadow.radius = 4;
}
