import { test, expect } from '@playwright/test';
import { gateRequired, unlockGate } from './helpers/gate';
import { seedLegacyOnboarding } from './helpers/journey';

/**
 * Fuel first paint is a notepad. A fixed Log-food FAB used to swallow
 * page controls (water +, Snack, Log weight). The FAB is gone — the
 * type field is the action. This spec now guards that it stays gone.
 */

const MOBILE = { width: 375, height: 812 };

test.describe('Fuel notepad @gate', () => {
  test.beforeEach(async ({ page, context, baseURL }) => {
    if (!baseURL) throw new Error('baseURL required');
    const ok = await unlockGate(page, context, baseURL);
    if (gateRequired() && !ok) {
      test.skip(true, 'SMOKE_ACCESS_SECRET required to unlock private gate');
    }
  });

  test('Fuel has no floating Log food — type-in is the action', async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await seedLegacyOnboarding(page);
    await page.goto('/nutrition', { waitUntil: 'domcontentloaded' });

    const typeIn = page.locator('#fuel-nl-meal');
    await expect(typeIn, 'the notepad field should be present').toBeVisible({ timeout: 15_000 });

    const fixedFab = await page.locator('button').evaluateAll((buttons) =>
      buttons.some(
        (b) =>
          /log food/i.test(b.textContent ?? '') && getComputedStyle(b).position === 'fixed'
      )
    );
    expect(fixedFab, 'a fixed Log food button is the house we deleted').toBe(false);
  });
});
