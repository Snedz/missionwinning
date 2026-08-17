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
    await page.getByTestId('mind-show-all').click();
    await expect(page.getByRole('button', { name: /^start$/i }).first()).toBeVisible();
    /*
     * `.257` — the heading is **"Guided sessions"**. This asserted an anchored
     * `/^free guided sessions$/i`, which the page has not rendered since the
     * word "Free" moved out of the heading and into the body copy beneath it
     * ("Free guided patterns — no audio required"). The player assertion above
     * passed the whole time; only the exact string failed, and it failed the
     * first time this spec was ever executed.
     *
     * Still anchored rather than loosened to a substring: `/guided/` would also
     * match "Browse guided sessions" and "Try a guided session", both of which
     * are links elsewhere on the page, and an assertion that cannot tell a
     * section heading from a call to action is not asserting the section
     * exists.
     */
    await expect(page.getByRole('heading', { name: /guided sessions/i })).toBeVisible();
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
    await page.getByTestId('mind-show-all').click();
    await expect(page.getByText(/super bundle|premium/i).first()).toBeVisible();
  });

  test('free user sees Fuel Coach locked preview on nutrition', async ({ page }) => {
    await page.goto('/nutrition', { waitUntil: 'networkidle' });
    const more = page.getByRole('button', { name: /search, barcode & recipes/i });
    await expect(more).toBeVisible({ timeout: 10_000 });
    await more.scrollIntoViewIfNeeded();
    await expect(async () => {
      if (await more.isVisible().catch(() => false)) {
        await more.click();
      }
      await expect(
        page.getByText(/fuel coach/i).first()
      ).toBeVisible({ timeout: 3_000 });
    }).toPass({ timeout: 20_000 });
    await expect(page.getByText(/super bundle|premium|unlock/i).first()).toBeVisible();
  });
});
