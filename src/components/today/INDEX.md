# src/components/today/

> Today dashboard (`/log`) — sections, headers, cross-pillar coach chips.

## Components

| File | Purpose |
|------|---------|
| `TodayPageHeader.tsx` | Greeting, date, journey phase |
| `TodayDashboardAccordion.tsx` | Health/journal/week/progress accordion (readiness+) |
| `TodayDashboardHeader.tsx` | Win Score ring row |
| `TodayHealthSection.tsx` | Readiness, strain, recovery metrics |
| `TodayProgressSection.tsx` | Streak, mission score |
| `TodayWeekSection.tsx` | Week activity summary |
| `TodayJournalStrip.tsx` | Recent workouts journal |
| `TodayMetricsSparklineRow.tsx` | Sparkline trends |
| `TodayDashboardCustomize.tsx` | Section visibility prefs |
| `MuscleFreshnessStrip.tsx` | Forge-style muscle days/REC glance |
| `CrossPillarCoachChips.tsx` | Move/Fuel/Mind suggestions |
| `Sparkline.tsx` | Shared mini chart |

## Related

| Layer | Path |
|-------|------|
| Page | `HomePage.tsx` |
| Layout | `useTodayLayout.ts` |
| Scoring | `score.ts`, `crossPillarCoach.ts` |
| Journey | `components/journey/TodaySection.tsx` |
