import { expect, type Page } from '@playwright/test';

/**
 * One red action per screen — measured by what the athlete sees, not by a class.
 *
 * The existing assertion is `expect(page.locator('.primary-action')).toHaveCount(1)`.
 * It is true, it has always been true, and it did not stop `.194` putting a
 * **second poster-red button on Today**: that button was a default-variant
 * shadcn `Button`, so it rendered `bg-primary-fill` — the same red family — while
 * never carrying the `.primary-action` class the test counts.
 *
 * A test that counts a class name is measuring the implementation. The design
 * rule is about colour, so this measures colour: every visible button's computed
 * background, matched against the three reds the design system defines
 * (`--accent-poster` #ec3013, `--primary-fill` #dd2b0f, `--primary` #ae1800).
 */

/** The poster-red family, as rendered. Kept in sync with `src/index.css` §tokens. */
const RED_RGB: [number, number, number][] = [
  [236, 48, 19], // --accent-poster
  [221, 43, 15], // --primary-fill
  [174, 24, 0], // --primary
];

/** Generous enough for hover/alpha compositing, tight enough to exclude paper and ink. */
const TOLERANCE = 24;

function isRed(rgb: string): boolean {
  const m = /rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/.exec(rgb);
  if (!m) return false;
  const [r, g, b] = [Number(m[1]), Number(m[2]), Number(m[3])];
  // Fully transparent backgrounds report a colour they do not paint.
  const alpha = /rgba\([^)]*,\s*([\d.]+)\s*\)/.exec(rgb);
  if (alpha && Number(alpha[1]) === 0) return false;
  return RED_RGB.some(
    ([rr, rg, rb]) =>
      Math.abs(r - rr) <= TOLERANCE &&
      Math.abs(g - rg) <= TOLERANCE &&
      Math.abs(b - rb) <= TOLERANCE
  );
}

/**
 * The dock owns red; the cards do not.
 *
 * Today's one red action is the docked hero above the tab bar. Everything in
 * `main` is a card, and a red fill there competes with it. Stating the rule that
 * way — rather than "at most one red button on the page" — matters: the hero
 * renders a *grey* Just Go variant in some states, so a page-wide count of one
 * was satisfied by the offending card button alone while the real CTA was not
 * even red. The first version of this guard passed with the bug in place for
 * exactly that reason.
 */
export async function expectOneRedAction(page: Page, where: string): Promise<void> {
  const inCards = await redControls(page, 'main button, main a[role="button"], main select');
  expect(
    inCards,
    `${where}: card surfaces must not use the docked action's red — found ${inCards.length}: ${inCards.join(' · ')}`
  ).toEqual([]);

  const inDock = await redControls(page, '#screen-dock button');
  expect(
    inDock.length,
    `${where}: the dock may hold one red action, found ${inDock.length}: ${inDock.join(' · ')}`
  ).toBeLessThanOrEqual(1);
}

/**
 * The general rule, for every screen that is not Today.
 *
 * `expectOneRedAction` above encodes Today's *stricter* form — zero red in
 * `main`, because Today has a dock and the dock owns red. Applying that verbatim
 * to `/history` or `/move` would be wrong rather than strict: those screens have
 * no dock, so their one legitimate red action lives in `main`.
 *
 * So this counts red across the card surfaces and the dock together and allows
 * one. `.241` — until then the colour rule ran on `/log` alone, and
 * `check-display-type`'s static half only scans `src/components/today`, so a
 * shared component could put a second red fill on any of the other fifteen
 * routes and nothing would say so. `EmptyState` was doing exactly that on nine.
 */
export async function expectAtMostOneRedAction(page: Page, where: string): Promise<void> {
  const red = await redControls(
    page,
    'main button, main a[role="button"], main select, #screen-dock button'
  );
  expect(
    red.length,
    `${where}: at most one red action per screen, found ${red.length}: ${red.join(' · ')}`
  ).toBeLessThanOrEqual(1);
}

/** The same measurement, as a number, for the `.241` per-route ratchet. */
export async function redActionCount(page: Page): Promise<number> {
  const red = await redControls(
    page,
    'main button, main a[role="button"], main select, #screen-dock button'
  );
  return red.length;
}

async function redControls(page: Page, selector: string): Promise<string[]> {
  const red: string[] = [];
  for (const control of await page.locator(selector).all()) {
    if (!(await control.isVisible().catch(() => false))) continue;
    const box = await control.boundingBox();
    if (!box || box.width === 0 || box.height === 0) continue;
    const bg = await control.evaluate((el) => getComputedStyle(el).backgroundColor);
    if (isRed(bg)) {
      red.push(`${(await control.textContent())?.trim().slice(0, 28) || '(no text)'} [${bg}]`);
    }
  }
  return red;
}
