# src/components/

> One concern: Reusable UI components grouped by feature.

## Read order

1. `ui/` — shadcn primitives (Button, Card, Badge, Dialog, …)
2. `layout/` — App shell, nav, headers, footers
3. Feature subfolder for your task (table below)

## Subfolders

| Folder | Purpose |
|--------|---------|
| `auth/` | Sign-in panel |
| `benchmarks/` | Benchmark charts |
| `beta/` | Beta admin, welcome banner |
| `builder/` | Workout builder panels |
| `coach/` | Mission Coach UI (WeekStrip, PlanSessionCard, CoachTodayCard) |
| `fitness-test/` | PFT test runner |
| `form/` | Form guides |
| `history/` | History charts, muscle heatmap |
| `journey/` | JourneyHero, CommandersIntent, guidebook card |
| `layout/` | AppLayout, PillarPageHeader, nav |
| `leaderboard/` | Leaderboard UI |
| `learn/` | Learn path UI |
| `metrics/` | CoachInsightCard, pillar scores (not weekly plan) |
| `nutrition/` | Fuel UI |
| `pillars/` | Shared pillar panels, timed flows |
| `today/` | TodayHealthSection, dashboard headers |
| `track/` | GPS / activity panels |
| `ui/` | Design system primitives |
| `workout/` | Active workout UI pieces |

## Coach UI split

| Component | Concern |
|-----------|---------|
| `coach/CoachTodayCard.tsx` | Today commissioned card → `/coach` |
| `coach/PlanSessionCard.tsx` | Weekly session card |
| `metrics/CoachInsightCard.tsx` | Daily one-liner insight |

## Related (not here)

- Full pages: `src/page-components/INDEX.md`
- Logic: `src/lib/INDEX.md`

## Do not open

- `metrics/CoachPlanCard.tsx` — **deleted**
