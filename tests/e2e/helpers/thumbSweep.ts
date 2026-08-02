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

/** Controls inside an open overlay panel, which lives outside `main`. */
export const DIALOG_CONTROL_SELECTOR =
  '[role="dialog"] button, [role="dialog"] select, [role="dialog"] input, [role="dialog"] textarea';

/**
 * `#screen-dock` is in the scope from `.153`: the ± steppers and Log moved out
 * of `main` into the docked console, and a scope of `main` alone would have
 * quietly stopped covering the exact controls the sweep is about.
 */
const CONTROL_SELECTOR =
  'main button, [role="main"] button, #screen-dock button, main select, #screen-dock select';

/**
 * Overlays are portaled to `document.body` (see `AdaptiveOverlay`), so they sit
 * outside every scope above. A sweep that only knows about `main` reports green
 * on a screen whose sheet is entirely untouched — the `.194` gap again, one
 * layer up. Callers that open an overlay pass its scope explicitly.
 */
/**
 * Nothing is mid-transition when we measure it.
 *
 * `.242` — the feedback-sheet case failed once in a full-suite run with
 * `(no text) h=44`, a control whose settled height is **exactly** 44 and whose
 * computed height never changes. `expect(dialog).toBeVisible()` resolves the
 * moment the sheet is in the DOM and painted, not when its open transition ends,
 * and `boundingBox()` reports the *rendered* box — so a scale transform still a
 * frame from identity returns 43.99, which `Math.round` then printed back as the
 * passing value `44`.
 *
 * Deliberately not solved by widening the threshold: `< 44 - 0.5` would let a
 * genuinely 43.6px control through forever to silence a race. `.224` made the
 * same call on `offline.spec.ts` — wait for the thing the product is already
 * doing rather than retry past it.
 *
 * A looping animation (a spinner) never finishes, so this is best-effort: on
 * timeout we measure anyway rather than fail on an unrelated animation.
 */
async function settle(page: Page): Promise<void> {
  await page
    .waitForFunction(
      () => document.getAnimations().every((a) => a.playState !== 'running'),
      undefined,
      { timeout: 1000 }
    )
    .catch(() => {});
}

export async function expectThumbSized(
  page: Page,
  where: string,
  scope = CONTROL_SELECTOR
): Promise<void> {
  await settle(page);
  const undersized: string[] = [];
  for (const control of await page.locator(scope).all()) {
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
