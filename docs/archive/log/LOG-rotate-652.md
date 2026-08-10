## 2026-08-09 — CX review: Today never paints raw i18n keys (`.637`)

Hero CX walk (390×844) found readiness Today painting **raw keys** after the first session: `Chest focus — todayReadinessPrime`, `todayBodyTrainSmart`, `coachInsightSteady`. Two defects, same class:

1. **English floors were the keys themselves** — `formatRecommendedFocusLine` and MetricsRow used `defaultValue: key`, so bootstrap/async hydrate gaps showed camelCase to athletes.
2. **Coach line never got `focusLine`** — locale strings use `{{focusLine}}`, but `getCoachInsight` passed `focusGroup` / `focusStatusKey`, so even a loaded pack could not interpolate.

Fix: catalog defaults in `readinessDisplay.ts` (`READINESS_STATUS_DEFAULTS`, `BODY_SCORE_LABEL_DEFAULTS`), `translateCoachInsightLine` builds the focus sentence and supplies English floors, MetricsRow uses `bodyScoreLabel`. Unit tests assert missing-pack paths never leak keys. Walk after: `Chest focus — Prime for growth · bodyweight`, `Train smart`.

**Review residual (not fixed this ship):** empty Active Start is outline-only by EmptyState design (S2); Field manual B/C density still founder-gated.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-637.md](docs/archive/log/LOG-rotate-637.md).
