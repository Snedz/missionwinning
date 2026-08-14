# Form Index QA failures

Log every rejected generation. Do not re-ship the same glitch.

| Date | Asset | Fail reason | Action |
|------|--------|-------------|--------|
| 2026-08-04 | `pattern-isolation/side.webp` (session `35.jpg`) | Wrong exercise (side plank); head buried / unreadable | Demoted from `FORM_PATTERN_RASTER_IDS` → SVG |
| 2026-08-04 | `pattern-core/side.webp` | Wrong exercise (DB curl, head cropped) | Demoted → SVG |
| 2026-08-04 | `burpees/side.webp` | Head clipped by frame edge; reads as push-up | Demoted from `FORM_PACK_SIDE_IDS` |
| 2026-08-04 | `box-jump/side.webp` | Head cropped; tight crop | Demoted from `FORM_PACK_SIDE_IDS` |
| 2026-08-04 | `glute-bridge/side.mp4` | I2V invents bar-through-body / bad physics | All loops demoted (`.467` quality reset) |
| 2026-08-04 | All `FORM_PACK_VIDEO_IDS` | Bulk I2V without still gate | Emptied until Form Director regen |

## Process notes

- Soft two-line prompts caused wrong patterns and crops.  
- Batch rename by generation order mis-mapped pattern assets.  
- Always vision-read before optimize/commit.

## PASS log (Form Director regen)

| Date | Asset | Notes |
|------|--------|--------|
| 2026-08-04 | `pattern-core/side.webp` | Forearm plank, full head/feet, athlete-a identity (.468) |
| 2026-08-04 | `pattern-isolation/side.webp` | Standing DB curl mid, full body (.468) |
| 2026-08-04 | `glute-bridge/side.webp` | Bodyweight top, no bar (.468) |
| 2026-08-04 | `burpees/side.webp` | High-plank phase, head in frame (.468) |
| 2026-08-04 | `box-jump/side.webp` | Landing on box, full headroom (.468) |
| 2026-08-04 | `refs/athlete-a-side` | Kit identity |
| 2026-08-04 | `refs/prop-*` | Barbell, KB, box, bench sheets |
| 2026-08-04 | `thruster/side.webp` | Front-rack squat bottom, head visible (.469) |
| 2026-08-04 | `front-squat/side.webp` | Head clear of bar (.469) |
| 2026-08-04 | `romanian-deadlift/side.webp` | Full headroom mid-hinge (.469) |
| 2026-08-04 | `pull-ups/side.webp` | Athlete-a hang setup (.469; chin-over hard for model) |
| 2026-08-04 | `air-squat/side.mp4` | Directed loop pilot from PASS still (.469) |
| 2026-08-04 | `glute-bridge/side.mp4` | Bodyweight-only I2V from PASS still (.469) |

| 2026-08-04 | `overhead-press/side.webp` | Clean lockout, head clear, single bar (.470) |
| 2026-08-04 | `barbell-row/side.webp` | Mid-pull, head clear of plates (.470) |
| 2026-08-04 | `push-ups/side.mp4` · `plank/side.mp4` | Directed loops from PASS stills (.470) |
| 2026-08-04 | `lunges` · `box-jump` · `burpees` · `kettlebell-swing` loops | Directed I2V from PASS stills (.471) |
| 2026-08-04 | athlete-a unify: lunges, KB, push-ups, deadlift stills | Identity lock (.472) |
| 2026-08-04 | thruster · OHP · deadlift loops | Empty/light-bar I2V pilots (.472) |
| 2026-08-04 | `overhead-press/side.webp` (pre-`.474`) | Multi-prong spring collar hub — reads as 3 clips from side | FAIL → empty-bar regen (.474) |
| 2026-08-04 | `front-squat` / `deadlift` / `barbell-row` plated collars | Invented clips/prongs | Empty-bar regen (.474) |
| 2026-08-04 | OHP · deadlift loops | Wired to old plated stills | Demoted from VIDEO_IDS until I2V from clean empty-bar still |

| 2026-08-04 | `overhead-press/side.webp` | Empty bar lockout, clean sleeves, no clips (.474) |
| 2026-08-04 | `front-squat` · `deadlift` · `barbell-row` stills | Empty bar, no collar hardware (.474) |
| 2026-08-04 | `romanian-deadlift/side.webp` (pre-fix) | Bar read as through thighs / wrong grip axis | FAIL → regen bar clearly anterior to legs (.475) |
| 2026-08-04 | `romanian-deadlift/side.webp` | Mid-hinge, bar in front of legs, empty bar L–R axis (.475) |
| 2026-08-04 | `deadlift/side.mp4` | Empty-bar I2V from cleaned lockout still; bar anterior; head in frame (.476) | PASS → VIDEO_IDS |
| 2026-08-04 | `overhead-press/side.mp4` (I2V ×2 from empty-bar still) | Mid-rep bar behind head / traps (behind-neck path) | FAIL — still-only |
| 2026-08-04 | `front-squat/side.mp4` | Empty-bar I2V; front rack held stand↔depth (.477) | PASS → VIDEO_IDS |
| 2026-08-04 | `romanian-deadlift/side.mp4` | Empty-bar I2V; hinge↔stand; bar anterior (.477) | PASS → VIDEO_IDS |
| 2026-08-04 | `barbell-row/side.mp4` | Empty-bar I2V; row path outside body (.477) | PASS → VIDEO_IDS |
| 2026-08-04 | `bench-press/side.mp4` | I2V lower/press; bar on chest not through torso (.478) | PASS → VIDEO_IDS |
| 2026-08-04 | `pull-ups/side.mp4` (I2V from hang still) | Head crop into bar at top of pull | FAIL — still-only hang |
| 2026-08-04 | `landmine-press/side.mp4` | I2V arc press; floor pivot fixed (.479) | PASS → VIDEO_IDS |

## Known hard cases

- **Chin-over pull-up:** model often returns dead hang, or crops the head into the bar at the top (`.478`). Ship hang as setup still; still-only is valid teaching.
- **Front rack + side camera:** plates hide head — prefer empty/light bar and explicit “head not behind plates”.
- **Barbell row:** model often puts bar on back (good-morning) — insist “bar outside body toward ribs, not on back”.
- **Collar / clip geometry:** models invent multi-prong hubs (3 clips from side). **Default empty bar; never spring collars.**
- **OHP lower path:** I2V from lockout still repeatedly puts the bar **behind** the head / on traps. Prefer still-only until a front-rack path passes frame QA; stronger “in front of face only” lock is not enough alone.
- **Floor poses (hollow / dead-bug / superman):** model flips the athlete prone or attaches the head backwards on the spine (`images/35.jpg`). That is a hard reject, not “almost a hollow.” Face, chest, and spine must agree.

## 2026-08-05 — Eyes-on wrong exercise / crop (.498)

| Date | Asset | Reason | Action |
|------|--------|--------|--------|
| 2026-08-05 | `overhead-press/side.webp` | Single-arm barbell press — wrong exercise for OHP id | Demoted from `FORM_PACK_SIDE_IDS` |
| 2026-08-05 | `pull-ups/side.webp` | Feet cut off frame (hard reject); hang-only not chin-over | Demoted from `FORM_PACK_SIDE_IDS` |

## 2026-08-05 — Resume Form Index (.540 re-QA)

Disk stills re-checked with native vision (Form Director checklist):

| Date | Asset | Notes | Action |
|------|--------|--------|--------|
| 2026-08-05 | `overhead-press/side.webp` | Two-hand empty-bar lockout, side profile, full head+feet, clean sleeves | **PASS still-only** → re-wired SIDE_IDS (no VIDEO — I2V behind-neck history) |
| 2026-08-05 | `pull-ups/side.webp` | Dead hang setup, full feet in frame, head clear | **PASS hang setup still** → re-wired SIDE_IDS (no VIDEO — top crop history) |

### Next gen queue (needs Grok Imagine / founder image gen — no COACH_LLM key in agent env)

1. Optional refresh OHP if identity drift vs athlete-a (current stills OK to ship)  
2. Optional chin-over pull-up attempt (hang is valid ship)  
3. Spot-check remaining pack vs MOVEMENT_STANDARDS  
4. I2V only from PASS stills — OHP/pull-ups stay still-only until video QA passes  

Prompts: `media/form-kit/prompts/still-overhead-press.md`, `still-pull-ups.md`  
Export naming: `media/inbox/form-{id}-side-frame.png` → `npm run media:optimize-inbox`

## 2026-08-05 — Spot-check honesty pass (.541)

| Date | Asset | Reason | Action |
|------|--------|--------|--------|
| 2026-08-05 | `landmine-row/side.webp` | Free end with plates floats mid-air — floor pivot not readable; reads poorly as teaching landmine row | Demoted from `FORM_PACK_SIDE_IDS` |
| 2026-08-05 | `pattern-hinge/side.webp` | Head cropped at top (hard reject); tight crop | Demoted from `FORM_PATTERN_RASTER_IDS` → SVG fallback |
| 2026-08-05 | `landmine-squat/side.webp` | Goblet landmine squat, floor end clear, full body | PASS still-only (keep) |
| 2026-08-05 | `romanian-deadlift/side.webp` | Empty bar anterior, mid-hinge, full body | PASS (keep) |
| 2026-08-05 | `thruster/side.webp` | Front-rack squat bottom, empty bar, head clear | PASS (keep) |

Regen priority: landmine-row (`prompts/still-landmine-row.md`), pattern-hinge (`prompts/still-pattern-hinge.md`).

## 2026-08-14 — Library honesty + Wave A (`.772`)

| Date | Asset | Notes | Action |
|------|--------|--------|--------|
| 2026-08-14 | `front-squat/side.webp` (pre) | High-bar back squat — wrong exercise | Replaced with front-rack still; VIDEO demoted |
| 2026-08-14 | `front-squat/side.webp` | Front-rack bottom, elbows high / zombie rack, full body, no text | **PASS still-only** |
| 2026-08-14 | `landmine-row/side.webp` | Floor sleeve planted; two-hand landmine row; no floating plates | **PASS still-only** → re-wired SIDE_IDS |
| 2026-08-14 | `pattern-hinge/side.webp` | Full head + feet, empty bar anterior | **PASS** → `FORM_PATTERN_RASTER_IDS` |
| 2026-08-14 | `burpees/side.webp` | Jump phase (not plank) | **PASS still-only**; VIDEO demoted |
| 2026-08-14 | `thruster/side.webp` | Overhead lockout (not front-squat bottom) | **PASS still-only**; VIDEO demoted |
| 2026-08-14 | `lunges/side.webp` | Dumbbells, split stance | **PASS still-only**; VIDEO demoted |
| 2026-08-14 | dead-bug gen (`images/23.jpg`) | Side-lying reach — not a supine dead bug | FAIL — do not wire |
| 2026-08-14 | side-plank gen (`images/24.jpg`) | Forearm *front* plank — wrong exercise | FAIL — do not wire |
| 2026-08-14 | dead-bug gen (`images/27.jpg`) | One foot planted — not a dead bug | FAIL — do not wire |
| 2026-08-14 | hollow-hold gen (`images/30.jpg`) | V-sit / boat, lumbar off the floor | FAIL — do not wire |
| 2026-08-14 | `dead-bug/side.webp` (`images/25.jpg`) | Supine, one leg tabletop, other hovering | **PASS still-only** |
| 2026-08-14 | `side-plank/side.webp` (`images/28.jpg`) | Forearm side plank, hips stacked, top arm up | **PASS still-only** |
| 2026-08-14 | `mountain-climbers/side.webp` (`images/29.jpg`) | High plank, one knee driving | **PASS still-only** |
| 2026-08-14 | hollow-hold gen (`images/35.jpg`) | Impossible anatomy — head / skeleton backwards (face does not match the spine). Also prone, not hollow. | FAIL — do not wire |
| 2026-08-14 | hollow-hold gen (`images/37.jpg`) | Superman / prone, not hollow | FAIL — do not wire |
| 2026-08-14 | hollow-hold gen (`images/36.jpg`) | Supine rest, arms to ceiling | FAIL — do not wire |
| 2026-08-14 | cable-row gen (`images/31.jpg`) | High-pulley seated row | FAIL — retry low/horizontal |
| 2026-08-14 | `hollow-hold/side.webp` (`images/38.jpg`) | Supine, lumbar down, legs hover | **PASS still-only** |
| 2026-08-14 | `cable-row/side.webp` (`images/39.jpg`) | Seated, horizontal cable, mid-pull | **PASS still-only** |
| 2026-08-14 | `lateral-raise/side.webp` (`images/41.jpg`) | Standing, DBs at shoulder height | **PASS still-only** |
| 2026-08-14 | `dumbbell-press/side.webp` (`images/34.jpg`) | Flat bench, DBs over chest | **PASS still-only** |
| 2026-08-14 | `dumbbell-row/side.webp` (`images/33.jpg`) | Three-point row, DB at hip | **PASS still-only** |
| 2026-08-14 | incline-bench gen (`images/46.jpg`) | Short bar / close grip; bench has printed numbers | FAIL |
| 2026-08-14 | dips-chair gen (`images/48.jpg`) | Kneeling table push-up, not a bench dip | FAIL |
| 2026-08-14 | dips-chair / incline gens (`images/50.jpg`, `51.jpg`) | Correct pose but title overlays | FAIL — text; stripped to 52/53 |
| 2026-08-14 | `step-ups/side.webp` (`images/45.jpg`) | Drive-up, full foot on box | **PASS still-only** |
| 2026-08-14 | `jump-squats/side.webp` (`images/47.jpg`) | Airborne from a squat | **PASS still-only** |
| 2026-08-14 | `wall-ball/side.webp` (`images/49.jpg`) | Squat, med ball, wall target | **PASS still-only** |
| 2026-08-14 | `dips-chair/side.webp` (`images/52.jpg`) | Hands behind, hips in front of bench | **PASS still-only** |
| 2026-08-14 | `incline-bench/side.webp` (`images/53.jpg`) | 35° bench, full empty bar, hands outside shoulders | **PASS still-only** |
