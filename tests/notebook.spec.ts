import { expect, test, type Page } from '@playwright/test';
import legacyBackup from '../packages/core/src/fixtures/legacy-backup.json';
import { audit, shot } from './notebookChecks';

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
  await audit(page);
  await shot(page, '02-train.png');
  await page.getByRole('button', { name: 'Finish workout' }).click();
  await expect(page.getByRole('heading', { name: 'Victory.' })).toBeVisible();
  await expect(page.getByText('ELAPSED', { exact: true })).toBeVisible();
  await audit(page);
  await shot(page, '03-victory.png');
  await page.getByRole('link', { name: 'Plan with Coach' }).click();
  await expect(page.getByText('FROM YOUR LOG')).toBeVisible();
  await expect(page.locator('.citation')).toContainText('12');
  await page.getByRole('button', { name: 'Generate week' }).click();
  await expect(page.getByRole('region', { name: 'Week plan' })).toBeVisible();
  await audit(page);
  await shot(page, '04-coach.png');
  await page.getByRole('link', { name: 'History', exact: true }).click();
  await expect(page.getByText('Quick workout', { exact: true })).toBeVisible();
  await page.getByText('Quick workout', { exact: true }).click();
  await expect(page.getByRole('region', { name: 'Completed workouts' })).toContainText('12');
  await audit(page);
  await shot(page, '05-history.png');
  await page.getByRole('link', { name: 'You', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'You.', exact: true })).toBeVisible();
  await audit(page);
  await shot(page, '06-you.png');
});

test('a warmed PWA logs without a network, survives reload, and keeps the set on reconnect', async ({ page, context }) => {
  await page.goto('/log');
  await expect(page.getByText('Offline ready', { exact: true })).toBeVisible({ timeout: 20_000 });
  await context.setOffline(true);
  await page.goto('/active');
  await expect(page.getByText('Offline', { exact: true })).toBeVisible();
  await expect(page.getByText('You’re offline.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Start workout' }).click();
  await page.getByRole('spinbutton', { name: 'Reps' }).fill('13');
  await page.getByRole('button', { name: 'Log set' }).click();
  await page.reload();
  await expect(page.getByRole('list', { name: 'Logged sets' })).toContainText('13');
  await shot(page, '07-offline.png');
  await page.getByRole('button', { name: 'Finish workout' }).click();
  await expect(page.getByRole('heading', { name: 'Victory.' })).toBeVisible();
  await context.setOffline(false);
  await page.goto('/history');
  await page.getByText('Quick workout', { exact: true }).click();
  await expect(page.getByRole('region', { name: 'Completed workouts' })).toContainText('13');
});

test('a controlled page prefers fresh HTML online and uses the shell only offline', async ({ page, context }) => {
  await page.goto('/log');
  await expect(page.getByText('Offline ready', { exact: true })).toBeVisible({ timeout: 20_000 });
  const replaced = await page.evaluate(async () => {
    for (const name of await caches.keys()) {
      const cache = await caches.open(name);
      const entry = (await cache.keys()).find((request) => new URL(request.url).pathname === '/history');
      if (!entry) continue;
      await cache.put(entry, new Response('<h1>Older cached history shell</h1>', {
        headers: { 'Content-Type': 'text/html' },
      }));
      return true;
    }
    return false;
  });
  expect(replaced).toBe(true);
  await page.goto('/history');
  await expect(page.getByRole('heading', { name: 'History.' })).toBeVisible();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Older cached history shell' })).toBeVisible();
});

test('empty screens, keyboard navigation, and backup errors are accessible at 390px', async ({ page }) => {
  await page.goto('/log');
  await expect(page.getByText('A clean page.')).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to notebook' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
  await audit(page);

  for (const [path, text] of [
    ['/active', 'Start a quick workout whenever you’re ready.'],
    ['/victory', 'Finish a workout to see its receipt here.'],
    ['/coach', 'NO LOGS YET'],
    ['/history', 'Your first session goes here.'],
  ]) {
    await page.goto(path);
    await expect(page.getByText(text, { exact: true })).toBeVisible();
    await audit(page);
    await shot(page, `empty-${path.slice(1)}.png`);
  }

  await page.getByRole('link', { name: 'You', exact: true }).click();
  await expect(page.getByRole('main')).toBeFocused();
  expect(await page.evaluate(() => scrollY)).toBe(0);
  await page.getByLabel('Import backup').setInputFiles({
    name: 'invalid.json', mimeType: 'application/json', buffer: Buffer.from('not a backup'),
  });
  await expect(page.getByRole('main').getByRole('alert')).toHaveText('Not a valid JSON file.');
  await audit(page);
  await shot(page, 'you-backup-error.png');
});

test('the PWA install affordance delegates to the browser when offered', async ({ page }) => {
  await page.goto('/log');
  await expect(page.getByRole('heading', { name: 'Today.' })).toBeVisible();
  await page.evaluate(() => {
    const event = new Event('beforeinstallprompt', { cancelable: true });
    Object.assign(event, {
      prompt: async () => document.body.setAttribute('data-prompted', 'yes'),
    });
    window.dispatchEvent(event);
  });
  const install = page.getByRole('button', { name: 'Install app' });
  await expect(install).toBeVisible();
  await audit(page);
  await shot(page, '08-install.png');
  await install.click();
  await expect(page.locator('body')).toHaveAttribute('data-prompted', 'yes');
  await expect(install).toBeHidden();
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
