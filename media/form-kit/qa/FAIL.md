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

## Known hard cases

- **Chin-over pull-up:** model often returns dead hang — ship hang as setup still if top fails twice.
- **Front rack + side camera:** plates hide head — prefer empty/light bar and explicit “head not behind plates”.
- **Barbell row:** model often puts bar on back (good-morning) — insist “bar outside body toward ribs, not on back”.
