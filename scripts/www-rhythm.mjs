#!/usr/bin/env node
/**
 * The spec's central claim, measured instead of asserted.
 *
 * DESIGN_PROPOSAL_WWW says the delta between this surface and the app is
 * vertical rhythm, and gives the target from DESIGN_RESEARCH Wave 10 §10.4:
 * reference spacing is bimodal — clusters 27–46pt, section boundaries
 * 190–450pt, statement boundaries 540–830pt, with nothing in between.
 *
 * A number in a document is a claim. This makes it a check, using the SAME
 * methodology the references were measured with: the vertical gap between the
 * bounding boxes of consecutive text blocks, not the CSS padding. Padding
 * ignores the margins between a heading and its body, which is a third of the
 * gap on a real section.
 *
 * Two deliberate limits, both stated rather than hidden:
 *
 *   1. Desktop only. Wave 10 measured ten captures at 1440pt and nothing at
 *      any other width, so there is no sourced compact band. Asserting one
 *      would be inventing the number this whole programme exists to avoid.
 *   2. Gaps are classified by what they SEPARATE, not by size — two blocks in
 *      one <section> are a cluster, blocks in different sections are a
 *      boundary. Classifying by magnitude makes the test tautological: it
 *      would sort every gap into whichever band already contains it.
 *
 * Usage: node scripts/www-rhythm.mjs [url]   — a url argument skips the built-in
 * server and measures a deployed preview instead.
 */
// @playwright/test, not `playwright` — the former is already a devDependency
// here (the e2e suite uses it) and re-exports the same browser launchers, so
// this guard adds no package to the tree.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, '..', 'sites/www/dist');

/*
 * This serves dist itself rather than expecting a server to be running.
 *
 * Not convenience: the check has to live somewhere that actually runs, and
 * while Actions is billing-blocked the only such place is `npm run gate` —
 * ciTruth.test.ts fails the build over exactly this, on the grounds that a
 * workflow-only check is currently not being checked at all. A guard that needs
 * a server someone remembered to start is a guard that gets skipped.
 *
 * file:// is not an option: Astro emits absolute asset paths (/_astro/…), which
 * resolve to the filesystem root and load no stylesheet at all — the page then
 * measures in Times New Roman with every gap collapsed, and reports a rhythm
 * failure that has nothing to do with the rhythm.
 */
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.png': 'image/png',
};

function serveDist() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const rel = decodeURIComponent((req.url || '/').split('?')[0]);
      const file = path.join(DIST, rel.endsWith('/') ? `${rel}index.html` : rel);
      // Traversal cannot matter here — this process drives every request — but a
      // server willing to read outside its root is not a thing to leave lying
      // around in a repo where someone may reuse it.
      if (!file.startsWith(DIST)) return void res.writeHead(403).end();
      fs.readFile(file, (err, body) => {
        if (err) return void res.writeHead(404).end();
        res.writeHead(200, {
          'content-type': MIME[path.extname(file)] || 'application/octet-stream',
        });
        res.end(body);
      });
    });
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

/** An explicit url skips the built-in server (used against a preview deploy). */
const URL_ARG = process.argv[2] || process.env.WWW_BASE_URL || null;

const BANDS = {
  cluster: [8, 120],
  section: [190, 450],
  statement: [540, 830],
};

/**
 * Launch the bundled browser, or a preinstalled one when the two disagree.
 *
 * CI images often ship a Chromium built for a different Playwright revision
 * than the one in package.json, and the default launch then fails with
 * "Executable doesn't exist" — a message that reads like a missing dependency
 * and gets "fixed" by adding a browser download to a workflow. WWW_CHROMIUM_PATH
 * is the explicit way out; the default path is the one this image ships.
 */
async function launch() {
  try {
    return await chromium.launch();
  } catch (err) {
    const fallback =
      process.env.WWW_CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
    if (!fs.existsSync(fallback)) throw err;
    console.log(`  (bundled browser unavailable — using ${fallback})`);
    return chromium.launch({ executablePath: fallback });
  }
}

async function main() {
  if (!URL_ARG && !fs.existsSync(path.join(DIST, 'index.html'))) {
    console.error(
      '\n✗ sites/www/dist/index.html not found.\n' +
        '  Run `npm run www:build` first — refusing to report a rhythm it could\n' +
        '  not measure.\n',
    );
    throw new Error('www-rhythm: no build to measure');
  }

  const server = URL_ARG ? null : await serveDist();
  const url = URL_ARG || `http://127.0.0.1:${server.address().port}/`;

  const browser = await launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));

  const done = async () => {
    await browser.close();
    if (server) await new Promise((r) => server.close(r));
  };

  let res;
  try {
    res = await page.goto(url, { waitUntil: 'load', timeout: 20_000 });
  } catch (err) {
    await done();
    console.error(`\n✗ could not load ${url}\n  (${err.message})\n`);
    throw err;
  }
  if (!res || !res.ok()) {
    await done();
    throw new Error(`www-rhythm: ${url} returned ${res ? res.status() : 'no response'}`);
  }

  const gaps = await page.evaluate(() => {
    const isTextLeaf = (el) => {
      if (!el.textContent || !el.textContent.trim()) return false;
      return ![...el.children].some((c) => c.textContent && c.textContent.trim());
    };
    // <header> is chrome, not a section of the argument — the references' first
    // measured gap is likewise below the nav.
    const scopes = [...document.querySelectorAll('main > section, body > footer')];
    const blocks = [];
    scopes.forEach((scope, scopeIndex) => {
      const statement = !!scope.querySelector('.display-statement');
      [...scope.querySelectorAll('*')].filter(isTextLeaf).forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.height <= 0) return;
        blocks.push({
          top: r.top + window.scrollY,
          bottom: r.bottom + window.scrollY,
          scopeIndex,
          statement,
          text: el.textContent.trim().slice(0, 36),
        });
      });
    });
    blocks.sort((a, b) => a.top - b.top);

    const out = [];
    let prev = null;
    for (const blk of blocks) {
      if (prev) {
        const gap = Math.round(blk.top - prev.bottom);
        if (gap > 0) {
          const crosses = blk.scopeIndex !== prev.scopeIndex;
          const kind = !crosses
            ? 'cluster'
            : prev.statement || blk.statement
              ? 'statement'
              : 'section';
          out.push({ gap, kind, text: blk.text });
        }
      }
      prev = prev && prev.bottom > blk.bottom ? prev : blk;
    }
    return out;
  });

  await done();

  if (errors.length) {
    console.error(`\n✗ ${errors.length} JS error(s) on the page:\n  ${errors.join('\n  ')}\n`);
    process.exitCode = 1;
    return;
  }

  // A rhythm check that found no boundaries measured nothing. With one section
  // the page would print a clean pass while proving the opposite of the claim.
  const boundaries = gaps.filter((g) => g.kind !== 'cluster');
  if (boundaries.length === 0) {
    console.error('\n✗ no section boundaries found — nothing to measure.\n');
    throw new Error('www-rhythm: zero boundaries');
  }

  console.log(`\nwww rhythm — ${url} at 1440px, text-block gaps\n`);
  let bad = 0;
  for (const g of gaps) {
    const [lo, hi] = BANDS[g.kind];
    const ok = g.gap >= lo && g.gap <= hi;
    if (!ok) bad += 1;
    console.log(
      `  ${String(g.gap).padStart(4)}px  ${g.kind.padEnd(9)} band ${String(lo).padStart(3)}–${String(hi).padEnd(3)}  ${ok ? 'OK ' : 'OUT'}  ${g.text}`,
    );
  }

  console.log(
    `\n  ${gaps.length} gaps · ${boundaries.length} boundaries · ${bad} outside band`,
  );
  console.log(
    bad
      ? '\n✗ rhythm outside the measured reference band (DESIGN_RESEARCH Wave 10 §10.4).\n'
      : '\n✓ rhythm inside the measured reference band.\n',
  );
  process.exitCode = bad ? 1 : 0;
}

main();
