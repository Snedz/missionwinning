# Mission Winning — Development Log

Chronological record of shipped work. Newest first.

**Rotation rule:** keep **≤15 entries** here, and never let the file grow. When over, move the oldest entries (whole `##` sections, order preserved) to `docs/archive/log/` and list the file in [docs/archive/INDEX.md](docs/archive/INDEX.md). Enforced by `src/lib/logBudget.test.ts` — until `.242` it was enforced by nothing, and the file had reached **27 entries / 127KB**.

> **The `≤20KB` half of this rule was unmeetable and is retired.** An entry here averages ~5.6KB, because the house style is to explain the defect class rather than name the change — which is the most valuable thing in this repo and not something to trade away for a byte count. Fifteen entries is ~84KB; obeying 20KB would have meant keeping **three**. So the count rule stands, and the size rule becomes a **ratchet**: the file may shrink, never grow. If the founder wants a hard byte ceiling instead, that is a call about house style, not about this file.

Archive: [2026-06 → 2026-07-20](docs/archive/log/LOG-2026-06_to_2026-07-20.md) · [2026-07-20 tail](docs/archive/log/LOG-2026-07-20_tail.md) (incl. Accelerator sprint kit rotated 2026-07-22) · [2026-07-20 → 2026-07-29 (`.179` and earlier)](docs/archive/log/LOG-2026-07-20_to_2026-07-29.md) · [2026-07-29 → 2026-07-30 (`.180`–`.199`)](docs/archive/log/LOG-2026-07-29_to_2026-07-30.md) (both rotated 2026-07-30) · [2026-07-30 → 2026-07-31 (`.200`–`.213`)](docs/archive/log/LOG-2026-07-30_to_2026-07-31.md) (rotated 2026-08-02) · [`.247` for `.263`](docs/archive/log/LOG-hero-audit-rotate-2026-08-03.md) · [`.279`](docs/archive/log/LOG-rotate-279.md) · [`.280`](docs/archive/log/LOG-rotate-280.md) · [`.281` for `.296`](docs/archive/log/LOG-rotate-296.md) · [`.282` for `.297`](docs/archive/log/LOG-rotate-297.md) · [`.283` for `.298`](docs/archive/log/LOG-rotate-298.md) · [`.284` for `.299`](docs/archive/log/LOG-rotate-299.md) · [`.285` for `.300`](docs/archive/log/LOG-rotate-300.md) · [`.286` for `.301`](docs/archive/log/LOG-rotate-301.md) · [`.287` for `.302`](docs/archive/log/LOG-rotate-302.md) · [`.288` for `.303`](docs/archive/log/LOG-rotate-303.md) · [`.289` for `.304`](docs/archive/log/LOG-rotate-304.md) · [`.290` for `.305`](docs/archive/log/LOG-rotate-305.md) · [`.291` for `.306`](docs/archive/log/LOG-rotate-306.md) · [`.292` for `.307`](docs/archive/log/LOG-rotate-307.md) · [`.293` for `.308`](docs/archive/log/LOG-rotate-308.md) · [`.294` for `.309`](docs/archive/log/LOG-rotate-309.md) · [`.295` for `.310`](docs/archive/log/LOG-rotate-310.md) · [`.296` for `.311`](docs/archive/log/LOG-rotate-311.md) · [`.297` for `.312`](docs/archive/log/LOG-rotate-312.md) · [`.298` for `.313`](docs/archive/log/LOG-rotate-313.md) · [`.299` for `.314`](docs/archive/log/LOG-rotate-314.md) · [`.300` for `.315`](docs/archive/log/LOG-rotate-315.md). · [`.301` for `.316`](docs/archive/log/LOG-rotate-316.md). · [`.302` for `.317`](docs/archive/log/LOG-rotate-317.md). · [`.303` for `.318`](docs/archive/log/LOG-rotate-318.md). · [`.304` for `.319`](docs/archive/log/LOG-rotate-319.md). · [`.305` for `.320`](docs/archive/log/LOG-rotate-320.md). · [`.306` for `.321`](docs/archive/log/LOG-rotate-321.md). · [`.307` for `.322`](docs/archive/log/LOG-rotate-322.md). · [`.308` for `.323`](docs/archive/log/LOG-rotate-323.md). · [`.309` for `.324`](docs/archive/log/LOG-rotate-324.md). · [`.310` for `.325`](docs/archive/log/LOG-rotate-325.md). · [`.311` for `.326`](docs/archive/log/LOG-rotate-326.md). · [`.312` for `.327`](docs/archive/log/LOG-rotate-327.md). · [`.313` for `.328`](docs/archive/log/LOG-rotate-328.md). · [`.314` for `.329`](docs/archive/log/LOG-rotate-329.md). · [`.315` for `.330`](docs/archive/log/LOG-rotate-330.md). · [`.316` for `.331`](docs/archive/log/LOG-rotate-331.md). · [`.317` for `.332`](docs/archive/log/LOG-rotate-332.md). · [`.318` for `.333`](docs/archive/log/LOG-rotate-333.md). · [`.319` for `.334`](docs/archive/log/LOG-rotate-334.md). · [`.320` for `.335`](docs/archive/log/LOG-rotate-335.md). · [`.321` for `.336`](docs/archive/log/LOG-rotate-336.md). · [`.322` for `.337`](docs/archive/log/LOG-rotate-337.md). · [`.323` for `.338`](docs/archive/log/LOG-rotate-338.md). · [`.324` for `.339`](docs/archive/log/LOG-rotate-339.md). · [`.325` for `.340`](docs/archive/log/LOG-rotate-340.md). · [`.326` for `.341`](docs/archive/log/LOG-rotate-341.md). · [`.327` for `.342`](docs/archive/log/LOG-rotate-342.md). · [`.328` for `.343`](docs/archive/log/LOG-rotate-343.md). · [`.329` for `.344`](docs/archive/log/LOG-rotate-344.md). · [`.330` for `.345`](docs/archive/log/LOG-rotate-345.md). · [`.331` for `.346`](docs/archive/log/LOG-rotate-346.md). · [`.332` for `.347`](docs/archive/log/LOG-rotate-347.md). · [`.333` for `.348`](docs/archive/log/LOG-rotate-348.md). · [`.334` for `.349`](docs/archive/log/LOG-rotate-349.md). · [`.335` for `.350`](docs/archive/log/LOG-rotate-350.md). · [`.336` for `.351`](docs/archive/log/LOG-rotate-351.md). · [`.337` for `.352`](docs/archive/log/LOG-rotate-352.md). · [`.338` for `.353`](docs/archive/log/LOG-rotate-353.md). · [`.339` for `.354`](docs/archive/log/LOG-rotate-354.md). · [`.340` for `.355`](docs/archive/log/LOG-rotate-355.md). · [`.341` for `.356`](docs/archive/log/LOG-rotate-356.md). · [`.342` for `.357`](docs/archive/log/LOG-rotate-357.md). · [`.343` for `.358`](docs/archive/log/LOG-rotate-358.md). · [`.344` for `.359`](docs/archive/log/LOG-rotate-359.md). · [`.345` for `.360`](docs/archive/log/LOG-rotate-360.md). · [`.346` for `.361`](docs/archive/log/LOG-rotate-361.md). · [`.347` for `.362`](docs/archive/log/LOG-rotate-362.md). · [`.348` for `.363`](docs/archive/log/LOG-rotate-363.md). · [`.349` for `.364`](docs/archive/log/LOG-rotate-364.md). · [`.350` for `.365`](docs/archive/log/LOG-rotate-365.md). · [`.351` for `.366`](docs/archive/log/LOG-rotate-366.md). · [`.352` for `.367`](docs/archive/log/LOG-rotate-367.md). · [`.353` for `.368`](docs/archive/log/LOG-rotate-368.md). · [`.354` for `.369`](docs/archive/log/LOG-rotate-369.md). · [`.355` for `.370`](docs/archive/log/LOG-rotate-370.md). · [`.356` for `.371`](docs/archive/log/LOG-rotate-371.md). · [`.357` for `.372`](docs/archive/log/LOG-rotate-372.md). · [`.358` for `.373`](docs/archive/log/LOG-rotate-373.md). · [`.359` for `.374`](docs/archive/log/LOG-rotate-374.md). · [`.360` for `.375`](docs/archive/log/LOG-rotate-375.md). · [`.361` for `.376`](docs/archive/log/LOG-rotate-376.md). · [`.362` for `.377`](docs/archive/log/LOG-rotate-377.md). · [`.363` for `.378`](docs/archive/log/LOG-rotate-378.md). · [`.364` for `.379`](docs/archive/log/LOG-rotate-379.md). · [`.365` for `.380`](docs/archive/log/LOG-rotate-380.md). · [`.366` for `.381`](docs/archive/log/LOG-rotate-381.md). · [`.367` for `.382`](docs/archive/log/LOG-rotate-382.md). · [`.368` for `.383`](docs/archive/log/LOG-rotate-383.md). · [`.369` for `.384`](docs/archive/log/LOG-rotate-384.md). · [`.370` for `.385`](docs/archive/log/LOG-rotate-385.md). · [`.371` for `.386`](docs/archive/log/LOG-rotate-386.md). · [`.372` for `.387`](docs/archive/log/LOG-rotate-387.md). · [`.373` for `.388`](docs/archive/log/LOG-rotate-388.md). · [`.374` for `.389`](docs/archive/log/LOG-rotate-389.md). · [`.375` for `.390`](docs/archive/log/LOG-rotate-390.md).

---

## 2026-08-04 — Label and dialog close chrome solidify (`.390`)

Kaizen Loop 29 M3. Soft chrome leftovers:

1. Label peer-disabled: opacity → muted ink
2. Dialog close: drop opacity/rounded-sm for bordered rounded-none + hover muted

Living log Loop 29 closed. Cap 16.

## 2026-08-04 — Active activeSetIdxForExercise extract (`.389`)

Kaizen Loop 29 M2. `activeSetIdxForExercise` owns desktop SetLogTable activeSetIdx so ActiveExerciseCard does not inline the ternary. Wiring guard on the card. Cap 16.

## 2026-08-04 — Exercise more menu seeded a11y (`.388`)

Kaizen Loop 29 M1. Seeded axe on `/active` with exercise More actions open (verifies HoldToConfirm outside `role=menu` from `.385`). Cap 16.

## 2026-08-04 — OtpInput status-ok chrome solidify (`.387`)

Kaizen Loop 28 L3. OtpInput success state drops translucent `status-ok/0.08` fill for solid status-ok background with background ink. Living log Loop 28 closed. Cap 16.

## 2026-08-04 — Active isActiveSetCell extract (`.386`)

Kaizen Loop 28 L2. `isActiveSetCell` owns next-set cell identity so ActiveExerciseCard does not inline the exIdx/setIdx pair compare. Wiring guard on the card. Cap 16.

## 2026-08-04 — Session more menu seeded a11y (`.385`)

Kaizen Loop 28 L1. Seeded axe on `/active` with session More menu open (Discard HoldToConfirm).

**Real axe finding fixed:** `role=menu` must not wrap `HoldToConfirmButton` (`button[aria-busy]` fails aria-required-children). Session chrome drops menu role for a plain disclosure; exercise overflow keeps `role=menu` only around menuitems, HoldToConfirm outside.

Cap 16.

## 2026-08-04 — BetaAdmin and landing chrome solidify (`.384`)

Kaizen Loop 27 K3. Soft chrome leftovers:

1. BetaAdminPanel inputs/buttons: `rounded-md` → `rounded-none`
2. Landing supporting copy: `text-background/80` → solid `text-background`

Living log Loop 27 closed. Cap 16. Bundle soft chrome still refused.

## 2026-08-04 — Active holdsActiveExercise extract (`.383`)

Kaizen Loop 27 K2. `holdsActiveExercise` owns next-set exercise ownership so ActiveExerciseCard does not inline `nextSet?.exIdx === exIdx`. Wiring guard on the card. Cap 16.

## 2026-08-04 — Set options seeded a11y (`.382`)

Kaizen Loop 27 K1. Seeded axe on `/active` with Set options menu open (add push-ups → Set options). Cap 16.

## 2026-08-04 — Fitness inputs and leaderboard flavor chrome (`.381`)

Kaizen Loop 26 J3. Soft chrome leftovers:

1. TeacherClass + YouthParentGate + SchoolClassPanel + FitnessTestRunner inputs: `rounded-md` → `rounded-none`
2. Leaderboard flavor copy: drop `/80` `/90` opacity on theme ink

Living log Loop 26 closed. Cap 16. Bundle soft chrome still refused.

## 2026-08-04 — Active firstPlannedSetIdx extract (`.380`)

Kaizen Loop 26 J2. `firstPlannedSetIdx` owns the first incomplete set index so ActiveExerciseCard does not inline `findIndex`. Wiring guard on the card. Cap 16.

## 2026-08-04 — Rest timer seeded a11y (`.379`)

Kaizen Loop 26 J1. Seeded axe on `/active` with rest timer dock open (add push-ups → log set). Cap 16.

## 2026-08-04 — Off-palette red error chrome solidify (`.378`)

Kaizen Loop 25 I3. Soft chrome leftovers: YouthParentGate, TrackGpsPanel, TeacherClassPage, YouthConsentConfirm — `text-red-400` → solid `text-destructive`.

Living log Loop 25 closed. Cap 16.

## 2026-08-04 — Active exerciseHasPlannedSet extract (`.377`)

Kaizen Loop 25 I2. `exerciseHasPlannedSet` owns the open-set predicate so ActiveExerciseCard does not inline `sets.some(!completed)`. Wiring guard on the card. Cap 16.

## 2026-08-04 — Exercise note seeded a11y (`.376`)

Kaizen Loop 25 I1. Seeded axe on `/active` with per-exercise note open (add push-ups → More → Note). Cap 16.

