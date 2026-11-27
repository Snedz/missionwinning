import { expect, test, type Page } from '@playwright/test';
import { join } from 'node:path';
import { audit } from './notebookChecks';

async function checkWeekComparison(page: Page) {
  const week = page.getByRole('table', { name: 'Example week' });
  const headers = week.getByRole('columnheader');
  const names = ['Plan version', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  await expect(headers).toHaveCount(names.length);
  for (const [index, name] of names.entries()) await expect(headers.nth(index)).toHaveAccessibleName(name);
  const statuses = (row: string) => week.getByRole('row').filter({ has: page.getByRole('rowheader', { name: row }) }).getByRole('cell');
  const before = statuses('Original plan');
  const after = statuses('Rebuilt Thursday');
  await expect(before).toHaveCount(7);
  await expect(after).toHaveCount(7);
  for (let day = 0; day < 7; day++) {
    await expect(before.nth(day)).toHaveAccessibleName([2, 4, 6].includes(day) ? 'Session planned' : 'No session');
    await expect(after.nth(day)).toHaveAccessibleName([3, 5, 6].includes(day) ? 'Session planned' : 'No session');
  }
  await expect(page.getByText('Wednesday and Friday → Thursday and Saturday.')).toBeVisible();
  await expect(page.getByText(/Sunday stays on the plan/)).toBeVisible();
}

test('landing explains the notebook accessibly and opens the guest set form directly', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Log a set.\s*Know what to train next\./);
  await expect(page.getByText('In your browser. No account needed.')).toBeVisible();
  await expect(page.getByRole('list', { name: 'Example logged sets' }).getByRole('listitem')).toHaveCount(3);
  await checkWeekComparison(page);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
  const { width, height } = page.viewportSize()!;
  await audit(page, width);

  const dir = process.env.V2_LANDING_SCREENSHOTS_DIR;
  if (dir) {
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    await page.evaluate(() => { window.scrollTo(0, 0); (document.activeElement as HTMLElement)?.blur(); });
    await page.screenshot({ path: join(dir, `${width}x${height}-first-fold.png`), animations: 'disabled', scale: 'css' });
    await page.screenshot({ path: join(dir, `${width}x${height}-full-page.png`), fullPage: true, animations: 'disabled', scale: 'css' });
  }

  const cta = page.getByRole('link', { name: 'Log a set', exact: true }).first();
  await expect(cta).toBeInViewport({ ratio: 1 });
  await cta.click();
  await expect(page).toHaveURL(/\/active$/);
  await expect(page.getByRole('button', { name: 'Start workout' })).toHaveCount(0);
  const sets = page.getByRole('list', { name: 'Logged sets' }).getByRole('listitem');
  await expect(sets).toHaveCount(0);
  await page.getByRole('spinbutton', { name: 'Reps' }).fill('11');
  await page.getByRole('button', { name: 'Log set' }).click();
  await expect(page.getByRole('list', { name: 'Logged sets' })).toContainText('11');
  await expect(sets).toHaveCount(1);
  await page.reload();
  await expect(page.getByRole('list', { name: 'Logged sets' })).toContainText('11');
  await expect(sets).toHaveCount(1);
  await page.getByRole('button', { name: 'Finish workout' }).click();
  await expect(page.getByRole('heading', { name: 'Victory.' })).toBeVisible();
});

test('the sample is accessible at 320px and does not write notebook data', async ({ page, context }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  const before = await context.storageState({ indexedDB: true });
  await page.goto('/');
  await page.getByRole('link', { name: 'See how a week adapts' }).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#example$/);
  await checkWeekComparison(page);
  await audit(page, 320);
  expect(await context.storageState({ indexedDB: true })).toEqual(before);
});

test('landing CTA resumes a live workout instead of replacing it', async ({ page }) => {
  await page.goto('/active');
  await page.getByRole('button', { name: 'Start workout' }).click();
  await page.getByRole('spinbutton', { name: 'Reps' }).fill('19');
  await page.getByRole('button', { name: 'Log set' }).click();
  await expect(page.getByRole('list', { name: 'Logged sets' })).toContainText('19');

  await page.goto('/');
  await page.reload();
  await page.getByRole('link', { name: 'Log a set', exact: true }).last().click();
  await expect(page).toHaveURL(/\/active$/);
  await expect(page.getByRole('list', { name: 'Logged sets' }).getByRole('listitem')).toHaveCount(1);
  await expect(page.getByRole('list', { name: 'Logged sets' })).toContainText('19');
});

test('the landing distinguishes guest backups from configured account sync', async ({ page }) => {
  const cloudConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  await page.goto('/');
  await page.getByText('Where are my workouts saved?', { exact: true }).click();
  await expect(page.getByText(/saved in this browser on this device.*Export a backup/)).toBeVisible();
  const syncCopy = page.getByText(/Sign in from You to sync workouts across devices/);
  const signIn = page.getByRole('link', { name: 'Sign in', exact: true });
  if (cloudConfigured) {
    await expect(syncCopy).toBeVisible();
    await signIn.click();
    await expect(page).toHaveURL(/\/profile$/);
    await expect(page.getByRole('button', { name: 'Email sign-in link' })).toBeVisible();
  } else {
    await expect(syncCopy).toHaveCount(0);
    await expect(signIn).toHaveCount(0);
    await page.getByRole('link', { name: 'Open notebook' }).first().click();
    await expect(page).toHaveURL(/\/log$/);
    await expect(page.getByRole('heading', { name: 'Today.' })).toBeVisible();
  }
});

test('the warmed notebook can follow the landing CTA offline', async ({ page, context }) => {
  await page.goto('/log');
  await expect(page.getByText('Offline ready', { exact: true })).toBeVisible({ timeout: 20_000 });
  await context.setOffline(true);
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Log a set.\s*Know what to train next\./);
  await page.getByRole('link', { name: 'Log a set', exact: true }).first().click();
  await page.getByRole('spinbutton', { name: 'Reps' }).fill('14');
  await page.getByRole('button', { name: 'Log set' }).click();
  await expect(page.getByRole('list', { name: 'Logged sets' })).toContainText('14');
  await page.reload();
  const sets = page.getByRole('list', { name: 'Logged sets' });
  await expect(sets.getByRole('listitem')).toHaveCount(1);
  await expect(sets).toContainText('14');
});
