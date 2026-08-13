# src/components/

> One concern: Reusable UI components grouped by feature.

## Read order

1. `ui/` — shadcn primitives (Button, Card, Badge, Dialog, …)
2. `layout/` — App shell, nav, headers, footers
3. Feature subfolder for your task (table below)

## Subfolders

| Folder | Purpose |
|--------|---------|
| `crypto/` | Phantom lifetime USDC checkout |
| `auth/` | Sign-in panel |
| `benchmarks/` | Benchmark charts |
| `beta/` | Beta admin, welcome banner |
| `builder/` | Workout builder panels |
| `bundle/` | Super Bundle shop cards — [bundle/INDEX.md](bundle/INDEX.md) |
| `coach/` | Mission Coach UI — [coach/INDEX.md](coach/INDEX.md) |
| `fitness-test/` | PFT test runner — [fitness-test/INDEX.md](fitness-test/INDEX.md) |
| `form/` | Form guides |
| `history/` | History charts, muscle heatmap |
| `journey/` | Journey UX — [journey/INDEX.md](journey/INDEX.md) |
| `landing/` | Homepage demos — `LogToPlanHero` (the signature: real progression engine), `CoachAdaptDemo` |
| `layout/` | App shell — [layout/INDEX.md](layout/INDEX.md) |
| `leaderboard/` | Leaderboard UI |
| `learn/` | Learn path UI + `GuideSectionExtras`, `GuideApexShell`, `GuideContentsRail`, `GuideLocaleSelect` (public magazine reader) |
| `metrics/` | CoachInsightCard, pillar scores (not weekly plan) |
| `nutrition/` | Fuel UI — `FuelMacroOverview`, `FuelQuickLogPanel`, `FuelMoreTools`, `FuelTodayLogCard`, `FuelLogSheet`, `FuelRecipesPanel` |
| `pillars/` | Shared pillar panels, timed flows |
| `today/` | Today dashboard — [today/INDEX.md](today/INDEX.md) |
| `track/` | GPS / activity panels |
| `profile/` | Profile settings cards (privacy, backup, referral, wearables, What’s New) |
| `ui/` | Design system primitives (`AdaptiveOverlay` — the one sheet shell, with a pinned `footer` slot; `EmptyState`, `ErrorState`, `Skeleton`, `MeterBar`, `ScoreNumeral`, `RuledRadioGroup`, `OtpInput`, `FileDropZone`, `FileUploadRow`, `HoldToConfirmButton`, `DangerZone`, shadcn) |
| `workout/` | Active workout — [workout/INDEX.md](workout/INDEX.md) |

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
