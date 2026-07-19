# Mission Winning — Development Log

Chronological record of shipped work. Newest first.

---

## 2026-07-19 — Wave 10 B1: launch unblock packaging (`2026.07-unified.90`)

- LAUNCH_RUNBOOK §2: full migration list through 20260720, digest/cron/PostHog/VAPID env, smoke commands
- Digest + beta panel: PostHog I-Day step funnel reminder (client events)
- LIGHTHOUSE_BASELINE: real page-chunk gz sizes (`/`, `/log`, `/active`, `/builder`, `/coach`)
- Residual recovery UX: pro templates load error + offline copy on fuel search/barcode

---

## 2026-07-19 — Wave 9: consolidation & polish (`2026.07-unified.89`)

- Dead weight: 11 workout shims → `@/lib/workout/*`; delete MetricRing/ScoreRing/src/locales; drop `@phantom/browser-sdk`
- Form Q&A: Active “Ask about form” → `/coach?ask=`; catalog ensure + prefill; grounded analytics
- UX: `app/(app)/loading.tsx`; ErrorState on leaderboard + coach voice; TodayQuickLinks semantic colors
- Bundle analyzer (`ANALYZE=1`) + `docs/LIGHTHOUSE_BASELINE.md`
- i18n Batch D landing/growth/bundle (hi/id/th/zh/vi/ar) + `npm run i18n:batchd-parity`
- Docs: archive launch plans → `docs/archive/`; LAUNCH_RUNBOOK is canonical survivor

---

## 2026-07-19 — Wave 8: Growth mechanics + quality/i18n (`2026.07-unified.88`)

- Referral: migration + protect trigger, `/api/referral`, `?ref=` attribution backfill, redeem on sign-in, Profile invite card (recognition 3/10/25 only)
- Tracked share: victory + mission/PFT/class analytics; share URLs with ref/utm
- Weekly founder digest cron + `mw_week4_retention` RPC + compose unit test
- a11y Playwright suite (`@a11y`, excluded from e2e:critical); experience + growth e2e
- i18n: growthLocales; landing Batch C it/ru/ko/ja; DE/FR/PT conversion depth; bundle Batch C langs

---

## 2026-07-19 — Wave 7: AI Coach depth + retention instrumentation (`2026.07-unified.87`)

- **C** I-Day funnel: `iday_mission_accepted`, `iday_profile_completed` (+ SEO_ANALYTICS steps)
- **E** Unified `streaks.ts` + `StreakChip` on Today headers
- **A** Free offline adjust today (`adjust.ts`, sheet, no premium gate)
- **B** Premium coach chat API + panel (ZDR client, no rules fallback; free locked teaser)
- **D** Web push dark: migration `push_subscriptions`, VAPID env, SW handlers, cron + email; Profile device toggle
- e2e `coach-adjust.spec.ts`; events: `coach_session_adjusted`, `coach_chat_*`, `push_subscribed`

---

## 2026-07-16 — SpaceXAI/xAI Zero Data Retention (ZDR) for optional coach LLM (`2026.07-unified.86`)

- Shared `coachLlmClient`: stateless chat completions only; reads `x-zero-data-retention`; `COACH_LLM_REQUIRE_ZDR` fail-closed
- Prefer SpaceXAI/xAI env defaults; ops checklist in ENV.md + SECURITY.md (Console team ZDR)
- Privacy: optional AI coach section + collect/third-parties honesty (no full-stack ZDR claim)
- README trust row; coach INDEX guardrails (no Files/Batch/stateful Responses)

---

## 2026-07-16 — Wave 6 Mission Experience `/experience` (`2026.07-unified.85`)

**Founder Horizon-0 override:** new frontier dossier route (not app chrome).

- `/experience` static spine: 8 chapters, real mission/pillar/pricing copy, chapter rail + progress
- `gpuTier` WebGPU→WebGL2→static (+ tests); hero WebGPU/WebGL2 aurora canvas (idle mount)
- Win Score demo 68→87 + PR (DOM); WGSL compute / WebGL2 TF particles when tier allows
- Capability matrix live feature detect; commission CTA View Transition when supported
- Route-scoped Inter variable + `experience.css` (`.xp-*`); no global index.css changes
- Sitemap, footer Product link, landing quiet link, e2e-smoke route

---

## 2026-07-16 — Wave 5 content depth & honesty (`2026.07-unified.84`)

- Exercise public depth: steps/mistakes defaults + enrichment; HowTo JSON-LD steps; template usage index
- Honesty: mind 22, move 18, free recipes 20, premium recipes 102; `contentInventory.test.ts`
- Compare: +6 stories + long-form body; sitemap derived from COMPARE_STORIES
- Learn lesson bodies; fuel meal plan structured meals; program curriculum outlines on /programs

---

## 2026-07-16 — Wave 4 in-app design elevation (`2026.07-unified.83`)

- Base `Card` → `rounded-2xl`; ProgressRing drop amber/blue; WeekStrip brass/status + lucide
- Remove `dashboard-panel`; Today scorecard elevated+emerald glow; Active timer live glow
- Superset → status-info (no purple); premium locked teasers brass glow
- AppHeader display wordmark + seam; Sidebar emerald rail; PillarPageHeader briefing-rule
- DESIGN_SYSTEM card tier ladder; ROADMAP v4 Phase 1 partial checkoff

---

## 2026-07-16 — Wave 3 launch verification (`2026.07-unified.82`)

- `npm run growth-smoke` — leads source, unsub bad token, welcome 401, /guide public
- Beta panel: lead `package_interest` top sources from service role
- LAUNCH_READY: full migration SQL + verify query + ordered flip sequence
- PUBLIC_FLIP + SEO_ANALYTICS funnel checklist; ORCHESTRATION/VISION/PLAN truth-up

---

## 2026-07-16 — Marketing & growth Wave 2 (`2026.07-unified.81`)

- Fix lead source bug (`source` → `package_interest`); utm/referrer schema + migration
- emailServer, waitlist confirm, leads unsubscribe, welcome email, launch-broadcast script
- Landing EmailCaptureBand; first-touch attribution + PostHog super-props; `class_joined`
- SEO: publicPageMetadata canonicals/OG, JSON-LD, per-route OG (bundle/guide/compare)
- Conversion i18n ES/PT/DE/FR; LAUNCH_READY.md; SOCIAL_LAUNCH §6 fix

---

## 2026-07-16 — Marketing elevation redesign (`2026.07-unified.80`)

- Design language: hero-field, textures, card-elevated/glow, section seams, reveal/ticker
- MarketingNav/Footer, StatBand, BundleTeaserCard, useScrollReveal
- Landing rebuild (bento pillars, sticky journey rail, art in `public/art/`)
- Bundle/Welcome/Compare + PublicSeo chrome polish; OG gradient aligned
- DESIGN_SYSTEM.md marketing section; payments logic untouched

---

## 2026-07-16 — Privacy default + OSS trust (`2026.07-unified.79`)

- Product analytics **off until allow** (`analyticsOptOut.ts`); banner + Profile privacy card
- Privacy policy: local-first section, choices for analytics control
- Open source prep: AGPL-3.0 `LICENSE`, `ACCEPTABLE_USE.md` (illegal deepfakes/CSAM/fraud ban), `SECURITY.md`
- README trust section; `package.json` license field; CONTRIBUTING license/AUP note

---

## 2026-07-16 — API abuse hardening A2 (`2026.07-unified.78`)

- Rate limits: journey/nudge, school class create, unsubscribe
- Zod: youth consent-notify, journey nudge body
- Coach/fuel cost routes: Content-Length body caps via `requestBodyLimit`
- Inventory matrix updated in `app/api/INDEX.md`

---

## 2026-07-16 — Security red-team agent track S1 (`2026.07-unified.77`)

- Full API auth/rate inventory in `app/api/INDEX.md`
- `docs/SECURITY_AUDIT_TRIAGE.md` — npm high CVEs (Phantom/Solana accepted)
- Crypto confirm signature guards + INDEX security properties
- `gate-smoke` / `security-smoke` Wave 1: cron, beta metrics, crypto unauth
- OWASP residual risks refresh

---

## 2026-07-16 — Hygiene + public-flip checklist (`2026.07-unified.76`)

- Build label → `2026.07-unified.76`
- VISION_STATUS / PLAN / ORCHESTRATION: H1 eng prep done; founder H0 is bottleneck
- New [docs/archive/PUBLIC_FLIP_CHECKLIST.md](docs/archive/PUBLIC_FLIP_CHECKLIST.md) — offline, SW, Search Console, analytics baseline after `PRIVATE_MODE=false`

---

## 2026-07-16 — `src/lib/workout/` domain folder (`2026.07-unified.75`)

- Moved logger/merge/rest/PR/victory/pulse helpers into `src/lib/workout/` + INDEX
- Root `@/lib/*` paths re-export for compatibility
- ORCHESTRATION / PLAN / VISION_STATUS mark H1 eng prep largely complete

---

## 2026-07-16 — Today dashboard extract (shared Just Go + accordion) (`2026.07-unified.74`)

- `todayPrimaryAction` + `loadCoachTodayOptional` shared by lean + full Today
- `nutritionHighProteinDays` pure helper (+ tests)
- `TodayDashboardAccordion` code-split section block
- HomeTodayDashboard ~807 → ~633 lines

---

## 2026-07-16 — Logger E2E picker → log → rest (`2026.07-unified.73`)

- `tests/e2e/logger-depth.spec.ts`: empty start, search/add Push-ups, Log, rest timer Skip, Finish
- Add-exercise control gets `aria-label` “Add selected exercise”
- `src/lib/INDEX.md` documents full workout helper map

---

## 2026-07-16 — ActiveWorkout extract + logger E2E depth (`2026.07-unified.72`)

- `activeWorkoutHelpers` (+ unit tests): next set, last session, set stats
- `ActiveEmptyState` + `ActiveSessionChrome` pulled out of page shell
- ActiveWorkoutPage ~548 → ~438 lines; handlers stay on page
- E2E: empty start → finish-without-sets toast → cancel (`hero-flows.spec.ts`)

---

## 2026-07-16 — Exercise hubs RSC + sync conflict tests (`2026.07-unified.71`)

- Muscle + equipment public hubs are Server Components (no client catalog hydration)
- Expanded `workoutMerge` conflict cases (volume fingerprint, cap 200, empty sides, cloud-vs-cloud)
- Expanded `journeySync` merge cases (readiness OR, commutativity of phase/milestones)

---

## 2026-07-16 — Exercise detail RSC; all Lighthouse routes ≥90 (`2026.07-unified.70`)

- `ExercisePublicPage` is a Server Component (catalog/form guides/SEO off client)
- Tiny `ExercisePageBeacon` for view analytics only; CTA is a plain Link
- Lighthouse mobile: `/` **92**, `/log` **91**, guide **91**, `/exercises/squats` **92** — all ≥90

---

## 2026-07-16 — Mobile paint cuts; `/log` Lighthouse ≥90 (`2026.07-unified.69`)

- Drop `background-attachment: fixed` + dual gradients; solid mobile `glass-nav` (blur md+)
- DeferredToaster (Radix toast after idle); offline banner dynamic after idle
- PageTransition animates client nav only; Inter drops weight 500
- Lighthouse mobile: `/log` **90** (stable ×3), `/` **92**, guide **91**, exercises **~87**

---

## 2026-07-16 — Slim app chrome: primary nav split + deferred Today graph (`2026.07-unified.68`)

- `primaryNav` (5 icons) for MobileNav/Sidebar; extended Lucide menu loads only when header opens
- `pageTitles` for AppHeader titles without icon graph
- TodayPageHeader drops shadcn Button; lean Today defers score/readiness/analytics
- Lighthouse mobile: `/` **92**, guide **93**, `/log` **81**, exercises **~89**

---

## 2026-07-15 — Cut supabase from shell / journey cold path (`2026.07-unified.67`)

- `pillarLog.getPillarWins` no longer static-imports supabase (cloud only on `logPillarWin`)
- `missionJourney` drops challenges + guidebook catalog imports (lite streak + progress count)
- Root `I18nPwaProvider` dynamic-imports supabase for idle auth listener
- Route/global error boundaries dynamic-import Sentry
- Lighthouse mobile: `/` **91**, guide **91**, exercises **90**, `/log` **~79–80** (still shell-bound)

---

## 2026-07-15 — Nav pulse + lean Today without workoutStore (`2026.07-unified.66`)

- `activeWorkoutPulse` + `useActiveWorkoutPulse`: MobileNav/Sidebar no longer import `workoutStore`
- Store syncs flag on start/cancel/complete (incl. empty complete) and on persist rehydrate
- `workoutPersistLite` + HomeTodayLean: history/streak/journey from localStorage; `startWorkout` dynamic-import
- HomePage phase gate is localStorage-only (no `useMissionJourney` / store on basic cold path)
- Lighthouse mobile: `/` **90**, `/log` **~80–81**, guide **88–91** (run variance)

---

## 2026-07-15 — Decouple exercise catalog from workout store (`2026.07-unified.65`)

- `workoutStore` no longer imports `EXERCISES` — muscle groups snapshot on add/swap
- AppHeader uses lite journey phase (localStorage) instead of `useMissionJourney`
- HeaderAuthChip defers Supabase getUser to idle
- Lighthouse mobile: `/log` **~80–81**, `/` **~88–91**, guide **91**

---

## 2026-07-15 — App shell static + deferred PostHog (`2026.07-unified.64`)

- Removed `force-dynamic` from `app/(app)/layout` — app routes can static-shell
- PostHog dynamic-import + init after interaction/2.8s; auth listener idle-deferred
- Lighthouse mobile: `/` **91**, guide **91**, `/log` **81**, exercises **86**

---

## 2026-07-15 — i18n bootstrap + deferred hydrate (`2026.07-unified.63`)

- `src/i18n.ts` now boots minimal EN; full multi-lang `*Locales.ts` catalogs load via `hydrateI18nResources` after interaction/2.8s
- Display font weights trimmed (Barlow 700 only; mono 400 only)
- Lighthouse mobile: `/` **87**, `/log` still ~**78–80** (shell residual documented)

---

## 2026-07-15 — Today lean split + Lighthouse remeasure (`2026.07-unified.62`)

- `/log` code-split: `HomeTodayLean` (I-Day/Basic) vs dynamic `HomeTodayDashboard` (readiness+)
- Removed eager `useCoachPlan` from Today; coach session loaded on Just Go click only
- AppLayout: dynamic Sidebar/CommissioningCeremony; idle journey sync boot
- Lighthouse mobile (`PRIVATE_MODE=false`): `/` **87** (was 79), `/log` **~80** (was 78) — residual shell plan in [docs/LIGHTHOUSE_BASELINE.md](docs/LIGHTHOUSE_BASELINE.md)

---

## 2026-07-15 — Serwist PWA + landing idle demos (`2026.07-unified.61`)

- Replaced `next-pwa` with **Serwist** (`@serwist/next`, `app/sw.ts`); SW disabled while private gate on; client unregisters stale workers via `NEXT_PUBLIC_PWA_ENABLED`
- Landing below-fold demos idle-deferred for first paint
- Build verified: `PRIVATE_MODE=false` emits `public/sw.js` (gitignored)

---

## 2026-07-15 — Further improvement track B (`2026.07-unified.60`)

**Eng (Horizon 0–1 prep):** Today first-paint deferrals (dynamic journey/coach chrome; lazy justGo/trends/weekRecap); sync merge unit tests (`workoutMerge`, `journeySync`, `coachSync`); `ActiveExerciseCard` extract; doc next-task pointers.

**Still founder:** beta ≥10, Stripe/env, `PRIVATE_MODE=false`.

---

## 2026-07-14 — Long-term orchestration doc

**Shipped:** [ORCHESTRATION.md](ORCHESTRATION.md) — horizons 0–3, founder vs agent role split, kill criteria, 90-day calendar. Wired into [AGENTS.md](AGENTS.md), [INDEX.md](INDEX.md), [PLAN.md](PLAN.md), [VISION_STATUS.md](VISION_STATUS.md).

---

## 2026-07-14 — S-Tier waves 0–4 + selective rebuilds (`2026.07-unified.58`)

**Theme:** No greenfield rewrite — focus, first hour, polish, retention, honest money, fat-page decomp.

### Commits

1. Pricing single source ($11.99 / $59 / $149), journey-gated Basic nav, I-Day real Just Go preview, landing one CTA, victory one next action, ErrorState/Skeleton
2. Fuel sections + BuilderArrange extract; Today week recap + coach invite after first session
3. Design-token pass on page-components; ProfileBackupCard; LAUNCH_RUNBOOK Stripe monthly env
4. Bundle premium inventory chips; coach miss-day adapt copy; components token pass

### Still founder-owned (Horizon 0)

- Beta cohort ≥10, Vercel service role + live Stripe, `PRIVATE_MODE=false`

---

## 2026-07-11 — Capital sequence kits (social, LLC, soft launch, TWA)

**Docs only (founder executes):** [docs/SOCIAL_LAUNCH.md](docs/SOCIAL_LAUNCH.md), [docs/LLC_AND_PAYMENTS.md](docs/LLC_AND_PAYMENTS.md), [docs/archive/SOFT_LAUNCH_DAY.md](docs/archive/SOFT_LAUNCH_DAY.md), [docs/TWA_MOBILE_PLAYBOOK.md](docs/TWA_MOBILE_PLAYBOOK.md), expanded [BETA_INVITE.md](BETA_INVITE.md) + [docs/POST_LAUNCH_CADENCE.md](docs/POST_LAUNCH_CADENCE.md) week-4 SQL.

**Not done by agents (by design):** recruiting 10 users, forming LLC, filming, flipping `PRIVATE_MODE`, native apps.

---

## 2026-07-11 — Pre-launch quality bar + ops verify

**Docs:** [PRE_LAUNCH_PLAN.md](docs/archive/PRE_LAUNCH_PLAN.md), [docs/archive/BETA_LAUNCH_OPS.md](docs/archive/BETA_LAUNCH_OPS.md)  
**Build:** `2026.07-unified.54`

### Shipped

- Hero E2E: workout complete → Mission Score (`seedReadinessPhase` + Learn sample path)
- **Bugfix:** Victory sheet now renders after Finish (was lost when `activeWorkout` cleared)
- Photo log: error phase + retry instead of silent reset; OFF lookup failure hint
- EmptyState on Coach (no plan), Move (no wins), Learn (no search matches), Leaderboard (class/squad hints)
- Leaderboard class rows bugfix (was clearing successful fetches)
- Profile nudge: `alert` → toast; Fuel/Move/Mind premium fetch failures toast + offline hint
- Ops: Vercel Production verified connected; all 12 Supabase migrations verified; PRE_LAUNCH + BETA_LAUNCH_OPS + BETA_INVITE refreshed
- Lighthouse re-snapshot (2026-07-11): `/log` still 78 — recorded in [docs/LIGHTHOUSE_BASELINE.md](docs/LIGHTHOUSE_BASELINE.md)
- Post-launch cadence doc: [docs/POST_LAUNCH_CADENCE.md](docs/POST_LAUNCH_CADENCE.md)

### Founder still owns

- Stripe payment links + webhook secret on Vercel
- Confirm `SUPABASE_SERVICE_ROLE_KEY` on Vercel Production
- Recruit ≥10 beta users (prod profiles = 0) before `PRIVATE_MODE=false`

### Operating cadence (Phase 4)

After public: wall metric = week-4 retained weekly loggers; weekly 1h user calls; no new pillars until retention holds ([STRATEGY.md](STRATEGY.md), [LAUNCH_RUNBOOK.md](LAUNCH_RUNBOOK.md) §6).

---

## 2026-07-10 — Wave 5 Integrity + density

**Docs:** [docs/DESIGN_RESEARCH.md](docs/DESIGN_RESEARCH.md) § Wave 5  
**Build:** `2026.07-unified.53`

### Shipped

- Integrity: Library alt opens exercise; Mind EmptyState CTA; public practice → welcome/exercises; path CTA copy; footer `/paths`; e2e public CTA smoke
- Density: Builder program accordion + template search + ExercisePicker; History search/range + trends accordion; Fuel meal/recipe collapse
- Search/UI: Library filter sheet; Learn default-collapsed + search; Move/Mind premium collapse

---

## 2026-07-10 — Wave 4 Inspire + volume

**Docs:** [docs/DESIGN_RESEARCH.md](docs/DESIGN_RESEARCH.md) § Wave 4  
**Build:** `2026.07-unified.52`

### Shipped

- SEO: exercise/guide link mesh; top-50 public enrichment; muscle/equipment hubs; `/paths` Learn teasers; Compare Forge/Freeletics/spreadsheet stories
- Marketing: Welcome cinematic briefing; Bundle six-pillar story before checkout; Landing library line; Compare proof mesh
- Product: Library volume sparkline; History mission-story header; Today score-tick; Builder template chips; EmptyState CTAs

---

## 2026-07-10 — Wave 3 Forge Fitness steals

**Docs:** [docs/DESIGN_RESEARCH.md](docs/DESIGN_RESEARCH.md) § Wave 3  
**Build:** `2026.07-unified.51`

### Shipped

- Research: Forge Just Go / progression / meal density steal sheet
- **Just Go** rule-based session from readiness (+ coach today when present) — free, no API key
- Train: auto-seed next-set targets; brass PR chip + haptic
- Today: muscle freshness strip above JourneyHero
- Fuel: cal-left + macro bars + saved meal presets
- Victory progression insight; Landing/Compare “no AI key” proof

---

## 2026-07-10 — Wave 2 UI + feature steals

**Docs:** [docs/DESIGN_RESEARCH.md](docs/DESIGN_RESEARCH.md) § Wave 2  
**Build:** `2026.07-unified.50`

### Shipped

- Research: RepStack, IntervalCoach, 0xCal, Bevel, Freeletics SB, CrossFit/WOD steal sheet
- Today: one boss CTA (JourneyHero); insight + rings as glance; secondary strips below fold
- Train: emerald completed-row wash; rest clock pill; **next-set targets** + Apply (free)
- Fuel: densified above-fold + NL meal quick log; ProgressRing migration
- Landing: 4-bullet free manifest + proof chip; Bundle one-app vs multi-app louder
- Victory: body-score delta strip (readiness / strain / recovery)

---

## 2026-07-10 — UI research + system refresh + rebuild

**Docs:** [docs/DESIGN_RESEARCH.md](docs/DESIGN_RESEARCH.md), [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md)  
**Build:** `2026.07-unified.49`

### Shipped

- Competitive research brief (Hevy/Strong, WHOOP/Bevel, Freeletics, wellness CRO, Linear)
- Design system: status tokens, unified `ProgressRing`, briefing `PillarPageHeader`, `.score-tick`
- P0: Landing tracker-led hero; Welcome briefing flow; Today command header; MobileNav active bar
- Active EmptyState + brass PR; Bundle/Compare out of AppLayout with marketing chrome
- PublicSeoHeader on Guide/Exercises/Compare; Coach on PillarPageShell; eyebrow cascade on pillars
- `/compare` + `/bundle` public while gated

---

## 2026-07-09 — Next wave: launch scripts, de i18n, /log slim readiness, form media

**Docs:** [VISION_STATUS.md](VISION_STATUS.md), [PLAN.md](PLAN.md)  
**Build:** `2026.07-unified.48`

### Shipped

- Doc sync: Mind/Move/Learn/I5 done; I4 = fr done, **de** body shipped (Today/Welcome/Coach/Fuel/Active)
- Launch scripts: `check-env` CRON/UPSTASH/lifetime Stripe; gate-smoke unlocked `/log` + build label + PWA icons; full 12-migration list; `LAUNCH_STRICT` → `predeploy`
- Slim readiness: `readinessIndex` + `exerciseMuscleMap`; persist `muscleGroups` on finish; HomePage above-fold avoids sync catalog
- Form media: `mediaUrl`/`mediaType` + `getFormGuideOrCues`; 15 SVGs under `public/form-guides/`

**Founder parallel:** [LAUNCH_RUNBOOK.md](LAUNCH_RUNBOOK.md) — agents do not flip `PRIVATE_MODE`.

---

## 2026-07-09 — Launch ops docs + Learn/I5 + quality

**Build:** `2026.07-unified.47`

### Shipped

- **Track A:** BETA_LAUNCH_OPS migration list + TRACK_D day-of go-public commands
- **Learn:** 16 premium guidebook sections; guidebook index → `/learn/course?chapter=`; locked-preview counts
- **I5:** Victory Move/Learn CTAs; guided Learn CTA; CourseReader Fuel/Move; Learn in `applyCrossPillarCoachRules` (`/learn`)
- **`/log`:** dynamic QuickLinks/customize; deferred challenges/pillarStats/crossPillarCoach
- **Photo log:** Open Food Facts match list after estimate; PhotoLogStub lazy on Fuel photo tab

**Next:** Founder [LAUNCH_RUNBOOK.md](LAUNCH_RUNBOOK.md) → public flip when beta gates pass.

---

## 2026-07-09 — Resume plan: status sync + Phase I depth

**Docs:** [PLAN.md](PLAN.md), [VISION_STATUS.md](VISION_STATUS.md)  
**Build:** `2026.07-unified.46`

### Already on master (July, previously under-logged)

- **Roadmap v4** — in-app polish, landing demos, public `/guide` + `/exercises` SEO (PR #73)
- **Roadmap v5** — Stripe UX, Coach locked state, Track GPS premium, cross-pillar chips, es i18n body wave
- **Mission Coach** — weekly plan engine + free taster + premium regen (`src/lib/coach/`)
- **Fuel Coach** — adaptive meal plans synced to macros / training load (`src/lib/fuelCoach/`)
- **Guided Mind/Move** — text timed player + Learn course reader
- **Launch package** — PWA manifest/SW, security migrations, offline fallback, retention nudges

### This pass

- Build label bump; PLAN / VISION / PROTECTION / LOG aligned with reality
- Mind: +5 premium timed sessions (17 total); Move: +3 premium flows (11 total)
- Coach locked-state + fatigue clarity; French body pass (Today/Fuel/Active/Welcome/Coach)
- `/log` accordion dynamic imports + memoized scores; post-session Fuel/Mind CTAs
- Founder ops: local `launch-verify` run; remaining boxes in [docs/archive/BETA_LAUNCH_OPS.md](docs/archive/BETA_LAUNCH_OPS.md)
- Fix: `adaptPlan` honors `today` arg (tests were calendar-flaky); build label `2026.07-unified.46`

**Next:** Founder [LAUNCH_RUNBOOK.md](LAUNCH_RUNBOOK.md) → public flip when beta gates pass.

---

## 2026-06-29 — Vision plan refresh + Phase G (PFT / America G1–G8)

**Docs:** [VISION_STATUS.md](VISION_STATUS.md), [PLAN.md](PLAN.md) Phase G/H/I  
**Build:** `2025.06-unified.45`

### Shipped (PFT track — PRs #52–#59)

- **G1–G2:** Presidential Fitness Test, `/america`, school classes, youth gate, cloud sync
- **G3–G4:** Teacher dashboard, PFT leaderboard board, teacher PIN, verified youth consent
- **G5–G6:** Youth consent server sync, class scope leaderboard, creator auth, exports
- **G7–G8:** Hashed teacher PINs, council i18n, HTML report export, PFT gate-smoke

### Vision comparison (summary)

| Area | Status |
|------|--------|
| Free core (train, fuel, pillars) | 🟢 Strong |
| Journey + unified UI | 🟢 Shipped |
| Super Bundle / premium depth | 🔴 UI + placeholders |
| AI Coach as premium product | 🟡 Partial (free insight today) |
| PWA offline | 🔴 Blocked until public launch |
| Global i18n body copy | 🟡 Nav chrome only |

**Next:** Phase **H** (launch gates) → Phase **I** (live payments, AI Coach, i18n body). Full scorecard: [VISION_STATUS.md](VISION_STATUS.md).

---

## 2026-06-29 — GT7-style global leaderboard

**Branch:** `cursor/leaderboard-gt7-699d`

### Shipped

- **`/leaderboard`** — Global, Regional, National, Local, Friends scopes
- **Boards:** Mission Score, Training Streak, Weekly Volume, Fuel Days
- Demo operator population + cloud sync via `leaderboard_snapshots`
- Call sign editor, GT7-style rank table with medals
- More tools nav + Today wins card link

### Supabase (when ready)

Run `supabase/migrations/20250629_leaderboard.sql`

### Leaderboard boards (6)

Mission Score · Training Streak · Weekly Volume · Fuel Days · **Under the Stars** (22:00–05:00) · **By Dawn's Early Light** (05:00–08:00)

---

## 2026-06-29 — Phase F4: Beta funnel, legal pages, launch gate

**Branch:** `cursor/f4-beta-launch-699d`

### Shipped

- **`/privacy` + `/terms`** — linked from About (PROTECTION P0 legal)
- **`/api/beta/metrics`** — aggregate funnel across all profiles (service role)
- **BetaAdminPanel** on Profile for `BETA_ADMIN_EMAILS` — launch readiness vs targets
- **`20250629_complete_base_schema.sql`** — idempotent migration for fresh/partial Supabase setups

### Vercel env to enable founder dashboard

- `SUPABASE_SERVICE_ROLE_KEY`
- `BETA_ADMIN_EMAILS=your@email.com`

---

## 2026-06-29 — Phase F3b: Journey analytics, email nudge, copy pass

**Branch:** `cursor/f3-analytics-nudge-699d`

### Shipped

- **Journey analytics** — `journey_phase_complete`, milestone events, local log + Supabase `journey_events`
- **Beta funnel card** on Profile — phase, BT progress, event counts vs targets
- **Email nudge** — `/api/journey/nudge` via Resend when signed in (optional `RESEND_API_KEY`)
- **Copy pass** — Dashboard → Today, Mission Setup → First-time setup / Your profile

---

## 2026-06-29 — Phase F3: Journey cloud sync + Japanese

**Branch:** `cursor/f3-journey-sync-699d`

### Shipped

- **Supabase journey sync** — merge on sign-in, debounced push for journey + prefs
- **Japanese (ja)** Tier-1 locale
- **Edit journey profile** — `/welcome?edit=1` + Profile card

---

## 2026-06-29 — Phase F2b–G2: Commissioning, i18n Tier 1, form guides

**Branch:** `cursor/f2d-g1-form-guides-699d`

### Shipped

- **Commissioning ceremony** — one-time modal when Readiness complete
- **Tier 1 i18n** — DE, IT, KO added; nav, welcome, journey, form guide UI strings
- **HtmlLangSync** — document language follows app language
- **50+ text form guides** — extended library, no video
- **Pro Today accordion** — Health scores / This week / Progress sections
- **Profile badge** — Mission Operator · Day N when commissioned

---

## 2026-06-29 — Phase F2a: Simple/Pro mode + Apple UI polish

**Branch:** `cursor/simple-pro-mode-699d` (includes F1 from `cursor/journey-i-day-699d`)

### Shipped

- **Simple / Pro Mode** — Simple default; Profile toggle; Pro = full dashboard + More tools
- **Apple-inspired UI** — glass nav, 44px targets, 17px Simple typography, solid content cards
- **5-tab nav** — desktop matches mobile; Pro adds More sheet
- **Text form guides** — 12+ exercises, no video budget
- **Military test prep** — Benchmarks section only; global health tone everywhere else

---

## 2026-06-29 — Phase F1: Journey engine + I-Day

**Branch:** `cursor/journey-i-day-699d`

### Shipped

- **`missionJourney.ts`** — I-Day → Basic Training → Readiness → Commissioned phases; `getNextAction()` drives one hero CTA
- **`/welcome`** — 4-step I-Day flow (Begin → Accept mission → 3 questions → optional sign-in)
- **`JourneyGuard`** — redirects new members to `/welcome` before app shell
- **Today hub** — `JourneyStrip` + `JourneyHero`; secondary cards hidden during Basic Training
- **Sign-in cleanup** — Nutrition and History link to Profile instead of inline magic-link forms

See [JOURNEY.md](JOURNEY.md) for F2–F4 roadmap.

---

## 2026-06-29 — Inspection & Protection (pre-launch hardening)

**Branch:** `cursor/inspection-protection-699d`

### Shipped

- **PROTECTION.md** — Security audit, competitive gap analysis, verification checklist, backlog
- **Private gate:** Signed session cookies (HMAC), rate-limited `/api/private-access`, timing-safe compare
- **Webhooks:** Stripe signature verification; PayPal disabled until verified (blocks forged premium grants)
- **Premium:** Server `/api/premium/status`; `usePremium()` hook; localStorage bypass removed in production
- **Content protection:** 92 premium recipes server-only; `/api/premium/recipes` + pro programs API
- **Headers:** HSTS, frame options, referrer policy in `vercel.json`
- **PWA:** Disabled while `PRIVATE_MODE` active (reduces gated-content offline leak)

See [PROTECTION.md](PROTECTION.md) for P0 checklist before public launch.

---

## 2026-06-29 — Phase D: Content scale

**Branch:** `cursor/phase-d-content-699d`

### Shipped

- **200+ exercise library:** 90 new movements in `exercisesExtended.ts`; enrichment adds cues, tags, alternatives
- **Library UI:** Filter by program style (strength/hypertrophy/conditioning/corrective), level, equipment; alternatives on cards
- **Program tags:** `getProgramTags()` on templates; style filter in Builder; 4 new programs (EMOM, intervals, desk prehab, PPL)
- **Learn paths:** 3 ISSA-aligned paths — Corrective Foundations, Periodization, Coaching & Client Success (8 paths total)

### Files added / updated

- `src/data/exercisesExtended.ts`, `src/data/exerciseEnrichment.ts`
- `src/types/index.ts` (ProgramTag, alternatives, level)
- `src/page-components/LibraryPage.tsx`, `src/data/programTemplates.ts`, `src/data/learnPaths.ts`

---

## 2026-06-29 — Phase C: Bundle & backend

**Branch:** `cursor/phase-c-bundle-backend-699d`

### Shipped

- **Cross-pillar Win Score:** `computeWinScore()` weights all six pillars; dashboard shows `PillarScoreBreakdown` on `/log`
- **Bundle page:** Full comparison table, savings calc, pillar list — `/bundle` via `BundlePage.tsx`
- **Cloud merge:** `workoutMerge.ts` fingerprint dedup; `loadFromCloud()` + History auto-sync on sign-in
- **Supabase:** `supabase/schema.sql` (profiles, enrollments, leads, workout_logs, nutrition_logs + RLS)
- **Premium checks:** `checkPremium()` / `isPremium()` use `user_id` + email fallback; Stripe webhook placeholder
- **UnlockButton:** Shows Stripe checkout when `NEXT_PUBLIC_STRIPE_LINK_BUNDLE` is set; demo request fallback

### Files added / updated

- `src/lib/pillarScoreInputs.ts`, `src/lib/workoutMerge.ts`, `src/lib/bundleConfig.ts`
- `src/components/metrics/PillarScoreBreakdown.tsx`, `src/page-components/BundlePage.tsx`
- `supabase/schema.sql`, `app/api/stripe-webhook/route.ts`

---

## 2026-06-29 — Phase B: Pillar free tiers

**Branch:** `cursor/phase-b-pillar-tiers-699d`

### Shipped

- **Move (`/move`):** 4 guided mobility flows with timed step-through runner
- **Mind (`/mind`):** Box / 4-7-8 / relax breathing timer + daily check-in (sleep, mood, stress, energy)
- **Learn (`/learn`):** 5 free education paths with expandable lesson cards + progress
- **Track (`/track`):** New pillar — manual activity log (walk/run/bike/hike), weekly stats
- **Mobile nav:** Bottom tab bar on phone (Today, Train, Fuel, Track, You); sidebar hidden on mobile
- **Pillar wins:** Unified `logPillarWin()` for cross-pillar recovery score synergy

### Files added

- `src/components/pillars/TimedFlowRunner.tsx`, `BreathingTimer.tsx`, `DailyCheckIn.tsx`
- `src/page-components/MovePage.tsx`, `MindPage.tsx`, `TrackPage.tsx`, `LearnPage.tsx`
- `src/data/mobilityFlows.ts`, `src/data/learnPaths.ts`
- `src/lib/pillarLog.ts`, `src/lib/activityLog.ts`
- `src/components/layout/MobileNav.tsx`
- `app/(app)/track/page.tsx`

---

## 2026-06-29 — Phase A: Free core alignment

**Branch:** `cursor/phase-a-free-core-699d`

### Shipped

- **Nutrition un-gated:** Full macro log, water, targets, and 12 free recipes for all users; premium unlocks remaining recipe library
- **Weekly challenges on `/log`:** 7-day train streak, 5 high-protein days, 10K volume week with progress bars
- **Training streak:** Persists on workout complete via `recordWorkoutCompleted()`
- **Today's Workout:** Daily rotating WOD/strength/mobility session (CrossFit / Freeletics inspired)
- **Exercise library:** Removed duplicate IDs; added 25 bodyweight/minimal-equipment exercises
- **Leads:** Coaching application + Feedback form submit to Supabase `leads` (localStorage fallback offline)
- **Docs:** Added `PLAN.md` (roadmap) and this log

### Files touched

- `src/lib/challenges.ts`, `src/lib/todaysWorkout.ts`
- `src/page-components/HomePage.tsx`, `NutritionPage.tsx`
- `src/page-components/CoachingPage.tsx`, `FeedbackPage.tsx`
- `src/data/exercises.ts`, `src/lib/supabase.ts`, `src/store/workoutStore.ts`

---

## 2026-06-29 — Private gate + env setup

**Merged to `master`**

- Hardened `proxy.ts` private development gate
- Added `.env.example`, `ENV.md`, `npm run check-env`
- Removed magic-link bypass on `/private` page

**Blocked:** Vercel dashboard access (2FA reset pending) — set `PRIVATE_ACCESS_SECRET=Done` when restored

---

## 2026-06-29 — Bevel-inspired metric UI

- ScoreRing, MetricsRow, CoachInsightCard on dashboard
- `computeBodyScores()` in `score.ts`

---

## 2026-06-28 — Grok Build handoff

- 59 program templates, nutrition recipes, pillar pages
- Private gate, expanded HomePage starters

---

## 2026-06 — Next.js migration

- Vite PWA → Next.js 16 App Router + next-pwa
- Vercel deploy config for www.missionwinning.com

---

See [PLAN.md](PLAN.md) for what comes next (Phase B).
