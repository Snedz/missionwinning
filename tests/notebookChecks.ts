import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';
import { join } from 'node:path';

export async function audit(page: Page, width = 390) {
  expect(await page.evaluate(() => ({ width: innerWidth, contentWidth: document.documentElement.scrollWidth })))
    .toEqual({ width, contentWidth: width });
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(violations.map(({ id, nodes }) => ({ id, targets: nodes.map(({ target }) => target) }))).toEqual([]);
}

export async function shot(page: Page, file: string) {
  const dir = process.env.V2_SCREENSHOTS_DIR;
  if (!dir) return;
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await page.screenshot({ path: join(dir, file), animations: 'disabled' });
}
