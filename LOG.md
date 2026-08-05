# Mission Winning — Development Log

Chronological record of shipped work. Newest first.

**Rotation rule:** keep **≤15 entries** here, and never let the file grow. When over, move the oldest entries (whole `##` sections, order preserved) to `docs/archive/log/` and list the file in [docs/archive/INDEX.md](docs/archive/INDEX.md). Enforced by `src/lib/logBudget.test.ts` — until `.242` it was enforced by nothing, and the file had reached **27 entries / 127KB**.

> **The `≤20KB` half of this rule was unmeetable and is retired.** An entry here averages ~5.6KB, because the house style is to explain the defect class rather than name the change — which is the most valuable thing in this repo and not something to trade away for a byte count. Fifteen entries is ~84KB; obeying 20KB would have meant keeping **three**. So the count rule stands, and the size rule becomes a **ratchet**: the file may shrink, never grow. If the founder wants a hard byte ceiling instead, that is a call about house style, not about this file.

Archive: [2026-06 → 2026-07-20](docs/archive/log/LOG-2026-06_to_2026-07-20.md) · [2026-07-20 tail](docs/archive/log/LOG-2026-07-20_tail.md) (incl. Accelerator sprint kit rotated 2026-07-22) · [2026-07-20 → 2026-07-29 (`.179` and earlier)](docs/archive/log/LOG-2026-07-20_to_2026-07-29.md) · [2026-07-29 → 2026-07-30 (`.180`–`.199`)](docs/archive/log/LOG-2026-07-29_to_2026-07-30.md) (both rotated 2026-07-30) · [2026-07-30 → 2026-07-31 (`.200`–`.213`)](docs/archive/log/LOG-2026-07-30_to_2026-07-31.md) (rotated 2026-08-02) · [`.247` for `.263`](docs/archive/log/LOG-hero-audit-rotate-2026-08-03.md) · [`.279`](docs/archive/log/LOG-rotate-279.md) · [`.280`](docs/archive/log/LOG-rotate-280.md) · [`.281` for `.296`](docs/archive/log/LOG-rotate-296.md) · [`.282` for `.297`](docs/archive/log/LOG-rotate-297.md) · [`.283` for `.298`](docs/archive/log/LOG-rotate-298.md) · [`.284` for `.299`](docs/archive/log/LOG-rotate-299.md) · [`.285` for `.300`](docs/archive/log/LOG-rotate-300.md) · [`.286` for `.301`](docs/archive/log/LOG-rotate-301.md) · [`.287` for `.302`](docs/archive/log/LOG-rotate-302.md) · [`.288` for `.303`](docs/archive/log/LOG-rotate-303.md) · [`.289` for `.304`](docs/archive/log/LOG-rotate-304.md) · [`.290` for `.305`](docs/archive/log/LOG-rotate-305.md) · [`.291` for `.306`](docs/archive/log/LOG-rotate-306.md) · [`.292` for `.307`](docs/archive/log/LOG-rotate-307.md) · [`.293` for `.308`](docs/archive/log/LOG-rotate-308.md) · [`.294` for `.309`](docs/archive/log/LOG-rotate-309.md) · [`.295` for `.310`](docs/archive/log/LOG-rotate-310.md) · [`.296` for `.311`](docs/archive/log/LOG-rotate-311.md) · [`.297` for `.312`](docs/archive/log/LOG-rotate-312.md) · [`.298` for `.313`](docs/archive/log/LOG-rotate-313.md) · [`.299` for `.314`](docs/archive/log/LOG-rotate-314.md) · [`.300` for `.315`](docs/archive/log/LOG-rotate-315.md). · [`.301` for `.316`](docs/archive/log/LOG-rotate-316.md). · [`.302` for `.317`](docs/archive/log/LOG-rotate-317.md). · [`.303` for `.318`](docs/archive/log/LOG-rotate-318.md). · [`.304` for `.319`](docs/archive/log/LOG-rotate-319.md). · [`.305` for `.320`](docs/archive/log/LOG-rotate-320.md). · [`.306` for `.321`](docs/archive/log/LOG-rotate-321.md). · [`.307` for `.322`](docs/archive/log/LOG-rotate-322.md). · [`.308` for `.323`](docs/archive/log/LOG-rotate-323.md). · [`.309` for `.324`](docs/archive/log/LOG-rotate-324.md). · [`.310` for `.325`](docs/archive/log/LOG-rotate-325.md). · [`.311` for `.326`](docs/archive/log/LOG-rotate-326.md). · [`.312` for `.327`](docs/archive/log/LOG-rotate-327.md). · [`.313` for `.328`](docs/archive/log/LOG-rotate-328.md). · [`.314` for `.329`](docs/archive/log/LOG-rotate-329.md). · [`.315` for `.330`](docs/archive/log/LOG-rotate-330.md). · [`.316` for `.331`](docs/archive/log/LOG-rotate-331.md). · [`.317` for `.332`](docs/archive/log/LOG-rotate-332.md). · [`.318` for `.333`](docs/archive/log/LOG-rotate-333.md). · [`.319` for `.334`](docs/archive/log/LOG-rotate-334.md). · [`.320` for `.335`](docs/archive/log/LOG-rotate-335.md). · [`.321` for `.336`](docs/archive/log/LOG-rotate-336.md). · [`.322` for `.337`](docs/archive/log/LOG-rotate-337.md). · [`.323` for `.338`](docs/archive/log/LOG-rotate-338.md). · [`.324` for `.339`](docs/archive/log/LOG-rotate-339.md). · [`.325` for `.340`](docs/archive/log/LOG-rotate-340.md). · [`.326` for `.341`](docs/archive/log/LOG-rotate-341.md). · [`.327` for `.342`](docs/archive/log/LOG-rotate-342.md). · [`.328` for `.343`](docs/archive/log/LOG-rotate-343.md). · [`.329` for `.344`](docs/archive/log/LOG-rotate-344.md). · [`.330` for `.345`](docs/archive/log/LOG-rotate-345.md). · [`.331` for `.346`](docs/archive/log/LOG-rotate-346.md). · [`.332` for `.347`](docs/archive/log/LOG-rotate-347.md). · [`.333` for `.348`](docs/archive/log/LOG-rotate-348.md). · [`.334` for `.349`](docs/archive/log/LOG-rotate-349.md). · [`.335` for `.350`](docs/archive/log/LOG-rotate-350.md). · [`.336` for `.351`](docs/archive/log/LOG-rotate-351.md). · [`.337` for `.352`](docs/archive/log/LOG-rotate-352.md). · [`.338` for `.353`](docs/archive/log/LOG-rotate-353.md). · [`.339` for `.354`](docs/archive/log/LOG-rotate-354.md). · [`.340` for `.355`](docs/archive/log/LOG-rotate-355.md). · [`.341` for `.356`](docs/archive/log/LOG-rotate-356.md). · [`.342` for `.357`](docs/archive/log/LOG-rotate-357.md). · [`.343` for `.358`](docs/archive/log/LOG-rotate-358.md). · [`.344` for `.359`](docs/archive/log/LOG-rotate-359.md). · [`.345` for `.360`](docs/archive/log/LOG-rotate-360.md). · [`.346` for `.361`](docs/archive/log/LOG-rotate-361.md). · [`.347` for `.362`](docs/archive/log/LOG-rotate-362.md). · [`.348` for `.363`](docs/archive/log/LOG-rotate-363.md). · [`.349` for `.364`](docs/archive/log/LOG-rotate-364.md). · [`.350` for `.365`](docs/archive/log/LOG-rotate-365.md). · [`.351` for `.366`](docs/archive/log/LOG-rotate-366.md). · [`.352` for `.367`](docs/archive/log/LOG-rotate-367.md). · [`.353` for `.368`](docs/archive/log/LOG-rotate-368.md). · [`.354` for `.369`](docs/archive/log/LOG-rotate-369.md). · [`.355` for `.370`](docs/archive/log/LOG-rotate-370.md). · [`.356` for `.371`](docs/archive/log/LOG-rotate-371.md). · [`.357` for `.372`](docs/archive/log/LOG-rotate-372.md). · [`.358` for `.373`](docs/archive/log/LOG-rotate-373.md). · [`.359` for `.374`](docs/archive/log/LOG-rotate-374.md). · [`.360` for `.375`](docs/archive/log/LOG-rotate-375.md). · [`.361` for `.376`](docs/archive/log/LOG-rotate-376.md). · [`.362` for `.377`](docs/archive/log/LOG-rotate-377.md). · [`.363` for `.378`](docs/archive/log/LOG-rotate-378.md). · [`.364` for `.379`](docs/archive/log/LOG-rotate-379.md). · [`.365` for `.380`](docs/archive/log/LOG-rotate-380.md). · [`.366` for `.381`](docs/archive/log/LOG-rotate-381.md). · [`.367` for `.382`](docs/archive/log/LOG-rotate-382.md). · [`.368` for `.383`](docs/archive/log/LOG-rotate-383.md). · [`.369` for `.384`](docs/archive/log/LOG-rotate-384.md). · [`.370` for `.385`](docs/archive/log/LOG-rotate-385.md). · [`.371` for `.386`](docs/archive/log/LOG-rotate-386.md). · [`.372` for `.387`](docs/archive/log/LOG-rotate-387.md). · [`.373` for `.388`](docs/archive/log/LOG-rotate-388.md). · [`.374` for `.389`](docs/archive/log/LOG-rotate-389.md). · [`.375` for `.390`](docs/archive/log/LOG-rotate-390.md). · [`.376` for `.391`](docs/archive/log/LOG-rotate-391.md). · [`.377` for `.392`](docs/archive/log/LOG-rotate-392.md). · [`.378` for `.393`](docs/archive/log/LOG-rotate-393.md). · [`.379` for `.394`](docs/archive/log/LOG-rotate-394.md). · [`.380` for `.395`](docs/archive/log/LOG-rotate-395.md). · [`.381` for `.396`](docs/archive/log/LOG-rotate-396.md). · [`.382` for `.397`](docs/archive/log/LOG-rotate-397.md). · [`.383` for `.398`](docs/archive/log/LOG-rotate-398.md). · [`.384` for `.399`](docs/archive/log/LOG-rotate-399.md). · [`.385` for `.400`](docs/archive/log/LOG-rotate-400.md). · [`.386` for `.401`](docs/archive/log/LOG-rotate-401.md). · [`.387` for `.402`](docs/archive/log/LOG-rotate-402.md). · [`.388` for `.403`](docs/archive/log/LOG-rotate-403.md). · [`.389` for `.404`](docs/archive/log/LOG-rotate-404.md). · [`.390` for `.405`](docs/archive/log/LOG-rotate-405.md). · [`.391` for `.406`](docs/archive/log/LOG-rotate-406.md). · [`.392` for `.407`](docs/archive/log/LOG-rotate-407.md). · [`.393` for `.408`](docs/archive/log/LOG-rotate-408.md). · [`.394` for `.409`](docs/archive/log/LOG-rotate-409.md). · [`.395` for `.410`](docs/archive/log/LOG-rotate-410.md). · [`.396` for `.411`](docs/archive/log/LOG-rotate-411.md). · [`.397` for `.412`](docs/archive/log/LOG-rotate-412.md). · [`.398` for `.413`](docs/archive/log/LOG-rotate-413.md). · [`.399` for `.414`](docs/archive/log/LOG-rotate-414.md). · [`.400` for `.415`](docs/archive/log/LOG-rotate-415.md). · [`.401` for `.416`](docs/archive/log/LOG-rotate-416.md). · [`.402` for `.417`](docs/archive/log/LOG-rotate-417.md). · [`.403` for `.418`](docs/archive/log/LOG-rotate-418.md). · [`.404` for `.419`](docs/archive/log/LOG-rotate-419.md). · [`.405` for `.420`](docs/archive/log/LOG-rotate-420.md). · [`.406` for `.421`](docs/archive/log/LOG-rotate-421.md). · [`.407` for `.422`](docs/archive/log/LOG-rotate-422.md). · [`.408` for `.423`](docs/archive/log/LOG-rotate-423.md). · [`.409` for `.424`](docs/archive/log/LOG-rotate-424.md). · [`.410` for `.425`](docs/archive/log/LOG-rotate-425.md). · [`.411` for `.426`](docs/archive/log/LOG-rotate-426.md). · [`.412` for `.427`](docs/archive/log/LOG-rotate-427.md). · [`.413` for `.428`](docs/archive/log/LOG-rotate-428.md). · [`.414` for `.429`](docs/archive/log/LOG-rotate-429.md). · [`.415` for `.430`](docs/archive/log/LOG-rotate-430.md). · [`.416` for `.431`](docs/archive/log/LOG-rotate-431.md). · [`.417` for `.432`](docs/archive/log/LOG-rotate-432.md). · [`.418` for `.433`](docs/archive/log/LOG-rotate-433.md). · [`.419` for `.434`](docs/archive/log/LOG-rotate-434.md). · [`.420` for `.435`](docs/archive/log/LOG-rotate-435.md). · [`.421` for `.436`](docs/archive/log/LOG-rotate-436.md). · [`.422` for `.437`](docs/archive/log/LOG-rotate-437.md). · [`.423` for `.438`](docs/archive/log/LOG-rotate-438.md). · [`.424` for `.439`](docs/archive/log/LOG-rotate-439.md). · [`.425` for `.440`](docs/archive/log/LOG-rotate-440.md). · [`.426` for `.441`](docs/archive/log/LOG-rotate-441.md). · [`.427` for `.442`](docs/archive/log/LOG-rotate-442.md). · [`.428` for `.443`](docs/archive/log/LOG-rotate-443.md). · [`.429` for `.444`](docs/archive/log/LOG-rotate-444.md). · [`.430` for `.445`](docs/archive/log/LOG-rotate-445.md). · [`.431` for `.446`](docs/archive/log/LOG-rotate-446.md). · [`.432` for `.447`](docs/archive/log/LOG-rotate-447.md). · [`.433` for `.448`](docs/archive/log/LOG-rotate-448.md). · [`.434` for `.449`](docs/archive/log/LOG-rotate-449.md). · [`.435` for `.450`](docs/archive/log/LOG-rotate-450.md). · [`.436` for `.451`](docs/archive/log/LOG-rotate-451.md). · [`.437` for `.452`](docs/archive/log/LOG-rotate-452.md). · [`.438` for `.453`](docs/archive/log/LOG-rotate-453.md). · [`.439` for `.454`](docs/archive/log/LOG-rotate-454.md). · [`.440` for `.455`](docs/archive/log/LOG-rotate-455.md). · [`.441` for `.456`](docs/archive/log/LOG-rotate-456.md). · [`.442` for `.457`](docs/archive/log/LOG-rotate-457.md). · [`.443` for `.458`](docs/archive/log/LOG-rotate-458.md). · [`.444` for `.459`](docs/archive/log/LOG-rotate-459.md). · [`.445` for `.460`](docs/archive/log/LOG-rotate-460.md). · [`.446` for `.461`](docs/archive/log/LOG-rotate-461.md). · [`.447` for `.462`](docs/archive/log/LOG-rotate-462.md). · [`.448` for `.463`](docs/archive/log/LOG-rotate-463.md). · [`.449` for `.464`](docs/archive/log/LOG-rotate-464.md). · [`.450` for `.465`](docs/archive/log/LOG-rotate-465.md). · [`.451` for `.466`](docs/archive/log/LOG-rotate-466.md). · [`.452` for `.467`](docs/archive/log/LOG-rotate-467.md). · [`.453` for `.468`](docs/archive/log/LOG-rotate-468.md). · [`.454` for `.469`](docs/archive/log/LOG-rotate-469.md). · [`.455` for `.470`](docs/archive/log/LOG-rotate-470.md). · [`.456` for `.471`](docs/archive/log/LOG-rotate-471.md). · [`.457` for `.472`](docs/archive/log/LOG-rotate-472.md). · [`.458` for `.473`](docs/archive/log/LOG-rotate-473.md). · [`.459` for `.474`](docs/archive/log/LOG-rotate-474.md). · [`.460` for `.475`](docs/archive/log/LOG-rotate-475.md). · [`.461` for `.476`](docs/archive/log/LOG-rotate-476.md). · [`.462` for `.477`](docs/archive/log/LOG-rotate-477.md). · [`.463` for `.478`](docs/archive/log/LOG-rotate-478.md). · [`.464` for `.479`](docs/archive/log/LOG-rotate-479.md). · [`.465` for `.480`](docs/archive/log/LOG-rotate-480.md). · [`.466` for `.481`](docs/archive/log/LOG-rotate-481.md). · [`.467` for `.482`](docs/archive/log/LOG-rotate-482.md). · [`.468` for `.483`](docs/archive/log/LOG-rotate-483.md). · [`.469` for `.484`](docs/archive/log/LOG-rotate-484.md). · [`.470` for `.485`](docs/archive/log/LOG-rotate-485.md). · [`.471` for `.486`](docs/archive/log/LOG-rotate-486.md).

---

## 2026-08-05 — Rest final Skip fill + hide presets (`.486`)

Extends outdoor rest final-seconds craft: in the last 10s Skip becomes a **filled accent** control (label stays "Skip" for `/^skip$/i` e2e), and phone preset chips hide so one bright thumb target remains. Pure `shouldShowRestPresets` gates the strip.

Mutants: show presets at 5s remaining → chrome fights Skip; Skip stays outline at 5s → outdoor miss.


## 2026-08-05 — Rest final-seconds outdoor glance (`.485`)

Rest dock clock stays ink-on-ink until the last 10s, then switches to `accent-400` so outdoor athletes get an “about to go” signal without reading digits. Pure `isRestFinalSeconds` / `REST_FINAL_SECONDS` shared by UI and tests; `data-rest-final` for e2e if needed.

Mutants: threshold 0 → never accent; threshold 90 → whole rest looks urgent.


## 2026-08-05 — Locale pack interpolation keys (`.484`)

Machine-translated `src/i18n/packs/*.json` had "translated" `{{placeholders}}` (`{{peso}}`, `{{単位}}`) while call sites pass English keys (`weight`, `unit`). Runtime left literals on Active plate calc, rest copy, History volume, and more. Rewrote pack placeholders to match English `*Locales.ts`; guard `i18nPackPlaceholders.test.ts` fails on the next drift.

Mutants: es `calcPlateTotal` with `{{peso}}` again → test red; leave translated prose, only fix keys.


## 2026-08-05 — Log console set ordinal interpolation (`.483`)

`activeSetOf` locale is `Set {{current}} of {{total}}`, but LogConsole passed `n: setNumber`. Once the pack loaded, the ordinal showed the literal `{{current}}` (defaultValue only applies when the key is missing). Pure `activeSetOfParams` + source guard so the keys cannot drift again.

Mutants: pass `n:` again → guard red; change en template to `{{n}}` without console → guard red.


## 2026-08-05 — Outdoor log console set-kind collapse (`.482`)

Autoplan A1: four always-visible 44px set-kind chips sat above reps/weight and stole thumb height on the outdoor work-set path. Console now defaults to **Work + Kind** expand; full Warmup/Failure/Drop strip only when expanded or a non-work kind is selected. Pure helpers `visibleSetKinds` / `shouldShowSetKindExpand` in `loggerSpeed`. Log set marked `primary-action` + test id. A11y e2e expands kinds before Warmup assert.

Mutants: force expanded always → outdoor density regresses; drop expand control → non-work kinds unreachable from collapsed Work.


## 2026-08-04 — Form media parity + rest outdoor meter (`.481`)

One media policy for Library detail and Form guide: shared `usePrefersReducedMotion` + `formGuideMedia` modes — autoplay muted loops only when motion is allowed; reduced-motion gets the poster still. Rest dock phone progress meter thickens `h-1.5` → `h-2.5` under the outdoor clock so remaining rest is glanceable without reading digits. Desktop rest row stays thin.

Mutants: library video + reduced-motion true → still poster; rest mobile meter h-1.5 → outdoor glance regresses.


## 2026-08-04 — Form guide loop autoplay mid-set (`.480`)

Form Index loops finally teach without a play tap. `FormGuideSheet` autoplays muted looping video when a pack has `mediaType: video`; `prefers-reduced-motion` falls back to the poster still via pure helpers in `formGuideMedia.ts`. Media height ratchet max-h-64 → max-h-80 for outdoor mid-set glance. Connects `.476`–`.479` packs to Train excellence.

Mutants: reduced-motion true + video pack → still poster; remove autoPlay → mid-set tap required again.


## 2026-08-04 — Landmine-press loop pilot (`.479`)

Form Index optional landmine pilot: I2V from half-kneeling lockout still. **landmine-press** PASS (floor pivot stays planted; free end arcs lower→press; head in frame) → wired `FORM_PACK_VIDEO_IDS`. **landmine-row** / **landmine-squat** remain still-only. Loop sheet: `media/form-kit/prompts/loop-landmine-press.md`.

Mutants: drop landmine-press from VIDEO_IDS → still poster; wire row/squat without QA → risk pivot/bar glitch.


## 2026-08-04 — Bench loop + pull-ups still-only (`.478`)

Form Index close-out wave 3: **bench-press** I2V PASS (lower to chest / press; bar stays above torso, not through body) → wired `FORM_PACK_VIDEO_IDS`. **pull-ups** I2V FAIL (head crops into the bar at the top of the pull) → keep dead-hang still only. Loop sheets: `loop-bench-press.md`, `loop-pull-ups.md`. Remaining still-only heroes: OHP, pull-ups, landmines.

Mutants: drop bench from VIDEO_IDS → still poster; wire pull-ups fail mp4 → head-crop teaching returns.


## 2026-08-04 — Empty-bar front-squat / RDL / row loops (`.477`)

Form Index close-out wave 2: I2V from cleaned empty-bar stills. **Front squat** (front rack held stand↔depth), **Romanian deadlift** (hinge↔stand, bar anterior), and **barbell row** (path outside body) all PASS frame QA → wired `FORM_PACK_VIDEO_IDS`. Loop director sheets under `media/form-kit/prompts/loop-{front-squat,romanian-deadlift,barbell-row}.md`. OHP remains still-only.

Mutants: drop any of the three from VIDEO_IDS → still-only poster; re-wire OHP fail mp4 → behind-neck teaching.


## 2026-08-04 — Empty-bar deadlift loop (`.476`)

Form Index close-out: I2V from cleaned empty-bar stills. **Deadlift** loop PASS (bar stays anterior to legs; no plates/collars; head in frame) → wired `FORM_PACK_VIDEO_IDS`. **Overhead press** FAIL ×2 (mid-rep bar path behind head / onto traps) → keep still-only. Loop director sheets under `media/form-kit/prompts/loop-{deadlift,overhead-press}.md`.

Mutants: re-wire OHP from fail mp4 → behind-neck teaching returns; drop deadlift from VIDEO_IDS → still-only path.


## 2026-08-04 — RDL bar-axis fix (`.475`)

Romanian deadlift still had the bar reading through the thighs / wrong grip axis. Regenerated mid-hinge with bar clearly **in front of** the legs, same left–right empty-bar axis as the deadlift still. Form Director + still sheet lock bar-anterior and reject through-body / good-morning.

Mutants: empty-bar RDL with bar spanning behind thighs → FAIL; landmine-angled RDL → FAIL.


## 2026-08-04 — Empty-bar collar fix for Form Index (`.474`)

Regenerated overhead-press, front-squat, deadlift, barbell-row, and RDL stills with **empty Olympic bars** (no plates, no spring clips). The previous OHP still showed a multi-prong collar hub that read as three clips from the side. Form Director now hard-rejects collar hardware; empty bar is the teaching default. Demoted OHP and deadlift loops until I2V from clean stills.

Mutants: re-optimize inbox with stale plated PNGs after clean JPGs → old collars return (deleted stale PNGs).


## 2026-08-04 — Landmine family + Form Index stills (`.473`)

Eleven landmine movements in the extended catalog (press, row, squat, RDL, Meadows row, single-arm press, rotation, thruster, reverse lunge, hack squat, anti-rotation press) with structured guides, alternatives, and pattern routing by movement (not bare "landmine" → push). Eyes-on Form Director stills for landmine-press, landmine-row, landmine-squat (still-only).

Mutants: landmine-rotation as push (old bare match) → core; landmine-single-arm-press cues "against rotation" → must stay push via id/name match.

## 2026-08-04 — Form Director athlete unify + bar loops (`.472`)

Athlete-a identity stills for lunges, kettlebell-swing, push-ups, deadlift. Careful empty/light-bar loops: thruster, overhead-press, deadlift. VIDEO_IDS = 11 pilots; still-only for front-squat, RDL, bench, row, pull-ups.

Mutants: thruster loop invents plates over face → demote; deadlift bar through body → demote.

