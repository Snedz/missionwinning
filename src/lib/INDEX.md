# src/lib/

> One concern: Pure business logic, scoring, sync, API helpers, and domain modules.

## Read order

1. [coach/INDEX.md](coach/INDEX.md) — if working on Mission Coach
2. Domain file for your task (table below)
3. Matching `*.test.ts` colocated with the module

## Domain map (root-level files)

| Domain | Key files | Notes |
|--------|-----------|-------|
| **Scoring / Today** | `score.ts`, `crossPillarCoach.ts`, `pillarScoreInputs.ts`, `readinessIndex.ts`, `exerciseMuscleMap.ts` | Readiness, Mission Score, coach insight |
| **Mission Rewards** | [`rewards/`](rewards/INDEX.md) | XP, ranks, badges from real logs — never gates logger |
| **Mission Identity** | [`identity/`](identity/INDEX.md) | Call sign, Athlete Card — social projection; Log↔Social via `domainBoundary.ts` |
| **Mission Server** | [`social/`](social/INDEX.md), `socialSync.ts` | Local-first Garage + signed-in persist via outbox |
| **Classification guard** | `classificationGuard.test.ts` | `.hermes/` + `ops/` never tracked |
| **Build / public stamp** | `buildInfo.ts`, `buildInfo.test.ts` | Internal `APP_BUILD_LABEL` vs athlete `Alpha 0.1.0` |
| **Mission Coach (daily)** | `coachDailyServer.ts` | LLM daily insight API — not weekly plan |
| **Mission Coach (weekly)** | `coach/` subfolder | Plan engine — see [coach/INDEX.md](coach/INDEX.md) |
| **Mission Coach (chat)** | `coachChatServer.ts`, `coach/agent/` | Premium chat — local RAG + ReAct; never vendor Collections — [coach/agent/INDEX.md](coach/agent/INDEX.md) |
| **Coach sync** | `coachSync.ts` | Cloud push for coach plan |
| **Durable sync** | `sync/outbox.ts` | Queue every cloud write — survives the tab closing |
| **Device storage** | `storage/safeStorage.ts` | Guarded localStorage — never throws |
| **Surface parking** | `surface.ts` | Which non-wedge surfaces are reachable (`NEXT_PUBLIC_SURFACES`) |
| **Journey** | `missionJourney.ts`, `journeySync.ts`, `journeyGoals.ts`, `journeyAnalytics.ts` | I-Day → Commissioned |
| **Workouts** | [`workout/`](workout/INDEX.md) subfolder (+ root re-exports); `justGoSession.ts`, `historyAnalytics.ts`, [`history/`](history/INDEX.md), `benchmarks.ts` | Logger helpers; Just Go; session list rows; rest/PR/superset/tempo; vs-last; Repeat last session (`.747`); honor saved routine (`.960`); optional RPE 1–10 cite (`.967`) |
| **Local-first copy** | `localFirstCopy.ts` | Today/Active F-001 EN constants — set-log + rest never framed as cloud-required |
| **First-set ungated** | `firstSetUngated.ts` | F-017 / `.766` + `.762` + `.941` + `.949` + `.958` + `.963` — `showHeaderSignInChip`. Hide Sign in until the first workout; never on `/active`. Guest `SIGNED_OUT` does not wipe the local log. Guest `SIGNED_IN` keeps it. Open session continues across signed-in surfaces. This-device leave/return is the same session. |
| **Nutrition / Fuel** | `macroTargets.ts`, `fuelGoalWizard.ts`, `fuelDayAdapt.ts`, `openFoodFacts.ts`, `nutritionQuickLog.ts`, `fuelRestock.ts`, `nlMealLog.ts`, `mealDraft.ts`, `savedMeals.ts`, `nutritionHighProteinDays.ts` | Fuel pillar; goal→macros; train-day targets; NL + presets; this week's restock they take (`.965`); photo draft |
| **Habit week count** | `habitWeekCount.ts` | Unique local Train days this week — [HABIT.md](../../docs/contracts/HABIT.md) |
| **Today primary CTA** | `todayPrimaryAction.ts`, `coach/loadCoachTodayOptional.ts`, `today/todayReturnCite.ts`, `today/quietWeekGlance.ts` | Shared Just Go / journey primary for lean + dashboard; last/next cite on Start (`.954`); quiet Mon–Sun diary glance (`.961`) |
| **Search catalog** | `searchCatalog.ts` | Filter More rooms by query; map Fuel/Coach/Train to Summary pin ids |
| **Fuel Coach** | `fuelCoach/` subfolder | Adaptive meal plan — see [fuelCoach/INDEX.md](fuelCoach/INDEX.md) |
| **Payments** | `premiumServer.ts`, `premiumEnrollmentCache.ts`, `payments.ts`, `checkoutServer.ts`, `stripeServer.ts`, `stripeWebhook.ts`, `paypalWebhook.ts`, [`cryptoCheckout/`](cryptoCheckout/INDEX.md) | Stripe + Phantom USDC lifetime; enrollment Redis memo |
| **Payments — the pure decisions** | `checkout/checkoutParams.ts` (what Stripe is asked to charge), `premium/enrollmentRow.ts` (what a paid webhook writes), `authUserId.ts` (what may go in an `auth.users` FK) | `.262` — lifted out of the `server-only` modules above, which reach Stripe/Supabase on their first line and so could not be tested at all. Dependency-free on purpose; `money.routetest.ts` covers the server halves |
| **School / PFT** | `schoolClassServer.ts`, `pftResultServer.ts`, `pftResultRow.ts`, `pftSync.ts`, `presidentialFitness*.ts`, `fitnessTest*.ts` | America track; PFT cloud write is `/api/pft/results` |
| **Leaderboard persist** | `leaderboardSync.ts`, `leaderboardSnapshotServer.ts`, `leaderboard/` | Cloud write is `/api/leaderboard/snapshot`; client cannot upsert scores |
| **Gating / auth** | `privateGate.ts`, `privateSession.ts`, `privateModeFlag.ts`, `homeSurface.ts`, `pwaStartUrl.ts`, `supabaseAuthCookies.ts`, `supabaseRequestAuth.ts` | Private beta, HMAC cookie, JWT cookies; `/` after Done is cookie → `.696` homepage (`homeSurface.ts`); PWA `start_url` follows the same gate predicate as Serwist |
| **Gated www honesty** | `gatedWwwHonesty.ts` | F-008 / old `.698` — EN Free / Enter with code / Get notified on the gated door. Public line: Log a set. Offline. Support: No account. No wearable. Build `.938` on `#776` door strings after `#774` took `.934`. |
| **Launch env profiles** | `checkEnvLaunch.test.ts` | H0 vs H1 `evaluateCheckEnv` — implementation in `scripts/check-env.mjs`. FREE_BETA on → Stripe not H0-required; postal is. |
| **Service territory** | `legal/supportedRegions.ts`, `legal/territoryAccessClient.ts`, `legal/waitlistTerritory.ts`, `legal/blockedSignup.ts` | The block list is the contract. Vercel allow is `x-vercel-ip-country` only. Blocked signup may reap a new empty account |
| **First paint** | `firstPaintFloor.test.ts`, `gatedWwwCraft.test.ts`, `unlockWaitlistHonesty.test.ts`, `adjustSessionHonesty.test.ts`, `coachChatPlaceholderHonesty.test.ts`, `talkRetryHonesty.test.ts`, `parqDoorHonesty.test.ts`, `todayCoachPinHonesty.test.ts`, `trainEmptyStartHonesty.test.ts`, `journalEmptyHonesty.test.ts`, `libraryAddHonesty.test.ts` | No raw keys, no textless public fallback, no copy that changes after hydration; gated door is the tight lock (hero + notify + Enter with code) |
| **i18n loaders** | `routeMetadata.ts`, `navConfig.ts` | Not strings — see `src/i18n/` |
| **Units** | `units.ts` | `weightStep`, metric/imperial |
| **Plates** | `plateCalculator.ts` | Greedy bar load; set-row both-sides breakdown (`.948`) |
| **Backup** | `backup.ts` | Device backup export/restore |
| **What’s New** | `whatsNew.ts` | Build-label last-seen + curated athlete bullets (D13) |
| **Analytics** | `analytics.ts`, `analyticsOptOut.ts` | PostHog events; preference off until user allows |
| **Observability** | `sentryCommon.ts`, `api/withApiLogging.ts` | Sentry (env-gated) + API request logs |
| **Feedback triage** | `feedbackTriage.ts`, `feedbackNote.ts`, `feedbackServer.ts`, `feedbackSource.ts` | Classify tester notes; founder dest (craft/voice/park/done); no Grok |
| **Compliance** | `compliance/`, `privacyInstill.test.ts` | Vanta-lite catalog probes + Phase 3 instill — [docs/COMPLIANCE.md](../../docs/COMPLIANCE.md) |
| **Destructive UX** | `holdToConfirm.ts` | Hold-to-confirm helpers — [docs/DESTRUCTIVE_UX.md](../../docs/DESTRUCTIVE_UX.md) |
| **Leaderboard** | `leaderboard/` subfolder | Local + cloud leaderboard |

## Subfolders (one concern each)

| Folder | INDEX |
|--------|-------|
| `coach/` | [coach/INDEX.md](coach/INDEX.md) |
| `builder/` | Blank first; templates in Show all — [builder/INDEX.md](builder/INDEX.md) |
| `history/` | Session list + month grid — [history/INDEX.md](history/INDEX.md) |
| `identity/` | Athlete identity — [identity/INDEX.md](identity/INDEX.md) |
| `fuelCoach/` | [fuelCoach/INDEX.md](fuelCoach/INDEX.md) |
| `workout/` | Logger, merge, rest, PR, victory — [workout/INDEX.md](workout/INDEX.md) |
| `wearables/` | OAuth + hubs + BLE HR — [wearables/INDEX.md](wearables/INDEX.md) |
| `leaderboard/` | Leaderboard compute/sync helpers — [leaderboard/INDEX.md](leaderboard/INDEX.md) |
| `speech/` | On-device speak + listen + live talk session — [speech/INDEX.md](speech/INDEX.md) |
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
