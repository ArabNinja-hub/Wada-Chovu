import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import type { ProceduralBuilder } from '../content/types.ts';
import type { MaterialLibrary } from './materials.ts';

/**
 * Placeholder models, built in code.
 *
 * These stand in for the real Wada Chovu products until .glb models or product photos are
 * supplied. They are deliberately finished objects, not raw primitives: a branded carton, a
 * glossy sealed tin, a product sack, a wooden pallet, warehouse racking, a display plinth, and
 * a product-photo card. They share the palette and lighting of the live scenes so the demo
 * reads as one intentional set.
 *
 * The `card` builder is the product-imagery path: it shows a product photo on a framed panel
 * in place of a 3D object. Point `texture.productCard` at a real photo and set a model key's
 * `builder` to `'card'` to swap imagery in with no scene-code change.
 *
 * Every builder returns a group centred on X/Z with its base on Y = 0. The model library
 * then normalises it to the manifest's `fit`, so builders do not need to match scene scale.
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

/** A branded shipping carton: kraft body, lighter top lid, flap seam, tape, front label, side stripe. */
function buildCarton(m: MaterialLibrary): THREE.Group {
  const g = new THREE.Group();
  g.name = 'carton';
  const W = 1;
  const H = 0.62;
  const D = 0.74;

  // Body.
  g.add(mesh(m.roundedBox(W, H, D, 0.025), m.kraft(), [0, H / 2, 0]));
  // Top lid panel, slightly lighter, with a small lip.
  g.add(mesh(m.roundedBox(W, 0.014, D, 0.012), m.kraftLight(), [0, H + 0.007, 0]));
  // Flap seam across the top centre.
  g.add(mesh(m.box(W * 0.92, 0.006, 0.012), m.kraftEdge(), [0, H + 0.015, 0]));
  // Kraft tape along the top, with a slight overhang on the front/back edges.
  g.add(mesh(m.box(0.15, 0.016, D + 0.02), m.tape(), [0, H + 0.016, 0]));
  // Front label: a kraft border with the logo panel inset, facing the camera (+Z).
  g.add(mesh(m.plane(0.54, 0.32), m.kraftEdge(), [0, H * 0.55, D / 2 + 0.002]));
  g.add(mesh(m.plane(0.5, 0.294), m.label(), [0, H * 0.55, D / 2 + 0.004]));
  // Leaf-green side stripe on the +X face.
  g.add(mesh(m.plane(0.1, H * 0.5), m.leaf(), [W / 2 + 0.004, H * 0.5, 0], [0, Math.PI / 2, 0]));
  return g;
}

/** A wooden pallet: bottom boards, stringer blocks and a five-board deck. */
function buildPallet(m: MaterialLibrary): THREE.Group {
  const g = new THREE.Group();
  g.name = 'pallet';
  const W = 1.2;
  const D = 0.8;
  const bottomH = 0.025;
  const blockH = 0.07;
  const deckH = 0.025;

  // Bottom boards running along X.
  for (const z of [-D / 2 + 0.08, 0, D / 2 - 0.08]) {
    g.add(mesh(m.box(W, bottomH, 0.16), m.woodDark(), [0, bottomH / 2, z]));
  }
  // Stringer blocks at the corners and mid-edges.
  for (const x of [-W / 2 + 0.08, 0, W / 2 - 0.08]) {
    for (const z of [-D / 2 + 0.08, D / 2 - 0.08]) {
      g.add(mesh(m.box(0.12, blockH, 0.16), m.wood(), [x, bottomH + blockH / 2, z]));
    }
  }
  // Deck boards running along X, alternating tone for a real stacked-wood look.
  const deckY = bottomH + blockH + deckH / 2;
  for (let i = 0; i < 5; i++) {
    const z = -D / 2 + deckH / 2 + i * ((D - deckH) / 4);
    const board = i % 2 === 0 ? m.wood() : m.woodDark();
    g.add(mesh(m.box(W, deckH, D / 5 - 0.012), board, [0, deckY, z]));
  }
  // Thin lighter top highlight on the deck.
  g.add(mesh(m.box(W, 0.004, D), m.kraftLight(), [0, bottomH + blockH + deckH + 0.002, 0]));
  return g;
}

/** A sealed product tin: glossy body, printed band with a label, lid and rims. */
function buildTin(m: MaterialLibrary): THREE.Group {
  const g = new THREE.Group();
  g.name = 'tin';
  const R = 0.32;
  const H = 0.62;

  // Body: a lathe profile with a slight lip at the top.
  const profile = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(R - 0.02, 0),
    new THREE.Vector2(R, 0.02),
    new THREE.Vector2(R, H - 0.04),
    new THREE.Vector2(R - 0.015, H),
    new THREE.Vector2(R - 0.055, H + 0.012),
    new THREE.Vector2(0, H + 0.012),
  ];
  g.add(mesh(m.lathe(profile, 56), m.tin()));
  // Printed band around the middle.
  g.add(mesh(m.cylinder(R + 0.004, R + 0.004, H * 0.4, 56, true), m.leaf(), [0, H * 0.46, 0]));
  // Small white label on the front of the band.
  g.add(mesh(m.plane(0.3, 0.16), m.whiteMatte(), [0, H * 0.46, R + 0.006]));
  // Lid disc on top, slightly proud.
  g.add(mesh(m.cylinder(R - 0.01, R - 0.01, 0.02, 56), m.tinShade(), [0, H + 0.02, 0]));
  // Lid rim.
  g.add(mesh(m.torus(R - 0.03, 0.012), m.tinShade(), [0, H + 0.03, 0], [Math.PI / 2, 0, 0]));
  // Bottom rim.
  g.add(mesh(m.torus(R - 0.04, 0.01), m.tinShade(), [0, 0.012, 0], [Math.PI / 2, 0, 0]));
  return g;
}

/** A product sack: a soft pillow pouch with a gathered, crimped top, a seam and a label. */
function buildSack(m: MaterialLibrary): THREE.Group {
  const g = new THREE.Group();
  g.name = 'sack';
  const H = 0.8;

  // Pillow body with the top gathered inwards.
  const geometry = new RoundedBoxGeometry(0.5, H, 0.22, 4, 0.1);
  const position = geometry.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < position.count; i++) {
    const y = position.getY(i);
    if (y > 0.12) {
      const t = Math.min(1, (y - 0.12) / 0.28);
      const pinch = 1 - 0.42 * t * t;
      position.setX(i, position.getX(i) * pinch);
    }
  }
  geometry.translate(0, H / 2, 0);
  geometry.computeVertexNormals();
  g.add(mesh(geometry, m.cloth()));

  // Crimp band and tie at the gathered top.
  g.add(mesh(m.roundedBox(0.26, 0.07, 0.13, 0.02), m.clothDark(), [0, H - 0.045, 0]));
  g.add(mesh(m.torus(0.11, 0.02), m.clothDark(), [0, H - 0.075, 0], [Math.PI / 2, 0, 0]));
  // Front seam.
  g.add(mesh(m.box(0.006, H * 0.78, 0.008), m.clothDark(), [0, H * 0.46, 0.112]));
  // Small front label with a leaf band.
  g.add(mesh(m.roundedBox(0.24, 0.15, 0.012, 0.02), m.whiteMatte(), [0, H * 0.42, 0.113]));
  g.add(mesh(m.box(0.24, 0.03, 0.014), m.leaf(), [0, H * 0.345, 0.114]));
  return g;
}

/** Open warehouse racking: steel uprights, shelf decks and orange beams at four levels. */
function buildRack(m: MaterialLibrary): THREE.Group {
  const g = new THREE.Group();
  g.name = 'rack';
  const W = 2.4;
  const H = 2;
  const D = 0.9;
  const post = 0.07;
  const upright = m.steel();
  const beam = m.sun();
  const shelfFractions = [0.21, 0.45, 0.69, 0.93];

  for (const x of [-W / 2 + post / 2, W / 2 - post / 2]) {
    for (const z of [-D / 2 + post / 2, D / 2 - post / 2]) {
      g.add(mesh(m.box(post, H, post), upright, [x, H / 2, z]));
    }
  }
  for (const fraction of shelfFractions) {
    const y = fraction * H;
    // Shelf deck: its top surface sits at y + 0.025, which is where cartons rest.
    g.add(mesh(m.box(W - post, 0.05, D - post), m.steelLight(), [0, y, 0]));
    for (const z of [-D / 2 + post / 2, D / 2 - post / 2]) {
      g.add(mesh(m.box(W, 0.05, 0.05), beam, [0, y, z]));
    }
  }
  return g;
}

/** A round display base with a soft sheen and a raised top ring. */
function buildPlinth(m: MaterialLibrary): THREE.Group {
  const g = new THREE.Group();
  g.name = 'plinth';
  g.add(mesh(m.cylinder(1, 1, 0.1, 72), m.plinth(), [0, 0.05, 0]));
  // Raised top surface.
  g.add(mesh(m.cylinder(0.97, 0.97, 0.012, 72), m.whiteMatte(), [0, 0.106, 0]));
  // Outer rim.
  g.add(mesh(m.torus(1, 0.018), m.kraftDark(), [0, 0.1, 0], [Math.PI / 2, 0, 0]));
  return g;
}

/**
 * A product-photo card: a kraft frame, white matte and a double-sided photo panel. This is
 * the product-imagery placeholder. It stands on its bottom edge and is normalised like any
 * other model, so it can replace a 3D object in any scene.
 */
function buildCard(m: MaterialLibrary): THREE.Group {
  const g = new THREE.Group();
  g.name = 'card';
  const W = 1;
  const H = 1.25;
  const D = 0.05;

  // Kraft frame.
  g.add(mesh(m.roundedBox(W, H, D, 0.045), m.kraftDark(), [0, H / 2, 0]));
  // White matte, inset.
  g.add(mesh(m.roundedBox(W * 0.92, H * 0.94, D + 0.004, 0.03), m.whiteMatte(), [0, H / 2, 0.002]));
  // Photo panel, double-sided so the card reads from both sides as it turns. It sits clearly
  // in front of the matte so the two never z-fight.
  g.add(mesh(m.plane(W * 0.82, H * 0.82), m.productCard(), [0, H / 2, D / 2 + 0.015]));
  // Small leaf brand strip at the bottom of the photo area.
  g.add(mesh(m.plane(W * 0.5, 0.05), m.leaf(), [0, H * 0.115, D / 2 + 0.016]));
  return g;
}

const BUILDERS: Record<ProceduralBuilder, (m: MaterialLibrary) => THREE.Group> = {
  carton: buildCarton,
  pallet: buildPallet,
  tin: buildTin,
  sack: buildSack,
  rack: buildRack,
  plinth: buildPlinth,
  card: buildCard,
};

export function buildProcedural(kind: ProceduralBuilder, materials: MaterialLibrary): THREE.Group {
  return BUILDERS[kind](materials);
}
