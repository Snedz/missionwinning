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
 * Measured 2026-07-30 immediately after the `localeExportManifest` split, with
 * ~6% headroom: enough that an ordinary feature does not trip the gate, tight
 * enough that a regression of the size this was built to catch — the 306 KB
 * locale chunk — cannot hide inside the slack.
 *
 * ## These are the `PRIVATE_MODE=false` numbers
 *
 * `scripts/gate.mjs` builds with `PRIVATE_MODE=false`, so `/` here is the public
 * **landing page** (20 chunks). A default production build gates `/` down to the
 * six-chunk `/private` teaser and reports 164 KB — and the first draft of this
 * file was calibrated against *that*, which made the budget fail on its own first
 * gate run at 247 KB.
 *
 * That is the `.204` asymmetry again, in a new place: the gate measures a
 * configuration production does not currently serve. The budget is set against
 * what the gate builds, because a cap the gate cannot check is not a cap — but
 * when `PRIVATE_MODE` flips to false for real, `/` becomes this page for
 * everyone, and these are the numbers that will matter.
 */
const BUDGETS_KB = {
  '/': 262,
  '/log': 280,
  '/active': 435,
};

/** Prerendered HTML for each budgeted route. */
const ROUTE_HTML = {
  '/': '.next/server/app/index.html',
  '/log': '.next/server/app/log.html',
  '/active': '.next/server/app/active.html',
};

function initialChunks(htmlPath) {
  const html = fs.readFileSync(path.join(root, htmlPath), 'utf8');
  return [...new Set([...html.matchAll(/\/_next\/(static\/chunks\/[^"'\\\s]+?\.js)/g)].map((m) => m[1]))];
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

let failed = false;
console.log('bundle budget — gzipped initial JS per route\n');

for (const [route, budget] of Object.entries(BUDGETS_KB)) {
  const htmlPath = ROUTE_HTML[route];
  if (!fs.existsSync(path.join(root, htmlPath))) {
    console.error(
      `✗ ${route}: ${htmlPath} is missing. Run \`npm run build\` first — a budget that ` +
        `silently passes when it cannot measure is the vacuous-green defect .200 was about.`
    );
    failed = true;
    continue;
  }

  const chunks = initialChunks(htmlPath);
  const kb = gzippedKb(chunks);
  const verdict = kb > budget ? '✗' : '✓';
  console.log(`  ${verdict} ${route.padEnd(8)} ${kb.toFixed(1).padStart(7)} KB  (budget ${budget} KB, ${chunks.length} chunks)`);

  if (kb > budget) {
    failed = true;
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
  } else if (kb < budget - 20) {
    console.log(`      ↓ ${(budget - kb).toFixed(1)} KB under — lower the cap to lock the win in.`);
  }
}

if (failed) process.exit(1);
console.log('\nbundle budget OK.');
