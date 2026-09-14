import { test, expect } from '@playwright/test';
import { gateRequired, unlockGate } from './helpers/gate';
import { seedLegacyOnboarding } from './helpers/journey';
import { startEmptyActiveWorkout } from './helpers/active';
import { todayDesk } from './helpers/houseChrome';

/**
 * The desktop app is handoff 2; the mobile app is handoff 3. They are two
 * designs, not one responsive design, and `useIsCompact()` (768px) is the line.
 *
 * This spec runs ONLY in the `desktop-chrome` project (1440×900) — see
 * playwright.config.ts. Everything else in tests/e2e runs at 390 and asserts
 * the mobile side, which is exactly why desktop went unguarded: `.159`–`.161`
 * each shipped desktop structure under a green suite that never rendered a
 * desktop viewport.
 *
 * These assert *structure*, not pixels — the handoff's screenshots are
 * examples, and each design is responsive within its own band.
 */
/**
 * Desktop adds an exercise inline at the foot of the list — the handoff's
 * `Add exercise — search 300+ movements` input. There is no sheet and no
 * top-of-screen trigger at md+, so this is deliberately NOT the flow
 * `logger-depth` drives at 390.
 */
async function addPushUpsInline(page: import('@playwright/test').Page) {
  const search = page.getByPlaceholder(/add exercise — search/i);
  await expect(search).toBeVisible({ timeout: 10_000 });
  await search.fill('push-ups');
  await page.getByRole('option', { name: /push-ups/i }).first().click();
  await page.getByRole('button', { name: /add selected exercise/i }).click();
}

test.describe('Desktop surface @gate', () => {
  test.beforeEach(async ({ page, context, baseURL }) => {
    if (!baseURL) throw new Error('baseURL required');
    const ok = await unlockGate(page, context, baseURL);
    if (gateRequired() && !ok) {
      test.skip(true, 'SMOKE_ACCESS_SECRET required to unlock private gate');
    }
    await seedLegacyOnboarding(page);
  });

  test('shell is the rail, not the tab bar', async ({ page }) => {
    await page.goto('/log');

    // House leftover desktop: side icon rail. Floor hides ≥723. More stays on
    // the rail (not a compact Search tab). The old AppLayout `aside` is gone.
    await expect(page.locator('nav.house-rail')).toBeVisible();
    await expect(page.locator('nav.house-floor')).toBeHidden();
    await expect(page.locator('nav.house-rail [data-house-rail-open="more"]')).toBeVisible();

    const brandButton = page.getByRole('button', { name: /mission winning/i });
    await expect(brandButton).toHaveCount(0);
  });

  test('add exercise is inline, not a sheet', async ({ page }) => {
    await startEmptyActiveWorkout(page);

    // The compact trigger that opens `AddExerciseSheet` is `md:hidden` — on
    // desktop the picker is already in the page, so a modal would be a second
    // entry point to the same action.
    await expect(page.getByRole('button', { name: /^add exercise$/i })).toBeHidden();
    await expect(page.getByPlaceholder(/add exercise — search/i)).toBeVisible();
  });

  test('Today fills the column instead of a phone measure', async ({ page }) => {
    await page.goto('/log');
    const shell = todayDesk(page);
    await expect(shell).toBeVisible();

    // `max-w-lg` is 512px. Desktop takes AppLayout's container, which is well
    // past that at 1440 — the exact value is a breakpoint decision, so this
    // asserts "not the phone measure" rather than a magic number.
    const width = await shell.evaluate((el) => el.getBoundingClientRect().width);
    expect(width).toBeGreaterThan(600);
  });

  test('logger enters the set in the row, not a docked console', async ({ page }) => {
    await startEmptyActiveWorkout(page);

    await addPushUpsInline(page);

    // The handoff's table: Set · Prev · kg · Reps · (action).
    const table = page.locator('table').first();
    await expect(table).toBeVisible({ timeout: 10_000 });
    await expect(table.locator('thead th')).toContainText([/set/i, /prev/i]);

    // Entry is inline on the active row — two inputs, one Log set.
    await expect(table.locator('tbody input')).toHaveCount(2);
    await expect(page.getByRole('button', { name: /^log set$/i })).toHaveCount(1);

    // Honest empty: Prev is the dash, not an invented load.
    await expect(page.getByTestId('set-table-prev').first()).toHaveAttribute(
      'data-prev-anchor',
      'empty'
    );
    await expect(page.getByTestId('set-table-target')).toHaveCount(0);

    // And the dock is empty: a docked console here would be a second place to
    // type the same number.
    const dockChildren = await page.evaluate(
      () => document.getElementById('screen-dock')?.children.length ?? -1
    );
    expect(dockChildren).toBe(0);
  });

  test('set kind stays reachable without the console', async ({ page }) => {
    // Regression guard. The warm-up/failure/drop chips lived inside
    // `LogConsole`; making the console compact-only silently removed every way
    // to mark a set kind on desktop, and no suite noticed because no suite ran
    // at desktop width.
    await startEmptyActiveWorkout(page);

    await addPushUpsInline(page);

    // Just Go first paint already has a set table — several Warmup chips.
    // Kind lives on the row (`set-table-tag-warmup`), not in a docked console.
    const warmup = page.getByTestId('set-table-tag-warmup').first();
    await expect(warmup).toBeVisible({ timeout: 10_000 });

    /*
     * ...and specifically NOT from the docked console. A falsification probe
     * (forcing `useIsCompact` true) showed the bare visibility check above
     * passing for the wrong reason: the console renders its own kind chips, so
     * the assertion was satisfied by the mobile surface leaking in. Anchoring
     * it outside `#screen-dock` is what makes this a desktop guard.
     */
    const insideDock = await warmup.evaluate(
      (el) => !!el.closest('#screen-dock')
    );
    expect(insideDock).toBe(false);
  });
});
