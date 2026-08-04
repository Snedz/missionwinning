# Mission Winning — Development Log

Chronological record of shipped work. Newest first.

**Rotation rule:** keep **≤15 entries** here, and never let the file grow. When over, move the oldest entries (whole `##` sections, order preserved) to `docs/archive/log/` and list the file in [docs/archive/INDEX.md](docs/archive/INDEX.md). Enforced by `src/lib/logBudget.test.ts` — until `.242` it was enforced by nothing, and the file had reached **27 entries / 127KB**.

> **The `≤20KB` half of this rule was unmeetable and is retired.** An entry here averages ~5.6KB, because the house style is to explain the defect class rather than name the change — which is the most valuable thing in this repo and not something to trade away for a byte count. Fifteen entries is ~84KB; obeying 20KB would have meant keeping **three**. So the count rule stands, and the size rule becomes a **ratchet**: the file may shrink, never grow. If the founder wants a hard byte ceiling instead, that is a call about house style, not about this file.

Archive: [2026-06 → 2026-07-20](docs/archive/log/LOG-2026-06_to_2026-07-20.md) · [2026-07-20 tail](docs/archive/log/LOG-2026-07-20_tail.md) (incl. Accelerator sprint kit rotated 2026-07-22) · [2026-07-20 → 2026-07-29 (`.179` and earlier)](docs/archive/log/LOG-2026-07-20_to_2026-07-29.md) · [2026-07-29 → 2026-07-30 (`.180`–`.199`)](docs/archive/log/LOG-2026-07-29_to_2026-07-30.md) (both rotated 2026-07-30) · [2026-07-30 → 2026-07-31 (`.200`–`.213`)](docs/archive/log/LOG-2026-07-30_to_2026-07-31.md) (rotated 2026-08-02) · [`.247` for `.263`](docs/archive/log/LOG-hero-audit-rotate-2026-08-03.md) · [`.279`](docs/archive/log/LOG-rotate-279.md) · [`.280`](docs/archive/log/LOG-rotate-280.md) · [`.281` for `.296`](docs/archive/log/LOG-rotate-296.md) · [`.282` for `.297`](docs/archive/log/LOG-rotate-297.md) · [`.283` for `.298`](docs/archive/log/LOG-rotate-298.md) · [`.284` for `.299`](docs/archive/log/LOG-rotate-299.md) · [`.285` for `.300`](docs/archive/log/LOG-rotate-300.md) · [`.286` for `.301`](docs/archive/log/LOG-rotate-301.md) · [`.287` for `.302`](docs/archive/log/LOG-rotate-302.md) · [`.288` for `.303`](docs/archive/log/LOG-rotate-303.md) · [`.289` for `.304`](docs/archive/log/LOG-rotate-304.md) · [`.290` for `.305`](docs/archive/log/LOG-rotate-305.md) · [`.291` for `.306`](docs/archive/log/LOG-rotate-306.md) · [`.292` for `.307`](docs/archive/log/LOG-rotate-307.md) · [`.293` for `.308`](docs/archive/log/LOG-rotate-308.md) · [`.294` for `.309`](docs/archive/log/LOG-rotate-309.md) · [`.295` for `.310`](docs/archive/log/LOG-rotate-310.md) · [`.296` for `.311`](docs/archive/log/LOG-rotate-311.md) · [`.297` for `.312`](docs/archive/log/LOG-rotate-312.md) · [`.298` for `.313`](docs/archive/log/LOG-rotate-313.md) · [`.299` for `.314`](docs/archive/log/LOG-rotate-314.md) · [`.300` for `.315`](docs/archive/log/LOG-rotate-315.md). · [`.301` for `.316`](docs/archive/log/LOG-rotate-316.md). · [`.302` for `.317`](docs/archive/log/LOG-rotate-317.md). · [`.303` for `.318`](docs/archive/log/LOG-rotate-318.md). · [`.304` for `.319`](docs/archive/log/LOG-rotate-319.md). · [`.305` for `.320`](docs/archive/log/LOG-rotate-320.md). · [`.306` for `.321`](docs/archive/log/LOG-rotate-321.md). · [`.307` for `.322`](docs/archive/log/LOG-rotate-322.md). · [`.308` for `.323`](docs/archive/log/LOG-rotate-323.md). · [`.309` for `.324`](docs/archive/log/LOG-rotate-324.md). · [`.310` for `.325`](docs/archive/log/LOG-rotate-325.md). · [`.311` for `.326`](docs/archive/log/LOG-rotate-326.md). · [`.312` for `.327`](docs/archive/log/LOG-rotate-327.md). · [`.313` for `.328`](docs/archive/log/LOG-rotate-328.md). · [`.314` for `.329`](docs/archive/log/LOG-rotate-329.md). · [`.315` for `.330`](docs/archive/log/LOG-rotate-330.md). · [`.316` for `.331`](docs/archive/log/LOG-rotate-331.md). · [`.317` for `.332`](docs/archive/log/LOG-rotate-332.md). · [`.318` for `.333`](docs/archive/log/LOG-rotate-333.md). · [`.319` for `.334`](docs/archive/log/LOG-rotate-334.md). · [`.320` for `.335`](docs/archive/log/LOG-rotate-335.md). · [`.321` for `.336`](docs/archive/log/LOG-rotate-336.md). · [`.322` for `.337`](docs/archive/log/LOG-rotate-337.md). · [`.323` for `.338`](docs/archive/log/LOG-rotate-338.md). · [`.324` for `.339`](docs/archive/log/LOG-rotate-339.md). · [`.325` for `.340`](docs/archive/log/LOG-rotate-340.md). · [`.326` for `.341`](docs/archive/log/LOG-rotate-341.md). · [`.327` for `.342`](docs/archive/log/LOG-rotate-342.md). · [`.328` for `.343`](docs/archive/log/LOG-rotate-343.md). · [`.329` for `.344`](docs/archive/log/LOG-rotate-344.md). · [`.330` for `.345`](docs/archive/log/LOG-rotate-345.md). · [`.331` for `.346`](docs/archive/log/LOG-rotate-346.md). · [`.332` for `.347`](docs/archive/log/LOG-rotate-347.md). · [`.333` for `.348`](docs/archive/log/LOG-rotate-348.md). · [`.334` for `.349`](docs/archive/log/LOG-rotate-349.md). · [`.335` for `.350`](docs/archive/log/LOG-rotate-350.md). · [`.336` for `.351`](docs/archive/log/LOG-rotate-351.md). · [`.337` for `.352`](docs/archive/log/LOG-rotate-352.md). · [`.338` for `.353`](docs/archive/log/LOG-rotate-353.md). · [`.339` for `.354`](docs/archive/log/LOG-rotate-354.md). · [`.340` for `.355`](docs/archive/log/LOG-rotate-355.md). · [`.341` for `.356`](docs/archive/log/LOG-rotate-356.md). · [`.342` for `.357`](docs/archive/log/LOG-rotate-357.md). · [`.343` for `.358`](docs/archive/log/LOG-rotate-358.md). · [`.344` for `.359`](docs/archive/log/LOG-rotate-359.md). · [`.345` for `.360`](docs/archive/log/LOG-rotate-360.md). · [`.346` for `.361`](docs/archive/log/LOG-rotate-361.md). · [`.347` for `.362`](docs/archive/log/LOG-rotate-362.md). · [`.348` for `.363`](docs/archive/log/LOG-rotate-363.md). · [`.349` for `.364`](docs/archive/log/LOG-rotate-364.md). · [`.350` for `.365`](docs/archive/log/LOG-rotate-365.md). · [`.351` for `.366`](docs/archive/log/LOG-rotate-366.md). · [`.352` for `.367`](docs/archive/log/LOG-rotate-367.md). · [`.353` for `.368`](docs/archive/log/LOG-rotate-368.md). · [`.354` for `.369`](docs/archive/log/LOG-rotate-369.md). · [`.355` for `.370`](docs/archive/log/LOG-rotate-370.md). · [`.356` for `.371`](docs/archive/log/LOG-rotate-371.md). · [`.357` for `.372`](docs/archive/log/LOG-rotate-372.md). · [`.358` for `.373`](docs/archive/log/LOG-rotate-373.md). · [`.359` for `.374`](docs/archive/log/LOG-rotate-374.md). · [`.360` for `.375`](docs/archive/log/LOG-rotate-375.md). · [`.361` for `.376`](docs/archive/log/LOG-rotate-376.md). · [`.362` for `.377`](docs/archive/log/LOG-rotate-377.md). · [`.363` for `.378`](docs/archive/log/LOG-rotate-378.md). · [`.364` for `.379`](docs/archive/log/LOG-rotate-379.md). · [`.365` for `.380`](docs/archive/log/LOG-rotate-380.md). · [`.366` for `.381`](docs/archive/log/LOG-rotate-381.md). · [`.367` for `.382`](docs/archive/log/LOG-rotate-382.md). · [`.368` for `.383`](docs/archive/log/LOG-rotate-383.md). · [`.369` for `.384`](docs/archive/log/LOG-rotate-384.md). · [`.370` for `.385`](docs/archive/log/LOG-rotate-385.md). · [`.371` for `.386`](docs/archive/log/LOG-rotate-386.md). · [`.372` for `.387`](docs/archive/log/LOG-rotate-387.md). · [`.373` for `.388`](docs/archive/log/LOG-rotate-388.md). · [`.374` for `.389`](docs/archive/log/LOG-rotate-389.md). · [`.375` for `.390`](docs/archive/log/LOG-rotate-390.md). · [`.376` for `.391`](docs/archive/log/LOG-rotate-391.md). · [`.377` for `.392`](docs/archive/log/LOG-rotate-392.md). · [`.378` for `.393`](docs/archive/log/LOG-rotate-393.md). · [`.379` for `.394`](docs/archive/log/LOG-rotate-394.md). · [`.380` for `.395`](docs/archive/log/LOG-rotate-395.md). · [`.381` for `.396`](docs/archive/log/LOG-rotate-396.md). · [`.382` for `.397`](docs/archive/log/LOG-rotate-397.md). · [`.383` for `.398`](docs/archive/log/LOG-rotate-398.md). · [`.384` for `.399`](docs/archive/log/LOG-rotate-399.md). · [`.385` for `.400`](docs/archive/log/LOG-rotate-400.md). · [`.386` for `.401`](docs/archive/log/LOG-rotate-401.md). · [`.387` for `.402`](docs/archive/log/LOG-rotate-402.md). · [`.388` for `.403`](docs/archive/log/LOG-rotate-403.md). · [`.389` for `.404`](docs/archive/log/LOG-rotate-404.md). · [`.390` for `.405`](docs/archive/log/LOG-rotate-405.md). · [`.391` for `.406`](docs/archive/log/LOG-rotate-406.md). · [`.392` for `.407`](docs/archive/log/LOG-rotate-407.md). · [`.393` for `.408`](docs/archive/log/LOG-rotate-408.md). · [`.394` for `.409`](docs/archive/log/LOG-rotate-409.md). · [`.395` for `.410`](docs/archive/log/LOG-rotate-410.md). · [`.396` for `.411`](docs/archive/log/LOG-rotate-411.md). · [`.397` for `.412`](docs/archive/log/LOG-rotate-412.md). · [`.398` for `.413`](docs/archive/log/LOG-rotate-413.md). · [`.399` for `.414`](docs/archive/log/LOG-rotate-414.md). · [`.400` for `.415`](docs/archive/log/LOG-rotate-415.md). · [`.401` for `.416`](docs/archive/log/LOG-rotate-416.md). · [`.402` for `.417`](docs/archive/log/LOG-rotate-417.md). · [`.403` for `.418`](docs/archive/log/LOG-rotate-418.md). · [`.404` for `.419`](docs/archive/log/LOG-rotate-419.md). · [`.405` for `.420`](docs/archive/log/LOG-rotate-420.md). · [`.406` for `.421`](docs/archive/log/LOG-rotate-421.md). · [`.407` for `.422`](docs/archive/log/LOG-rotate-422.md). · [`.408` for `.423`](docs/archive/log/LOG-rotate-423.md). · [`.409` for `.424`](docs/archive/log/LOG-rotate-424.md). · [`.410` for `.425`](docs/archive/log/LOG-rotate-425.md). · [`.411` for `.426`](docs/archive/log/LOG-rotate-426.md). · [`.412` for `.427`](docs/archive/log/LOG-rotate-427.md). · [`.413` for `.428`](docs/archive/log/LOG-rotate-428.md). · [`.414` for `.429`](docs/archive/log/LOG-rotate-429.md). · [`.415` for `.430`](docs/archive/log/LOG-rotate-430.md). · [`.416` for `.431`](docs/archive/log/LOG-rotate-431.md). · [`.417` for `.432`](docs/archive/log/LOG-rotate-432.md). · [`.418` for `.433`](docs/archive/log/LOG-rotate-433.md). · [`.419` for `.434`](docs/archive/log/LOG-rotate-434.md). · [`.420` for `.435`](docs/archive/log/LOG-rotate-435.md). · [`.421` for `.436`](docs/archive/log/LOG-rotate-436.md). · [`.422` for `.437`](docs/archive/log/LOG-rotate-437.md). · [`.423` for `.438`](docs/archive/log/LOG-rotate-438.md). · [`.424` for `.439`](docs/archive/log/LOG-rotate-439.md). · [`.425` for `.440`](docs/archive/log/LOG-rotate-440.md). · [`.426` for `.441`](docs/archive/log/LOG-rotate-441.md). · [`.427` for `.442`](docs/archive/log/LOG-rotate-442.md). · [`.428` for `.443`](docs/archive/log/LOG-rotate-443.md). · [`.429` for `.444`](docs/archive/log/LOG-rotate-444.md). · [`.430` for `.445`](docs/archive/log/LOG-rotate-445.md). · [`.431` for `.446`](docs/archive/log/LOG-rotate-446.md). · [`.432` for `.447`](docs/archive/log/LOG-rotate-447.md). · [`.433` for `.448`](docs/archive/log/LOG-rotate-448.md). · [`.434` for `.449`](docs/archive/log/LOG-rotate-449.md). · [`.435` for `.450`](docs/archive/log/LOG-rotate-450.md). · [`.436` for `.451`](docs/archive/log/LOG-rotate-451.md). · [`.437` for `.452`](docs/archive/log/LOG-rotate-452.md). · [`.438` for `.453`](docs/archive/log/LOG-rotate-453.md). · [`.439` for `.454`](docs/archive/log/LOG-rotate-454.md). · [`.440` for `.455`](docs/archive/log/LOG-rotate-455.md). · [`.441` for `.456`](docs/archive/log/LOG-rotate-456.md). · [`.442` for `.457`](docs/archive/log/LOG-rotate-457.md). · [`.443` for `.458`](docs/archive/log/LOG-rotate-458.md). · [`.444` for `.459`](docs/archive/log/LOG-rotate-459.md). · [`.445` for `.460`](docs/archive/log/LOG-rotate-460.md). · [`.446` for `.461`](docs/archive/log/LOG-rotate-461.md). · [`.447` for `.462`](docs/archive/log/LOG-rotate-462.md). · [`.448` for `.463`](docs/archive/log/LOG-rotate-463.md). · [`.449` for `.464`](docs/archive/log/LOG-rotate-464.md). · [`.450` for `.465`](docs/archive/log/LOG-rotate-465.md). · [`.451` for `.466`](docs/archive/log/LOG-rotate-466.md). · [`.452` for `.467`](docs/archive/log/LOG-rotate-467.md). · [`.453` for `.468`](docs/archive/log/LOG-rotate-468.md). · [`.454` for `.469`](docs/archive/log/LOG-rotate-469.md). · [`.455` for `.470`](docs/archive/log/LOG-rotate-470.md).

---

## 2026-08-04 — Form Director OHP/row regen + plank/push loops (`.470`)

Eyes-on still regen: overhead-press (clean lockout, single bar) and barbell-row (mid-pull, head clear — was good-morning/head-in-plates). Directed loops for push-ups + plank. VIDEO_IDS = air-squat, glute-bridge, push-ups, plank.

Mutants: row still with bar on back → FAIL; re-wire all 16 old mp4s → glitch return.

## 2026-08-04 — Form Director hero regen + loop pilot (`.469`)

Eyes-on still regen: thruster (head clear of bar), front-squat, RDL (full headroom), pull-ups (athlete-a hang). Directed loop pilot for air-squat + glute-bridge only (`FORM_PACK_VIDEO_IDS` reopened selectively). More still/loop prompt sheets under form-kit.

Mutants: wire all old mp4s into VIDEO_IDS → glitch return; thruster still with head in plates → FAIL.

## 2026-08-04 — Form Director regen pass (`.468`)

Eyes-on Form Director regen: pattern-core (forearm plank), pattern-isolation (DB curl), glute-bridge (bodyweight), burpees + box-jump (full headroom). Prop kit sheets + athlete-a ref under `media/form-kit/refs/`. Loops stay demoted. Soft prompts still retired.

Mutants: re-wire isolation to old side-plank webp → FAIL log contradiction; empty VIDEO_IDS → still-only green.

## 2026-08-04 — Form Director quality reset (`.467`)

Demote glitchy Form Index media: empty `FORM_PACK_VIDEO_IDS` (still-only), drop cropped `burpees`/`box-jump` packs, demote wrong pattern-core/isolation rasters to SVG. Ship Seedance-class **Form Director** system (`media/form-kit/FORM_DIRECTOR.md` + templates + FAIL log). Soft two-line form prompts retired.

Mutants: re-add burpees to SIDE_IDS without still → product shows crop; wire video without QA → glitch loops return.

## 2026-08-04 — Form Index full loops + pattern stills (`.466`)

All 16 hero packs now have silent `side.mp4` loops. Seven pattern stills under `/form/pattern-{squat|hinge|push|pull|core|loco|isolation}/side.webp` become the long-tail Form Index default (beats stick SVG). `formPatternPath` prefers raster; legacy pattern SVG kept on disk.

Mutants: formPatternPath without raster set → svg; remove deadlift from VIDEO_IDS → still-only path.

## 2026-08-04 — Form Index loops + wave-2 stills (`.465`)

Eight pilot clinical side **loops** (`side.mp4` ~480p) wired via `FORM_PACK_VIDEO_IDS` with poster stills. Plus eight wave-2 still packs (deadlift, OHP, front-squat, lunges, burpees, glute-bridge, barbell-row, box-jump). Library resolves video → poster → SVG → pattern. ~4.5MB video total — free-tier safe.

Mutants: drop push-ups from VIDEO_IDS → still path; remove FORM_PACK_SIDE_IDS → SVG fallback.

## 2026-08-04 — Form Index pilot stills (`.464`)

Clinical side posters for 8 hero lifts under `public/form/{id}/side.webp` (air-squat, RDL, push-ups, pull-ups, thruster, KB swing, plank, bench). Resolve order: form pack → legacy SVG → pattern. Library cards show posters; MEDIA_SYSTEM + GROK Form Index prompts; optimize `form-*-side-frame`. CrossFit craft only — no CF IP. Free-tier Vercel host; not Supabase/YouTube primary.

Mutants: remove FORM_PACK_SIDE_IDS entry → falls back to SVG; formMedia unknown id → null.

## 2026-08-04 — Sprint A Grok Imagine stills (`.463`)

Agent-generated social + Scout assets via Imagine: kettlebell invite square (1:1), coach progressive-load story (9:16), Scout invite/celebrate re-inked to idle proportions. `media/inbox` → `npm run media:optimize-inbox` → `public/social` + `public/brand/mascot`. Manifest notes `Grok Imagine 2026-08-04`. Typography PNG sources left as legacy; product WebP is scene stills.

Mutants: n/a media-only — visual QA is the gate; form guides remain SVG.

## 2026-08-04 — Grok Imagine assemble pack (`.462`)

Paste-ready Sprint A prompts in `media/GROK_IMAGINE_PROMPTS.md`, inbox naming, MEDIA_SYSTEM + FLOW_PROMPTS links, `npm run media:grok-prompt <id>` prints brand+body and a grok.com/imagine deep link. Starts the offline Imagine → inbox → optimize loop without a product API.

Mutants: remove GROK_IMAGINE_PROMPTS link from MEDIA_SYSTEM → founder lost entry; print-grok-prompt unknown id → exit 1.

## 2026-08-04 — Library session studio multi-select (`.461`)

Craft-index Phase 5: pick exercises with ✓ on `/library` (max 12), sticky bar **Train selected** starts a freestyle session (or adds to active). Pure helpers in `librarySessionPick` — toggle, templates, session name.

Mutants: pick past max → list unchanged; templatesFromLibraryPick drops unknown ids; empty pick name → Library session.

## 2026-08-04 — Craft index CTA + coverage truth (`.460`)

Public exercise detail puts **Train this free** under the form diagram (one-click into the free logger). `/exercises` index: "Think like a coach" + pattern legend. `media/COVERAGE.md` regenerated (83 structured · pattern-backed long-tail is intentional). MEDIA_SYSTEM documents the craft index.

Mutants: remove Train this free block → no primary under diagram; coverage report stale numbers if not regenerated after guide expansion.

## 2026-08-04 — Structured form guides to 82 (`.459`)

+16 structured guides (carries, hollow/v-up, wall-ball, double-under, ring-row, …). Catalog structured teaching 66→82 with a coverage ratchet test. Every exercise still has guide-or-cues teachable content.

Mutants: drop STRUCTURED_GUIDE_FLOOR below count → still green but floor must not fall; remove hollow-hold entry → count 81 still ≥80, remove 3 entries → red.

## 2026-08-04 — Craft blurbs + expanded form guides (`.458`)

Index cards use `exerciseCraftBlurb` (first cue or pattern · muscles · gear). Fifteen more structured form guides (DB press, hammer curl, reverse lunge, scap pull-up, Cossack, WGS, …) bring structured coverage 51→66.

Mutants: cues-less deadlift blurb must still mention Hinge; drop dumbbell-press from EXTENDED_GUIDES → getFormGuide null.

## 2026-08-04 — Public craft-index exercise library (`.457`)

`/exercises` cards match the in-app craft index (number, pattern label, form-diagram marker, cues). Public detail puts form media first, then coach language / setup / execute. Related mesh prefers same movement pattern via `relatedExercisesByPattern`.

Mutants: relatedByPattern on deadlift with always-null pattern → falls back to muscle list still non-empty; drop pattern filter from public cards → visual regress (manual).

## 2026-08-04 — Hero form mid-phase motion (`.456`)

Sixteen hero form SVGs gain CSS-in-SVG mid-phase bob + cue pulse (`inject-form-motion.mjs`), gated on `prefers-reduced-motion: no-preference` so animation works under `<img src>` without a runtime player. `media:form-all` chains inject after regenerate. Unit guard pins the hero set.

Mutants: drop form-phase-mid from push-ups → motion test red; inject twice → style count still 1 (idempotent).

