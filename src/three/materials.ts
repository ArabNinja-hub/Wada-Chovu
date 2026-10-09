import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import type { TextureLibrary } from './textures.ts';

/**
 * Shared materials and geometry. Each name is created once and reused by every instance, so
 * cloning a model is cheap and draw calls stay low. Colours are sampled from the supplied logo.
 */

const PALETTE = {
  kraft: 0xc99a5c,
  kraftLight: 0xdcb27c,
  kraftDark: 0xa87a42,
  kraftEdge: 0x8a5f33,
  tape: 0xf3e6cc,
  neon: 0x06fc07,
  leaf: 0x1f9c15,
  sun: 0xfe6700,
  forest: 0x0a2413,
  steel: 0x5b6b65,
  steelLight: 0x9aa9a2,
  wood: 0xd7b98a,
  woodDark: 0xa98151,
  tin: 0xf7f9f4,
  tinShade: 0xcdd6ca,
  cloth: 0xefe6d2,
  clothDark: 0xdccfb3,
  plinth: 0xe8efe6,
  matte: 0xffffff,
  white: 0xffffff,
} as const;

export class MaterialLibrary {
  private materials = new Map<string, THREE.Material>();
  private geometries = new Map<string, THREE.BufferGeometry>();

  constructor(private readonly textures: TextureLibrary) {}

  private mat(name: string, make: () => THREE.Material): THREE.Material {
    let m = this.materials.get(name);
    if (!m) {
      m = make();
      this.materials.set(name, m);
    }
    return m;
  }

  private geo(name: string, make: () => THREE.BufferGeometry): THREE.BufferGeometry {
    let g = this.geometries.get(name);
    if (!g) {
      g = make();
      this.geometries.set(name, g);
    }
    return g;
  }

  standard(name: string, params: THREE.MeshStandardMaterialParameters): THREE.MeshStandardMaterial {
    return this.mat(name, () => new THREE.MeshStandardMaterial(params)) as THREE.MeshStandardMaterial;
  }

  /** Clear-coated material for containers and display pieces: a premium, product-like finish. */
  physical(name: string, params: THREE.MeshPhysicalMaterialParameters): THREE.MeshPhysicalMaterial {
    return this.mat(name, () => new THREE.MeshPhysicalMaterial(params)) as THREE.MeshPhysicalMaterial;
  }

  kraft(): THREE.MeshStandardMaterial {
    return this.standard('kraft', { color: PALETTE.kraft, roughness: 0.78, metalness: 0 });
  }

  kraftLight(): THREE.MeshStandardMaterial {
    return this.standard('kraftLight', { color: PALETTE.kraftLight, roughness: 0.8, metalness: 0 });
  }

  kraftDark(): THREE.MeshStandardMaterial {
    return this.standard('kraftDark', { color: PALETTE.kraftDark, roughness: 0.85, metalness: 0 });
  }

  /** Slightly darker edge tone, used for carton seams and frames. */
  kraftEdge(): THREE.MeshStandardMaterial {
    return this.standard('kraftEdge', { color: PALETTE.kraftEdge, roughness: 0.9, metalness: 0 });
  }

  tape(): THREE.MeshStandardMaterial {
    return this.standard('tape', { color: PALETTE.tape, roughness: 0.6, metalness: 0 });
  }

  /** Printed carton label. Uses the manifest's carton-label texture (the supplied logo by default). */
  label(): THREE.MeshStandardMaterial {
    return this.standard('label', {
      color: PALETTE.white,
      map: this.textures.texture('texture.cartonLabel'),
      roughness: 0.55,
      metalness: 0,
    });
  }

  /** Product-photo surface used by the `card` placeholder (product imagery in a 3D scene). */
  productCard(): THREE.MeshStandardMaterial {
    return this.standard('productCard', {
      color: PALETTE.white,
      map: this.textures.texture('texture.productCard'),
      roughness: 0.38,
      metalness: 0,
    });
  }

  /** Plain white matte, used as the inner border of a product card. */
  whiteMatte(): THREE.MeshStandardMaterial {
    return this.standard('whiteMatte', { color: PALETTE.matte, roughness: 0.92, metalness: 0 });
  }

  /** Brand neon. Used sparingly, for small accents only. */
  neon(): THREE.MeshStandardMaterial {
    return this.standard('neon', { color: PALETTE.neon, roughness: 0.42, metalness: 0 });
  }

  /** Grass green from the logo, toned down for printed bands and stripes. */
  leaf(): THREE.MeshStandardMaterial {
    return this.standard('leaf', { color: PALETTE.leaf, roughness: 0.45, metalness: 0 });
  }

  sun(): THREE.MeshStandardMaterial {
    return this.standard('sun', { color: PALETTE.sun, roughness: 0.5, metalness: 0 });
  }

  forest(): THREE.MeshStandardMaterial {
    return this.standard('forest', { color: PALETTE.forest, roughness: 0.6, metalness: 0 });
  }

  steel(): THREE.MeshStandardMaterial {
    return this.standard('steel', { color: PALETTE.steel, roughness: 0.42, metalness: 0.65 });
  }

  steelLight(): THREE.MeshStandardMaterial {
    return this.standard('steelLight', { color: PALETTE.steelLight, roughness: 0.38, metalness: 0.6 });
  }

  wood(): THREE.MeshStandardMaterial {
    return this.standard('wood', { color: PALETTE.wood, roughness: 0.86, metalness: 0 });
  }

  woodDark(): THREE.MeshStandardMaterial {
    return this.standard('woodDark', { color: PALETTE.woodDark, roughness: 0.9, metalness: 0 });
  }

  /** Glossy container body (tin / canister): clear-coated plastic or metal. */
  tin(): THREE.MeshPhysicalMaterial {
    return this.physical('tin', {
      color: PALETTE.tin,
      roughness: 0.22,
      metalness: 0.08,
      clearcoat: 0.7,
      clearcoatRoughness: 0.18,
    });
  }

  /** Container lid and rim. */
  tinShade(): THREE.MeshPhysicalMaterial {
    return this.physical('tinShade', {
      color: PALETTE.tinShade,
      roughness: 0.3,
      metalness: 0.25,
      clearcoat: 0.5,
      clearcoatRoughness: 0.25,
    });
  }

  cloth(): THREE.MeshStandardMaterial {
    return this.standard('cloth', { color: PALETTE.cloth, roughness: 0.95, metalness: 0 });
  }

  clothDark(): THREE.MeshStandardMaterial {
    return this.standard('clothDark', { color: PALETTE.clothDark, roughness: 0.95, metalness: 0 });
  }

  /** Display base with a soft sheen. */
  plinth(): THREE.MeshPhysicalMaterial {
    return this.physical('plinth', {
      color: PALETTE.plinth,
      roughness: 0.42,
      metalness: 0,
      sheen: 0.6,
      sheenColor: new THREE.Color(0xffffff),
      clearcoat: 0.25,
      clearcoatRoughness: 0.4,
    });
  }

  /** Rounded box geometry, cached by size. */
  roundedBox(width: number, height: number, depth: number, radius = 0.02): THREE.BufferGeometry {
    const key = `rbox:${width}:${height}:${depth}:${radius}`;
    return this.geo(key, () => new RoundedBoxGeometry(width, height, depth, 3, radius));
  }

  box(width: number, height: number, depth: number): THREE.BufferGeometry {
    const key = `box:${width}:${height}:${depth}`;
    return this.geo(key, () => new THREE.BoxGeometry(width, height, depth));
  }

  cylinder(radiusTop: number, radiusBottom: number, height: number, segments = 40, open = false): THREE.BufferGeometry {
    const key = `cyl:${radiusTop}:${radiusBottom}:${height}:${segments}:${open}`;
    return this.geo(key, () => new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments, 1, open));
  }

  plane(width: number, height: number): THREE.BufferGeometry {
    const key = `plane:${width}:${height}`;
    return this.geo(key, () => new THREE.PlaneGeometry(width, height));
  }

  circle(radius: number, segments = 64): THREE.BufferGeometry {
    const key = `circle:${radius}:${segments}`;
    return this.geo(key, () => new THREE.CircleGeometry(radius, segments));
  }

  lathe(points: THREE.Vector2[], segments = 48): THREE.BufferGeometry {
    const key = `lathe:${points.map((p) => `${p.x},${p.y}`).join('|')}:${segments}`;
    return this.geo(key, () => new THREE.LatheGeometry(points, segments));
  }

  torus(radius: number, tube: number): THREE.BufferGeometry {
    const key = `torus:${radius}:${tube}`;
    return this.geo(key, () => new THREE.TorusGeometry(radius, tube, 12, 40));
  }
}
