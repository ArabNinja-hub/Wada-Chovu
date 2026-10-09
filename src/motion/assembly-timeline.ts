import { gsap } from './gsap.ts';

/** Progress of one product through the three moves. Each runs from 0 to 1. */
export interface ProductProgress {
  /** Appear: the product comes from its start pose to its scatter pose. */
  enter: number;
  /** Formation: the product moves into its row or column. */
  form: number;
  /** Converge: the product moves into the final composition. */
  converge: number;
}

/** Everything the scene reads. GSAP writes it; the scene only reads it. */
export interface AssemblyState {
  products: ProductProgress[];
  /** Camera settles from a slightly distant start to its composed distance. */
  dolly: number;
  /** A restrained push-in during the hold. */
  push: number;
  /** Transition out: the composition fades and drifts up, and the camera pulls back. */
  exit: number;
}

/**
 * Timing on a 0 to 1 master timeline, which ScrollTrigger scrubs. Each pair is [start, end].
 * The order is: appear, formation, converge, a short hold, then exit. Staggering keeps the
 * products from moving in lockstep.
 */
export const ASSEMBLY_TIMING = {
  enter: [
    [0.0, 0.22],
    [0.04, 0.26],
    [0.08, 0.3],
    [0.12, 0.34],
  ],
  form: [
    [0.36, 0.56],
    [0.4, 0.58],
    [0.44, 0.6],
    [0.48, 0.6],
  ],
  converge: [
    [0.62, 0.8],
    [0.65, 0.82],
    [0.68, 0.84],
    [0.71, 0.86],
  ],
  dolly: [0, 0.62],
  push: [0.62, 0.9],
  exit: [0.9, 1],
} as const;

export function createAssemblyState(count: number): AssemblyState {
  return {
    products: Array.from({ length: count }, () => ({ enter: 0, form: 0, converge: 0 })),
    dolly: 0,
    push: 0,
    exit: 0,
  };
}

/** Sets the composition to its final, still state. Used for reduced motion. */
export function settleAssemblyState(state: AssemblyState): void {
  for (const p of state.products) {
    p.enter = 1;
    p.form = 1;
    p.converge = 1;
  }
  state.dolly = 1;
  state.push = 0;
  state.exit = 0;
}

/**
 * Builds the master timeline. It starts paused and length 1, so the ScrollTrigger that scrubs
 * it maps the pinned distance directly onto the timeline.
 */
export function buildAssemblyTimeline(state: AssemblyState): gsap.core.Timeline {
  const timeline = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' } });
  const span = ([start, end]: readonly [number, number]) => end - start;

  timeline
    .addLabel('appear', 0)
    .addLabel('formation', ASSEMBLY_TIMING.form[0][0])
    .addLabel('assembly', ASSEMBLY_TIMING.converge[0][0])
    .addLabel('hold', ASSEMBLY_TIMING.push[0])
    .addLabel('exit', ASSEMBLY_TIMING.exit[0]);

  state.products.forEach((product, i) => {
    timeline.to(
      product,
      { enter: 1, duration: span(ASSEMBLY_TIMING.enter[i]), ease: 'power2.out' },
      ASSEMBLY_TIMING.enter[i][0],
    );
    timeline.to(
      product,
      { form: 1, duration: span(ASSEMBLY_TIMING.form[i]), ease: 'power2.inOut' },
      ASSEMBLY_TIMING.form[i][0],
    );
    timeline.to(
      product,
      { converge: 1, duration: span(ASSEMBLY_TIMING.converge[i]), ease: 'power3.inOut' },
      ASSEMBLY_TIMING.converge[i][0],
    );
  });

  timeline.to(state, { dolly: 1, duration: span(ASSEMBLY_TIMING.dolly), ease: 'sine.inOut' }, ASSEMBLY_TIMING.dolly[0]);
  timeline.to(state, { push: 1, duration: span(ASSEMBLY_TIMING.push), ease: 'sine.inOut' }, ASSEMBLY_TIMING.push[0]);
  timeline.to(state, { exit: 1, duration: span(ASSEMBLY_TIMING.exit), ease: 'power1.in' }, ASSEMBLY_TIMING.exit[0]);

  return timeline;
}
