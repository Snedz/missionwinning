import { test, expect } from '@playwright/test';
import { gateRequired, unlockGate } from './helpers/gate';
import { seedLegacyOnboarding } from './helpers/journey';

/**
 * Deeper /active logger path: empty start → pick exercise → log set → rest chrome.
 * Complements hero-flows (learn sample + empty finish toast).
 */
test.describe('Logger depth', () => {
  test.beforeEach(async ({ page, context, baseURL }) => {
    if (!baseURL) throw new Error('baseURL required');
    const ok = await unlockGate(page, context, baseURL);
    if (gateRequired() && !ok) {
      test.skip(true, 'SMOKE_ACCESS_SECRET required to unlock private gate');
    }
    await seedLegacyOnboarding(page);
  });

  test('start empty, add push-ups, log set, rest timer, skip rest, finish', async ({ page }) => {
    await page.goto('/active', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /start workout/i }).click();
    await expect(page.getByRole('button', { name: /^finish$/i })).toBeVisible({ timeout: 10_000 });

    const search = page.getByPlaceholder(/search exercises/i);
    await expect(search).toBeVisible();
    await search.fill('push-ups');
    await page.getByRole('option', { name: /push-ups/i }).first().click();
    await expect(page.getByText(/selected:\s*push-ups/i)).toBeVisible({ timeout: 5_000 });

    await page.getByRole('button', { name: /add selected exercise/i }).click();
    const logBtn = page.getByRole('button', { name: /^log$/i }).first();
    await expect(logBtn).toBeVisible({ timeout: 10_000 });
    await logBtn.click();

    await expect(page.getByText('Set logged!', { exact: true })).toBeVisible({ timeout: 10_000 });

    const rest = page.getByRole('timer');
    await expect(rest).toBeVisible({ timeout: 10_000 });
    await expect(rest).toContainText(/rest/i);

    await page.getByRole('button', { name: /^skip$/i }).click();
    await expect(rest).toBeHidden({ timeout: 5_000 });

    await page.getByRole('button', { name: /^finish$/i }).click();
    await expect(page.getByRole('button', { name: /back to today/i })).toBeVisible({
      timeout: 15_000,
    });
  });
});
