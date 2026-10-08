import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import type { ProceduralBuilder } from '../content/types.ts';
import type { MaterialLibrary } from './materials.ts';

/**
 * Placeholder geometry, built in code. Each builder returns a group sitting on y = 0,
 * centred on the origin. The model system normalises every result to the size in the
 * asset manifest, so these builders do not need to match the scene's scale.
 *
 * Replace any of these with a .glb by setting `url` on its entry in assets.ts.
 */

type Vec3 = [number, number, number];

function mesh(
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  position: Vec3 = [0, 0, 0],
  rotation: Vec3 = [0, 0, 0],
): THREE.Mesh {
  const m = new THREE.Mesh(geometry, material);
  m.position.set(...position);
  m.rotation.set(...rotation);
  return m;
}

/** A kraft shipping carton with a printed label, a brand stripe and top tape. */
function buildCarton(m: MaterialLibrary): THREE.Group {
  const g = new THREE.Group();
  g.name = 'carton';
  const W = 1;
  const H = 0.6;
  const D = 0.72;
  g.add(mesh(m.roundedBox(W, H, D, 0.025), m.kraft(), [0, H / 2, 0]));
  g.add(mesh(m.box(0.16, 0.01, D + 0.01), m.tape(), [0, H + 0.004, 0]));
  g.add(mesh(m.plane(0.46, 0.28), m.label(), [-0.18, H * 0.56, D / 2 + 0.004]));
  g.add(mesh(m.plane(0.1, 0.46), m.leaf(), [W / 2 + 0.004, H * 0.5, 0], [0, Math.PI / 2, 0]));
  return g;
}

/** A wooden pallet: bottom boards, blocks and a five-board deck. */
function buildPallet(m: MaterialLibrary): THREE.Group {
  const g = new THREE.Group();
  g.name = 'pallet';
  const W = 1.2;
  const bottomH = 0.025;
  const blockH = 0.07;
  const deckH = 0.025;
  for (const z of [-0.42, 0, 0.42]) {
    g.add(mesh(m.box(W, bottomH, 0.16), m.woodDark(), [0, bottomH / 2, z]));
  }
  for (const x of [-0.52, 0, 0.52]) {
    for (const z of [-0.42, 0.42]) {
      g.add(mesh(m.box(0.12, blockH, 0.16), m.wood(), [x, bottomH + blockH / 2, z]));
    }
  }
  const deckY = bottomH + blockH + deckH / 2;
  for (let i = 0; i < 5; i++) {
    g.add(mesh(m.box(W, deckH, 0.15), m.wood(), [0, deckY, -0.46 + i * 0.23]));
  }
  return g;
}

/** A metal tin or canister with a printed band and a rolled lid. Stands in for a product container. */
function buildTin(m: MaterialLibrary): THREE.Group {
  const g = new THREE.Group();
  g.name = 'tin';
  const R = 0.31;
  const H = 0.62;
  const profile = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(R - 0.02, 0),
    new THREE.Vector2(R, 0.02),
    new THREE.Vector2(R, H - 0.03),
    new THREE.Vector2(R - 0.02, H),
    new THREE.Vector2(R - 0.07, H + 0.012),
    new THREE.Vector2(0, H + 0.012),
  ];
  g.add(mesh(m.lathe(profile, 56), m.tin()));
  g.add(mesh(m.cylinder(R + 0.004, R + 0.004, H * 0.42, 56, true), m.leaf(), [0, H * 0.5, 0]));
  g.add(mesh(m.torus(R - 0.05, 0.008), m.tinShade(), [0, H + 0.012, 0], [Math.PI / 2, 0, 0]));
  return g;
}

/**
 * A soft pouch: a rounded pillow whose upper part is gathered inwards, with a crimped band at
 * the top. The gathering is applied to the geometry itself, so the shape is built in code.
 */
function buildSack(m: MaterialLibrary): THREE.Group {
  const g = new THREE.Group();
  g.name = 'sack';
  const geometry = new RoundedBoxGeometry(0.5, 0.8, 0.2, 4, 0.1);
  const position = geometry.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < position.count; i++) {
    const y = position.getY(i);
    if (y > 0.12) {
      const t = Math.min(1, (y - 0.12) / 0.28);
      const pinch = 1 - 0.42 * t * t;
      position.setX(i, position.getX(i) * pinch);
    }
  }
  geometry.translate(0, 0.4, 0);
  geometry.computeVertexNormals();
  g.add(mesh(geometry, m.cloth()));
  g.add(mesh(m.roundedBox(0.26, 0.06, 0.12, 0.02), m.clothDark(), [0, 0.76, 0]));
  return g;
}

/** Open warehouse racking: steel uprights and orange beams at four levels. */
function buildRack(m: MaterialLibrary): THREE.Group {
  const g = new THREE.Group();
  g.name = 'rack';
  const W = 2.4;
  const H = 2;
  const D = 0.9;
  const post = 0.07;
  const upright = m.steel();
  const beam = m.sun();
  for (const x of [-W / 2 + post / 2, W / 2 - post / 2]) {
    for (const z of [-D / 2 + post / 2, D / 2 - post / 2]) {
      g.add(mesh(m.box(post, H, post), upright, [x, H / 2, z]));
    }
  }
  for (const y of [0.42, 0.9, 1.38, 1.86]) {
    // Shelf deck: its top surface sits at y + 0.025, which is where cartons are placed.
    g.add(mesh(m.box(W - post, 0.05, D - post), m.steelLight(), [0, y, 0]));
    for (const z of [-D / 2 + post / 2, D / 2 - post / 2]) {
      g.add(mesh(m.box(W, 0.05, 0.05), beam, [0, y, z]));
    }
  }
  return g;
}

/** Round display base. */
function buildPlinth(m: MaterialLibrary): THREE.Group {
  const g = new THREE.Group();
  g.name = 'plinth';
  g.add(mesh(m.cylinder(1, 1, 0.1, 72), m.plinth(), [0, 0.05, 0]));
  g.add(mesh(m.cylinder(0.97, 0.97, 0.01, 72), m.tin(), [0, 0.1005, 0]));
  return g;
}

const BUILDERS: Record<ProceduralBuilder, (m: MaterialLibrary) => THREE.Group> = {
  carton: buildCarton,
  pallet: buildPallet,
  tin: buildTin,
  sack: buildSack,
  rack: buildRack,
  plinth: buildPlinth,
};

export function buildProcedural(kind: ProceduralBuilder, materials: MaterialLibrary): THREE.Group {
  return BUILDERS[kind](materials);
}
