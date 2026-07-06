# Lighthouse baselines

Mobile Lighthouse scores for key routes. Re-run after major perf changes.

## How to capture

```bash
npm run build && npm run start   # or use deployed preview
SMOKE_BASE_URL=http://localhost:3000 LIGHTHOUSE_SNAPSHOT=1 node scripts/lighthouse-budget.mjs
```

Routes checked: `/`, `/log`, `/guide/human-performance`, `/exercises/squats`.

Budget: **≥90** performance, accessibility, best-practices (soft warning in CI — see `.github/workflows/ci.yml`).

## Snapshot (update after runs)

| Route | Performance | Accessibility | Best practices | Notes |
|-------|-------------|---------------|----------------|-------|
| `/` | — | — | — | Landing (when `PRIVATE_MODE=false`) |
| `/log` | — | — | — | Today hub (authenticated / beta) |
| `/guide/human-performance` | — | — | — | Public SEO chapter |
| `/exercises/squats` | — | — | — | Public exercise detail |

*Last manual capture: pending — run `lighthouse-budget.mjs` against production or local build and paste scores above.*

## CI

The `lighthouse` job in CI runs against the preview URL when `SMOKE_BASE_URL` is set. Warnings do not fail the build.
