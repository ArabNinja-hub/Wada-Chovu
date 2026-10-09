import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '../motion/gsap.ts';

/**
 * Smooth wheel scrolling, driven by GSAP's ticker, with ScrollTrigger kept in step.
 *
 * It is the only smooth-scroll system on the page. The pinned product section uses it so the
 * scrubbed timeline and the wheel move together. Touch scrolling stays native. Users who
 * prefer reduced motion never start it. Users of the scene share one instance, and it stops
 * when the last user releases it.
 */

let instance: Lenis | null = null;
let users = 0;

const tick = (time: number): void => {
  instance?.raf(time * 1000);
};

/** The sticky header height, so in-page links land below it. */
function headerOffset(): number {
  const header = document.querySelector<HTMLElement>('[data-site-header]');
  return -(header?.getBoundingClientRect().height ?? 76);
}

function start(): void {
  instance = new Lenis({
    lerp: 0.1,
    smoothWheel: true,
    syncTouch: false,
    anchors: { offset: headerOffset() },
    autoRaf: false,
  });
  instance.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
}

function stop(): void {
  gsap.ticker.remove(tick);
  instance?.destroy();
  instance = null;
}

/** Starts smooth scrolling if it is not already running. Returns a function that releases it. */
export function acquireSmoothScroll(): () => void {
  users += 1;
  if (!instance) start();
  let released = false;
  return () => {
    if (released) return;
    released = true;
    users = Math.max(0, users - 1);
    if (users === 0) stop();
  };
}
