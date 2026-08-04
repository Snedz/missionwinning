# Mission Winning — Development Log

Chronological record of shipped work. Newest first.

**Rotation rule:** keep **≤15 entries** here, and never let the file grow. When over, move the oldest entries (whole `##` sections, order preserved) to `docs/archive/log/` and list the file in [docs/archive/INDEX.md](docs/archive/INDEX.md). Enforced by `src/lib/logBudget.test.ts` — until `.242` it was enforced by nothing, and the file had reached **27 entries / 127KB**.

> **The `≤20KB` half of this rule was unmeetable and is retired.** An entry here averages ~5.6KB, because the house style is to explain the defect class rather than name the change — which is the most valuable thing in this repo and not something to trade away for a byte count. Fifteen entries is ~84KB; obeying 20KB would have meant keeping **three**. So the count rule stands, and the size rule becomes a **ratchet**: the file may shrink, never grow. If the founder wants a hard byte ceiling instead, that is a call about house style, not about this file.

Archive: [2026-06 → 2026-07-20](docs/archive/log/LOG-2026-06_to_2026-07-20.md) · [2026-07-20 tail](docs/archive/log/LOG-2026-07-20_tail.md) (incl. Accelerator sprint kit rotated 2026-07-22) · [2026-07-20 → 2026-07-29 (`.179` and earlier)](docs/archive/log/LOG-2026-07-20_to_2026-07-29.md) · [2026-07-29 → 2026-07-30 (`.180`–`.199`)](docs/archive/log/LOG-2026-07-29_to_2026-07-30.md) (both rotated 2026-07-30) · [2026-07-30 → 2026-07-31 (`.200`–`.213`)](docs/archive/log/LOG-2026-07-30_to_2026-07-31.md) (rotated 2026-08-02) · [`.247` for `.263`](docs/archive/log/LOG-hero-audit-rotate-2026-08-03.md) · [`.279`](docs/archive/log/LOG-rotate-279.md) · [`.280`](docs/archive/log/LOG-rotate-280.md) · [`.281` for `.296`](docs/archive/log/LOG-rotate-296.md) · [`.282` for `.297`](docs/archive/log/LOG-rotate-297.md) · [`.283` for `.298`](docs/archive/log/LOG-rotate-298.md) · [`.284` for `.299`](docs/archive/log/LOG-rotate-299.md) · [`.285` for `.300`](docs/archive/log/LOG-rotate-300.md) · [`.286` for `.301`](docs/archive/log/LOG-rotate-301.md) · [`.287` for `.302`](docs/archive/log/LOG-rotate-302.md) · [`.288` for `.303`](docs/archive/log/LOG-rotate-303.md) · [`.289` for `.304`](docs/archive/log/LOG-rotate-304.md) · [`.290` for `.305`](docs/archive/log/LOG-rotate-305.md) · [`.291` for `.306`](docs/archive/log/LOG-rotate-306.md) · [`.292` for `.307`](docs/archive/log/LOG-rotate-307.md) · [`.293` for `.308`](docs/archive/log/LOG-rotate-308.md) · [`.294` for `.309`](docs/archive/log/LOG-rotate-309.md) · [`.295` for `.310`](docs/archive/log/LOG-rotate-310.md) · [`.296` for `.311`](docs/archive/log/LOG-rotate-311.md) · [`.297` for `.312`](docs/archive/log/LOG-rotate-312.md) · [`.298` for `.313`](docs/archive/log/LOG-rotate-313.md) · [`.299` for `.314`](docs/archive/log/LOG-rotate-314.md) · [`.300` for `.315`](docs/archive/log/LOG-rotate-315.md). · [`.301` for `.316`](docs/archive/log/LOG-rotate-316.md). · [`.302` for `.317`](docs/archive/log/LOG-rotate-317.md). · [`.303` for `.318`](docs/archive/log/LOG-rotate-318.md). · [`.304` for `.319`](docs/archive/log/LOG-rotate-319.md). · [`.305` for `.320`](docs/archive/log/LOG-rotate-320.md). · [`.306` for `.321`](docs/archive/log/LOG-rotate-321.md). · [`.307` for `.322`](docs/archive/log/LOG-rotate-322.md). · [`.308` for `.323`](docs/archive/log/LOG-rotate-323.md). · [`.309` for `.324`](docs/archive/log/LOG-rotate-324.md). · [`.310` for `.325`](docs/archive/log/LOG-rotate-325.md). · [`.311` for `.326`](docs/archive/log/LOG-rotate-326.md). · [`.312` for `.327`](docs/archive/log/LOG-rotate-327.md).

---

## 2026-08-04 — Learn + consent + Coach demo i18n (`.327`)

Kaizen Loop 9 S1–S2. Learn/CourseReader leftovers, AnalyticsConsentBanner, and
landing CoachAdaptDemo into EN packs. Uncovered **92→69**.

## 2026-08-04 — Builder blank-draft seeded a11y (`.326`)

Kaizen Loop 8 R5. Seeded axe on Builder after Blank workout. Living log Loop 8
closed.

## 2026-08-04 — Welcome + upload/owner i18n (`.325`)

Kaizen Loop 8 R3–R4. Welcome session-ready leftovers, FileUploadRow status
lines, and ProfileOwnerTools demo chrome into EN packs. Uncovered **112→92**.

## 2026-08-04 — Leaderboard leftovers i18n (`.324`)

Kaizen Loop 8 R2. Leaderboard empty/error chrome into `leaderboardLocales` EN.
Uncovered **121→112**.

## 2026-08-04 — Coaching interest i18n (`.323`)

Kaizen Loop 8 R1. Coaching form leftovers into `infoLocales` EN.
Uncovered **134→121**.

## 2026-08-04 — Library filters seeded a11y (`.322`)

Kaizen Loop 7 Q5. Seeded axe on Library Filters dialog open. Living log Loop 7
closed.

## 2026-08-04 — Live heart-rate i18n (`.321`)

Kaizen Loop 7 Q4. LiveHeartRate connect/idle/hint keys into
`activeWorkoutLocales` EN. Uncovered **141→134**.

## 2026-08-04 — Builder page/templates i18n (`.320`)

Kaizen Loop 7 Q3. Builder start/arrange/finish + ProgramTemplates leftovers
(+ shared `retry`) into EN packs. Uncovered **162→141**.

## 2026-08-04 — Library page i18n (`.319`)

Kaizen Loop 7 Q2. Library filters/details leftovers into `libraryLocales` EN.
Uncovered **176→162**.

## 2026-08-04 — Profile wearables i18n (`.318`)

Kaizen Loop 7 Q1. ProfileWearablesCard keys into `notificationLocales` EN.
Uncovered **193→176**.

## 2026-08-04 — History journal seeded a11y (`.317`)

Kaizen Loop 6 P5. Seed journal entry + axe on Journal edit chrome (search,
privacy line, textarea). Living log Loop 6 closed.

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

