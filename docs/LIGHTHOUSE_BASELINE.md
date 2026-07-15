# Lighthouse baselines

Mobile Lighthouse scores for key routes. Re-run after major perf changes.

## How to capture

```bash
npm run build && PRIVATE_MODE=false npm run start
SMOKE_BASE_URL=http://localhost:3000 LIGHTHOUSE_SNAPSHOT=1 npm run lighthouse-budget
```

Routes checked: `/`, `/log`, `/guide/human-performance`, `/exercises/squats`.

Budget: **≥90** performance, accessibility, best-practices (soft warning in CI — see `.github/workflows/ci.yml`).

## Snapshot (2026-07-15 — i18n hydrate + lean Today, build `.63`)

| Route | Performance | Accessibility | Best practices | Notes |
|-------|-------------|---------------|----------------|-------|
| `/` | **87** | 94 | 100 | +8 vs Jul 11 (79); idle demos + fonts |
| **`/log`** | **78–80** | **96** | **100** | Lean shell + deferred i18n; still shell-bound |
| `/guide/human-performance` | **88–94** | 100 | 100 | Near/meets budget |
| `/exercises/squats` | **80–82** | 96 | 100 | Public SEO |

### Residual plan to hit `/log` ≥90

1. ~~Lazy-load full i18n catalogs~~ — shipped (bootstrap + `hydrateI18nResources`)
2. ~~Lean Today split~~ — shipped
3. Consider static or partially static `(app)` layout (drop blanket `force-dynamic` where safe)
4. Lazy third-party (Sentry/PostHog) when keys present
5. Further AppHeader/MobileNav split for cold Basic path

*CI job `lighthouse-budget` remains soft-warning. Target `/log` → 90 after public activation data + shell work.*

## Prior snapshot (2026-07-11 — `2026.07-unified.54`)

| Route | Performance | Accessibility | Best practices | Notes |
|-------|-------------|---------------|----------------|-------|
| `/` | 79 | 94 | 100 | Landing |
| **`/log`** | **78** | **96** | **100** | Under 90 |
| `/guide/human-performance` | 88 | 100 | 100 | Public SEO chapter |
| `/exercises/squats` | 82 | 96 | 100 | Public exercise detail |

## Prior snapshot (2026-07-06)

| Route | Performance | Accessibility | Best practices |
|-------|-------------|---------------|----------------|
| `/` | 86 | 94 | 100 |
| `/log` | 78* | 96 | 100 |
| `/guide/human-performance` | 89 | 100 | 100 |
| `/exercises/squats` | 87 | 96 | 100 |

## CI

The `lighthouse-budget` job in `.github/workflows/ci.yml` runs against a local production server after `build-and-test`. Warnings do not fail the build.
