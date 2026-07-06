import { test, expect } from '@playwright/test';
import { gateRequired, unlockGate } from './helpers/gate';
import { seedLegacyOnboarding } from './helpers/journey';

test.describe('Premium pillar experiences', () => {
  test.beforeEach(async ({ page, context, baseURL }) => {
    if (!baseURL) throw new Error('baseURL required');
    const ok = await unlockGate(page, context, baseURL);
    if (gateRequired() && !ok) {
      test.skip(true, 'SMOKE_ACCESS_SECRET required to unlock private gate');
    }
    await seedLegacyOnboarding(page);
  });

  test('Mind page shows guided session player', async ({ page }) => {
    await page.goto('/mind', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('button', { name: /^start$/i }).first()).toBeVisible();
    await expect(page.getByText(/free guided sessions/i)).toBeVisible();
  });

  test('Move page lists flows and starts player', async ({ page }) => {
    await page.goto('/move', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('button', { name: /start flow/i }).first()).toBeVisible();
    await page.getByRole('button', { name: /start flow/i }).first().click();
    await expect(page.getByRole('button', { name: /start/i }).first()).toBeVisible();
  });

  test('Learn shows locked preview or course link', async ({ page }) => {
    await page.goto('/learn', { waitUntil: 'domcontentloaded' });
    const body = await page.textContent('body');
    expect(body).toMatch(/specialist|premium|guidebook|course/i);
  });

  test('free user sees mind locked preview', async ({ page }) => {
    await page.goto('/mind', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText(/super bundle|premium/i).first()).toBeVisible();
  });
});
