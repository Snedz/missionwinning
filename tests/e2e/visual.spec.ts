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
 * visually guarded.
 *
 * The first bootstrap did **not** cover it, and this paragraph said it would.
 * The runner was serving the gated build, so what got written under that name
 * was `/private`. See the `.255` note on `shoot()` below. The homepage is still
 * unguarded, and will be until a bootstrap runs with the workflow env fixed.
 *
 * `npm run gate` does not include this suite (it prints so at the end) — it
 * needs a Linux container, and Actions is billing-blocked. This is the one
 * gate that is genuinely dark until that clears.
 */
import { test, expect } from '@playwright/test';

/**
 * `.255` — the landing-URL check is no longer optional, because the case that
 * had it was the only one that survived.
 *
 * `/bundle` checked where it actually landed and refused to snapshot a redirect
 * (see its note below). The other three did not, and the first bootstrap run
 * proved why that mattered: `visual-regression` set `PRIVATE_MODE: 'false'` on
 * the *assertion* step, so the build and the server never saw it, the private
 * gate defaulted on (`NODE_ENV=production` + unset — `privateGate.ts:23`), and
 * `/` is not in `PRIVATE_GATE_PUBLIC_PATHS`. `home-reduced.png` was a picture
 * of `/private`, under the name of the most-linked page in the product.
 *
 * The workflow env is fixed. This is here because fixing the env only fixes the
 * cause we found: any future redirect — a flag flip, a new gate, a locale
 * prefix — puts the wrong page under the right name again, and a baseline is
 * exactly the artifact nobody re-reads. So every case states where it must land
 * and none of them can skip the check, which is the difference between this and
 * a convention.
 */
type VisualCase = {
  path: string;
  name: string;
  /**
   * Set only when the route legitimately redirects *today* and the case should
   * resume by itself when that stops being true. A redirect with no stated
   * reason is a failure: silently skipping is `.200`'s check that cannot fail.
   */
  skipWhenRedirected?: string;
};

async function shoot(page: import('@playwright/test').Page, c: VisualCase) {
  await page.goto(c.path, { waitUntil: 'networkidle' });
  const landed = new URL(page.url()).pathname;

  if (landed !== c.path) {
    test.skip(
      !!c.skipWhenRedirected,
      `${c.path} redirects to ${landed} — ${c.skipWhenRedirected ?? ''}`
    );
    expect(
      landed,
      `${c.path} redirected to ${landed}, so this would save ${landed} under the name ` +
        `"${c.name}". Refusing. If the runner is serving the gated build, that is the ` +
        `workflow's env block, not this test — see .github/workflows/ci-extended.yml.`
    ).toBe(c.path);
  }

  await expect(page).toHaveScreenshot(c.name, {
    maxDiffPixelRatio: 0.02,
    fullPage: true,
  });
}

test.describe('visual regression @visual', () => {
  test.beforeEach(async ({ page }) => {
    // Freeze ticker / Reveal animations (honored by index.css prefers-reduced-motion)
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('guide human-performance @visual', async ({ page }) => {
    await shoot(page, { path: '/guide/human-performance', name: 'guide-human-performance.png' });
  });

  test('exercise squats @visual', async ({ page }) => {
    await shoot(page, { path: '/exercises/squats', name: 'exercise-squats.png' });
  });

  test('home reduced-motion @visual', async ({ page }) => {
    await shoot(page, { path: '/', name: 'home-reduced.png' });
  });

  /**
   * `/bundle` is the Super Bundle shop. Checkout stays muted while FREE_BETA
   * is on (`isPaidCheckoutAllowed`). Snapshot the merchandising page.
   */
  test('bundle reduced-motion @visual', async ({ page }) => {
    await shoot(page, {
      path: '/bundle',
      name: 'bundle-reduced.png',
      skipWhenRedirected:
        'Bundle redirected (private gate or surface park). Refusing to snapshot it under the wrong name.',
    });
  });
});
