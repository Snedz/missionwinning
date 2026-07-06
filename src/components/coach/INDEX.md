# src/components/coach/

> Mission Coach weekly plan UI — not daily insight (see `metrics/CoachInsightCard`).

## Components

| File | Purpose |
|------|---------|
| `CoachTodayCard.tsx` | Today commissioned card → links `/coach` |
| `WeekStrip.tsx` | Week navigation on Coach page |
| `TodayCoachWeekStrip.tsx` | Compact week strip on Today |
| `PlanSessionCard.tsx` | Single session card (exercises, start train) |
| `CoachVoiceCard.tsx` | Weekly voice briefing display |

## Related

| Layer | Path |
|-------|------|
| Page | `CoachPage.tsx` |
| Hook | `useCoachPlan.ts` |
| Engine | `src/lib/coach/INDEX.md` |
| API | `/api/coach/plan-voice` |

## Naming trap

**Mission Coach** (this folder) ≠ **Coaching** (`CoachingPage` — human leads).
