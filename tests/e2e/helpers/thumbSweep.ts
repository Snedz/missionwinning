import { expect, type Page } from '@playwright/test';

/**
 * 44px is the floor for one-thumb use outdoors.
 *
 * This lived inline in `first-90.spec.ts`, scoped to `/active` alone — which is
 * why a 36px `size="sm"` button on Today survived the sweep entirely. A test
 * named "every control is thumb-sized" that only sweeps one screen is not
 * measuring what it is named for, so the sweep is a helper now and every screen
 * that takes taps calls it.
 *
 * Measured on real rendered boxes rather than trusting a utility class to still
 * be applied — a class can be overridden, and the athlete presses pixels.
 */
export const MIN_TAP_HEIGHT = 44;

/**
 * `#screen-dock` is in the scope from `.153`: the ± steppers and Log moved out
 * of `main` into the docked console, and a scope of `main` alone would have
 * quietly stopped covering the exact controls the sweep is about.
 */
const CONTROL_SELECTOR =
  'main button, [role="main"] button, #screen-dock button, main select, #screen-dock select';

export async function expectThumbSized(page: Page, where: string): Promise<void> {
  const undersized: string[] = [];
  for (const control of await page.locator(CONTROL_SELECTOR).all()) {
    if (!(await control.isVisible().catch(() => false))) continue;
    const box = await control.boundingBox();
    if (!box) continue;
    // Genuinely inline affordances with no independent hit area.
    if (box.width === 0 || box.height === 0) continue;
    if (box.height < MIN_TAP_HEIGHT) {
      const label = (await control.textContent())?.trim().slice(0, 24) || '(no text)';
      undersized.push(`${label} h=${Math.round(box.height)}`);
    }
  }
  expect(
    undersized,
    `${where}: controls under ${MIN_TAP_HEIGHT}px tall: ${undersized.join(', ')}`
  ).toEqual([]);
}
