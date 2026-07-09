# Beta launch ops — founder checklist

**Code is ready.** This is the critical path from private beta to public launch. Full detail: [LAUNCH_RUNBOOK.md](../LAUNCH_RUNBOOK.md).

> **2026-07-09 agent note:** `npm run launch-verify` was run locally (migrations listed, env shape checked). Remaining boxes below still require **your** Vercel / Supabase / Stripe / beta cohort actions — agents cannot complete §1–§5 alone.

---

## §1 Deploy access (~30 min)

- [ ] Vercel dashboard accessible (2FA recovery if needed)
- [ ] Project **Production Branch** = `master` (Settings → Git)
- [ ] If merges only create Preview deploys: run **Actions → Deploy production** or `vercel deploy --prod`
- [ ] `www.missionwinning.com` shows latest commit build label on Profile

See [VERCEL_DEPLOY_CHECKLIST.md](../VERCEL_DEPLOY_CHECKLIST.md) for preview-vs-production gotcha (2026-07-04).

---

## §2 Environment & database (~45 min)

- [ ] Generate secrets: `openssl rand -base64 32` (three times — `PRIVATE_ACCESS_SECRET`, `YOUTH_CONSENT_SECRET`, `NUDGE_SECRET`)
- [ ] **Rotate** `PRIVATE_ACCESS_SECRET` — do not use dev placeholder `Done` in production
- [ ] Vercel env: `PRIVATE_MODE=true`, `DEMO_PREMIUM=false`, Supabase keys, `BETA_ADMIN_EMAILS`, `YOUTH_CONSENT_SECRET`, `NUDGE_SECRET`
- [ ] Run all `supabase/migrations/` in **filename order** (idempotent — safe to re-run):
  1. `20250629_complete_base_schema.sql`
  2. `20250629_fitness_test_school.sql`
  3. `20250629_pft_leaderboard_teacher_pin.sql`
  4. `20250629_youth_consent_records.sql`
  5. `20260702_security_hardening.sql`
  6. `20260703_reminders_optin.sql`
  7. `20260704_coach_plan.sql`
  8. `20260705_leads_api_only.sql`
- [ ] Redeploy; `curl -sI https://www.missionwinning.com/` → redirects to `/private`
- [ ] Profile build label matches latest `master` commit

**GitHub shortcut:** Actions → **Sync Vercel env** (secrets in [ENV.md](../ENV.md)).

---

## §3 Beta cohort — 10 real users (14 days)

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

- [ ] Gate-on verify passes (`LAUNCH_STRICT=true … npm run launch-verify`)
- [ ] `PRIVATE_MODE=false` on Vercel Production → redeploy
- [ ] Public verify: `SMOKE_ALLOW_PUBLIC=true SMOKE_EXPECT_PWA=true npm run launch-verify`
- [ ] Landing `/` + HeroDemo visible; PWA install from phone
- [ ] Submit sitemap in Search Console ([SEO_ANALYTICS.md](SEO_ANALYTICS.md))
- [ ] PostHog funnel dashboard live
