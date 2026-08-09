#!/usr/bin/env node
/**
 * Initial gzipped JS reachable from the www surface's prerendered HTML.
 *
 * Same shape as scripts/bundle-budget.mjs, and the same two properties are the
 * load-bearing ones:
 *
 *   - Budgets are inline consts that only ever ratchet DOWN. A budget stored
 *     where a build can rewrite it measures nothing.
 *   - A missing HTML file is a HARD FAILURE, not a skip. "A budget that
 *     silently passes when it cannot measure is the vacuous-green defect .200
 *     was about" — the same sentence applies here, so the same behaviour does.
 *
 * The proposal's acceptance bar is < 20KB. The site currently ships ZERO bytes
 * of JS, which is the honest starting ratchet: the budget below is the ceiling
 * the ported islands (PR D) may spend, not a description of today.
 *
 * Run: npm run www:check  (or node scripts/www-bundle-budget.mjs)
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const DIST = path.join(root, 'sites/www/dist');

/** Route → budget in KB of gzipped initial JS. Ratchet down only. */
const BUDGETS_KB = {
  '/': 20,
};

const ROUTE_HTML = {
  '/': 'index.html',
};

function initialScripts(htmlPath) {
  const html = fs.readFileSync(htmlPath, 'utf8');
  // Astro emits hashed module scripts under /_astro/. Inline scripts are
  // counted separately below — an island's hydration shim can live inline and
  // would otherwise be invisible to a src-only scan.
  const external = [
    ...new Set([...html.matchAll(/src="\/(_astro\/[^"']+?\.js)"/g)].map((m) => m[1])),
  ];
  const inline = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(
    (m) => m[1],
  );
  return { external, inline };
}

function gzippedKb(buffers) {
  if (!buffers.length) return 0;
  const total = buffers.reduce(
    (sum, buf) => sum + zlib.gzipSync(buf, { level: 9 }).length,
    0,
  );
  return total / 1024;
}

function main() {
  let over = false;
  const rows = [];

  for (const [route, file] of Object.entries(ROUTE_HTML)) {
    const htmlPath = path.join(DIST, file);
    if (!fs.existsSync(htmlPath)) {
      console.error(
        `\n✗ ${file} not found under sites/www/dist.\n` +
          '  Run `npm --prefix sites/www run build` first. Refusing to report a\n' +
          '  budget it could not measure — that is a green that means nothing.\n',
      );
      throw new Error(`www-bundle-budget: missing ${file}`);
    }

    const { external, inline } = initialScripts(htmlPath);
    const buffers = [
      ...external.map((rel) => fs.readFileSync(path.join(DIST, rel))),
      ...inline.map((s) => Buffer.from(s, 'utf8')),
    ];
    const kb = gzippedKb(buffers);
    const budget = BUDGETS_KB[route];
    const ok = kb <= budget;
    if (!ok) over = true;
    rows.push({ route, kb, budget, ok, count: external.length + inline.length });
  }

  console.log('\nwww bundle budget — gzipped initial JS\n');
  console.log('Route      Scripts   Gzip KB   Budget   Status');
  console.log('-'.repeat(48));
  for (const r of rows) {
    console.log(
      `${r.route.padEnd(10)} ${String(r.count).padEnd(9)} ${r.kb.toFixed(1).padEnd(9)} ${String(r.budget).padEnd(8)} ${r.ok ? 'OK' : 'OVER'}`,
    );
  }

  for (const r of rows) {
    if (r.ok && r.budget - r.kb > 5) {
      console.log(
        `\n  ${r.route} is ${(r.budget - r.kb).toFixed(1)} KB under — lower BUDGETS_KB to lock the win in.`,
      );
    }
  }

  console.log(over ? '\n✗ JS budget exceeded.\n' : '\n✓ within budget.\n');
  process.exitCode = over ? 1 : 0;
}

main();
