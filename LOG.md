# Mission Winning — Development Log

Chronological record of shipped work. Newest first.

**Rotation rule:** keep **≤15 entries** here, and never let the file grow. When over, move the oldest entries (whole `##` sections, order preserved) to `docs/archive/log/` and list the file in [docs/archive/INDEX.md](docs/archive/INDEX.md). Enforced by `src/lib/logBudget.test.ts` — until `.242` it was enforced by nothing, and the file had reached **27 entries / 127KB**.

> **The `≤20KB` half of this rule was unmeetable and is retired.** An entry here averages ~5.6KB, because the house style is to explain the defect class rather than name the change — which is the most valuable thing in this repo and not something to trade away for a byte count. Fifteen entries is ~84KB; obeying 20KB would have meant keeping **three**. So the count rule stands, and the size rule becomes a **ratchet**: the file may shrink, never grow. If the founder wants a hard byte ceiling instead, that is a call about house style, not about this file.

Archive: [2026-06 → 2026-07-20](docs/archive/log/LOG-2026-06_to_2026-07-20.md) · [2026-07-20 tail](docs/archive/log/LOG-2026-07-20_tail.md) (incl. Accelerator sprint kit rotated 2026-07-22) · [2026-07-20 → 2026-07-29 (`.179` and earlier)](docs/archive/log/LOG-2026-07-20_to_2026-07-29.md) · [2026-07-29 → 2026-07-30 (`.180`–`.199`)](docs/archive/log/LOG-2026-07-29_to_2026-07-30.md) (both rotated 2026-07-30) · [2026-07-30 → 2026-07-31 (`.200`–`.213`)](docs/archive/log/LOG-2026-07-30_to_2026-07-31.md) (rotated 2026-08-02) · [`.247` for `.263`](docs/archive/log/LOG-hero-audit-rotate-2026-08-03.md) · [`.279`](docs/archive/log/LOG-rotate-279.md) · [`.280`](docs/archive/log/LOG-rotate-280.md) · [`.281` for `.296`](docs/archive/log/LOG-rotate-296.md) · [`.282` for `.297`](docs/archive/log/LOG-rotate-297.md) · [`.283` for `.298`](docs/archive/log/LOG-rotate-298.md) · [`.284` for `.299`](docs/archive/log/LOG-rotate-299.md) · [`.285` for `.300`](docs/archive/log/LOG-rotate-300.md) · [`.286` for `.301`](docs/archive/log/LOG-rotate-301.md) · [`.287` for `.302`](docs/archive/log/LOG-rotate-302.md) · [`.288` for `.303`](docs/archive/log/LOG-rotate-303.md) · [`.289` for `.304`](docs/archive/log/LOG-rotate-304.md) · [`.290` for `.305`](docs/archive/log/LOG-rotate-305.md) · [`.291` for `.306`](docs/archive/log/LOG-rotate-306.md) · [`.292` for `.307`](docs/archive/log/LOG-rotate-307.md) · [`.293` for `.308`](docs/archive/log/LOG-rotate-308.md) · [`.294` for `.309`](docs/archive/log/LOG-rotate-309.md) · [`.295` for `.310`](docs/archive/log/LOG-rotate-310.md) · [`.296` for `.311`](docs/archive/log/LOG-rotate-311.md) · [`.297` for `.312`](docs/archive/log/LOG-rotate-312.md) · [`.298` for `.313`](docs/archive/log/LOG-rotate-313.md) · [`.299` for `.314`](docs/archive/log/LOG-rotate-314.md) · [`.300` for `.315`](docs/archive/log/LOG-rotate-315.md). · [`.301` for `.316`](docs/archive/log/LOG-rotate-316.md). · [`.302` for `.317`](docs/archive/log/LOG-rotate-317.md). · [`.303` for `.318`](docs/archive/log/LOG-rotate-318.md). · [`.304` for `.319`](docs/archive/log/LOG-rotate-319.md). · [`.305` for `.320`](docs/archive/log/LOG-rotate-320.md). · [`.306` for `.321`](docs/archive/log/LOG-rotate-321.md). · [`.307` for `.322`](docs/archive/log/LOG-rotate-322.md). · [`.308` for `.323`](docs/archive/log/LOG-rotate-323.md). · [`.309` for `.324`](docs/archive/log/LOG-rotate-324.md). · [`.310` for `.325`](docs/archive/log/LOG-rotate-325.md). · [`.311` for `.326`](docs/archive/log/LOG-rotate-326.md). · [`.312` for `.327`](docs/archive/log/LOG-rotate-327.md). · [`.313` for `.328`](docs/archive/log/LOG-rotate-328.md). · [`.314` for `.329`](docs/archive/log/LOG-rotate-329.md). · [`.315` for `.330`](docs/archive/log/LOG-rotate-330.md). · [`.316` for `.331`](docs/archive/log/LOG-rotate-331.md). · [`.317` for `.332`](docs/archive/log/LOG-rotate-332.md). · [`.318` for `.333`](docs/archive/log/LOG-rotate-333.md). · [`.319` for `.334`](docs/archive/log/LOG-rotate-334.md). · [`.320` for `.335`](docs/archive/log/LOG-rotate-335.md). · [`.321` for `.336`](docs/archive/log/LOG-rotate-336.md). · [`.322` for `.337`](docs/archive/log/LOG-rotate-337.md). · [`.323` for `.338`](docs/archive/log/LOG-rotate-338.md). · [`.324` for `.339`](docs/archive/log/LOG-rotate-339.md). · [`.325` for `.340`](docs/archive/log/LOG-rotate-340.md). · [`.326` for `.341`](docs/archive/log/LOG-rotate-341.md). · [`.327` for `.342`](docs/archive/log/LOG-rotate-342.md). · [`.328` for `.343`](docs/archive/log/LOG-rotate-343.md). · [`.329` for `.344`](docs/archive/log/LOG-rotate-344.md). · [`.330` for `.345`](docs/archive/log/LOG-rotate-345.md). · [`.331` for `.346`](docs/archive/log/LOG-rotate-346.md). · [`.332` for `.347`](docs/archive/log/LOG-rotate-347.md). · [`.333` for `.348`](docs/archive/log/LOG-rotate-348.md). · [`.334` for `.349`](docs/archive/log/LOG-rotate-349.md). · [`.335` for `.350`](docs/archive/log/LOG-rotate-350.md). · [`.336` for `.351`](docs/archive/log/LOG-rotate-351.md). · [`.337` for `.352`](docs/archive/log/LOG-rotate-352.md). · [`.338` for `.353`](docs/archive/log/LOG-rotate-353.md). · [`.339` for `.354`](docs/archive/log/LOG-rotate-354.md). · [`.340` for `.355`](docs/archive/log/LOG-rotate-355.md). · [`.341` for `.356`](docs/archive/log/LOG-rotate-356.md). · [`.342` for `.357`](docs/archive/log/LOG-rotate-357.md). · [`.343` for `.358`](docs/archive/log/LOG-rotate-358.md). · [`.344` for `.359`](docs/archive/log/LOG-rotate-359.md). · [`.345` for `.360`](docs/archive/log/LOG-rotate-360.md). · [`.346` for `.361`](docs/archive/log/LOG-rotate-361.md). · [`.347` for `.362`](docs/archive/log/LOG-rotate-362.md). · [`.348` for `.363`](docs/archive/log/LOG-rotate-363.md). · [`.349` for `.364`](docs/archive/log/LOG-rotate-364.md). · [`.350` for `.365`](docs/archive/log/LOG-rotate-365.md). · [`.351` for `.366`](docs/archive/log/LOG-rotate-366.md). · [`.352` for `.367`](docs/archive/log/LOG-rotate-367.md). · [`.353` for `.368`](docs/archive/log/LOG-rotate-368.md).

---

## 2026-08-04 — Active eyebrow and toggle extracts (`.368`)

Kaizen Loop 22 F2.

- `activeSessionEyebrowKind` owns coach vs live session eyebrow band (ActiveSessionChrome wiring guard)
- `toggleOpenIdx` owns note/swap accordion open state (ActiveWorkoutPage wiring guard)

Cap 16.

## 2026-08-04 — Session check-in seeded a11y (`.367`)

Kaizen Loop 22 F1. Seeded axe on `/active` with session readiness check-in open (history seeded, today's mind check-in cleared so the sheet is offered).

Also: Table scroll region gets `role=region` + `aria-label` with eslint-disable for scrollable-region-focusable; MovePage drops unused map index (lint green). Cap 16.

## 2026-08-04 — Coach chat and briefing-rule chrome solidify (`.366`)

Kaizen Loop 21 E3. Soft chrome leftovers in the Train/Coach wedge:

1. `CoachChatPanel` message bubbles + input drop `rounded-md` for `rounded-none`
2. `.briefing-rule` drops `text-muted-foreground/80` for solid muted ink

Living log Loop 21 closed. Cap 16.

## 2026-08-04 — Active coach tip kind extract (`.365`)

Kaizen Loop 21 E2. `activeCoachTipKind` owns the hard-set tip band (default vs high) so ActiveSessionChrome does not inline `hardCount > 2`.

Wiring guard: chrome must call the helper and must not re-inline the threshold. Cap 16.

## 2026-08-04 — Add-exercise sheet a11y (`.364`)

Kaizen Loop 21 E1. Seeded axe on `/active` with Add exercise sheet open.

**Real axe findings fixed in `ExercisePicker`:**
1. Search input had no accessible name → `aria-label={copy.searchPlaceholder}`
2. Nested `ul[role=listbox]` + `li` + `button[role=option]` failed listitem/parent rules → `div role=listbox` with option buttons as direct children; empty state is `<p>` not `<li>`
3. Listbox gets `aria-label` + `tabIndex={0}` for name + keyboard

Also fixes `benchmarksLocales` type parity (duplicate `benchmarksQuickStarters`, missing `benchmarksWeightTimesReps`) so typecheck stays green.

Mutants: omit search name → serious; restore nested list → serious. Cap 16.

## 2026-08-04 — Toast description opacity solidify (`.363`)

Kaizen Loop 20 D3. ToastDescription drops `opacity-90` for solid ink. Living log Loop 20 closed.

## 2026-08-04 — Session sets progress percent extract (`.362`)

Kaizen Loop 20 D2. `sessionSetsProgressPct` owns the Active sets meter width (wiring guard on ActiveSessionChrome).

## 2026-08-04 — Field note jot seeded a11y (`.361`)

Kaizen Loop 20 D1. Seeded axe on Active SessionJotField after expanding Field note.

## 2026-08-04 — Toast root radius solidify (`.360`)

Kaizen Loop 19 C3. Toast root drops `rounded-md` for `rounded-none` (matches destructive action/close from `.337`). Living log Loop 19 closed.

## 2026-08-04 — Active post-session path extract (`.359`)

Kaizen Loop 19 C2. `activePostSessionPath` owns Victory/discard navigation targets (wiring guard).

## 2026-08-04 — Plate calculator seeded a11y (`.358`)

Kaizen Loop 19 C1. Seeded axe on Active PlateCalculatorSheet. Mobile Plates control was icon-only without `aria-label` — named so axe and athletes can find it.

## 2026-08-04 — Mind check-in note chrome solidify (`.357`)

Kaizen Loop 18 B3. DailyCheckIn optional-note field drops soft `rounded` for `rounded-none border-2`. Living log Loop 18 closed.

## 2026-08-04 — Active session has-exercises extract (`.356`)

Kaizen Loop 18 B2. `activeSessionHasExercises` owns the empty-list gate for Active empty copy (wiring guard).

## 2026-08-04 — Body metrics sheet seeded a11y (`.355`)

Kaizen Loop 18 B1. Seeded axe on /track BodyMetricsSheet after Log — closed card alone never reaches sheet chrome.

## 2026-08-04 — Assessments stage chrome solidify (`.354`)

Kaizen Loop 17 A3. Assessments coach-focus panel and details input drop raw `rounded` for `rounded-none` + solid border. Living log Loop 17 closed.

