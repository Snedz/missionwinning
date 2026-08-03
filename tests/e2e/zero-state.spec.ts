import { test, expect } from '@playwright/test';
import { gateRequired, unlockGate } from './helpers/gate';
import { redActionCount } from './helpers/redActions';

/**
 * What every screen says when the athlete has nothing yet.
 *
 * `docs/DESIGN_REVIEW.md` has said *"not a blank void"* since it was written, and
 * nothing checked it: `EmptyState` appears in no script and no test. Meanwhile the
 * harness that would catch it already existed, pointed one property away —
 * `a11y.spec.ts` renders every signed-in route with **zero data** on each gate run
 * and asserts only that it is accessible. **A blank screen is maximally
 * accessible.** It has no contrast failures, no unlabelled controls and no focus
 * traps, because it has nothing.
 *
 * The other half is the same shape inverted. `first-90.spec.ts` asserts Today
 * offers *exactly one* primary action, and `expectOneRedAction` was called for
 * `/log` alone. So the app had a ceiling on how much a screen may ask and no floor
 * under how little it may offer, on fifteen of sixteen routes.
 *
 * This is the fifth suite in this repo found pointing at its own assumptions
 * rather than at the product — `.129` sitemap, `.157` a11y routes, `.162`
 * viewport, `.165` gate port, and `surfaceReality.test.ts`, which names the first
 * four in its own header.
 *
 * **Deliberately not covered:** filter-miss states. `/programs` renders
 * `{filteredPrograms.map(…)}` with no fallback branch, but reaching it needs a
 * filter interaction, and a sweep that pretends to cover states it never visits is
 * the vacuity this file exists to prevent. Those were found by reading and fixed
 * by hand; see the `.241` LOG entry for the list.
 */

/**
 * Every signed-in route a zero-data athlete can reach.
 *
 * Deliberately not imported from `a11y.spec.ts`: that list also carries the public
 * SEO tail (`/exercises`, `/compare`, `/paths`, `/about`…), which is static content
 * with no user data and therefore no zero state to have. `/leaderboard` is absent
 * because it is parked by default (`PARKED_BY_DEFAULT` in `src/lib/surface.ts`) and
 * 404s — its void is covered by `LeaderboardTable`'s own unit guard instead.
 */
const APP_ROUTES = [
  '/log',
  '/active',
  '/coach',
  '/nutrition',
  '/history',
  '/benchmarks',
  '/track',
  '/move',
  '/mind',
  '/learn',
  '/library',
  '/builder',
  '/assessments',
  '/programs',
  '/profile',
];

/**
 * The red-action ratchet. **Lower these; never raise them.**
 *
 * The design rule is one red action per screen. The first run of this sweep
 * measured the truth on the fifteen routes nobody had ever measured: nine failed,
 * `/mind` with **51**. That is not a rule to enforce at 1 tomorrow — it is a debt
 * to stop growing, which is exactly what `scripts/i18n-coverage.ts` does with
 * untranslated keys and for the same reason: *"a partial pass is worth less than a
 * ratchet, because the untranslated-by-default behaviour is what produced 665 in
 * the first place."*
 *
 * Two distinct classes hide in these numbers, and only one is fixed in `.241`:
 *
 *  1. **Red as a *selected* state.** `variant="default"` on a chosen filter chip
 *     (`ProgramsPage:95,108`), `bg-primary-fill` on a 1–5 rating scale
 *     (`DailyCheckIn:46`), on a unit toggle, on a days-per-week chip. A selection
 *     is not an action, and `.240` already settled what selected looks like —
 *     `is-active-tab`: tint ground under a 2px poster rule. These are fixed here
 *     and the caps below drop accordingly.
 *
 *  2. **One red CTA per list item.** `/coach` draws "Start this session" on every
 *     `PlanSessionCard`. That is the card-farm shape `DESIGN_ORCHESTRATION` names.
 *     **Recorded, not silenced** — each entry below says which class it is.
 *
 * `.242` found a **third** class hiding inside the second, and it was the larger
 * one: a *shared component* painting red on every instance. `/mind` and `/move`
 * were filed under class 2 as screens needing composition; they needed one line
 * in `GuidedStepPlayer`. Before calling a count a composition problem, check
 * whether one component is producing all of it — see the note under the table.
 */
const RED_ACTION_CAP: Record<string, { cap: number; why: string }> = {
  // Clean. Zero, not one: in the zero-data state `JourneyHero` renders its grey
  // Just Go variant, so `/log` and `/active` genuinely paint no red here. That is
  // a property of *this* seeded state, which is the point of pinning it.
  '/log': { cap: 0, why: 'Docked hero is the grey Just Go variant before any data exists.' },
  '/active': { cap: 0, why: 'Empty shell offers Today/Builder as outline routes.' },
  '/history': { cap: 0, why: 'Clean.' },
  '/benchmarks': { cap: 0, why: 'Clean after the EmptyState + starters recut.' },
  '/learn': { cap: 0, why: 'Clean.' },
  '/library': { cap: 0, why: 'Clean.' },
  '/programs': { cap: 0, why: 'Was 2 — both were selected filter chips. `variant="selected"` fixed it.' },

  '/move': { cap: 1, why: 'Was 2. One "Start Flow" on the first flow card remains — class 2.' },
  '/assessments': { cap: 1, why: 'Was 2 — the stage chip was a selection. Submit is the one action.' },

  '/nutrition': {
    cap: 1,
    why: 'K5: docked Log food is the one red; empty state dropped its duplicate CTA (dock owns the action).',
  },

  '/builder': { cap: 3, why: 'Class 2: "Blank workout" renders in both the wizard and the template panel.' },
  '/track': { cap: 3, why: 'Was 6. Activity-type chips were selections; two Log Activity buttons and Start GPS remain — class 2.' },

  '/coach': {
    cap: 1,
    why: 'D12: only today’s PlanSessionCard uses filled Start; other days outline; Regenerate lives in Manage sheet.',
  },
  '/profile': {
    cap: 4,
    why: 'Was 5. Unit/privacy/reminder toggles were selections; magic-link, Save Goals, backup and a days chip remain on a settings screen.',
  },

  '/mind': {
    cap: 2,
    why: 'Was 51, then 34, now 2 — BreathingTimer\'s Start and DailyCheckIn\'s Save, one each. `.242` demoted GuidedStepPlayer\'s compact Start to `outline`, which took 32 of them out in one line.',
  },
};

/**
 * **`.241`\'s diagnosis of `/mind` was wrong, and the ratchet is what said so.**
 *
 * The entry above used to read *"one `Start` per guided-session card — class 2,
 * and precisely why /mind is a card farm rather than a screen"*, which framed 34
 * red actions as a composition problem needing a screen redesign. They were one
 * line: `GuidedStepPlayer` hardcoded `variant="fitness"`, and both of its callers
 * render `compact` in a grid. Ten mind sessions and every Move flow inherited it.
 *
 * That reading was written from source rather than measured, and it is the shape
 * this repo keeps paying for — a plausible story about why a number is high,
 * recorded next to the number as though it had been checked. The `.241` LOG
 * entry, the PR body and this table all carried it.
 *
 * The **under-cap failure** is what corrected it: this file fails when a route
 * comes in *below* its budget, so the fix could not land quietly as a
 * still-passing test. `i18n-coverage.ts` states the same rule for the same
 * reason. A ratchet that only catches regressions is half a ratchet — it lets a
 * stale diagnosis sit behind a green run indefinitely.
 */


/**
 * I-Day complete, nothing logged.
 *
 * `seedLegacyOnboarding` also writes a mind check-in, which is real data — it would
 * make `/mind` and `/history` non-empty and quietly narrow what this sweep covers.
 * This writes the smallest thing that stops `JourneyGuard` bouncing to `/welcome`:
 * `hasLegacyOnboarding()` is satisfied by the profile answers alone
 * (`missionJourney.ts:137`).
 */
async function seedEmptyAthlete(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/welcome', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('mw_experience', 'beginner');
    localStorage.setItem('mw_equipment', 'bodyweight');
    localStorage.setItem('mw_primary_goal', 'goal:general');
    localStorage.setItem('mw_goals', 'goal:general');
  });
}

test.describe('Zero state @gate', () => {
  for (const path of APP_ROUTES) {
    test(`${path} offers something and asks for one thing @gate`, async ({
      page,
      context,
      baseURL,
    }) => {
      if (!baseURL) throw new Error('baseURL required');
      const ok = await unlockGate(page, context, baseURL);
      if (gateRequired() && !ok) {
        test.skip(true, 'SMOKE_ACCESS_SECRET required to unlock private gate');
      }

      await seedEmptyAthlete(page);
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('main')).toBeVisible();
      // Cards mount behind `requestIdleCallback` and dynamic imports; measuring
      // before they land would report a void that resolves a frame later.
      await page.waitForTimeout(2_500);

      /*
       * Rule 1 — the floor. A screen with nothing to do is a dead end, and the
       * athlete who hits it is by definition the one who has not started yet.
       */
      const offered = await page
        .locator('main button:visible, main a:visible, main input:visible, main select:visible')
        .count();
      expect(
        offered,
        `${path}: a zero-data athlete is offered nothing in <main> — this is the ` +
          `"ALL GROUPS (0)" screen. Give it an EmptyState with somewhere to go.`
      ).toBeGreaterThan(0);

      /*
       * Rule 2 — no headed void. An empty list rendered under its own header is
       * the precise defect: `LeaderboardTable` drew a four-column header strip
       * (`# / Operator / Score / Δ`) over an empty `<ul>` beneath a line reading
       * "0 operators". If there is nothing to list, render the empty state
       * instead of the list.
       */
      const emptyLists = await page.evaluate(() => {
        const main = document.querySelector('main');
        if (!main) return [];
        return [...main.querySelectorAll('ul, ol, tbody')]
          .filter((el) => el.childElementCount === 0)
          .filter((el) => {
            const r = el.getBoundingClientRect();
            // Zero-height empty lists paint nothing and mislead nobody; it is the
            // ones holding open space under a header that read as broken.
            return r.height > 4 && getComputedStyle(el).display !== 'none';
          })
          .map((el) => `${el.tagName.toLowerCase()}.${(el.className || '').toString().slice(0, 40)}`);
      });
      expect(
        emptyLists,
        `${path}: a visible list is rendered with no items — a header over a void. ` +
          `Render an EmptyState in its place.`
      ).toEqual([]);

      /*
       * Rule 3 — the ceiling, finally applied past `/log`, as a ratchet.
       *
       * `toBe`, not `toBeLessThanOrEqual`: a cap that silently absorbs an
       * improvement is a cap that drifts back up later. Going *under* fails too,
       * with the instruction to lower the number and lock the gain in — the shape
       * `bundle-budget.mjs` and `security-audit.mjs` both use.
       */
      const budget = RED_ACTION_CAP[path];
      expect(budget, `${path}: no red-action cap recorded — add one with a reason`).toBeTruthy();
      const reds = await redActionCount(page);
      expect(
        reds,
        reds > budget!.cap
          ? `${path}: ${reds} red actions, cap ${budget!.cap}. One red action per screen — ` +
            `a selected chip is not an action. Recorded reason: ${budget!.why}`
          : `${path}: ${reds} red actions, below the cap of ${budget!.cap}. ` +
            `Lower RED_ACTION_CAP['${path}'] to ${reds} to lock the gain in.`
      ).toBe(budget!.cap);
    });
  }
});
