## 2026-08-09 — Daily coach insight English floors (`.643`)

`useDailyCoachInsight` (Today health / CoachInsightCard) still used `defaultValue: messageKey` / `actionLabelKey` — raw keys on hydrate while header coachLine was already fixed (`.637`). Hook now uses `translateCoachInsightLine` + `translateCoachActionLabel`; floors cover cross-pillar insight keys and all coach action labels.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-643.md](docs/archive/log/LOG-rotate-643.md).

