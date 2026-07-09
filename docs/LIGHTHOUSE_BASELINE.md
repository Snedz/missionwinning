# Lighthouse baselines

Mobile Lighthouse scores for key routes. Re-run after major perf changes.

## How to capture

```bash
npm run build && PRIVATE_MODE=false npm run start
SMOKE_BASE_URL=http://localhost:3000 LIGHTHOUSE_SNAPSHOT=1 npm run lighthouse-budget
```

Routes checked: `/`, `/log`, `/guide/human-performance`, `/exercises/squats`.

Budget: **≥90** performance, accessibility, best-practices (soft warning in CI — see `.github/workflows/ci.yml`).

## Snapshot (2026-07-06 — local prod build, `PRIVATE_MODE=false`)

Captured after Track C code-splitting + lazy Today sections. Performance is still a soft-warning target on heavy client routes (`/log`); accessibility and best-practices meet budget.

| Route | Performance | Accessibility | Best practices | Notes |
|-------|-------------|---------------|----------------|-------|
| `/` | 86 | 94 | 100 | Landing — below-fold demos lazy-loaded |
| **`/log`** | **78*** | **96** | **100** | *Slim readiness shipped (`2026.07-unified.48`); re-run snapshot to replace 78* |
| `/guide/human-performance` | 89 | 100 | 100 | Public SEO chapter |
| `/exercises/squats` | 87 | 96 | 100 | Public exercise detail |

*Re-run `npm run lighthouse-budget` after perf work; CI job `lighthouse-budget` logs warnings without failing the build.*

## CI

The `lighthouse-budget` job in `.github/workflows/ci.yml` runs against a local production server after `build-and-test`. Warnings do not fail the build.
