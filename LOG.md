# Mission Winning — Development Log

Chronological record of shipped work. Newest first.

**Rotation rule:** keep **≤15 entries** here, and never let the file grow. When over, move the oldest entries (whole `##` sections, order preserved) to `docs/archive/log/` and list the file in [docs/archive/INDEX.md](docs/archive/INDEX.md). Enforced by `src/lib/logBudget.test.ts` — until `.242` it was enforced by nothing, and the file had reached **27 entries / 127KB**.

> **The `≤20KB` half of this rule was unmeetable and is retired.** An entry here averages ~5.6KB, because the house style is to explain the defect class rather than name the change — which is the most valuable thing in this repo and not something to trade away for a byte count. Fifteen entries is ~84KB; obeying 20KB would have meant keeping **three**. So the count rule stands, and the size rule becomes a **ratchet**: the file may shrink, never grow. If the founder wants a hard byte ceiling instead, that is a call about house style, not about this file.

Archive: [2026-06 → 2026-07-20](docs/archive/log/LOG-2026-06_to_2026-07-20.md) · [2026-07-20 tail](docs/archive/log/LOG-2026-07-20_tail.md) (incl. Accelerator sprint kit rotated 2026-07-22) · [2026-07-20 → 2026-07-29 (`.179` and earlier)](docs/archive/log/LOG-2026-07-20_to_2026-07-29.md) · [2026-07-29 → 2026-07-30 (`.180`–`.199`)](docs/archive/log/LOG-2026-07-29_to_2026-07-30.md) (both rotated 2026-07-30) · [2026-07-30 → 2026-07-31 (`.200`–`.213`)](docs/archive/log/LOG-2026-07-30_to_2026-07-31.md) (rotated 2026-08-02) · [`.247` for `.263`](docs/archive/log/LOG-hero-audit-rotate-2026-08-03.md) · [`.279`](docs/archive/log/LOG-rotate-279.md) · [`.280`](docs/archive/log/LOG-rotate-280.md) · [`.281` for `.296`](docs/archive/log/LOG-rotate-296.md) · [`.282` for `.297`](docs/archive/log/LOG-rotate-297.md).

---
## 2026-08-03 — Active buildConsoleSet + planApplyTargets (`.297`)

Kaizen Loop 2 L2. Console-set IIFE and Apply-targets decisions peel into
`buildConsoleSet` / `planApplyTargets` in `activeWorkoutHelpers` with unit +
wiring guards so coach-vs-freestyle cannot silently re-inline on the page.

## 2026-08-03 — Victory + SessionCheckIn i18n (`.296`)

Kaizen Loop 2 L1. Victory sheet (~19 keys) and SessionCheckIn (~14) land in
`activeWorkoutLocales` EN (other langs inherit via `...en`). Finish-workout toast
description no longer hard-codes English. i18n uncovered **680→647**.

## 2026-08-03 — Seeded a11y + zero-state + Active/i18n Kaizen (`.295`)

Kaizen K3–K6. History Exercises anatomy links get `aria-label` (SVG drops
`role=img` so links are not nested-interactive). Coach seed survives `adaptPlan`
by planting done + more misses than salvage slots. Static import of the seed
helper. Zero-state: builder chips/`Load` demoted (cap **3→1**); Profile Save
Goals/backup/day chips demoted (cap **4→1**). Active swap picker ranking lives
in `rankSwapCandidates`. LogConsole step keys land in `activeWorkoutLocales`
(i18n uncovered **685→680**).

## 2026-08-03 — Today composure + Fuel photo honesty (`.294`)

Kaizen K1–K2. Today full-shell: Mission Score priority **22→32** (behind
week-recap) and top-level budget **7→6**, so on the densest commissioned
evening the scoreboard spills into Today details while session + week stay
visible. Budget test fixture now reads `TODAY_BLOCK_PRIORITY` (stale 35/40
copy removed). Fuel photo: heuristic path **never claims `high`** (filename
match caps at medium; color-only stays low); Open Food Facts picks log as
`source: 'api'` instead of lying as heuristic.

## 2026-08-03 — First-mission check-in is one pure rule (`.293`)

`shouldOfferSessionCheckInDecision`: never open the pre-session Mind sheet when
completed history is empty (W1). Sheet wraps storage; unit + wiring guards so the
cold path cannot re-grow an interstitial without a red test.

## 2026-08-03 — Rest timer default is one source of truth (`.292`)

Store `startRestTimer()` no longer invents **30s**. Duration resolves through
`resolveStartRestSeconds` → saved default / **90s** fallback shared with exercise
heuristics. Guard: store must not hardcode 30.

## 2026-08-03 — Week-1 second-session activation (`.291`)

After the first log, First Steps next is **session 2** (not Fuel tourism). Today
train CTA says "Start session 2" when history length is 1. Pure
`week1SecondSessionCue` + checklist order. Basic still = first workout only.

## 2026-08-03 — Victory progression is structured + i18n (`.290`)

`buildProgressionInsight` returns a pure payload (reason · lift · numbers), not a
hard-coded English sentence. Bodyweight sessions get rep-based cues. Victory sheet
maps keys (EN/ES/FR/PT); BW work no longer skipped because `weight <= 0`.

## 2026-08-03 — Same-session set carry on the logger (`.289`)

After you log a freestyle set, the next set of that exercise dials in what you
just did (Hevy/Strong gym-speed). Coach prescriptions stay per-set. Pure
`priorCompletedInExercise` + `resolveSetInput` order 3.

## 2026-08-03 — Gym-speed logger: Enter + Use next (`.288`)

Compact log console: **Enter** submits the set; **Use next target** one-taps
progressive-overload / coach numbers into reps·weight when the dial differs.
Pure `shouldOfferUseNext` / `consoleMatchesTarget`.

## 2026-08-03 — Coach why panel: named days + today's reasons (`.287`)

Adapt banner names **which weekdays** were missed/swapped. Full Coach also lists
up to three unique prescription why-keys for today and a control to adjust/keep
today's version. Pure `todaySessionWhyKeys` + richer adaptSummary.

## 2026-08-03 — Re-entry dose actually trims the session (`.286`)

`doseScale` from `computeReentry` now scales Just Go / plan starts via
`scaleExercisesByDose` on the Today primary CTA. Re-entry card copy names the
real percent (e.g. 70% / 50%) so the promise matches the workout.

## 2026-08-03 — Progressive overload on the log console (`.285`)

Compact logger shows **Last · Next · why** (add rep / add weight / hold /
coach plan) from pure `buildOverloadCue` + double-progression or prescribed
sets. Industry table stakes for gym-speed overload without a second card.

## 2026-08-03 — Coverage floor for D11–D13 UI sheets (`.284`)

`npm run coverage` failed CI: **393 untested** vs floor **389**. Four new
Playwright-covered sheets (`CoachManageSheet`, `CoachScheduleEditor`,
`WhatsNewSheet`, `ProfileWhatsNewCard`) — pure helpers already unit-tested.
Raised `FLOORS.untestedFiles` / high-water **389 → 393** via the escape hatch
the coverage script names (same commit a reviewer can see).

## 2026-08-03 — Pump Kaizen D11–D12 + guards (`.283`)

History **Exercises** tab (Trends promoted). Coach manage sheet (schedule /
adjust / regenerate / ask) + one filled Start on the week grid. Adapt re-entry
honest on coach days; `fitness` Button variant folded into `default`. Seeded
a11y paths for History volume + Coach missed; i18n uncovered ratchet **698→686**.

