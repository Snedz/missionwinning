# Lighthouse baselines

Mobile Lighthouse scores for key routes. Re-run after major perf changes.

## How to capture

```bash
npm run build && PRIVATE_MODE=false npm run start
SMOKE_BASE_URL=http://localhost:3000 LIGHTHOUSE_SNAPSHOT=1 npm run lighthouse-budget
```

Routes checked: `/`, `/log`, `/guide/human-performance`, `/exercises/squats`.

Budget: **≥90** performance, accessibility, best-practices (soft warning in CI — see `.github/workflows/ci.yml`).

## Snapshot (2026-07-16 — mobile paint cuts, `/log` ≥90, build `.69`)

Mobile, `PRIVATE_MODE=false`, local prod (run variance ±2–3):

| Route | Performance | Accessibility | Best practices | Notes |
|-------|-------------|---------------|----------------|-------|
| `/` | **92** | 94 | 100 | ✅ Meets ≥90 |
| **`/log`** | **90** | **96** | **100** | ✅ Meets ≥90 (stable ×3 runs) |
| `/guide/human-performance` | **91** | 100 | 100 | ✅ Meets ≥90 |
| `/exercises/squats` | **87** | 96 | 100 | Near 90 (± variance) |

### Residual plan

1–7. ~~Shell JS cuts (i18n, store, pulse, supabase, nav, lean Today)~~ — shipped  
8. ~~Mobile paint: no fixed bg, solid glass-nav mobile, deferred toaster/banner, no first-paint page-enter~~ — shipped  
9. Optional polish: exercises public page → 90; further CSS purging; field data on real devices

*CI job `lighthouse-budget` remains soft-warning. Primary app route `/log` now clears the ≥90 performance target.*

## Prior snapshot (2026-07-16 — primary nav split + deferred Today, build `.68`)

| Route | Performance | Accessibility | Best practices | Notes |
|-------|-------------|---------------|----------------|-------|
| `/` | **92** | 94 | 100 | ✅ Meets ≥90 |
| **`/log`** | **81** | **96** | **100** | App shell JS/CSS still dominant |
| `/guide/human-performance` | **93** | 100 | 100 | ✅ Meets ≥90 |
| `/exercises/squats` | **89** | 96 | 100 | Near 90 (± variance) |

## Prior snapshot (2026-07-15 — supabase off shell, journey lite, build `.67`)

| Route | Performance | Accessibility | Best practices | Notes |
|-------|-------------|---------------|----------------|-------|
| `/` | **91** | 94 | 100 | ✅ Meets ≥90 |
| **`/log`** | **79–80** | **96** | **100** | App shell + Today client still heavy |
| `/guide/human-performance` | **91** | 100 | 100 | ✅ Meets ≥90 |
| `/exercises/squats` | **90** | 96 | 100 | ✅ Meets ≥90 |

## Prior snapshot (2026-07-15 — nav pulse + lean Today store-free, build `.66`)

| Route | Performance | Accessibility | Best practices | Notes |
|-------|-------------|---------------|----------------|-------|
| `/` | **90** | 94 | 100 | ✅ Meets ≥90 |
| **`/log`** | **80–81** | **96** | **100** | Shell + missionJourney still on cold path |
| `/guide/human-performance` | **88–91** | 100 | 100 | Often ≥90 |
| `/exercises/squats` | **83–86** | 96 | 100 | Public SEO |

## Prior snapshot (2026-07-15 — store catalog decouple + header lite, build `.65`)

| Route | Performance | Accessibility | Best practices | Notes |
|-------|-------------|---------------|----------------|-------|
| `/` | **88–91** | 94 | 100 | Often ≥90 |
| **`/log`** | **80–81** | **96** | **100** | Decoupled EXERCISES from zustand store |
| `/guide/human-performance` | **91** | 100 | 100 | ✅ Meets ≥90 |
| `/exercises/squats` | **86** | 96 | 100 | Public SEO |

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
