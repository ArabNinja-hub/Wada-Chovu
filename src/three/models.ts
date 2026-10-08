import * as THREE from 'three';
import { getModel, type ModelKey } from '../content/assets.ts';
import type { QualityProfile } from '../client/quality.ts';
import { buildProcedural } from './placeholders.ts';
import type { MaterialLibrary } from './materials.ts';

/**
 * Model library: the single seam between scenes and 3D content.
 *
 * Scenes ask for a model by key ("model.carton"). This library decides whether to load a
 * .glb / .gltf file (when the manifest sets `url`) or to use the placeholder geometry.
 * Either way the result is normalised the same way:
 *   - scaled so its largest dimension equals the manifest's `fit`
 *   - centred on X and Z, with its base on Y = 0
 *   - shadow flags set from the quality profile
 *
 * This keeps scene layout and animation identical whether a placeholder or a real model is
 * used. A failed or missing file falls back to the placeholder and logs a warning.
 */
export class ModelLibrary {
  private cache = new Map<ModelKey, Promise<THREE.Object3D>>();

  constructor(
    private readonly profile: QualityProfile,
    private readonly materials: MaterialLibrary,
  ) {}

  /** Returns a new instance. Geometry and materials are shared with other instances. */
  async instance(key: ModelKey): Promise<THREE.Object3D> {
    let template = this.cache.get(key);
    if (!template) {
      template = this.load(key);
      this.cache.set(key, template);
    }
    return (await template).clone(true);
  }

  private async load(key: ModelKey): Promise<THREE.Object3D> {
    const asset = getModel(key);
    if (asset.url) {
      try {
        const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
        const gltf = await new GLTFLoader().loadAsync(asset.url);
        return this.normalise(gltf.scene, asset.fit ?? 1);
      } catch (error) {
        console.warn(`Model "${key}" could not be loaded from ${asset.url}; using placeholder geometry.`, error);
      }
    }
    return this.normalise(buildProcedural(asset.builder, this.materials), asset.fit ?? 1);
  }

  private normalise(source: THREE.Object3D, fit: number): THREE.Object3D {
    return normaliseModel(source, fit, this.profile.shadows);
  }
}

/**
 * Normalise any model to a common contract:
 *   - the largest dimension becomes `fit`
 *   - the model is centred on X and Z
 *   - its base sits on Y = 0
 *   - meshes cast and receive shadows when `castShadows` is set
 *
 * `outer` is returned to the scene, which owns its position and rotation. `inner` carries
 * the normalisation (scale and pivot) so it never fights with the scene. Every helper in
 * layout.ts relies on this contract, which is what makes models swappable.
 */
export function normaliseModel(source: THREE.Object3D, fit: number, castShadows: boolean): THREE.Object3D {
  const outer = new THREE.Group();
  const inner = new THREE.Group();
  inner.add(source);
  outer.add(inner);

  outer.updateMatrixWorld(true);
  const size = new THREE.Box3().setFromObject(outer).getSize(new THREE.Vector3());
  const largest = Math.max(size.x, size.y, size.z) || 1;
  inner.scale.setScalar(fit / largest);

  outer.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(outer);
  const center = box.getCenter(new THREE.Vector3());
  inner.position.set(-center.x, -box.min.y, -center.z);
  outer.updateMatrixWorld(true);

  outer.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh.isMesh) {
      mesh.castShadow = castShadows;
      mesh.receiveShadow = castShadows;
    }
  });
  return outer;
}
