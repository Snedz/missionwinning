# Beta launch ops — founder checklist

**Code is ready.** This is the critical path from private beta to public launch. Full detail: [LAUNCH_RUNBOOK.md](../LAUNCH_RUNBOOK.md).

---

## §1 Deploy access (~30 min)

- [ ] Vercel dashboard accessible (2FA recovery if needed)
- [ ] Project **Production Branch** = `master` (Settings → Git)
- [ ] If merges only create Preview deploys: run **Actions → Deploy production** or `vercel deploy --prod`
- [ ] `www.missionwinning.com` shows latest commit build label on Profile

See [VERCEL_DEPLOY_CHECKLIST.md](../VERCEL_DEPLOY_CHECKLIST.md) for preview-vs-production gotcha (2026-07-04).

---

## §2 Environment & database (~45 min)

- [ ] Generate secrets: `openssl rand -base64 32` (twice — `PRIVATE_ACCESS_SECRET`, `YOUTH_CONSENT_SECRET`)
- [ ] **Rotate** `PRIVATE_ACCESS_SECRET` — do not use dev placeholder `Done` in production
- [ ] Vercel env: `PRIVATE_MODE=true`, `DEMO_PREMIUM=false`, Supabase keys, `BETA_ADMIN_EMAILS`
- [ ] Run all `supabase/migrations/` in order (finish with `20260702_security_hardening.sql`)
- [ ] Redeploy; `curl -sI https://www.missionwinning.com/` → redirects to `/private`

**GitHub shortcut:** Actions → **Sync Vercel env** (secrets in [ENV.md](../ENV.md)).

---

## §3 Beta cohort — 10 real users (14 days)

**v5 founder checklist (parallel with code):**

- [ ] Rotate `PRIVATE_ACCESS_SECRET` off dev placeholder (`Done`) — see §2
- [ ] Set `YOUTH_CONSENT_SECRET` and `NUDGE_SECRET` (dedicated; see [OWASP_AUDIT.md](OWASP_AUDIT.md))
- [ ] Apply `20260702_security_hardening.sql` + `20260705_leads_api_only.sql` in Supabase
- [ ] Confirm `DEMO_PREMIUM=false` on Vercel Production
- [ ] Run `npm run security-smoke` + `node scripts/verify-supabase-security.mjs` against prod
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

- [ ] Stripe account + live checkout links in env (`NEXT_PUBLIC_STRIPE_LINK_BUNDLE`)
- [ ] `STRIPE_WEBHOOK_SECRET` on Vercel; webhook URL → `/api/stripe-webhook`
- [ ] Test purchase → `enrollments` row → Coach unlocks (premium gate in [`useCoachPlan`](../src/hooks/useCoachPlan.ts))

---

## §5 Go public (after gates)

- [ ] `PRIVATE_MODE=false` on Vercel Production
- [ ] Landing `/` + HeroDemo visible; PWA install prompt active
- [ ] Submit sitemap in Search Console ([SEO_ANALYTICS.md](SEO_ANALYTICS.md))
- [ ] PostHog funnel dashboard live
