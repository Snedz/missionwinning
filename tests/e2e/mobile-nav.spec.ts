import { test, expect } from '@playwright/test';
import { gateRequired, unlockGate } from './helpers/gate';
import { seedLegacyOnboarding } from './helpers/journey';
import { gotoHydrated } from './helpers/gotoHydrated';

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

/**
 * `.765` — the reachability claim is now *conditional*, and it has been failing
 * on `master` since `.695` because it was not.
 *
 * `.695` demoted the six-pillar chrome until the first logged workout:
 * `railGroupsForNav({ hasFirstWorkout: false })` drops the whole Pillars group,
 * which is exactly what `pillarChromeGate.test.ts` requires. This case seeded a
 * fresh device and then asserted all thirteen screens were two taps away, so it
 * asserted the opposite of a shipped decision and went red every run — a check
 * saturated at red measures as little as one saturated at green.
 *
 * So it now tests both halves of the decision: the pillars are *absent* before
 * the first workout, and every screen is inside the budget once one exists. The
 * fresh-device half is the stronger assertion, because it is the one that would
 * catch the options wall coming back to I-Day.
 *
 * `/assessments` is not a More row — PAR-Q is coach-generate intake
 * (`moreSheetTiers.test.ts`). REACH_BUDGET stays 2.
 */
const ALWAYS_REACHABLE = [
  '/log',
  '/active',
  '/coach',
  /* Fuel is the fourth tab, so it survives the demotion the rail group does not. */
  '/nutrition',
  '/history',
  '/library',
  '/builder',
  '/profile',
] as const;

/** Dropped from the rail until `basic.workout` — see `.695`. */
const PILLAR_SCREENS = ['/move', '/mind', '/track', '/learn'] as const;

const RAIL_SCREENS = [...ALWAYS_REACHABLE, ...PILLAR_SCREENS] as const;

/** One completed session, in the shape `workoutStore`'s persist layer writes. */
const SEEDED_HISTORY = {
  state: {
    workoutHistory: [
      {
        id: 'nav-reach-1',
        workoutName: 'Seeded session',
        completedAt: new Date().toISOString(),
        durationSeconds: 600,
        totalVolume: 1000,
        totalSets: 4,
        exercises: [],
      },
    ],
    savedWorkouts: [],
    activeWorkout: null,
  },
  version: 0,
};

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

    const bar = page.getByRole('navigation', { name: /primary/i });
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

  /**
   * Open the fifth tab once and read what it offers, rather than clicking
   * through thirteen navigations — the claim is about reachability, and a link
   * in an open sheet is one tap.
   */
  async function readReach(page: import('@playwright/test').Page) {
    // More is a button, not a link — click is a no-op until React hydrates.
    // `networkidle` never fires on `npm run dev` (HMR / long-lived fetches).
    await gotoHydrated(page, '/log');

    const bar = page.getByRole('navigation', { name: /primary/i });
    const tabHrefs = await bar.locator('a').evaluateAll((els) =>
      els.map((el) => el.getAttribute('href') ?? '')
    );

    await bar.getByRole('button', { name: /more/i }).click();
    const sheet = page.getByRole('dialog');
    await expect(sheet).toBeVisible();
    const sheetHrefs = await sheet.locator('a').evaluateAll((els) =>
      els.map((el) => el.getAttribute('href') ?? '')
    );

    const taps = (screen: string) =>
      tabHrefs.includes(screen) ? 1 : sheetHrefs.includes(screen) ? 2 : Infinity;

    return { tabHrefs, sheetHrefs, taps };
  }

  test('before the first workout the pillars are not on the rail at all', async ({ page }) => {
    const { tabHrefs, sheetHrefs, taps } = await readReach(page);

    const present = PILLAR_SCREENS.filter((s) => taps(s) <= REACH_BUDGET);
    expect(
      present,
      'F-004 / `.695`: the six-pillar chrome stays demoted until a workout exists'
    ).toEqual([]);

    // …and demotion may not cost anything else its route.
    const unreachable = ALWAYS_REACHABLE.filter((s) => taps(s) > REACH_BUDGET);
    expect(unreachable, `screens with no route inside ${REACH_BUDGET} taps`).toEqual([]);

    const repeated = sheetHrefs.filter((h) => tabHrefs.includes(h));
    expect(repeated, 'More repeats a tab').toEqual([]);
  });

  test('every rail screen is reachable within the tap budget', async ({ page }) => {
    // The gate signal is workout history length, the same fact as `basic.workout`.
    await page.addInitScript((seed) => {
      localStorage.setItem('workout-tracker-storage', JSON.stringify(seed));
    }, SEEDED_HISTORY);

    const { tabHrefs, sheetHrefs, taps } = await readReach(page);

    const unreachable = RAIL_SCREENS.filter((s) => taps(s) > REACH_BUDGET);
    expect(unreachable, `screens with no route inside ${REACH_BUDGET} taps`).toEqual([]);

    // The sheet must not repeat what the bar already shows two inches below.
    const repeated = sheetHrefs.filter((h) => tabHrefs.includes(h));
    expect(repeated, 'More repeats a tab').toEqual([]);
  });

  test('the More sheet closes on Escape and restores focus', async ({ page }) => {
    // More is a button, not a link — click is a no-op until React hydrates.
    // `networkidle` never fires on `npm run dev` (HMR / long-lived fetches).
    await gotoHydrated(page, '/log');

    const trigger = page.getByRole('navigation', { name: /primary/i }).getByRole('button', { name: /more/i });
    await expect(trigger).toBeVisible();
    await trigger.click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    // Focus must come back to the trigger, or a keyboard user is stranded.
    await expect(trigger).toBeFocused();
  });
});
