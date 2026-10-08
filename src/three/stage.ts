import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { lowerTier, type QualityProfile } from '../client/quality.ts';
import type { StageSceneId } from '../content/types.ts';
import { MaterialLibrary } from './materials.ts';
import { ModelLibrary } from './models.ts';
import { SCENE_LOADERS } from './scenes/index.ts';
import { TextureLibrary } from './textures.ts';
import { clamp, damp } from './rig.ts';
import type { FrameState, SceneContext, SceneHandle } from './types.ts';

/**
 * Stage: one shared WebGL canvas that draws every 3D slot on the page.
 *
 * - Each `[data-stage]` element is a slot. The canvas is fixed over the viewport, and each
 *   visible slot is drawn into its own viewport and scissor rectangle. This is how one
 *   WebGL context serves several scenes, and the page keeps its normal layout and scrolling.
 * - Scenes load lazily: a slot's module is imported only when it nears the viewport.
 * - The loop runs only while a slot is on screen. Reduced motion renders on demand (on
 *   scroll, resize and load) and never animates. Hidden tabs pause.
 * - Adaptive quality: if frames stay slow, the stage steps down a tier. If no WebGL is
 *   available, it disables itself and the static fallback images remain.
 */

interface Slot {
  id: StageSceneId;
  el: HTMLElement;
  near: boolean;
  state: 'idle' | 'loading' | 'ready' | 'failed';
  handle: SceneHandle | null;
  revealed: boolean;
}

const MAX_TIMESTEP = 0.05;
/** Frames ignored after start-up or a quality change. Shader compilation makes them slow. */
const WARMUP_FRAMES = 60;
/** Frames sampled before judging the device. */
const SAMPLE_FRAMES = 120;
/** Median frame times above these thresholds trigger a step down. */
const SLOW_FRAME_SECONDS = 1 / 30;
const VERY_SLOW_FRAME_SECONDS = 1 / 20;

class Stage {
  private readonly canvas = document.createElement('canvas');
  private renderer: THREE.WebGLRenderer | null = null;
  private context: SceneContext | null = null;
  private readonly observer: IntersectionObserver;
  private readonly reducedQuery = matchMedia('(prefers-reduced-motion: reduce)');
  private readonly fineQuery = matchMedia('(pointer: fine)');
  private readonly pointerTarget = { x: 0, y: 0 };
  private readonly pointer = { x: 0, y: 0 };
  private width = 0;
  private height = 0;
  private time = 0;
  private last = 0;
  private rafId = 0;
  private active = true;
  private warmup = WARMUP_FRAMES;
  private samples: number[] = [];

  constructor(
    private readonly slots: Slot[],
    private profile: QualityProfile,
  ) {
    this.observer = new IntersectionObserver(this.onIntersect, { rootMargin: '40% 0px 40% 0px', threshold: 0 });
  }

  start(): void {
    this.canvas.className = 'stage-canvas';
    this.canvas.setAttribute('aria-hidden', 'true');
    document.body.append(this.canvas);
    this.canvas.addEventListener('webglcontextlost', this.onContextLost, false);

    this.resize();
    for (const slot of this.slots) this.observer.observe(slot.el);

    window.addEventListener('resize', this.onResize, { passive: true });
    window.addEventListener('scroll', this.onScroll, { passive: true });
    window.addEventListener('pointermove', this.onPointer, { passive: true });
    window.addEventListener('pointerout', this.onPointerOut, { passive: true });
    document.addEventListener('visibilitychange', this.onVisibility);
    this.reducedQuery.addEventListener('change', this.onMotionChange);
  }

  // Events ----------------------------------------------------------------

  private onIntersect = (entries: IntersectionObserverEntry[]): void => {
    for (const entry of entries) {
      const slot = this.slots.find((s) => s.el === entry.target);
      if (!slot) continue;
      slot.near = entry.isIntersecting;
      if (slot.near && slot.state === 'idle') void this.load(slot);
    }
    this.requestFrame();
  };

  private onResize = (): void => this.resize();

  private onScroll = (): void => {
    if (this.hasLiveSlot()) this.requestFrame();
  };

  private onPointer = (event: PointerEvent): void => {
    if (!this.fineQuery.matches || this.reducedQuery.matches) return;
    this.pointerTarget.x = clamp((event.clientX / window.innerWidth) * 2 - 1, -1, 1);
    this.pointerTarget.y = clamp((event.clientY / window.innerHeight) * 2 - 1, -1, 1);
  };

  /** Pointer left the window (no related target): ease the scene back to rest. */
  private onPointerOut = (event: PointerEvent): void => {
    if (event.relatedTarget) return;
    this.pointerTarget.x = 0;
    this.pointerTarget.y = 0;
  };

  private onVisibility = (): void => {
    if (!document.hidden) {
      this.last = 0;
      this.requestFrame();
    }
  };

  private onMotionChange = (): void => {
    this.last = 0;
    this.requestFrame();
  };

  private onContextLost = (event: Event): void => {
    event.preventDefault();
    console.warn('WebGL context was lost; showing the static images.');
    this.disable();
  };

  // Loading -----------------------------------------------------------------

  private async load(slot: Slot): Promise<void> {
    slot.state = 'loading';
    try {
      const factory = await SCENE_LOADERS[slot.id]();
      const context = this.ensureContext();
      const handle = await factory(context);
      if (!this.active) return;
      try {
        this.renderer?.compile(handle.scene, handle.camera);
      } catch {
        // Shader precompilation is an optimisation only.
      }
      slot.handle = handle;
      slot.state = 'ready';
    } catch (error) {
      slot.state = 'failed';
      console.warn(`3D scene "${slot.id}" could not start; showing its static image.`, error);
      if (!this.renderer) this.disable();
    }
    this.requestFrame();
  }

  private ensureContext(): SceneContext {
    if (this.context) return this.context;

    const renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false,
    });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.shadowMap.enabled = this.profile.shadows;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.setPixelRatio(this.pixelRatio());
    renderer.setSize(this.width, this.height, false);
    this.renderer = renderer;

    let environment: THREE.Texture | null = null;
    if (this.profile.environment) {
      const pmrem = new THREE.PMREMGenerator(renderer);
      environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      pmrem.dispose();
    }

    const textures = new TextureLibrary(renderer);
    const materials = new MaterialLibrary(textures.texture('texture.cartonLabel'));
    const models = new ModelLibrary(this.profile, materials);
    this.context = { renderer, profile: this.profile, models, textures, environment };
    return this.context;
  }

  // Rendering ---------------------------------------------------------------

  private pixelRatio(): number {
    return Math.min(window.devicePixelRatio || 1, this.profile.maxPixelRatio);
  }

  private resize(): void {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    if (!width || !height) return;
    this.width = width;
    this.height = height;
    if (this.renderer) {
      this.renderer.setPixelRatio(this.pixelRatio());
      this.renderer.setSize(width, height, false);
    }
    this.requestFrame();
  }

  private continuous(): boolean {
    return !this.reducedQuery.matches && !document.hidden;
  }

  private hasLiveSlot(): boolean {
    return this.slots.some((slot) => slot.near && slot.state === 'ready');
  }

  private requestFrame(): void {
    if (this.rafId || !this.active) return;
    this.rafId = requestAnimationFrame(this.tick);
  }

  private tick = (now: number): void => {
    this.rafId = 0;
    if (!this.active) return;

    const dt = this.last ? clamp((now - this.last) / 1000, 0, MAX_TIMESTEP) : 1 / 60;
    this.last = now;
    this.time += dt;

    this.pointer.x = damp(this.pointer.x, this.pointerTarget.x, 4, dt);
    this.pointer.y = damp(this.pointer.y, this.pointerTarget.y, 4, dt);

    this.renderFrame(dt);
    this.measure(dt);

    if (this.continuous() && this.hasLiveSlot()) {
      this.requestFrame();
    } else {
      this.last = 0;
    }
  };

  private renderFrame(dt: number): void {
    const renderer = this.renderer;
    if (!renderer) return;

    const W = this.width;
    const H = this.height;
    const reduced = this.reducedQuery.matches;

    // Clear the whole canvas first, so nothing from an earlier frame is left behind.
    renderer.setScissorTest(false);
    renderer.setViewport(0, 0, W, H);
    renderer.clear(true, true, true);
    renderer.setScissorTest(true);

    for (const slot of this.slots) {
      if (!slot.near || slot.state !== 'ready' || !slot.handle) continue;

      const rect = slot.el.getBoundingClientRect();
      const x0 = Math.max(0, rect.left);
      const x1 = Math.min(W, rect.right);
      const y0 = Math.max(0, rect.top);
      const y1 = Math.min(H, rect.bottom);
      if (rect.width < 2 || rect.height < 2 || x1 - x0 < 1 || y1 - y0 < 1) continue;

      // -1 when the slot is well below the centre line, +1 when well above it.
      const centre = rect.top + rect.height / 2;
      const progress = clamp((centre - H / 2) / (H / 2 + rect.height / 2), -1, 1);

      const frame: FrameState = {
        time: this.time,
        dt,
        progress,
        pointer: this.pointer,
        reduced,
        aspect: rect.width / rect.height,
      };
      slot.handle.update(frame);

      // WebGL viewports use a bottom-left origin. The slot's rectangle is converted here.
      renderer.setViewport(rect.left, H - rect.bottom, rect.width, rect.height);
      renderer.setScissor(x0, H - y1, x1 - x0, y1 - y0);
      renderer.render(slot.handle.scene, slot.handle.camera);

      if (!slot.revealed) {
        slot.revealed = true;
        slot.el.classList.add('is-3d');
      }
    }

    renderer.setScissorTest(false);
    renderer.setViewport(0, 0, W, H);
  }

  // Adaptive quality -------------------------------------------------------

  /**
   * Samples real frame times while the stage is animating. A sustained slow median steps
   * the quality down one tier. If even the lowest tier is too slow, 3D is switched off and
   * the static images remain. Forced quality (development override) is never changed.
   */
  private measure(dt: number): void {
    if (!this.profile.adaptive || !this.continuous() || dt <= 0) return;
    if (this.warmup > 0) {
      this.warmup -= 1;
      return;
    }
    this.samples.push(dt);
    if (this.samples.length < SAMPLE_FRAMES) return;

    const sorted = [...this.samples].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)] ?? 0;
    this.samples = [];
    this.adapt(median);
  }

  private adapt(median: number): void {
    if (median <= SLOW_FRAME_SECONDS) return;
    if (this.profile.tier === 'low') {
      if (median > VERY_SLOW_FRAME_SECONDS) {
        console.info('3D frame rate is too low on this device; showing the static images.');
        this.disable();
      }
      return;
    }
    this.applyProfile(lowerTier(this.profile));
  }

  private applyProfile(next: QualityProfile): void {
    this.profile = next;
    this.warmup = WARMUP_FRAMES;
    if (this.context) this.context.profile = next;
    const renderer = this.renderer;
    if (!renderer) return;
    renderer.setPixelRatio(this.pixelRatio());
    renderer.shadowMap.enabled = next.shadows;
    renderer.shadowMap.needsUpdate = true;
    for (const slot of this.slots) {
      slot.handle?.scene.traverse((object) => {
        const material = (object as THREE.Mesh).material;
        if (!material) return;
        for (const m of Array.isArray(material) ? material : [material]) m.needsUpdate = true;
      });
    }
  }

  // Teardown ---------------------------------------------------------------

  private disable(): void {
    if (!this.active) return;
    this.active = false;
    cancelAnimationFrame(this.rafId);
    this.rafId = 0;
    this.observer.disconnect();
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('pointermove', this.onPointer);
    window.removeEventListener('pointerout', this.onPointerOut);
    document.removeEventListener('visibilitychange', this.onVisibility);
    this.reducedQuery.removeEventListener('change', this.onMotionChange);
    this.canvas.remove();
    for (const slot of this.slots) {
      slot.el.classList.remove('is-3d');
      slot.handle = null;
    }
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss();
      this.renderer = null;
    }
    this.context = null;
  }
}

/** Mounts the 3D stage on the given slots. Call only when 3D is supported and allowed. */
export function mountStage(elements: HTMLElement[], profile: QualityProfile): void {
  const slots: Slot[] = [];
  for (const el of elements) {
    const id = el.dataset.stage as StageSceneId | undefined;
    if (id && id in SCENE_LOADERS) {
      slots.push({ id, el, near: false, state: 'idle', handle: null, revealed: false });
    }
  }
  if (slots.length === 0) return;
  new Stage(slots, profile).start();
}
