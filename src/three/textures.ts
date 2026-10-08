import * as THREE from 'three';
import { getTexture, type TextureKey } from '../content/assets.ts';

/**
 * Texture cache. Textures are referenced by manifest key, so swapping an image only means
 * changing its `src` in assets.ts.
 */
export class TextureLibrary {
  private cache = new Map<TextureKey, THREE.Texture>();
  private blob: THREE.Texture | null = null;

  constructor(private readonly renderer: THREE.WebGLRenderer) {}

  /**
   * Returns a texture immediately. The image fills in when it has loaded, and a plain
   * fallback is used if it fails, so the scene never waits on or breaks because of a file.
   */
  texture(key: TextureKey): THREE.Texture {
    const cached = this.cache.get(key);
    if (cached) return cached;

    const asset = getTexture(key);
    const tex = new THREE.TextureLoader().load(asset.src, undefined, undefined, () => {
      console.warn(`Texture "${key}" failed to load from ${asset.src}; using a plain fallback.`);
      // Three.js accepts canvases as texture sources at runtime. The type only models images.
      tex.image = fallbackCanvas() as unknown as HTMLImageElement;
      tex.needsUpdate = true;
    });
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = Math.min(4, this.renderer.capabilities.getMaxAnisotropy());
    this.cache.set(key, tex);
    return tex;
  }

  /** Soft radial shadow used as a contact shadow under objects. */
  blobShadow(): THREE.Texture {
    if (!this.blob) {
      const size = 128;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        gradient.addColorStop(0, 'rgba(0,0,0,0.6)');
        gradient.addColorStop(0.45, 'rgba(0,0,0,0.28)');
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
      }
      this.blob = new THREE.CanvasTexture(canvas);
      this.blob.colorSpace = THREE.SRGBColorSpace;
    }
    return this.blob;
  }
}

function fallbackCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = '#06fc07';
    ctx.fillRect(0, 150, 256, 26);
  }
  return canvas;
}
