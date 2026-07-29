/**
 * Visual regression — baselines must be generated on Linux CI (or docker-local),
 * not macOS, or pixels will not match. Tag: @visual
 *
 * Bootstrap (CI container):
 *   npx playwright test --grep @visual --update-snapshots
 * Then commit snapshots from the artifact.
 *
 * ---
 *
 * **There are deliberately no baselines committed right now.** The three that
 * were here (`guide-human-performance`, `exercise-squats`, `bundle-reduced`,
 * all `-linux`, dated 2026-07-22) were generated *before* the Modernist rebrand
 * and depicted the old dark navy/emerald design: black grounds, emerald CTAs,
 * rounded corners. Nothing in the product looks like that since `.131`.
 *
 * They were deleted rather than left in place because a known-wrong baseline is
 * worse than none. The first Linux run after billing clears would have failed
 * every case with an enormous diff, and the obvious response to "four huge
 * visual diffs" is `--update-snapshots` without looking — which launders
 * whatever the app happens to render that day into the new truth. Starting from
 * nothing forces one deliberate bootstrap instead.
 *
 * Note also that `home-reduced.png` **never had a baseline at all**, so that
 * case has been silently self-approving on every first run since it was
 * written: the homepage, the most-linked page in the product, was never
 * visually guarded. Bootstrapping now covers it for the first time.
 *
 * `npm run gate` does not include this suite (it prints so at the end) — it
 * needs a Linux container, and Actions is billing-blocked. This is the one
 * gate that is genuinely dark until that clears.
 */
import { test, expect } from '@playwright/test';

test.describe('visual regression @visual', () => {
  test.beforeEach(async ({ page }) => {
    // Freeze ticker / Reveal animations (honored by index.css prefers-reduced-motion)
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('guide human-performance @visual', async ({ page }) => {
    await page.goto('/guide/human-performance', { waitUntil: 'networkidle' });
    await expect(page).toHaveScreenshot('guide-human-performance.png', {
      maxDiffPixelRatio: 0.02,
      fullPage: true,
    });
  });

  test('exercise squats @visual', async ({ page }) => {
    await page.goto('/exercises/squats', { waitUntil: 'networkidle' });
    await expect(page).toHaveScreenshot('exercise-squats.png', {
      maxDiffPixelRatio: 0.02,
      fullPage: true,
    });
  });

  test('home reduced-motion @visual', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page).toHaveScreenshot('home-reduced.png', {
      maxDiffPixelRatio: 0.02,
      fullPage: true,
    });
  });

  /**
   * `/bundle` is only reachable when FREE_BETA is off, and `isFreeBeta()` defaults
   * **true** — the CI job sets `PRIVATE_MODE=false` but nothing sets
   * `NEXT_PUBLIC_FREE_BETA`, so today the route 307s to `/log`.
   *
   * Bootstrapping baselines in that state would have written `bundle-reduced.png`
   * containing the **Today page**, then compared every future run against it and
   * passed. A baseline whose name and contents disagree is worse than no baseline —
   * it is the laundering this file's own header warns about, arriving through the
   * front door.
   *
   * So: skip while the redirect is live, and resume automatically the day Bundle
   * ships. Verified, not assumed — the check is the landing URL, not the flag.
   */
  test('bundle reduced-motion @visual', async ({ page }) => {
    await page.goto('/bundle', { waitUntil: 'networkidle' });
    const landed = new URL(page.url()).pathname;
    test.skip(
      landed !== '/bundle',
      `/bundle redirects to ${landed} while FREE_BETA is on — refusing to snapshot a page under the wrong name`
    );
    await expect(page).toHaveScreenshot('bundle-reduced.png', {
      maxDiffPixelRatio: 0.02,
      fullPage: true,
    });
  });
});
