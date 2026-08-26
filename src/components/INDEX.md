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
| `beta/` | Beta admin, welcome banner, `FeedbackNoteRow` (rate dest) |
| `builder/` | Workout builder panels |
| `coach/` | Mission Coach UI — [coach/INDEX.md](coach/INDEX.md) |
| `fitness-test/` | PFT test runner — [fitness-test/INDEX.md](fitness-test/INDEX.md) |
| `form/` | Form guides |
| `history/` | History charts, muscle heatmap, finished-session edit (`.997`), past-session backfill (`.1000`), merge duplicates (`.1002`), delete this finished session (`.1003`), restore a deleted session (`.1006`), name this finished session (`.1007`), start history from this date (`.1005`), export this diary (`.1011`), import that file back (`.1013`), this session as a file they own (`.1016`), month they own (`.1018`), Repeat this session (`.1026`), move this session to another day (`.1027`), log onto this empty day (`.1028`), this month as a file they own (`.1029`), copy this session onto another day (`.1030`), This month on the History calendar (`.1031`) |
| `library/` | Exercise picker + detail. Picker omits hidden names (`.1004`) |
| `journey/` | Journey UX — [journey/INDEX.md](journey/INDEX.md) |
| `landing/` | Homepage demos — `LogToPlanHero` (the signature: real progression engine), `CoachAdaptDemo` |
| `layout/` | App shell — [layout/INDEX.md](layout/INDEX.md) |
| `leaderboard/` | Leaderboard UI |
| `learn/` | Learn path UI + `QuietLearnIntroCard` (`.978` first-success intro) + `GuideSectionExtras`, `GuideApexShell`, `GuideContentsRail`, `GuideLocaleSelect` (public magazine reader) |
| `metrics/` | CoachInsightCard, pillar scores (not weekly plan) |
| `move/` | Move UI — `MoveLockedPreview`, `QuietMoveLogCard` (`.969` quiet rest-day walk / easy session) |
| `nutrition/` | Fuel UI — `FuelMacroOverview`, `FuelQuickLogPanel`, `FuelMoreTools`, `FuelTodayLogCard`, `FuelLogSheet`, `FuelRecipesPanel`, `FuelRestockCard` (`.965` this week's restock they take) |
| `pillars/` | Shared pillar panels, timed flows |
| `today/` | Today dashboard — [today/INDEX.md](today/INDEX.md) |
| `track/` | Quiet Track body-metrics card (`.975`); GPS / activity panels in Show more |
| `profile/` | Profile settings cards (privacy, backup, referral, wearables, What’s New). `HomeGymKitCard` — Account day-one Home gym kit (`.763`). `ProfileImportCard` — workout CSV preview + confirm (`.940`); session CSV download is header-only when empty (`.943`); Hevy measurements on the same door (`.951`) |
| `public/` | Public SEO chrome + `LaunchNotifyForm` (landing / `/private` email notify — no checkout) |
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
