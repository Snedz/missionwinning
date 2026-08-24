# src/components/coach/

> Mission Coach weekly plan UI — not daily insight (see `metrics/CoachInsightCard`).

## Components

| File | Purpose |
|------|---------|
| `CoachAdaptBanner.tsx` | Demo-critical: adapted from logs / missed / swapped; `.693` log-cited why-this-week (inputs · rule · effect); `.861` session-count proposal replaces the assertion (H-02) |
| `CoachTodayCard.tsx` | Today commissioned card → links `/coach` |
| `CoachLogCite.tsx` | The quoted log under a Coach claim, or the no-logs admission (`.766`) |
| `WeekStrip.tsx` | Week navigation on Coach page |
| `TodayCoachWeekStrip.tsx` | Compact week strip on Today — dose + compact adapt (G6). No second red. |
| `PlanSessionCard.tsx` | Single session card (exercises, start train, optional adjust); `.932` / `.699` boss-card why-this-session (cite or honest empty) |
| `CoachPlanSessionGrid.tsx` | Sorted week grid + boss Start via `resolveCoachBossSessionId` (`.442`); passes session rationale hints and garage `onSwapExercise` |
| `CoachScheduleEditor.tsx` | Days/week + preferred weekdays (Profile + Coach manage) |
| `CoachManageSheet.tsx` | D12 manage week: adjust · schedule · regenerate · ask |
| `CoachVoiceCard.tsx` | Weekly voice briefing display |
| `AdjustSessionSheet.tsx` | Free offline adjust chips (time / BW / avoid) |
| `CoachChatPanel.tsx` | Premium chat; free = soft tip or form cues for `?ask=` (not brass paywall) |
| `CoachChatTranscript.tsx` | Premium turn log (`role="log"`) (`.448`) |
| `CoachChatComposer.tsx` | Premium input + send/stop (`.448`) |
| `CoachLiveVoice.tsx` | Signed-in + online talk loop (listen → think → speak → listen). After this week’s session — not above the strip |

## Related

| Layer | Path |
|-------|------|
| Page | `CoachPage.tsx` |
| Hook | `useCoachPlan.ts` |
| Engine | `src/lib/coach/INDEX.md` |
| API | `/api/coach/plan-voice`, `/api/coach/chat` |

## Naming trap

**Mission Coach** (this folder) ≠ **Coaching** (`CoachingPage` — human leads).
