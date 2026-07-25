import { test, expect } from '@playwright/test';
import { gateRequired, unlockGate } from './helpers/gate';
import { seedLegacyOnboarding } from './helpers/journey';

/**
 * The first 90 seconds, as a budget rather than an opinion.
 *
 * Horizon W excellence criteria 1, 2 and 5 all live or die here: a cold visitor
 * should reach a logged set in a handful of taps, with one obvious thing to do on
 * each screen and no interstitial in the way. Regressions in this path are the most
 * expensive kind, so they get a failing test instead of a design review.
 */

/** Taps from a cold /welcome to a set on the board. Lower is better; never raise this. */
const TAP_BUDGET = 6;

test.describe('First 90 seconds @gate', () => {
  test.beforeEach(async ({ page, context, baseURL }) => {
    if (!baseURL) throw new Error('baseURL required');
    const ok = await unlockGate(page, context, baseURL);
    if (gateRequired() && !ok) {
      test.skip(true, 'SMOKE_ACCESS_SECRET required to unlock private gate');
    }
  });

  test('a cold visitor logs a set within the tap budget, with no interstitial', async ({
    page,
  }) => {
    let taps = 0;
    const tap = async (locator: import('@playwright/test').Locator, what: string) => {
      await expect(locator, `${what} should be reachable`).toBeVisible({ timeout: 15_000 });
      await locator.click();
      taps += 1;
    };

    // Genuinely cold: no seeded onboarding, no history.
    await page.goto('/welcome', { waitUntil: 'domcontentloaded' });

    await tap(page.getByRole('button', { name: /^begin$/i }).first(), 'Begin');
    await tap(page.getByRole('button', { name: /continue|continuar/i }).first(), 'Continue');
    await tap(
      page.getByRole('button', { name: /skip|omitir|first session/i }).first(),
      'Skip sign-in'
    );

    await expect(page).toHaveURL(/\/active/, { timeout: 15_000 });

    // Nothing may stand between arriving and logging. A check-in sheet here would be
    // an interstitial on the very first session (W1) — assert it is absent rather
    // than dismissing it, which is what made this regress before.
    await expect(
      page.getByRole('button', { name: /not now/i }),
      'no modal may intercept the first session'
    ).toHaveCount(0);

    const logBtn = page.getByRole('button', { name: /^log$/i }).first();
    await tap(logBtn, 'Log');

    // A logged set is visible progress, not a silent state change.
    await expect(page.getByRole('timer', { name: /rest/i })).toBeVisible({ timeout: 10_000 });

    expect(taps, `first set took ${taps} taps (budget ${TAP_BUDGET})`).toBeLessThanOrEqual(
      TAP_BUDGET
    );
  });

  test('the homepage uses the brand display face and one emerald action', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Regression: the hero H1 rendered in Inter for months because LandingPage set
    // ad-hoc type instead of `.display-hero`, while every other marketing page used
    // the briefing system. brand-guidelines.md assigns hero titles to Barlow Condensed.
    const font = await page
      .locator('h1')
      .first()
      .evaluate((el) => getComputedStyle(el).fontFamily);
    expect(font, `hero H1 font-family was ${font}`).toContain('Barlow Condensed');

    // Emerald marks the one action. Hero + closing band is the ceiling; a third
    // competing CTA is the "which button do I press" failure.
    await expect(page.locator('.primary-action')).toHaveCount(2);
  });

  /**
   * One page per SEO template. These ~250 URLs are most of the site, and until now the
   * assertion above covered `/` alone — which is exactly how `.126` fixed the Inter H1 on
   * one page and left it on 250.
   */
  const SEO_TEMPLATES = [
    '/exercises',
    '/exercises/push-ups',
    '/exercises/muscle/chest',
    '/exercises/equipment/bodyweight',
    '/compare',
    '/compare/forge',
    '/paths',
  ] as const;

  for (const path of SEO_TEMPLATES) {
    test(`${path} is on the design system and reachable @gate`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'domcontentloaded' });

      const h1 = page.locator('h1').first();
      await expect(h1).toBeVisible();

      const font = await h1.evaluate((el) => getComputedStyle(el).fontFamily);
      expect(font, `${path} H1 font-family was ${font}`).toContain('Barlow Condensed');

      // Geometry, not class names: the shared header hardcoded `max-w-4xl` while most
      // bodies were `max-w-3xl`, so the headline sat outdented from its own body copy.
      // Asserting the edges match survives refactors that a toHaveClass check would not.
      // Compared against main's *content* edge — both containers carry `px-5`, so the
      // border boxes coincide while the text sits one padding in.
      const [h1Left, mainTextLeft] = await Promise.all([
        h1.evaluate((el) => Math.round(el.getBoundingClientRect().left)),
        page.locator('main').first().evaluate((el) => {
          const r = el.getBoundingClientRect();
          return Math.round(r.left + parseFloat(getComputedStyle(el).paddingLeft));
        }),
      ]);
      expect(
        Math.abs(h1Left - mainTextLeft),
        `H1 left ${h1Left} vs main content left ${mainTextLeft}`
      ).toBeLessThanOrEqual(1);

      // A free product's best pages must have something to press above the fold.
      const actions = await page.locator('.primary-action').count();
      expect(actions, `${path} had ${actions} primary actions`).toBeGreaterThanOrEqual(1);

      // Legal has to be reachable from the page a visitor actually landed on, and the
      // pages that give exercise instructions are the ones that need the disclaimer.
      await expect(page.locator('footer a[href="/privacy"]')).toHaveCount(1);
      await expect(page.locator('footer a[href="/terms"]')).toHaveCount(1);
      await expect(page.getByText(/not medical advice/i).first()).toBeVisible();
    });
  }

  test('the content library is reachable on a phone @gate', async ({ page }) => {
    // MarketingNav hid every link behind `sm:flex` with no menu anywhere in the repo, so
    // at 390px a visitor could reach `/` and `/welcome` and nothing else.
    await page.goto('/exercises/push-ups', { waitUntil: 'domcontentloaded' });

    const trigger = page.getByRole('button', { name: /menu/i });
    await expect(trigger).toBeVisible();
    await trigger.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('link', { name: /exercises/i }).first()).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    // Focus must come back to the trigger, or a keyboard user is stranded mid-page.
    await expect(trigger).toBeFocused();
  });

  test('every URL in the sitemap resolves @gate', async ({ request }) => {
    // 94 of the 219 advertised exercise URLs used to 404: generateStaticParams read the
    // exercise catalog without awaiting the lazy extended modules, so only the base
    // ~126 prerendered. Nothing caught it because the sitemap got the full count from a
    // build worker that happened to have loaded them.
    const xml = await (await request.get('/sitemap.xml')).text();
    const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) =>
      m[1].replace(/^https?:\/\/[^/]+/, '')
    );
    expect(paths.length, 'sitemap looked empty').toBeGreaterThan(200);

    const broken: string[] = [];
    for (const p of paths) {
      const res = await request.get(p || '/', { maxRedirects: 0 });
      if (res.status() !== 200) broken.push(`${res.status()} ${p}`);
    }
    expect(broken, `sitemap advertises URLs that do not answer 200:\n${broken.join('\n')}`).toEqual(
      []
    );
  });

  test('the hero demo lets a visitor perform the product claim', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // The claim is "your week rewrites itself". If logging a set does not change what
    // the page says next, the homepage is asserting something it never shows.
    const logSet = page.getByRole('button', { name: /log set/i });
    await expect(logSet).toBeVisible({ timeout: 15_000 });
    for (let i = 0; i < 3; i++) await logSet.click();

    await expect(page.getByText(/next session/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test('Today offers exactly one primary action', async ({ page }) => {
    await page.goto('/log', { waitUntil: 'domcontentloaded' });
    // Two competing emerald CTAs is the "empty dashboard / chore list" failure mode.
    await expect(page.locator('.primary-action')).toHaveCount(1);
  });

  test('every control on the logger is thumb-sized', async ({ page }) => {
    // JourneyGuard sends a cold visitor to /welcome; this case is about an
    // established user opening the Train tab.
    await seedLegacyOnboarding(page);
    await page.goto('/active', { waitUntil: 'networkidle' });
    const start = page.getByRole('button', { name: /start workout/i });
    await expect(start).toBeEnabled({ timeout: 15_000 });
    await start.click();

    const search = page.getByPlaceholder(/search exercises/i);
    await expect(search).toBeVisible({ timeout: 10_000 });
    await search.fill('push-ups');
    await page.getByRole('option', { name: /push-ups/i }).first().click();
    await page.getByRole('button', { name: /add selected exercise/i }).click();

    await expect(page.getByRole('button', { name: /^log$/i }).first()).toBeVisible({
      timeout: 10_000,
    });

    // 44px is the floor for one-thumb use outdoors. Checked on the real rendered
    // boxes rather than trusting a utility class to still be applied. Scoped to the
    // logging surface — the ± steppers and Log are what you press holding a bar.
    const undersized: string[] = [];
    const buttons = await page.locator('main button, [role="main"] button').all();
    for (const button of buttons) {
      if (!(await button.isVisible().catch(() => false))) continue;
      const box = await button.boundingBox();
      if (!box) continue;
      // Ignore genuinely inline affordances with no independent hit area.
      if (box.width === 0 || box.height === 0) continue;
      if (box.height < 44) {
        undersized.push(`${(await button.textContent())?.trim().slice(0, 24)} h=${Math.round(box.height)}`);
      }
    }
    expect(undersized, `controls under 44px tall: ${undersized.join(', ')}`).toEqual([]);
  });
});
