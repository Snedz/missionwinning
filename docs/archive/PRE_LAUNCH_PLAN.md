> Superseded by [LAUNCH_RUNBOOK.md](../../LAUNCH_RUNBOOK.md) as of 2026-07-19 (Wave 9).

# Pre-Launch Plan — Mission Winning

**Purpose:** Single checklist before `PRIVATE_MODE=false` and public launch.  
**Last updated:** 2026-07-11 (pre-launch quality bar, build `2026.07-unified.54`)  
**Vision alignment:** [VISION_STATUS.md](VISION_STATUS.md) · **Build phases:** [PLAN.md](PLAN.md)

---

## Where we are now

### Shipped (feature-complete for private beta)

| Area | Status | Notes |
|------|--------|-------|
| **Free core** | ✅ | Train, Fuel, Move, Mind, Track, Learn — usable without premium |
| **Journey (F1–F3)** | ✅ | I-Day → Basic → Readiness → Commissioned; cloud sync |
| **Unified UI** | ✅ | One shell — no Simple/Pro; journey phase drives Today layout |
| **Auth & privacy** | ✅ | Google + email, consent gate, SignInPrompt on tool pages |
| **i18n** | ✅ partial | Tier 1/2 nav chrome; es/fr/de body on core surfaces |
| **Beta invite kit** | ✅ | `/beta` + [BETA_INVITE.md](BETA_INVITE.md) |
| **Legal** | ✅ | `/privacy`, `/terms`, AppLegalFooter |
| **Beta metrics** | ✅ | `/api/beta/metrics`, founder panel on Profile |
| **PFT / America** | ✅ | Opt-in via `NEXT_PUBLIC_AMERICA_TRACK_ENABLED` |
| **Supabase schema** | ✅ | All 12 migrations applied on prod (verified 2026-07-11) |
| **Vercel deploy** | ✅ | GitHub → Vercel Production connected (Cursor + GH integration) |
| **Launch quality bar** | ✅ | Hero E2E win-score path, photo-log errors, EmptyStates, premium fetch toasts |
| **Build label** | ✅ | `2026.07-unified.54` on Profile footer |

### Phase 0 status (2026-07-11)

| Item | Status |
|------|--------|
| GitHub → Vercel Production | ✅ READY; SHA tracks `master` |
| Migrations (12 files through `20260705_leads_api_only`) | ✅ Verified on Supabase `missionwinning` |
| `DEMO_PREMIUM=false` (local) | ✅ |
| `NEXT_PUBLIC_SHOW_OWNER_TOOLS` unset | ✅ |
| `PRIVATE_ACCESS_SECRET` rotated (not `Done`) | ✅ local; **confirm same on Vercel Production** |
| `SUPABASE_SERVICE_ROLE_KEY` on Vercel | ⬜ Required for webhooks / beta metrics / admin APIs |
| Stripe payment links + `STRIPE_WEBHOOK_SECRET` | ⬜ Founder — [docs/STRIPE_PREMIUM_SETUP.md](docs/STRIPE_PREMIUM_SETUP.md) |
| Beta cohort ≥10 | ⬜ **0 profiles** in prod — recruit before flip |

---

## Launch gates (must pass before public)

### Product gates (F4)

| Gate | Target | How to measure |
|------|--------|----------------|
| Beta cohort | ≥10 real users | Supabase `profiles` count / founder panel |
| I-Day completion | ≥80% | `profiles.journey_state` via `/api/beta/metrics` |
| Basic Training 5/5 | ≥60% | Founder beta panel `launchReady` |
| Commissioned in 14 days | ≥25% (stretch) | Advisory only |

**Do not set `PRIVATE_MODE=false` until Basic Training ≥60% in beta.**

### Security gates

| Task | Status |
|------|--------|
| Rotate `PRIVATE_ACCESS_SECRET` | ✅ local · confirm Vercel |
| `DEMO_PREMIUM=false` in production | ⬜ Confirm Vercel |
| `SUPABASE_SERVICE_ROLE_KEY` in Vercel | ⬜ |
| `STRIPE_WEBHOOK_SECRET` (if Stripe live) | ⬜ |
| `BETA_ADMIN_EMAILS` | ✅ local |
| Gate curl / `launch-verify` | ✅ Gate on; e2e needs Playwright browsers locally |
| Privacy + Terms linked | ✅ |
| Supabase schema + RLS hardening | ✅ |

### Hero flow (manual QA before public)

Automated: `SMOKE_BASE_URL=… SMOKE_ACCESS_SECRET=… npm run e2e` includes welcome → Today → **workout complete → Mission Score**.

One polished path on **mobile**:

1. `/welcome` I-Day (≤3 min)
2. Today → Start first workout
3. Complete workout → Win Score updates
4. Sign in → cloud sync visible on Profile
5. Language switch → nav labels change

---

## What to build next

### Now — Phase H (private beta → public)

| # | Task |
|---|------|
| 1 | Recruit 10+ beta users; hit I-Day / BT gates ([STRATEGY.md](STRATEGY.md)) |
| 2 | Set missing Vercel env: service role + Stripe links/webhook |
| 3 | `LAUNCH_STRICT=true … npm run launch-verify` |
| 4 | Pass gates → `PRIVATE_MODE=false` + PWA enable |

### After launch — Phase I remaining

| # | Task |
|---|------|
| 1 | Live Stripe Super Bundle push to waitlist |
| 2 | Week-4 retention wall metric |
| 3 | `/log` Lighthouse toward 90 |
| 4 | More i18n only after PMF |

---

## Supabase migrations checklist (12)

Run in SQL Editor in filename order (idempotent):

1. `20250629_complete_base_schema.sql`
2. `20250629_journey_events.sql`
3. `20250629_journey_state.sql`
4. `20250629_leaderboard.sql`
5. `20250629_leaderboard_squad_patch.sql`
6. `20250629_fitness_test_school.sql`
7. `20250629_pft_leaderboard_teacher_pin.sql`
8. `20250629_youth_consent_records.sql`
9. `20260702_security_hardening.sql`
10. `20260703_reminders_optin.sql`
11. `20260704_coach_plan.sql`
12. `20260705_leads_api_only.sql`

Verify tables: `profiles`, `workout_logs`, `nutrition_logs`, `enrollments`, `leads`, `journey_events`, `leaderboard_snapshots`, `school_classes`, `fitness_test_results`, `youth_consent_records`.

Day-of: [docs/archive/TRACK_D_GO_LIVE.md](docs/archive/TRACK_D_GO_LIVE.md) · Founder path: [LAUNCH_RUNBOOK.md](LAUNCH_RUNBOOK.md).
