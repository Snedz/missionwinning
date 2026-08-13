# Mission Winning — Build Plan

Living roadmap for the **everything app** (Freeletics Super Bundle → one PWA). Filter every task through [vision.md](../vision.md).

**Vision comparison:** [VISION_STATUS.md](VISION_STATUS.md) — pillar scorecard, gaps, priorities.

---

## Frozen ship — Mission ID (`.732`) — 2026-08-13

**Status: FROZEN.** Implement only this section. Do not expand. Label `2026.07-unified.732` (occupied `.698`–`.731` — do not steal). Draft PR. One Preview max (`[skip vercel]` on plan-only and fix-up commits). Excellence-Override: Mission ID, founder is 1.

Founder 2026-08-13: give signed-in accounts a monotonic integer **Mission ID**. Prestige of *early*, not a leaderboard. **ID 1 is reserved for founder Snowden Zeng** (GitHub `Snedz`).

### What it is

| | |
|--|--|
| Name | **Mission ID** — display `#N` |
| Kind | Server-issued monotonic integer, unique per signed-in account |
| ID 1 | Founder only (GitHub login `Snedz`, already public in this repo; plus existing `BETA_ADMIN_EMAILS` / `isBetaAdminEmail` — do **not** invent a new public email, do **not** put EIN or passwords in git) |
| Next | 2, 3, … via a Postgres sequence starting at 2 |
| Guest / offline logger | **No Mission ID.** Show nothing. Free logger stays ungated |
| Call-sign 00–99 | Unchanged cosmetic. Mission ID is a different number |
| Not | Rank, XP, a board, a GitHub id, “low id flex”, anything on Train/Today/log path. Coach never reads it |

### Hard bans (this ship)

No `PRIVATE_MODE` production flip. No feed / Top 8. No standing on Train/Today. No EIN. Do not steal `.698`. Do not rewrite #728 Preview gate (`proxy.ts` / private-gate session unlock).

### Data (server owns the mint — ECONOMY / IDENTITY: no client grant)

New table `public.mission_ids`:

- `user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE`
- `mission_id integer NOT NULL UNIQUE CHECK (mission_id >= 1)`
- `claimed_at timestamptz NOT NULL DEFAULT now()`
- Sequence `mission_id_seq` **START 2** (so sequential never issues 1)
- RLS: authenticated **SELECT own row only**. No INSERT/UPDATE/DELETE policies for `anon`/`authenticated`. Writes are service-role only
- Protect like referrals: a client that can insert its own row can forge an early id

Claim algorithm (pure, then executed with service role):

1. No session → no id (do not mint)
2. Row exists for `user_id` → return it (idempotent)
3. Else if founder identity (GitHub login `Snedz` case-insensitive from `user.identities` / `user_metadata`, **or** `isBetaAdminEmail`) **and** mission_id `1` is free → insert `(user_id, 1)`
4. Else insert `nextval('mission_id_seq')` (≥ 2)
5. Unique races: `user_id` conflict → re-select; `mission_id = 1` conflict → fall through to sequential (ID 1 cannot be issued twice)

No client POST of an id. No localStorage mint. No demo-mode fallback that invents an id.

### API

`GET /api/account/mission-id` — session cookie, rate-limit per user, service-role claim, JSON `{ ok: true, missionId: number }`. **401** unsigned · **503** admin/DB unconfigured · **502** opaque on write failure. GET only — no body schema that accepts an id.

### UI

- Athlete Page (`/profile`) and Account (`/account`): when signed in and an id exists, show label **Mission ID** and `#N` (`data-testid="mission-id"`). 0 red actions
- Guest / 401 / 503: render **nothing** (not a dash, not “sign in for an id” on Train/Today)
- Train (`/active`) and Today (`/log`): no Mission ID copy, no fetch, no import
- Call-sign editor stays 00–99. Do not merge the two numbers
- Copy: “Mission ID” / `#1`. No “GitHub id”, no Tobi/Elon names, no “low id flex”
- Not on share card, boards, nudges, I-Day, or Coach

### Coach / log boundary

Mission ID lives in identity (social projection), not the planner. Add `src/lib/identity/missionId.ts` and `src/lib/missionIdServer.ts` to `SOCIAL_ROOTS`. Source-scan Train/Today/Coach/`src/lib/coach/` for `missionId` / `Mission ID`. Do not put Mission ID in `packages/mw-core` (planner walk starts there).

### Tests (must fail if the rule is deleted)

1. ID 1 cannot be issued twice (second founder claim while 1 is taken → sequential, never another 1). Unique constraint in the migration
2. Client cannot mint (GET-only route; no client insert/write of `mission_id`; no localStorage key)
3. Guest has no id (`decide` with no user → null; unsigned UI helper → null)
4. Athlete Page shows `#1` when the founder profile (`Snedz`) is the current user in tests (`formatMissionId(1) === '#1'` + Profile mounts the line)
5. `check-build-label` `.732`

### Files (this list is the scope)

`src/lib/identity/missionId.ts` (+ test) · `src/lib/missionIdServer.ts` (+ routetest) · `app/api/account/mission-id/route.ts` · `src/hooks/useMissionId.ts` · `src/components/profile/MissionIdView.tsx` · Athlete Page + Account + `ProfileAccountCard` · migration `supabase/migrations/20260813_mission_ids.sql` · runbook + `accountDataRegistry` · i18n `athleteLocales` · IDENTITY contract + identity INDEX + help FAQ · `domainBoundary` SOCIAL_ROOTS · docs/API + app/api INDEX · build label `.732` · LOG + CONTEXT `## Now` (rotate to stay in budget)

### Out of scope

Android, public URL / S4b, boards, feed, calling it a rank, seeding a UUID (founder’s `auth.users` id is not in git — claim-on-first-GET is the seed).

---

## Design north stars (UI + product)

| Source | What we borrow |
|--------|----------------|
| **Bevel** | Dark premium UI, metric-first dashboard (Readiness / Strain / Recovery) |
| **Freeletics** | Freemium core, Coach, Super Bundle, streaks, challenges, pillar structure |
| **CrossFit app** | WOD logging, timers, daily workout rotation, benchmark culture |
| **Muscle & Fitness / Bodybuilding.com** | Exercise library depth, filters, programs, education tone |

Mission Winning is **none of these** — one unified super app, free core forever, global PWA.

---

## Phase status

| Phase | Focus | Status |
|-------|-------|--------|
| **A** | Free core alignment (nutrition, streaks, challenges, today's workout, leads) | ✅ Done — [LOG.md](../LOG.md) |
| **B** | Six working pillar free tiers (Move, Mind, Learn, Track) | ✅ Done |
| **C** | Super Bundle synergy + Supabase hardening | ✅ Done |
| **D** | Content scale (200+ exercises, Learn paths) | ✅ Done |
| **F** | Simple UI + Mission Journey (I-Day → Commissioned) | ✅ Done — [JOURNEY.md](JOURNEY.md) |
| **G** | PFT / America track (school, teacher, youth, leaderboard) | ✅ Done — build `.45` |
| **H** | Public launch + PWA + security P0 | ⬜ **Blocked** — founder ops → [LAUNCH_RUNBOOK.md](LAUNCH_RUNBOOK.md) |
| **I** | Premium depth + AI Coach + live payments | 🟡 Partial — engines + Mind/Move/Learn/I5 + de body; live Stripe next |

> **Naming:** Journey “Phase 0–3” (JOURNEY.md) ≠ build phases here ≠ PFT sub-phases G1–G8.

---

## Phase G — PFT / America track (G1–G8) ✅

Optional US national-fitness side track (`NEXT_PUBLIC_AMERICA_TRACK_ENABLED`). Does not replace global mission.

| Sub | Deliverable | PR / build |
|-----|-------------|------------|
| **G1** | Presidential Fitness Test scoring, `/fitness-test`, `/america` | #52 |
| **G2** | School class codes, youth gate, PFT cloud sync | #53 |
| **G3** | Teacher dashboard, Week 1 printable, class API | #54 |
| **G4** | PFT leaderboard board, teacher PIN, verified youth consent | #55 |
| **G5** | Youth consent server sync, class leaderboard scope | #56 |
| **G6** | Teacher creator auth, print/CSV export, council hero tiers | #57 |
| **G7** | Hashed teacher PINs, council i18n (es/fr/ja/de/zh) | #58 |
| **G8** | HTML class report export, PFT gate-smoke, council env hints | #59 |

**Ops before prod:** Run Supabase migrations (`fitness_test_school`, `pft_leaderboard_teacher_pin`, `youth_consent_records`); set `RESEND_API_KEY`, `YOUTH_CONSENT_SECRET`; legal OK before `NEXT_PUBLIC_SHOW_MAHA_COPY=true`.

**Done when:** `/america` + `/fitness-test` pass gate smoke; teacher export works; build label on Profile matches deploy.

---

## Phase H — Launch & global accessibility ⬜

*Formerly “Phase E” in older docs.* See [PRE_LAUNCH_PLAN.md](archive/PRE_LAUNCH_PLAN.md) + [PROTECTION.md](PROTECTION.md).

> **2026-07-02 — Launch package shipped (code side of Phase H):** security hardening migration
> (`20260702_security_hardening.sql` — teacher PIN column privileges, authenticated-only leaderboard
> reads), consent-notify rate limit, PWA manifest (`app/manifest.ts` — was 404), `.env.local.save`
> untracked, leaderboard bots relabeled as honest "Pacers" (+ kill switch), America/PFT track now
> **opt-in** (`NEXT_PUBLIC_AMERICA_TRACK_ENABLED=true` to enable), premium redesign of Landing /
> Bundle / private gate / Welcome / Coaching (display type system, no hype copy, no fake
> testimonials), UnlockButton → real Stripe checkout when links configured / honest founders
> waitlist otherwise. **Remaining Phase H work is founder ops → [LAUNCH_RUNBOOK.md](LAUNCH_RUNBOOK.md).**
> Strategy + risk docs: [STRATEGY.md](STRATEGY.md) · [REDTEAM.md](REDTEAM.md).
>
> **2026-07-03 — Pre-launch v2 shipped:** real PWA icons (placeholders were broken 87-byte files),
> working backup export/import (`src/lib/backup.ts`), error boundaries, offline-for-real (the SW
> now actually registers under App Router — next-pwa@5 never registered it — plus `/offline`
> fallback; verified by Playwright with the network disabled), decluttered new-user Today, logger
> upgrades (tap-to-type entry, per-set previous values, swap/remove exercise, persistent notes,
> honest sync-failure toast), PostHog funnel analytics (env-gated), and Resend email nudges
> (streak-at-risk / comeback / week-1 recap; opt-in + one-tap unsubscribe; daily Vercel cron).
> New founder env steps: run `20260703_reminders_optin.sql`, set `CRON_SECRET`, optionally
> `NEXT_PUBLIC_POSTHOG_KEY`. Next build phase: **AI Coach v1** (Track D) once beta activation ≥40%.

### Product gates (F4 / JOURNEY)

| Gate | Target |
|------|--------|
| Beta cohort | ≥10 real users |
| I-Day completion | ≥80% |
| Basic Training (first workout) | see [ORCHESTRATION.md](../ORCHESTRATION.md) Horizon 0 task 5 |
| Commissioned in 14 days | ≥25% stretch |

**Do not set `PRIVATE_MODE=false` until the Basic Training gate in [ORCHESTRATION.md](../ORCHESTRATION.md) Horizon 0 task 5 is met.** That row is the single home for the number — `.606` found this gate stated three different ways in three files.

### Security & infra gates

| Task | Status |
|------|--------|
| Rotate `PRIVATE_ACCESS_SECRET` | ⬜ Vercel / GitHub Secrets |
| `DEMO_PREMIUM=false` in production | ⬜ |
| Supabase service role + migrations | ⬜ |
| GitHub → Vercel env sync workflow | ✅ #51 — run manually |
| Gate + PFT smoke (`npm run gate-smoke`) | ✅ script shipped |
| Privacy + Terms | ✅ |
| Enable PWA (`PRIVATE_MODE=false`) | ⬜ |

### Hero flow QA (mobile)

1. `/welcome` I-Day (≤3 min)
2. Today → Start first workout
3. Complete workout → Win Score updates
4. Sign in → cloud sync on Profile
5. Language switch → nav labels change

**Done when:** Public URL, installable PWA, premium API 403 without enrollment, beta gates pass.

---

## Phase I — Premium parity & synergy 🟡

Aligns revenue with [vision.md](../vision.md) without gating free core.

| Sub | Deliverable | Status | Vision link |
|-----|-------------|--------|-------------|
| **I1** | Live Stripe bundle + verified webhook → `enrollments` | 🟡 Code ready — founder wires live links ([docs/STRIPE_PREMIUM_SETUP.md](STRIPE_PREMIUM_SETUP.md)) | Super Bundle revenue engine |
| **I2** | AI Coach v1 — plan generator, premium-gated Train Coach | ✅ Engine + taster + regen; polish remaining | “Personal trainer in pocket” |
| **I2b** | Fuel Coach — adaptive meal plans synced to macros / training | ✅ Premium-gated (`src/lib/fuelCoach/`) | Fuel depth |
| **I3** | Track GPS premium MVP — live recording, pace chart, weekly stats | ✅ Shipped | Track |
| **I3b** | Mind / Move premium depth beyond unlock cards | ✅ 17 Mind + 11 Move premium sessions | Bundle proof |
| **I3c** | Learn premium specialist chapters | ✅ 4 courses / 16 sections + course fix | Bundle proof |
| **I4** | i18n G2 — Today/Fuel/Active/Welcome body for Tier 1 + AR RTL | 🟡 es + **fr** shipped; **de** next (one locale at a time) | Global equity |
| **I5** | Cross-pillar recommendation depth (coach → multi-pillar CTAs) | ✅ Victory/guided/course CTAs + Learn in single insight | 1+1+1 > sum |

**Done when:** Paying users get differentiated premium; free core unchanged; bundle LTV measurable.

---

## Phase A–D + F (archive summary)

<details>
<summary>Phases A–D, F — completed (click to expand)</summary>

### Phase A — Free core ✅
Nutrition un-gated, challenges, Today's Workout, exercise library, leads API.

### Phase B — Pillar free tiers ✅
Move, Mind, Learn, Track usable free experiences.

### Phase C — Bundle & backend ✅
Win Score weighting, bundle page, Supabase schema, cloud merge.

### Phase D — Content ✅
200+ exercises, program tags, 8 Learn paths.

### Phase F — Journey & unified UI ✅
I-Day → Commissioned, 5-tab nav, More for everyone, beta metrics, legal pages. See [UX_UNIFIED_PLAN.md](archive/UX_UNIFIED_PLAN.md).

</details>

---

## Recommended work order (now)

**Long-term sequencing (horizons 0–3, role split, kill criteria):** [ORCHESTRATION.md](../ORCHESTRATION.md) — read this before starting a multi-week initiative.

**Agent H1 eng prep:** complete. **Growth Wave 2–3:** leads/email/SEO + `npm run growth-smoke` + [docs/archive/LAUNCH_READY.md](archive/LAUNCH_READY.md). Flip checklist: [docs/archive/PUBLIC_FLIP_CHECKLIST.md](archive/PUBLIC_FLIP_CHECKLIST.md).

1. **Horizon 0 — Phase H founder ops** — migration + Vercel secrets + Stripe + recruit beta ([LAUNCH_RUNBOOK.md](LAUNCH_RUNBOOK.md), [docs/archive/LAUNCH_READY.md](archive/LAUNCH_READY.md)) — **current bottleneck**
2. **Hit beta gates** — 10+ users, I-Day ≥80%, BT ≥60% — then `PRIVATE_MODE=false` ([docs/archive/SOFT_LAUNCH_DAY.md](archive/SOFT_LAUNCH_DAY.md), [docs/archive/PUBLIC_FLIP_CHECKLIST.md](archive/PUBLIC_FLIP_CHECKLIST.md))
3. **Horizon 1 — Phase I1** — live Stripe + webhook verify ([docs/STRIPE_PREMIUM_SETUP.md](STRIPE_PREMIUM_SETUP.md)); offline/SW/Search Console smoke
4. ~~Lighthouse + Serwist + growth smoke~~ — **shipped** ([docs/LIGHTHOUSE_BASELINE.md](LIGHTHOUSE_BASELINE.md); `npm run growth-smoke`)
5. **Horizon 2 — week-4 retention** — measure before new features ([docs/POST_LAUNCH_CADENCE.md](POST_LAUNCH_CADENCE.md), funnel in [docs/SEO_ANALYTICS.md](SEO_ANALYTICS.md))
6. **Horizon 3 — i18n / SEO / TWA** — only after PMF (es/fr/de body already partial)
7. **Agent idle only** — Profile/Nutrition extract, landing i18n Batch C — not launch-blocking

---

## Git workflow (Mac + GitHub + Vercel)

```
GitHub (source of truth)
   ↑ push / merge
Cursor / Cloud Agent (implements)
   ↓ git pull
Your Mac (local dev: npm run dev)
   ↓ auto-deploy when Vercel connected
www.missionwinning.com
```

```bash
cd ~/missionwinning
git pull origin master
npm install
npm run dev
```

---

Last updated: 2026-07-14 (ORCHESTRATION.md horizons; S-Tier build `2026.07-unified.58`)

---

## S-Tier improvement track (2026-07-14) — closed into ORCHESTRATION

| Wave | Status | Notes |
|------|--------|-------|
| **0** Focus + pricing | ✅ | `bundleConfig` monthly/$11.99 · 12mo/$59 · lifetime/$149; Basic nav train-only |
| **1** First hour | ✅ | Welcome real Just Go preview; landing single primary CTA; journey empty copy |
| **2** Daily polish | ✅ | ErrorState/Skeleton, MobileNav `aria-current`, Escape menu, token pass |
| **3** Perf + page splits | ✅ | Fuel sections + BuilderArrange + ProfileBackup; further ActiveWorkout later |
| **4** Coach + money honesty | ✅ | Victory one next action; week recap; coach invite; Bundle inventory |
| **5** Launch ops | ⬜ | → Horizon 0 in [ORCHESTRATION.md](../ORCHESTRATION.md) |
