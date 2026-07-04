#!/usr/bin/env node
/**
 * Playwright E2E smoke — offline cold-start, backup, 404, logger, coach, screenshot matrix.
 * Usage: SMOKE_BASE_URL=http://localhost:3000 npm run e2e
 * Requires: npm install -D playwright && npx playwright install chromium
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const base = (process.env.SMOKE_BASE_URL || process.argv[2] || 'http://localhost:3000').replace(
  /\/$/,
  ''
);

const SCREENSHOT_ROUTES = [
  '/',
  '/log',
  '/coach',
  '/library',
  '/builder',
  '/guide/human-performance',
  '/exercises/squats',
];

const VIEWPORTS = [
  { name: '390', width: 390, height: 844 },
  { name: '1440', width: 1440, height: 900 },
];

async function main() {
  let chromium;
  try {
    ({ chromium } = await import('playwright'));
  } catch {
    console.error(
      'Playwright not installed. Run: npm install -D playwright && npx playwright install chromium'
    );
    process.exit(1);
  }

  const outDir = join(process.cwd(), 'e2e-screenshots');
  await mkdir(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const failures = [];

  const check = async (name, fn) => {
    try {
      await fn();
      console.log(`✓ ${name}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`✗ ${name}: ${msg}`);
      failures.push(name);
    }
  };

  await check('404 page', async () => {
    const res = await page.goto(`${base}/this-route-does-not-exist-mw`, { waitUntil: 'domcontentloaded' });
    if (!res || res.status() !== 404) throw new Error(`Expected 404, got ${res?.status()}`);
  });

  await check('log page loads', async () => {
    await page.goto(`${base}/log`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForSelector('body', { timeout: 15_000 });
  });

  await check('coach page offline shell', async () => {
    await context.setOffline(true);
    await page.goto(`${base}/coach`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    const text = await page.textContent('body');
    if (!text || text.length < 20) throw new Error('Coach page empty offline');
    await context.setOffline(false);
  });

  await check('builder/logger smoke', async () => {
    await page.goto(`${base}/builder`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForSelector('body', { timeout: 15_000 });
  });

  await check('public guide loads', async () => {
    const res = await page.goto(`${base}/guide/human-performance`, {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });
    if (!res || res.status() !== 200) throw new Error(`Guide chapter status ${res?.status()}`);
    const jsonLd = await page.locator('script[type="application/ld+json"]').count();
    if (jsonLd < 1) throw new Error('Missing Article JSON-LD');
  });

  await check('public exercise loads', async () => {
    const res = await page.goto(`${base}/exercises/squats`, {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });
    if (!res || res.status() !== 200) throw new Error(`Exercise page status ${res?.status()}`);
  });

  await check('reduced motion hero demo', async () => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`${base}/`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForSelector('body', { timeout: 15_000 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
  });

  for (const route of SCREENSHOT_ROUTES) {
    for (const vp of VIEWPORTS) {
      const slug = route === '/' ? 'home' : route.replace(/\//g, '_').replace(/^_/, '');
      const name = `screenshot ${slug} @${vp.name}`;
      await check(name, async () => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(`${base}${route}`, { waitUntil: 'networkidle', timeout: 45_000 });
        const file = join(outDir, `${slug}-${vp.name}.png`);
        await page.screenshot({ path: file, fullPage: true });
      });
    }
  }

  await writeFile(
    join(outDir, 'manifest.json'),
    JSON.stringify({ base, routes: SCREENSHOT_ROUTES, viewports: VIEWPORTS.map((v) => v.name) }, null, 2)
  );

  await browser.close();

  if (failures.length) {
    console.error(`\n${failures.length} check(s) failed`);
    process.exit(1);
  }
  console.log(`\nE2E smoke passed — screenshots in ${outDir}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
