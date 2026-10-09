#!/usr/bin/env node
/**
 * Pre-deploy guard for the GitHub Pages deployment.
 *
 *   node scripts/verify-dist.mjs        (run after `npm run build`)
 *
 * Why this exists: the deploy workflow once uploaded the repository root
 * (`path: '.'`) instead of the built `dist/` directory. GitHub Pages then served the
 * repo's root `index.html` as the homepage — the Vite build shell, whose <body> is
 * empty (the prerender plugin injects the page at build time) and whose stylesheet
 * link points at the dev-only `/src/styles/main.css`. The homepage rendered as a
 * completely white page: no content, no styling.
 *
 * This script fails the deployment unless the page that will be served is the
 * complete, styled, prerendered build:
 *
 *   1. dist/index.html exists and the prerender markers are replaced.
 *   2. The prerendered page structure is present (header, hero, main, footer).
 *   3. The stylesheet link resolves to a built asset inside dist/ (never a dev
 *      `/src/` path), the file is non-empty, and it carries the Chovu Chovu Brothers Ltd design
 *      (brand tokens, hero styles, responsive rules).
 *   4. Every local asset URL in the page (JS entry, stylesheet, font, images,
 *      favicon) resolves to a file inside dist/.
 *   5. Asset URLs carry the Pages base (`/Wada-Chovu/`), so they resolve on the
 *      live site instead of 404ing at the domain root.
 *   6. The deploy workflow uploads `dist` — never the repository root.
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(repoRoot, 'dist');
const htmlPath = join(distDir, 'index.html');
const workflowPath = join(repoRoot, '.github/workflows/static.yml');

/** The GitHub Pages project site is served under /<repo-name>/. */
const PAGES_BASE = '/Wada-Chovu/';

const failures = [];

function check(condition, okMessage, failureMessage) {
  if (condition) {
    console.log(`  ok  ${okMessage}`);
  } else {
    failures.push(failureMessage);
  }
}

function rel(path) {
  return relative(repoRoot, path);
}

/** Resolves a root-absolute URL from the built HTML to a file inside dist/. */
function resolveAsset(url) {
  if (!url.startsWith('/') || url.startsWith('//')) return null;
  const candidates = [];
  if (PAGES_BASE !== '/' && url.startsWith(PAGES_BASE)) {
    candidates.push(join(distDir, url.slice(PAGES_BASE.length)));
  }
  candidates.push(join(distDir, url.slice(1)));
  for (const candidate of candidates) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}

console.log('Verifying the built site before it is deployed to GitHub Pages…');

// 1 + 2. dist/index.html is the prerendered page ---------------------------------

if (!existsSync(htmlPath)) {
  console.error(`::error::${rel(htmlPath)} is missing. Run "npm run build" before deploying.`);
  process.exit(1);
}
const html = readFileSync(htmlPath, 'utf8');
check(true, `${rel(htmlPath)} exists (${html.length} bytes)`, '');

for (const marker of ['<!--app-html-->', '<!--head-meta-->']) {
  check(
    !html.includes(marker),
    'prerender markers are replaced',
    `${rel(htmlPath)} still contains the unreplaced prerender marker ${marker}; the page would render as an empty shell`,
  );
}

for (const needle of ['<header', 'class="hero"', '<main', '<footer']) {
  check(
    html.includes(needle),
    `prerendered markup contains ${needle}`,
    `${rel(htmlPath)} is missing the prerendered ${needle} markup; it is not the built page`,
  );
}

// 3. the stylesheet is connected and carries the design ---------------------------

const stylesheetHrefs = [...html.matchAll(/<link\b[^>]*>/gi)]
  .map((match) => match[0])
  .filter((tag) => /\brel="stylesheet"/i.test(tag))
  .map((tag) => (tag.match(/\bhref="([^"]*)"/i) || [])[1])
  .filter(Boolean);

check(
  stylesheetHrefs.length > 0,
  'the page links a stylesheet',
  'the page has no <link rel="stylesheet">; it would render unstyled',
);

const cssFiles = [];
for (const href of stylesheetHrefs) {
  if (href.startsWith('/src/')) {
    failures.push(`stylesheet "${href}" is a dev-server path that does not exist on GitHub Pages`);
    continue;
  }
  const file = resolveAsset(href);
  if (!file) {
    failures.push(`stylesheet "${href}" does not resolve to a file inside ${rel(distDir)}/`);
    continue;
  }
  const css = readFileSync(file, 'utf8');
  const missing = ['--c-neon', '.hero', '@media'].filter((needle) => !css.includes(needle));
  if (css.length === 0 || missing.length > 0) {
    failures.push(
      `stylesheet "${href}" does not carry the Chovu Chovu Brothers Ltd design (missing ${missing.join(', ') || 'all content'})`,
    );
    continue;
  }
  cssFiles.push(file);
  check(
    true,
    `stylesheet ${href} -> ${rel(file)} (${css.length} bytes; brand tokens, hero and responsive rules present)`,
    '',
  );
}

// 4 + 5. every local asset URL resolves and carries the Pages base ---------------

const localUrls = [
  ...new Set(
    [...html.matchAll(/\b(?:href|src)=["'](\/[^"']*)["']/gi)]
      .map((match) => match[1])
      .filter((url) => !url.startsWith('//')),
  ),
];

const unresolved = localUrls.filter((url) => !resolveAsset(url));
check(
  unresolved.length === 0,
  `all ${localUrls.length} local asset URLs resolve inside ${rel(distDir)}/ (JS entry, stylesheet, font, images, favicon)`,
  `asset URLs do not resolve to files inside ${rel(distDir)}/: ${unresolved.join(', ')}`,
);

const unprefixed = localUrls.filter((url) => !url.startsWith(PAGES_BASE));
check(
  unprefixed.length === 0,
  `all asset URLs are prefixed with the Pages base "${PAGES_BASE}"`,
  `asset URLs are missing the Pages base "${PAGES_BASE}" and would 404 on the live site: ${unprefixed.join(', ')}`,
);

// 6. the workflow uploads dist, not the repository root ----------------------------

const workflow = readFileSync(workflowPath, 'utf8');
const uploadMatch = workflow.match(/upload-pages-artifact@[^\n]*\n\s*with:\n\s*path:\s*(.+)/);
const artifactPath = uploadMatch
  ? uploadMatch[1]
      .trim()
      .replace(/#.*$/, '')
      .trim()
      .replace(/^['"]|['"]$/g, '')
      .replace(/^\.\//, '')
      .replace(/\/+$/, '')
  : null;
check(
  artifactPath === 'dist',
  'the deploy workflow uploads dist/ (the built site)',
  `the deploy workflow must upload "dist" (the built site), found ${
    artifactPath ? `"${artifactPath}"` : 'no upload path'
  }; uploading the repository root serves the unbuilt shell as a white page`,
);

// Summary -------------------------------------------------------------------------

if (failures.length > 0) {
  console.error('');
  for (const message of failures) console.error(`::error::${message}`);
  console.error('');
  console.error(`Deployment blocked: ${rel(htmlPath)} is not the complete, styled Chovu Chovu Brothers Ltd page.`);
  process.exit(1);
}

console.log('');
console.log('Deployment check passed:');
console.log(`  - ${rel(htmlPath)} is the prerendered Chovu Chovu Brothers Ltd homepage`);
console.log(`  - its stylesheet is connected and carries the design (${cssFiles.map(rel).join(', ')})`);
console.log('  - every asset URL resolves inside dist/ and carries the Pages base');
console.log('  - the deploy workflow uploads dist/, so this exact page is what GitHub Pages serves');
