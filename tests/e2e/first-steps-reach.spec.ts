import { test, expect } from '@playwright/test';
import { seedLegacyOnboarding } from './helpers/journey';
import { openHouseMore, todayDesk } from './helpers/houseChrome';

/**
 * First rooms live on the house desk — not in More, not behind Search.
 *
 * The retired More/Search tour (`nav[aria-label=Primary]`) is gone. House
 * leftover mounts `HouseFirstRoomsCard` on Today (`today-first-steps`) and
 * lists leftover rooms in More. The old First Steps sheet still has structural
 * doors on TodayShowAll / Profile (`firstStepsReachable.test.ts`); this spec
 * asserts the leftover first paint a tester actually sees.
 */

test.describe('First Steps reachability @gate', () => {
  test('first rooms live on the desk, not in More @gate', async ({ page }) => {
    await seedLegacyOnboarding(page);
    await page.goto('/log', { waitUntil: 'networkidle' });

    const desk = todayDesk(page);
    await expect(desk).toBeVisible({ timeout: 15_000 });
    const rooms = page.getByTestId('today-first-steps');
    await expect(rooms).toBeVisible();
    await expect(rooms.getByText(/\d+\s+of\s+\d+/i).first()).toBeVisible();

    const { sheet } = await openHouseMore(page);
    await expect(
      sheet.getByText(/your first steps/i),
      'leftover More is rooms + quiet pillars, not the retired First Steps row'
    ).toHaveCount(0);
  });

  test('dismissing the retired First Steps key does not delete first rooms @gate', async ({
    page,
  }) => {
    await seedLegacyOnboarding(page);
    await page.goto('/log', { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.setItem('mw_first_steps_dismissed', '1'));
    await page.reload({ waitUntil: 'networkidle' });

    await expect(
      page.getByTestId('today-first-steps'),
      'house first rooms use their own collapse key, not mw_first_steps_dismissed'
    ).toBeVisible();
  });
});
