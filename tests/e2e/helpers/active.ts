import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * Start an empty Active session, waiting out Zustand persist rehydration.
 * Clicking Start before hydrate completes gets wiped when localStorage merges back.
 */
export async function startEmptyActiveWorkout(page: Page): Promise<void> {
  await page.goto('/active', { waitUntil: 'networkidle' });
  const start = page.getByRole('button', { name: /start workout/i });
  await expect(start).toBeVisible({ timeout: 15_000 });

  await expect(async () => {
    // If still on empty shell, click Start again (covers hydrate race).
    if (await start.isVisible().catch(() => false)) {
      await start.click();
    }
    await expect(page.getByRole('button', { name: /finish/i }).first()).toBeVisible({
      timeout: 2_500,
    });
  }).toPass({ timeout: 20_000 });
}
