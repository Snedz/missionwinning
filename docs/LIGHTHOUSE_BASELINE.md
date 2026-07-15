# Lighthouse baselines

Mobile Lighthouse scores for key routes. Re-run after major perf changes.

## How to capture

```bash
npm run build && PRIVATE_MODE=false npm run start
SMOKE_BASE_URL=http://localhost:3000 LIGHTHOUSE_SNAPSHOT=1 npm run lighthouse-budget
```

Routes checked: `/`, `/log`, `/guide/human-performance`, `/exercises/squats`.

Budget: **≥90** performance, accessibility, best-practices (soft warning in CI — see `.github/workflows/ci.yml`).

## Snapshot (2026-07-15 — no force-dynamic app shell + deferred analytics, build `.64`)

Mobile, `PRIVATE_MODE=false`, local prod:

| Route | Performance | Accessibility | Best practices | Notes |
|-------|-------------|---------------|----------------|-------|
| `/` | **91** | 94 | 100 | ✅ Meets ≥90 (was 79 → 87 → **91**) |
| **`/log`** | **81** | **96** | **100** | +3 vs 78; still under 90 |
| `/guide/human-performance` | **91** | 100 | 100 | ✅ Meets ≥90 |
| `/exercises/squats` | **86** | 96 | 100 | +4–6 vs prior |

### Residual plan to hit `/log` ≥90

1. ~~Lazy-load full i18n catalogs~~ — shipped  
2. ~~Lean Today split~~ — shipped  
3. ~~Drop `(app)` `force-dynamic`~~ — shipped (routes now static ○ where possible)  
4. ~~Dynamic posthog-js + deferred init~~ — shipped  
5. Further: slim AppHeader auth chip; optional RSC shell for `/log` without full client layout on cold empty state  
6. Lazy Sentry client when DSN set (prod only impact)

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
