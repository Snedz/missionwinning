import { test, expect } from '@playwright/test';
import { gateRequired, unlockGate } from './helpers/gate';
import { seedConfirmedLocale, seedLegacyOnboarding } from './helpers/journey';
import { dismissHouseOverlays, todayStart } from './helpers/houseChrome';

/**
 * Preview walk P0-1: on a phone, the analytics consent dialog must not
 * intercept Today's first-set Start. P0-2: Get-notified lives on `/notify`.
 *
 * `@gate` — first-set path. Does not add a tap to first-90. TAP_BUDGET stays 4.
 *
 * Landing does not remount the form (F-047). `/notify` is in
 * PRIVATE_GATE_PUBLIC_PATHS so this stays honest while PRIVATE_MODE is on.
 */

test.describe('Preview walk P0s @gate', () => {
  test.beforeEach(async ({ page, context, baseURL }) => {
    if (!baseURL) throw new Error('baseURL required');
    const ok = await unlockGate(page, context, baseURL);
    if (gateRequired() && !ok) {
      test.skip(true, 'SMOKE_ACCESS_SECRET required to unlock private gate');
    }
  });

  test('phone Today Start is clickable while the consent banner is showing', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await seedLegacyOnboarding(page);
    await page.goto('/log?mw_force_consent=1', { waitUntil: 'domcontentloaded' });

    const banner = page.locator('[data-mw-consent-banner]');
    await expect(banner).toBeVisible({ timeout: 15_000 });

    const start = todayStart(page);
    await expect(start).toBeVisible({ timeout: 15_000 });

    const startBox = await start.boundingBox();
    const bannerBox = await banner.boundingBox();
    expect(startBox, 'Start must have a box').toBeTruthy();
    expect(bannerBox, 'banner must have a box').toBeTruthy();
    if (!startBox || !bannerBox) return;

    expect(
      startBox.y + startBox.height,
      'Start bottom must sit above the consent banner'
    ).toBeLessThanOrEqual(bannerBox.y + 1);

    const hitIsStart = await start.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return !!(top && el.contains(top));
    });
    expect(hitIsStart, 'elementFromPoint at Start center must be the Start control').toBe(true);

    await start.click();
    await expect(page).toHaveURL(/\/active/, { timeout: 15_000 });
  });

  test('public notify page has a Get-notified form and no fake checkout', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    // Chooser fetches /api/geo then opens — dismiss-after-goto loses the race.
    await seedConfirmedLocale(page);
    await page.goto('/notify', { waitUntil: 'domcontentloaded' });
    await dismissHouseOverlays(page);

    const band = page.locator('[data-mw-launch-notify]');
    await expect(band).toBeVisible();
    const email = band.getByRole('textbox');
    await expect(email).toBeVisible();
    await expect(band.getByRole('button', { name: /notify me/i })).toBeVisible();

    await email.fill('walker@example.com');
    await band.getByRole('button', { name: /notify me/i }).click();
    await expect(page).not.toHaveURL(/stripe|checkout/i);
    await expect(page).toHaveURL(/\/notify/);
  });
});
