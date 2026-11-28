import { expect, test } from '@playwright/test';
import { gateRequired, unlockGate } from './helpers/gate';

test('the opt-in homepage leaves Forge as the default and keeps the demo sandboxed', async ({ page, context, baseURL }) => {
  if (!baseURL) throw new Error('baseURL required');
  const unlocked = await unlockGate(page, context, baseURL);
  test.skip(gateRequired() && !unlocked, 'SMOKE_ACCESS_SECRET required to unlock private gate');
  await page.goto('/');

  if (process.env.LANDING_V2_PREVIEW !== 'true') {
    await expect(page.locator('h1').first()).toHaveText(/^\s*Log a set\.\s*$/);
    await expect(page.locator('a.house-btn-primary')).toHaveAttribute('href', '/welcome');
    await expect(page.getByRole('button', { name: 'Try the week demo' })).toHaveCount(0);
    return;
  }

  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Log a set\.\s*Know what to train next\./);
  const log = page.getByRole('link', { name: 'Log a set', exact: true }).first();
  await expect(log).toHaveAttribute('href', '/active');
  await expect(page.getByRole('table', { name: 'Example week' })).toBeVisible();
  const storage = () => page.evaluate(() => Object.fromEntries(
    Object.entries(window['local' + 'Storage']).filter(([key]) => /workout|outbox|coach/i.test(key))
  ));
  await page.getByRole('button', { name: 'Try the week demo' }).click();
  const rebuild = page.getByRole('button', { name: 'Rebuild week' });
  await expect(rebuild).toBeVisible();
  const before = await storage();
  await rebuild.click();
  await expect(page.getByRole('status').filter({ hasText: 'Rebuilt schedule:' })).toContainText('Thursday, Saturday, Sunday');
  await page.getByLabel('Equipment').selectOption('bodyweight');
  await page.getByLabel('Missed session').selectOption('4');
  await rebuild.click();
  await expect(page.getByRole('status').filter({ hasText: 'Rebuilt schedule:' })).toContainText('Saturday, Sunday');
  expect(await storage()).toEqual(before);
  await log.click();
  await expect(page).toHaveURL(/\/active(?:\?|$)/);
});
