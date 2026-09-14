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
 * the HTML is absent we reconstruct the initial list from
 * `page_client-reference-manifest.js` plus `build-manifest.json` root runtime
 * (polyfills + `rootMainFiles`). That set is a little wider than a live
 * document (async leftovers stay in the manifest). `/log` and `/active` stay
 * HTML-only.
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
 * ## `.1070` HOLD raise (founder: fix/bump)
 *
 * CI `PRIVATE_MODE=false` webpack build on #937 tip `96e9c2b7`:
 * `/log` 416.7 KB (was 280), `/active` 510.2 KB (was 435), `/` had no
 * `index.html`. Same class as the coverage-floor raise: house chrome + #935
 * + existing UI, not four i18n catalog keys. Caps are the measured ceil.
 * `/` uses the dynamic-home reconstruction (see below), measured 458.9 KB.
 *
 * Previous 2026-07-30 numbers (262 / 280 / 435) assumed prerendered landing
 * HTML and a slimmer house. They had been red on master (`docs/CI_LOCAL.md`).
 */
const BUDGETS_KB = {
  '/': 459,
  '/log': 417,
  '/active': 511,
};

/** Prerendered HTML for each budgeted route. */
const ROUTE_HTML = {
  '/': '.next/server/app/index.html',
  '/log': '.next/server/app/log.html',
  '/active': '.next/server/app/active.html',
};

const HOME_MANIFEST = '.next/server/app/page_client-reference-manifest.js';
const BUILD_MANIFEST = '.next/build-manifest.json';

function initialChunks(htmlPath) {
  const html = fs.readFileSync(path.join(root, htmlPath), 'utf8');
  return [...new Set([...html.matchAll(/\/_next\/(static\/chunks\/[^"'\\\s]+?\.js)/g)].map((m) => m[1]))];
}

/** Initial JS for cookie-dynamic `/` when Next emits no index.html. */
function dynamicHomeChunks() {
  const manAbs = path.join(root, HOME_MANIFEST);
  const bmAbs = path.join(root, BUILD_MANIFEST);
  if (!fs.existsSync(manAbs) || !fs.existsSync(bmAbs)) return null;
  const man = fs.readFileSync(manAbs, 'utf8');
  const fromMan = [...man.matchAll(/static\/chunks\/[^"'\\\s]+?\.js/g)].map((m) => m[0]);
  const bm = JSON.parse(fs.readFileSync(bmAbs, 'utf8'));
  const rootFiles = [...(bm.polyfillFiles ?? []), ...(bm.rootMainFiles ?? [])];
  return [...new Set([...fromMan, ...rootFiles])];
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
  const htmlAbs = path.join(root, htmlPath);
  let chunks;
  let source = htmlPath;

  if (fs.existsSync(htmlAbs)) {
    chunks = initialChunks(htmlPath);
  } else if (route === '/') {
    chunks = dynamicHomeChunks();
    source = `${HOME_MANIFEST} + ${BUILD_MANIFEST}`;
    if (!chunks) {
      console.error(
        `✗ ${route}: ${htmlPath} is missing and the dynamic-home manifests are missing. ` +
          `Run \`npm run build\` first — a budget that silently passes when it cannot ` +
          `measure is the vacuous-green defect .200 was about. \`/\` reads cookies() ` +
          `(hasPrivateAccessCookieOnServer) so Next never prerenders index.html.`
      );
      failed = true;
      continue;
    }
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
  console.log(`  ${verdict} ${route.padEnd(8)} ${kb.toFixed(1).padStart(7)} KB  (budget ${budget} KB, ${chunks.length} chunks)`);
  if (source !== htmlPath) console.log(`      source ${source}`);

  if (kb > budget) {
    failed = true;
    reportOver(route, budget, kb, chunks);
  } else if (kb < budget - 20) {
    console.log(`      ↓ ${(budget - kb).toFixed(1)} KB under — lower the cap to lock the win in.`);
  }
}

if (failed) process.exit(1);
console.log('\nbundle budget OK.');
