# Rotated for .613

## 2026-08-08 — A button that says "start" must start a session (`.598`)

**Two defects, one shape: a start CTA that navigates instead of starting.**

`CoachAdaptBanner` rendered **"Start this session"** as a bare `<Link href="/active">`. `/active` with no active workout renders `ActiveEmptyState` — *"No session running"* — so the single red control on the re-entry banner, the surface whose entire job is getting a lapsed athlete moving again, was a dead end. `coachAdaptReentryIsPrescribed` existed only to choose which of two labels to show, and it could not name the session it was advertising, let alone start it.

And the **re-entry dose was applied on one of four start paths**. `todayPrimaryAction` scaled it; `CoachTodayCard`, `PlanSessionCard` and the banner each called `planSessionToTemplates` raw. `TodayReentryCard` tells an athlete back after ten days *"Today's session is about 50% of usual sets"* — its own header says the card "must not promise lighter without applying it" — and the Coach card directly beneath it started the full session. Three hand-rolled copies of one rule, each forgetting something different; the `done` guard existed in exactly one of them too.

**One definition** (`.178`): `resolveCoachSessionStart` in `src/lib/coach/coachSessionStart.ts` owns the whole decision — refuse a done session, read re-entry, scale the templates — and `useStartCoachSession` is wiring around it. The banner's predicate is now expressed in terms of `coachAdaptReentrySession`, the finder that returns the session, so the label and the thing it starts cannot drift apart.

**Caught in my own edit:** the first draft called `useStartCoachSession()` after the banner's two early returns — a Rules-of-Hooks violation that only surfaces once a bail path is taken. Moved above them.

**The guard's mirror caught the refactor too**, which is the point of writing one. `DIRECT_OK` requires each exemption to name a file that still does the exempted thing; extracting the resolver made the hook stop building templates, and the staleness test went red on a row that had become theatre. The row is gone, and the check now also refuses an exemption for a file the walk never visits — the shape that let `outboxResilience`'s `LEAKY` list appear to guard sixty-nine routes while enumerating six.

**Coverage floor 390 → 391**, through the escape hatch its own failure message describes rather than by drift. `useStartCoachSession.ts` is wiring only: every branch it used to own moved into `resolveCoachSessionStart`, which carries five dedicated cases. Its sibling `coachSessionStart.ts` shipped with a test, which is why this is +1 and not +2. Leaving the logic inside the React boundary would have cost the same count and bought nothing testable.

Mutants: 4 killed — dose ignored in `coachSessionTemplates` → red; predicate made an independent copy that disagrees with the finder → red; a component calling `planSessionToTemplates` raw again → red; hook bypassing the resolver → red. Tests 2158 → 2172.

## 2026-08-08 — The Coach could not learn from effort (`.597`)

**One literal made the whole RPE feature fiction, in both directions at once.** `logSetAndAdvance` — the only path any UI logs a set through (`ActiveWorkoutPage.tsx:367`, from both the compact console and the desktop table) — passed `'med'` into `logSet`.

**Inward**, `SetLogRow.tsx:131` and `SetLogTable.tsx:175` render the Easy/Med/Hard buttons only when `!set.rpe`. A stamped set can never satisfy that, so **the rating controls were unreachable on every set ever logged** — while `ActiveSessionChrome.tsx:57` displayed, persistently under the workout name, *"Rate Easy / Med / Hard after each set so Coach can learn."* The app asked for something it had made impossible to give.

**Outward**, the consequences reach the product thesis. `coach/progression.ts`'s `allEasy`, `anyHardOnTwoPlus` and `allHard` are structurally unsatisfiable when every set is `'med'`, so the load-up and deload branches **could not fire for any athlete**; `hasMixedOrMed` swallowed every session into rep-progress. `coach/load.ts:49` computed `sessionRpe` as the constant 7 forever, so ACWR and strain carried zero effort information. `activeWorkoutHelpers.ts:92`'s `hardCount` was always `0` and the `'high'` coach tip (`:582`) was dead. "Coach week feels earned from logs" — Horizon W criterion 3 — was resting on a value nobody supplied.

**2152 tests were green over it.** `progression.test.ts` covers all four branches and always has, because it hands RPE values straight to `nextTargets`: it proved the *decision* while nothing proved the *input*. `.184`'s shape again — the choice tested, the string untested — and the reason a one-word defect survived every ratchet the repo owns.

The fix is to pass `undefined` and let the athlete say. An unrated set still lands somewhere sane: `hasMixedOrMed` already treats a missing rating as inconclusive, so the plan holds, which is the correct read of "no signal".

**Recorded, not fixed here:** `progression.ts:249`'s "No RPE rated — rep-completion heuristic" fallback is unreachable both before and after this change, because `hasMixedOrMed` matches `!s.rpe` and catches the unrated case first. Reaching it means changing what the Coach infers from an unrated session, which is a policy question deserving its own change and some dogfood evidence — not a rider on a one-word fix.

New `src/store/setRating.test.ts` asserts the chain end to end rather than the literal: it drives the **real store**, logs and rates through it, completes the session, and feeds the resulting history into the **real planner**, asserting two easy sets reach `coachWhyLoadUp` and two hard sets reach `coachWhyDeload` with different prescribed weights. It also pins the `!set.rpe` render gate both behaviourally and at the source, and scans the store for a literal rating passed to `logSet` — closed over the **whole `Rpe` union** rather than the one spelling that shipped, with a staleness assertion that fails if the union gains a member and the enumeration silently stops covering it.

Mutants: 4 killed, across all five subtests — restore `'med'` → 1, 2, 5 red; `SetLogRow` gate `!set.rpe` → `set.completed` → 2 red; `rateSet` no-op → 3, 4 red; a fourth `Rpe` member → 5 red. Tests 2152 → 2158.
