import type { Page } from '@playwright/test';

/**
 * Navigate without `networkidle`.
 *
 * Playwright `networkidle` waits until there are no connections for 500ms.
 * `npm run dev` (Turbopack HMR websocket + on-demand compiles) never reaches
 * that, so U1 empty-start / REACH / thumb-sweep hung at the 60s test timeout
 * and could not grade. Critic boot is `npm run dev` (docs/GAUNTLET_LOOP.md).
 *
 * Gate `next start` does settle. DOMContentLoaded + `load` finish on both.
 * Callers still wait on the control they mean to press.
 */
export async function gotoHydrated(page: Page, path: string): Promise<void> {
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('load');
}
