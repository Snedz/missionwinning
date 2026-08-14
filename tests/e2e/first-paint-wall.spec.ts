import { test, expect } from '@playwright/test';

/**
 * The first paint of www belongs to the product, not to a dialog.
 *
 * `.770` — measured on a production build with the gate up: the first-visit
 * language sheet (`LocaleCountryChooser`) opened itself over the gate poster at
 * `z-[70]` with a full-viewport scrim. `elementsFromPoint` at the centre of the
 * poster's "Log a set" button returned the sheet, and a click on that button
 * timed out — visible, enabled, and unreachable. Shard 1 (ops #16) had already
 * named a gate before any value as its single biggest theme; this was one, in
 * front of the free logger.
 *
 * A source guard cannot see this (`src/lib/i18n/firstPaintWall.test.ts` proves
 * the rule, not the render), and the byte-level smoke cannot either, because the
 * sheet is client-rendered after `/api/geo` answers. It takes a cold browser.
 *
 * `@gate` — first-paint path. Adds no tap to the first-90 budget.
 */

test.describe('first paint is not a wall @gate', () => {
  test.beforeEach(async ({ context }) => {
    // A cold visitor: no confirmed locale, no gate cookie, nothing remembered.
    await context.clearCookies();
  });

  test('the gate poster owns its own first paint, and Log a set is tappable', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/private', { waitUntil: 'domcontentloaded' });

    const cta = page.locator('[data-mw-free-logger]').first();
    await expect(cta).toBeVisible({ timeout: 15_000 });

    /*
     * Give any self-opening overlay time to appear. The old sheet waited on
     * /api/geo, so asserting immediately after load would have passed even then.
     */
    await page.waitForTimeout(1_500);

    await expect(
      page.getByRole('dialog', { name: /language and country/i }),
      'nothing may open itself over the poster on arrival'
    ).toHaveCount(0);

    const hitIsCta = await cta.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return !!(top && (el === top || el.contains(top)));
    });
    expect(hitIsCta, 'elementFromPoint at the CTA centre must be the CTA itself').toBe(true);

    await cta.click({ timeout: 10_000 });
    await expect(page).toHaveURL(/\/welcome/, { timeout: 15_000 });
  });

  test('the language sheet is still reachable, on request', async ({ page }) => {
    // Removing the wall must not remove the door: the gate carries the only
    // route from www to the other 39 languages.
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/private', { waitUntil: 'domcontentloaded' });

    const opener = page.locator('[data-mw-locale-open]').first();
    await expect(opener).toBeVisible({ timeout: 15_000 });
    await opener.click();

    const sheet = page.getByRole('dialog', { name: /language and country/i });
    await expect(sheet).toBeVisible({ timeout: 15_000 });
    await expect(sheet.locator('#mw-locale-lang')).toBeVisible();
  });
});
