#!/usr/bin/env node
/**
 * Fold stills of the 04 combined landing at the two widths this surface is
 * judged at (390×844, 1440×900). Written next to www-wireframes.png so a PR
 * can be reviewed without opening the HTML.
 *
 * Current `/start` stills are optional: captured when `npm run www` is already
 * listening on 4321, skipped (not invented) when it is not.
 *
 * Run: npm run design:stills
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch } from '../lib/wwwPreview.mjs';
import { CONCEPTS_DIR, DESIGN_DIR, WWW_CONTROL, serveDesign } from './serve.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const VIEWS = [
  { name: '390', width: 390, height: 844 },
  { name: '1440', width: 1440, height: 900 },
];

async function shot(browser, url, viewport, dest) {
  const page = await browser.newPage({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 2,
  });
  try {
    const res = await page.goto(url, { waitUntil: 'load', timeout: 20_000 });
    if (!res || !res.ok()) {
      throw new Error(`${url} returned ${res ? res.status() : 'no response'}`);
    }
    await page.screenshot({ path: dest, fullPage: false, type: 'png' });
  } finally {
    await page.close();
  }
}

function controlUp() {
  const urls = [`${WWW_CONTROL}/start`, 'http://127.0.0.1:4321/start', 'http://[::1]:4321/start'];
  return (async () => {
    for (const url of urls) {
      const ok = await new Promise((resolve) => {
        const req = http.get(url, { timeout: 1500 }, (res) => {
          res.resume();
          resolve(res.statusCode >= 200 && res.statusCode < 400);
        });
        req.on('error', () => resolve(false));
        req.on('timeout', () => {
          req.destroy();
          resolve(false);
        });
      });
      if (ok) return url.replace(/\/start$/, '');
    }
    return null;
  })();
}

async function main() {
  const landing = path.join(CONCEPTS_DIR, '04-combined.html');
  if (!fs.existsSync(landing)) {
    console.error(
      '\n✗ docs/design/concepts/04-combined.html is missing.\n' +
        '  Run `npx tsx scripts/design-concepts/build.mts` first.\n',
    );
    process.exit(1);
  }

  const server = await serveDesign({ port: 0 });
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await launch();
  const written = [];

  try {
    for (const v of VIEWS) {
      const dest = path.join(DESIGN_DIR, `04-combined-${v.name}.png`);
      await shot(browser, `${origin}/concepts/04-combined.html`, v, dest);
      written.push(dest);
      console.log(`  ${path.relative(path.join(__dirname, '..', '..'), dest)}`);
    }

    const controlOrigin = await controlUp();
    if (controlOrigin) {
      for (const v of VIEWS) {
        const dest = path.join(DESIGN_DIR, `start-current-${v.name}.png`);
        await shot(browser, `${controlOrigin}/start`, v, dest);
        written.push(dest);
        console.log(`  ${path.relative(path.join(__dirname, '..', '..'), dest)}`);
      }
    } else {
      console.log('  skip /start stills — npm run www is not listening on 4321');
    }
  } finally {
    await browser.close();
    await new Promise((r) => server.close(r));
  }

  console.log(`\n✓ ${written.length} stills · fold only · deviceScaleFactor 2\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
