import * as THREE from 'three';

/**
 * Measured layout toolkit.
 *
 * This is the positioning system every 3D scene uses. It works from the real bounding box
 * of whatever model is loaded, so a scene never hard-codes the size or proportions of a
 * placeholder. Swap a placeholder for a real .glb (or a product-photo card) and the layout
 * adapts: stacks rest on each other, shelves fit their contents, and the camera frames the
 * result. No scene, lighting, camera or animation code needs to change.
 *
 * Guarantee relied on here: the model library normalises every model so that its largest
 * dimension equals the manifest's `fit`, it is centred on X and Z, and its base sits on
 * Y = 0. All helpers assume that contract.
 */

export interface Bounds {
  min: THREE.Vector3;
  max: THREE.Vector3;
  size: THREE.Vector3;
  center: THREE.Vector3;
}

/** World-space bounding box of an object (and its descendants). */
export function boundsOf(object: THREE.Object3D): Bounds {
  object.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  return { min: box.min, max: box.max, size, center };
}

/** Highest point of the object (world Y). */
export function topOf(object: THREE.Object3D): number {
  return boundsOf(object).max.y;
}

/** Height of the object (world Y size). */
export function heightOf(object: THREE.Object3D): number {
  return boundsOf(object).size.y;
}

/** Ground footprint of the object: its X and Z size. */
export function footprintOf(object: THREE.Object3D): { x: number; z: number } {
  const s = boundsOf(object).size;
  return { x: s.x, z: s.z };
}

/** Radius of the object's ground footprint (half the larger of X and Z). */
export function footprintRadiusOf(object: THREE.Object3D): number {
  const f = footprintOf(object);
  return Math.max(f.x, f.z) / 2;
}

/**
 * Move an object so its lowest point sits at `y`. Because normalised models already have
 * their base at local Y = 0, this usually just sets `position.y`, but it also corrects any
 * model whose geometry does not start at zero.
 */
export function restBaseAt(object: THREE.Object3D, y: number): void {
  const b = boundsOf(object);
  object.position.y += y - b.min.y;
}

/** Place `item` on top of `base`, offset from the base centre by (x, z), with a gap. */
export function placeOn(
  base: THREE.Object3D,
  item: THREE.Object3D,
  offset: { x: number; z: number },
  gap = 0,
): void {
  const bb = boundsOf(base);
  item.position.x = bb.center.x + offset.x;
  item.position.z = bb.center.z + offset.z;
  restBaseAt(item, bb.max.y + gap);
}

/** Uniform scale factor that makes `object` fit inside `target` on every axis. */
export function fitWithin(object: THREE.Object3D, target: { x: number; y: number; z: number }): number {
  const s = boundsOf(object).size;
  const factor = Math.min(
    target.x / (s.x || 1e-6),
    target.y / (s.y || 1e-6),
    target.z / (s.z || 1e-6),
  );
  object.scale.multiplyScalar(factor);
  return factor;
}

/** Scale so the object's largest dimension equals `target`. Base and centring are preserved. */
export function fitLargest(object: THREE.Object3D, target: number): number {
  const s = boundsOf(object).size;
  const largest = Math.max(s.x, s.y, s.z) || 1e-6;
  const factor = target / largest;
  object.scale.multiplyScalar(factor);
  return factor;
}

/** `count` evenly spaced positions on a circle of `radius`, starting at `startAngle`. */
export function ring(count: number, radius: number, startAngle = -Math.PI / 2): Array<{ x: number; z: number }> {
  return Array.from({ length: count }, (_, i) => {
    const a = startAngle + (i / count) * Math.PI * 2;
    return { x: Math.cos(a) * radius, z: Math.sin(a) * radius };
  });
}

export interface GridOptions {
  /** Y that every item's base rests on. */
  y: number;
  /** Centre of the grid. */
  cx?: number;
  cz?: number;
  /** Number of columns. */
  cols: number;
  /** Centre-to-centre spacing. Use footprint + gap so items do not overlap. */
  spacingX: number;
  spacingZ: number;
}

/**
 * Place items in a rows x cols grid centred on (cx, cz), all resting at base `y`.
 * Returns the tallest item's height, so a second layer can be stacked on top.
 */
export function arrangeGrid(items: THREE.Object3D[], options: GridOptions): number {
  const { y, cx = 0, cz = 0, cols, spacingX, spacingZ } = options;
  const rows = Math.max(1, Math.ceil(items.length / cols));
  let maxHeight = 0;
  items.forEach((item, i) => {
    const row = Math.floor(i / cols);
    const col = i % cols;
    item.position.x = cx + (col - (cols - 1) / 2) * spacingX;
    item.position.z = cz + (row - (rows - 1) / 2) * spacingZ;
    restBaseAt(item, y);
    maxHeight = Math.max(maxHeight, heightOf(item));
  });
  return maxHeight;
}

export interface Frame {
  target: THREE.Vector3;
  halfW: number;
  halfH: number;
}

/**
 * Camera framing derived from content bounds: the camera centres on the content and fits it
 * with `pad` room to spare. Because this is measured, a bigger or smaller replacement model
 * is framed automatically. The minimum half-size keeps very small content from zooming in
 * too tightly.
 */
export function frameContent(object: THREE.Object3D, pad = 1.2, minHalf = 0.55): Frame {
  const b = boundsOf(object);
  return {
    target: b.center.clone(),
    halfW: Math.max((b.size.x / 2) * pad, minHalf),
    halfH: Math.max((b.size.y / 2) * pad, minHalf),
  };
}
