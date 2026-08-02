import { test, expect } from '@playwright/test';
import { gateRequired, unlockGate } from './helpers/gate';
import { seedLegacyOnboarding } from './helpers/journey';

/**
 * The Fuel floating action must not swallow the page's own controls.
 *
 * `/nutrition` renders "Log food" as a viewport-fixed FAB in the bottom-end
 * corner, and used to stack its secondary actions ("Log weight", "Edit targets",
 * "Use base", …) down the same end-aligned column. A fixed overlay owns its
 * viewport rectangle at every scroll offset, so any control sharing that
 * rectangle's x-range disappears underneath it at some point in the scroll —
 * which is how "Log weight" shipped 100% occluded at 375px.
 *
 * The invariant asserted here is deliberately **horizontal and
 * scroll-independent**: if a control shares no x-range with the FAB, no scroll
 * offset can ever hide it. Testing actual scroll positions instead would be
 * flaky and would only sample the offsets the test happened to pick.
 *
 * Page bottom padding is NOT the fix and is not what this guards — the document
 * end already clears the FAB by ~65px. The bug is mid-page collision.
 *
 * ## The policy, and why this one
 *
 * A control may *share* the column; it may not *be* the column. Concretely:
 * `overlapPx < width`. A wide control clipped at one edge stays visible and
 * reachable at every offset. A control narrower than the overlap is somewhere
 * inside the FAB's x-range entirely, so the offset that brings it level with
 * the FAB hides 100% of it — which is what "Log weight" shipped.
 *
 * Demanding zero overlap instead would make the column a no-go zone and fail
 * every full-width control on the page (the meal input alone is 295px wide
 * against a 121px FAB), so it could only ever be a ratchet, never a gate.
 * Guarding "Log weight" alone would re-guard one bug and none of its siblings —
 * this same policy caught four live ones the day it was written: "Use base",
 * "Edit targets", the "Snack" meal tab, and the water stepper's "+".
 */

/** Viewport the bug was reported at; the narrowest layout we support. */
const MOBILE = { width: 375, height: 812 };

type Control = { label: string; overlapPx: number; width: number; x: [number, number] };

test.describe('Fuel floating action @gate', () => {
  test.beforeEach(async ({ page, context, baseURL }) => {
    if (!baseURL) throw new Error('baseURL required');
    const ok = await unlockGate(page, context, baseURL);
    if (gateRequired() && !ok) {
      test.skip(true, 'SMOKE_ACCESS_SECRET required to unlock private gate');
    }
  });

  test('no Fuel control disappears into the floating action’s column', async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await seedLegacyOnboarding(page);
    await page.goto('/nutrition', { waitUntil: 'domcontentloaded' });

    const fab = page.getByRole('button', { name: /log food/i }).first();
    await expect(fab, 'the Fuel FAB should be present').toBeVisible({ timeout: 15_000 });

    /** Every enabled control in the page body, measured against the FAB's x-range. */
    const controls: Control[] = await page.evaluate(() => {
      const main = document.querySelector('main');
      if (!main) throw new Error('app shell <main> not found');

      const floating = [...main.querySelectorAll('button')].find(
        (b) => /log food/i.test(b.textContent ?? '') && getComputedStyle(b).position === 'fixed'
      );
      if (!floating) throw new Error('fixed Fuel FAB not found');
      const f = floating.getBoundingClientRect();

      return [...main.querySelectorAll('button, a[href], input, select, textarea')]
        .filter((el) => !floating.contains(el) && (el as HTMLElement).offsetParent !== null)
        .map((el) => {
          const r = el.getBoundingClientRect();
          return {
            label: (el.textContent || el.getAttribute('aria-label') || el.tagName).trim().slice(0, 40),
            x: [Math.round(r.left), Math.round(r.right)] as [number, number],
            width: Math.round(r.width),
            overlapPx: Math.round(
              Math.max(0, Math.min(r.right, f.right) - Math.max(r.left, f.left))
            ),
          };
        });
    });

    expect(controls.length, 'should have found Fuel controls to measure').toBeGreaterThan(5);

    // The control this guard was written for: it must never re-enter the column.
    const logWeight = controls.find((c) => /log weight/i.test(c.label));
    expect(logWeight, '"Log weight" should be on the page').toBeDefined();
    expect(
      logWeight?.overlapPx,
      '"Log weight" must not share the FAB column at any scroll offset'
    ).toBe(0);

    // The policy, applied to the whole column: no control may be *fully*
    // occluded. `width > 0` skips zero-size elements, for which the comparison
    // would hold vacuously (0 >= 0) and report a control that cannot be hidden
    // because it is not drawn.
    const fullyOccluded = controls.filter((c) => c.width > 0 && c.overlapPx >= c.width);
    expect(
      fullyOccluded,
      'these controls lie entirely inside the FAB column and vanish at some scroll offset'
    ).toEqual([]);
  });
});
