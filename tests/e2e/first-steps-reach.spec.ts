import { test, expect } from '@playwright/test';
import { seedLegacyOnboarding } from './helpers/journey';

/**
 * The checklist is still reachable after the athlete dismisses it.
 *
 * `.240` shipped First Steps with one mount — a Today card whose Dismiss writes
 * `mw_first_steps_dismissed` through `useDismissed`, which **never clears** — and
 * which also retires itself on completion. Both endings terminal, and no reset
 * control anywhere in the app.
 *
 * [`firstStepsReachable.test.ts`](../../src/lib/journey/firstStepsReachable.test.ts)
 * asserts the structural half: more than one mount, and at least one that does
 * not read the dismiss key. That is a claim about **source**, and a component can
 * satisfy it behind a condition that is never true — the vacuity `.220` names. So
 * this asserts the claim a beta tester actually cares about, in a browser: open
 * More, dismiss from Today, open More again, and the checklist is still there.
 *
 * It also pins the other half of the rule, which is easier to get wrong: the row
 * **leaves** when every step is done. A permanent row on a permanent surface that
 * says a finished thing is unfinished is the reference app's notification-centre
 * defect in miniature — a row carrying no information, forever.
 */

async function openMore(page: import('@playwright/test').Page) {
  // networkidle, not domcontentloaded: More is the one slot in the bar that is a
  // button rather than a link, so it does nothing until React has hydrated.
  await page.goto('/log', { waitUntil: 'networkidle' });
  await page
    .getByRole('navigation', { name: /primary/i })
    .getByRole('button', { name: /more/i })
    .click();
  const sheet = page.getByRole('dialog');
  await expect(sheet).toBeVisible();
  return sheet;
}

test.describe('First Steps reachability @gate', () => {
  test('the checklist lives in More and survives being dismissed @gate', async ({ page }) => {
    await seedLegacyOnboarding(page);

    const before = await openMore(page);
    await expect(before.getByText(/your first steps/i).first()).toBeVisible();
    // The segmented readout, not just the heading — a row with a meter stuck at
    // nothing would pass a text check while telling the athlete nothing.
    await expect(before.getByText(/\d\s*\/\s*\d/).first()).toBeVisible();

    // Exactly what the Today card's Dismiss control writes, and all it writes.
    await page.evaluate(() => localStorage.setItem('mw_first_steps_dismissed', '1'));

    const after = await openMore(page);
    await expect(
      after.getByText(/your first steps/i).first(),
      'dismissing from Today must move the checklist, not delete it'
    ).toBeVisible();
  });

  test('the row leaves once every step is done @gate', async ({ page }) => {
    await seedLegacyOnboarding(page);
    await page.addInitScript(() => {
      const now = new Date().toISOString();
      localStorage.setItem(
        'workout-tracker-storage',
        JSON.stringify({
          state: {
            workoutHistory: [
              {
                id: 'w1',
                workoutName: 'Session',
                completedAt: now,
                durationSeconds: 600,
                totalVolume: 1000,
                totalSets: 4,
                exercises: [],
              },
            ],
            savedWorkouts: [],
            activeWorkout: null,
          },
          version: 0,
        })
      );
      localStorage.setItem('mw_nutrition_log', JSON.stringify([{ protein: 30, at: now }]));
      localStorage.setItem('mw_mind_checkins', JSON.stringify([{ at: now }]));
      localStorage.setItem(
        'mw_pillar_wins',
        JSON.stringify([{ id: '1', pillar: 'move', title: 'flow', completedAt: now }])
      );
      localStorage.setItem('mw_learn_completed', JSON.stringify(['strength-basics']));
      // The sixth step, and the one `.243` fixed: this used to stay unticked for a
      // Basic-phase athlete until a workout existed.
      localStorage.setItem('mw_last_assessment', JSON.stringify({ risk: 'low', date: '2026-01-01' }));
    });

    const sheet = await openMore(page);
    await expect(sheet.getByText(/all screens/i).first()).toBeVisible();
    await expect(
      sheet.getByText(/your first steps/i),
      'a completed checklist must not hold a permanent row'
    ).toHaveCount(0);
  });
});
