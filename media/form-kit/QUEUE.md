# Form Index — generation queue (resume)

**Status:** `.772` library honesty + Wave A + Wave B start.  
**Do not** run `npm run media:optimize-inbox` on the whole inbox (it rewrites unrelated packs). Targeted sharp only.

## Shipped pack (after .772)

| Kind | Count | Notes |
|------|-------|--------|
| SIDE stills | **33** | + landmine-row + 10 Wave A + dead-bug / side-plank / mountain-climbers |
| VIDEO loops | **11** | demoted front-squat / burpees / thruster / lunges until I2V from new stills |
| Pattern rasters | all 7 including hinge | hinge regen PASS |

## Next stills (Wave B remainder)

`hollow-hold` (this session FAIL — V-sit), then remaining structured guides: `cable-row`, `lateral-raise`, `dumbbell-press`, `dumbbell-row`, landmine siblings, `incline-bench`, `wall-ball`, carries.

Library cards must stay unique-pack only (`formPackLibraryPosterUrl`).

## Pipeline

```
1. Grok Imagine + refs (athlete-a-side, prop-barbell as needed)
2. Paste director block from prompts/
3. Save PNG as media/inbox/form-{id}-side-frame.png
4. npm run media:optimize-inbox
5. Vision QA vs FORM_DIRECTOR hard rejects
6. PASS → wire SIDE_IDS / FORM_PATTERN_RASTER_IDS
7. I2V only from PASS stills
```

## Never

- Wire VIDEO for OHP/pull-ups until video QA  
- Ship landmine with floating free-end  
- Ship pattern stills with cropped heads  
