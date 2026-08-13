# src/components/coach/

> Mission Coach weekly plan UI — not daily insight (see `metrics/CoachInsightCard`).

## Components

| File | Purpose |
|------|---------|
| `CoachAdaptBanner.tsx` | Demo-critical: adapted from logs / missed / swapped; `.693` log-cited why-this-week (inputs · rule · effect) |
| `CoachTodayCard.tsx` | Today commissioned card → links `/coach` |
| `WeekStrip.tsx` | Week navigation on Coach page |
| `TodayCoachWeekStrip.tsx` | Compact week strip on Today |
| `PlanSessionCard.tsx` | Single session card (exercises, start train, optional adjust, garage Swap on a line) |
| `CoachPlanSessionGrid.tsx` | Sorted week grid + boss Start via `resolveCoachBossSessionId` (`.442`) |
| `CoachScheduleEditor.tsx` | Days/week + preferred weekdays (Profile + Coach manage) |
| `CoachManageSheet.tsx` | D12 manage week: adjust · schedule · regenerate · ask |
| `CoachVoiceCard.tsx` | Weekly voice briefing display |
| `AdjustSessionSheet.tsx` | Free offline adjust chips (time / BW / avoid) |
| `CoachChatPanel.tsx` | Premium chat; free = soft tip or form cues for `?ask=` (not brass paywall) |
| `CoachChatTranscript.tsx` | Premium turn log (`role="log"`) (`.448`) |
| `CoachChatComposer.tsx` | Premium input + send/stop (`.448`) |

## Related

| Layer | Path |
|-------|------|
| Page | `CoachPage.tsx` |
| Hook | `useCoachPlan.ts` |
| Engine | `src/lib/coach/INDEX.md` |
| API | `/api/coach/plan-voice`, `/api/coach/chat` |

## Naming trap

**Mission Coach** (this folder) ≠ **Coaching** (`CoachingPage` — human leads).
