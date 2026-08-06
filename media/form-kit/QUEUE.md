# Form Index — generation queue (resume)

**Status:** `.540` restored OHP + pull-ups stills from disk re-QA.  
**Blocker for new pixels:** no image-gen API key in agent env (`COACH_LLM_API_KEY` unset). Use Grok Imagine UI or set key.

## Shipped pack

| Kind | Count | Notes |
|------|-------|--------|
| SIDE stills | **19** | includes OHP + pull-ups still-only |
| VIDEO loops | **15** | no OHP/pull-up loops |

## Next stills (priority)

| # | Id | Prompt | Export |
|---|-----|--------|--------|
| 1 | (optional) athlete-a match refresh OHP | `prompts/still-overhead-press.md` | `media/inbox/form-overhead-press-side-frame.png` |
| 2 | (optional) chin-over pull-ups | `prompts/still-pull-ups.md` | `media/inbox/form-pull-ups-side-frame.png` |
| 3 | Spot-check pack | MOVEMENT_STANDARDS checklist | — |

## Pipeline

```
1. Open Grok Imagine (or xAI image) with refs:
   media/form-kit/refs/athlete-a-side.webp
   media/form-kit/refs/prop-barbell-sheet.webp (barbell lifts)
2. Paste director block from prompts/still-*.md
3. Save PNG as media/inbox/form-{id}-side-frame.png
4. npm run media:optimize-inbox
5. Vision QA vs FORM_DIRECTOR hard rejects
6. PASS → ensure FORM_PACK_SIDE_IDS has id; FAIL → FAIL.md
7. I2V only from PASS stills → VIDEO_IDS only after video QA
```

## Never

- Wire VIDEO for OHP/pull-ups until behind-neck / head-crop fixed  
- Bulk parallel gens without eyes-on  
- Ship single-arm as OHP  
