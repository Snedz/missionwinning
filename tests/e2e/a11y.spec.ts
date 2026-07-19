import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { gateRequired, unlockGate } from './helpers/gate';
import { seedLegacyOnboarding } from './helpers/journey';

/**
 * Wave 8 a11y automation — tagged @a11y (excluded from e2e:critical).
 * Fail on serious + critical only; moderate/minor console-warned.
 */

const ROUTES = [
  '/',
  '/welcome',
  '/log',
  '/coach',
  '/bundle',
  '/experience?tier=static',
  '/exercises/push-ups',
] as const;

test.describe('Accessibility @a11y', () => {
  test.beforeEach(async ({ page, context, baseURL }) => {
    if (!baseURL) throw new Error('baseURL required');
    const ok = await unlockGate(page, context, baseURL);
    if (gateRequired() && !ok) {
      test.skip(true, 'SMOKE_ACCESS_SECRET required to unlock private gate');
    }
    await seedLegacyOnboarding(page);
  });

  for (const path of ROUTES) {
    test(`axe serious/critical: ${path} @a11y`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('body')).toBeVisible();

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
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
    });
  }
});
