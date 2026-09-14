import { test, expect } from '@playwright/test';
import { gateRequired, unlockGate } from './helpers/gate';
import { seedLegacyOnboarding } from './helpers/journey';
import {
  houseFloor,
  houseMoreDialog,
  houseMoreTrigger,
  openHouseMore,
} from './helpers/houseChrome';

/**
 * House leftover floor rail, as a budget rather than the retired Primary tab bar.
 *
 * Compact chrome is Today / Train / Library / You / More. Pillars live in the
 * quiet More foot — not on the floor, and not gated on first workout the way
 * `.695` demoted RAIL_GROUPS. Do not look for `nav[aria-label=Primary]` or Search.
 */

/** Taps from any app screen to any other. One for a floor link, two via More. */
const REACH_BUDGET = 2;

const FLOOR_HREFS = ['/log', '/active', '/library', '/account'] as const;

const MORE_ROOMS = ['/nutrition', '/profile', '/account'] as const;

/** Quiet leftover foot — always listed, never a floor icon. */
const QUIET_PILLARS = ['/move', '/mind', '/track', '/learn'] as const;

test.describe('Mobile navigation @gate', () => {
  test.beforeEach(async ({ page, context, baseURL }) => {
    if (!baseURL) throw new Error('baseURL required');
    const ok = await unlockGate(page, context, baseURL);
    if (gateRequired() && !ok) {
      test.skip(true, 'SMOKE_ACCESS_SECRET required to unlock private gate');
    }
    await seedLegacyOnboarding(page);
  });

  test('the floor rail fits the narrowest phone we support', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await page.goto('/log', { waitUntil: 'domcontentloaded' });

    const bar = houseFloor(page);
    await expect(bar).toBeVisible();

    const overflow = await bar.evaluate((el) => {
      return { scroll: el.scrollWidth, client: el.clientWidth };
    });
    expect(
      overflow.scroll,
      `floor track is ${overflow.scroll}px inside ${overflow.client}px`
    ).toBeLessThanOrEqual(overflow.client + 1);

    const slots = bar.locator('a, button');
    await expect(slots).toHaveCount(5);
    for (const slot of await slots.all()) {
      const box = await slot.boundingBox();
      expect(box, 'floor slot must have a hit area').not.toBeNull();
      // Train plus is a 40px leftover circle; other slots are ≥44.
      const plus = await slot.evaluate((el) => el.classList.contains('house-rail-plus'));
      expect(box!.height, 'floor slot height').toBeGreaterThanOrEqual(plus ? 40 : 44);
    }
  });

  async function readReach(page: import('@playwright/test').Page) {
    const { sheet } = await openHouseMore(page);

    const bar = houseFloor(page);
    const tabHrefs = await bar.locator('a').evaluateAll((els) =>
      els.map((el) => el.getAttribute('href') ?? '')
    );
    const sheetHrefs = await sheet.locator('a').evaluateAll((els) =>
      els.map((el) => el.getAttribute('href') ?? '')
    );

    const taps = (screen: string) =>
      tabHrefs.includes(screen) ? 1 : sheetHrefs.includes(screen) ? 2 : Infinity;

    return { tabHrefs, sheetHrefs, taps };
  }

  test('pillars sit in quiet More, not on the floor', async ({ page }) => {
    const { tabHrefs, taps } = await readReach(page);

    const onFloor = QUIET_PILLARS.filter((s) => tabHrefs.includes(s));
    expect(onFloor, 'leftover pillars must not take a floor slot').toEqual([]);

    const unreachable = [...FLOOR_HREFS, ...MORE_ROOMS, ...QUIET_PILLARS].filter(
      (s) => taps(s) > REACH_BUDGET
    );
    expect(unreachable, `screens with no route inside ${REACH_BUDGET} taps`).toEqual([]);
  });

  test('every leftover room is reachable within the tap budget', async ({ page }) => {
    const { taps } = await readReach(page);

    const reachable = [...FLOOR_HREFS, ...MORE_ROOMS, ...QUIET_PILLARS];
    const unreachable = reachable.filter((s) => taps(s) > REACH_BUDGET);
    expect(unreachable, `screens with no route inside ${REACH_BUDGET} taps`).toEqual([]);
  });

  test('the More sheet closes on Escape and restores focus', async ({ page }) => {
    await page.goto('/log', { waitUntil: 'domcontentloaded' });

    const trigger = houseMoreTrigger(page);
    await expect(trigger).toBeVisible();
    await trigger.click();
    await expect(houseMoreDialog(page)).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(houseMoreDialog(page)).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });
});
