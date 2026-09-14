import { expect, type Page } from '@playwright/test';

/**
 * House leftover first-paint handles.
 *
 * Hero e2e still named `.primary-action`, `nav[aria-label=Primary]`, and
 * `data-mw-landing-notify` after the desk / rail / notify door moved. CI
 * `PRIVATE_MODE=false` still paints those surfaces — the selectors were stale,
 * not a cookie-gate. Keep the handles here so a third spelling does not
 * reappear per spec.
 */

export function todayStart(page: Page) {
  return page.getByTestId('today-start-cta');
}

export function todayDesk(page: Page) {
  return page.locator('[data-house-desk="today"]');
}

/** Compact floor rail. Side rail is `display:none` below 723. */
export function houseFloor(page: Page) {
  return page.locator('nav.house-floor');
}

export function houseMoreTrigger(page: Page) {
  return houseFloor(page).locator('[data-house-rail-open="more"]');
}

export function houseMoreDialog(page: Page) {
  return page.getByRole('dialog', { name: /^more$/i });
}

export async function openHouseMore(page: Page) {
  await page.goto('/log', { waitUntil: 'networkidle' });
  const trigger = houseMoreTrigger(page);
  await expect(trigger).toBeVisible({ timeout: 15_000 });
  await trigger.click();
  const sheet = houseMoreDialog(page);
  await expect(sheet).toBeVisible({ timeout: 10_000 });
  return { trigger, sheet };
}

export async function dismissConsentIfPresent(page: Page) {
  const banner = page.locator('[data-mw-consent-banner]');
  if (!(await banner.isVisible().catch(() => false))) return;
  const stay = banner.getByRole('button', { name: /stay private/i });
  if (await stay.isVisible().catch(() => false)) {
    await stay.click();
  }
}

/** Leftover Got it on Today. Not a first-set tap — dismiss without counting. */
export async function dismissHouseGuideIfPresent(page: Page) {
  const guide = page.getByTestId('house-guide');
  if (!(await guide.isVisible().catch(() => false))) return;
  const gotIt = guide.getByRole('button', { name: /got it/i });
  if (await gotIt.isVisible().catch(() => false)) {
    await gotIt.click();
    return;
  }
  const close = guide.getByRole('button', { name: /close/i });
  if (await close.isVisible().catch(() => false)) {
    await close.click();
  }
}

export async function dismissHouseOverlays(page: Page) {
  await dismissConsentIfPresent(page);
  await dismissHouseGuideIfPresent(page);
}

/**
 * Victory's boss next is often Coach / Train, not "Back to Today".
 * `.422` keeps Today as a quiet escape only when the primary is not /log.
 */
export async function leaveVictoryTowardToday(page: Page) {
  const back = page.getByRole('button', { name: /back to today/i });
  if (await back.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await back.click();
    return;
  }
  const dock = page.getByTestId('victory-next-dock');
  await expect(dock).toBeVisible({ timeout: 15_000 });
  const toToday = dock.getByRole('link', { name: /today/i }).or(
    dock.getByRole('button', { name: /today/i })
  );
  if (await toToday.first().isVisible().catch(() => false)) {
    await toToday.first().click();
    return;
  }
  await page.goto('/log', { waitUntil: 'domcontentloaded' });
}
