#!/usr/bin/env node
/**
 * Generates the placeholder artwork in /public (SVG, no external assets).
 *
 *   npm run placeholders
 *
 * These files are stand-ins only. Each one is referenced from src/content/assets.ts and is
 * replaced by a real photo or illustration when it is available. None of them depicts an
 * actual Wada Chovu product.
 *
 * The 3D fallbacks use the same isometric projection and compositions as the live scenes,
 * so a visitor without WebGL sees the same arrangement as one with it.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');

const C = {
  forest: '#0a2413',
  forest2: '#17461f',
  neon: '#06fc07',
  leaf: '#22a116',
  leafDeep: '#1b8a12',
  sun: '#fe6700',
  kraft: '#c99a5c',
  kraftLight: '#dcb27c',
  kraftDark: '#a87a42',
  cream: '#efe6d2',
  creamDark: '#dccfb3',
  wood: '#d7b98a',
  woodDark: '#a98151',
  steel: '#5b6b65',
  steelLight: '#9aa9a2',
  mist: '#eef5ea',
  mistDark: '#dbe8d3',
  tin: '#f7f9f4',
  tinShade: '#cdd6ca',
  plinth: '#e8efe6',
  ink: '#0c1f12',
};

const f = (n) => Number(n.toFixed(1));
const pts = (arr) => arr.map(([x, y]) => `${f(x)},${f(y)}`).join(' ');

/**
 * Isometric projection of world coordinates (x along the right-up axis, z along the left-up
 * axis, y up). Matches the scene's camera: nearer corners sit lower on screen.
 */
function projector(ox, oy, s) {
  return (x, y, z) => [ox + 0.866 * (x - z) * s, oy - 0.5 * (x + z) * s - y * s];
}

/** A box given by its world minimum corner and size. Returns the visible faces, back to front. */
function block(project, [x, y, z], [dx, dy, dz], colors) {
  const t = (xx, yy, zz) => project(xx, yy, zz);
  const top = [t(x, y + dy, z), t(x + dx, y + dy, z), t(x + dx, y + dy, z + dz), t(x, y + dy, z + dz)];
  const left = [t(x, y, z), t(x, y, z + dz), t(x, y + dy, z + dz), t(x, y + dy, z)];
  const right = [t(x, y, z), t(x + dx, y, z), t(x + dx, y + dy, z), t(x, y + dy, z)];
  return [
    `<polygon points="${pts(left)}" fill="${colors.left ?? C.kraft}"/>`,
    `<polygon points="${pts(right)}" fill="${colors.right ?? C.kraftDark}"/>`,
    `<polygon points="${pts(top)}" fill="${colors.top ?? C.kraftLight}"/>`,
  ].join('\n');
}

/** Carton with a printed label, the same look as the 3D carton. */
function cartonBlock(project, origin, size, label = true) {
  const parts = [block(project, origin, size, { left: C.kraft, right: C.kraftDark, top: C.kraftLight })];
  if (label) {
    // Label on the visible x-min face, drawn as a flat parallelogram on the left face.
    const [x, y, z] = origin;
    const [, , dz] = size;
    const a = project(x, y + size[1] * 0.62, z + dz * 0.2);
    const b = project(x, y + size[1] * 0.62, z + dz * 0.8);
    const c = project(x, y + size[1] * 0.2, z + dz * 0.8);
    const d = project(x, y + size[1] * 0.2, z + dz * 0.2);
    parts.push(`<polygon points="${pts([a, b, c, d])}" fill="#ffffff" opacity="0.92"/>`);
    parts.push(`<circle cx="${f((a[0] + b[0]) / 2)}" cy="${f((a[1] + c[1]) / 2)}" r="${f(Math.abs(b[0] - a[0]) / 10)}" fill="${C.sun}" opacity="0.85"/>`);
  }
  return parts.join('\n');
}

/** Vertical cylinder (tin) standing on the world point (cx, y0, cz). */
function tinCylinder(project, cx, y0, cz, radius, height, s, bandColor = C.leaf) {
  const base = project(cx, y0, cz);
  const top = project(cx, y0 + height, cz);
  const rx = 1.2247 * radius * s;
  const ry = 0.7071 * radius * s;
  const body = `M ${f(base[0] - rx)} ${f(base[1])} L ${f(top[0] - rx)} ${f(top[1])} A ${f(rx)} ${f(ry)} 0 0 0 ${f(top[0] + rx)} ${f(top[1])} L ${f(base[0] + rx)} ${f(base[1])} A ${f(rx)} ${f(ry)} 0 0 1 ${f(base[0] - rx)} ${f(base[1])} Z`;
  const bandTop = project(cx, y0 + height * 0.62, cz);
  const bandBottom = project(cx, y0 + height * 0.3, cz);
  return [
    `<path d="${body}" fill="${C.tin}"/>`,
    `<path d="M ${f(bandBottom[0] - rx)} ${f(bandBottom[1])} L ${f(bandBottom[0] - rx)} ${f(bandTop[1])} A ${f(rx)} ${f(ry)} 0 0 0 ${f(bandBottom[0] + rx)} ${f(bandTop[1])} L ${f(bandBottom[0] + rx)} ${f(bandBottom[1])} A ${f(rx)} ${f(ry)} 0 0 1 ${f(bandBottom[0] - rx)} ${f(bandBottom[1])} Z" fill="${bandColor}"/>`,
    `<ellipse cx="${f(top[0])}" cy="${f(top[1])}" rx="${f(rx)}" ry="${f(ry)}" fill="${C.tinShade}"/>`,
  ].join('\n');
}

/**
 * Pillow pouch with a crimped top band, drawn in screen space. (cx, baseY) is the bottom
 * centre. A wide, flat shape reads as a bag rather than a bottle.
 */
function pouch(cx, baseY, w, h, fill = C.cream, shade = C.creamDark) {
  const x0 = cx - w / 2;
  const x1 = cx + w / 2;
  const yb = baseY;
  const yt = baseY - h;
  const r = w * 0.14;
  const band = h * 0.16;
  const bulge = w * 0.04;
  const bodyTop = yt + band;
  const body = [
    `M ${f(x0)} ${f(bodyTop + h * 0.04)}`,
    `C ${f(x0 - bulge)} ${f(bodyTop + h * 0.3)}, ${f(x0 - bulge)} ${f(yb - h * 0.2)}, ${f(x0)} ${f(yb - r)}`,
    `Q ${f(x0)} ${f(yb)} ${f(x0 + r)} ${f(yb)}`,
    `L ${f(x1 - r)} ${f(yb)}`,
    `Q ${f(x1)} ${f(yb)} ${f(x1)} ${f(yb - r)}`,
    `C ${f(x1 + bulge)} ${f(yb - h * 0.2)}, ${f(x1 + bulge)} ${f(bodyTop + h * 0.3)}, ${f(x1)} ${f(bodyTop + h * 0.04)}`,
    'Z',
  ].join(' ');
  const crimp = [
    `M ${f(x0 + w * 0.02)} ${f(bodyTop + h * 0.02)}`,
    `L ${f(x0 + w * 0.02)} ${f(yt + band * 0.2)}`,
    `Q ${f(x0 + w * 0.02)} ${f(yt)} ${f(x0 + w * 0.12)} ${f(yt)}`,
    `L ${f(x1 - w * 0.12)} ${f(yt)}`,
    `Q ${f(x1 - w * 0.02)} ${f(yt)} ${f(x1 - w * 0.02)} ${f(yt + band * 0.2)}`,
    `L ${f(x1 - w * 0.02)} ${f(bodyTop + h * 0.02)}`,
    'Z',
  ].join(' ');
  const ridges = [0.3, 0.5, 0.7]
    .map((t) => `<line x1="${f(x0 + w * t)}" y1="${f(yt + band * 0.2)}" x2="${f(x0 + w * t)}" y2="${f(bodyTop)}" stroke="${shade}" stroke-width="${f(Math.max(1, w * 0.02))}" stroke-opacity="0.8"/>`)
    .join('');
  return [
    `<path d="${body}" fill="${fill}"/>`,
    `<path d="${crimp}" fill="${shade}"/>`,
    ridges,
    `<path d="M ${f(x0 + w * 0.2)} ${f(yb - h * 0.45)} L ${f(x1 - w * 0.2)} ${f(yb - h * 0.45)}" stroke="${C.forest}" stroke-width="${f(Math.max(2, w * 0.03))}" stroke-opacity="0.18" stroke-linecap="round"/>`,
  ].join('\n');
}

/** Frame shared by the artwork: soft background, dashed border and two-line caption. */
function frame(w, h, body, { label, sub, background = true, labelY = 0.82 } = {}) {
  const labelSize = Math.round(w / 21);
  const subSize = Math.round(w / 30);
  const defs = background
    ? `<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.mist}"/><stop offset="1" stop-color="${C.mistDark}"/></linearGradient></defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>`
    : '';
  const border = background
    ? `<rect x="${f(w * 0.03)}" y="${f(h * 0.03)}" width="${f(w * 0.94)}" height="${f(h * 0.94)}" fill="none" stroke="${C.forest}" stroke-opacity="0.25" stroke-width="${Math.max(2, Math.round(w / 400))}" stroke-dasharray="${Math.round(w / 40)} ${Math.round(w / 50)}" rx="${Math.round(w * 0.02)}"/>`
    : '';
  const text = label
    ? `<text x="${w / 2}" y="${f(h * labelY)}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="${labelSize}" letter-spacing="${Math.round(w / 300)}" fill="${C.forest}">${label}</text>` +
      (sub ? `\n  <text x="${w / 2}" y="${f(h * labelY + labelSize * 1.5)}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${subSize}" fill="${C.forest}" fill-opacity="0.7">${sub}</text>` : '')
    : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label || 'Placeholder'}">
  ${defs}
  ${border}
  ${body}
  ${text}
</svg>
`;
}

// ---------------------------------------------------------------------------
// Artwork
// ---------------------------------------------------------------------------

const productSvg = () => {
  const project = projector(382, 420, 210);
  const body = cartonBlock(project, [0, 0, 0], [1, 0.62, 0.8]);
  return frame(800, 600, body, { label: 'PRODUCT PHOTO', sub: 'Placeholder. Replace with a 4:3 product photo.', labelY: 0.8 });
};

const warehouseSvg = () => {
  const body = `
    <polygon points="150,430 400,250 650,430" fill="${C.steel}"/>
    <rect x="170" y="430" width="460" height="330" fill="${C.steelLight}"/>
    <rect x="310" y="560" width="180" height="200" fill="${C.forest}" opacity="0.85"/>
    ${[0, 1, 2, 3].map((i) => `<rect x="${200 + i * 105}" y="460" width="70" height="60" fill="${C.kraft}"/>`).join('')}
    <rect x="190" y="530" width="420" height="10" fill="${C.sun}"/>`;
  return frame(800, 1000, body, { label: 'WAREHOUSE OR TEAM PHOTO', sub: 'Placeholder. Replace with a 4:5 photo.', labelY: 0.9 });
};

const locationSvg = () => {
  const grid = Array.from({ length: 9 }, (_, i) => `<line x1="${i * 160}" y1="0" x2="${i * 160}" y2="800" stroke="${C.forest}" stroke-opacity="0.07"/>`).join('');
  const rows = Array.from({ length: 6 }, (_, i) => `<line x1="0" y1="${i * 160}" x2="1280" y2="${i * 160}" stroke="${C.forest}" stroke-opacity="0.07"/>`).join('');
  const body = `${grid}${rows}
    <g transform="translate(0 -90)">
      <path d="M640 230c-88 0-158 68-158 152 0 116 158 248 158 248s158-132 158-248c0-84-70-152-158-152Z" fill="${C.leaf}" stroke="${C.forest}" stroke-width="6"/>
      <circle cx="640" cy="382" r="54" fill="${C.forest}"/>
      <circle cx="640" cy="382" r="20" fill="${C.sun}"/>
    </g>`;
  return frame(1280, 800, body, { label: 'LOCATION PHOTO', sub: 'Placeholder. Replace with a 16:10 photo.', labelY: 0.8 });
};

/**
 * Hero fallback: transparent, sits on the forest arch. The arrangement follows the 3D hero.
 * Items are drawn back to front using the depth of their centres (larger x + z is farther away).
 */
const heroFallbackSvg = () => {
  const project = projector(500, 600, 205);
  const items = [];
  const add = (centre, svg) => items.push({ depth: centre[0] + centre[1], svg });

  // Pallet: the base of the composition.
  add([0, 0], block(project, [-0.95, 0, -0.6], [1.9, 0.2, 1.2], { left: C.woodDark, right: '#8f6a3d', top: C.wood }));

  // Cartons: two on the base layer, two on the second layer, one set back on top.
  const cartonSize = [0.82, 0.42, 0.52];
  const cartons = [
    [-0.85, 0.2, -0.45],
    [-0.05, 0.2, -0.45],
    [-0.85, 0.2, 0.1],
    [-0.05, 0.2, 0.1],
    [-0.45, 0.62, -0.2],
  ];
  for (const origin of cartons) {
    const centre = [origin[0] + cartonSize[0] / 2, origin[2] + cartonSize[2] / 2];
    add(centre, cartonBlock(project, origin, cartonSize));
  }

  // Containers stand on the floor, to the right of the pallet.
  add([1.22, -0.92], tinCylinder(project, 1.22, 0, -0.92, 0.34, 0.78, 205));
  add([1.32, -0.18], tinCylinder(project, 1.32, 0, -0.18, 0.3, 0.6, 205, C.leafDeep));

  // Pouch in front of the pallet, on the left.
  const pouchBase = project(-1.02, 0, -0.1);
  add([-1.02, -0.1], pouch(pouchBase[0], pouchBase[1] + 8, 118, 176));

  items.sort((a, b) => b.depth - a.depth);
  return frame(1000, 1000, items.map((i) => i.svg).join('\n'), { background: false });
};

/** Scale fallback: a front elevation of a warehouse rack with cartons and two loaded pallets. */
const scaleFallbackSvg = () => {
  const parts = [];
  const left = 250;
  const right = 1350;
  const mid = 800;
  const decks = [340, 508, 676, 844];
  // Uprights.
  for (const x of [left, mid, right]) {
    parts.push(`<rect x="${x - 12}" y="180" width="24" height="700" fill="${C.steel}"/>`);
    parts.push(`<rect x="${x - 12}" y="180" width="5" height="700" fill="${C.steelLight}"/>`);
  }
  // Bays: cartons on each deck, two bays wide.
  const bays = [
    [left, mid],
    [mid, right],
  ];
  decks.forEach((deck, row) => {
    for (const [x0, x1] of bays) {
      const slots = 3;
      const width = (x1 - x0) / slots;
      for (let i = 0; i < slots; i++) {
        if ((row + i) % 4 === 3) continue; // a few gaps, so the rack looks used
        const x = x0 + i * width + width * 0.12;
        const w = width * 0.76;
        const h = 118;
        const top = deck - 12 - h;
        parts.push(`<rect x="${f(x)}" y="${f(top)}" width="${f(w)}" height="${h}" fill="${C.kraft}"/>`);
        parts.push(`<polygon points="${f(x)},${f(top)} ${f(x + 14)},${f(top - 14)} ${f(x + w + 14)},${f(top - 14)} ${f(x + w)},${f(top)}" fill="${C.kraftLight}"/>`);
        parts.push(`<polygon points="${f(x + w)},${f(top)} ${f(x + w + 14)},${f(top - 14)} ${f(x + w + 14)},${f(top + h - 14)} ${f(x + w)},${f(top + h)}" fill="${C.kraftDark}"/>`);
        parts.push(`<rect x="${f(x + w * 0.2)}" y="${f(top + h * 0.3)}" width="${f(w * 0.6)}" height="${f(h * 0.34)}" fill="#ffffff" opacity="0.9"/>`);
        parts.push(`<circle cx="${f(x + w * 0.5)}" cy="${f(top + h * 0.47)}" r="${f(h * 0.08)}" fill="${C.sun}"/>`);
      }
    }
  });
  // Deck plates and beams.
  for (const deck of decks) {
    parts.push(`<rect x="${left}" y="${deck - 6}" width="${right - left}" height="12" fill="${C.steelLight}"/>`);
    parts.push(`<rect x="${left - 6}" y="${deck - 12}" width="${right - left + 12}" height="14" fill="${C.sun}"/>`);
  }
  // Foreground pallets, each with three layers of cartons.
  for (const px of [150, 1130]) {
    parts.push(`<rect x="${px}" y="884" width="310" height="22" fill="${C.wood}"/>`);
    for (let layer = 0; layer < 3; layer++) {
      const y = 884 - (layer + 1) * 112;
      for (let i = 0; i < 2; i++) {
        const x = px + 6 + i * 150;
        parts.push(`<rect x="${x}" y="${y}" width="144" height="108" fill="${C.kraft}"/>`);
        parts.push(`<rect x="${x + 22}" y="${y + 34}" width="100" height="40" fill="#ffffff" opacity="0.9"/>`);
        parts.push(`<rect x="${x}" y="${y}" width="144" height="8" fill="${C.kraftLight}"/>`);
      }
    }
  }
  return frame(1600, 1000, parts.join('\n'), { background: false });
};

/** Featured fallback: a display plinth with tins, pouches and a carton. Transparent background. */
const featuredFallbackSvg = () => {
  const project = projector(600, 640, 205);
  const items = [];
  // Plinth: a cylinder of radius 1.25 on the ground.
  const plinthCentre = project(0, 0, 0);
  const rx = 1.2247 * 1.25 * 205;
  const ry = 0.7071 * 1.25 * 205;
  items.push({
    key: 99,
    svg: `<ellipse cx="${f(plinthCentre[0])}" cy="${f(plinthCentre[1] + 4)}" rx="${f(rx)}" ry="${f(ry)}" fill="${C.plinth}"/>
    <path d="M ${f(plinthCentre[0] - rx)} ${f(plinthCentre[1])} L ${f(plinthCentre[0] - rx)} ${f(plinthCentre[1] + 26)} A ${f(rx)} ${f(ry)} 0 0 0 ${f(plinthCentre[0] + rx)} ${f(plinthCentre[1] + 26)} L ${f(plinthCentre[0] + rx)} ${f(plinthCentre[1])} Z" fill="${C.tinShade}"/>`,
  });
  items.push({ key: 0.3, svg: tinCylinder(project, -0.42, 0.02, 0.08, 0.36, 0.92, 205) });
  items.push({ key: 0.2, svg: tinCylinder(project, 0.42, 0.02, -0.12, 0.3, 0.7, 205, C.leafDeep) });
  const pouchA = project(-0.12, 0.02, 0.58);
  items.push({ key: 0.6, svg: pouch(pouchA[0], pouchA[1], 130, 196) });
  const pouchB = project(0.78, 0.02, 0.28);
  items.push({ key: 0.5, svg: pouch(pouchB[0], pouchB[1], 116, 170, C.kraftLight, C.kraft) });
  items.push({ key: -0.9, svg: cartonBlock(project, [-0.82, 0.02, -0.6], [0.5, 0.4, 0.42]) });
  items.sort((a, b) => b.key - a.key);
  return frame(1200, 900, items.map((i) => i.svg).join('\n'), { background: false });
};

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="${C.forest}"/>
  <path d="M10 46a22 22 0 0 1 44 0Z" fill="${C.neon}"/>
  <circle cx="32" cy="46" r="10" fill="${C.sun}"/>
</svg>
`;

const specs = {
  'product.svg': productSvg,
  'warehouse.svg': warehouseSvg,
  'location.svg': locationSvg,
  'hero-fallback.svg': heroFallbackSvg,
  'scale-fallback.svg': scaleFallbackSvg,
  'featured-fallback.svg': featuredFallbackSvg,
};

const outputs = [
  ...Object.entries(specs).map(([file, make]) => [join('media', 'placeholders', file), make()]),
  [join('brand', 'favicon.svg'), favicon],
];

for (const [file, content] of outputs) {
  const target = join(root, file);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content, 'utf8');
  console.log(`wrote public/${file.replace(/\\/g, '/')}`);
}
