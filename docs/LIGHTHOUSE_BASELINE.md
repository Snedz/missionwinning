# Bundle / First Load baseline (Wave 9)

**Date:** 2026-07-19  
**Note:** Lazy-merge for extended exercise catalog and ProgramTemplatesPanel `next/dynamic` already address the main dataset concern. Serwist precache covers dynamic chunks when PWA is enabled, so lazy loading stays offline-safe.

## How to re-measure

```bash
ANALYZE=1 npm run build
# Inspect webpack report; optional: next build route table for First Load JS
```

## Routes to record (manual after ANALYZE build)

| Route | First Load JS (record after build) | Notes |
|-------|-------------------------------------|--------|
| `/` | — | Marketing + HeroDemo |
| `/log` | — | Today |
| `/active` | — | Logger hot path |
| `/builder` | — | |
| `/coach` | — | |

Fill numbers on the next `ANALYZE=1` production build and note any surprise (e.g. enrichment leaking into app chunks).

## Intentional eagers

- Base exercise catalog (~186 lines) remains eager for offline cold-start logging.
- Premium program templates remain server-only.
