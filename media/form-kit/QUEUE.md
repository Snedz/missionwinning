# Form Index — generation queue (resume)

**Status:** `.541` honesty pass — demoted failing landmine-row + pattern-hinge.  
**Blocker for new pixels:** no image-gen API key in agent env. Use Grok Imagine UI.

## Shipped pack (after .541)

| Kind | Count | Notes |
|------|-------|--------|
| SIDE stills | **18** | OHP + pull-ups still-only; landmine-row out |
| VIDEO loops | **15** | unchanged |
| Pattern rasters | squat, push, pull, loco, core, isolation | **hinge → SVG** until regen |

## Next stills (priority)

| # | Id | Prompt | Export |
|---|-----|--------|--------|
| 1 | `landmine-row` | `prompts/still-landmine-row.md` | `media/inbox/form-landmine-row-side-frame.png` |
| 2 | `pattern-hinge` | `prompts/still-pattern-hinge.md` | `media/inbox/form-pattern-hinge-side-frame.png` |
| 3 | Optional chin-over `pull-ups` | `prompts/still-pull-ups.md` | hang already ships |
| 4 | Optional athlete-a identity unify | — | — |

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
