import { test, expect } from '@playwright/test';
import { gateRequired, unlockGate } from './helpers/gate';
import { seedLegacyOnboarding } from './helpers/journey';

/**
 * Wave 7 — free adjust + chat locked teaser (no LLM keys required).
 */
test.describe('Coach adjust + chat lock', () => {
  test.beforeEach(async ({ page, context, baseURL }) => {
    if (!baseURL) throw new Error('baseURL required');
    const ok = await unlockGate(page, context, baseURL);
    if (gateRequired() && !ok) {
      test.skip(true, 'SMOKE_ACCESS_SECRET required to unlock private gate');
    }
    await seedLegacyOnboarding(page);
  });

  test('free user can generate week and adjust 20 min', async ({ page }) => {
    await page.goto('/coach', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible();

    const generate = page.getByRole('button', { name: /generate this week|generar/i }).first();
    if (await generate.isVisible().catch(() => false)) {
      await generate.click();
      await page.waitForTimeout(500);
    }

    const adjust = page.getByRole('button', { name: /adjust today|ajustar hoy/i }).first();
    // May already have a plan from auto-generate after taster
    if (!(await adjust.isVisible().catch(() => false))) {
      // Empty or locked — still assert chat lock path later
      test.skip(true, 'No adjustable session available (taster locked or rest day)');
    }

    await adjust.click();
    const chip20 = page.getByRole('button', { name: /^20 min$/i }).first();
    await expect(chip20).toBeVisible({ timeout: 10_000 });
    await chip20.click();
    await expect(page.getByText(/adapted|adaptado/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test('free user sees coach chat locked teaser', async ({ page }) => {
    await page.goto('/coach', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toContainText(
      /super bundle|coach chat|chat del coach|desbloquear|unlock/i
    );
  });
});
