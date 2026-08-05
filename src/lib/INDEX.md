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
| **Mission Rewards** | [`rewards/`](rewards/INDEX.md) | XP, ranks, badges from real logs — never gates logger |
| **Mission Coach (daily)** | `coachDailyServer.ts` | LLM daily insight API — not weekly plan |
| **Mission Coach (weekly)** | `coach/` subfolder | Plan engine — see [coach/INDEX.md](coach/INDEX.md) |
| **Coach sync** | `coachSync.ts` | Cloud push for coach plan |
| **Durable sync** | `sync/outbox.ts` | Queue every cloud write — survives the tab closing |
| **Device storage** | `storage/safeStorage.ts` | Guarded localStorage — never throws |
| **Surface parking** | `surface.ts` | Which non-wedge surfaces are reachable (`NEXT_PUBLIC_SURFACES`) |
| **Journey** | `missionJourney.ts`, `journeySync.ts`, `journeyGoals.ts`, `journeyAnalytics.ts` | I-Day → Commissioned |
| **Workouts** | [`workout/`](workout/INDEX.md) subfolder (+ root re-exports); `justGoSession.ts`, `historyAnalytics.ts`, `benchmarks.ts` | Logger helpers; Just Go; next-set targets; rest/PR/superset |
| **Nutrition / Fuel** | `macroTargets.ts`, `fuelGoalWizard.ts`, `fuelDayAdapt.ts`, `openFoodFacts.ts`, `nutritionLog.ts`, `nlMealLog.ts`, `mealDraft.ts`, `savedMeals.ts`, `nutritionHighProteinDays.ts` | Fuel pillar; goal→macros; train-day targets; NL + presets; photo draft |
| **Today primary CTA** | `todayPrimaryAction.ts`, `coach/loadCoachTodayOptional.ts` | Shared Just Go / journey primary for lean + dashboard |
| **Fuel Coach** | `fuelCoach/` subfolder | Adaptive meal plan — see [fuelCoach/INDEX.md](fuelCoach/INDEX.md) |
| **Payments** | `premiumServer.ts`, `premiumEnrollmentCache.ts`, `payments.ts`, `checkoutServer.ts`, `stripeServer.ts`, `stripeWebhook.ts`, `paypalWebhook.ts`, [`cryptoCheckout/`](cryptoCheckout/INDEX.md) | Stripe + Phantom USDC lifetime; enrollment Redis memo |
| **Payments — the pure decisions** | `checkout/checkoutParams.ts` (what Stripe is asked to charge), `premium/enrollmentRow.ts` (what a paid webhook writes), `authUserId.ts` (what may go in an `auth.users` FK) | `.262` — lifted out of the `server-only` modules above, which reach Stripe/Supabase on their first line and so could not be tested at all. Dependency-free on purpose; `money.routetest.ts` covers the server halves |
| **School / PFT** | `schoolClassServer.ts`, `presidentialFitness*.ts`, `fitnessTest*.ts` | America track |
| **Gating / auth** | `privateGate.ts`, `supabaseAuthCookies.ts`, `supabaseRequestAuth.ts` | Private beta, JWT cookies |
| **i18n loaders** | `routeMetadata.ts`, `navConfig.ts` | Not strings — see `src/i18n/` |
| **Units** | `units.ts` | `weightStep`, metric/imperial |
| **Backup** | `backup.ts` | Device backup export/restore |
| **What’s New** | `whatsNew.ts` | Build-label last-seen + curated athlete bullets (D13) |
| **Analytics** | `analytics.ts`, `analyticsOptOut.ts` | PostHog events; preference off until user allows |
| **Observability** | `sentryCommon.ts`, `api/withApiLogging.ts` | Sentry (env-gated) + API request logs |
| **Compliance** | `compliance/` | Vanta-lite control catalog probes — [docs/COMPLIANCE.md](../../docs/COMPLIANCE.md) |
| **Destructive UX** | `holdToConfirm.ts` | Hold-to-confirm helpers — [docs/DESTRUCTIVE_UX.md](../../docs/DESTRUCTIVE_UX.md) |
| **Leaderboard** | `leaderboard/` subfolder | Local + cloud leaderboard |

## Subfolders (one concern each)

| Folder | INDEX |
|--------|-------|
| `coach/` | [coach/INDEX.md](coach/INDEX.md) |
| `fuelCoach/` | [fuelCoach/INDEX.md](fuelCoach/INDEX.md) |
| `workout/` | Logger, merge, rest, PR, victory — [workout/INDEX.md](workout/INDEX.md) |
| `wearables/` | OAuth + hubs + BLE HR — [wearables/INDEX.md](wearables/INDEX.md) |
| `leaderboard/` | Leaderboard compute/sync helpers — [leaderboard/INDEX.md](leaderboard/INDEX.md) |
| `storage/` | **The only** direct localStorage access — [storage/INDEX.md](storage/INDEX.md) |
| `sync/` | Durable outbox for cloud writes — [sync/INDEX.md](sync/INDEX.md) |

## Convention: adding new domains

When a domain grows beyond **~5 related files**, create `src/lib/{domain}/` + `INDEX.md` (model: `coach/`).

## Related (not here)

- React hooks: `src/hooks/`
- Zustand store: `src/store/workoutStore.ts`
- Static catalogs: `src/data/INDEX.md`

## Do not open

- `coachPlan.ts` — **deleted**; use `coach/`
- Repo-wide grep for “coach” without reading [AGENTS.md](../../AGENTS.md) glossary first
