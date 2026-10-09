import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import type { ProceduralBuilder } from '../content/types.ts';
import type { MaterialLibrary } from './materials.ts';

/**
 * Placeholder models, built in code.
 *
 * These stand in for the real Chovu Chovu Brothers Ltd products and fixtures until .glb
 * models are supplied. They are deliberately finished, neutral objects, not
 * raw primitives: a product box, a glossy tin, a product pouch, a display plinth, and a
 * product-photo card. They share the palette and
 * lighting of the live scenes so the demo reads as one intentional shop set.
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

/** A product box: warm white card body, light lid, green brand stripe, front label, side band. */
function buildCarton(m: MaterialLibrary): THREE.Group {
  const g = new THREE.Group();
  g.name = 'carton';
  const W = 1;
  const H = 0.62;
  const D = 0.74;

  // Body.
  g.add(mesh(m.roundedBox(W, H, D, 0.025), m.boxBody(), [0, H / 2, 0]));
  // Top lid panel, slightly lighter, with a small lip.
  g.add(mesh(m.roundedBox(W, 0.014, D, 0.012), m.boxLight(), [0, H + 0.007, 0]));
  // Brand stripe across the top centre.
  g.add(mesh(m.box(0.16, 0.006, D * 0.92), m.leaf(), [0, H + 0.016, 0]));
  // Front label: a light border with the label panel inset, facing the camera (+Z).
  g.add(mesh(m.plane(0.54, 0.32), m.boxEdge(), [0, H * 0.55, D / 2 + 0.002]));
  g.add(mesh(m.plane(0.5, 0.294), m.label(), [0, H * 0.55, D / 2 + 0.004]));
  // Green side band on the +X face.
  g.add(mesh(m.plane(0.1, H * 0.5), m.leaf(), [W / 2 + 0.004, H * 0.5, 0], [0, Math.PI / 2, 0]));
  return g;
}

/**
 * A shop display counter: a deep green lacquered body on a dark recessed kick, a pale stone
 * top and a brand-green fascia strip. Its top surface is where products are displayed.
 */

/** A product pouch: a soft pillow bag with a gathered, crimped top, a seam and a label. */
function buildPouch(m: MaterialLibrary): THREE.Group {
  const g = new THREE.Group();
  g.name = 'pouch';
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
  g.add(mesh(geometry, m.pouch()));

  // Crimp band and tie at the gathered top.
  g.add(mesh(m.roundedBox(0.26, 0.07, 0.13, 0.02), m.pouchDark(), [0, H - 0.045, 0]));
  g.add(mesh(m.torus(0.11, 0.02), m.pouchDark(), [0, H - 0.075, 0], [Math.PI / 2, 0, 0]));
  // Front seam.
  g.add(mesh(m.box(0.006, H * 0.78, 0.008), m.pouchDark(), [0, H * 0.46, 0.112]));
  // Small front label with a green band.
  g.add(mesh(m.roundedBox(0.24, 0.15, 0.012, 0.02), m.whiteMatte(), [0, H * 0.42, 0.113]));
  g.add(mesh(m.box(0.24, 0.03, 0.014), m.leaf(), [0, H * 0.345, 0.114]));
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

/** A round display base with a soft sheen and a raised top ring. */
function buildPlinth(m: MaterialLibrary): THREE.Group {
  const g = new THREE.Group();
  g.name = 'plinth';
  g.add(mesh(m.cylinder(1, 1, 0.1, 72), m.plinth(), [0, 0.05, 0]));
  // Raised top surface.
  g.add(mesh(m.cylinder(0.97, 0.97, 0.012, 72), m.whiteMatte(), [0, 0.106, 0]));
  // Outer rim.
  g.add(mesh(m.torus(1, 0.018), m.boxShade(), [0, 0.1, 0], [Math.PI / 2, 0, 0]));
  return g;
}

/**
 * A product-photo card: a light frame, white matte and a double-sided photo panel. This is
 * the product-imagery placeholder. It stands on its bottom edge and is normalised like any
 * other model, so it can replace a 3D object in any scene.
 */
function buildCard(m: MaterialLibrary): THREE.Group {
  const g = new THREE.Group();
  g.name = 'card';
  const W = 1;
  const H = 1.25;
  const D = 0.05;

  // Frame.
  g.add(mesh(m.roundedBox(W, H, D, 0.045), m.boxShade(), [0, H / 2, 0]));
  // White matte, inset.
  g.add(mesh(m.roundedBox(W * 0.92, H * 0.94, D + 0.004, 0.03), m.whiteMatte(), [0, H / 2, 0.002]));
  // Photo panel, double-sided so the card reads from both sides as it turns. It sits clearly
  // in front of the matte so the two never z-fight.
  g.add(mesh(m.plane(W * 0.82, H * 0.82), m.productCard(), [0, H / 2, D / 2 + 0.015]));
  // Small brand strip at the bottom of the photo area.
  g.add(mesh(m.plane(W * 0.5, 0.05), m.leaf(), [0, H * 0.115, D / 2 + 0.016]));
  return g;
}

const BUILDERS: Record<ProceduralBuilder, (m: MaterialLibrary) => THREE.Group> = {
  carton: buildCarton,
  tin: buildTin,
  pouch: buildPouch,
  plinth: buildPlinth,
  card: buildCard,
};

export function buildProcedural(kind: ProceduralBuilder, materials: MaterialLibrary): THREE.Group {
  return BUILDERS[kind](materials);
}
