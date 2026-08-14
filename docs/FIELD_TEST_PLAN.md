# PLAN — Five-event field test (frozen)

**Status:** frozen 2026-08-13. Implement only this document.  
**Ship label:** `2026.07-unified.711` (past master `.697`; do not steal `.698` `.699` `.700` `.705` `.706` `.707` `.708` `.709` `.710`).  
**Excellence-Override:** free five-event field test (logger)  
**Lane:** Engineering-Web. One concern: the field test.

Root `PLAN.md` is the build roadmap (`docs/PLAN.md`). This file is the frozen task plan.

---

## What this is

A **free logger session** that records five performances and, when the athlete opts into a published scale column, looks up **0–100 points per event** from the Department of the Army ACFT Scoring Scales (23 March 2022). Public product name: **Five-event field test** (short: **Field test**).

Inspired by the Army 5-event battery (internal comments only). Not a branded ACFT/AFT clone. Not Super Bundle bait. Not America/PFT. Not a recruiter.

---

## Events (logger map)

| Slot | Public name | Catalog id | Log shape | Score? |
|------|-------------|------------|-----------|--------|
| 1 | 3-rep max deadlift | `deadlift` (exists) | 1 set · reps=3 · weight=3RM | Yes — lbs |
| 2 | Hand-release push-up | `hand-release-push-up` (**add**) | 1 set · reps=count in 2:00 · weight=0 | Yes — reps |
| 3a | Sprint-drag-carry | `sprint-drag-carry` (**add**) | 1 set · reps=seconds · weight=0 | Yes — time (lower better) |
| 3b | Shuttle + farmer carry | `field-shuttle-carry` (**add**) | same log shape | **Unscored (garage)** |
| 4 | Plank | `plank` (exists) | 1 set · reps=hold seconds · weight=0 | Yes — time (higher better) |
| 5 | 2-mile run | `two-mile-run` (**add**) | 1 set · reps=finish seconds · weight=0 | Yes — time (lower better) |

Timed events reuse the existing plank convention: **seconds live in `reps`**. Do not invent a new `LoggedSet` field.

Add only the three missing catalog rows (plus the garage substitute). Put them on the **base** catalog (`src/data/exercises.ts`) so the session does not wait on `ensureFullExerciseCatalog()`.

---

## Naming (hard)

**Public (UI, i18n, help, Victory, workout name):**

- Product name: `Five-event field test`
- Stable session name (history match): `Five-event field test` — constant `FIELD_TEST_WORKOUT_NAME`
- Footnote (allowed): `Points from the published ACFT scoring tables (23 March 2022).`

**Forbidden in public copy:** US Army, Army Combat Fitness Test as a product name, DoD, AFT, MEPS, recruiter, pass/fail as identity, logos, “you’re top N% of Mission Winning athletes.”

**Allowed internally:** comments may say “inspired by the Army 5-event battery.” The data file cites the government PDF.

Guard: `fieldTestCopy.test.ts` discovers `src/i18n/fieldTestLocales.ts` + help + receipt component and fails on Army / DoD / AFT / MEPS / “Army Combat Fitness Test” **except** the one cited footnote key `fieldTestScoreCite`.

---

## Reach (no new tab)

Not a first-paint nav item. Not a Today Quick-options chip. **Do not** add this session to `FREE_STARTER_PROGRAMS` (that wall paints on Today).

1. **Train empty** (`ActiveEmptyState`) — quiet text link beside Builder: “Five-event field test”.
2. **Session template** — `fieldTestSessionTemplate()` in `src/lib/workout/fieldTest.ts`. Start via `/active?fieldTest=1` (same consume-and-strip pattern as `?exercise=`).
3. **Victory receipt** — when the finished log *is* a field test, show `FieldTestReceiptStrip` + “Run again” (starts the same template). Other sessions do not grow a new primary CTA.

No `/fitness-test` / `/america` wiring. No new route.

---

## Garage SDC (honest)

Official SDC needs a sled and a 25 m lane. Do not pretend a hotel has a 90-lb sled.

On the SDC card during a field-test session only:

- **Garage substitute** → `replaceExerciseInActive` to `field-shuttle-carry` (farmer carry + shuttle). Event marked `unscored` reason `garage`.
- **Skip** → exercise note prefix `field-test:skip:` + no completed working set. Event marked `unscored` reason `skipped`.

Garage / skip **never** receive table points. They **drop the 0–500 total**.

The 2-mile run on a treadmill or road is still the official distance — scored. Garage is SDC-only.

---

## Scoring (cited tables — do not invent)

**Source (cite in the data file header and the UI footnote):**

- Department of the Army, *ACFT Scoring Scales*, 23 March 2022  
- Public PDF: `https://www.army.mil/e2/downloads/rv7/aft/ACFT_scoring_scales_220323.pdf`

Encode **only the five events** (omit Standing Power Throw). Encode every published age band (`17-21` … `57-61`, `62+`) and both published columns (`m` / `f`). Omit `---` cells. **No interpolation.** Lookup = highest published point row whose threshold the performance meets (higher-is-better: `value >= threshold`; lower-is-better: `value <= threshold`). Below the last defined row → 0 points.

MDL table is in **pounds**. Convert stored weight with the athlete’s `UnitsPref` (`kg → lb` when metric) before lookup. Times are seconds.

**Scale key (optional, device-local):** `STORAGE_KEYS.fieldTestScaleKey` = `{ ageBand, column: 'm' | 'f' }`. Copy: “Published scale column” — not identity, not MEPS. Without a key: **raw performances only**, no invented points. Picker lives on the field-test Victory receipt (and a quiet line when starting). Default = unset.

**Bands (MW labels on the published 0–100 rows — say so):**

| Points | Band key | Label |
|--------|----------|--------|
| no lookup / garage / skip | `unscored` | Unscored (garage) / Unscored (skipped) / Unscored |
| 0–59 | `below` | Below 60 |
| 60–69 | `minimum` | Minimum |
| 70–89 | `strong` | Strong |
| 90–100 | `maximum` | Maximum |

UI line: `Bands are Mission Winning labels on the published 0–100 point rows (60 / 70–89 / 90–100).`

Do **not** use Army MOS language (heavy / significant / moderate) unless we print those rows from the same PDF. We are not printing MOS cut lines.

**Percentage:** show `72 / 100` per event and `360 / 500` when the total exists. That is the published point scale, not a cohort percentile.

**Percentile:** **refused.** The PDF is not a population percentile table. We have no MW cohort. Do not show “top 5%.”

**0–500 total:** sum of five event points **only** when all five slots are the official events, each has a looked-up score, and none is garage/skip/missing. Otherwise omit the total (do not show a partial /500).

**Pass/fail as identity:** refused. “Below 60” is a point-row label, not “you failed the Army.”

---

## vs-last (field test only)

#495 (Victory vs-last receipt, `.700`) is another branch. **Do not** implement general Victory vs-last. **Do not** reuse `victory-receipt` / `victory-prev` / `victory-vs-last` test ids.

This ship: compare **this field test** to the previous completed field test in `workoutHistory` (same `FIELD_TEST_WORKOUT_NAME`, earlier `completedAt`). Per-event raw + points delta; total delta when both totals exist. First field test: no vs-last line. Test ids: `field-test-receipt`, `field-test-vs-last`, `field-test-total`.

---

## Files (only these)

| Path | Work |
|------|------|
| `src/lib/workout/fieldTest.ts` | Name, event map, template, garage/skip, `isFieldTestLog` |
| `src/lib/workout/fieldTestScore.ts` | Scale key, lookup, bands, 0–500 gate |
| `src/lib/workout/fieldTestReceipt.ts` | Receipt + vs-last from logs |
| `src/lib/workout/fieldTest*.test.ts` | Behavior + copy guard + mutants |
| `src/data/fieldTestAcftScales.ts` | Cited tables (five events) |
| `src/data/exercises.ts` | Three new + garage ids |
| `src/i18n/fieldTestLocales.ts` | Public strings (new ns, not CORE) |
| `src/components/workout/FieldTestReceiptStrip.tsx` | Victory block |
| `src/components/workout/FieldTestEventActions.tsx` | Garage / skip on SDC |
| `src/components/workout/ActiveEmptyState.tsx` | Quiet start link |
| `src/page-components/ActiveWorkoutPage.tsx` | `?fieldTest=1` + wire actions |
| `src/lib/workout/activeSessionFinish.ts` | Attach receipt on Victory |
| `src/lib/workout/workoutVictory.ts` | Optional `fieldTest` on summary |
| `src/components/workout/WorkoutVictorySheet.tsx` | Mount strip; run-again |
| `src/lib/storage/keys.ts` | `fieldTestScaleKey` |
| i18n hydrate + export manifest + `exportLocales.ts` | Register ns |
| INDEX files + `docs/help/field-test.md` | Reality |
| `LOG.md` + `CONTEXT.md` `## Now` + `buildInfo.ts` | Hard rule 5 |

Do not touch: `FREE_STARTER_PROGRAMS`, nav, America/PFT pages, `#495` Victory receipt, `PRIVATE_MODE`, landing/www, Bundle, leaderboard.

---

## Tests (falsify)

1. Template has the five official ids; garage swap changes only SDC; skip writes the prefix and yields `unscored`.
2. Lookup matches cited rows (no interpolation): e.g. 17–21 M MDL 340 lb → 100, 140 lb → 60, 130 lb → 50; below last row → 0. Metric 154.2 kg ≈ 340 lb → 100.
3. Garage SDC → event unscored, `total500` undefined even if the other four score.
4. No scale key → raw only, no points, no total.
5. vs-last: second field test shows deltas; first does not; a normal workout is not a prior.
6. Copy guard: public strings have no Army marks except `fieldTestScoreCite`.
7. `isFieldTestLog` is name-or-signature; Just Go / starters are not field tests.

---

## Refused (stay refused)

- Leaderboard, Top 8, gym ranking, MW-user percentile
- Invented cut lines or a mystery composite / WHOOP-style readiness
- Scoring garage SDC as the sled event
- Recruiter / MEPS / pass-fail-as-identity copy
- New first-paint tab; Today Quick-options chip; Bundle SKU; trial
- `PRIVATE_MODE` flip; N1 www restyle
- General Victory vs-last (#495)
- Labels `.698` `.699` `.700` `.705` `.706` `.707` `.708` `.709` `.710`
- Android / Expo this ship

---

## Ship protocol

- Draft PR. Preview at most one.
- `Excellence-Override: free five-event field test (logger)` in the commit and PR body.
- Rotate LOG (≤15) and one `## Now` ship bullet (at cap).
- No Claude product code.
