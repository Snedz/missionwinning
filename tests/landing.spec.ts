import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { STORAGE_KEYS, WORKOUT_STORE_KEY } from '../packages/core/src/lib/storage/keys';
import { audit } from './notebookChecks';

async function landingFirstSet(context: BrowserContext) {
  const { origins } = await context.storageState();
  return origins.flatMap(({ localStorage }) => localStorage).find(({ name }) => name === STORAGE_KEYS.landingFirstSavedSet)?.value;
}

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

test('landing explains the notebook accessibly and opens the guest set form directly', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Log a set.\s*Know what to train next\./);
  await expect(page.getByText('In your browser. No account needed.')).toBeVisible();
  const home = page.getByRole('link', { name: 'Mission Winning home' });
  expect((await home.innerText()).replace(/\s+/g, ' ')).toBe('MISSION WINNING');
  await expect(page.getByRole('list', { name: 'Example logged sets' }).getByRole('listitem')).toHaveCount(3);
  await checkWeekComparison(page);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
  const { width, height } = page.viewportSize()!;
  await audit(page, width);

  const preview = page.getByRole('region', { name: 'See the real app.' });
  const screens = preview.getByRole('img');
  await expect(screens).toHaveCount(3);
  await expect(screens.first()).toHaveAccessibleName(/empty workout history/);
  let previewBytes = 0;
  for (const [index, name] of ['today', 'train', 'coach'].entries()) {
    const screen = screens.nth(index);
    await expect(screen).toHaveAttribute('loading', 'lazy');
    await screen.scrollIntoViewIfNeeded();
    const density = await page.evaluate(() => devicePixelRatio);
    const format = width >= 1024 && name !== 'today' ? 'laptop' : density <= 1 ? 'phone-small' : 'phone';
    const path = `/preview-${name}-${format}.webp`;
    await expect.poll(() => screen.evaluate((img: HTMLImageElement) =>
      img.naturalWidth > 0 ? new URL(img.currentSrc).pathname : null,
    )).toBe(path);
    const asset = await request.get(path);
    expect(asset.ok()).toBe(true);
    previewBytes += (await asset.body()).byteLength;
  }
  console.log(`Landing ${width}px preview gallery: ${previewBytes} bytes`);
  expect(previewBytes).toBeLessThanOrEqual(80 * 1024);
  await page.evaluate(() => window.scrollTo(0, 0));

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

test('landing delivers canonical share metadata and stays within its initial payload budgets', async ({ page, request }) => {
  const origin = 'https://www.missionwinning.com';
  const response = await page.goto('/');
  expect(response?.ok()).toBe(true);
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', '/favicon.svg');
  expect((await request.get('/favicon.svg')).headers()['content-type']).toContain('image/svg+xml');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', origin);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /without an account/);
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', origin);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', await page.title());
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', `${origin}/landing-share.png`);
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
  const share = await request.get('/landing-share.png');
  expect(share.ok()).toBe(true);
  expect(share.headers()['content-type']).toContain('image/png');
  const png = await share.body();
  expect(png.readUInt32BE(16)).toBe(1200);
  expect(png.readUInt32BE(20)).toBe(630);

  const resources = await page.evaluate(() =>
    performance.getEntriesByType('resource').map((entry) => {
      const resource = entry as PerformanceResourceTiming;
      return { path: new URL(resource.name).pathname, bytes: resource.decodedBodySize };
    }),
  );
  const payload = (extension: string) => {
    const assets = resources.filter(({ path }) => path.startsWith('/_next/static/') && path.endsWith(extension));
    expect(assets.length).toBeGreaterThan(0);
    expect(assets.every(({ bytes }) => bytes > 0)).toBe(true);
    return [...new Map(assets.map(({ path, bytes }) => [path, bytes])).values()].reduce((sum, bytes) => sum + bytes, 0);
  };
  const htmlBytes = (await response!.body()).byteLength;
  const jsBytes = payload('.js');
  const cssBytes = payload('.css');
  console.log(`Landing initial decoded bytes: HTML ${htmlBytes}, JS ${jsBytes}, CSS ${cssBytes}; share PNG ${png.byteLength}`);
  expect(htmlBytes).toBeLessThanOrEqual(45 * 1024);
  expect(jsBytes).toBeLessThanOrEqual(600 * 1024);
  expect(cssBytes).toBeLessThanOrEqual(38 * 1024);
  expect(png.byteLength).toBeLessThanOrEqual(75 * 1024);
});

test('the first-set count is local, durable, capped at one, and erased with guest data', async ({ page, context }) => {
  await page.goto('/');
  expect(await landingFirstSet(context)).toBeUndefined();
  await page.getByRole('link', { name: 'Log a set', exact: true }).first().click();
  const log = page.getByRole('button', { name: 'Log set' });
  await expect(log).toBeVisible();
  expect(await landingFirstSet(context)).toBeUndefined();
  await page.getByRole('spinbutton', { name: 'Reps' }).fill('13');
  await log.click();
  await expect.poll(() => landingFirstSet(context)).toBe('1');
  await log.click();
  await page.reload();
  await expect(page.getByRole('list', { name: 'Logged sets' }).getByRole('listitem')).toHaveCount(2);
  expect(await landingFirstSet(context)).toBe('1');

  await page.goto('/profile');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export backup' }).click();
  const backup = JSON.parse(await readFile((await (await download).path())!, 'utf8'));
  expect(backup.localKeys).not.toHaveProperty(STORAGE_KEYS.landingFirstSavedSet);
  await page.getByRole('button', { name: 'Delete app data from this device…' }).click();
  await page.getByRole('button', { name: 'Delete app data', exact: true }).click();
  await expect(page.getByText('App data deleted from this device.')).toBeVisible();
  expect(await landingFirstSet(context)).toBeUndefined();
});

test('a set kept only in memory does not count as saved', async ({ page, context }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Log a set', exact: true }).first().click();
  await expect(page.getByRole('button', { name: 'Log set' })).toBeVisible();
  await page.evaluate((workoutKey) => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === workoutKey) throw new DOMException('Test refused workout write', 'QuotaExceededError');
      return original.call(this, key, value);
    };
  }, WORKOUT_STORE_KEY);
  await page.getByRole('button', { name: 'Log set' }).click();
  await expect(page.getByText(/This device refused to save/)).toBeVisible();
  await expect(page.getByRole('list', { name: 'Logged sets' })).toBeVisible();
  expect(await landingFirstSet(context)).toBeUndefined();
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
  await page.getByRole('button', { name: 'Try the week demo' }).click();
  await expect(page.getByRole('combobox', { name: 'Equipment' })).toBeVisible();
  await page.getByRole('button', { name: 'Rebuild week' }).click();
  await expect(page.getByRole('list', { name: 'Rebuilt sessions' }).getByRole('listitem')).toHaveCount(3);
  await audit(page, 320);
  expect(await context.storageState({ indexedDB: true })).toEqual(before);
});

test('the Coach demo loads on demand, responds to keyboard input, and leaves a real workout untouched', async ({ page, context }) => {
  await page.goto('/active');
  await page.getByRole('button', { name: 'Start workout' }).click();
  await page.getByRole('button', { name: 'Log set' }).click();
  await expect(page.getByRole('list', { name: 'Logged sets' }).getByRole('listitem')).toHaveCount(1);
  const before = await context.storageState({ indexedDB: true });
  await page.goto('/');
  const writes: string[] = [];
  page.on('request', (request) => {
    if (!['GET', 'HEAD'].includes(request.method()) || new URL(request.url()).pathname.startsWith('/api/')) writes.push(request.url());
  });
  const scriptResources = () => page.evaluate(() => Object.fromEntries(
    (performance.getEntriesByType('resource') as PerformanceResourceTiming[])
      .filter(({ name }) => new URL(name).pathname.endsWith('.js'))
      .map(({ name, decodedBodySize }) => [name, decodedBodySize]),
  ));
  const initialScripts = await scriptResources();
  const toggle = page.getByRole('button', { name: 'Try the week demo' });
  await toggle.focus();
  await page.keyboard.press('Enter');
  const equipment = page.getByRole('combobox', { name: 'Equipment' });
  await expect(equipment).toBeVisible();
  await expect(page.getByRole('button', { name: 'Hide week demo' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(equipment).toBeFocused();
  const rebuild = page.getByRole('button', { name: 'Rebuild week' });
  await page.keyboard.press('Tab');
  await expect(page.getByRole('combobox', { name: 'Days per week' })).toBeFocused();
  await page.keyboard.press('Tab');
  const missed = page.getByRole('combobox', { name: 'Missed session' });
  await expect(missed).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(rebuild).toBeFocused();
  await page.keyboard.press('Enter');
  const result = page.getByRole('status').filter({ hasText: 'Missed' });
  await expect(result).toHaveText('Missed Wednesday. Rebuilt schedule: Thursday, Saturday, Sunday.');
  await expect(page.getByText('First exercise in each session:')).toBeVisible();
  await expect(page.getByRole('list', { name: 'Rebuilt sessions' }).getByRole('listitem').first()).toContainText('Lunges');
  const deferredBytes = Object.entries(await scriptResources()).filter(([url]) => !(url in initialScripts))
    .reduce((bytes, [, size]) => bytes + size, 0);
  console.log(`Landing demo deferred JS: ${deferredBytes} decoded bytes`);
  expect(deferredBytes).toBeGreaterThan(0);
  expect(deferredBytes).toBeLessThanOrEqual(220 * 1024);
  const { width, height } = page.viewportSize()!;
  await audit(page, width);
  await expect(rebuild).toBeFocused();
  const dir = process.env.V2_LANDING_SCREENSHOTS_DIR;
  if (dir) await page.screenshot({ path: join(dir, `${width}x${height}-week-demo.png`), fullPage: true, animations: 'disabled', scale: 'css' });

  await equipment.selectOption('bodyweight');
  await page.getByRole('combobox', { name: 'Days per week' }).selectOption('2');
  await expect(page.getByText(/Original schedule: Wednesday, Sunday/)).toBeVisible();
  await rebuild.click();
  await expect(result).toHaveText('Missed Wednesday. Rebuilt schedule: Thursday, Sunday.');
  await expect(page.getByRole('list', { name: 'Rebuilt sessions' }).getByRole('listitem')).toHaveCount(2);
  await missed.selectOption({ label: 'Sunday' });
  await rebuild.click();
  await expect(result).toHaveText('Missed Sunday. No days remain in this sample week.');
  await expect(page.getByRole('list', { name: 'Rebuilt sessions' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Hide week demo' }).click();
  await expect(equipment).toBeHidden();
  await expect(page.getByText('Could not load the demo. Check your connection and try again.')).toHaveCount(0);
  expect(writes).toEqual([]);
  expect(await context.storageState({ indexedDB: true })).toEqual(before);
});

test('landing CTA resumes a live workout instead of replacing it', async ({ page, context }) => {
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
  expect(await landingFirstSet(context)).toBeUndefined();
});

test('the landing distinguishes guest backups from configured account sync', async ({ page }) => {
  const cloudConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  await page.goto('/');
  await page.getByText('Where are my workouts saved?', { exact: true }).click();
  await expect(page.getByText(/saved in this browser on this device.*Export a backup/)).toBeVisible();
  await expect(page.getByText(/If the browser blocks saving, the notebook warns you/)).toBeVisible();
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

test('a guest set from the landing changes the real Coach week', async ({ page }) => {
  const setDay = (day: number) => page.clock.setFixedTime(new Date(2026, 5, day, 12));
  async function finishLunges(weight: number) {
    await page.getByRole('button', { name: 'Add movement' }).click();
    await page.getByRole('searchbox', { name: 'Find a movement' }).fill('lunges');
    await page.getByRole('button', { name: 'Lunges', exact: true }).click();
    await page.getByRole('spinbutton', { name: /load/i }).fill(String(weight));
    await page.getByRole('spinbutton', { name: 'Reps' }).fill('10');
    await page.getByRole('button', { name: 'Log set', exact: true }).click();
    await expect(page.getByRole('list', { name: 'Logged sets' })).toContainText(String(weight));
    await page.getByRole('button', { name: 'Finish workout' }).click();
    await expect(page.getByRole('heading', { name: 'Victory.' })).toBeVisible();
    await page.getByRole('link', { name: 'Plan with Coach' }).click();
  }

  await setDay(10);
  await page.goto('/active');
  await page.getByRole('button', { name: 'Start workout' }).click();
  await finishLunges(20);
  await page.getByRole('combobox', { name: 'Equipment' }).selectOption('dumbbells');
  await page.getByRole('button', { name: 'Generate week' }).click();
  const week = page.getByRole('region', { name: 'Week plan' });
  await expect(week).toContainText('Wed, Jun 10');
  const report = page.getByRole('region', { name: 'What changed and why' });
  await expect(report).toHaveCount(0);

  await setDay(11);
  await page.goto('/');
  await page.getByRole('link', { name: 'Log a set' }).first().click();
  await expect(page.getByRole('heading', { name: 'Train.' })).toBeVisible();
  await finishLunges(30);
  await expect(report).toHaveCount(0);
  const rebuild = page.getByRole('button', { name: 'Rebuild week' });
  await rebuild.focus();
  await page.keyboard.press('Enter');
  await expect(rebuild).toBeFocused();
  await expect(page.getByRole('status').filter({ hasText: '2 moved' })).toContainText('1 load change');
  const schedule = report.getByRole('region', { name: 'Schedule' });
  await expect(schedule).toContainText(/Wed, Jun 10.*Thu, Jun 11/);
  await expect(schedule).toContainText(/Fri, Jun 12.*Sat, Jun 13/);
  await expect(schedule).toContainText('Your log shows 1 finished workout on the original day.');
  const load = report.getByRole('region', { name: 'Load & reps' });
  await expect(load).toContainText('Lunges');
  await expect(load).toContainText(/Before.*1 set × 10 reps · 20 kg/);
  await expect(load).toContainText(/After.*1 set × 10 reps · 30 kg/);
  await expect(load).toContainText('Quick workout, Thu, Jun 11. First working set: 10 reps at 30 kg.');
  await expect(week).not.toContainText('Wed, Jun 10');
  await page.reload();
  await expect(report.getByText('First working set:', { exact: false })).toBeVisible();
  const { width, height } = page.viewportSize()!;
  await audit(page, width);
  const captureDir = process.env.V2_COACH_DIFF_SCREENSHOTS_DIR;
  if (captureDir) {
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    await page.screenshot({ path: join(captureDir, `${width}x${height}-coach-full.png`), fullPage: true, scale: 'css' });
    if (width < 640) await report.evaluate((element) => element.scrollIntoView({ block: 'start' }));
    await page.screenshot({ path: join(captureDir, `${width}x${height}-coach-diff.png`), scale: 'css' });
  }

  await page.getByRole('combobox', { name: 'Days per week' }).selectOption('4');
  await rebuild.click();
  await expect(schedule.getByText('Dropped', { exact: true })).toHaveCount(3);
  await expect(schedule.getByText('Added', { exact: true })).toHaveCount(4);
  await expect(schedule).toContainText('You changed your target from 3 to 4 days per week.');
  if (captureDir) await page.screenshot({
    path: join(captureDir, `${width}x${height}-coach-added-dropped.png`), fullPage: true, scale: 'css',
  });

  await week.locator('summary').first().click();
  await week.getByRole('button', { name: 'Start session' }).click();
  await page.getByRole('button', { name: 'Log set', exact: true }).click();
  await page.getByRole('button', { name: 'Finish workout' }).click();
  await page.getByRole('link', { name: 'Plan with Coach' }).click();
  await expect(report).toContainText('AFTER YOUR WORKOUT');
  await expect(report).toContainText(/You finished .* on Thu, Jun 11/);
  await expect(report.getByText('Dropped', { exact: true })).toHaveCount(0);
  await page.goto('/profile');
  const deletion = page.getByRole('combobox', { name: 'Delete one workout' });
  await deletion.selectOption({ index: 1 });
  await page.getByRole('button', { name: 'Delete selected workout' }).click();
  await page.goto('/coach');
  await expect(week).toBeVisible();
  await expect(report).toHaveCount(0);
});

test('the warmed notebook can follow the landing CTA offline', async ({ page, context }) => {
  await page.goto('/');
  const device = page.getByRole('region', { name: 'Train beyond Wi-Fi.' });
  await expect(device.getByRole('heading', { name: 'Add to your home screen' })).toBeVisible();
  await expect(device.getByRole('heading', { name: 'Save sets in airplane mode' })).toBeVisible();
  await expect(device.getByText(/online on this device first and wait for “Offline ready/)).toBeVisible();
  await expect(device.getByText(/Saving still needs browser storage/)).toBeVisible();
  await expect(device.getByRole('heading', { name: 'Separate native Android app' })).toBeVisible();
  await expect(device.getByRole('link')).toHaveCount(0);
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
