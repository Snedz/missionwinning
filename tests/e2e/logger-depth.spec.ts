import { test, expect } from '@playwright/test';
import { gateRequired, unlockGate } from './helpers/gate';
import { seedLegacyOnboarding } from './helpers/journey';
import { startEmptyActiveWorkout } from './helpers/active';

/**
 * Deeper /active logger path: empty start → pick exercise → log set → rest chrome.
 * Complements hero-flows (learn sample + empty finish toast).
 */
test.describe('Logger depth @gate', () => {
  test.beforeEach(async ({ page, context, baseURL }) => {
    if (!baseURL) throw new Error('baseURL required');
    const ok = await unlockGate(page, context, baseURL);
    if (gateRequired() && !ok) {
      test.skip(true, 'SMOKE_ACCESS_SECRET required to unlock private gate');
    }
    await seedLegacyOnboarding(page);
  });

  test('start empty, add push-ups, log set, rest timer, skip rest, finish', async ({ page }) => {
    await startEmptyActiveWorkout(page);

    const search = page.getByPlaceholder(/search exercises/i);
    await expect(search).toBeVisible();
    await search.fill('push-ups');
    await page.getByRole('option', { name: /push-ups/i }).first().click();
    await expect(page.getByText(/selected:\s*push-ups/i)).toBeVisible({ timeout: 5_000 });

    await page.getByRole('button', { name: /add selected exercise/i }).click();
    const logBtn = page.getByRole('button', { name: /^log$/i }).first();
    await expect(logBtn).toBeVisible({ timeout: 10_000 });
    await logBtn.click();

    // Routine set feedback = completed row + rest timer (toast removed in D0).
    const rest = page.getByRole('timer', { name: /rest/i });
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
