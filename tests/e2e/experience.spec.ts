import { test, expect } from '@playwright/test';
import { gateRequired, unlockGate } from './helpers/gate';

test.describe('Mission Experience', () => {
  test.beforeEach(async ({ page, context, baseURL }) => {
    if (!baseURL) throw new Error('baseURL required');
    const ok = await unlockGate(page, context, baseURL);
    if (gateRequired() && !ok) {
      test.skip(true, 'SMOKE_ACCESS_SECRET required to unlock private gate');
    }
  });

  test('static tier renders chapter copy without canvases', async ({ page }) => {
    await page.goto('/experience?tier=static', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible();

    await expect(page.getByRole('heading', { level: 1 })).toContainText(/video|code|everything/i);
    await expect(page.locator('body')).toContainText(/The Why|Why we build|mission/i);
    await expect(page.locator('body')).toContainText(/Win Score|Score|set/i);
    await expect(page.locator('table.xp-matrix, .xp-matrix').first()).toBeVisible({
      timeout: 15_000,
    });

    const canvases = page.locator('canvas');
    await expect(canvases).toHaveCount(0);
  });

  test('default experience loads without page errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/experience', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(errors, errors.join('\n')).toEqual([]);
  });
});
