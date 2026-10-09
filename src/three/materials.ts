import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import type { TextureLibrary } from './textures.ts';

/**
 * Shared materials and geometry. Each name is created once and reused by every instance, so
 * cloning a model is cheap and draw calls stay low.
 *
 * The palette is retail: warm white product packaging, a deep brand-green lacquered counter,
 * white gondola shelving with green trim, and glossy containers. Greens and the orange sun
 * are taken from the supplied logo and used as accents only.
 */

const PALETTE = {
  // Product packaging (boxes and pouches)
  box: 0xf6f2ea,
  boxLight: 0xfffdf8,
  boxShade: 0xddd5c4,
  boxEdge: 0xc8bea9,
  pouch: 0xf1e9d8,
  pouchDark: 0xd9cdb2,

  // Brand accents
  neon: 0x06fc07,
  leaf: 0x1f9c15,
  sun: 0xfe6700,
  forest: 0x0f3319,
  forestDeep: 0x0a2413,

  // Fixtures
  lacquer: 0x0f3319,
  stone: 0xefebe2,
  chrome: 0xb9c3bd,

  // Containers
  tin: 0xf7f9f4,
  tinShade: 0xcdd6ca,
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

  // Product packaging ------------------------------------------------------

  /** Main box body: warm white card. */
  boxBody(): THREE.MeshStandardMaterial {
    return this.standard('boxBody', { color: PALETTE.box, roughness: 0.7, metalness: 0 });
  }

  /** Box lid and top panel: a touch lighter. */
  boxLight(): THREE.MeshStandardMaterial {
    return this.standard('boxLight', { color: PALETTE.boxLight, roughness: 0.66, metalness: 0 });
  }

  /** Box shade: shadowed side panels and frames. */
  boxShade(): THREE.MeshStandardMaterial {
    return this.standard('boxShade', { color: PALETTE.boxShade, roughness: 0.75, metalness: 0 });
  }

  /** Edges, seams and tuck flaps. */
  boxEdge(): THREE.MeshStandardMaterial {
    return this.standard('boxEdge', { color: PALETTE.boxEdge, roughness: 0.8, metalness: 0 });
  }

  /** Soft paper pouch. */
  pouch(): THREE.MeshStandardMaterial {
    return this.standard('pouch', { color: PALETTE.pouch, roughness: 0.82, metalness: 0 });
  }

  pouchDark(): THREE.MeshStandardMaterial {
    return this.standard('pouchDark', { color: PALETTE.pouchDark, roughness: 0.9, metalness: 0 });
  }

  /** Printed product label. Uses the manifest's label texture (neutral artwork by default). */
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

  // Brand accents -----------------------------------------------------------

  /** Brand neon. Used sparingly, for small accents only. */
  neon(): THREE.MeshStandardMaterial {
    return this.standard('neon', { color: PALETTE.neon, roughness: 0.42, metalness: 0 });
  }

  /** Brand grass green, for printed bands, stripes and trim. */
  leaf(): THREE.MeshStandardMaterial {
    return this.standard('leaf', { color: PALETTE.leaf, roughness: 0.45, metalness: 0 });
  }

  sun(): THREE.MeshStandardMaterial {
    return this.standard('sun', { color: PALETTE.sun, roughness: 0.5, metalness: 0 });
  }

  forest(): THREE.MeshStandardMaterial {
    return this.standard('forest', { color: PALETTE.forestDeep, roughness: 0.6, metalness: 0 });
  }

  // Fixtures ----------------------------------------------------------------

  /** Deep green lacquer for the display counter body. */
  lacquer(): THREE.MeshPhysicalMaterial {
    return this.physical('lacquer', {
      color: PALETTE.lacquer,
      roughness: 0.35,
      metalness: 0.05,
      clearcoat: 0.6,
      clearcoatRoughness: 0.22,
    });
  }

  /** Pale stone-look counter top. */
  stone(): THREE.MeshPhysicalMaterial {
    return this.physical('stone', {
      color: PALETTE.stone,
      roughness: 0.32,
      metalness: 0,
      clearcoat: 0.4,
      clearcoatRoughness: 0.3,
    });
  }




  /** Brushed metal trim and feet. */
  chrome(): THREE.MeshStandardMaterial {
    return this.standard('chrome', { color: PALETTE.chrome, roughness: 0.3, metalness: 0.8 });
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

  // Containers ----------------------------------------------------------------

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

  /** Display base cylinder (neutral). */
  forestDeep(): THREE.MeshStandardMaterial {
    return this.standard('forestDeep', { color: PALETTE.forestDeep, roughness: 0.6, metalness: 0 });
  }

  // Geometry ------------------------------------------------------------------

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
