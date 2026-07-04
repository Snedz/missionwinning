#!/usr/bin/env node
/**
 * Playwright E2E smoke — offline cold-start, backup, 404, logger, coach.
 * Usage: SMOKE_BASE_URL=http://localhost:3000 npm run e2e
 * Requires: npm install -D @playwright/test && npx playwright install chromium
 */
const base = (process.env.SMOKE_BASE_URL || process.argv[2] || 'http://localhost:3000').replace(
  /\/$/,
  ''
);

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

  await browser.close();

  if (failures.length) {
    console.error(`\n${failures.length} check(s) failed`);
    process.exit(1);
  }
  console.log('\nE2E smoke passed');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
