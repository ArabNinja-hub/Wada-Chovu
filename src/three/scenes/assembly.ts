import * as THREE from 'three';
import { ASSEMBLY_IMAGE_KEYS, getImage, type ImageLike } from '../../content/assets.ts';
import { acquireSmoothScroll } from '../../client/smooth-scroll.ts';
import {
  ASSEMBLY_PRODUCT_COUNT,
  emptyPose,
  lerpPose,
  planAssembly,
  type AssemblyLayout,
  type AssemblyPlan,
  type Pose,
  type ProductPlan,
} from '../../motion/assembly-plan.ts';
import {
  buildAssemblyTimeline,
  createAssemblyState,
  settleAssemblyState,
  type AssemblyState,
  type ProductProgress,
} from '../../motion/assembly-timeline.ts';
import { ScrollTrigger } from '../../motion/gsap.ts';
import { publicAssetUrl } from '../../public-url.ts';
import { fitDistance } from '../rig.ts';
import type { FrameState, SceneFactory, SceneHandle } from '../types.ts';

/**
 * Product assembly: four flat photographs appear, move into a row, converge into a composed
 * arrangement, hold briefly, and leave. The section is pinned, and a ScrollTrigger scrubs one
 * master timeline (motion/assembly-timeline.ts) across the pinned distance. Reverse scrolling
 * plays the same timeline backwards.
 *
 * The photographs are placed as unlit flat cards in 3D, with perspective and turn. They are
 * not depth-displaced, and nothing here models them as solid objects.
 *
 * The scene works from the manifest. Photographs are listed in ASSEMBLY_IMAGE_KEYS. Any slot
 * shape frames correctly: a portrait slot uses the column layout.
 */

const CAMERA_FOV = 26;
/** The composition starts from this multiple of its settled distance, and settles to 1. */
const DOLLY_START = 1.22;
/** Maximum push-in during the hold, as a fraction of the distance. */
const PUSH_AMOUNT = 0.05;
/** How far the camera pulls back as the composition leaves. */
const EXIT_PULL = 0.12;
/** Slots at or below this aspect ratio use the portrait (column) layout. */
const PORTRAIT_MAX_ASPECT = 0.9;
/** Mask resolution for rounded card corners. */
const MASK_WIDTH = 512;
const MAX_ANISOTROPY = 4;

interface Card {
  mesh: THREE.Mesh;
  shadow: THREE.Mesh;
  material: THREE.MeshBasicMaterial;
  shadowMaterial: THREE.MeshBasicMaterial;
  texture: THREE.Texture;
  mask: THREE.CanvasTexture | null;
}

/** Loads one photograph. A failure rejects, so the stage keeps the static images. */
function loadTexture(renderer: THREE.WebGLRenderer, image: ImageLike): Promise<THREE.Texture> {
  const src = publicAssetUrl(image.src);
  return new Promise((resolve, reject) => {
    new THREE.TextureLoader().load(
      src,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = Math.min(MAX_ANISOTROPY, renderer.capabilities.getMaxAnisotropy());
        resolve(texture);
      },
      undefined,
      () => reject(new Error(`Photograph failed to load: ${src}`)),
    );
  });
}

/** Rounded-corner alpha mask, sized to the photograph's aspect ratio. */
function roundedMask(aspect: number): THREE.CanvasTexture | null {
  const width = MASK_WIDTH;
  const height = Math.max(1, Math.round(width / aspect));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const g = canvas.getContext('2d');
  if (!g) return null;

  const r = Math.min(width, height) * 0.04;
  g.fillStyle = '#000';
  g.fillRect(0, 0, width, height);
  g.fillStyle = '#fff';
  g.beginPath();
  g.moveTo(r, 0);
  g.lineTo(width - r, 0);
  g.quadraticCurveTo(width, 0, width, r);
  g.lineTo(width, height - r);
  g.quadraticCurveTo(width, height, width - r, height);
  g.lineTo(r, height);
  g.quadraticCurveTo(0, height, 0, height - r);
  g.lineTo(0, r);
  g.quadraticCurveTo(0, 0, r, 0);
  g.closePath();
  g.fill();
  return new THREE.CanvasTexture(canvas);
}

export const createAssemblyScene: SceneFactory = async (ctx, slot) => {
  const section = slot.el.closest<HTMLElement>('.assembly');
  const pin = section?.querySelector<HTMLElement>('.assembly__pin') ?? null;
  if (!section || !pin) throw new Error('The assembly scene needs its section and pin elements.');

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const simple = ctx.profile.tier === 'low';

  const images = ASSEMBLY_IMAGE_KEYS.map((key) => getImage(key));
  const aspects = images.map((image) => (image.width && image.height ? image.width / image.height : 1));

  // Every photograph is loaded before anything is built. One failure rejects the factory, so
  // the stage keeps the static images and nothing is left half-built.
  const textures = await Promise.all(images.map((image) => loadTexture(ctx.renderer, image)));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 0.1, 100);

  // Soft light pool behind the composition, from the shared texture library.
  const discMaterial = new THREE.MeshBasicMaterial({
    map: ctx.textures.softDisc(),
    color: 0xdcebd9,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
  });
  const disc = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), discMaterial);
  disc.position.z = -2.6;
  scene.add(disc);

  // Cards: one plane per photograph, with a soft shadow behind each.
  const geometry = new THREE.PlaneGeometry(1, 1);
  const cards: Card[] = images.map((_, i) => {
    const texture = textures[i];
    const mask = roundedMask(aspects[i]);
    // Unlit: the photographs keep their own colours. Lighting darkened whites to grey.
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      alphaMap: mask ?? undefined,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      toneMapped: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const shadowMaterial = new THREE.MeshBasicMaterial({
      map: ctx.textures.softDisc(),
      color: 0x0b1f12,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const shadow = new THREE.Mesh(geometry, shadowMaterial);
    shadow.visible = !simple;
    scene.add(shadow);

    return { mesh, shadow, material, shadowMaterial, texture, mask };
  });

  const state: AssemblyState = createAssemblyState(ASSEMBLY_PRODUCT_COUNT);
  let layout: AssemblyLayout | null = null;
  let plan: AssemblyPlan | null = null;

  const applyLayout = (next: AssemblyLayout): void => {
    layout = next;
    plan = planAssembly(next, aspects);
  };

  // Scratch poses, reused every frame so nothing is allocated while the section plays.
  const poseA = emptyPose();
  const poseB = emptyPose();
  const pose = emptyPose();

  /** Path of one product: start to scatter, scatter to formation, formation to final. */
  const poseFor = (product: ProductPlan, progress: ProductProgress, halfH: number): Pose => {
    lerpPose(product.start, product.scatter, progress.enter, poseA);
    lerpPose(poseA, product.formation, progress.form, poseB);
    lerpPose(poseB, product.final, progress.converge, pose);
    // A slight lift while forming, and the card comes forward as it converges, for depth.
    pose.y += Math.sin(Math.PI * progress.form) * 0.06 * halfH;
    pose.z += Math.sin(Math.PI * progress.converge) * 0.3;
    return pose;
  };

  // Values that decide what the frame looks like. A frame is drawn only when one of them has
  // moved, so a pinned section that is not moving does not keep the GPU busy.
  const watched = new Float64Array(ASSEMBLY_PRODUCT_COUNT * 3 + 3 + 3 + 2);
  const previous = new Float64Array(watched.length).fill(Number.NaN);
  let moving = true;

  const update = (frame: FrameState): void => {
    const next: AssemblyLayout = frame.aspect <= PORTRAIT_MAX_ASPECT ? 'portrait' : 'landscape';
    if (next !== layout) applyLayout(next);
    if (!plan) return;

    let w = 0;
    for (const p of state.products) {
      watched[w++] = p.enter;
      watched[w++] = p.form;
      watched[w++] = p.converge;
    }
    watched[w++] = state.dolly;
    watched[w++] = state.push;
    watched[w++] = state.exit;
    watched[w++] = frame.aspect;
    watched[w++] = frame.reduced ? 0 : frame.pointer.x;
    watched[w++] = frame.reduced ? 0 : frame.pointer.y;
    watched[w++] = plan.halfW;
    watched[w++] = plan.halfH;
    moving = false;
    for (let i = 0; i < watched.length; i++) {
      if (!(Math.abs(watched[i] - previous[i]) <= 1e-5)) moving = true;
    }
    previous.set(watched);

    // Camera: starts a little further back, settles, pushes in a touch during the hold,
    // and pulls back as the composition leaves. Pointer movement adds a slight parallax.
    const settled = fitDistance(CAMERA_FOV, frame.aspect, plan.halfW, plan.halfH);
    const dolly = DOLLY_START - (DOLLY_START - 1) * state.dolly;
    const push = 1 - PUSH_AMOUNT * state.push;
    const pull = 1 + EXIT_PULL * state.exit;
    const parallaxX = frame.reduced ? 0 : frame.pointer.x * 0.06 * plan.halfW;
    const parallaxY = frame.reduced ? 0 : -frame.pointer.y * 0.04 * plan.halfH;
    camera.aspect = frame.aspect;
    camera.position.set(parallaxX, parallaxY, settled * dolly * push * pull);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();

    disc.scale.set(plan.halfW * 2.6, plan.halfH * 2.6, 1);
    discMaterial.opacity = 0.85 * (1 - state.exit);

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const product = plan.products[i];
      const p = poseFor(product, state.products[i], plan.halfH);
      const drift = state.exit * 0.35 * plan.halfH;
      const w = product.width * p.s;
      const h = product.height * p.s;
      const y = p.y + drift;
      const fade = p.o * (1 - state.exit);

      card.mesh.position.set(p.x, y, p.z);
      card.mesh.rotation.set(p.rx, p.ry, p.rz);
      card.mesh.scale.set(w, h, 1);
      card.material.opacity = fade;

      // The shadow sits behind the card, offset down and to the right, and appears as the
      // card settles.
      card.shadow.position.set(p.x + 0.05 * w, y - 0.07 * h, p.z - 0.08);
      card.shadow.scale.set(w * 1.16, h * 1.16, 1);
      card.shadowMaterial.opacity = 0.32 * state.products[i].converge * fade;
    }

  };

  const handle: SceneHandle = { scene, camera, update };

  // Motion. Reduced motion holds the settled composition and does not pin or animate.
  let timeline: ReturnType<typeof buildAssemblyTimeline> | null = null;
  let trigger: ScrollTrigger | null = null;
  let releaseSmoothScroll: (() => void) | null = null;
  let onLoad: (() => void) | null = null;

  if (reduced) {
    settleAssemblyState(state);
  } else {
    timeline = buildAssemblyTimeline(state);
    releaseSmoothScroll = acquireSmoothScroll();
    ScrollTrigger.config({ ignoreMobileResize: true });

    trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      // The pinned distance is the section's height beyond one screen.
      end: () => `+=${Math.max(1, section.offsetHeight - pin.offsetHeight)}`,
      pin,
      pinSpacing: false,
      scrub: 0.6,
      invalidateOnRefresh: true,
      animation: timeline,
      onUpdate: () => slot.requestFrame(),
    });

    // Refresh once fonts and the page have settled, so the measured distance is correct.
    // Viewport changes are handled by ScrollTrigger itself.
    const refresh = () => ScrollTrigger.refresh();
    if (document.readyState !== 'complete') {
      onLoad = refresh;
      window.addEventListener('load', onLoad, { once: true });
    }
    void document.fonts?.ready.then(refresh);
    refresh();

    // Frames continue while the section is pinned and something is still moving. Scroll
    // updates, pointer movement and resizes request a frame themselves.
    handle.needsFrame = () => trigger?.isActive === true && moving;
  }

  handle.dispose = () => {
    if (onLoad) window.removeEventListener('load', onLoad);
    trigger?.kill(true);
    timeline?.kill();
    releaseSmoothScroll?.();

    geometry.dispose();
    disc.geometry.dispose();
    discMaterial.dispose();
    for (const card of cards) {
      card.material.dispose();
      card.shadowMaterial.dispose();
      card.texture.dispose();
      card.mask?.dispose();
    }
  };

  return handle;
};
