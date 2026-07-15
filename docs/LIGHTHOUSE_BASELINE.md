# Lighthouse baselines

Mobile Lighthouse scores for key routes. Re-run after major perf changes.

## How to capture

```bash
npm run build && PRIVATE_MODE=false npm run start
SMOKE_BASE_URL=http://localhost:3000 LIGHTHOUSE_SNAPSHOT=1 npm run lighthouse-budget
```

Routes checked: `/`, `/log`, `/guide/human-performance`, `/exercises/squats`.

Budget: **≥90** performance, accessibility, best-practices (soft warning in CI — see `.github/workflows/ci.yml`).

## Snapshot (2026-07-15 — Serwist + Today/Landing deferrals, `2026.07-unified.61`)

Code changes for perf (re-measure after deploy or locally):

- Landing: idle-defer JourneyScroll / CoachAdapt / GuideTeaser
- Today: dynamic journey chrome; lazy justGo / trends / weekRecap
- PWA: `next-pwa` → **Serwist** (`app/sw.ts`), SW only when `PRIVATE_MODE=false`

| Route | Performance | Accessibility | Best practices | Notes |
|-------|-------------|---------------|----------------|-------|
| `/` | *re-run* | — | — | `LIGHTHOUSE_SNAPSHOT=1 npm run lighthouse-budget` |
| **`/log`** | *re-run* | — | — | Target still ≥90 |
| `/guide/human-performance` | — | — | — | Public SEO |
| `/exercises/squats` | — | — | — | Public SEO |

## Prior snapshot (2026-07-11 — `2026.07-unified.54`)

| Route | Performance | Accessibility | Best practices | Notes |
|-------|-------------|---------------|----------------|-------|
| `/` | 79 | 94 | 100 | Landing — below-fold demos lazy-loaded |
| **`/log`** | **78** | **96** | **100** | Under 90 |
| `/guide/human-performance` | 88 | 100 | 100 | Public SEO chapter |
| `/exercises/squats` | 82 | 96 | 100 | Public exercise detail |

*CI job `lighthouse-budget` logs warnings without failing the build. Target `/log` → 90 after public activation data.*

## Prior snapshot (2026-07-06)

| Route | Performance | Accessibility | Best practices |
|-------|-------------|---------------|----------------|
| `/` | 86 | 94 | 100 |
| `/log` | 78* | 96 | 100 |
| `/guide/human-performance` | 89 | 100 | 100 |
| `/exercises/squats` | 87 | 96 | 100 |

## CI

The `lighthouse-budget` job in `.github/workflows/ci.yml` runs against a local production server after `build-and-test`. Warnings do not fail the build.
