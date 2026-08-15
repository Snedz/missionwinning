import { expect, type Page } from '@playwright/test';

/**
 * Navigate without Playwright `networkidle`.
 *
 * `npm run dev` (Turbopack) keeps HMR and long-lived fetches open on `/log`
 * and `/active`, so `waitUntil: 'networkidle'` hits the 60s test timeout and
 * the case never measures the product. Gate `next start` can idle; the critic
 * boot cannot. Guidebook PDF already prefers `load` for the same reason.
 *
 * After DOMContentLoaded, wait until React has hydrated enough that More (a
 * `<button>`, not a link) has a handler. Links work before hydrate; More does
 * not — that is why these cases used `networkidle` in the first place.
 */
function needsAppChrome(path: string): boolean {
  return (
    path === '/log' ||
    path === '/active' ||
    path === '/account' ||
    path.startsWith('/mind') ||
    path.startsWith('/profile')
  );
}

export async function gotoHydrated(page: Page, path: string): Promise<void> {
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('load').catch(() => undefined);

  if (!needsAppChrome(path)) return;

  const more = page
    .getByRole('navigation', { name: /primary/i })
    .getByRole('button', { name: /more/i });
  await expect(more).toBeVisible({ timeout: 15_000 });
  await expect
    .poll(
      async () =>
        more.evaluate((el) =>
          Object.keys(el).some(
            (k) => k.startsWith('__reactFiber') || k.startsWith('__reactProps')
          )
        ),
      { timeout: 15_000 }
    )
    .toBe(true);
}
