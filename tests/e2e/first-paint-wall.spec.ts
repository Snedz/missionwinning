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
 * **Runs in both gate configurations rather than skipping in one.** The sheet
 * mounted from the root provider, so it covered whichever surface a stranger
 * landed on: `/private` when `PRIVATE_MODE` is on, `/` when it is off. The gate
 * builds with `PRIVATE_MODE=false`, and a guard that skips there would be a guard
 * that never ran — so this follows `/` to wherever the deployment sends it and
 * asserts against that surface. `.213`: a skipped check is not a passed check.
 *
 * `@gate` — first-paint path. Adds no tap to the first-90 budget.
 */

/** Where a stranger actually lands, and that surface's primary action. */
async function entrySurface(page: import('@playwright/test').Page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const gated = new URL(page.url()).pathname.startsWith('/private');
  return {
    gated,
    cta: gated
      ? page.locator('[data-mw-free-logger]').first()
      : page.locator('.primary-action').first(),
  };
}

test.describe('first paint is not a wall @gate', () => {
  test.beforeEach(async ({ context }) => {
    // A cold visitor: no confirmed locale, no gate cookie, nothing remembered.
    await context.clearCookies();
  });

  test('the entry surface owns its own first paint, and its action is tappable', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const { gated, cta } = await entrySurface(page);
    await expect(cta, `no primary action on the entry surface (gated=${gated})`).toBeVisible({
      timeout: 15_000,
    });

    /*
     * Give any self-opening overlay time to appear. The old sheet waited on
     * /api/geo, so asserting immediately after load would have passed even then.
     */
    await page.waitForTimeout(1_500);

    await expect(
      page.getByRole('dialog', { name: /language and country/i }),
      'nothing may open itself over the first screen on arrival'
    ).toHaveCount(0);

    const hitIsCta = await cta.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return !!(top && (el === top || el.contains(top)));
    });
    expect(hitIsCta, 'elementFromPoint at the action centre must be the action itself').toBe(
      true
    );

    await cta.click({ timeout: 10_000 });
  });

  test('the language choice is still reachable on the entry surface', async ({ page }) => {
    /*
     * Removing the wall must not remove the door, in either configuration. The
     * gate poster had no language control of its own, and the landing page had
     * none either — `LocaleCountryControl` only ever reached `/bundle` and
     * `/press` — so both entry surfaces carry the trigger now.
     */
    await page.setViewportSize({ width: 390, height: 844 });
    const { gated } = await entrySurface(page);

    const opener = page.locator('[data-mw-locale-open]').first();
    await expect(opener, `no language control on the entry surface (gated=${gated})`).toBeVisible(
      { timeout: 15_000 }
    );
    await opener.click();

    const sheet = page.getByRole('dialog', { name: /language and country/i });
    await expect(sheet).toBeVisible({ timeout: 15_000 });
    await expect(sheet.locator('#mw-locale-lang')).toBeVisible();
  });
});
