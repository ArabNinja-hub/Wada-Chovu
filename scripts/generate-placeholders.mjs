#!/usr/bin/env node
/**
 * Generates the placeholder artwork in /public.
 *
 *   npm run placeholders
 *
 * Outputs:
 *   public/media/placeholders/*.svg   illustrations (no external assets)
 *   public/media/placeholders/*.png   neutral textures for the 3D product labels
 *   public/brand/favicon.svg          simplified mark
 *
 * These files are stand-ins only. Each one is referenced from src/content/assets.ts and is
 * replaced by a real photo or illustration when it is available. None of them depicts an
 * actual Chovu Chovu Brothers Ltd product. The artwork shows a retail shop: display counters,
 * gondola shelving, product boxes, tins and pouches. There are no warehouse or pallet scenes.
 *
 * The 3D fallbacks use the same isometric projection and compositions as the live scenes,
 * so a visitor without WebGL sees the same arrangement as one with it.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');

const C = {
  forest: '#0a2413',
  forest2: '#17461f',
  lacquer: '#0f3319',
  neon: '#06fc07',
  leaf: '#22a116',
  leafDeep: '#1b8a12',
  sun: '#fe6700',
  box: '#f6f2ea',
  boxLight: '#fffdf8',
  boxShade: '#ddd5c4',
  boxEdge: '#c8bea9',
  pouch: '#f1e9d8',
  pouchDark: '#d9cdb2',
  stone: '#efebe2',
  shelfFrame: '#eef1ec',
  shelfBoard: '#f8f9f6',
  shelfBack: '#e2eadf',
  chrome: '#b9c3bd',
  tin: '#f7f9f4',
  tinShade: '#cdd6ca',
  plinth: '#e8efe6',
  mist: '#eef5ea',
  mistDark: '#dbe8d3',
  glass: '#dcebe0',
  white: '#ffffff',
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
    `<polygon points="${pts(left)}" fill="${colors.left ?? C.box}"/>`,
    `<polygon points="${pts(right)}" fill="${colors.right ?? C.boxShade}"/>`,
    `<polygon points="${pts(top)}" fill="${colors.top ?? C.boxLight}"/>`,
  ].join('\n');
}

/** Product box with a printed label, the same look as the 3D box. */
function cartonBlock(project, origin, size, colors = {}) {
  const parts = [
    block(project, origin, size, { left: colors.left ?? C.box, right: colors.right ?? C.boxShade, top: colors.top ?? C.boxLight }),
  ];
  // Green brand stripe across the top.
  const [x, y, z] = origin;
  const [dx, dy, dz] = size;
  const s1 = project(x + dx * 0.42, y + dy, z);
  const s2 = project(x + dx * 0.58, y + dy, z);
  const s3 = project(x + dx * 0.58, y + dy, z + dz);
  const s4 = project(x + dx * 0.42, y + dy, z + dz);
  parts.push(`<polygon points="${pts([s1, s2, s3, s4])}" fill="${C.leaf}"/>`);
  // Label on the visible x-min face.
  const a = project(x, y + dy * 0.62, z + dz * 0.2);
  const b = project(x, y + dy * 0.62, z + dz * 0.8);
  const c = project(x, y + dy * 0.2, z + dz * 0.8);
  const d = project(x, y + dy * 0.2, z + dz * 0.2);
  parts.push(`<polygon points="${pts([a, b, c, d])}" fill="#ffffff" opacity="0.92"/>`);
  parts.push(`<polygon points="${pts([a, b, c, d].map(([px, py]) => [px, py]))}" fill="none" stroke="${C.boxEdge}" stroke-width="1.5"/>`);
  return parts.join('\n');
}

/** Display counter: a lacquered body with a dark kick and a pale stone top. */
function counterBlock(project, origin, size) {
  const [x, y, z] = origin;
  const [dx, dy, dz] = size;
  const kick = 0.06;
  return [
    block(project, [x + 0.05, y, z + 0.05], [dx - 0.1, kick, dz - 0.1], { left: C.forest, right: C.forest, top: C.forest }),
    block(project, [x + 0.02, y + kick, z + 0.02], [dx - 0.04, dy - kick - 0.05, dz - 0.04], {
      left: C.lacquer,
      right: '#0a2413',
      top: C.lacquer,
    }),
    block(project, [x, y + dy - 0.05, z], [dx, 0.05, dz], { left: '#e4ddcc', right: '#d7cfbb', top: C.stone }),
  ].join('\n');
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
function pouch(cx, baseY, w, h, fill = C.pouch, shade = C.pouchDark) {
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
  const label = `<rect x="${f(cx - w * 0.22)}" y="${f(yb - h * 0.62)}" width="${f(w * 0.44)}" height="${f(h * 0.22)}" rx="${f(w * 0.03)}" fill="#ffffff" opacity="0.9"/>
    <rect x="${f(cx - w * 0.22)}" y="${f(yb - h * 0.62 + h * 0.15)}" width="${f(w * 0.44)}" height="${f(h * 0.05)}" fill="${C.leaf}"/>`;
  return [`<path d="${body}" fill="${fill}"/>`, `<path d="${crimp}" fill="${shade}"/>`, ridges, label].join('\n');
}

/** Frame shared by the artwork: soft background, dashed border and a caption. */
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

/** Product placeholder: a product box and a tin on a neutral background. */
const productSvg = () => {
  const project = projector(382, 420, 210);
  const items = [];
  items.push({ key: -0.6, svg: tinCylinder(project, -0.55, 0, -0.1, 0.3, 0.7, 210) });
  items.push({ key: 0.5, svg: cartonBlock(project, [-0.05, 0, -0.1], [1, 0.62, 0.8]) });
  items.sort((a, b) => b.key - a.key);
  return frame(800, 600, items.map((i) => i.svg).join('\n'), {
    label: 'PRODUCT PHOTO',
    sub: 'Placeholder. Replace with a 4:3 product photo.',
    labelY: 0.8,
  });
};

/** Shop front: a facade with an awning, shop windows with products, and a door. Portrait 4:5. */
const shopSvg = () => {
  const stripes = [];
  const awningX = 120;
  const awningW = 560;
  const stripeW = awningW / 8;
  for (let i = 0; i < 8; i++) {
    stripes.push(`<rect x="${f(awningX + i * stripeW)}" y="300" width="${f(stripeW)}" height="92" fill="${i % 2 === 0 ? C.forest : C.white}"/>`);
  }
  const scallops = Array.from({ length: 8 }, (_, i) => `<circle cx="${f(awningX + (i + 0.5) * stripeW)}" cy="392" r="${f(stripeW / 2)}" fill="${i % 2 === 0 ? C.forest : C.white}"/>`).join('');
  const product = (x, y, w, h, fill) => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="6" fill="${fill}"/>`;
  const windowItems = [
    product(160, 560, 90, 90, C.box),
    product(262, 530, 80, 120, C.pouch),
    product(356, 572, 84, 78, C.box),
    product(470, 540, 86, 110, C.boxShade),
    product(580, 566, 60, 84, C.pouch),
  ].join('\n    ');
  const body = `
    <rect x="80" y="260" width="640" height="660" fill="${C.white}" stroke="${C.forest}" stroke-opacity="0.35" stroke-width="3"/>
    <rect x="80" y="240" width="640" height="26" fill="${C.lacquer}"/>
    <rect x="${awningX}" y="300" width="${awningW}" height="92" fill="${C.forest}"/>
    ${stripes.join('\n    ')}
    ${scallops}
    <rect x="140" y="470" width="240" height="250" rx="10" fill="${C.glass}" stroke="${C.lacquer}" stroke-width="10"/>
    <rect x="420" y="470" width="240" height="250" rx="10" fill="${C.glass}" stroke="${C.lacquer}" stroke-width="10"/>
    <rect x="140" y="716" width="240" height="14" fill="${C.stone}"/>
    <rect x="420" y="716" width="240" height="14" fill="${C.stone}"/>
    <g>
    ${windowItems}
    </g>
    <rect x="350" y="530" width="60" height="190" fill="${C.forest}"/>
    <rect x="394" y="620" width="6" height="30" fill="${C.neon}"/>
    <rect x="80" y="506" width="640" height="10" fill="${C.leaf}" opacity="0.8"/>
    <circle cx="700" cy="170" r="54" fill="${C.sun}" opacity="0.9"/>`;
  return frame(800, 1000, body, { label: 'SHOP FRONT OR TEAM PHOTO', sub: 'Placeholder. Replace with a 4:5 photo.', labelY: 0.955 });
};

/** Shop exterior, a wide street view for the location section. 16:10. */
const locationSvg = () => {
  const grid = Array.from({ length: 9 }, (_, i) => `<line x1="${i * 160}" y1="0" x2="${i * 160}" y2="800" stroke="${C.forest}" stroke-opacity="0.06"/>`).join('');
  const body = `${grid}
    <rect x="0" y="690" width="1280" height="110" fill="${C.boxShade}" opacity="0.7"/>
    <rect x="0" y="690" width="1280" height="8" fill="${C.boxEdge}"/>
    <rect x="280" y="170" width="720" height="520" fill="${C.white}" stroke="${C.forest}" stroke-opacity="0.35" stroke-width="4"/>
    <rect x="260" y="150" width="760" height="34" fill="${C.lacquer}"/>
    <rect x="300" y="300" width="290" height="260" rx="10" fill="${C.glass}" stroke="${C.lacquer}" stroke-width="10"/>
    <rect x="690" y="300" width="250" height="260" rx="10" fill="${C.glass}" stroke="${C.lacquer}" stroke-width="10"/>
    <rect x="300" y="262" width="290" height="20" fill="${C.leaf}"/>
    <rect x="690" y="262" width="250" height="20" fill="${C.leaf}"/>
    <rect x="600" y="470" width="80" height="220" fill="${C.forest}"/>
    <rect x="652" y="570" width="6" height="30" fill="${C.neon}"/>
    <rect x="340" y="350" width="70" height="90" rx="6" fill="${C.box}"/>
    <rect x="430" y="370" width="80" height="70" rx="6" fill="${C.pouch}"/>
    <rect x="740" y="350" width="60" height="90" rx="6" fill="${C.boxShade}"/>
    <rect x="820" y="370" width="60" height="70" rx="6" fill="${C.box}"/>
    <circle cx="1120" cy="170" r="60" fill="${C.sun}" opacity="0.9"/>`;
  return frame(1280, 800, body, { label: 'SHOP EXTERIOR PHOTO', sub: 'Placeholder. Replace with a 16:10 photo.', labelY: 0.93 });
};

/** Hero fallback: transparent, sits on the forest arch. The arrangement follows the 3D hero. */
const heroFallbackSvg = () => {
  const project = projector(500, 600, 205);
  const items = [];
  const add = (centre, svg) => items.push({ depth: centre[0] + centre[1], svg });

  // Display counter: the base of the composition.
  add([0, 0], counterBlock(project, [-0.6, 0, -0.4], [1.2, 0.61, 0.8]));

  // Product boxes: four on the counter, two above, one set back on top.
  const size = [0.5, 0.27, 0.33];
  const boxes = [
    [-0.5, 0.61, -0.3],
    [0.0, 0.61, -0.3],
    [-0.5, 0.61, 0.02],
    [0.0, 0.61, 0.02],
    [-0.25, 0.88, -0.14],
    [0.25, 0.88, -0.14],
    [-0.1, 1.15, -0.1],
  ];
  for (const origin of boxes) {
    const centre = [origin[0] + size[0] / 2, origin[2] + size[2] / 2];
    add(centre, cartonBlock(project, origin, size));
  }

  // Containers stand on the floor beside the counter.
  add([0.98, -0.2], tinCylinder(project, 0.98, 0, -0.2, 0.22, 0.46, 205));
  add([1.02, 0.36], tinCylinder(project, 1.02, 0, 0.36, 0.18, 0.36, 205, C.leafDeep));

  // Pouch in front of the counter, on the left.
  const pouchBase = project(-0.98, 0, 0.12);
  add([-0.98, 0.12], pouch(pouchBase[0], pouchBase[1] + 8, 118, 176));

  items.sort((a, b) => b.depth - a.depth);
  return frame(1000, 1000, items.map((i) => i.svg).join('\n'), { background: false });
};

/** Shop-floor fallback: a front elevation of gondola shelving with products and two counters. */
const scaleFallbackSvg = () => {
  const parts = [];
  const left = 250;
  const right = 1350;
  const mid = 800;
  // Shelf decks, from the bottom up.
  const decks = [844, 676, 508, 340];
  const top = 180;
  // Back panel.
  parts.push(`<rect x="${left}" y="${top + 60}" width="${right - left}" height="${844 - top + 14}" fill="${C.shelfBack}"/>`);
  // Products on each deck: three bays, two rows per bay.
  const products = [
    (x, y, w, h, i) => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="${C.box}"/>
      <rect x="${f(x + w)}" y="${f(y)}" width="${f(w * 0.14)}" height="${f(h)}" fill="${C.boxShade}"/>
      <rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h * 0.1)}" fill="${C.boxLight}"/>
      <rect x="${f(x + w * 0.2)}" y="${f(y + h * 0.3)}" width="${f(w * 0.6)}" height="${f(h * 0.34)}" fill="#ffffff" opacity="0.95"/>
      <rect x="${f(x + w * 0.2)}" y="${f(y + h * 0.3)}" width="${f(w * 0.6)}" height="${f(h * 0.06)}" fill="${C.leaf}"/>`,
    (x, y, w, h) => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${f(w * 0.45)}" fill="${C.tin}"/>
      <rect x="${f(x)}" y="${f(y + h * 0.36)}" width="${f(w)}" height="${f(h * 0.3)}" fill="${C.leaf}"/>
      <rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h * 0.08)}" rx="${f(w * 0.2)}" fill="${C.tinShade}"/>`,
    (x, y, w, h) => `<path d="M ${f(x + w * 0.1)} ${f(y + h)} L ${f(x)} ${f(y + h * 0.3)} Q ${f(x + w * 0.5)} ${f(y - h * 0.02)} ${f(x + w)} ${f(y + h * 0.3)} L ${f(x + w * 0.9)} ${f(y + h)} Z" fill="${C.pouch}"/>
      <rect x="${f(x + w * 0.2)}" y="${f(y + h * 0.5)}" width="${f(w * 0.6)}" height="${f(h * 0.1)}" fill="${C.leaf}"/>`,
  ];
  decks.forEach((deck, row) => {
    const bays = [
      [left, mid],
      [mid, right],
    ];
    for (const [x0, x1] of bays) {
      const slots = 3;
      const width = (x1 - x0) / slots;
      for (let i = 0; i < slots; i++) {
        if ((row + i) % 5 === 4) continue; // a few gaps, so the shelves look well stocked
        const kind = (row + i) % products.length;
        const x = x0 + i * width + width * 0.14;
        const w = width * 0.7;
        const h = kind === 1 ? 128 : kind === 2 ? 110 : 116;
        const y = deck - 12 - h;
        parts.push(products[kind](x, y, w, h));
      }
    }
  });
  // Shelf boards with green front trim, and uprights.
  for (const deck of decks) {
    parts.push(`<rect x="${left}" y="${deck - 4}" width="${right - left}" height="16" fill="${C.shelfBoard}"/>`);
    parts.push(`<rect x="${left}" y="${deck - 4}" width="${right - left}" height="6" fill="${C.leaf}"/>`);
  }
  for (const x of [left, mid, right]) {
    parts.push(`<rect x="${x - 12}" y="${top + 60}" width="24" height="${844 - top}" fill="${C.shelfFrame}"/>`);
    parts.push(`<rect x="${x - 12}" y="${top + 60}" width="5" height="${844 - top}" fill="#ffffff"/>`);
  }
  // Header sign with a neon trim.
  parts.push(`<rect x="${left - 6}" y="${top}" width="${right - left + 12}" height="54" fill="${C.forest}"/>`);
  parts.push(`<rect x="${left}" y="${top + 54}" width="${right - left}" height="5" fill="${C.neon}"/>`);
  // Two display counters in front.
  for (const px of [150, 1130]) {
    parts.push(`<rect x="${px + 8}" y="${884}" width="294" height="16" fill="${C.forest}"/>`);
    parts.push(`<rect x="${px}" y="${896}" width="310" height="72" fill="${C.lacquer}"/>`);
    parts.push(`<rect x="${px}" y="${896}" width="310" height="72" fill="none" stroke="#0a2413" stroke-width="2"/>`);
    parts.push(`<rect x="${px + 20}" y="${920}" width="270" height="6" fill="${C.leaf}"/>`);
    parts.push(`<rect x="${px - 6}" y="${884}" width="322" height="14" fill="${C.stone}"/>`);
    for (let layer = 0; layer < 2; layer++) {
      const y = 884 - (layer + 1) * 112;
      for (let i = 0; i < 2; i++) {
        const x = px + 6 + i * 150;
        parts.push(`<rect x="${x}" y="${y}" width="144" height="108" fill="${C.box}"/>`);
        parts.push(`<rect x="${x + 110}" y="${y}" width="34" height="108" fill="${C.boxShade}"/>`);
        parts.push(`<rect x="${x + 22}" y="${y + 34}" width="90" height="40" fill="#ffffff" opacity="0.95"/>`);
        parts.push(`<rect x="${x}" y="${y}" width="144" height="8" fill="${C.leaf}"/>`);
      }
    }
  }
  return frame(1600, 1000, parts.join('\n'), { background: false });
};

/** Featured fallback: a display plinth with tins, pouches and a box. Transparent background. */
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
  items.push({ key: 0.5, svg: pouch(pouchB[0], pouchB[1], 116, 170) });
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

// ---------------------------------------------------------------------------
// Neutral 3D textures (PNG, no dependencies)
// ---------------------------------------------------------------------------

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buffer) {
  let c = 0xffffffff;
  for (const byte of buffer) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData));
  return Buffer.concat([length, typeAndData, crc]);
}

/** Encodes an RGBA PNG. `pixel(x, y)` returns [r, g, b]. */
function encodePng(width, height, pixel) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  let o = 0;
  for (let y = 0; y < height; y++) {
    raw[o++] = 0; // no filter
    for (let x = 0; x < width; x++) {
      const [r, g, b] = pixel(x, y);
      raw[o++] = r;
      raw[o++] = g;
      raw[o++] = b;
      raw[o++] = 255;
    }
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8; // bit depth
  header[9] = 6; // RGBA
  header[10] = 0;
  header[11] = 0;
  header[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', header),
    pngChunk('IDAT', deflateSync(raw, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

const hex = (value) => [(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
const inRect = (x, y, [x0, y0, w, h]) => x >= x0 && y >= y0 && x < x0 + w && y < y0 + h;

/** Label texture: a plain product label with a green band. Used on the 3D product boxes. */
const labelPng = () =>
  encodePng(512, 384, (x, y) => {
    if (inRect(x, y, [0, 0, 512, 384])) {
      if (inRect(x, y, [0, 260, 512, 80])) return hex(0x22a116);
      if (inRect(x, y, [40, 40, 432, 200])) return hex(0xffffff);
      return hex(0xf6f2ea);
    }
    return hex(0xffffff);
  });

/** Product-card texture: a neutral pouch silhouette on a warm background. Used by the `card` builder. */
const productCardPng = () =>
  encodePng(512, 640, (x, y) => {
    const cx = 256;
    // Body of the pouch: a column from y=180 to y=560.
    const inBody = y > 180 && y < 560 && Math.abs(x - cx) < 150;
    if (inRect(x, y, [0, 0, 512, 640])) {
      if (inRect(x, y, [0, 500, 512, 140])) return hex(0xe9e2d3);
      if (inBody) return y < 230 ? hex(0xd9cdb2) : hex(0xf1e9d8);
      return hex(0xf6f2ea);
    }
    return hex(0xffffff);
  });

const specs = {
  'product.svg': productSvg,
  'shop.svg': shopSvg,
  'location.svg': locationSvg,
  'hero-fallback.svg': heroFallbackSvg,
  'scale-fallback.svg': scaleFallbackSvg,
  'featured-fallback.svg': featuredFallbackSvg,
};

const outputs = [
  ...Object.entries(specs).map(([file, make]) => [join('media', 'placeholders', file), make()]),
  [join('brand', 'favicon.svg'), favicon],
];

const binaryOutputs = [
  [join('media', 'placeholders', 'label.png'), labelPng()],
  [join('media', 'placeholders', 'product-card.png'), productCardPng()],
];

for (const [file, content] of outputs) {
  const target = join(root, file);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content, 'utf8');
  console.log(`wrote public/${file.replace(/\\/g, '/')}`);
}

for (const [file, content] of binaryOutputs) {
  const target = join(root, file);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content);
  console.log(`wrote public/${file.replace(/\\/g, '/')}`);
}
