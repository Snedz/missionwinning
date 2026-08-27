# src/components/today/

> Today dashboard (`/log`) — sections, headers, cross-pillar coach chips.

## Components

| File | Purpose |
|------|---------|
| `TodayPageHeader.tsx` | Greeting, date, habit week-count, journey phase. F-017 (`.746` / `.762`): Sign-in link only after the first workout. |
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
| `TodayPlannedMissPrompt.tsx` | `.945` — skippable do-it-now / skip / slide when a planned day is overdue |
| `TodaySummaryPins.tsx` | Summary pin grid (0–4). Session tap starts. Edit persists. |
| `TodayHighlights.tsx` | One honest Highlights sentence. Empty is allowed. |
| `TodayShowAll.tsx` | Lean house door. Full Coach week strip + First Steps row. Not first paint. |
| `TodayWeekDoor.tsx` | WEEK door on first paint — one line + `/coach`. Not a second Start. |
| `TodayQuietWeekStrip.tsx` | `.961` — quiet Mon–Sun diary glance. Done marked. Empty stays empty. Not a Start. `.964` — 1–2 sessions stay `thin`; no streak / on-track score. `.977` — empty rest day can log one optional Fuel / Move / Track row. `.989` — two Track diary numbers can show muted last → this on that Scale day. |

## Related

| Layer | Path |
|-------|------|
| Page | `HomePage.tsx` |
| Layout | `useTodayLayout.ts` |
| Scoring | `score.ts`, `crossPillarCoach.ts` |
| Journey | `components/journey/TodaySection.tsx` |
