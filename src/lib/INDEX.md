# src/lib/

> One concern: Pure business logic, scoring, sync, API helpers, and domain modules.

## Read order

1. [coach/INDEX.md](coach/INDEX.md) — if working on Mission Coach
2. Domain file for your task (table below)
3. Matching `*.test.ts` colocated with the module

## Domain map (root-level files)

| Domain | Key files | Notes |
|--------|-----------|-------|
| **Scoring / Today** | `score.ts`, `crossPillarCoach.ts`, `pillarScoreInputs.ts`, `readinessIndex.ts`, `exerciseMuscleMap.ts` | Readiness, Win Score, coach insight |
| **Mission Coach (daily)** | `coachDailyServer.ts` | LLM daily insight API — not weekly plan |
| **Mission Coach (weekly)** | `coach/` subfolder | Plan engine — see [coach/INDEX.md](coach/INDEX.md) |
| **Coach sync** | `coachSync.ts` | Cloud push for coach plan |
| **Journey** | `missionJourney.ts`, `journeySync.ts`, `journeyGoals.ts`, `journeyAnalytics.ts` | I-Day → Commissioned |
| **Workouts** | [`workout/`](workout/INDEX.md) subfolder (+ root re-exports); `justGoSession.ts`, `historyAnalytics.ts`, `benchmarks.ts` | Logger helpers; Just Go; next-set targets; rest/PR/superset |
| **Nutrition / Fuel** | `macroTargets.ts`, `openFoodFacts.ts`, `nutritionLog.ts`, `nlMealLog.ts`, `savedMeals.ts`, `nutritionHighProteinDays.ts` | Fuel pillar; NL + saved presets; Today score protein days |
| **Today primary CTA** | `todayPrimaryAction.ts`, `coach/loadCoachTodayOptional.ts` | Shared Just Go / journey primary for lean + dashboard |
| **Fuel Coach** | `fuelCoach/` subfolder | Adaptive meal plan — see [fuelCoach/INDEX.md](fuelCoach/INDEX.md) |
| **Payments** | `premiumServer.ts`, `payments.ts`, `stripeWebhook.ts`, `paypalWebhook.ts` | Premium gating |
| **School / PFT** | `schoolClassServer.ts`, `presidentialFitness*.ts`, `fitnessTest*.ts` | America track |
| **Gating / auth** | `privateGate.ts`, `supabaseAuthCookies.ts`, `supabaseRequestAuth.ts` | Private beta, JWT cookies |
| **i18n loaders** | `routeMetadata.ts`, `navConfig.ts` | Not strings — see `src/i18n/` |
| **Units** | `units.ts` | `weightStep`, metric/imperial |
| **Backup** | `backup.ts` | Device backup export/restore |
| **Analytics** | `analytics.ts` | PostHog events |
| **Observability** | `sentryCommon.ts`, `api/withApiLogging.ts` | Sentry (env-gated) + API request logs |
| **Leaderboard** | `leaderboard/` subfolder | Local + cloud leaderboard |

## Subfolders (one concern each)

| Folder | INDEX |
|--------|-------|
| `coach/` | [coach/INDEX.md](coach/INDEX.md) |
| `fuelCoach/` | [fuelCoach/INDEX.md](fuelCoach/INDEX.md) |
| `workout/` | Logger, merge, rest, PR, victory — [workout/INDEX.md](workout/INDEX.md) |
| `leaderboard/` | Leaderboard compute/sync helpers — [leaderboard/INDEX.md](leaderboard/INDEX.md) |

## Convention: adding new domains

When a domain grows beyond **~5 related files**, create `src/lib/{domain}/` + `INDEX.md` (model: `coach/`).

## Related (not here)

- React hooks: `src/hooks/`
- Zustand store: `src/store/workoutStore.ts`
- Static catalogs: `src/data/INDEX.md`

## Do not open

- `coachPlan.ts` — **deleted**; use `coach/`
- Repo-wide grep for “coach” without reading [AGENTS.md](../../AGENTS.md) glossary first
