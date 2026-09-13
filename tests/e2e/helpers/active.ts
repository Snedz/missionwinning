import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * Cold `/active` is already a compose table. Hydrate must not own first paint.
 * Log set is the product — never Restoring session / disabled Start.
 */
export async function startEmptyActiveWorkout(page: Page): Promise<void> {
  await page.goto('/active', { waitUntil: 'networkidle' });
  const logSet = page
    .getByTestId('set-table-log-set')
    .or(page.getByTestId('log-console-log-set'))
    .or(page.getByRole('button', { name: /^log set$/i }));
  await expect(logSet.first()).toBeVisible({ timeout: 15_000 });
  await expect(logSet.first()).toBeEnabled();

  // Check-in sheet may cover Finish — dismiss if present.
  const skipCheckIn = page.getByRole('button', { name: /not now/i });
  if (await skipCheckIn.isVisible({ timeout: 1_500 }).catch(() => false)) {
    await skipCheckIn.click();
  }

  await expect(page.getByRole('button', { name: /finish/i }).first()).toBeVisible({
    timeout: 15_000,
  });
}
