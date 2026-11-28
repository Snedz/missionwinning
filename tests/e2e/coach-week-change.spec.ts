import { expect, test, type Page } from '@playwright/test';
import { join } from 'node:path';
import { gateRequired, unlockGate } from './helpers/gate';
import { seedConfirmedLocale, seedLegacyOnboarding } from './helpers/journey';
import { startEmptyActiveWorkout } from './helpers/active';
import { leaveVictoryTowardToday } from './helpers/houseChrome';

async function logLunges(page: Page, weight: string, reps: string) {
  await startEmptyActiveWorkout(page);
  const search = page.getByPlaceholder(/search exercises/i);
  await expect(async () => {
    if (!(await search.isVisible())) await page.getByRole('button', { name: /^add exercise$/i }).click();
    await expect(search).toBeVisible({ timeout: 1_500 });
  }).toPass({ timeout: 10_000 });
  await search.fill('Lunges');
  await page.getByRole('option', { name: /^lunges/i }).first().click({ timeout: 10_000 });
  await page.getByRole('button', { name: /add selected exercise/i }).click();
  const cards = page.getByTestId('active-exercise-card');
  const exercise = cards.and(page.locator('[data-exercise-id="lunges"]'));
  const entry = exercise.getByTestId('set-table-open-load');
  const active = cards.filter({ has: page.getByTestId('set-table-log-set') });
  while (!(await entry.isVisible()) && (await active.count()) === 1) {
    const index = await active.getAttribute('data-ex-idx');
    const skip = active.getByTestId('active-skip-exercise');
    await skip.press('Enter');
    await skip.press('Enter');
    await expect(active).not.toHaveAttribute('data-ex-idx', index!);
  }
  await entry.fill(weight, { timeout: 10_000 });
  await exercise.getByRole('textbox', { name: /^reps$/i }).fill(reps);
  await exercise.getByTestId('set-table-log-set').click();
  await expect(page.getByRole('timer', { name: /rest/i })).toBeVisible();
  await page.getByRole('button', { name: /finish/i }).first().click();
  await leaveVictoryTowardToday(page);
}

async function rebuildWeek(page: Page) {
  await page.getByTestId('coach-show-all').click();
  await page.getByRole('button', { name: 'Manage this week' }).click();
  const rebuild = page.getByRole('button', { name: /regenerate week plan/i });
  await rebuild.press('Enter');
  await rebuild.press('Enter');
}

test('guest rebuild shows earlier and new targets with the heavier set from the log @gate', async ({ page, context, baseURL }) => {
  if (!baseURL) throw new Error('baseURL required');
  const unlocked = await unlockGate(page, context, baseURL);
  test.skip(gateRequired() && !unlocked, 'SMOKE_ACCESS_SECRET required to unlock private gate');
  await page.clock.setFixedTime(new Date(2026, 10, 23, 12));
  await seedConfirmedLocale(page);
  await seedLegacyOnboarding(page);
  await page.evaluate(() => {
    localStorage.setItem('mw_equipment', 'dumbbells');
    localStorage.setItem('mw_units', 'metric');
    localStorage.setItem('mw_units_explicit', '1');
    localStorage.setItem('mw_device_id', 'coach-diff-e2e');
    localStorage.setItem('mw_preferred_days', '[1,3,5]');
    localStorage.setItem('mw_last_assessment', JSON.stringify({ risk: 'low', date: '2026-11-23' }));
  });

  await logLunges(page, '22.5', '8');
  await page.goto('/coach');
  const panel = page.getByRole('region', { name: 'What changed and why' });
  await expect(panel).toHaveCount(0);
  await rebuildWeek(page);
  await expect(page.getByText(/Lunges.*22\.5\s?kg/).first()).toBeVisible();
  await page.clock.setFixedTime(new Date(2026, 10, 23, 13));
  await logLunges(page, '27.5', '10');

  await page.goto('/coach');
  await rebuildWeek(page);
  await expect(panel).toContainText('Latest rebuild');
  const row = panel.getByRole('listitem').filter({ hasText: 'Lunges' }).first();
  await expect(row).toContainText(/Before.*sets.*reps.*22\.5 kg/);
  await expect(row).toContainText(/After.*sets.*reps.*27\.5 kg/);
  await expect(row.getByTestId('coach-week-change-saved-set')).toContainText('10 reps at 27.5 kg');
  await page.reload();
  await expect(panel).toBeVisible();

  const shots = process.env.COACH_WEEK_CHANGE_SHOTS;
  if (shots) {
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      await panel.evaluate((section) => {
        section.scrollIntoView({ block: 'start', behavior: 'instant' });
      });
      await page.screenshot({ path: join(shots, `${width}-coach-week-change.png`) });
    }
  }
});
