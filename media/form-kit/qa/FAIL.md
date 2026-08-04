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
