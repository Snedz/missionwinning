import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { gateRequired, unlockGate } from './helpers/gate';
import { seedLegacyOnboarding, seedReadinessPhase } from './helpers/journey';
import { seedHistoryAndMissedCoach } from './helpers/seedHistoryCoach';
import { startEmptyActiveWorkout } from './helpers/active';

/**
 * a11y automation — tagged @a11y (excluded from e2e:critical).
 * Fail on serious + critical only; moderate/minor console-warned.
 */

const GATED_ROUTES = [
  '/',
  '/welcome',
  '/log',
  '/coach',
  '/bundle',
  '/active',
  '/nutrition',
  // The other nine signed-in screens. `railGroupsForNav()` declares thirteen and
  // this list covered four of them, so the tranche the Modernist rebrand recut
  // screen-by-screen had no axe coverage at all — the same shape of gap as the
  // SEO tail below, where one exercise page used to stand for ~250 URLs.
  // Only /leaderboard is parked (`PARKED_BY_DEFAULT`), so only it 404s. This comment
  // used to name /benchmarks too — but that is a SECONDARY pillar, on unless
  // `NEXT_PUBLIC_SURFACES=wedge`, so it serves 200 and is a nav screen
  // (`navConfig.ts:110`). It sat excluded from axe on a stated-but-false premise,
  // inside the very list `.157` widened to close this kind of gap. The claim is now
  // asserted in `src/lib/surfaceReality.test.ts` instead of trusted in prose.
  '/benchmarks',
  '/history',
  '/move',
  '/mind',
  '/track',
  '/learn',
  '/assessments',
  '/library',
  '/builder',
  '/profile',
  '/experience?tier=static',
  '/exercises/push-ups',
  // The SEO tail is most of the site's URLs and one exercise page used to represent all
  // of it. One route per template, plus the two info pages every footer links to.
  '/exercises',
  '/exercises/muscle/chest',
  '/compare',
  '/compare/forge',
  '/paths',
  '/about',
  '/privacy',
  // Three more enabled surfaces that had no axe coverage at all. `.157` widened this
  // list from four signed-in screens to thirteen, but it was never cross-checked
  // against the surface registry — so four of the eight surfaces that are ON by
  // default were missing. /calculators is the sharpest: it is public even while the
  // private gate is up (`PRIVATE_GATE_PUBLIC_PATHS`), so it is reachable by anyone.
  '/calculators',
  '/programs',
  '/guide',
] as const;

/**
 * Wait until the page stops animating **and stops loading** before measuring.
 *
 * `page-enter` / `journey-enter` / `Reveal` fade opacity in, and a partly-faded
 * element composites to a lower contrast ratio than its resting state — so axe run
 * mid-animation reports failures that do not exist once the page settles.
 *
 * A one-shot `getAnimations()` check is not enough: these routes mount components
 * behind `requestIdleCallback` and dynamic imports, so new animations start *after*
 * the first check and the failure wandered between /welcome, /coach and /nutrition
 * at roughly one run in two. This waits for two consecutive quiet frames instead,
 * which is the difference between a gate people trust and one they switch off.
 *
 * ## Why animations alone were the wrong question (`.253`)
 *
 * Asking only `getAnimations()` made this wait **structurally blind to loading**.
 * `src/components/ui/Skeleton.tsx` says so in its own header: the placeholders
 * deliberately do not pulse, because the old ones were invisible until the
 * animation dimmed them and `prefers-reduced-motion` then deleted the only cue.
 * That is the right call for the athlete — and it means a page mid-load has zero
 * running animations. The better the loading design got, the blinder this became.
 *
 * Measured rather than argued: `/profile` under a 40× CPU throttle reached this
 * point with **two `aria-busy` regions still on screen and zero running
 * animations** — settle declared it quiet and axe measured placeholders.
 *
 * So the condition is both, and the marker is `aria-busy`, which the app already
 * sets on every loading region (`RouteLoading`, `SkeletonCard`, `CoachPlanSkeleton`,
 * `FuelPlanSkeleton`, the profile cards). That is not a coincidence to lean on:
 * `src/lib/loadingStatesAnnounce.test.ts` asserts it, and the eight placeholders
 * that were *not* marked were found by writing it down.
 *
 * Honest scope: this closes a real, measurable blind spot. It is **not** a proven
 * fix for the single `/profile` skeleton-contrast violation seen once in `.250` —
 * that failure did not reproduce in ~30 throttled runs, and calling it fixed would
 * be a guess dressed as a result.
 */
async function settle(page: import('@playwright/test').Page) {
  await page
    .evaluate(async () => {
      const animating = () => document.getAnimations().filter((a) => a.playState === 'running');
      // `[aria-busy="true"]` and not `[aria-busy]`: `HoldToConfirmButton` and
      // `CoachChatPanel` bind the attribute to state, so a resting page carries
      // `aria-busy="false"` nodes that would never clear.
      const loading = () => document.querySelectorAll('[aria-busy="true"]').length;
      const deadline = Date.now() + 8_000;
      let consecutiveQuiet = 0;

      while (Date.now() < deadline && consecutiveQuiet < 2) {
        const running = animating();
        if (running.length === 0 && loading() === 0) {
          consecutiveQuiet += 1;
        } else {
          consecutiveQuiet = 0;
          await Promise.race([
            Promise.allSettled(running.map((a) => a.finished.catch(() => undefined))),
            new Promise((r) => setTimeout(r, 1_200)),
          ]);
        }
        // A frame plus a beat, so anything mounting on idle has a chance to begin.
        await new Promise((r) => setTimeout(r, 150));
      }
    })
    .catch(() => undefined);
}

async function axeSerious(page: import('@playwright/test').Page, path: string) {
  await settle(page);
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    // The MW monogram is a logotype, which WCAG 1.4.3 exempts from contrast — and it
    // has to keep the brand accent to match /favicon.svg and the PWA rasters. Excluded
    // by selector rather than by disabling color-contrast, so every other white-on-
    // emerald surface is still checked. See src/components/brand/BrandMonogram.tsx.
    .exclude('[data-brand-monogram]')
    .analyze();

  const serious = results.violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical'
  );
  const soft = results.violations.filter(
    (v) => v.impact === 'moderate' || v.impact === 'minor'
  );
  if (soft.length) {
    console.warn(
      `[a11y ${path}] moderate/minor:`,
      soft.map((v) => `${v.id} (${v.impact})`).join(', ')
    );
  }

  expect(
    serious,
    serious.map((v) => `${v.id}: ${v.help}`).join('\n')
  ).toEqual([]);
}

test.describe('Accessibility @a11y', () => {
  for (const path of GATED_ROUTES) {
    test(`axe serious/critical: ${path} @a11y`, async ({ page, context, baseURL }) => {
      if (!baseURL) throw new Error('baseURL required');
      const ok = await unlockGate(page, context, baseURL);
      if (gateRequired() && !ok) {
        test.skip(true, 'SMOKE_ACCESS_SECRET required to unlock private gate');
      }
      await seedLegacyOnboarding(page);
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('body')).toBeVisible();
      // No route special-case here. `/active` used to have one — see `settle()`.
      await axeSerious(page, path);
    });
  }

  /**
   * `/profile` is in the list above, but the feedback sheet is closed on load —
   * so the route passing says nothing about the overlay. `.215` adds a textarea,
   * a labelled input and a dialog to the app's most-used settings screen; axe
   * has to see them open or the coverage is nominal.
   */
  test('axe serious/critical: /profile with the feedback sheet open @a11y', async ({
    page,
    context,
    baseURL,
  }) => {
    if (!baseURL) throw new Error('baseURL required');
    const ok = await unlockGate(page, context, baseURL);
    if (gateRequired() && !ok) {
      test.skip(true, 'SMOKE_ACCESS_SECRET required to unlock private gate');
    }
    await seedLegacyOnboarding(page);
    await page.goto('/profile', { waitUntil: 'networkidle' });
    // Prefer the card CTA (outline) — scroll past referral chrome first.
    const feedback = page.locator('main').getByRole('button', { name: /send feedback/i });
    await feedback.scrollIntoViewIfNeeded();
    await expect(feedback).toBeVisible();
    await feedback.click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 10_000 });
    await axeSerious(page, '/profile (feedback sheet)');
  });

  /**
   * K6 — route ∈ GATED_ROUTES is not the same as the *states* on that route
   * being covered. Zero-data axe never reaches MuscleHeatmap intensity text or
   * a PlanSessionCard "Missed" badge. Seed both, then measure.
   */
  test('axe serious/critical: /history with trained volume @a11y', async ({
    page,
    context,
    baseURL,
  }) => {
    if (!baseURL) throw new Error('baseURL required');
    const ok = await unlockGate(page, context, baseURL);
    if (gateRequired() && !ok) {
      test.skip(true, 'SMOKE_ACCESS_SECRET required to unlock private gate');
    }
    await seedHistoryAndMissedCoach(page);
    await page.goto('/history', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('tab', { name: /exercises/i }).or(page.getByText(/exercises/i).first())).toBeVisible({
      timeout: 15_000,
    });
    // Open Exercises so heatmaps/charts mount (SegmentedControl is not ARIA tabs).
    await page.getByText(/^Exercises$/i).first().click();
    await axeSerious(page, '/history (seeded exercises)');
  });

  test('axe serious/critical: /coach with a missed session @a11y', async ({
    page,
    context,
    baseURL,
  }) => {
    if (!baseURL) throw new Error('baseURL required');
    const ok = await unlockGate(page, context, baseURL);
    if (gateRequired() && !ok) {
      test.skip(true, 'SMOKE_ACCESS_SECRET required to unlock private gate');
    }
    await seedHistoryAndMissedCoach(page);
    await page.goto('/coach', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText(/missed/i).first()).toBeVisible({ timeout: 15_000 });
    await axeSerious(page, '/coach (seeded missed)');
  });

  /**
   * Loop 2 L5 — Victory sheet is the post-finish hero state. Zero-data /active
   * never opens it; axe must see Session locked + feel controls after a real log.
   */
  test('axe serious/critical: Victory sheet after finish @a11y', async ({
    page,
    context,
    baseURL,
  }) => {
    if (!baseURL) throw new Error('baseURL required');
    const ok = await unlockGate(page, context, baseURL);
    if (gateRequired() && !ok) {
      test.skip(true, 'SMOKE_ACCESS_SECRET required to unlock private gate');
    }
    await seedLegacyOnboarding(page);
    await seedReadinessPhase(page);
    await startEmptyActiveWorkout(page);

    await page.getByRole('button', { name: /^add exercise$/i }).click();
    const search = page.getByPlaceholder(/search exercises/i);
    await expect(search).toBeVisible({ timeout: 10_000 });
    await search.fill('push-ups');
    await page.getByRole('option', { name: /push-ups/i }).first().click();
    await page.getByRole('button', { name: /add selected exercise/i }).click();

    const logBtn = page.getByRole('button', { name: /^log( set)?$/i }).first();
    await expect(logBtn).toBeVisible({ timeout: 15_000 });
    await logBtn.click();
    const skipRest = page.getByRole('button', { name: /^skip$/i });
    if (await skipRest.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await skipRest.click();
    }
    await page.getByRole('button', { name: /^finish$/i }).first().click();
    await expect(page.getByRole('button', { name: /back to today/i })).toBeVisible({
      timeout: 15_000,
    });
    await axeSerious(page, '/active (victory sheet)');
  });

  /**
   * Loop 3 M5 — TimedFlowRunner is the live Move state. Zero-data /move never
   * starts a flow; axe must see the runner chrome after Start Flow.
   */
  test('axe serious/critical: /move with a flow running @a11y', async ({
    page,
    context,
    baseURL,
  }) => {
    if (!baseURL) throw new Error('baseURL required');
    const ok = await unlockGate(page, context, baseURL);
    if (gateRequired() && !ok) {
      test.skip(true, 'SMOKE_ACCESS_SECRET required to unlock private gate');
    }
    await seedLegacyOnboarding(page);
    await page.goto('/move', { waitUntil: 'domcontentloaded' });
    const start = page.getByRole('button', { name: /start flow/i }).first();
    await expect(start).toBeVisible({ timeout: 15_000 });
    await start.click();
    // TimedFlowRunner mounts GuidedStepPlayer idle — Start is the live-state chrome
    // zero-data /move never reaches.
    await expect(page.getByRole('button', { name: /^(start|start session)$/i }).first()).toBeVisible({
      timeout: 15_000,
    });
    await axeSerious(page, '/move (flow running)');
  });

  /**
   * Loop 4 N5 — FuelLogSheet is the log path. Zero-data /nutrition never opens
   * the sheet; axe must see Quick/Describe/Custom/Photo chrome after Log food.
   */
  test('axe serious/critical: /nutrition with Log food sheet open @a11y', async ({
    page,
    context,
    baseURL,
  }) => {
    if (!baseURL) throw new Error('baseURL required');
    const ok = await unlockGate(page, context, baseURL);
    if (gateRequired() && !ok) {
      test.skip(true, 'SMOKE_ACCESS_SECRET required to unlock private gate');
    }
    await seedLegacyOnboarding(page);
    await page.goto('/nutrition', { waitUntil: 'domcontentloaded' });
    const fab = page.getByRole('button', { name: /log food/i }).first();
    await expect(fab).toBeVisible({ timeout: 15_000 });
    await fab.click();
    await expect(page.getByRole('button', { name: /^describe$/i }).or(page.getByText(/^describe$/i)).first()).toBeVisible({
      timeout: 10_000,
    });
    await axeSerious(page, '/nutrition (log sheet open)');
  });

  /**
   * Loop 6 P5 — Journal timeline + edit chrome. Zero-data /history → Journal
   * is EmptyState; axe must see search, privacy line, and the edit textarea
   * after a seeded entry.
   */
  test('axe serious/critical: /history journal with entry editing @a11y', async ({
    page,
    context,
    baseURL,
  }) => {
    if (!baseURL) throw new Error('baseURL required');
    const ok = await unlockGate(page, context, baseURL);
    if (gateRequired() && !ok) {
      test.skip(true, 'SMOKE_ACCESS_SECRET required to unlock private gate');
    }
    await seedHistoryAndMissedCoach(page);
    await page.goto('/history', { waitUntil: 'domcontentloaded' });
    await page.getByText(/^Journal$/i).first().click();
    await expect(page.getByPlaceholder(/search your journal/i)).toBeVisible({
      timeout: 15_000,
    });
    await page.getByRole('button', { name: /edit your notes on seed upper/i }).click();
    await expect(page.getByLabel(/your notes, one per line/i)).toBeVisible({
      timeout: 10_000,
    });
    await axeSerious(page, '/history (journal editing)');
  });

  /**
   * Loop 7 Q5 — Library Filters dialog. Zero-data /library never opens the
   * sheet; axe must see muscle/equipment/level/goal chrome after Filters.
   */
  test('axe serious/critical: /library with Filters dialog open @a11y', async ({
    page,
    context,
    baseURL,
  }) => {
    if (!baseURL) throw new Error('baseURL required');
    const ok = await unlockGate(page, context, baseURL);
    if (gateRequired() && !ok) {
      test.skip(true, 'SMOKE_ACCESS_SECRET required to unlock private gate');
    }
    await seedLegacyOnboarding(page);
    await page.goto('/library', { waitUntil: 'domcontentloaded' });
    const filters = page.getByRole('button', { name: /^filters$/i }).first();
    await expect(filters).toBeVisible({ timeout: 15_000 });
    await filters.click();
    await expect(page.getByRole('heading', { name: /^filters$/i }).or(page.getByText(/^muscle$/i)).first()).toBeVisible({
      timeout: 10_000,
    });
    await axeSerious(page, '/library (filters open)');
  });

  /**
   * Loop 8 R5 — Builder arrange step. Zero-data /builder stays on the pick-start
   * screen; axe must see draft/arrange chrome after Blank workout.
   */
  test('axe serious/critical: /builder after Blank workout @a11y', async ({
    page,
    context,
    baseURL,
  }) => {
    if (!baseURL) throw new Error('baseURL required');
    const ok = await unlockGate(page, context, baseURL);
    if (gateRequired() && !ok) {
      test.skip(true, 'SMOKE_ACCESS_SECRET required to unlock private gate');
    }
    await seedLegacyOnboarding(page);
    await page.goto('/builder', { waitUntil: 'domcontentloaded' });
    const blank = page.getByRole('button', { name: /blank workout/i }).first();
    await expect(blank).toBeVisible({ timeout: 15_000 });
    await blank.click();
    await expect(
      page.getByRole('button', { name: /add exercise/i }).or(page.getByText(/draft workout/i)).first()
    ).toBeVisible({ timeout: 10_000 });
    await axeSerious(page, '/builder (blank draft)');
  });

  /**
   * Loop 9 S5 — Learn no-matches chrome. Zero-data /learn never types a query;
   * axe must see empty-search EmptyState after a miss.
   */
  test('axe serious/critical: /learn with no search matches @a11y', async ({
    page,
    context,
    baseURL,
  }) => {
    if (!baseURL) throw new Error('baseURL required');
    const ok = await unlockGate(page, context, baseURL);
    if (gateRequired() && !ok) {
      test.skip(true, 'SMOKE_ACCESS_SECRET required to unlock private gate');
    }
    await seedLegacyOnboarding(page);
    await page.goto('/learn', { waitUntil: 'domcontentloaded' });
    const search = page.getByPlaceholder(/search paths or lessons/i).first();
    await expect(search).toBeVisible({ timeout: 15_000 });
    await search.fill('zzzz-no-such-path');
    await expect(page.getByText(/no paths match that search/i).first()).toBeVisible({
      timeout: 10_000,
    });
    await axeSerious(page, '/learn (no search matches)');
  });

  /**
   * Loop 10 T5 — Library detail sheet. Zero-data /library lists cards but never
   * opens the detail sheet; axe must see cues/history chrome after View details.
   */
  test('axe serious/critical: /library with detail sheet open @a11y', async ({
    page,
    context,
    baseURL,
  }) => {
    if (!baseURL) throw new Error('baseURL required');
    const ok = await unlockGate(page, context, baseURL);
    if (gateRequired() && !ok) {
      test.skip(true, 'SMOKE_ACCESS_SECRET required to unlock private gate');
    }
    await seedLegacyOnboarding(page);
    await page.goto('/library', { waitUntil: 'domcontentloaded' });
    const details = page.getByRole('button', { name: /view details/i }).first();
    await expect(details).toBeVisible({ timeout: 15_000 });
    await details.click();
    await expect(
      page.getByRole('button', { name: /view form guide|add to today/i }).or(page.getByText(/key cues/i)).first()
    ).toBeVisible({ timeout: 10_000 });
    await axeSerious(page, '/library (detail sheet)');
  });

  /**
   * Loop 11 U5 — Benchmarks anatomy. Zero-data /benchmarks stays on EmptyState;
   * axe must see Muscle balance + tracked stats after weighted history.
   */
  test('axe serious/critical: /benchmarks with anatomy map @a11y', async ({
    page,
    context,
    baseURL,
  }) => {
    if (!baseURL) throw new Error('baseURL required');
    const ok = await unlockGate(page, context, baseURL);
    if (gateRequired() && !ok) {
      test.skip(true, 'SMOKE_ACCESS_SECRET required to unlock private gate');
    }
    await seedHistoryAndMissedCoach(page);
    await page.goto('/benchmarks', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText(/muscle balance/i).first()).toBeVisible({
      timeout: 15_000,
    });
    await axeSerious(page, '/benchmarks (anatomy map)');
  });

  /**
   * Loop 12 V3 — Offline banner. Online routes never mount OnlineStatusBanner;
   * axe must see the ink status strip after context.setOffline.
   */
  test('axe serious/critical: offline banner on /log @a11y', async ({
    page,
    context,
    baseURL,
  }) => {
    if (!baseURL) throw new Error('baseURL required');
    const ok = await unlockGate(page, context, baseURL);
    if (gateRequired() && !ok) {
      test.skip(true, 'SMOKE_ACCESS_SECRET required to unlock private gate');
    }
    await seedLegacyOnboarding(page);
    await page.goto('/log', { waitUntil: 'domcontentloaded' });
    await settle(page);
    await context.setOffline(true);
    await page.evaluate(() => window.dispatchEvent(new Event('offline')));
    await expect(page.getByRole('status').filter({ hasText: /offline/i }).first()).toBeVisible({
      timeout: 10_000,
    });
    await axeSerious(page, '/log (offline banner)');
    await context.setOffline(false);
  });

  /**
   * Loop 13 W1 — Coaching interest form filled. Zero-data /coaching is not even
   * in GATED_ROUTES; axe must see the filled lead form chrome (not the empty shell).
   */
  test('axe serious/critical: /coaching with filled interest form @a11y', async ({
    page,
    context,
    baseURL,
  }) => {
    if (!baseURL) throw new Error('baseURL required');
    const ok = await unlockGate(page, context, baseURL);
    if (gateRequired() && !ok) {
      test.skip(true, 'SMOKE_ACCESS_SECRET required to unlock private gate');
    }
    await seedLegacyOnboarding(page);
    await page.goto('/coaching', { waitUntil: 'domcontentloaded' });
    const name = page.getByRole('textbox', { name: /^name$/i }).first();
    await expect(name).toBeVisible({ timeout: 15_000 });
    await name.fill('Kaizen Tester');
    await page.getByRole('textbox', { name: /^email$/i }).first().fill('kaizen@example.com');
    await page
      .getByRole('textbox', { name: /goals and current training/i })
      .first()
      .fill('Train anywhere strength — want a human coach for weekly accountability.');
    await expect(
      page.getByRole('button', { name: /join the coaching interest list/i }).first()
    ).toBeVisible();
    await axeSerious(page, '/coaching (filled form)');
  });

  /**
   * Loop 14 X1 — Programs filter miss. Zero-data /programs shows catalog cards;
   * axe must see EmptyState after Hypertrophy × Bodyweight (no catalog row).
   */
  test('axe serious/critical: /programs with no filter matches @a11y', async ({
    page,
    context,
    baseURL,
  }) => {
    if (!baseURL) throw new Error('baseURL required');
    const ok = await unlockGate(page, context, baseURL);
    if (gateRequired() && !ok) {
      test.skip(true, 'SMOKE_ACCESS_SECRET required to unlock private gate');
    }
    await seedLegacyOnboarding(page);
    await page.goto('/programs', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('button', { name: /^hypertrophy$/i }).first()).toBeVisible({
      timeout: 15_000,
    });
    await page.getByRole('button', { name: /^hypertrophy$/i }).first().click();
    await page.getByRole('button', { name: /bodyweight/i }).first().click();
    await expect(page.getByText(/no programs match those filters/i).first()).toBeVisible({
      timeout: 10_000,
    });
    await axeSerious(page, '/programs (no filter matches)');
  });

  /**
   * Loop 15 Y1 — Mind breathing timer running. Zero-data /mind shows idle Start;
   * axe must see Pause / phase chrome after starting the Box pattern.
   */
  test('axe serious/critical: /mind with breathing timer running @a11y', async ({
    page,
    context,
    baseURL,
  }) => {
    if (!baseURL) throw new Error('baseURL required');
    const ok = await unlockGate(page, context, baseURL);
    if (gateRequired() && !ok) {
      test.skip(true, 'SMOKE_ACCESS_SECRET required to unlock private gate');
    }
    await seedLegacyOnboarding(page);
    await page.goto('/mind', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText(/breathing timer/i).first()).toBeVisible({
      timeout: 15_000,
    });
    await page.getByRole('button', { name: /^box$/i }).first().click();
    // BreathingTimer Start — first Start on the page (guided sessions sit below).
    await page.getByRole('button', { name: /^start$/i }).first().click();
    await expect(
      page.getByRole('button', { name: /pause|stop/i }).or(page.getByText(/inhale|exhale|hold/i)).first()
    ).toBeVisible({ timeout: 10_000 });
    await axeSerious(page, '/mind (breathing timer running)');
  });

  /**
   * Loop 16 Z1 — Track week log with an activity. Zero-data /track shows EmptyState;
   * axe must see the logged row after Log Activity.
   */
  test('axe serious/critical: /track with logged activity @a11y', async ({
    page,
    context,
    baseURL,
  }) => {
    if (!baseURL) throw new Error('baseURL required');
    const ok = await unlockGate(page, context, baseURL);
    if (gateRequired() && !ok) {
      test.skip(true, 'SMOKE_ACCESS_SECRET required to unlock private gate');
    }
    await seedLegacyOnboarding(page);
    await page.goto('/track', { waitUntil: 'domcontentloaded' });
    await expect(page.getByLabel(/duration/i).or(page.locator('#track-duration')).first()).toBeVisible({
      timeout: 15_000,
    });
    await page.locator('#track-duration').fill('30');
    await page.getByRole('button', { name: /^log activity$/i }).first().click();
    await expect(
      page.getByText(/walk|run|cycle|swim|other/i).filter({ hasNotText: /no activities/i }).first()
    ).toBeVisible({ timeout: 10_000 });
    await axeSerious(page, '/track (logged activity)');
  });

  /**
   * Loop 17 A1 — Assessments result. Zero-data /assessments never submits;
   * axe must see Assessment Result chrome after answering ≥5 and Submit.
   */
  test('axe serious/critical: /assessments with result @a11y', async ({
    page,
    context,
    baseURL,
  }) => {
    if (!baseURL) throw new Error('baseURL required');
    const ok = await unlockGate(page, context, baseURL);
    if (gateRequired() && !ok) {
      test.skip(true, 'SMOKE_ACCESS_SECRET required to unlock private gate');
    }
    await seedLegacyOnboarding(page);
    await page.goto('/assessments', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('button', { name: /submit assessment/i }).first()).toBeVisible({
      timeout: 15_000,
    });
    // Answer No on the first five question rows (enough to enable Submit).
    const noButtons = page.getByRole('button', { name: /^no$/i });
    const count = await noButtons.count();
    for (let i = 0; i < Math.min(count, 8); i++) {
      await noButtons.nth(i).click();
    }
    const submit = page.getByRole('button', { name: /submit assessment/i }).first();
    await expect(submit).toBeEnabled({ timeout: 5_000 });
    await submit.click();
    await expect(page.getByText(/assessment result/i).first()).toBeVisible({
      timeout: 10_000,
    });
    await axeSerious(page, '/assessments (result)');
  });

  /**
   * Loop 18 B1 — Body metrics sheet. Zero-data /track shows the card closed;
   * axe must see the log sheet after Log.
   */
  test('axe serious/critical: /track with body metrics sheet open @a11y', async ({
    page,
    context,
    baseURL,
  }) => {
    if (!baseURL) throw new Error('baseURL required');
    const ok = await unlockGate(page, context, baseURL);
    if (gateRequired() && !ok) {
      test.skip(true, 'SMOKE_ACCESS_SECRET required to unlock private gate');
    }
    await seedLegacyOnboarding(page);
    await page.goto('/track', { waitUntil: 'domcontentloaded' });
    const logBtn = page
      .getByRole('button', { name: /^log$/i })
      .filter({ hasNotText: /activity/i })
      .first();
    await expect(logBtn).toBeVisible({ timeout: 15_000 });
    await logBtn.scrollIntoViewIfNeeded();
    await logBtn.click();
    await expect(
      page.getByRole('dialog').or(page.getByText(/weight|body fat|waist/i)).first()
    ).toBeVisible({ timeout: 10_000 });
    await axeSerious(page, '/track (body metrics sheet)');
  });

  /**
   * Loop 19 C1 — Plate calculator sheet. Zero-data /active never opens plates;
   * axe must see PlateCalculatorPanel after opening from a live session.
   */
  test('axe serious/critical: /active with plate calculator open @a11y', async ({
    page,
    context,
    baseURL,
  }) => {
    if (!baseURL) throw new Error('baseURL required');
    const ok = await unlockGate(page, context, baseURL);
    if (gateRequired() && !ok) {
      test.skip(true, 'SMOKE_ACCESS_SECRET required to unlock private gate');
    }
    await seedLegacyOnboarding(page);
    await seedReadinessPhase(page);
    await startEmptyActiveWorkout(page);
    const plates = page.getByRole('button', { name: /^plates$/i }).first();
    await expect(plates).toBeVisible({ timeout: 15_000 });
    await plates.click();
    await expect(page.getByText(/load the bar|plate calculator/i).first()).toBeVisible({
      timeout: 10_000,
    });
    await axeSerious(page, '/active (plate calculator)');
  });

  /**
   * Loop 20 D1 — Field note jot open. Zero-data /active keeps it collapsed;
   * axe must see the textarea + privacy line after expanding Field note.
   */
  test('axe serious/critical: /active with field note open @a11y', async ({
    page,
    context,
    baseURL,
  }) => {
    if (!baseURL) throw new Error('baseURL required');
    const ok = await unlockGate(page, context, baseURL);
    if (gateRequired() && !ok) {
      test.skip(true, 'SMOKE_ACCESS_SECRET required to unlock private gate');
    }
    await seedLegacyOnboarding(page);
    await seedReadinessPhase(page);
    await startEmptyActiveWorkout(page);
    const jot = page.getByRole('button', { name: /field note/i }).first();
    await expect(jot).toBeVisible({ timeout: 15_000 });
    await jot.click();
    await expect(
      page.getByPlaceholder(/five words|knee twinge/i).or(page.getByText(/stays on this device/i)).first()
    ).toBeVisible({ timeout: 10_000 });
    await axeSerious(page, '/active (field note open)');
  });

  /**
   * Loop 21 E1 — Add exercise sheet. Zero-data /active never opens the picker sheet;
   * axe must see search chrome after Add exercise.
   */
  test('axe serious/critical: /active with add-exercise sheet open @a11y', async ({
    page,
    context,
    baseURL,
  }) => {
    if (!baseURL) throw new Error('baseURL required');
    const ok = await unlockGate(page, context, baseURL);
    if (gateRequired() && !ok) {
      test.skip(true, 'SMOKE_ACCESS_SECRET required to unlock private gate');
    }
    await seedLegacyOnboarding(page);
    await seedReadinessPhase(page);
    await startEmptyActiveWorkout(page);
    await page.getByRole('button', { name: /^add exercise$/i }).first().click();
    await expect(page.getByPlaceholder(/search exercises/i).first()).toBeVisible({
      timeout: 15_000,
    });
    await axeSerious(page, '/active (add exercise sheet)');
  });

  /**
   * Loop 22 F1 — Session readiness check-in. Zero history never offers the sheet
   * (W1); seeded history + cleared today's mind check-in surfaces How do you feel?
   * for axe. (`seedLegacyOnboarding` plants a complete check-in on purpose so
   * other Active tests are not blocked by the overlay.)
   */
  test('axe serious/critical: /active with session check-in open @a11y', async ({
    page,
    context,
    baseURL,
  }) => {
    if (!baseURL) throw new Error('baseURL required');
    const ok = await unlockGate(page, context, baseURL);
    if (gateRequired() && !ok) {
      test.skip(true, 'SMOKE_ACCESS_SECRET required to unlock private gate');
    }
    await seedLegacyOnboarding(page);
    await seedHistoryAndMissedCoach(page);
    await page.evaluate(() => {
      localStorage.removeItem('mw_mind_checkins');
      try {
        sessionStorage.removeItem('mw_session_checkin_skipped');
      } catch {
        /* private mode */
      }
    });
    await page.goto('/active', { waitUntil: 'networkidle' });
    const start = page.getByRole('button', { name: /start workout/i });
    await expect(start).toBeVisible({ timeout: 15_000 });
    await expect(start).toBeEnabled({ timeout: 15_000 });
    await start.click();
    await expect(
      page.getByRole('button', { name: /not now/i }).or(page.getByText(/how do you feel/i)).first()
    ).toBeVisible({ timeout: 15_000 });
    await axeSerious(page, '/active (session check-in)');
  });

  /**
   * Loop 23 G1 — Exercise swap sheet. Zero-data /active has no card menu;
   * add an exercise, open More → Swap, axe the picker overlay.
   */
  test('axe serious/critical: /active with swap sheet open @a11y', async ({
    page,
    context,
    baseURL,
  }) => {
    if (!baseURL) throw new Error('baseURL required');
    const ok = await unlockGate(page, context, baseURL);
    if (gateRequired() && !ok) {
      test.skip(true, 'SMOKE_ACCESS_SECRET required to unlock private gate');
    }
    await seedLegacyOnboarding(page);
    await seedReadinessPhase(page);
    await startEmptyActiveWorkout(page);

    await page.getByRole('button', { name: /^add exercise$/i }).first().click();
    const search = page.getByPlaceholder(/search exercises/i);
    await expect(search).toBeVisible({ timeout: 10_000 });
    await search.fill('push-ups');
    await page.getByRole('option', { name: /push-ups/i }).first().click();
    await page.getByRole('button', { name: /add selected exercise/i }).click();
    await expect(page.getByRole('button', { name: /^log( set)?$/i }).first()).toBeVisible({
      timeout: 15_000,
    });

    await page.getByRole('button', { name: /more actions/i }).first().click();
    await page.getByRole('menuitem', { name: /^swap$/i }).click();
    await expect(
      page.getByText(/swap exercise/i).or(page.getByPlaceholder(/swap to/i)).first()
    ).toBeVisible({ timeout: 10_000 });
    await axeSerious(page, '/active (swap sheet)');
  });

  /**
   * Loop 24 H1 — Form guide sheet. Zero-data /active has no Info control;
   * add push-ups (has form cues), open Form guide, axe the overlay.
   */
  test('axe serious/critical: /active with form guide open @a11y', async ({
    page,
    context,
    baseURL,
  }) => {
    if (!baseURL) throw new Error('baseURL required');
    const ok = await unlockGate(page, context, baseURL);
    if (gateRequired() && !ok) {
      test.skip(true, 'SMOKE_ACCESS_SECRET required to unlock private gate');
    }
    await seedLegacyOnboarding(page);
    await seedReadinessPhase(page);
    await startEmptyActiveWorkout(page);

    await page.getByRole('button', { name: /^add exercise$/i }).first().click();
    const search = page.getByPlaceholder(/search exercises/i);
    await expect(search).toBeVisible({ timeout: 10_000 });
    await search.fill('push-ups');
    await page.getByRole('option', { name: /push-ups/i }).first().click();
    await page.getByRole('button', { name: /add selected exercise/i }).click();
    await expect(page.getByRole('button', { name: /^log( set)?$/i }).first()).toBeVisible({
      timeout: 15_000,
    });

    await page.getByRole('button', { name: /form guide/i }).first().click();
    await expect(
      page.getByText(/key cues|setup|common mistakes|ask coach/i).first()
    ).toBeVisible({ timeout: 10_000 });
    await axeSerious(page, '/active (form guide)');
  });

  /**
   * Loop 25 I1 — Per-exercise note field. Zero-data /active has no card note;
   * add push-ups → More → Note, axe the textarea.
   */
  test('axe serious/critical: /active with exercise note open @a11y', async ({
    page,
    context,
    baseURL,
  }) => {
    if (!baseURL) throw new Error('baseURL required');
    const ok = await unlockGate(page, context, baseURL);
    if (gateRequired() && !ok) {
      test.skip(true, 'SMOKE_ACCESS_SECRET required to unlock private gate');
    }
    await seedLegacyOnboarding(page);
    await seedReadinessPhase(page);
    await startEmptyActiveWorkout(page);

    await page.getByRole('button', { name: /^add exercise$/i }).first().click();
    const search = page.getByPlaceholder(/search exercises/i);
    await expect(search).toBeVisible({ timeout: 10_000 });
    await search.fill('push-ups');
    await page.getByRole('option', { name: /push-ups/i }).first().click();
    await page.getByRole('button', { name: /add selected exercise/i }).click();
    await expect(page.getByRole('button', { name: /^log( set)?$/i }).first()).toBeVisible({
      timeout: 15_000,
    });

    await page.getByRole('button', { name: /more actions/i }).first().click();
    await page.getByRole('menuitem', { name: /^note$/i }).click();
    await expect(
      page.getByPlaceholder(/machine 3|left knee|note —/i).first()
    ).toBeVisible({ timeout: 10_000 });
    await axeSerious(page, '/active (exercise note)');
  });

  /**
   * Loop 26 J1 — Rest timer dock. Zero-data /active never starts rest;
   * log one set so RestTimerBar takes the dock, then axe.
   */
  test('axe serious/critical: /active with rest timer open @a11y', async ({
    page,
    context,
    baseURL,
  }) => {
    if (!baseURL) throw new Error('baseURL required');
    const ok = await unlockGate(page, context, baseURL);
    if (gateRequired() && !ok) {
      test.skip(true, 'SMOKE_ACCESS_SECRET required to unlock private gate');
    }
    await seedLegacyOnboarding(page);
    await seedReadinessPhase(page);
    await startEmptyActiveWorkout(page);

    await page.getByRole('button', { name: /^add exercise$/i }).first().click();
    const search = page.getByPlaceholder(/search exercises/i);
    await expect(search).toBeVisible({ timeout: 10_000 });
    await search.fill('push-ups');
    await page.getByRole('option', { name: /push-ups/i }).first().click();
    await page.getByRole('button', { name: /add selected exercise/i }).click();
    const logBtn = page.getByRole('button', { name: /^log( set)?$/i }).first();
    await expect(logBtn).toBeVisible({ timeout: 15_000 });
    await logBtn.click();
    await expect(
      page.getByRole('button', { name: /^skip$/i }).or(page.getByText(/^rest$/i)).first()
    ).toBeVisible({ timeout: 10_000 });
    await axeSerious(page, '/active (rest timer)');
  });

  /**
   * Loop 27 K1 — Set options menu. Zero-data /active has no set footer menu;
   * add push-ups → Set options, axe the Apply targets / Add set menu.
   */
  test('axe serious/critical: /active with set options open @a11y', async ({
    page,
    context,
    baseURL,
  }) => {
    if (!baseURL) throw new Error('baseURL required');
    const ok = await unlockGate(page, context, baseURL);
    if (gateRequired() && !ok) {
      test.skip(true, 'SMOKE_ACCESS_SECRET required to unlock private gate');
    }
    await seedLegacyOnboarding(page);
    await seedReadinessPhase(page);
    await startEmptyActiveWorkout(page);

    await page.getByRole('button', { name: /^add exercise$/i }).first().click();
    const search = page.getByPlaceholder(/search exercises/i);
    await expect(search).toBeVisible({ timeout: 10_000 });
    await search.fill('push-ups');
    await page.getByRole('option', { name: /push-ups/i }).first().click();
    await page.getByRole('button', { name: /add selected exercise/i }).click();
    await expect(page.getByRole('button', { name: /^log( set)?$/i }).first()).toBeVisible({
      timeout: 15_000,
    });

    await page.getByRole('button', { name: /set options/i }).first().click();
    await expect(
      page
        .getByRole('menuitem', { name: /add set|apply targets|remove set/i })
        .or(page.getByRole('button', { name: /^less$/i }))
        .first()
    ).toBeVisible({ timeout: 10_000 });
    await axeSerious(page, '/active (set options)');
  });

  /**
   * Loop 28 L1 — Session overflow discard menu. Zero-data path never opens it;
   * start session → More session actions, axe Hold-to-confirm discard chrome.
   */
  test('axe serious/critical: /active with session more menu open @a11y', async ({
    page,
    context,
    baseURL,
  }) => {
    if (!baseURL) throw new Error('baseURL required');
    const ok = await unlockGate(page, context, baseURL);
    if (gateRequired() && !ok) {
      test.skip(true, 'SMOKE_ACCESS_SECRET required to unlock private gate');
    }
    await seedLegacyOnboarding(page);
    await seedReadinessPhase(page);
    await startEmptyActiveWorkout(page);
    await page.getByRole('button', { name: /more session actions/i }).first().click();
    await expect(
      page.getByRole('button', { name: /discard workout/i }).first()
    ).toBeVisible({ timeout: 10_000 });
    await axeSerious(page, '/active (session more menu)');
  });

  /**
   * Loop 29 M1 — Exercise overflow menu (after HoldToConfirm menu fix).
   * Add push-ups → More actions, axe Ask/Note/Swap + remove HoldToConfirm.
   */
  test('axe serious/critical: /active with exercise more menu open @a11y', async ({
    page,
    context,
    baseURL,
  }) => {
    if (!baseURL) throw new Error('baseURL required');
    const ok = await unlockGate(page, context, baseURL);
    if (gateRequired() && !ok) {
      test.skip(true, 'SMOKE_ACCESS_SECRET required to unlock private gate');
    }
    await seedLegacyOnboarding(page);
    await seedReadinessPhase(page);
    await startEmptyActiveWorkout(page);

    await page.getByRole('button', { name: /^add exercise$/i }).first().click();
    const search = page.getByPlaceholder(/search exercises/i);
    await expect(search).toBeVisible({ timeout: 10_000 });
    await search.fill('push-ups');
    await page.getByRole('option', { name: /push-ups/i }).first().click();
    await page.getByRole('button', { name: /add selected exercise/i }).click();
    await expect(page.getByRole('button', { name: /^log( set)?$/i }).first()).toBeVisible({
      timeout: 15_000,
    });

    await page.getByRole('button', { name: /more actions/i }).first().click();
    await expect(
      page.getByRole('menuitem', { name: /ask about form|note|swap/i }).first()
    ).toBeVisible({ timeout: 10_000 });
    await axeSerious(page, '/active (exercise more menu)');
  });

  /**
   * Loop 30 N1 — Mission Coach chat panel open. Zero-data /coach keeps chat
   * collapsed; open Ask your coach after seeding history/plan.
   */
  test('axe serious/critical: /coach with chat open @a11y', async ({
    page,
    context,
    baseURL,
  }) => {
    if (!baseURL) throw new Error('baseURL required');
    const ok = await unlockGate(page, context, baseURL);
    if (gateRequired() && !ok) {
      test.skip(true, 'SMOKE_ACCESS_SECRET required to unlock private gate');
    }
    await seedLegacyOnboarding(page);
    await seedHistoryAndMissedCoach(page);
    await page.goto('/coach', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /ask your coach/i }).first().click();
    await expect(
      page.getByPlaceholder(/today's session|form, or recovery/i).first()
    ).toBeVisible({ timeout: 15_000 });
    await axeSerious(page, '/coach (chat open)');
  });

  /**
   * Loop 31 O1 — Coach ask-about-form deep link. Form guide "Ask about form"
   * lands on `/coach?ask=…`; axe the FreeFormAskPanel chrome.
   */
  test('axe serious/critical: /coach with ask-form prefill @a11y', async ({
    page,
    context,
    baseURL,
  }) => {
    if (!baseURL) throw new Error('baseURL required');
    const ok = await unlockGate(page, context, baseURL);
    if (gateRequired() && !ok) {
      test.skip(true, 'SMOKE_ACCESS_SECRET required to unlock private gate');
    }
    await seedLegacyOnboarding(page);
    await seedHistoryAndMissedCoach(page);
    await page.goto('/coach?ask=push-ups', { waitUntil: 'domcontentloaded' });
    await expect(
      page
        .getByPlaceholder(/ask|form|session/i)
        .or(page.getByText(/ask about|push-ups|form/i))
        .first()
    ).toBeVisible({ timeout: 15_000 });
    await axeSerious(page, '/coach (ask-form prefill)');
  });

  /**
   * Loop 32 P1 — LogConsole set-kind strip. After add exercise the compact
   * console shows WORK/WARMUP/FAILURE/DROP; axe that dock chrome.
   */
  test('axe serious/critical: /active with log console set kinds @a11y', async ({
    page,
    context,
    baseURL,
  }) => {
    if (!baseURL) throw new Error('baseURL required');
    const ok = await unlockGate(page, context, baseURL);
    if (gateRequired() && !ok) {
      test.skip(true, 'SMOKE_ACCESS_SECRET required to unlock private gate');
    }
    await seedLegacyOnboarding(page);
    await seedReadinessPhase(page);
    await startEmptyActiveWorkout(page);

    await page.getByRole('button', { name: /^add exercise$/i }).first().click();
    const search = page.getByPlaceholder(/search exercises/i);
    await expect(search).toBeVisible({ timeout: 10_000 });
    await search.fill('push-ups');
    await page.getByRole('option', { name: /push-ups/i }).first().click();
    await page.getByRole('button', { name: /add selected exercise/i }).click();
    await expect(page.getByRole('button', { name: /^work$/i }).first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole('button', { name: /^warmup$/i }).first()).toBeVisible();
    await axeSerious(page, '/active (log console set kinds)');
  });

  /**
   * The assertion axe cannot make.
   *
   * axe-core does not reliably test focus visibility, which is how this suite sat at
   * 10/10 green while WCAG 2.4.7 failed site-wide: `src/index.css` had no `:focus` rule
   * at all, so every one of the 91 raw `<button>`s, every `<a>`, and `.primary-action`
   * itself fell back to the browser default — near-invisible on this navy.
   */
  for (const path of ['/', '/exercises/push-ups', '/welcome'] as const) {
    test(`keyboard focus is visible on ${path} @a11y`, async ({ page, context, baseURL }) => {
      if (!baseURL) throw new Error('baseURL required');
      const ok = await unlockGate(page, context, baseURL);
      if (gateRequired() && !ok) {
        test.skip(true, 'SMOKE_ACCESS_SECRET required to unlock private gate');
      }
      await seedLegacyOnboarding(page);
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      await settle(page);

      const weak: string[] = [];
      for (let i = 0; i < 12; i += 1) {
        await page.keyboard.press('Tab');
        // `.primary-action` carries `transition-all` at 150ms, so the outline animates in
        // and `getComputedStyle` mid-transition returns an interpolated width (1px of an
        // eventual 3px). Read after it settles or the assertion reports a phantom failure.
        await page.waitForTimeout(220);
        const focused = await page.evaluate(() => {
          const el = document.activeElement;
          if (!el || el === document.body) return null;
          const s = getComputedStyle(el);
          return {
            outlineStyle: s.outlineStyle,
            outlineWidth: parseFloat(s.outlineWidth),
            tag: el.tagName.toLowerCase(),
            label: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 40),
          };
        });
        if (!focused) continue;
        // Assert *our* indicator, not merely "some outline". With no rule at all Chromium
        // still reports `outline-style: auto` at 1px in a browser-chosen colour — which is
        // the near-invisible-on-navy default this exists to replace, and it is why an
        // "is there an outline" check passes even with the CSS removed. `solid` at ≥2px is
        // only reachable from the declaration in src/index.css @layer base.
        if (focused.outlineStyle !== 'solid' || focused.outlineWidth < 2) {
          weak.push(
            `<${focused.tag}> "${focused.label}" → ${focused.outlineStyle} ${focused.outlineWidth}px`
          );
        }
      }

      expect(
        weak,
        `focusable elements falling back to the browser default focus ring:\n${weak.join('\n')}`
      ).toEqual([]);
    });
  }

  test('axe serious/critical: /private @a11y', async ({ page, baseURL }) => {
    if (!baseURL) throw new Error('baseURL required');
    await page.goto('/private', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible();
    await axeSerious(page, '/private');
  });
});
