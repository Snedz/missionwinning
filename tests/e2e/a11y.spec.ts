import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { gateRequired, unlockGate } from './helpers/gate';
import { seedLegacyOnboarding } from './helpers/journey';

/**
 * a11y automation — tagged @a11y (excluded from e2e:critical).
 * Fail on serious + critical only; moderate/minor console-warned.
 */

const GATED_ROUTES = [
  '/',
  '/welcome',
  '/log',
  '/coach',
  '/bundle',
  '/active',
  '/nutrition',
  '/experience?tier=static',
  '/exercises/push-ups',
] as const;

/**
 * Wait until the page stops animating before measuring.
 *
 * `page-enter` / `journey-enter` / `Reveal` fade opacity in, and a partly-faded
 * element composites to a lower contrast ratio than its resting state — so axe run
 * mid-animation reports failures that do not exist once the page settles.
 *
 * A one-shot `getAnimations()` check is not enough: these routes mount components
 * behind `requestIdleCallback` and dynamic imports, so new animations start *after*
 * the first check and the failure wandered between /welcome, /coach and /nutrition
 * at roughly one run in two. This waits for two consecutive quiet frames instead,
 * which is the difference between a gate people trust and one they switch off.
 */
async function settle(page: import('@playwright/test').Page) {
  await page
    .evaluate(async () => {
      const quiet = () => document.getAnimations().filter((a) => a.playState === 'running');
      const deadline = Date.now() + 5_000;
      let consecutiveQuiet = 0;

      while (Date.now() < deadline && consecutiveQuiet < 2) {
        const running = quiet();
        if (running.length === 0) {
          consecutiveQuiet += 1;
        } else {
          consecutiveQuiet = 0;
          await Promise.race([
            Promise.allSettled(running.map((a) => a.finished.catch(() => undefined))),
            new Promise((r) => setTimeout(r, 1_200)),
          ]);
        }
        // A frame plus a beat, so anything mounting on idle has a chance to begin.
        await new Promise((r) => setTimeout(r, 150));
      }
    })
    .catch(() => undefined);
}

async function axeSerious(page: import('@playwright/test').Page, path: string) {
  await settle(page);
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    // The MW monogram is a logotype, which WCAG 1.4.3 exempts from contrast — and it
    // has to keep the brand accent to match /favicon.svg and the PWA rasters. Excluded
    // by selector rather than by disabling color-contrast, so every other white-on-
    // emerald surface is still checked. See src/components/brand/BrandMonogram.tsx.
    .exclude('[data-brand-monogram]')
    .analyze();

  const serious = results.violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical'
  );
  const soft = results.violations.filter(
    (v) => v.impact === 'moderate' || v.impact === 'minor'
  );
  if (soft.length) {
    console.warn(
      `[a11y ${path}] moderate/minor:`,
      soft.map((v) => `${v.id} (${v.impact})`).join(', ')
    );
  }

  expect(
    serious,
    serious.map((v) => `${v.id}: ${v.help}`).join('\n')
  ).toEqual([]);
}

test.describe('Accessibility @a11y', () => {
  for (const path of GATED_ROUTES) {
    test(`axe serious/critical: ${path} @a11y`, async ({ page, context, baseURL }) => {
      if (!baseURL) throw new Error('baseURL required');
      const ok = await unlockGate(page, context, baseURL);
      if (gateRequired() && !ok) {
        test.skip(true, 'SMOKE_ACCESS_SECRET required to unlock private gate');
      }
      await seedLegacyOnboarding(page);
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('body')).toBeVisible();

      if (path === '/active') {
        await page
          .getByRole('button', { name: /start workout|loading session/i })
          .first()
          .waitFor({ state: 'visible', timeout: 15_000 });
      }

      await axeSerious(page, path);
    });
  }

  test('axe serious/critical: /private @a11y', async ({ page, baseURL }) => {
    if (!baseURL) throw new Error('baseURL required');
    await page.goto('/private', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible();
    await axeSerious(page, '/private');
  });
});
