# LAUNCH RUNBOOK — the founder's critical path

**Everything in this file only YOU can do.** No coding required — copy-paste steps, in order. Each step ends with a checkbox; when all boxes in a section are checked, move on. Companion docs: [STRATEGY.md](STRATEGY.md) (why) · [PRE_LAUNCH_PLAN.md](PRE_LAUNCH_PLAN.md) (detail) · [PROTECTION.md](PROTECTION.md) (security).

> **The honest framing:** the app has been "almost ready" for months. The code is not the bottleneck — the steps below are. Do §1 today.

---

## §1 — Regain deploy access (do today, ~30–60 min)

1. Vercel 2FA reset: go to https://vercel.com/help → "Account access" → follow the 2FA recovery flow (needs your account email; have a recovery code or ID handy). If truly stuck, create a NEW Vercel account with your email, import the GitHub repo `Snedz/missionwinning` fresh — a new project works just as well; update the domain after.
2. Confirm you can see the project dashboard and trigger a deploy from `master`.

- [ ] I can open the Vercel project and deploy

## §2 — Environment & database (~45 min, one-time)

1. **Generate secrets** (Mac terminal):
   ```bash
   openssl rand -base64 32   # run twice: once for PRIVATE_ACCESS_SECRET, once for YOUTH_CONSENT_SECRET
   ```
2. **Vercel → Project → Settings → Environment Variables** (Production + Preview). Set:
   - `PRIVATE_MODE=true` (stays true until §5)
   - `PRIVATE_ACCESS_SECRET=<new random value>` (this replaces the old weak one — rotate, don't reuse)
   - `DEMO_PREMIUM=false`
   - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Supabase → Project Settings → API)
   - `SUPABASE_SERVICE_ROLE_KEY` (same page — the **service_role** key; never expose in client)
   - `BETA_ADMIN_EMAILS=snowdenzeng@gmail.com`
   - `RESEND_API_KEY` (only if/when you want consent + nudge emails)
3. **Supabase migrations**: Supabase Dashboard → SQL Editor → run each file from `supabase/migrations/` in filename order, **finishing with `20260702_security_hardening.sql`** (protects teacher PINs, restricts leaderboard reads). All are idempotent — safe to re-run.
4. Redeploy, then verify on the Profile page in-app: build label matches the latest commit.

- [ ] Env vars set (incl. rotated PRIVATE_ACCESS_SECRET)
- [ ] All migrations run, including 20260702_security_hardening
- [ ] Deployed URL loads and shows the new private teaser page

## §3 — Beta: 10 real users (target: within 14 days)

1. Smoke-check the hero flow yourself **on your phone**: teaser → access code → `/welcome` I-Day → first workout → Win Score updates → sign in → Profile shows cloud sync.
2. Recruit using the scripts in [STRATEGY.md §First 10 users](STRATEGY.md). Send personal invites with the URL + access code.
3. Track the funnel: Profile page → founder beta panel (visible for `BETA_ADMIN_EMAILS`). Gates from PLAN.md: **10+ users, I-Day ≥80%, Basic Training ≥60%.**
4. Message every tester at day 2 and day 7 (script in STRATEGY.md). Fix the #1 confusion each week.

- [ ] Hero flow QA'd on a real phone
- [ ] 10+ testers invited · [ ] gates met (check the beta panel)

## §4 — Money: Stripe in ~1 hour (do in parallel with §3)

*No LLC required to start in most places — Stripe supports individual/sole-proprietor accounts; you can move to an entity later. This is not legal/tax advice — check your local requirements.*

1. Create the account: https://dashboard.stripe.com/register (individual is fine).
2. Create 2 **Products** with **Payment Links** (Dashboard → Product catalog → Add product → "Create payment link"):
   - "Mission Winning Super Bundle — 12 months" · $59/year (recurring yearly) → copy link
   - "Mission Winning Super Bundle — Founders Lifetime" · $149 one-time → copy link
3. Webhook: Dashboard → Developers → Webhooks → Add endpoint → URL `https://www.missionwinning.com/api/stripe-webhook` → events: `checkout.session.completed` → copy the **signing secret** (`whsec_…`).
4. Add to Vercel env (Production):
   ```
   NEXT_PUBLIC_STRIPE_LINK_BUNDLE=<12-month payment link>
   NEXT_PUBLIC_STRIPE_LINK_BUNDLE_LIFETIME=<lifetime payment link>
   STRIPE_WEBHOOK_SECRET=<whsec_...>
   ```
5. Redeploy. The bundle page switches from "waitlist" to real checkout automatically.
6. **Test in Stripe test mode first**: use test links + test card `4242 4242 4242 4242`, confirm a row appears in Supabase `enrollments`, and that the account you paid with gets premium (`/api/premium/status` → `premium: true`).

- [ ] Stripe account live · [ ] 2 payment links created
- [ ] Webhook verified end-to-end in test mode
- [ ] Env vars set + redeployed

## §5 — Go public (only after §2 security boxes + §3 gates)

**Automated verify** (after env is set on Vercel):

```bash
# Gate still on
SMOKE_BASE_URL=https://www.missionwinning.com SMOKE_ACCESS_SECRET=... npm run launch-verify

# After PRIVATE_MODE=false
SMOKE_BASE_URL=https://www.missionwinning.com SMOKE_ALLOW_PUBLIC=true SMOKE_EXPECT_PWA=true npm run launch-verify
```

See [docs/TRACK_D_GO_LIVE.md](docs/TRACK_D_GO_LIVE.md) for Stripe enrollment + Supabase probe commands.

1. Final security curls (replace domain if needed):
   ```bash
   curl -sI https://www.missionwinning.com/ | grep -i location        # → /private while gated
   curl -sI https://www.missionwinning.com/api/premium/recipes        # → 401/403
   curl -s  https://www.missionwinning.com/manifest.webmanifest | head -3  # → JSON
   ```
2. Vercel env: set `PRIVATE_MODE=false` → redeploy. PWA + landing page are now live.
3. Install the PWA on your own phone from the live site (browser menu → "Install / Add to Home Screen"). Confirm offline logging works in airplane mode.
4. Launch posts (order): the beta testers ("we're live — share it?") → Product Hunt → Show HN → the 2–3 communities from §3. One honest post each, written as the builder. STRATEGY.md has angles.
5. Email the waitlist (Supabase `leads` where source in `launch-waitlist`, `waitlist-*`): you're live + founders offer.

- [ ] Curls pass · [ ] PRIVATE_MODE=false · [ ] PWA installs from prod
- [ ] Launch posts up · [ ] Waitlist emailed

## §6 — Operating cadence (after launch)

- **Weekly (1h)**: check beta panel + Supabase numbers against ONE metric (week-4 retained loggers — STRATEGY.md); talk to 2 users; fix the top confusion.
- **Before any deploy**: `npm test` + `npm run gate-smoke` (CI also runs tests).
- **Monthly**: re-read [REDTEAM.md](REDTEAM.md) §1 and check falsifying evidence; review Stripe → enrollments reconciliation; `npm audit`.
- **Rule that keeps you honest**: no new features while a LOAD-BEARING assumption is failing its evidence check.

---

## Quick reference — who does what

| | Founder (this runbook) | Claude Code sessions |
|---|---|---|
| Vercel/Stripe/Supabase accounts, secrets | ✅ | ❌ (can't own accounts) |
| Recruiting + talking to users | ✅ | ❌ |
| Launch posts (authentic voice) | ✅ drafts welcome | ✍️ can draft |
| Features, fixes, tests, reviews | ❌ | ✅ |
| AI Coach v1, premium pillar depth | decide *when* | ✅ build |
