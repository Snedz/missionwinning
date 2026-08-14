# Form Index — generation queue (resume)

**Status:** object-kit + IMPLEMENT block. Five weak stills regenerated. Targeted sharp only.  
**Do not** run `npm run media:optimize-inbox` on the whole inbox (it rewrites unrelated packs). Targeted sharp only.

## Shipped pack (after .774)

| Kind | Count | Notes |
|------|-------|--------|
| SIDE stills | **43** | + landmine-row + 10 Wave A + 8 Wave B + 5 Wave C |
| VIDEO loops | **11** | demoted front-squat / burpees / thruster / lunges until I2V from new stills |
| Pattern rasters | all 7 including hinge | hinge regen PASS |

## Next stills (remainder)

Landmine siblings, carries, isolation leftovers (`skull-crusher`, `calf-raise`, `hanging-leg-raise`). Cable-row machine lock: low housing only.

Library cards must stay unique-pack only (`formPackLibraryPosterUrl`).

## Pipeline

```
1. Grok Imagine + refs (athlete-a-side **and** the IMPLEMENT `@prop-*` sheet)
2. Paste the full director block from `prompts/still-{id}.md` — a prompt without `IMPLEMENT` is incomplete
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
