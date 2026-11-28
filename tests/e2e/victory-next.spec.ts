import { expect, test, type Page } from '@playwright/test';
import { logSetButton, startEmptyActiveWorkout } from './helpers/active';
import { gateRequired, unlockGate } from './helpers/gate';
import { dismissHouseOverlays } from './helpers/houseChrome';
import { seedLegacyOnboarding } from './helpers/journey';

test.use({ serviceWorkers: 'block' });

async function logLunges(page: Page) {
  await startEmptyActiveWorkout(page);
  await dismissHouseOverlays(page);
  await page.getByRole('button', { name: /^add exercise$/i }).click();
  await page.getByPlaceholder(/search exercises/i).fill('lunges');
  await page.getByRole('option', { name: /^lunges\b/i }).first().click();
  await page.getByRole('button', { name: /add selected exercise/i }).click();
  await page.getByTestId('set-table-open-load').last().fill('30');
  await page.getByRole('textbox', { name: 'Reps', exact: true }).last().fill('6');
  await logSetButton(page).first().click();
  await page.getByTestId('rest-skip').click();
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
    await logLunges(page);
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
});
