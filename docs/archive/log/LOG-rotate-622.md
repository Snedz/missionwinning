# Rotated from LOG.md for `.622`

Oldest live entry moved when shipping You S3b kits + C5 DTO.

## 2026-08-08 — The Mission Score decays (`.607`)

**A third of the score was permanent, on the one number the whole six-pillar thesis rests on.**

`computeWinScore` is documented as a weekly grade and `docs/CLUB_PLAN.md` says so twice — *"a weekly grade that resets"*, and points are *"an odometer, not a grade"*. But `totalSessions` and `totalVolume` were **lifetime** sums at both call sites (`HomeTodayDashboard.tsx:206,210`, `leaderboard/computeLocalStats.ts:45-46`), `savedCount` counted templates saved ever, and `countLearnLessonsThisWeek` unioned three **undated** localStorage id sets. Sessions 10 + volume 8 + saved 4 + Learn 10 = **≈32 of 100 points that never decayed.** An athlete who trained twenty times months ago and did nothing this week scored about what someone mid-way through a hard training week scored, and the number rose once and then stayed.

In a codebase whose identity is anti-fabrication — em-dashes rather than invented zeros, `null` under 14 days in `load.ts`, `adapt.ts` earning its banner by diffing — the central number was the one that flattered.

**The Learn term is the sharpest version of it.** `countLearnLessonsThisWeek` sat *four lines beneath* `countPillarWinsThisWeek`, which has a careful local-week filter and a `.241` comment about UTC frame mismatches. The file contained both the defect and its own cure. All three Learn completion paths already log a `'learn'` pillar win, so the dated counter was always the right reader; the id sets go back to being progress state for rendering ticks, which is what they are.

**Renaming the parameters is the guard, not a tidy-up.** `totalSessions` → `sessionsThisWeek`, `totalVolume` → `volumeThisWeek`. A call site holding a lifetime figure now fails typecheck instead of quietly passing it — which is exactly what happened when the rename landed: production compiled, and only the test file still had the old shape. `totalSessions` and `totalVolume` still exist on Today and are still correct for what else reads them (the `.602` em-dash guard genuinely asks "has this athlete *ever* trained"); in the leaderboard they turned out to be dead the moment the score stopped using them, and the weekly volume the board publishes was already sitting in the same function.

**The rebalance did not do the obvious thing.** "Effort should outrank taps" reads like *raise the volume weight* — and that would have broken a constitutional promise: `docs/CLUB_PLAN.md` requires that *"a bodyweight athlete in a Lagos park earns exactly what a barbell athlete earns for the same consistency. Effort is counted in sessions, not kilograms."* Weighting tonnage would price the ICP out of its own score. So days (16) and sessions (12) carry Train, streak is 8, and tonnage is a 4-point bonus. Train still beats the tap-driven pillars — three training days outscore a week of four mobility flows — which was the property actually wanted.

**The guard runs end-to-end from a history array, because the arithmetic was never wrong.** `computeWinScore({sessionsThisWeek: 0, …}) === 0` is vacuous: it says zero in, zero out, and would have stayed green through the entire defect, which lived in *what the callers handed it* — the `.597` shape again, where the decision was proven and the input was not. So the fixture is a 25-session, 150,000-unit career and the assertion is what this week extracts from it: **0**. The precondition that the fixture is genuinely rich is asserted, not assumed.

**A mutant found a missing test rather than a passing one.** Reverting the Learn fix killed nothing — `pillarScoreInputs.ts` had no colocated test, so nothing in 2,207 green tests could see the Learn term go permanent again. New `pillarScoreInputs.test.ts` drives the real reader against real storage and kills it from both directions: reverting to lifetime id sets **and** the lazy `return 0`, which a one-sided test would have called a fix.

Mutants: 6 killed — weekly volume helper falls back to lifetime → red; weekly session helper counts the career → red; re-add a permanent saved-templates term → red; tonnage weighted to decide the grade → red (equipment-neutrality guard); Learn reverts to undated id sets → red; Learn returns a flat zero → red. Tests 2207 → 2216.

Note for the founder's own device: existing local scores will **drop**, and that is the fix working — the previous number included credit for work done weeks ago.

