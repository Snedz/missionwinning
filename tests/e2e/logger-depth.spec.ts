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

    // The picker is a sheet as of `.156` — it was an inline `max-h-48` list
    // competing with the session for height. One extra tap to open it; the
    // placeholder, the `option` rows, the `Selected:` line and the
    // `add selected exercise` name are all unchanged.
    await page.getByRole('button', { name: /^add exercise$/i }).click();

    const search = page.getByPlaceholder(/search exercises/i);
    await expect(search).toBeVisible();
    await search.fill('push-ups');
    await page.getByRole('option', { name: /push-ups/i }).first().click();
    await expect(page.getByText(/selected:\s*push-ups/i)).toBeVisible({ timeout: 5_000 });

    await page.getByRole('button', { name: /add selected exercise/i }).click();
    // Widened with the console recut in `.153` — see the note in first-90.
    const logBtn = page.getByRole('button', { name: /^log( set)?$/i }).first();
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

/**
 * The logger is the product. It must not blank.
 *
 * `.201` removed a `throw` from `MobileNav`'s render path and six
 * `activeWorkout!` assertions from `/active`'s handlers. Both were "safe" in the
 * sense that no known path reached them — but the app is fully client-rendered
 * with no nested `error.tsx` segment boundaries (`app/error.tsx:8-10`), so any
 * render throw blanks the whole route rather than degrading one component.
 *
 * Corrupt-storage resilience was unit-tested per parser and never end to end.
 * This is the outside view: whatever is in device storage, the logger renders
 * something a person can use.
 */
test.describe('Logger resilience @gate', () => {
  for (const [what, value] of [
    ['unparseable JSON', '{ not json at all'],
    ['valid JSON of the wrong shape', '{"state":{"activeWorkout":42},"version":0}'],
    ['a null active workout', '{"state":{"activeWorkout":null},"version":0}'],
    ['an active workout with no exercises array', '{"state":{"activeWorkout":{"id":"x"}},"version":0}'],
  ] as const) {
    test(`/active survives ${what} in persisted storage @gate`, async ({ page }) => {
      await seedLegacyOnboarding(page);
      await page.evaluate((raw) => {
        localStorage.setItem('workout-tracker-storage', raw);
      }, value);

      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));

      await page.goto('/active', { waitUntil: 'networkidle' });

      // Something usable rendered — not the generic error screen, and not a blank.
      await expect(page.locator('main, [role="main"]').first()).toBeVisible({ timeout: 15_000 });
      await expect(
        page.getByText(/something went wrong|unexpected error/i)
      ).toHaveCount(0);

      // And the bottom bar, which is the thing that used to take the app down.
      await expect(page.locator('nav[aria-label="Primary"]')).toBeVisible();

      expect(errors, `uncaught page errors: ${errors.join(' · ')}`).toEqual([]);
    });
  }
});
