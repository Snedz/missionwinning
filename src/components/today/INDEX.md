# src/components/today/

> Today dashboard (`/log`) — sections, headers, cross-pillar coach chips.

## Components

| File | Purpose |
|------|---------|
| `TodayPageHeader.tsx` | Greeting, date, journey phase |
| `TodayDashboardAccordion.tsx` | Health/journal/week/progress accordion (readiness+) |
| `TodayDashboardHeader.tsx` | Mission Score ScoreNumeral + MetricsRow; trends collapsed |
| `TodayHealthSection.tsx` | Readiness, strain, recovery metrics |
| `TodayProgressSection.tsx` | Streak, mission score |
| `TodayWeekSection.tsx` | Week activity summary |
| `TodayJournalStrip.tsx` | Recent workouts journal |
| `TodayMetricsSparklineRow.tsx` | Sparkline trends |
| `TodayDashboardCustomize.tsx` | Section visibility prefs |
| `MuscleFreshnessStrip.tsx` | Muscle days/REC glance — chips at `md+`, ruled rows with an 8px meter on compact |
| `CrossPillarCoachChips.tsx` | Move/Fuel/Mind suggestions |
| `Sparkline.tsx` | Shared mini chart |
| `TodayReentryCard.tsx` | S7 0.1 (beta) quiet line on the Start field (`JourneyHero`) |

## Related

| Layer | Path |
|-------|------|
| Page | `HomePage.tsx` |
| Layout | `useTodayLayout.ts` |
| Scoring | `score.ts`, `crossPillarCoach.ts` |
| Journey | `components/journey/TodaySection.tsx` |
