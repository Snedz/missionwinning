import { expect, test, type Page } from '@playwright/test';
import { logSetButton, startEmptyActiveWorkout } from './helpers/active';
import { gateRequired, unlockGate } from './helpers/gate';
import { dismissHouseOverlays } from './helpers/houseChrome';
import { seedLegacyOnboarding } from './helpers/journey';

test.use({ serviceWorkers: 'block' });

async function logGuestSet(page: Page) {
  await startEmptyActiveWorkout(page);
  await dismissHouseOverlays(page);
  await page.getByRole('textbox', { name: 'Reps', exact: true }).first().fill('6');
  await logSetButton(page).first().click();
  await page.getByTestId('rest-skip').click();
}

async function seedLunges(page: Page, weight: number, whyKey: string, weightUnits?: 'metric' | 'imperial') {
  await page.addInitScript(({ weight, whyKey, weightUnits }) => {
    if (weightUnits === 'metric') localStorage.setItem('mw_units', 'imperial');
    localStorage.setItem('workout-tracker-storage', JSON.stringify({
      version: 1,
      state: {
        activeWorkout: {
          workoutName: 'Lunges',
          startedAt: new Date().toISOString(),
          exercises: [{ exerciseId: 'lunges', sets: [{ weight: 30, reps: 6, completed: true }] }],
        },
      },
    }));
    localStorage.setItem('mw_coach_plan', JSON.stringify({
      weekStart: '2026-11-23',
      revision: 1,
      daysPerWeek: 3,
      generatedAt: new Date().toISOString(),
      contextHash: 'review-fixture',
      equipmentProfile: 'bodyweight',
      sessions: [4, 6].map((dayOffset) => ({
        id: `strength-${dayOffset}`,
        dayOffset,
        kind: 'strength',
        status: 'planned',
        name: 'Strength',
        focusGroups: ['Legs'],
        estMinutes: 20,
        exercises: [{ exerciseId: 'lunges', sets: 3, reps: 8, weight, whyKey, weightUnits }],
      })),
    }));
  }, { weight, whyKey, weightUnits });
  await page.goto('/active', { waitUntil: 'domcontentloaded' });
  await dismissHouseOverlays(page);
  const skipCheckIn = page.getByRole('button', { name: /not now/i });
  if (await skipCheckIn.isVisible()) await skipCheckIn.click();
}

test.describe('Victory Next time @gate', () => {
  test.beforeEach(async ({ page, context, baseURL }) => {
    if (!baseURL) throw new Error('baseURL required');
    const ok = await unlockGate(page, context, baseURL);
    test.skip(gateRequired() && !ok, 'Private gate could not be unlocked');
    await page.clock.setFixedTime(new Date(2026, 10, 25, 12));
    await seedLegacyOnboarding(page);
  });

  test('keeps the saved receipt if the Next time chunk is unavailable offline', async ({ page, context }) => {
    await logGuestSet(page);
    const failedChunk = page.waitForEvent('requestfailed', {
      predicate: (request) => request.url().includes('/_next/static/chunks/') && request.resourceType() === 'script',
    });
    await context.setOffline(true);
    await page.getByRole('button', { name: /^finish$/i }).click();
    await failedChunk;
    const routeErrorAppeared = await page.getByText("That wasn't supposed to happen.")
      .waitFor({ state: 'visible', timeout: 2_000 }).then(() => true, () => false);
    expect(routeErrorAppeared).toBe(false);
    await expect(page.getByRole('dialog')).toContainText('Session locked');
    await expect(page.getByRole('region', { name: 'Next time' })).toHaveCount(0);
  });

  test('an unset Coach load asks the guest to find a working weight', async ({ page }) => {
    await seedLunges(page, 0, 'coachFindWorkingWeight');
    await page.getByRole('button', { name: /^finish$/i }).click();
    const target = page.getByRole('region', { name: 'Next time' }).getByRole('listitem').filter({ hasText: /^Lunges/ });
    await expect(target).toContainText('Upcoming Coach session');
    await expect(target).toContainText('Find a weight you could do for 2 more reps.');
  });

  test('Victory keeps a saved metric prescription in kg after switching to imperial', async ({ page }) => {
    await seedLunges(page, 60, 'coachWhyHold', 'metric');
    await page.getByRole('button', { name: /^finish$/i }).click();
    const target = page.getByRole('region', { name: 'Next time' }).getByRole('listitem').filter({ hasText: /^Lunges/ });
    await expect(target).toContainText('Upcoming Coach session');
    await expect(target).toContainText('60 kg');
  });
});
