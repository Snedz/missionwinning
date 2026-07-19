# src/components/coach/

> Mission Coach weekly plan UI — not daily insight (see `metrics/CoachInsightCard`).

## Components

| File | Purpose |
|------|---------|
| `CoachTodayCard.tsx` | Today commissioned card → links `/coach` |
| `WeekStrip.tsx` | Week navigation on Coach page |
| `TodayCoachWeekStrip.tsx` | Compact week strip on Today |
| `PlanSessionCard.tsx` | Single session card (exercises, start train, optional adjust) |
| `CoachVoiceCard.tsx` | Weekly voice briefing display |
| `AdjustSessionSheet.tsx` | Free offline adjust chips (time / BW / avoid) |
| `CoachChatPanel.tsx` | Premium chat (locked teaser when free) |

## Related

| Layer | Path |
|-------|------|
| Page | `CoachPage.tsx` |
| Hook | `useCoachPlan.ts` |
| Engine | `src/lib/coach/INDEX.md` |
| API | `/api/coach/plan-voice`, `/api/coach/chat` |

## Naming trap

**Mission Coach** (this folder) ≠ **Coaching** (`CoachingPage` — human leads).
