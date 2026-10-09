/**
 * Layout for the product assembly section.
 *
 * Pure geometry with no rendering dependencies, so it can be checked without a browser.
 * Every product is a flat photograph placed in 3D space. Each follows one path with four
 * poses, and the scene blends between them as the scroll timeline advances:
 *
 *   start      off-screen, or far away and faded out (the product appears)
 *   scatter    near its final place, loose and slightly turned (the products settle in view)
 *   formation  a row or column at a smaller scale (the products line up)
 *   final      the composed arrangement, with no rotation
 *
 * Positions are in scene units. The camera fits the composition, so any slot shape frames it.
 * Products are indexed in the order of ASSEMBLY_IMAGE_KEYS in content/assets.ts.
 */

export type AssemblyLayout = 'landscape' | 'portrait';

export interface Pose {
  x: number;
  y: number;
  z: number;
  /** Rotation about each axis, in radians. */
  rx: number;
  ry: number;
  rz: number;
  /** Uniform scale. */
  s: number;
  /** Opacity, 0 to 1. */
  o: number;
}

export interface ProductPlan {
  /** Size in scene units at scale 1. The height follows the photograph's aspect ratio. */
  width: number;
  height: number;
  start: Pose;
  scatter: Pose;
  formation: Pose;
  final: Pose;
}

export interface AssemblyPlan {
  layout: AssemblyLayout;
  /** Half the extent of the composition, including margin. The camera frames this box. */
  halfW: number;
  halfH: number;
  products: ProductPlan[];
}

interface Vec3 {
  x: number;
  y: number;
  z: number;
}

interface LayoutSpec {
  /** Design width of each product, in scene units. */
  widths: readonly number[];
  /** Centre of each product in the composed arrangement, before centring. */
  finals: readonly Vec3[];
  /** Scale used while the products are in formation. */
  formationScale: number;
  /** Distance between neighbouring formation slots, along the layout's main axis. */
  formationStep: number;
  /** Depth of each product while in formation. */
  formationZ: readonly number[];
}

/**
 * Final arrangements. Each centre and size is chosen so that no two products overlap.
 * `finalOverlaps` checks this for any aspect ratio, so a change here cannot introduce a collision
 * without it being reported.
 */
const SPECS: Record<AssemblyLayout, LayoutSpec> = {
  landscape: {
    widths: [2.1, 2.6, 1.7, 2.5],
    finals: [
      { x: 1.35, y: 0.7, z: 0.25 },
      { x: -1.5, y: 1.0, z: 0 },
      { x: 2.6, y: -1.35, z: -0.15 },
      { x: -1.25, y: -0.95, z: 0.1 },
    ],
    formationScale: 0.62,
    formationStep: 1.65,
    formationZ: [-0.2, 0.25, -0.1, 0.3],
  },
  portrait: {
    widths: [1.7, 2.1, 1.5, 2.1],
    finals: [
      { x: -0.7, y: 0.45, z: 0.25 },
      { x: 0, y: 1.95, z: 0 },
      { x: 1.0, y: -0.35, z: -0.15 },
      { x: -0.1, y: -1.95, z: 0.1 },
    ],
    formationScale: 0.5,
    formationStep: 0.95,
    formationZ: [-0.2, 0.25, -0.1, 0.3],
  },
};

/**
 * Start positions. x and y are multiples of the composition's half-width and half-height, so
 * every start sits outside the frame on any slot shape. z is absolute.
 */
const START: ReadonlyArray<{ x: number; y: number; z: number; s: number; o: number; ry: number; rx: number; rz: number }> = [
  // Bike: grows out of the background, fading in.
  { x: 0.3, y: 0.15, z: -4, s: 0.3, o: 0, rx: 0, ry: 0, rz: 0 },
  // Stack: drops in from above, tilted.
  { x: -0.25, y: 1.9, z: 0.1, s: 1, o: 1, rx: 0.9, ry: 0.2, rz: 0 },
  // Water: slides in from the left, turning.
  { x: -2.1, y: -0.1, z: 0.2, s: 1, o: 1, rx: 0, ry: -0.9, rz: 0.12 },
  // Bicycles: slides in from the bottom right, turning the other way.
  { x: 2.1, y: -1.9, z: 0.4, s: 1, o: 1, rx: 0, ry: 0.8, rz: -0.22 },
];

/** Depth and turn for each product while scattered. Kept small so motion stays calm. */
const SCATTER_Z = [0.9, -0.7, 0.8, -1.0];
const SCATTER_RY = [-0.35, 0.3, -0.25, 0.4];
const SCATTER_RZ = [0.05, -0.04, 0.06, -0.08];
/** The scatter spreads the final arrangement slightly outwards. */
const SCATTER_SPREAD = 1.2;
const SCATTER_SCALE = 0.9;
/** Margin added around the composition, in scene units. */
const PAD = 0.35;

export const ASSEMBLY_PRODUCT_COUNT = 4;

export const emptyPose = (): Pose => ({ x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, s: 1, o: 1 });

export function lerpPose(a: Pose, b: Pose, t: number, out: Pose = emptyPose()): Pose {
  out.x = a.x + (b.x - a.x) * t;
  out.y = a.y + (b.y - a.y) * t;
  out.z = a.z + (b.z - a.z) * t;
  out.rx = a.rx + (b.rx - a.rx) * t;
  out.ry = a.ry + (b.ry - a.ry) * t;
  out.rz = a.rz + (b.rz - a.rz) * t;
  out.s = a.s + (b.s - a.s) * t;
  out.o = a.o + (b.o - a.o) * t;
  return out;
}

/**
 * Builds the plan for a layout. `aspects` gives width / height for each product, in the order
 * of ASSEMBLY_IMAGE_KEYS. A missing or invalid aspect falls back to a square.
 */
export function planAssembly(layout: AssemblyLayout, aspects: readonly number[]): AssemblyPlan {
  const spec = SPECS[layout];
  const count = ASSEMBLY_PRODUCT_COUNT;

  const sizes = Array.from({ length: count }, (_, i) => {
    const width = spec.widths[i] ?? 1;
    const aspect = aspects[i] && aspects[i] > 0 ? aspects[i] : 1;
    return { width, height: width / aspect };
  });

  // Centre the composed arrangement on the origin.
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < count; i++) {
    const f = spec.finals[i];
    const { width, height } = sizes[i];
    minX = Math.min(minX, f.x - width / 2);
    maxX = Math.max(maxX, f.x + width / 2);
    minY = Math.min(minY, f.y - height / 2);
    maxY = Math.max(maxY, f.y + height / 2);
  }
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const halfW = (maxX - minX) / 2 + PAD;
  const halfH = (maxY - minY) / 2 + PAD;

  const products: ProductPlan[] = [];
  for (let i = 0; i < count; i++) {
    const f = spec.finals[i];
    const { width, height } = sizes[i];
    const start = START[i];

    const final: Pose = { x: f.x - cx, y: f.y - cy, z: f.z, rx: 0, ry: 0, rz: 0, s: 1, o: 1 };

    const scatter: Pose = {
      x: final.x * SCATTER_SPREAD,
      y: final.y * SCATTER_SPREAD,
      z: SCATTER_Z[i],
      rx: 0,
      ry: SCATTER_RY[i],
      rz: SCATTER_RZ[i],
      s: SCATTER_SCALE,
      o: 1,
    };

    // Formation: a row in landscape, a column in portrait, centred on the origin.
    const slot = i - (count - 1) / 2;
    const formation: Pose =
      layout === 'landscape'
        ? { x: slot * spec.formationStep, y: 0, z: spec.formationZ[i], rx: 0, ry: 0, rz: 0, s: spec.formationScale, o: 1 }
        : { x: 0, y: -slot * spec.formationStep, z: spec.formationZ[i], rx: 0, ry: 0, rz: 0, s: spec.formationScale, o: 1 };

    products.push({
      width,
      height,
      start: {
        x: start.x * halfW,
        y: start.y * halfH,
        z: start.z,
        rx: start.rx,
        ry: start.ry,
        rz: start.rz,
        s: start.s,
        o: start.o,
      },
      scatter,
      formation,
      final,
    });
  }

  return { layout, halfW, halfH, products };
}

/**
 * Pairs of products whose final rectangles overlap or come closer than `minGap`. Used by the
 * layout checks, so a change to the arrangement cannot silently introduce collisions.
 */
export function finalOverlaps(plan: AssemblyPlan, minGap = 0): Array<[number, number]> {
  const pairs: Array<[number, number]> = [];
  for (let i = 0; i < plan.products.length; i++) {
    for (let j = i + 1; j < plan.products.length; j++) {
      const a = plan.products[i];
      const b = plan.products[j];
      const dx = Math.abs(a.final.x - b.final.x) - (a.width + b.width) / 2;
      const dy = Math.abs(a.final.y - b.final.y) - (a.height + b.height) / 2;
      // Separated on either axis by at least minGap means no overlap.
      if (!(dx >= minGap || dy >= minGap)) pairs.push([i, j]);
    }
  }
  return pairs;
}
