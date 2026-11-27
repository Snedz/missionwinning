import { expect, test } from '@playwright/test';
import { join } from 'node:path';
import { audit } from './notebookChecks';

test('landing explains the notebook accessibly and opens the guest set form directly', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Log a set.\s*Know what to train next\./);
  await expect(page.getByRole('list', { name: 'Example logged sets' }).getByRole('listitem')).toHaveCount(3);
  await expect(page.getByText(/Original plan:/)).toHaveText('Original plan: Wed · Fri · Sun');
  await expect(page.getByRole('list', { name: 'Example planned sessions' }).locator('li > strong'))
    .toHaveText(['Thu', 'Sat', 'Sun']);
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
  await page.getByRole('spinbutton', { name: 'Reps' }).fill('11');
  await page.getByRole('button', { name: 'Log set' }).click();
  await expect(page.getByRole('list', { name: 'Logged sets' })).toContainText('11');
  await page.reload();
  await expect(page.getByRole('list', { name: 'Logged sets' })).toContainText('11');
  await page.getByRole('button', { name: 'Finish workout' }).click();
  await expect(page.getByRole('heading', { name: 'Victory.' })).toBeVisible();
});

test('landing CTA resumes a live workout instead of replacing it', async ({ page }) => {
  await page.goto('/active');
  await page.getByRole('button', { name: 'Start workout' }).click();
  await page.getByRole('spinbutton', { name: 'Reps' }).fill('19');
  await page.getByRole('button', { name: 'Log set' }).click();
  await expect(page.getByRole('list', { name: 'Logged sets' })).toContainText('19');

  await page.goto('/');
  await page.getByRole('link', { name: 'Log a set', exact: true }).last().click();
  await expect(page.getByRole('list', { name: 'Logged sets' }).getByRole('listitem')).toHaveCount(1);
  await expect(page.getByRole('list', { name: 'Logged sets' })).toContainText('19');
});

test('the warmed notebook can follow the landing CTA offline', async ({ page, context }) => {
  await page.goto('/log');
  await expect(page.getByText('Offline ready', { exact: true })).toBeVisible({ timeout: 20_000 });
  await context.setOffline(true);
  await page.goto('/');
  await page.getByRole('link', { name: 'Log a set', exact: true }).first().click();
  await page.getByRole('spinbutton', { name: 'Reps' }).fill('14');
  await page.getByRole('button', { name: 'Log set' }).click();
  await expect(page.getByRole('list', { name: 'Logged sets' })).toContainText('14');
});
