# Mission Winning — Development Log

Chronological record of shipped work. Newest first.

---

---

## 2026-06-29 — Phase J1/J3/J5: Pathfinder, connectivity, bodyweight defaults

**Build:** `2025.06-unified.46` · **Plan:** [RURAL_EQUITY_PLAN.md](RURAL_EQUITY_PLAN.md)

### Shipped

- **J3 Pathfinder Assessment** — care-access step on `/assessments`; self-managed track; low-impact program gate
- **J1 Connectivity** — `ConnectivityProvider`, offline/lite banner, Profile lite-mode toggle
- **J5 Rural preset** — “Where do you train?” on Welcome; bodyweight default chain (Home, Library, Today WOD)

**Tests:** 135 passing (+16 new)

---

## 2026-06-29 — Phase J2/J4/J6: IndexedDB, a11y, Village Health Card

**Build:** `2025.06-unified.47`

### Shipped

- **J2** — IndexedDB `missionLocalStore`, sync outbox for failed workout cloud saves, pending sync banner
- **J4** — Text scale (Profile), skip link, assessment i18n (es/fr/pt/ar/hi), 44px touch targets on assessment
- **J6** — Printable Village Health Card for Pathfinder users

**Tests:** 142 passing

---

## 2026-06-29 — Phase J6/J4: Offline coach v2 + chart a11y tables

**Build:** `2025.06-unified.48`

### Shipped

- **Offline coach v2** — skips cloud LLM when offline/lite; cross-pillar rules + Pathfinder/equipment rotation; Offline badge on Today
- **Offline plan templates** — 4-week bodyweight, mobility, Pathfinder gentle plans on `/builder`
- **Chart data tables** — accessible `<table>` alternatives on History + Benchmarks charts

**Tests:** 147 passing

---

---

---

---

## 2026-06-29 — Phase I4: Tier 1 Today native IT/JA/KO/RU (complete)

**Build:** `2025.06-unified.53`

### Shipped

- **Today hub** — full native body copy for IT, JA, KO, RU (126 keys each); no DE inheritance
- **Generator** — `scripts/data/tier1TodayNative.mjs` + key-count validation in `generate-tier1-body.mjs`
- **Tests** — ≥75% Today coverage for all Tier 1 langs; German leakage guard for IT/JA/KO/RU
- **Locales** — regenerated `public/locales/*/today.json`

**Tests:** 186 passing

---

## 2026-06-29 — Phase I4: Tier 1 i18n body copy (partial)

**Build:** `2025.06-unified.52`

### Shipped

- **Today hub** — FR/DE/PT ~79% body vs EN (`tier1BodyPack.ts`); ES unchanged; coach premium upsell i18n
- **Welcome / Fuel / Active** — full Welcome + partial Fuel/Active for FR, PT, DE, IT, KO, JA, RU
- **Export** — `EXPORT_LANGS` + Tier 1 langs in `public/locales/` (195 JSON files)
- **Coverage tests** — `i18nTier1Coverage.test.ts`; `node scripts/generate-tier1-body.mjs`

**Tests:** 178 passing

---

## 2026-06-29 — Phase I2: Premium AI Train Coach

**Build:** `2025.06-unified.51`

### Shipped

- **Premium gate** — cloud LLM daily insight requires Super Bundle; free tier keeps rules + offline coach
- **Plan generator** — `POST /api/coach/generate-plan` (premium); LLM or rule fallback; exercise ID validation
- **Builder UI** — `CoachPlanGeneratorPanel` on `/builder`; Today upsell link on Coach insight card
- **Gate smoke** — generate-plan returns 403 without enrollment

**Tests:** 164 passing

---

## 2026-06-29 — Phase I1: Stripe Super Bundle scaffold

**Build:** `2025.06-unified.50`

### Shipped

- **Stripe webhook** — signature verify extracted to `stripeWebhook.ts`; `checkout.session.completed` → `enrollments`
- **Checkout Session API** — `POST /api/stripe/create-checkout-session` for 3mo / 12mo / lifetime tiers (REST, no stripe npm)
- **Bundle UI** — `UnlockButton` calls API checkout per plan; Payment Link fallback; email prefill
- **Env sync** — `STRIPE_SECRET_KEY`, price IDs in `check-env`, `sync-vercel-env`, `.env.example`

**Live when LLC ready:** set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, price IDs in Vercel; point Stripe webhook to `/api/stripe-webhook`.

**Tests:** 161 passing

---

## 2026-06-29 — Phase H prep: launch readiness tooling

**Build:** `2025.06-unified.49`

### Shipped

- **`launchReadiness.ts`** + `npm run phase-h-readiness` — static checklist (Phase J ✅, deploy blockers)
- **[LAUNCH_DAY.md](LAUNCH_DAY.md)** — go-public sequence (env, deploy, PWA, rollback)
- Gate smoke: `/privacy`, `/terms`, `/about`, `/manifest.json`
- RTL form polish (ar) + assessment action row

**Tests:** 149 passing

---

## 2026-06-29 — Rural equity & connectivity plan (Phase J)

**Doc:** [RURAL_EQUITY_PLAN.md](RURAL_EQUITY_PLAN.md)  
**Context:** Rural users without doctor access; prevention-at-scale thesis; connectivity/offline/a11y.

### Plan highlights

- **North star:** “Pathfinder for the disconnected” — install once, train offline 30+ days, sync when signal returns
- **Workstreams:** A connectivity/offline · B Pathfinder · C accessibility · D rural UX · E offline coach
- **Phase J1–J6** registered in [PLAN.md](PLAN.md); gap #7 in [VISION_STATUS.md](VISION_STATUS.md)

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
