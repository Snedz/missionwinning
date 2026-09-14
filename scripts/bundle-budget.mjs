#!/usr/bin/env node
/**
 * How many bytes does a cold visitor download before the wedge is usable?
 *
 * `.209` — the gate had no answer, and that is how **306 KB gzipped of
 * translations** shipped on `/`, `/log` and `/active` through a green suite.
 * `todayPerf.test.ts` says so about itself, in its own words: *"a bundle-size
 * assertion would be better and does not exist here."* This is that assertion.
 *
 * It reads the prerendered HTML rather than the build manifest, because the
 * question is not "which chunks does the graph contain" but **"which `<script>`
 * tags does the browser actually fetch for this route"** — the only form of the
 * question a user experiences. The locale megachunk was a plain `<script async>`
 * in `log.html`, so it would have been caught here on the day it landed.
 *
 * `/` is the exception: `hasPrivateAccessCookieOnServer` always reads
 * `cookies()`, so Next never emits `.next/server/app/index.html`. Measuring
 * that path as "missing" is a vacuous red — the landing still ships JS. When
 * the HTML is absent we reconstruct the initial list from the `/` surface
 * modules in `page_client-reference-manifest.js` plus `build-manifest.json`
 * root runtime (polyfills + `rootMainFiles`) and the real `app/page-*.js`
 * chunk. Taking *every* `static/chunks` path in that manifest would count
 * HouseShell / Today / Train on `/` — those are not what the browser fetches
 * on the landing. `/log` and `/active` stay HTML-only.
 *
 * Ratcheted the `.202` way: the caps only ever move **down**. Lowering one is a
 * one-line change; raising it means editing this file with the reason visible in
 * the diff, and `bundleBudget.test.ts` asserts the high-water marks separately so
 * a raise cannot pass unnoticed.
 *
 * Run: node scripts/bundle-budget.mjs   (after `npm run build`)
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Gzipped KB of initial JS, per route. **Lower these whenever you win; never
 * raise them.**
 *
 * ## `.1071` HOLD raise (TodayDesk concept chip)
 *
 * CI webpack on #938: `/log` 417.5 KB (was 417), `/active` 511.2 KB (was 511).
 * Growth is the TodayDesk `house-state` chip + `todayConceptChip` helper/i18n
 * on the `/log` HTML graph; `/active` moved with the shared locale/hydrate
 * chunk. Caps are the measured ceil (418 / 512). `/` stays 351.
 *
 * ## `.1070` HOLD raise (founder: fix/bump)
 *
 * CI `PRIVATE_MODE=false` webpack build on #937:
 * `/log` 416.7 KB (was 280), `/active` 510.2 KB (was 435), `/` had no
 * `index.html`. Same class as the coverage-floor raise: house chrome + #935
 * + existing UI, not four i18n catalog keys.
 *
 * `/log` / `/active` caps were the measured ceil (417 / 511). `/` is 351 —
 * reconstructed from LandingPage + teaser + layout + root runtime (348.5).
 * A first draft that unioned every chunk in the client-reference manifest
 * reported 458.9 and would have hidden house chrome that `/` does not load.
 *
 * Previous 2026-07-30 numbers (262 / 280 / 435) assumed prerendered landing
 * HTML and a slimmer house. They had been red on master (`docs/CI_LOCAL.md`).
 */
const BUDGETS_KB = {
  '/': 351,
  '/log': 418,
  '/active': 512,
};

/** Prerendered HTML for each budgeted route. */
const ROUTE_HTML = {
  '/': '.next/server/app/index.html',
  '/log': '.next/server/app/log.html',
  '/active': '.next/server/app/active.html',
};

/**
 * `/` reads `cookies()` on every request (`hasPrivateAccessCookieOnServer`) so
 * the door stays dynamic. Next.js therefore emits `ƒ /` and **does not write
 * `index.html`**. That is not a missing page — `app/page.tsx` still builds
 * LandingPage / GateTeaser / the `/private` redirect. Measuring a blank file
 * would be the vacuous-green defect this script exists to refuse.
 *
 * Fallback uses the same chunks the browser would fetch: root runtime + the
 * `/` surface modules in `page_client-reference-manifest.js`. Prefer HTML
 * when it exists (a later force-static would restore the original path).
 */
const DYNAMIC_ROOT_MANIFEST = '.next/server/app/page_client-reference-manifest.js';
const DYNAMIC_ROOT_PAGE_DIR = '.next/static/chunks/app';
const DYNAMIC_ROOT_MODULES = [
  'LandingPage.tsx',
  'PrivateTeaserClient.tsx',
  'i18n-pwa-provider.tsx',
  '/error.tsx',
  'global-error.tsx',
  'app-dir/link.js',
];

function initialChunks(htmlPath) {
  const html = fs.readFileSync(path.join(root, htmlPath), 'utf8');
  return [...new Set([...html.matchAll(/\/_next\/(static\/chunks\/[^"'\\\s]+?\.js)/g)].map((m) => m[1]))];
}

function pageChunkFiles() {
  const abs = path.join(root, DYNAMIC_ROOT_PAGE_DIR);
  if (!fs.existsSync(abs)) return [];
  return fs
    .readdirSync(abs)
    .filter((name) => /^page-[^/]+\.js$/.test(name))
    .map((name) => `static/chunks/app/${name}`);
}

function chunksNamedInManifest(manifestSrc, suffix) {
  const escaped = suffix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`${escaped}":\\{"id":\\d+,"name":"[^"]+","chunks":\\[(.*?)\\]`);
  const m = manifestSrc.match(re);
  if (!m) return [];
  return [...m[1].matchAll(/static\/chunks\/[^"\\]+\.js/g)].map((x) => x[0]);
}

/**
 * Reconstruct `/` initial JS when `index.html` is absent.
 * Returns `{ chunks, how }` or `null` if the route was not built.
 */
function dynamicRootChunks() {
  const pageChunks = pageChunkFiles();
  const manifestAbs = path.join(root, DYNAMIC_ROOT_MANIFEST);
  const buildAbs = path.join(root, '.next/build-manifest.json');
  if (pageChunks.length === 0 || !fs.existsSync(manifestAbs) || !fs.existsSync(buildAbs)) {
    return null;
  }
  const manifestSrc = fs.readFileSync(manifestAbs, 'utf8');
  const build = JSON.parse(fs.readFileSync(buildAbs, 'utf8'));
  const selected = new Set([
    ...(build.polyfillFiles ?? []),
    ...(build.rootMainFiles ?? []),
    ...pageChunks,
  ]);
  let surfaceHits = 0;
  for (const suffix of DYNAMIC_ROOT_MODULES) {
    const found = chunksNamedInManifest(manifestSrc, suffix);
    if (found.length > 0) surfaceHits += 1;
    for (const rel of found) selected.add(rel);
  }
  if (surfaceHits === 0) return null;
  return { chunks: [...selected], how: 'dynamic-root (cookies() — no index.html)' };
}

function gzippedKb(chunks) {
  let bytes = 0;
  for (const rel of chunks) {
    const abs = path.join(root, '.next', rel);
    if (!fs.existsSync(abs)) continue;
    bytes += zlib.gzipSync(fs.readFileSync(abs), { level: 9 }).length;
  }
  return bytes / 1024;
}

function reportOver(route, budget, kb, chunks) {
  const heavy = chunks
    .map((rel) => {
      const abs = path.join(root, '.next', rel);
      return fs.existsSync(abs)
        ? { rel, kb: zlib.gzipSync(fs.readFileSync(abs), { level: 9 }).length / 1024 }
        : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.kb - a.kb)
    .slice(0, 5);
  console.error(`\n    ${route} is ${(kb - budget).toFixed(1)} KB over. Largest chunks:`);
  for (const h of heavy) console.error(`      ${h.kb.toFixed(1).padStart(7)} KB  ${h.rel}`);
  console.error(
    `    Usually this is a static import that should be dynamic(), or a metadata-only\n` +
      `    import that drags a whole module graph — see src/i18n/localeExportManifest.ts.\n`
  );
}

let failed = false;
console.log('bundle budget — gzipped initial JS per route\n');

for (const [route, budget] of Object.entries(BUDGETS_KB)) {
  const htmlPath = ROUTE_HTML[route];
  let chunks;
  let how = htmlPath;
  if (fs.existsSync(path.join(root, htmlPath))) {
    chunks = initialChunks(htmlPath);
  } else if (route === '/') {
    const fallback = dynamicRootChunks();
    if (!fallback) {
      console.error(
        `✗ ${route}: ${htmlPath} is missing and the dynamic-root fallback cannot measure. ` +
          `Need ${DYNAMIC_ROOT_MANIFEST} plus ${DYNAMIC_ROOT_PAGE_DIR}/page-*.js — ` +
          `a budget that silently passes when it cannot measure is the vacuous-green defect .200 was about. ` +
          `Root cause: hasPrivateAccessCookieOnServer() always reads cookies(), so Next emits ƒ / and no index.html.`
      );
      failed = true;
      continue;
    }
    chunks = fallback.chunks;
    how = fallback.how;
  } else {
    console.error(
      `✗ ${route}: ${htmlPath} is missing. Run \`npm run build\` first — a budget that ` +
        `silently passes when it cannot measure is the vacuous-green defect .200 was about.`
    );
    failed = true;
    continue;
  }

  const kb = gzippedKb(chunks);
  const verdict = kb > budget ? '✗' : '✓';
  console.log(
    `  ${verdict} ${route.padEnd(8)} ${kb.toFixed(1).padStart(7)} KB  (budget ${budget} KB, ${chunks.length} chunks)` +
      (how !== htmlPath ? `\n      via ${how}` : '')
  );

  if (kb > budget) {
    failed = true;
    reportOver(route, budget, kb, chunks);
  } else if (kb < budget - 20) {
    console.log(`      ↓ ${(budget - kb).toFixed(1)} KB under — lower the cap to lock the win in.`);
  }
}

if (failed) process.exit(1);
console.log('\nbundle budget OK.');
