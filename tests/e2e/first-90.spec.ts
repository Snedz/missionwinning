import { test, expect } from '@playwright/test';
import { gateRequired, unlockGate } from './helpers/gate';
import { seedLegacyOnboarding } from './helpers/journey';

/**
 * The first 90 seconds, as a budget rather than an opinion.
 *
 * Horizon W excellence criteria 1, 2 and 5 all live or die here: a cold visitor
 * should reach a logged set in a handful of taps, with one obvious thing to do on
 * each screen and no interstitial in the way. Regressions in this path are the most
 * expensive kind, so they get a failing test instead of a design review.
 */

/** Taps from a cold /welcome to a set on the board. Lower is better; never raise this. */
const TAP_BUDGET = 6;

test.describe('First 90 seconds @gate', () => {
  test.beforeEach(async ({ page, context, baseURL }) => {
    if (!baseURL) throw new Error('baseURL required');
    const ok = await unlockGate(page, context, baseURL);
    if (gateRequired() && !ok) {
      test.skip(true, 'SMOKE_ACCESS_SECRET required to unlock private gate');
    }
  });

  test('a cold visitor logs a set within the tap budget, with no interstitial', async ({
    page,
  }) => {
    let taps = 0;
    const tap = async (locator: import('@playwright/test').Locator, what: string) => {
      await expect(locator, `${what} should be reachable`).toBeVisible({ timeout: 15_000 });
      await locator.click();
      taps += 1;
    };

    // Genuinely cold: no seeded onboarding, no history.
    await page.goto('/welcome', { waitUntil: 'domcontentloaded' });

    await tap(page.getByRole('button', { name: /^begin$/i }).first(), 'Begin');
    await tap(page.getByRole('button', { name: /continue|continuar/i }).first(), 'Continue');
    await tap(
      page.getByRole('button', { name: /skip|omitir|first session/i }).first(),
      'Skip sign-in'
    );

    await expect(page).toHaveURL(/\/active/, { timeout: 15_000 });

    // Nothing may stand between arriving and logging. A check-in sheet here would be
    // an interstitial on the very first session (W1) — assert it is absent rather
    // than dismissing it, which is what made this regress before.
    await expect(
      page.getByRole('button', { name: /not now/i }),
      'no modal may intercept the first session'
    ).toHaveCount(0);

    const logBtn = page.getByRole('button', { name: /^log$/i }).first();
    await tap(logBtn, 'Log');

    // A logged set is visible progress, not a silent state change.
    await expect(page.getByRole('timer', { name: /rest/i })).toBeVisible({ timeout: 10_000 });

    expect(taps, `first set took ${taps} taps (budget ${TAP_BUDGET})`).toBeLessThanOrEqual(
      TAP_BUDGET
    );
  });

  test('the homepage uses the brand display face and one emerald action', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Regression: the hero H1 rendered in Inter for months because LandingPage set
    // ad-hoc type instead of `.display-hero`, while every other marketing page used
    // the briefing system. brand-guidelines.md assigns hero titles to Barlow Condensed.
    const font = await page
      .locator('h1')
      .first()
      .evaluate((el) => getComputedStyle(el).fontFamily);
    expect(font, `hero H1 font-family was ${font}`).toContain('Barlow Condensed');

    // Emerald marks the one action. Hero + closing band is the ceiling; a third
    // competing CTA is the "which button do I press" failure.
    await expect(page.locator('.primary-action')).toHaveCount(2);
  });

  test('the hero demo lets a visitor perform the product claim', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // The claim is "your week rewrites itself". If logging a set does not change what
    // the page says next, the homepage is asserting something it never shows.
    const logSet = page.getByRole('button', { name: /log set/i });
    await expect(logSet).toBeVisible({ timeout: 15_000 });
    for (let i = 0; i < 3; i++) await logSet.click();

    await expect(page.getByText(/next session/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test('Today offers exactly one primary action', async ({ page }) => {
    await page.goto('/log', { waitUntil: 'domcontentloaded' });
    // Two competing emerald CTAs is the "empty dashboard / chore list" failure mode.
    await expect(page.locator('.primary-action')).toHaveCount(1);
  });

  test('every control on the logger is thumb-sized', async ({ page }) => {
    // JourneyGuard sends a cold visitor to /welcome; this case is about an
    // established user opening the Train tab.
    await seedLegacyOnboarding(page);
    await page.goto('/active', { waitUntil: 'networkidle' });
    const start = page.getByRole('button', { name: /start workout/i });
    await expect(start).toBeEnabled({ timeout: 15_000 });
    await start.click();

    const search = page.getByPlaceholder(/search exercises/i);
    await expect(search).toBeVisible({ timeout: 10_000 });
    await search.fill('push-ups');
    await page.getByRole('option', { name: /push-ups/i }).first().click();
    await page.getByRole('button', { name: /add selected exercise/i }).click();

    await expect(page.getByRole('button', { name: /^log$/i }).first()).toBeVisible({
      timeout: 10_000,
    });

    // 44px is the floor for one-thumb use outdoors. Checked on the real rendered
    // boxes rather than trusting a utility class to still be applied. Scoped to the
    // logging surface — the ± steppers and Log are what you press holding a bar.
    const undersized: string[] = [];
    const buttons = await page.locator('main button, [role="main"] button').all();
    for (const button of buttons) {
      if (!(await button.isVisible().catch(() => false))) continue;
      const box = await button.boundingBox();
      if (!box) continue;
      // Ignore genuinely inline affordances with no independent hit area.
      if (box.width === 0 || box.height === 0) continue;
      if (box.height < 44) {
        undersized.push(`${(await button.textContent())?.trim().slice(0, 24)} h=${Math.round(box.height)}`);
      }
    }
    expect(undersized, `controls under 44px tall: ${undersized.join(', ')}`).toEqual([]);
  });
});
