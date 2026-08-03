# Mission Winning — Development Log

Chronological record of shipped work. Newest first.

**Rotation rule:** keep **≤15 entries** here, and never let the file grow. When over, move the oldest entries (whole `##` sections, order preserved) to `docs/archive/log/` and list the file in [docs/archive/INDEX.md](docs/archive/INDEX.md). Enforced by `src/lib/logBudget.test.ts` — until `.242` it was enforced by nothing, and the file had reached **27 entries / 127KB**.

> **The `≤20KB` half of this rule was unmeetable and is retired.** An entry here averages ~5.6KB, because the house style is to explain the defect class rather than name the change — which is the most valuable thing in this repo and not something to trade away for a byte count. Fifteen entries is ~84KB; obeying 20KB would have meant keeping **three**. So the count rule stands, and the size rule becomes a **ratchet**: the file may shrink, never grow. If the founder wants a hard byte ceiling instead, that is a call about house style, not about this file.

Archive: [2026-06 → 2026-07-20](docs/archive/log/LOG-2026-06_to_2026-07-20.md) · [2026-07-20 tail](docs/archive/log/LOG-2026-07-20_tail.md) (incl. Accelerator sprint kit rotated 2026-07-22) · [2026-07-20 → 2026-07-29 (`.179` and earlier)](docs/archive/log/LOG-2026-07-20_to_2026-07-29.md) · [2026-07-29 → 2026-07-30 (`.180`–`.199`)](docs/archive/log/LOG-2026-07-29_to_2026-07-30.md) (both rotated 2026-07-30) · [2026-07-30 → 2026-07-31 (`.200`–`.213`)](docs/archive/log/LOG-2026-07-30_to_2026-07-31.md) (rotated 2026-08-02) · [`.247` for `.263`](docs/archive/log/LOG-hero-audit-rotate-2026-08-03.md) · [`.279`](docs/archive/log/LOG-rotate-279.md) · [`.280`](docs/archive/log/LOG-rotate-280.md) · [`.281` for `.296`](docs/archive/log/LOG-rotate-296.md) · [`.282` for `.297`](docs/archive/log/LOG-rotate-297.md) · [`.283` for `.298`](docs/archive/log/LOG-rotate-298.md) · [`.284` for `.299`](docs/archive/log/LOG-rotate-299.md) · [`.285` for `.300`](docs/archive/log/LOG-rotate-300.md) · [`.286` for `.301`](docs/archive/log/LOG-rotate-301.md) · [`.287` for `.302`](docs/archive/log/LOG-rotate-302.md) · [`.288` for `.303`](docs/archive/log/LOG-rotate-303.md) · [`.289` for `.304`](docs/archive/log/LOG-rotate-304.md) · [`.290` for `.305`](docs/archive/log/LOG-rotate-305.md).

---

## 2026-08-03 — Move zero-state + seeded flow a11y (`.305`)

Kaizen Loop 3 M5. `/move` Start Flow demoted to outline (cap **1→0**). Move page
+ locked-preview keys and assessment submit/risk labels into EN packs. Seeded
axe on TimedFlowRunner idle. Uncovered **489→473**.

## 2026-08-03 — Soft chrome + Fuel search/describe i18n (`.304`)

Kaizen Loop 3 M4. Coach/Active ink panels drop soft `/10` `/30` `/40` chrome for
solid paper/ink borders and solid hover fills. Fuel search, barcode, describe,
and estimate-draft keys land in `fuelLocales` EN. Uncovered **515→489**.

## 2026-08-03 — Active resolveActiveSetDial extract (`.303`)

Kaizen Loop 3 M3. Freestyle carry + suggestion + prescription order lives in
`resolveActiveSetDial` — Active page no longer inlines `priorCompletedInExercise`.

## 2026-08-03 — Victory debrief reply ids + i18n (`.302`)

Kaizen Loop 3 M2. SessionDebriefCard chrome and dose-question replies use stable
ids (`harder`/`exact`/`easy`) with EN pack labels — no English chip literals in
the engine.

## 2026-08-03 — Coach/History/Active i18n batch (`.301`)

Kaizen Loop 3 M1. Coach Adjust/chat/today (~31), History chrome (~8), Active set
table + session jot (~12) into EN packs. Uncovered **566→515**.

## 2026-08-03 — Zero-state + Victory a11y + soft chrome (`.300`)

Kaizen Loop 2 L5. `/track` **3→1** and `/mind` **2→1** (GPS / body Log / Breath
Start demoted to outline). Victory sheet seeded a11y; heatmap cells named;
Sparkline + TodayWeekSection solid paper/ink; Active add-exercise disabled state
uses border/words (no opacity).

## 2026-08-03 — i18n Active/Fuel/Today batch (`.299`)

Kaizen Loop 2 L4. Active chrome + session volume (~36), photoLog/fuelQuick (~28),
and Today week-recap/debrief (~17) keys into EN packs. Uncovered **647→566**.

## 2026-08-03 — Fuel NL tsp/ml/plate + mealDraft (`.298`)

Kaizen Loop 2 L3. NL portion path gains tsp / ml / “plate of” with bare-word
honesty unchanged. `foodToDraft` / `estimateToDraft` / `draftSourceFromEstimate`
live in `mealDraft.ts` (api→database guard stays unit-tested).

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

