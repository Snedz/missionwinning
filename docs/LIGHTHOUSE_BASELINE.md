# Bundle / First Load baseline (Wave 9–10)

**Date:** 2026-07-19  
**Build:** `npm run build` (Next 16.2 — route table no longer prints First Load JS; we snapshot **route page chunks** gzipped).

**Note:** Lazy-merge for extended exercise catalog and ProgramTemplatesPanel `next/dynamic` already address the main dataset concern. Serwist precache covers dynamic chunks when PWA is enabled. Shared framework chunks are **not** included in page-only sizes below.

## How to re-measure

```bash
npm run build
# optional: ANALYZE=1 npm run build
gzip -c .next/static/chunks/app/page-*.js | wc -c
gzip -c .next/static/chunks/app/\(app\)/log/page-*.js | wc -c
# …active, builder, coach similarly
```

## Route page chunks (2026-07-19 snapshot)

| Route | Page chunk gz | Raw | Notes |
|-------|---------------|-----|--------|
| `/` | **9.1 KB** | 31 KB | Marketing + HeroDemo |
| `/log` | **5.5 KB** | 15 KB | Today |
| `/active` | **12.1 KB** | 40 KB | Logger hot path (largest of set) |
| `/builder` | **8.5 KB** | 27 KB | |
| `/coach` | **9.6 KB** | 31 KB | |

No surprise enrichment leaks into these page chunks; `/active` is the largest intentional route chunk.

## Intentional eagers

- Base exercise catalog remains eager for offline cold-start logging.
- Premium program templates remain server-only.
