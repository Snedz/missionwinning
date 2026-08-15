import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { gotoHydrated } from './gotoHydrated';

/**
 * Start an empty Active session after Zustand persist rehydration.
 * Start stays disabled until `hasHydrated` — avoids localStorage wipe race.
 *
 * I-Day helpers write `mw_equipment`, which swaps the dock to a Just Go
 * preview (`.768`). This helper is the empty-start instrument: keep I-Day
 * complete via `mw_journey_state`, drop equipment so `/active` is a blank
 * session, then click the dock primary. Do not wait for `networkidle`
 * (`npm run dev` never settles).
 */
export async function startEmptyActiveWorkout(page: Page): Promise<void> {
  await page.addInitScript(() => {
    try {
      const raw = localStorage.getItem('mw_journey_state');
      const prev = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
      const prevIDay = (prev.iDay as { completedAt?: string } | undefined) ?? {};
      localStorage.setItem(
        'mw_journey_state',
        JSON.stringify({
          phase: prev.phase ?? 'basic',
          iDay: { ...prevIDay, completedAt: prevIDay.completedAt ?? new Date().toISOString() },
          basic: prev.basic ?? {
            workout: false,
            fuel: false,
            move: false,
            mind: false,
            learn: false,
          },
          readiness: prev.readiness ?? {
            parq: false,
            streakMet: false,
            winScoreSeen: false,
          },
        })
      );
      localStorage.removeItem('mw_equipment');
    } catch {
      /* Safari private */
    }
  });
  await gotoHydrated(page, '/active');
  await expect(page).toHaveURL(/\/active/, { timeout: 15_000 });
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
