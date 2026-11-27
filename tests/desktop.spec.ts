import { expect, test, type Page } from '@playwright/test';
import { audit, shot } from './notebookChecks';

async function sitsBeside(page: Page, left: string, right: string) {
  const a = await page.locator(left).boundingBox();
  const b = await page.locator(right).boundingBox();
  expect(a).not.toBeNull();
  expect(b).not.toBeNull();
  expect(b!.x).toBeGreaterThanOrEqual(a!.x + a!.width - 1);
  expect(b!.y).toBeLessThan(a!.y + a!.height);
}

for (const viewport of [{ width: 1440, height: 900 }, { width: 1280, height: 800 }]) {
  const size = `${viewport.width}×${viewport.height}`;
  test(`desktop notebook: keyboard logging, split screens and axe at ${size}`, async ({ page }, testInfo) => {
    const desktop = testInfo.project.use.viewport;
    expect(desktop).toEqual({ width: 1440, height: 900 });
    if (viewport.width !== desktop?.width) await page.setViewportSize(viewport);
    const save = (name: string) => shot(page, `desktop/${viewport.width}x${viewport.height}/${name}.png`);
    const rail = page.getByRole('navigation', { name: 'Training notebook' });
    await page.goto('/log');
    await expect(rail).toBeVisible();
    await expect(rail.getByRole('link', { name: 'Today' })).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('.desktop-rail .brand')).toBeVisible();
    await expect(page.locator('.desktop-rail .device-status')).toBeVisible();
    await expect(page.locator('.rail-status .eyebrow')).not.toBeEmpty();
    await expect(page.locator('.dock')).toBeHidden();
    await sitsBeside(page, '.start-panel', '.today-aside section:first-child');
    await sitsBeside(page, '.today-aside section:first-child', '.today-aside section:last-child');
    await audit(page, viewport.width);
    await save('01-today');

    await page.getByRole('button', { name: 'Start workout' }).click();
    await page.getByRole('spinbutton', { name: 'Added load' }).fill('5');
    const reps = page.getByRole('spinbutton', { name: 'Reps' });
    await reps.fill('12');
    await reps.press('Enter');
    await expect(reps).toBeFocused();
    await expect(reps).toHaveCSS('outline-style', 'solid');
    await expect(page.getByRole('list', { name: 'Logged sets' })).toContainText('12');
    await sitsBeside(page, '.train-movements', '.exercise-panel');
    await sitsBeside(page, '.set-form', '.set-record');
    await audit(page, viewport.width);
    await save('02-train');
    await page.getByRole('button', { name: 'Finish workout' }).click();
    await expect(page.getByRole('heading', { name: 'Victory.' })).toBeVisible();
    await audit(page, viewport.width);
    await save('03-victory');

    await page.getByRole('link', { name: 'Plan with Coach' }).click();
    await expect(page.locator('.citation')).toContainText('12');
    await page.getByRole('button', { name: 'Generate week' }).click();
    await page.locator('.plan-list summary').first().click();
    await expect(page.getByRole('button', { name: 'Start session' })).toBeVisible();
    await sitsBeside(page, '.plan-list > :first-child', '.plan-list > :nth-child(2)');
    await audit(page, viewport.width);
    await save('04-coach');

    await page.getByRole('button', { name: 'Start session' }).click();
    const sessionReps = page.getByRole('spinbutton', { name: 'Reps' });
    await sessionReps.fill('7');
    await sessionReps.press('Enter');
    await expect(sessionReps).toBeFocused();
    await page.getByRole('button', { name: 'Finish workout' }).click();
    await rail.getByRole('link', { name: 'History' }).click();
    const detail = page.getByRole('region', { name: 'Workout detail' });
    await expect(detail.locator('.history-movement li strong').first()).toContainText('7 ×');
    const quick = page.getByRole('button', { name: /Quick workout/ });
    await quick.press('Enter');
    await expect(quick).toHaveAttribute('aria-pressed', 'true');
    await expect(detail.locator('.history-movement li strong').first()).toContainText('12 ×');
    await sitsBeside(page, '.history-layout .history-list', '.history-detail');
    await audit(page, viewport.width);
    await save('05-history');

    await rail.getByRole('link', { name: 'Today' }).click();
    await expect(page.getByText('2 workouts logged.')).toBeVisible();
    await expect(page.locator('.today-aside section:first-child')).toContainText('Full Body Strength');
    await save('07-today-with-history');

    await rail.getByRole('link', { name: 'You' }).click();
    await sitsBeside(page, '.you-grid .data-panel:nth-last-child(2)', '.you-grid .data-panel:last-child');
    await audit(page, viewport.width);
    await save('06-you');
  });
}
