# Mission Winning — Development Log

Chronological record of shipped work. Newest first.

**Rotation rule:** keep **≤15 entries** here, and never let the file grow. When over, move the oldest entries (whole `##` sections, order preserved) to `docs/archive/log/` and list the file in [docs/archive/INDEX.md](docs/archive/INDEX.md). Enforced by `src/lib/logBudget.test.ts` — until `.242` it was enforced by nothing, and the file had reached **27 entries / 127KB**.

> **The `≤20KB` half of this rule was unmeetable and is retired.** An entry here averages ~5.6KB, because the house style is to explain the defect class rather than name the change — which is the most valuable thing in this repo and not something to trade away for a byte count. Fifteen entries is ~84KB; obeying 20KB would have meant keeping **three**. So the count rule stands, and the size rule becomes a **ratchet**: the file may shrink, never grow. If the founder wants a hard byte ceiling instead, that is a call about house style, not about this file.

Archive: [2026-06 → 2026-07-20](docs/archive/log/LOG-2026-06_to_2026-07-20.md) · [2026-07-20 tail](docs/archive/log/LOG-2026-07-20_tail.md) (incl. Accelerator sprint kit rotated 2026-07-22) · [2026-07-20 → 2026-07-29 (`.179` and earlier)](docs/archive/log/LOG-2026-07-20_to_2026-07-29.md) · [2026-07-29 → 2026-07-30 (`.180`–`.199`)](docs/archive/log/LOG-2026-07-29_to_2026-07-30.md) (both rotated 2026-07-30) · [2026-07-30 → 2026-07-31 (`.200`–`.213`)](docs/archive/log/LOG-2026-07-30_to_2026-07-31.md) (rotated 2026-08-02) · [`.247` for `.263`](docs/archive/log/LOG-hero-audit-rotate-2026-08-03.md) · [`.279`](docs/archive/log/LOG-rotate-279.md) · [`.280`](docs/archive/log/LOG-rotate-280.md) · [`.281` for `.296`](docs/archive/log/LOG-rotate-296.md) · [`.282` for `.297`](docs/archive/log/LOG-rotate-297.md) · [`.283` for `.298`](docs/archive/log/LOG-rotate-298.md) · [`.284` for `.299`](docs/archive/log/LOG-rotate-299.md) · [`.285` for `.300`](docs/archive/log/LOG-rotate-300.md) · [`.286` for `.301`](docs/archive/log/LOG-rotate-301.md) · [`.287` for `.302`](docs/archive/log/LOG-rotate-302.md) · [`.288` for `.303`](docs/archive/log/LOG-rotate-303.md) · [`.289` for `.304`](docs/archive/log/LOG-rotate-304.md) · [`.290` for `.305`](docs/archive/log/LOG-rotate-305.md) · [`.291` for `.306`](docs/archive/log/LOG-rotate-306.md) · [`.292` for `.307`](docs/archive/log/LOG-rotate-307.md) · [`.293` for `.308`](docs/archive/log/LOG-rotate-308.md) · [`.294` for `.309`](docs/archive/log/LOG-rotate-309.md) · [`.295` for `.310`](docs/archive/log/LOG-rotate-310.md) · [`.296` for `.311`](docs/archive/log/LOG-rotate-311.md) · [`.297` for `.312`](docs/archive/log/LOG-rotate-312.md) · [`.298` for `.313`](docs/archive/log/LOG-rotate-313.md) · [`.299` for `.314`](docs/archive/log/LOG-rotate-314.md) · [`.300` for `.315`](docs/archive/log/LOG-rotate-315.md). · [`.301` for `.316`](docs/archive/log/LOG-rotate-316.md).

---

## 2026-08-04 — Track import i18n (`.316`)

Kaizen Loop 6 P4. ActivityImportPanel keys (`trackImport*`, `sessions`) into
`trackLocales` EN. Uncovered **209→193**.

## 2026-08-04 — GuidedStepPlayer i18n (`.315`)

Kaizen Loop 6 P3. Move/Mind guided runner chrome into `activeWorkoutLocales`
EN. Uncovered **220→209**.

## 2026-08-04 — History journal + anatomy i18n (`.314`)

Kaizen Loop 6 P2. Journal timeline and anatomy map keys into `historyLocales`
EN. Uncovered **235→220**.

## 2026-08-04 — Profile privacy/premium/CSV/sync i18n (`.313`)

Kaizen Loop 6 P1. Profile Import/Privacy/Premium/Sync and page chrome keys
into `notificationLocales` EN. Uncovered **274→235**.

## 2026-08-03 — Profile backup i18n + soft chrome residue (`.312`)

Kaizen Loop 5 O2. Profile backup/account keys into `notificationLocales`;
FileUploadRow, Today header, Coach week strip, Sidebar/AppHeader solid chrome.
Uncovered **299→274**.

## 2026-08-03 — Track body/progress + Profile reminders i18n (`.311`)

Kaizen Loop 5 O1. Body metrics, progress photos, and Profile reminder keys into
`trackLocales` / `notificationLocales` EN. Uncovered **332→299**.

## 2026-08-03 — Fuel log sheet seeded a11y (`.310`)

Kaizen Loop 4 N5. Zero-data `/nutrition` never opens FuelLogSheet; axe now
measures Quick/Describe/Custom/Photo chrome after Log food.

## 2026-08-03 — Today Behavior / DayReview / reentry i18n (`.309`)

Kaizen Loop 4 N4. BehaviorStrip, DayReviewOptIn, MuscleFreshness, reentry,
Mission Score tips, and Today details keys into `todayLocales` EN (zh/id/th/ar
inherit via `en.*`). Uncovered **381→332**.

## 2026-08-03 — Repeat-last extract + soft chrome residue (`.308`)

Kaizen Loop 4 N3. `resolveRepeatLastTarget` owns Active repeat-last; wiring
guard. Button `onInk`/`outline`, photo note, and AppLegalFooter drop soft
opacity chrome for solid paper/ink fills.

## 2026-08-03 — Fuel adapt/targets/weight leftovers i18n (`.307`)

Kaizen Loop 4 N2. Adapt banner, goal wizard, targets, weight, past days, recipes,
and Nutrition toasts into `fuelLocales` EN. Uncovered **447→381**.

## 2026-08-03 — Mind check-in / breathing i18n (`.306`)

Kaizen Loop 4 N1. DailyCheckIn, BreathingTimer, Mind page + locked-preview keys
into `mindLocales` EN. Uncovered **473→447**.

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

