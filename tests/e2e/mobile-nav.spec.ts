import { test, expect } from '@playwright/test';
import { gateRequired, unlockGate } from './helpers/gate';
import { seedLegacyOnboarding } from './helpers/journey';

/**
 * The tab bar, as a budget rather than an opinion.
 *
 * The bar used to render all thirteen rail screens on a horizontal scroller:
 * 13 × 68px is 884px of track in a 390px window, so seven destinations were
 * off-screen with no affordance saying so — including the only route to
 * sign-in and settings. Nothing failed, because nothing measured it.
 *
 * These two facts are what the redesign is for, so they get tests instead of a
 * design review: the bar fits, and every screen is still reachable.
 */

/** Taps from any app screen to any other. One for a tab, two via More. */
const REACH_BUDGET = 2;

/** The thirteen signed-in screens `railGroupsForNav()` declares. */
const RAIL_SCREENS = [
  '/log',
  '/active',
  '/coach',
  '/history',
  '/nutrition',
  '/move',
  '/mind',
  '/track',
  '/learn',
  '/assessments',
  '/library',
  '/builder',
  '/profile',
] as const;

test.describe('Mobile navigation @gate', () => {
  test.beforeEach(async ({ page, context, baseURL }) => {
    if (!baseURL) throw new Error('baseURL required');
    const ok = await unlockGate(page, context, baseURL);
    if (gateRequired() && !ok) {
      test.skip(true, 'SMOKE_ACCESS_SECRET required to unlock private gate');
    }
    await seedLegacyOnboarding(page);
  });

  test('the tab bar fits the narrowest phone we support', async ({ page }) => {
    // 360px is the small-Android floor, narrower than the 390px design frame.
    await page.setViewportSize({ width: 360, height: 780 });
    await page.goto('/log', { waitUntil: 'domcontentloaded' });

    const bar = page.locator('nav.fixed.bottom-0');
    await expect(bar).toBeVisible();

    // Geometry, not class names: a `overflow-x-auto` that comes back would pass
    // any assertion about what the markup says and fail the user.
    const overflow = await bar.evaluate((el) => {
      const track = el.firstElementChild as HTMLElement;
      return { scroll: track.scrollWidth, client: track.clientWidth };
    });
    expect(
      overflow.scroll,
      `tab track is ${overflow.scroll}px inside ${overflow.client}px`
    ).toBeLessThanOrEqual(overflow.client + 1);

    // Five slots, all thumb-sized.
    const slots = bar.locator('a, button');
    await expect(slots).toHaveCount(5);
    for (const slot of await slots.all()) {
      const box = await slot.boundingBox();
      expect(box, 'tab slot must have a hit area').not.toBeNull();
      expect(box!.height, 'tab slot height').toBeGreaterThanOrEqual(44);
    }
  });

  test('every rail screen is reachable within the tap budget', async ({ page }) => {
    // networkidle — this case opens the sheet, and More only works once
    // hydrated. See the Escape case below.
    await page.goto('/log', { waitUntil: 'networkidle' });

    const bar = page.locator('nav.fixed.bottom-0');
    const tabHrefs = await bar.locator('a').evaluateAll((els) =>
      els.map((el) => el.getAttribute('href') ?? '')
    );

    // Open the fifth tab once and read what it offers, rather than clicking
    // through thirteen navigations — the claim is about reachability, and a
    // link in an open sheet is one tap.
    await bar.getByRole('button', { name: /more/i }).click();
    const sheet = page.getByRole('dialog');
    await expect(sheet).toBeVisible();
    const sheetHrefs = await sheet.locator('a').evaluateAll((els) =>
      els.map((el) => el.getAttribute('href') ?? '')
    );

    const unreachable: string[] = [];
    for (const screen of RAIL_SCREENS) {
      const taps = tabHrefs.includes(screen) ? 1 : sheetHrefs.includes(screen) ? 2 : Infinity;
      if (taps > REACH_BUDGET) unreachable.push(screen);
    }
    expect(unreachable, `screens with no route inside ${REACH_BUDGET} taps`).toEqual([]);

    // The sheet must not repeat what the bar already shows two inches below.
    const repeated = sheetHrefs.filter((h) => tabHrefs.includes(h));
    expect(repeated, 'More repeats a tab').toEqual([]);
  });

  test('the More sheet closes on Escape and restores focus', async ({ page }) => {
    // networkidle, not domcontentloaded: More is the one slot in the bar that
    // is a button rather than a link, so it does nothing at all until React
    // has hydrated and attached its handler.
    await page.goto('/log', { waitUntil: 'networkidle' });

    const trigger = page.locator('nav.fixed.bottom-0').getByRole('button', { name: /more/i });
    await expect(trigger).toBeVisible();
    await trigger.click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    // Focus must come back to the trigger, or a keyboard user is stranded.
    await expect(trigger).toBeFocused();
  });
});
