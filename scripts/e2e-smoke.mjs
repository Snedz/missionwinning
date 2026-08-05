#!/usr/bin/env node
/**
 * Playwright E2E extended smoke — screenshots, public routes, offline shell.
 * Critical hero flows live in tests/e2e/ (npm run e2e:critical).
 *
 * Usage: SMOKE_BASE_URL=http://localhost:3000 npm run e2e
 */
import { spawnSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const base = (process.env.SMOKE_BASE_URL || process.argv[2] || 'http://localhost:3000').replace(
  /\/$/,
  ''
);
const accessSecret = process.env.SMOKE_ACCESS_SECRET;

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

/** Unlock private gate via password form API (sets httpOnly cookie on context). */
async function unlockGate(page, context) {
  if (!accessSecret) return false;

  const res = await page.request.post(`${base}/api/private-access`, {
    data: { password: accessSecret },
  });
  if (!res.ok()) return false;

  const headers = res.headers();
  const setCookie = headers['set-cookie'];
  if (!setCookie) return false;

  const match = setCookie.match(/([^=]+)=([^;]+)/);
  if (!match) return false;

  await context.addCookies([
    {
      name: match[1],
      value: match[2],
      domain: new URL(base).hostname,
      path: '/',
      httpOnly: true,
      secure: base.startsWith('https'),
      sameSite: 'Lax',
    },
  ]);
  return true;
}

async function main() {
  const critical = spawnSync('npm', ['run', 'e2e:critical'], {
    stdio: 'inherit',
    env: process.env,
  });
  if (critical.status !== 0) {
    process.exit(critical.status ?? 1);
  }

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

  await check('offline fallback page', async () => {
    const res = await page.goto(`${base}/offline`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    if (!res || res.status() !== 200) throw new Error(`Expected 200, got ${res?.status()}`);
    const text = await page.textContent('body');
    if (!text || text.length < 10) throw new Error('Offline page empty');
  });

  if (process.env.SMOKE_EXPECT_PWA === 'true') {
    await check('PWA sw.js registered', async () => {
      const res = await page.request.get(`${base}/sw.js`);
      if (!res.ok()) throw new Error(`sw.js status ${res.status()}`);
    });
    await check('PWA manifest', async () => {
      const res = await page.request.get(`${base}/manifest.webmanifest`);
      if (!res.ok()) throw new Error(`manifest status ${res.status()}`);
    });
  }

  const gateOk = await unlockGate(page, context);
  if (accessSecret && !gateOk) {
    failures.push('gate unlock');
    console.error('✗ gate unlock: POST /api/private-access failed');
  } else if (gateOk) {
    console.log('✓ gate unlocked via SMOKE_ACCESS_SECRET');
  }

  await check('hero flow mobile welcome', async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    const res = await page.goto(`${base}/welcome`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    if (!res) throw new Error('No response');
    if (res.status() === 200) return;
    if (!gateOk && page.url().includes('/private')) {
      throw new Error('Welcome gated — set SMOKE_ACCESS_SECRET');
    }
    throw new Error(`Unexpected status ${res.status()} url=${page.url()}`);
  });

  await check('hero flow today loads', async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${base}/log`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    if (!gateOk && page.url().includes('/private')) {
      throw new Error('Today gated — set SMOKE_ACCESS_SECRET');
    }
    await page.waitForSelector('body', { timeout: 15_000 });
  });

  await check('hero flow builder reachable', async () => {
    await page.goto(`${base}/builder`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    if (!gateOk && page.url().includes('/private')) {
      throw new Error('Builder gated — set SMOKE_ACCESS_SECRET');
    }
    await page.waitForSelector('body', { timeout: 15_000 });
  });

  await check('language switch on profile', async () => {
    if (!gateOk) {
      console.log('  (skipped — gate required for /profile)');
      return;
    }
    await page.goto(`${base}/profile`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    const langSelect = page.locator('select[aria-label*="anguage" i], select[aria-label*="Change language" i]');
    if ((await langSelect.count()) === 0) throw new Error('Language select not found');
    await langSelect.selectOption('es');
    await page.waitForTimeout(500);
  });

  await check('log page loads', async () => {
    await page.goto(`${base}/log`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForSelector('body', { timeout: 15_000 });
  });

  await check('coach page offline shell', async () => {
    if (!gateOk) {
      console.log('  (skipped offline coach — gate required)');
      return;
    }
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
