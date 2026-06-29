# Mission Winning — Development Log

Chronological record of shipped work. Newest first.

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
