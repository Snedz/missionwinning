import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { gotoHydrated } from './gotoHydrated';

/**
 * Start an empty Active session after Zustand persist rehydration.
 * Start stays disabled until `hasHydrated` — avoids localStorage wipe race.
 */
export async function startEmptyActiveWorkout(page: Page): Promise<void> {
  await gotoHydrated(page, '/active');
  const start = page.getByRole('button', { name: /start workout/i });
  await expect(start).toBeVisible({ timeout: 15_000 });
  await expect(start).toBeEnabled({ timeout: 15_000 });
  await start.click();

  // Check-in sheet may cover Finish — dismiss if present.
  const skipCheckIn = page.getByRole('button', { name: /not now/i });
  if (await skipCheckIn.isVisible({ timeout: 1_500 }).catch(() => false)) {
    await skipCheckIn.click();
  }

  await expect(page.getByRole('button', { name: /finish/i }).first()).toBeVisible({
    timeout: 15_000,
  });
}
