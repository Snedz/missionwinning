import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { gateRequired, unlockGate } from './helpers/gate';

for (const width of [320, 390, 1440]) test(`landing preview preserves Forge or renders the sandboxed remix at ${width}px`, async ({ page, context, baseURL }) => {
  if (!baseURL) throw new Error('baseURL required');
  await page.setViewportSize({ width, height: width === 1440 ? 900 : 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const unlocked = await unlockGate(page, context, baseURL);
  test.skip(gateRequired() && !unlocked, 'SMOKE_ACCESS_SECRET required to unlock private gate');
  await page.goto('/');

  if (process.env.LANDING_V2_PREVIEW !== 'true') {
    await expect(page.locator('h1').first()).toHaveText(/^\s*Log a set\.\s*$/);
    await expect(page.locator('a.house-btn-primary')).toHaveAttribute('href', '/welcome');
    await expect(page.getByRole('button', { name: 'Try the week demo' })).toHaveCount(0);
    return;
  }

  await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName('Log every set. Show up. Know what’s next.');
  await expect(page.locator('a.house-btn-primary')).toHaveCount(0);
  const log = page.getByRole('link', { name: 'Log a set', exact: true }).first();
  await expect(log).toHaveAttribute('href', '/active');
  const expectedHeadings = [
    'Built for one bar of signal and no rack',
    'A missed day is not a failed plan',
    'Choose your work.',
    'Train beyond Wi-Fi.',
    'Put it in the log.',
  ];
  await expect(page.getByRole('heading', { level: 2 })).toHaveText(expectedHeadings);
  await expect(page.getByRole('main')).not.toContainText(/\$\d|Earn It Back|Play Store|testimonial/i);
  const expectNoOverflow = () => expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
  await expectNoOverflow();
  const storage = () => page.evaluate(() => Object.fromEntries(
    Object.entries(window['local' + 'Storage']).filter(([key]) => /workout|outbox|coach/i.test(key))
  ));
  const before = await storage();
  await page.getByRole('button', { name: 'Try the week demo' }).click();
  const rebuild = page.getByRole('button', { name: 'Rebuild week' });
  await expect(rebuild).toBeVisible();
  await rebuild.click();
  await expect(page.getByRole('status').filter({ hasText: 'Rebuilt schedule:' })).toContainText('Thursday, Saturday, Sunday');
  await page.getByLabel('Equipment').selectOption('bodyweight');
  await page.getByLabel('Missed session').selectOption('4');
  await rebuild.click();
  await expect(page.getByRole('status').filter({ hasText: 'Rebuilt schedule:' })).toContainText('Saturday, Sunday');
  await page.getByLabel('Days per week').selectOption('6');
  await expect(page.getByLabel('Missed session').locator('option')).toHaveCount(6);
  const coachCard = page.getByRole('button', { name: 'What if there are no days left?' });
  await coachCard.click();
  await expect(coachCard).toHaveAttribute('aria-expanded', 'true');
  await expect(coachCard.getByText('The sample planner', { exact: false })).toBeVisible();
  await expectNoOverflow();
  expect(await storage()).toEqual(before);
  if (width === 390 || width === 1440) {
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(violations.map(({ id, nodes }) => ({ id, targets: nodes.map(node => node.target) }))).toEqual([]);
  }
  await log.click();
  await expect(page).toHaveURL(/\/active(?:\?|$)/);
});
