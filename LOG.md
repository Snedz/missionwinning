# Mission Winning — Development Log

Chronological record of shipped work. Newest first.

**Rotation rule:** keep **≤15 entries** here, and never let the file grow. When over, move the oldest entries (whole `##` sections, order preserved) to `docs/archive/log/` and list the file in [docs/archive/INDEX.md](docs/archive/INDEX.md). Enforced by `src/lib/logBudget.test.ts` — until `.242` it was enforced by nothing, and the file had reached **27 entries / 127KB**.

> **The `≤20KB` half of this rule was unmeetable and is retired.** An entry here averages ~5.6KB, because the house style is to explain the defect class rather than name the change — which is the most valuable thing in this repo and not something to trade away for a byte count. Fifteen entries is ~84KB; obeying 20KB would have meant keeping **three**. So the count rule stands, and the size rule becomes a **ratchet**: the file may shrink, never grow. If the founder wants a hard byte ceiling instead, that is a call about house style, not about this file.

Archive: [2026-06 → 2026-07-20](docs/archive/log/LOG-2026-06_to_2026-07-20.md) · [2026-07-20 tail](docs/archive/log/LOG-2026-07-20_tail.md) (incl. Accelerator sprint kit rotated 2026-07-22) · [2026-07-20 → 2026-07-29 (`.179` and earlier)](docs/archive/log/LOG-2026-07-20_to_2026-07-29.md) · [2026-07-29 → 2026-07-30 (`.180`–`.199`)](docs/archive/log/LOG-2026-07-29_to_2026-07-30.md) (both rotated 2026-07-30) · [2026-07-30 → 2026-07-31 (`.200`–`.213`)](docs/archive/log/LOG-2026-07-30_to_2026-07-31.md) (rotated 2026-08-02) · [`.247` for `.263`](docs/archive/log/LOG-hero-audit-rotate-2026-08-03.md) · [`.279`](docs/archive/log/LOG-rotate-279.md) · [`.280`](docs/archive/log/LOG-rotate-280.md) · [`.281` for `.296`](docs/archive/log/LOG-rotate-296.md) · [`.282` for `.297`](docs/archive/log/LOG-rotate-297.md) · [`.283` for `.298`](docs/archive/log/LOG-rotate-298.md) · [`.284` for `.299`](docs/archive/log/LOG-rotate-299.md) · [`.285` for `.300`](docs/archive/log/LOG-rotate-300.md) · [`.286` for `.301`](docs/archive/log/LOG-rotate-301.md) · [`.287` for `.302`](docs/archive/log/LOG-rotate-302.md) · [`.288` for `.303`](docs/archive/log/LOG-rotate-303.md) · [`.289` for `.304`](docs/archive/log/LOG-rotate-304.md) · [`.290` for `.305`](docs/archive/log/LOG-rotate-305.md) · [`.291` for `.306`](docs/archive/log/LOG-rotate-306.md) · [`.292` for `.307`](docs/archive/log/LOG-rotate-307.md) · [`.293` for `.308`](docs/archive/log/LOG-rotate-308.md) · [`.294` for `.309`](docs/archive/log/LOG-rotate-309.md) · [`.295` for `.310`](docs/archive/log/LOG-rotate-310.md) · [`.296` for `.311`](docs/archive/log/LOG-rotate-311.md) · [`.297` for `.312`](docs/archive/log/LOG-rotate-312.md) · [`.298` for `.313`](docs/archive/log/LOG-rotate-313.md) · [`.299` for `.314`](docs/archive/log/LOG-rotate-314.md) · [`.300` for `.315`](docs/archive/log/LOG-rotate-315.md). · [`.301` for `.316`](docs/archive/log/LOG-rotate-316.md). · [`.302` for `.317`](docs/archive/log/LOG-rotate-317.md). · [`.303` for `.318`](docs/archive/log/LOG-rotate-318.md). · [`.304` for `.319`](docs/archive/log/LOG-rotate-319.md). · [`.305` for `.320`](docs/archive/log/LOG-rotate-320.md). · [`.306` for `.321`](docs/archive/log/LOG-rotate-321.md). · [`.307` for `.322`](docs/archive/log/LOG-rotate-322.md). · [`.308` for `.323`](docs/archive/log/LOG-rotate-323.md). · [`.309` for `.324`](docs/archive/log/LOG-rotate-324.md). · [`.310` for `.325`](docs/archive/log/LOG-rotate-325.md). · [`.311` for `.326`](docs/archive/log/LOG-rotate-326.md). · [`.312` for `.327`](docs/archive/log/LOG-rotate-327.md). · [`.313` for `.328`](docs/archive/log/LOG-rotate-328.md). · [`.314` for `.329`](docs/archive/log/LOG-rotate-329.md). · [`.315` for `.330`](docs/archive/log/LOG-rotate-330.md). · [`.316` for `.331`](docs/archive/log/LOG-rotate-331.md). · [`.317` for `.332`](docs/archive/log/LOG-rotate-332.md). · [`.318` for `.333`](docs/archive/log/LOG-rotate-333.md). · [`.319` for `.334`](docs/archive/log/LOG-rotate-334.md). · [`.320` for `.335`](docs/archive/log/LOG-rotate-335.md). · [`.321` for `.336`](docs/archive/log/LOG-rotate-336.md). · [`.322` for `.337`](docs/archive/log/LOG-rotate-337.md). · [`.323` for `.338`](docs/archive/log/LOG-rotate-338.md). · [`.324` for `.339`](docs/archive/log/LOG-rotate-339.md). · [`.325` for `.340`](docs/archive/log/LOG-rotate-340.md). · [`.326` for `.341`](docs/archive/log/LOG-rotate-341.md). · [`.327` for `.342`](docs/archive/log/LOG-rotate-342.md). · [`.328` for `.343`](docs/archive/log/LOG-rotate-343.md). · [`.329` for `.344`](docs/archive/log/LOG-rotate-344.md). · [`.330` for `.345`](docs/archive/log/LOG-rotate-345.md). · [`.331` for `.346`](docs/archive/log/LOG-rotate-346.md). · [`.332` for `.347`](docs/archive/log/LOG-rotate-347.md). · [`.333` for `.348`](docs/archive/log/LOG-rotate-348.md). · [`.334` for `.349`](docs/archive/log/LOG-rotate-349.md). · [`.335` for `.350`](docs/archive/log/LOG-rotate-350.md). · [`.336` for `.351`](docs/archive/log/LOG-rotate-351.md). · [`.337` for `.352`](docs/archive/log/LOG-rotate-352.md). · [`.338` for `.353`](docs/archive/log/LOG-rotate-353.md). · [`.339` for `.354`](docs/archive/log/LOG-rotate-354.md). · [`.340` for `.355`](docs/archive/log/LOG-rotate-355.md). · [`.341` for `.356`](docs/archive/log/LOG-rotate-356.md). · [`.342` for `.357`](docs/archive/log/LOG-rotate-357.md). · [`.343` for `.358`](docs/archive/log/LOG-rotate-358.md). · [`.344` for `.359`](docs/archive/log/LOG-rotate-359.md). · [`.345` for `.360`](docs/archive/log/LOG-rotate-360.md). · [`.346` for `.361`](docs/archive/log/LOG-rotate-361.md). · [`.347` for `.362`](docs/archive/log/LOG-rotate-362.md). · [`.348` for `.363`](docs/archive/log/LOG-rotate-363.md). · [`.349` for `.364`](docs/archive/log/LOG-rotate-364.md). · [`.350` for `.365`](docs/archive/log/LOG-rotate-365.md). · [`.351` for `.366`](docs/archive/log/LOG-rotate-366.md). · [`.352` for `.367`](docs/archive/log/LOG-rotate-367.md). · [`.353` for `.368`](docs/archive/log/LOG-rotate-368.md). · [`.354` for `.369`](docs/archive/log/LOG-rotate-369.md). · [`.355` for `.370`](docs/archive/log/LOG-rotate-370.md). · [`.356` for `.371`](docs/archive/log/LOG-rotate-371.md). · [`.357` for `.372`](docs/archive/log/LOG-rotate-372.md). · [`.358` for `.373`](docs/archive/log/LOG-rotate-373.md). · [`.359` for `.374`](docs/archive/log/LOG-rotate-374.md). · [`.360` for `.375`](docs/archive/log/LOG-rotate-375.md). · [`.361` for `.376`](docs/archive/log/LOG-rotate-376.md). · [`.362` for `.377`](docs/archive/log/LOG-rotate-377.md). · [`.363` for `.378`](docs/archive/log/LOG-rotate-378.md). · [`.364` for `.379`](docs/archive/log/LOG-rotate-379.md). · [`.365` for `.380`](docs/archive/log/LOG-rotate-380.md). · [`.366` for `.381`](docs/archive/log/LOG-rotate-381.md). · [`.367` for `.382`](docs/archive/log/LOG-rotate-382.md). · [`.368` for `.383`](docs/archive/log/LOG-rotate-383.md). · [`.369` for `.384`](docs/archive/log/LOG-rotate-384.md). · [`.370` for `.385`](docs/archive/log/LOG-rotate-385.md). · [`.371` for `.386`](docs/archive/log/LOG-rotate-386.md). · [`.372` for `.387`](docs/archive/log/LOG-rotate-387.md). · [`.373` for `.388`](docs/archive/log/LOG-rotate-388.md). · [`.374` for `.389`](docs/archive/log/LOG-rotate-389.md). · [`.375` for `.390`](docs/archive/log/LOG-rotate-390.md). · [`.376` for `.391`](docs/archive/log/LOG-rotate-391.md). · [`.377` for `.392`](docs/archive/log/LOG-rotate-392.md). · [`.378` for `.393`](docs/archive/log/LOG-rotate-393.md). · [`.379` for `.394`](docs/archive/log/LOG-rotate-394.md). · [`.380` for `.395`](docs/archive/log/LOG-rotate-395.md). · [`.381` for `.396`](docs/archive/log/LOG-rotate-396.md). · [`.382` for `.397`](docs/archive/log/LOG-rotate-397.md). · [`.383` for `.398`](docs/archive/log/LOG-rotate-398.md). · [`.384` for `.399`](docs/archive/log/LOG-rotate-399.md). · [`.385` for `.400`](docs/archive/log/LOG-rotate-400.md). · [`.386` for `.401`](docs/archive/log/LOG-rotate-401.md). · [`.387` for `.402`](docs/archive/log/LOG-rotate-402.md). · [`.388` for `.403`](docs/archive/log/LOG-rotate-403.md). · [`.389` for `.404`](docs/archive/log/LOG-rotate-404.md). · [`.390` for `.405`](docs/archive/log/LOG-rotate-405.md). · [`.391` for `.406`](docs/archive/log/LOG-rotate-406.md). · [`.392` for `.407`](docs/archive/log/LOG-rotate-407.md). · [`.393` for `.408`](docs/archive/log/LOG-rotate-408.md). · [`.394` for `.409`](docs/archive/log/LOG-rotate-409.md). · [`.395` for `.410`](docs/archive/log/LOG-rotate-410.md). · [`.396` for `.411`](docs/archive/log/LOG-rotate-411.md). · [`.397` for `.412`](docs/archive/log/LOG-rotate-412.md). · [`.398` for `.413`](docs/archive/log/LOG-rotate-413.md). · [`.399` for `.414`](docs/archive/log/LOG-rotate-414.md). · [`.400` for `.415`](docs/archive/log/LOG-rotate-415.md). · [`.401` for `.416`](docs/archive/log/LOG-rotate-416.md). · [`.402` for `.417`](docs/archive/log/LOG-rotate-417.md). · [`.403` for `.418`](docs/archive/log/LOG-rotate-418.md). · [`.404` for `.419`](docs/archive/log/LOG-rotate-419.md). · [`.405` for `.420`](docs/archive/log/LOG-rotate-420.md). · [`.406` for `.421`](docs/archive/log/LOG-rotate-421.md). · [`.407` for `.422`](docs/archive/log/LOG-rotate-422.md). · [`.408` for `.423`](docs/archive/log/LOG-rotate-423.md). · [`.409` for `.424`](docs/archive/log/LOG-rotate-424.md). · [`.410` for `.425`](docs/archive/log/LOG-rotate-425.md). · [`.411` for `.426`](docs/archive/log/LOG-rotate-426.md). · [`.412` for `.427`](docs/archive/log/LOG-rotate-427.md). · [`.413` for `.428`](docs/archive/log/LOG-rotate-428.md).

---

## 2026-08-04 — Today details More mount gate (`.428`)

`shouldAppendTodayMoreDetails` is the one definition for mounting Today's details disclosure (quick links, accordion, or budget spill). Dashboard wires it; unit + wiring guards.

Mutants: restore inline `belowFoldReady && (showQuickLinks || …)` → wiring red.

## 2026-08-04 — Bare opacity-90/95 soft-chrome ratchet (`.427`)

`stateOpacityContrast` bans bare `opacity-90` and `opacity-95` alongside 40–80. TrackWeeklyInsights locked card drops `opacity-95` (blur already marks the sample). Prefixed hover/disabled forms stay allowed.

Mutants: restore bare `opacity-95` on a text-bearing card → guard red.

## 2026-08-04 — Today trainReady one definition (`.426`)

`isTodayTrainReady` is the one home for Just Go train-ready gates. Lean, full dashboard Just Go meta, and `runTodayPrimaryAction` all call it — lean no longer omits commissioned. Wiring guard discovers the three call sites.

Mutants: restore inline `href === '/active' || !!startWorkout` in a shell → wiring red.

## 2026-08-04 — ActiveExerciseFooter + prev labels (`.425`)

Peel Add Set / Rest / desktop set-kinds / Set options into `ActiveExerciseFooter`. Prev table column uses pure `formatPrevSetLabels` (one format). Card 380→343. Wiring guards follow the menu extract pattern.

Mutants: leave `shouldShowSetOptionsFooter` in card → wiring red; inline prev map without helper → wiring red.

## 2026-08-04 — NL word-half qty (Fuel accuracy) (`.424`)

`half a cup` / `half cup` / `one and a half cups` / `a cup and a half` / bare `half chicken` parse as true half/1.5 qty. Removed `half` from GLOBAL_PORTION (was double-scaling word qty to ~0.65×). Matcher order: and-a-half before bare half-portion so trailing `half cups` cannot steal. `small` plate-size scale unchanged.

Mutants: put half-portion before and-a-half → `one and a half cups` = 0.5 → red; restore GLOBAL half → double scale → red.

## 2026-08-04 — MoreSheet soft chrome + NL mixed qty (`.423`)

MoreSheet Premium kicker drops bare `opacity-90` for solid `text-primary-foreground` (soft chrome, not Bundle deepen). NL meal log parses mixed numbers (`1 1/2 cup rice` → 1.5×, not the trailing half) before fraction matchers — Fuel accuracy residual. i18n uncovered cap stays 16.

Mutants: drop mixed-before-fraction order → `1 1/2 cup` becomes half → red; leave opacity-90 → soft-chrome intent lost.

## 2026-08-04 — Victory one-exit slim (`.422`)

`shouldShowVictoryBackTodaySecondary` is the one definition for the quiet Today escape when primary next is Coach/Train/session-2 — not a second outline button. WorkoutVictorySheet collapses dual Share · Share card into one Share (files when the platform can, else text/clipboard; cancel stops). Free ritual stays ungated; no Bundle upsell. Wiring + unit guards.

Mutants: flip `/log` hide → red; leave `victoryShareCard` in sheet → wiring red.

## 2026-08-04 — Coach manage/adjust/schedule seeded axe (`.421`)

Seeded axe for D12 Coach overlays that zero-data `/coach` never opens: Manage this week, Change schedule (`CoachScheduleEditor`), and Adjust today. Three Playwright cases after `seedHistoryAndMissedCoach` — all green on mobile-chrome.

## 2026-08-04 — NL meal fraction qty parse (`.420`)

NL meal parse treated the **denominator** of a fraction as the count: `1/2 cup rice` became 2× rice (~4× calories). `findQtyBefore` now matches `N/D` (+ optional portion word) before whole-number portion paths, and digit matchers refuse a preceding `/`. Confidence stays `medium` for portion-scaled singles — never invented `high`. Tests: half-cup rice, half chicken, 3/4 cup oats; regressions on `2 cups` / `12 eggs` / scoops.

## 2026-08-04 — Pure Today candidate builder (`.419`)

`HomeTodayDashboard` assembled Today blocks with an inline if-ladder next to JSX — densest-evening order was untestable without mounting the shell. New [`buildTodayCandidates.ts`](src/lib/today/buildTodayCandidates.ts) emits ordered `{ key, priority, pinned? }` specs from the same mount gates; the page maps keys → nodes then calls existing `planTodayBlocks`. Budget stays 6; dashboard stays 32. Unit tests lock pins, phase masks, and session+week-on-top spill.

## 2026-08-04 — ActiveExerciseCard next-target + menu extract (`.418`)

ActiveExerciseCard still owned the "Next: N × W" branch and menu visibility inline after Loops 20–32 emptied the page of predicates. Extracted `resolveExerciseNextTarget`, `shouldShowLoadPctChip`, `shouldShowSupersetLinkMenuitem`, and `shouldShowExerciseSwapMenuitem` into [`activeWorkoutHelpers.ts`](src/lib/workout/activeWorkoutHelpers.ts) with wiring guards. Prescribed sessions never call `suggestNextSetTarget` (mutant: inject suggest → 0 calls). Overflow UI moved to [`ActiveExerciseMoreMenu.tsx`](src/components/workout/ActiveExerciseMoreMenu.tsx) + [`ActiveSetOptionsMenu.tsx`](src/components/workout/ActiveSetOptionsMenu.tsx) — card **536 → 380** LOC.

## 2026-08-04 — Guidebook hero palette discovery scope (`.417`)

`heroPaths()` only reads `heroImage.src` under `/learn/`, not every section
`figure` path densified in `.414`. Section art stays free to teach without
being scored as chapter openers; six-pillars + protein figures got more brand
red for craft quality.

## 2026-08-04 — Scout modernist re-ink + magazine PDF densify (`.416`)

Scout idle/invite/celebrate re-generated on paper ground with ink edges and
vermillion accents (old kit was ~90% near-black). Magazine PDF rebuilt
(~27 pages, 1.2MB) with densified Learn section figures. `build-guidebook-pdf`
uses `load` + image settle instead of flaky `networkidle`.

## 2026-08-04 — Pattern packs + Learn 18/18 + social WebP (`.415`)

Seven shared movement-pattern form SVGs (squat/hinge/push/pull/core/loco/isolation)
with honest captions for long-tail cues-only exercises. Learn guidebook free
sections now all have teaching figures (18/18). Social invite + coach story
optimized to WebP. Pattern inference tests + uniqueness green.

## 2026-08-04 — Form T1 + Learn section densify (`.414`)

Every structured form guide has an instructional SVG (52/52). T1 batch via
form-kit (22 new diagrams). Learn densify: 8 paper/ink section figures (SAID,
energy systems, recovery, progressive overload, deload, first session, protein,
retest cadence) wired into Beyond the Basics — free sections with teaching
figures rise from 7→13 of 18. Uniqueness + palette guards green.

