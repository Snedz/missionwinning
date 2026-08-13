import { test, expect } from '@playwright/test';
import { gateRequired, unlockGate } from './helpers/gate';
import { seedLegacyOnboarding, seedEveningReview } from './helpers/journey';
import { DIALOG_CONTROL_SELECTOR, expectThumbSized } from './helpers/thumbSweep';
import { expectOneRedAction } from './helpers/redActions';
import { TODAY_MAX_TOP_LEVEL_BLOCKS } from '../../src/lib/today/todayBlockBudget';
import { fixedTimeAt } from './helpers/fixedClock';

/**
 * The first 90 seconds, as a budget rather than an opinion.
 *
 * Horizon W excellence criteria 1, 2 and 5 all live or die here: a cold visitor
 * should reach a logged set in a handful of taps, with one obvious thing to do on
 * each screen and no interstitial in the way. Regressions in this path are the most
 * expensive kind, so they get a failing test instead of a design review.
 */

/** Taps from a cold /welcome to a set on the board. Lower is better; never raise this. */
const TAP_BUDGET = 5;

/* The pinned clock and why it is derived, not literal: `helpers/fixedClock`. */

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

    // F-017 / F-004: I-Day has no sign-in wall — profile Continue lands on Today.
    await expect(page).toHaveURL(/\/log/, { timeout: 15_000 });
    await expect(page.locator('.primary-action')).toHaveCount(1);
    await expect(page.getByText(/offline · on this device/i)).toBeVisible();
    await expect(page.getByTestId('account-lite-strip')).toHaveCount(0);
    await expect(page.getByText(/keep this diary/i)).toHaveCount(0);
    await expect(page.getByRole('link', { name: /^sign in$/i })).toHaveCount(0);
    await tap(
      page.locator('.primary-action').first(),
      'Start first workout'
    );

    await expect(page).toHaveURL(/\/active/, { timeout: 15_000 });

    // Nothing may stand between Start and logging. A check-in sheet here would be
    // an interstitial on the very first session (W1) — assert it is absent rather
    // than dismissing it, which is what made this regress before.
    await expect(
      page.getByRole('button', { name: /not now/i }),
      'no modal may intercept the first session'
    ).toHaveCount(0);
    await expect(page.getByText(/keep this diary/i)).toHaveCount(0);
    await expect(page.getByTestId('account-lite-strip')).toHaveCount(0);

    // `/^log( set)?$/i`, widened deliberately in `.153`: the logger's per-set
    // control bands collapsed into one docked console whose button reads "Log
    // set". An `aria-label="Log"` over that visible text would break WCAG 2.5.3
    // (Label in Name), so the guard moves rather than the label. Still anchored
    // — it must not start matching "Log food" or "Log weight".
    const logBtn = page.getByRole('button', { name: /^log( set)?$/i }).first();
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
    // the display system. brand-guidelines.md assigns hero titles to Archivo
    // (Modernist rebrand — was Barlow Condensed).
    const font = await page
      .locator('h1')
      .first()
      .evaluate((el) => getComputedStyle(el).fontFamily);
    expect(font, `hero H1 font-family was ${font}`).toContain('Archivo');

    // Red marks the one action. Hero + closing band is the ceiling; a third
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
    '/paths',
    // One representative for the public calculators template (Phase 2 rebrand).
    '/calculators/1rm',
  ] as const;

  for (const path of SEO_TEMPLATES) {
    test(`${path} is on the design system and reachable @gate`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'domcontentloaded' });

      const h1 = page.locator('h1').first();
      await expect(h1).toBeVisible();

      const font = await h1.evaluate((el) => getComputedStyle(el).fontFamily);
      expect(font, `${path} H1 font-family was ${font}`).toContain('Archivo');

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
    // Two competing CTAs is the "empty dashboard / chore list" failure mode.
    // This counts the *class*; the appearance check below is what actually
    // enforces the rule — see `helpers/redActions.ts` for why both exist.
    await expect(page.locator('.primary-action')).toHaveCount(1);
  });

  /**
   * The same rule, measured by colour instead of class name — and at both hours.
   *
   * `.194` shipped a second poster-red button onto Today and the assertion above
   * stayed green, because that button never carried `.primary-action`; it only
   * had the colour. The 18:00-only nature of the card is the other half of why
   * nothing caught it, so this runs at 09:00 and 19:00.
   */
  for (const hour of [9, 19]) {
    test(`Today shows one red action at ${hour}:00 @gate`, async ({ page }) => {
      await seedEveningReview(page);
      await page.clock.setFixedTime(fixedTimeAt(hour));
      await page.goto('/log', { waitUntil: 'networkidle' });

      /*
       * The guard asserts its own preconditions, in full.
       *
       * Three separate times while writing this test it passed with the bug
       * still in place, each time because the surface was not on screen: the
       * day-review card needs data to render at all (`composeDayReview` returns
       * null by design), the push opt-in inside it needs a VAPID public key
       * (unset in CI until now — see `gate.mjs`), and the opt-in mounts only
       * after an `await import('@/lib/pushClient')` resolves. A colour
       * assertion against an absent element is green and meaningless.
       *
       * So both are waited for explicitly. If either stops rendering, this test
       * fails on the precondition rather than quietly stopping measuring.
       */
      if (hour >= 18) {
        await expect(
          page.getByRole('region', { name: /day in review/i }),
          'the evening card must be on screen, or this test is asserting about nothing'
        ).toBeVisible({ timeout: 15_000 });
        await expect(
          page.getByRole('button', { name: /turn on/i }),
          'the push opt-in must be mounted — it is the control this test is about'
        ).toBeVisible({ timeout: 15_000 });
      }

      await expectOneRedAction(page, `/log at ${hour}:00`);
    });
  }

  test('every control on the logger is thumb-sized', async ({ page }) => {
    // JourneyGuard sends a cold visitor to /welcome; this case is about an
    // established user opening the Train tab.
    await seedLegacyOnboarding(page);
    await page.goto('/active', { waitUntil: 'networkidle' });
    const start = page.getByRole('button', { name: /start workout/i });
    await expect(start).toBeEnabled({ timeout: 15_000 });
    await start.click();

    // The picker is a sheet as of `.156` — it was an inline `max-h-48` list
    // competing with the session for height. One extra tap to open it; the
    // placeholder, the `option` rows, the `Selected:` line and the
    // `add selected exercise` name are all unchanged.
    await page.getByRole('button', { name: /^add exercise$/i }).click();

    const search = page.getByPlaceholder(/search exercises/i);
    await expect(search).toBeVisible({ timeout: 10_000 });
    await search.fill('push-ups');
    await page.getByRole('option', { name: /push-ups/i }).first().click();
    await page.getByRole('button', { name: /add selected exercise/i }).click();

    await expect(page.getByRole('button', { name: /^log( set)?$/i }).first()).toBeVisible({
      timeout: 10_000,
    });

    // Body extracted to `helpers/thumbSweep.ts` so other screens can run the
    // same sweep — it was inline and scoped here alone, which is exactly how a
    // 36px button on Today went unnoticed by a test called "every control is
    // thumb-sized".
    await expectThumbSized(page, '/active');
  });

  /**
   * The budget, from outside the process that computes it.
   *
   * `todayBlockBudget.test.ts` proves `planTodayBlocks` respects the cap. That is
   * a claim about a function, not about the screen — the dashboard could stop
   * calling it, or call it and render `staggerBlocks` anyway, and the unit test
   * would stay green. This counts what actually rendered.
   *
   * `TODAY_MAX_TOP_LEVEL_BLOCKS` is imported rather than restated so the unit
   * bound and the rendered bound cannot drift apart.
   */
  for (const hour of [9, 19]) {
    test(`Today renders within its block budget at ${hour}:00 @gate`, async ({ page }) => {
      await seedLegacyOnboarding(page);
      await page.clock.setFixedTime(fixedTimeAt(hour));
      await page.goto('/log', { waitUntil: 'networkidle' });
      const shell = page.locator('.today-shell').first();
      await expect(shell).toBeVisible({ timeout: 15_000 });
      const blocks = await shell.locator(':scope > *').count();
      expect(
        blocks,
        `Today rendered ${blocks} top-level blocks at ${hour}:00; the budget is ${TODAY_MAX_TOP_LEVEL_BLOCKS}`
      ).toBeLessThanOrEqual(TODAY_MAX_TOP_LEVEL_BLOCKS);
    });
  }

  /**
   * The screens the sweep never reached.
   *
   * `.194` put a `size="sm"` (36px) button on Today and nothing failed, because
   * this sweep only ever visited `/active`. Today is also where the sweep has to
   * run **in the evening** — the day-review card and its opt-in do not exist
   * before 18:00, so a daytime run sees neither.
   */
  for (const { path, hour, what } of [
    { path: '/log', hour: 9, what: '/log (morning)' },
    { path: '/log', hour: 19, what: '/log (evening — day review visible)' },
    { path: '/mind', hour: 19, what: '/mind (behavior strip)' },
    // `.215` added a control here and the sweep had never visited the screen.
    { path: '/profile', hour: 9, what: '/profile (settings + feedback)' },
  ]) {
    test(`every control on ${what} is thumb-sized @gate`, async ({ page }) => {
      await seedLegacyOnboarding(page);
      // Fixed clock: the evening surfaces are the ones that were never swept,
      // and "run the suite after 18:00" is not a test strategy.
      await page.clock.setFixedTime(fixedTimeAt(hour));
      await page.goto(path, { waitUntil: 'networkidle' });
      await expectThumbSized(page, what);
    });
  }

  /**
   * The sheet is portaled to `document.body`, so the loop above cannot see it
   * however many routes it visits. A note written one-handed in a gym is the
   * whole point of this control existing offline; its own controls have to be
   * pressable there.
   */
  test('every control in the feedback sheet is thumb-sized @gate', async ({ page }) => {
    await seedLegacyOnboarding(page);
    // The card moved with the settings in the `.606` /profile split.
    await page.goto('/account', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: /send feedback/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expectThumbSized(page, 'feedback sheet', DIALOG_CONTROL_SELECTOR);
  });
});
