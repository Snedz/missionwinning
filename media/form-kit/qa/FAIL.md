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

## 2026-08-05 — Eyes-on wrong exercise / crop (.498)

| Date | Asset | Reason | Action |
|------|--------|--------|--------|
| 2026-08-05 | `overhead-press/side.webp` | Single-arm barbell press — wrong exercise for OHP id | Demoted from `FORM_PACK_SIDE_IDS` |
| 2026-08-05 | `pull-ups/side.webp` | Feet cut off frame (hard reject); hang-only not chin-over | Demoted from `FORM_PACK_SIDE_IDS` |

Validation protocol: [MOVEMENT_STANDARDS.md](MOVEMENT_STANDARDS.md) (CrossFit demos = reference only).

## 2026-08-05 — Form Director re-assemble (demotes fixed)

| Date | Asset | Notes |
|------|--------|--------|
| 2026-08-05 | `overhead-press/side.webp` | Athlete-a lock · two-hand empty-bar lockout · head + full body · PASS → re-wire SIDE_IDS (still-only; no VIDEO) |
| 2026-08-05 | `pull-ups/side.webp` | Athlete-a lock · dead-hang setup · feet + head in frame · PASS → re-wire SIDE_IDS (still-only; chin-over still hard) |

**Process note:** `npm run media:optimize-inbox` rewrites **every** matching inbox frame. Isolate regen targets before optimize, or `git checkout` other `public/form/*` after a bulk run.
