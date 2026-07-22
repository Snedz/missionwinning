> Superseded by [LAUNCH_RUNBOOK.md](../LAUNCH_RUNBOOK.md) as of 2026-07-19 (Wave 9).

# Track D — Go live + earn

Founder-ops checklist wired to scripts. **You** own Vercel, Stripe, and Supabase accounts — agents run the verify commands locally or against prod URLs.

Full narrative: [LAUNCH_RUNBOOK.md](../LAUNCH_RUNBOOK.md) · [BETA_LAUNCH_OPS.md](archive/BETA_LAUNCH_OPS.md)

---

## Day-of go-public (copy-paste)

Do **not** flip `PRIVATE_MODE=false` until §3 beta gates pass (Basic Training ≥60%).

```bash
# 1) Gate still ON — fail if launch env incomplete
LAUNCH_STRICT=true \
SMOKE_BASE_URL=https://www.missionwinning.com \
SMOKE_ACCESS_SECRET=<PRIVATE_ACCESS_SECRET> \
npm run launch-verify

# 2) Stripe enrollment shape (after a test checkout)
node scripts/verify-stripe-enrollment.mjs --verify-enrollment <buyer@email>
# Optional: --check-gates / --ping-webhook (needs STRIPE_WEBHOOK_SECRET)

# 3) Flip on Vercel: PRIVATE_MODE=false → Redeploy

# 4) Public + PWA smoke
SMOKE_BASE_URL=https://www.missionwinning.com \
SMOKE_ALLOW_PUBLIC=true \
SMOKE_EXPECT_PWA=true \
npm run launch-verify
```

---

## One command chain

```bash
# Local checklist (migrations list, env shape)
npm run launch-verify

# Against production (gate still on)
SMOKE_BASE_URL=https://www.missionwinning.com \
SMOKE_ACCESS_SECRET=<PRIVATE_ACCESS_SECRET> \
npm run launch-verify

# After PRIVATE_MODE=false (public landing + PWA)
SMOKE_BASE_URL=https://www.missionwinning.com \
SMOKE_ALLOW_PUBLIC=true \
SMOKE_EXPECT_PWA=true \
npm run launch-verify
```

Steps: `check-env --launch` → Supabase migrations/probe → Stripe gates → `gate-smoke` → `e2e:critical`.

Use `LAUNCH_STRICT=true npm run launch-verify` to **fail** on incomplete launch env (recommended before go-public).

---

## §1 — Secrets & env (before any public flip)

```bash
openssl rand -base64 32   # PRIVATE_ACCESS_SECRET (rotate — never reuse "Done")
openssl rand -base64 32   # YOUTH_CONSENT_SECRET
openssl rand -base64 32   # NUDGE_SECRET
```

Vercel Production:

| Variable | Value |
|----------|--------|
| `PRIVATE_ACCESS_SECRET` | New rotated secret |
| `DEMO_PREMIUM` | `false` |
| `PRIVATE_MODE` | `true` until §3 |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` from Stripe dashboard |
| `NEXT_PUBLIC_STRIPE_LINK_BUNDLE` | Live payment link |
| `NEXT_PUBLIC_SENTRY_DSN` | Optional — Track B |

Sync: `npm run sync-vercel-env` (GitHub Secrets) or Vercel dashboard.

Verify locally:

```bash
npm run check-env -- --launch
```

---

## §2 — Supabase

1. Run every file in `supabase/migrations/` in filename order (finish with `20260705_leads_api_only.sql`).
2. Probe (needs service role in shell):

```bash
SUPABASE_SERVICE_ROLE_KEY=... NEXT_PUBLIC_SUPABASE_URL=... \
  node scripts/verify-supabase-security.mjs --probe
```

---

## §3 — Stripe end-to-end

1. Stripe Dashboard → Webhook → `https://www.missionwinning.com/api/stripe-webhook` → `checkout.session.completed`.
2. Test card `4242 4242 4242 4242` on a **test** payment link first.
3. Signed webhook ping:

```bash
SMOKE_BASE_URL=https://www.missionwinning.com \
STRIPE_WEBHOOK_SECRET=whsec_... \
node scripts/verify-stripe-enrollment.mjs --ping-webhook
```

4. Confirm enrollment row:

```bash
SUPABASE_SERVICE_ROLE_KEY=... NEXT_PUBLIC_SUPABASE_URL=... \
node scripts/verify-stripe-enrollment.mjs --verify-enrollment buyer@example.com
```

5. Premium gates (no session → content APIs 403):

```bash
npm run verify-premium
# or: SMOKE_BASE_URL=... node scripts/verify-stripe-enrollment.mjs --check-gates
```

---

## §4 — Go public (after beta gates in PLAN.md)

1. `PRIVATE_MODE=false` on Vercel Production → redeploy.
2. Re-run launch verify with PWA flags (see top).
3. Install PWA on your phone; airplane-mode test on `/log`.
4. Confirm Sentry receives a test error if `NEXT_PUBLIC_SENTRY_DSN` is set.

---

## Done when

- [ ] `npm run launch-verify` passes against production URL
- [ ] `PRIVATE_MODE=false` + PWA smoke passes (`SMOKE_EXPECT_PWA=true`)
- [ ] One real or test enrollment row in Supabase `enrollments`
- [ ] Premium content APIs 403 without enrollment; enrolled user sees Coach unlock
- [ ] Errors visible in Sentry (if DSN configured)
