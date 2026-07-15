# Lighthouse baselines

Mobile Lighthouse scores for key routes. Re-run after major perf changes.

## How to capture

```bash
npm run build && PRIVATE_MODE=false npm run start
SMOKE_BASE_URL=http://localhost:3000 LIGHTHOUSE_SNAPSHOT=1 npm run lighthouse-budget
```

Routes checked: `/`, `/log`, `/guide/human-performance`, `/exercises/squats`.

Budget: **≥90** performance, accessibility, best-practices (soft warning in CI — see `.github/workflows/ci.yml`).

## Snapshot (2026-07-15 — local prod, `PRIVATE_MODE=false`, build `.61`+ lean Today)

Mobile Lighthouse after Serwist, landing idle demos, Today lean/full split, AppLayout deferrals:

| Route | Performance | Accessibility | Best practices | Notes |
|-------|-------------|---------------|----------------|-------|
| `/` | **87** | 94 | 100 | +8 vs 2026-07-11 (79) |
| **`/log`** | **79–80** | **96** | **100** | +1–2 vs 78; still under 90 |
| `/guide/human-performance` | **88–94** | 100 | 100 | Meets/near budget |
| `/exercises/squats` | **80–82** | 96 | 100 | Public SEO |

### Residual plan to hit `/log` ≥90

Dominant cost is **app shell** (`force-dynamic` `(app)` layout + full i18n + AppHeader/MobileNav + client boundary), not the lean hero alone. Next cuts (post-beta if needed):

1. Split marketing vs app chrome; avoid loading full i18n resources on first paint (namespace lazy load).
2. Consider static shell for `/log` without `force-dynamic` where safe.
3. Font subset / fewer display weights on first paint.
4. Profile Sentry/PostHog third-party cost when env keys set in prod.

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
