import { expect, test, type Page } from '@playwright/test';
import { join } from 'node:path';
import legacyBackup from '../packages/core/src/fixtures/legacy-backup.json';

async function shot(page: Page, file: string) {
  const dir = process.env.V2_SCREENSHOTS_DIR;
  if (!dir) return;
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await page.screenshot({ path: join(dir, file), animations: 'disabled' });
}

async function start(page: Page) {
  await page.goto('/log');
  await page.getByRole('button', { name: 'Start workout' }).click();
  await expect(page).toHaveURL(/\/active$/);
}

test('guest logs a first set under 90 seconds and reaches Victory, Coach and History', async ({ page }) => {
  const startedAt = performance.now();
  await page.goto('/log');
  await expect(page.getByRole('heading', { name: 'Today.' })).toBeVisible();
  await shot(page, '01-today.png');
  await page.getByRole('button', { name: 'Start workout' }).click();
  await page.getByRole('spinbutton', { name: 'Added load' }).fill('5');
  await page.getByRole('spinbutton', { name: 'Reps' }).fill('12');
  await page.getByRole('button', { name: 'Log set' }).click();
  await expect(page.getByRole('list', { name: 'Logged sets' })).toContainText('12');
  const firstSetMs = performance.now() - startedAt;
  expect(firstSetMs).toBeLessThan(90_000);
  console.log(`First guest set logged in ${(firstSetMs / 1000).toFixed(2)}s`);
  await shot(page, '02-train.png');
  await page.getByRole('button', { name: 'Finish workout' }).click();
  await expect(page.getByRole('heading', { name: 'Victory.' })).toBeVisible();
  await expect(page.getByText('ELAPSED', { exact: true })).toBeVisible();
  await shot(page, '03-victory.png');
  await page.getByRole('link', { name: 'Plan with Coach' }).click();
  await expect(page.getByText('FROM YOUR LOG')).toBeVisible();
  await expect(page.locator('.citation')).toContainText('12');
  await page.getByRole('button', { name: 'Generate week' }).click();
  await expect(page.getByRole('region', { name: 'Week plan' })).toBeVisible();
  await shot(page, '04-coach.png');
  await page.getByRole('link', { name: 'History', exact: true }).click();
  await expect(page.getByText('Quick workout', { exact: true })).toBeVisible();
  await page.getByText('Quick workout', { exact: true }).click();
  await expect(page.getByRole('region', { name: 'Completed workouts' })).toContainText('12');
  await shot(page, '05-history.png');
  await page.getByRole('link', { name: 'You', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'You.', exact: true })).toBeVisible();
  await shot(page, '06-you.png');
});

test('a warmed PWA logs without a network, survives reload, and keeps the set on reconnect', async ({ page, context }) => {
  await page.goto('/log');
  await expect(page.getByText('Offline ready', { exact: true })).toBeVisible({ timeout: 20_000 });
  await context.setOffline(true);
  await page.goto('/active');
  await expect(page.getByText('Offline', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Start workout' }).click();
  await page.getByRole('spinbutton', { name: 'Reps' }).fill('13');
  await page.getByRole('button', { name: 'Log set' }).click();
  await page.reload();
  await expect(page.getByRole('list', { name: 'Logged sets' })).toContainText('13');
  await page.getByRole('button', { name: 'Finish workout' }).click();
  await expect(page.getByRole('heading', { name: 'Victory.' })).toBeVisible();
  await context.setOffline(false);
  await page.goto('/history');
  await page.getByText('Quick workout', { exact: true }).click();
  await expect(page.getByRole('region', { name: 'Completed workouts' })).toContainText('13');
});

test('downloaded v1-format export restores into a fresh profile and can be deleted locally', async ({ page, browser, baseURL }) => {
  await start(page);
  await page.getByRole('button', { name: 'Log set' }).click();
  await page.getByRole('button', { name: 'Finish workout' }).click();
  await page.getByRole('link', { name: 'You', exact: true }).click();
  const downloadPending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export backup' }).click();
  const download = await downloadPending;
  expect(download.suggestedFilename()).toMatch(/^mission-winning-backup-.*\.json$/);
  const path = await download.path();
  expect(path).not.toBeNull();
  const fresh = await browser.newContext({ baseURL });
  try {
    const device = await fresh.newPage();
    await device.goto('/profile');
    await device.getByLabel('Import backup').setInputFiles(path!);
    await expect(device.getByText('Backup imported. 1 workout added.')).toBeVisible();
    await device.getByRole('link', { name: 'History', exact: true }).click();
    await expect(device.getByText('Quick workout', { exact: true })).toBeVisible();
    await device.getByRole('link', { name: 'You', exact: true }).click();
    await device.getByRole('button', { name: 'Delete app data from this device…' }).click();
    await device.getByRole('button', { name: 'Delete app data', exact: true }).click();
    await expect(device.getByText('App data deleted from this device.')).toBeVisible();
    await device.reload();
    await device.getByRole('link', { name: 'History', exact: true }).click();
    await expect(device.getByText('Your first session goes here.')).toBeVisible();
  } finally {
    await fresh.close();
  }
});

test('an unchanged v1 backup restores an unfinished workout and its completed history', async ({ page }) => {
  await page.goto('/profile');
  await page.getByLabel('Import backup').setInputFiles({
    name: 'legacy-v1.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(legacyBackup)),
  });
  await expect(page.getByText('Backup imported. 1 workout added.')).toBeVisible();
  await page.getByRole('link', { name: 'Today', exact: true }).click();
  await page.getByRole('button', { name: 'Resume workout' }).click();
  await expect(page.getByRole('list', { name: 'Logged sets' })).toContainText('8');
  await page.getByRole('link', { name: 'History', exact: true }).click();
  await expect(page.getByText('Push', { exact: true })).toBeVisible();
});
