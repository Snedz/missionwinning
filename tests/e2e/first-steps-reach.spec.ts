import { test, expect } from '@playwright/test';
import { seedLegacyOnboarding } from './helpers/journey';
import { openHouseMore, todayDesk } from './helpers/houseChrome';

/**
 * Today is the next workout and one number — not a first-rooms checklist,
 * and not a First Steps row inside More.
 */

test.describe('First Steps reachability @gate', () => {
  test('the week count lives on the desk, not a checklist in More @gate', async ({ page }) => {
    await seedLegacyOnboarding(page);
    await page.goto('/log', { waitUntil: 'domcontentloaded' });

    const desk = todayDesk(page);
    await expect(desk).toBeVisible({ timeout: 15_000 });
    const count = page.getByTestId('today-week-count');
    await expect(count).toBeVisible();
    await expect(count).toHaveText(/\d+/);

    const { sheet } = await openHouseMore(page);
    await expect(
      sheet.getByText(/your first steps/i),
      'leftover More is rooms + quiet pillars, not the retired First Steps row'
    ).toHaveCount(0);
  });

  test('dismissing the retired First Steps key does not hide the week count @gate', async ({
    page,
  }) => {
    await seedLegacyOnboarding(page);
    await page.goto('/log', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => localStorage.setItem('mw_first_steps_dismissed', '1'));
    await page.reload({ waitUntil: 'domcontentloaded' });

    await expect(page.getByTestId('today-week-count')).toBeVisible();
  });
});
