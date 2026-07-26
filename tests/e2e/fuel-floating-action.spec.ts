import { test, expect } from '@playwright/test';
import { gateRequired, unlockGate } from './helpers/gate';
import { seedLegacyOnboarding } from './helpers/journey';

/**
 * The Fuel floating action must not swallow the page's own controls.
 *
 * `/nutrition` renders "Log food" as a viewport-fixed FAB in the bottom-end
 * corner while stacking its secondary actions ("Log weight", "Edit targets",
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
 */

/** Viewport the bug was reported at; the narrowest layout we support. */
const MOBILE = { width: 375, height: 812 };

type Control = { label: string; overlapPx: number; x: [number, number] };

test.describe('Fuel floating action', () => {
  test.beforeEach(async ({ page, context, baseURL }) => {
    if (!baseURL) throw new Error('baseURL required');
    const ok = await unlockGate(page, context, baseURL);
    if (gateRequired() && !ok) {
      test.skip(true, 'SMOKE_ACCESS_SECRET required to unlock private gate');
    }
  });

  test('no Fuel control shares the floating action’s column', async ({ page }) => {
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

    // ─────────────────────────────────────────────────────────────────────────
    // TODO(founder): decide the policy for the *rest* of the column.
    //
    // `controls` currently reports 13 more controls with a non-zero overlapPx
    // ("Edit targets", "Use base", the meal tabs, "Load from Cloud", …). Write
    // the assertion that encodes how strict this repo wants to be. Options:
    //
    //   a) Only the named control is guarded (delete this block) — narrowest,
    //      always green, guards only the reported regression.
    //   b) No control may be *fully* occluded (overlapPx < its own width) —
    //      tolerates a FAB clipping a wide control's edge, catches the case
    //      where a small button vanishes entirely. Some current controls fail.
    //   c) No control may overlap at all (every overlapPx === 0) — strictest,
    //      turns the whole column into a no-go zone. Fails today until every
    //      Fuel action is moved, so it is a ratchet, not a gate, unless that
    //      work lands first.
    //
    // Whichever you pick, tag the describe block `@gate` only if it passes —
    // `npm run gate` is the only thing guarding master while Actions is blocked.
    // ─────────────────────────────────────────────────────────────────────────
  });
});
