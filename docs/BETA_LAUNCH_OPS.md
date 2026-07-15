# Beta launch ops — founder checklist

**Code is ready.** This is the critical path from private beta to public launch. Full detail: [LAUNCH_RUNBOOK.md](../LAUNCH_RUNBOOK.md).

> **2026-07-11 agent note:** Vercel is connected (GitHub + Cursor). Prod deploy READY on `master`. All 12 Supabase migrations verified on project `missionwinning`. Build `2026.07-unified.54` ships launch quality bar. **Still founder-owned:** Stripe links/webhook, `SUPABASE_SERVICE_ROLE_KEY` on Vercel if missing, beta recruiting (0 profiles today). Agents must not flip `PRIVATE_MODE`.

---

## §1 Deploy access (~30 min)

- [x] Vercel dashboard accessible (GitHub integration + Cursor)
- [x] Project **Production Branch** = `master` (Settings → Git)
- [x] Production deploys from `master` pushes
- [ ] `www.missionwinning.com` Profile footer shows `2026.07-unified.54` after this ship deploys

See [VERCEL_DEPLOY_CHECKLIST.md](../VERCEL_DEPLOY_CHECKLIST.md) for preview-vs-production gotcha.

---

## §2 Environment & database (~45 min)

- [ ] Confirm Vercel Production has rotated `PRIVATE_ACCESS_SECRET` (not `Done`)
- [ ] Vercel env: `PRIVATE_MODE=true`, `DEMO_PREMIUM=false`, Supabase keys **incl. service role**, `BETA_ADMIN_EMAILS`, `YOUTH_CONSENT_SECRET`, `NUDGE_SECRET`
- [x] Run all `supabase/migrations/` in **filename order** (verified applied on prod 2026-07-11):
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
- [x] Gate on: unauthenticated `/` blocked while `PRIVATE_MODE=true`
- [ ] Profile build label matches latest `master` after deploy of `.54`

**GitHub shortcut:** Actions → **Sync Vercel env** (secrets in [ENV.md](../ENV.md)).

---

## §3 Beta cohort — 10 real users (14 days)

**Current:** `profiles` count = **0** — gates not met. Recruit before any public flip.

**Pre-recruit verify (parallel with invites):**

- [ ] Confirm `DEMO_PREMIUM=false` on Vercel Production
- [ ] `LAUNCH_STRICT=true SMOKE_BASE_URL=https://www.missionwinning.com SMOKE_ACCESS_SECRET=… npm run launch-verify`
- [ ] `node scripts/verify-supabase-security.mjs --probe` with service role against prod
- [ ] Optional: `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` for distributed rate limits

### Mobile QA (do yourself first)

On a real phone, incognito:

1. `/private` → access code → `/welcome` I-Day (≤3 min)
2. Today → **Start first workout** → complete → Win Score updates
3. Sign in → Profile shows cloud sync
4. Fuel → log a meal; Library → search + open detail sheet
5. `/guide` and `/exercises/squats` load without gate cookie

Automated coverage: `tests/e2e/hero-flows.spec.ts` includes workout complete → Mission Score.

### Recruit & track

- [ ] 10+ personal invites sent ([BETA_INVITE.md](../BETA_INVITE.md), [STRATEGY.md](../STRATEGY.md))
- [ ] Profile → founder beta panel: I-Day ≥80%, Basic Training ≥60%
- [ ] Day 2 + day 7 follow-up messages sent

**Gate:** Do **not** set `PRIVATE_MODE=false` until Basic Training ≥60% in beta.

---

## §4 Stripe (parallel)

Full detail: [STRIPE_PREMIUM_SETUP.md](STRIPE_PREMIUM_SETUP.md).

- [ ] Stripe account + live checkout links in env (`NEXT_PUBLIC_STRIPE_LINK_BUNDLE`, `_LIFETIME`)
- [ ] `STRIPE_WEBHOOK_SECRET` on Vercel; webhook URL → `/api/stripe-webhook` (`checkout.session.completed`)
- [ ] Test purchase → `enrollments` row → Coach unlocks ([`useCoachPlan`](../src/hooks/useCoachPlan.ts))
- [ ] `node scripts/verify-stripe-enrollment.mjs --verify-enrollment <email>`

---

## §5 Go public (after gates)

Day-of commands: [TRACK_D_GO_LIVE.md](TRACK_D_GO_LIVE.md) (top of file).

**Blocked until:** `launchReady` true (10+ profiles, I-Day ≥80%, BT ≥60%) + §2/§4 env complete.

- [ ] Gate-on verify passes (`LAUNCH_STRICT=true … npm run launch-verify`)
- [ ] Flip `PRIVATE_MODE=false` → redeploy
- [ ] `SMOKE_ALLOW_PUBLIC=true SMOKE_EXPECT_PWA=true npm run launch-verify`
- [ ] PWA install + offline smoke on phone
- [ ] Launch posts + waitlist email — copy in [SOCIAL_LAUNCH.md](SOCIAL_LAUNCH.md); day checklist [SOFT_LAUNCH_DAY.md](SOFT_LAUNCH_DAY.md)
