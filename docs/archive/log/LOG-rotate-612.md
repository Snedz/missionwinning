# Rotated for .612

## 2026-08-08 — The Coach could not learn from effort (`.597`)

**One literal made the whole RPE feature fiction, in both directions at once.** `logSetAndAdvance` — the only path any UI logs a set through (`ActiveWorkoutPage.tsx:367`, from both the compact console and the desktop table) — passed `'med'` into `logSet`.

**Inward**, `SetLogRow.tsx:131` and `SetLogTable.tsx:175` render the Easy/Med/Hard buttons only when `!set.rpe`. A stamped set can never satisfy that, so **the rating controls were unreachable on every set ever logged** — while `ActiveSessionChrome.tsx:57` displayed, persistently under the workout name, *"Rate Easy / Med / Hard after each set so Coach can learn."* The app asked for something it had made impossible to give.

**Outward**, the consequences reach the product thesis. `coach/progression.ts`'s `allEasy`, `anyHardOnTwoPlus` and `allHard` are structurally unsatisfiable when every set is `'med'`, so the load-up and deload branches **could not fire for any athlete**; `hasMixedOrMed` swallowed every session into rep-progress. `coach/load.ts:49` computed `sessionRpe` as the constant 7 forever, so ACWR and strain carried zero effort information. `activeWorkoutHelpers.ts:92`'s `hardCount` was always `0` and the `'high'` coach tip (`:582`) was dead. "Coach week feels earned from logs" — Horizon W criterion 3 — was resting on a value nobody supplied.

**2152 tests were green over it.** `progression.test.ts` covers all four branches and always has, because it hands RPE values straight to `nextTargets`: it proved the *decision* while nothing proved the *input*. `.184`'s shape again — the choice tested, the string untested — and the reason a one-word defect survived every ratchet the repo owns.

The fix is to pass `undefined` and let the athlete say. An unrated set still lands somewhere sane: `hasMixedOrMed` already treats a missing rating as inconclusive, so the plan holds, which is the correct read of "no signal".

**Recorded, not fixed here:** `progression.ts:249`'s "No RPE rated — rep-completion heuristic" fallback is unreachable both before and after this change, because `hasMixedOrMed` matches `!s.rpe` and catches the unrated case first. Reaching it means changing what the Coach infers from an unrated session, which is a policy question deserving its own change and some dogfood evidence — not a rider on a one-word fix.

New `src/store/setRating.test.ts` asserts the chain end to end rather than the literal: it drives the **real store**, logs and rates through it, completes the session, and feeds the resulting history into the **real planner**, asserting two easy sets reach `coachWhyLoadUp` and two hard sets reach `coachWhyDeload` with different prescribed weights. It also pins the `!set.rpe` render gate both behaviourally and at the source, and scans the store for a literal rating passed to `logSet` — closed over the **whole `Rpe` union** rather than the one spelling that shipped, with a staleness assertion that fails if the union gains a member and the enumeration silently stops covering it.

Mutants: 4 killed, across all five subtests — restore `'med'` → 1, 2, 5 red; `SetLogRow` gate `!set.rpe` → `set.completed` → 2 red; `rateSet` no-op → 3, 4 red; a fourth `Rpe` member → 5 red. Tests 2152 → 2158.
