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
| **Workouts** | [`workout/`](workout/INDEX.md) subfolder (+ root re-exports); `justGoSession.ts`, `historyAnalytics.ts`, [`history/`](history/INDEX.md), `benchmarks.ts` | Logger helpers; Just Go; session list rows; rest/PR/superset/tempo; vs-last; Repeat last session (`.747`); honor saved routine (`.960`); optional RPE 1–10 cite (`.967`); free set tags (`.970`); thin-history honesty (`.971`); in-set cues (`.973`); optional % of known 1RM (`.981`); private session notes (`.982` / stamp `.983`); free warmup batch from working weight (`.984` / stamp `.985`); drop-set rest-zero (`.986`); optional EMOM / AMRAP work clock (`.988` / title `.987`); named custom on the live picker (`.990` / stamp `.992`); Start this again from a finished log (`.991`); this-movement history from the open lift (`.993`); open set-row type weight / BW / duration / assisted (`.994`); per-exercise rest warmup vs work (`.995`); their exercise note + pinned reminder on the open lift (`.996`); edit a finished session from History (`.997`); live-session reorder (`.998`); quiet diary PR on the live set (`.999`); backfill a past session from History (`.1000`); pause the live session clock (`.1001`); merge duplicate exercises (`.1002`); delete this finished session from History (`.1003`); restore a deleted session (`.1006`); hide this exercise from the library (`.1004`); start history from this date (`.1005`); name this finished session (`.1007`); find a past session (`.1008`); export this diary (`.1011`); this-movement title is the date or the name (`.1012`); import that file back (`.1013`); next cite is 0:45, not mute (`.1014`); next cite is BW, not 0 kg, on assisted 0 (`.1015`); this session as a file they own (`.1016`); last cite is BW, not 0, on empty load (`.1017`); month they own (`.1018`) |
| **Local-first copy** | `localFirstCopy.ts` | Today/Active F-001 EN constants — set-log + rest never framed as cloud-required |
| **First-set ungated** | `firstSetUngated.ts` | F-017 / `.766` + `.762` + `.941` + `.949` + `.958` + `.963` + `.967` + `.970` + `.971` + `.973` + `.974` + `.976` + `.977` + `.978` + `.980` + `.981` + `.983` + `.985` + `.986` + `.988` + `.989` + `.990` + `.991` + `.992` + `.993` + `.994` + `.995` + `.996` + `.997` + `.998` + `.999` + `.1000` + `.1001` + `.1002` + `.1003` + `.1004` + `.1005` + `.1006` + `.1007` + `.1008` + `.1009` + `.1010` + `.1011` + `.1012` + `.1013` + `.1014` + `.1015` + `.1016` + `.1017` + `.1018` — `showHeaderSignInChip`. Hide Sign in until the first workout; never on `/active`. Guest `SIGNED_OUT` does not wipe the local log. Guest `SIGNED_IN` keeps it. Open session continues across signed-in surfaces. This-device leave/return is the same session. Thin diary stays a notebook. In-set cues never a login wall. Quiet Track never a login wall. Week-strip quiet row never a login wall. Quiet Learn never a login wall. Optional superset group never a login wall. Optional % of a known 1-rep max never a login wall. Private session notes never a login wall. Free warmup batch never a login wall. Drop-set rest-zero never a login wall. Optional EMOM / AMRAP work clock never a login wall. Quiet Track last-vs-this on the week strip never a login wall. Named custom on the live picker never a login wall. Start this again from the receipt / History never a login wall. This-movement history from the open lift never a login wall. Open set-row type never a login wall. Per-exercise rest (warmup vs work) never a login wall. Their exercise note + pinned reminder never a login wall. Edit a finished session from History never a login wall. Live-session reorder never a login wall. Quiet diary PR on the live set never a login wall. Backfill a past session from History never a login wall. Pause the live session clock never a login wall. Merge duplicate exercises never a login wall. Delete this finished session from History never a login wall. Hide this exercise from the library never a login wall. Start history from this date never a login wall. Restore a deleted session never a login wall. Name this finished session never a login wall. Search the History list never a login wall. Live next cite is BW, not 0 kg never a login wall. Library spark/count skip tombs never a login wall. Export this diary from History never a login wall. This-movement title is the date or the name never a login wall. Import that file back never a login wall. Live next cite is 0:45, not mute never a login wall. Assisted 0 cite is BW never a login wall. This session as a local file they own never a login wall. Live Last/Prev empty load is BW never a login wall. The History month they own never a login wall. |
| **Quiet Learn** | `quietLearn.ts` | One free first-success intro from existing `sb-0` (`.978`). Empty invents nothing. Off Today. |
| **Nutrition / Fuel** | `macroTargets.ts`, `fuelGoalWizard.ts`, `fuelDayAdapt.ts`, `openFoodFacts.ts`, `nutritionQuickLog.ts`, `fuelRestock.ts`, `nlMealLog.ts`, `mealDraft.ts`, `savedMeals.ts`, `nutritionHighProteinDays.ts` | Fuel pillar; goal→macros; train-day targets; NL + presets; this week's restock they take (`.965`); photo draft |
| **Move** | [`move/`](move/INDEX.md) | Mobility filters + Victory seam + quiet rest-day walk / easy log (`.969` / `.974`) |
| **Quiet Track** | `quietTrack.ts`, `bodyMetrics.ts` | Scale / tape snapshot (`.975` / `.976`); empty invents nothing; measurements stay free |
| **Habit week count** | `habitWeekCount.ts` | Unique local Train days this week — [HABIT.md](../../docs/contracts/HABIT.md) |
| **Today primary CTA** | `todayPrimaryAction.ts`, `coach/loadCoachTodayOptional.ts`, `today/todayReturnCite.ts`, `today/quietWeekGlance.ts`, `today/quietWeekRow.ts`, `today/quietWeekTrackTrend.ts` | Shared Just Go / journey primary for lean + dashboard; last/next cite on Start (`.954`); quiet Mon–Sun diary glance (`.961`); thin flag when 1–2 sessions (`.971`); empty rest-day quiet Fuel / Move / Track row (`.977`); muted last-vs-this on a Track strip day (`.989`) |
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
| `move/` | Quiet rest-day log + mobility filters — [move/INDEX.md](move/INDEX.md) |
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
