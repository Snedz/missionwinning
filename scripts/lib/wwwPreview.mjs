/**
 * Serving and opening the built www surface, for the guards that need a browser.
 *
 * Extracted at `.641`, when www-composition.mjs became the second guard needing
 * exactly this. Two copies of a static server is two places for a MIME type to
 * be missing from — and a guard that silently serves `application/octet-stream`
 * for `.avif` measures a page with no photographs on it, which is precisely the
 * thing the composition guard exists to catch.
 *
 * The reasoning that shaped it, kept from www-rhythm.mjs where it was written:
 *
 * This serves dist itself rather than expecting a server to be running. Not
 * convenience — the check has to live somewhere that actually runs, and while
 * Actions is billing-blocked the only such place is `npm run gate`. A guard that
 * needs a server someone remembered to start is a guard that gets skipped.
 *
 * file:// is not an option: Astro emits absolute asset paths (/_astro/…), which
 * resolve to the filesystem root and load no stylesheet at all — the page then
 * measures in Times New Roman with every gap collapsed, and reports a failure
 * that has nothing to do with what was being measured.
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const DIST = path.join(__dirname, '..', '..', 'sites/www/dist');

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

export function serveDist() {
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

/**
 * Launch the bundled browser, or a preinstalled one when the two disagree.
 *
 * CI images often ship a Chromium built for a different Playwright revision
 * than the one in package.json, and the default launch then fails with
 * "Executable doesn't exist" — a message that reads like a missing dependency
 * and gets "fixed" by adding a browser download to a workflow. WWW_CHROMIUM_PATH
 * is the explicit way out; the default path is the one this image ships.
 */
export async function launch() {
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

/** An explicit url skips the built-in server (used against a preview deploy). */
export const URL_ARG = process.argv[2] || process.env.WWW_BASE_URL || null;

/**
 * Serve, launch, navigate. Returns everything the caller needs plus a `done()`
 * that closes both, so neither guard can leak a browser on a failure path.
 *
 * `viewport` defaults to the width every reference was measured at. Wave 10 and
 * Wave 11 both measured ten captures at 1440 and nothing at any other width, so
 * a guard asserting at another viewport would be asserting an invented number.
 */
export async function openPreview({ label, viewport = { width: 1440, height: 900 } } = {}) {
  if (!URL_ARG && !fs.existsSync(path.join(DIST, 'index.html'))) {
    console.error(
      '\n✗ sites/www/dist/index.html not found.\n' +
        '  Run `npm run www:build` first — refusing to report a measurement it\n' +
        '  could not take.\n',
    );
    throw new Error(`${label}: no build to measure`);
  }

  const server = URL_ARG ? null : await serveDist();
  const url = URL_ARG || `http://127.0.0.1:${server.address().port}/`;

  const browser = await launch();
  const page = await browser.newPage({ viewport });

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
    throw new Error(`${label}: ${url} returned ${res ? res.status() : 'no response'}`);
  }

  return { page, url, errors, done };
}
