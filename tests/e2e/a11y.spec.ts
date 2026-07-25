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

async function axeSerious(page: import('@playwright/test').Page, path: string) {
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
