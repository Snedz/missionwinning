import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { gotoHydrated } from './gotoHydrated';

/**
 * Start an empty Active session after Zustand persist rehydration.
 * Start stays disabled until `hasHydrated` — avoids localStorage wipe race.
 *
 * I-Day helpers write `mw_equipment`, which swaps the dock to a Just Go
 * preview (`.768`). This helper is the empty-start instrument: drop that
 * key so `/active` is a blank session, then click the one dock primary
 * (copy is Start workout / Start Just Go / Repeat last — not a spelling
 * wait). Do not wait for `networkidle` (`npm run dev` never settles).
 */
export async function startEmptyActiveWorkout(page: Page): Promise<void> {
  await page.addInitScript(() => {
    try {
      localStorage.removeItem('mw_equipment');
    } catch {
      /* Safari private */
    }
  });
  await gotoHydrated(page, '/active');
  const start = page.locator('.primary-action').first();
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
