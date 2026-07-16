# Stripe + premium enrollment

Mission Coach and Super Bundle premium are **code-complete**; production needs live Stripe + webhook env.

---

## What ships today

| Piece | Path |
|-------|------|
| Checkout Sessions (preferred) | `UnlockButton` → `POST /api/checkout` → Stripe hosted Checkout |
| Payment Links (fallback) | `NEXT_PUBLIC_STRIPE_LINK_*` when Sessions unconfigured |
| Billing portal | `POST /api/billing-portal` → Profile **Manage billing** |
| Webhook | [`app/api/stripe-webhook/route.ts`](../app/api/stripe-webhook/route.ts) |
| Enrollment grant | [`src/lib/premiumServer.ts`](../src/lib/premiumServer.ts) → `enrollments` (`user_id` + email) |
| Coach premium gate | [`src/hooks/useCoachPlan.ts`](../src/hooks/useCoachPlan.ts) — free taster week, then `locked` without premium |
| Premium status API | `/api/premium/status` + [`usePremium`](../src/hooks/usePremium.ts) |

Payment methods (Dashboard-controlled): **Card**, **Link**, **Apple Pay / Google Pay**, **PayPal**, **Crypto (USDC)**. Lifetime is the primary USDC SKU; monthly stays fiat.

---

## Production setup (Checkout Sessions)

**Entity first (recommended when funded):** [LLC_AND_PAYMENTS.md](LLC_AND_PAYMENTS.md).

1. Stripe Dashboard → Products → create Prices for monthly ($11.99), annual ($59), lifetime ($149)
2. Settings → Payment methods → enable Card, Link, wallets, PayPal (after LLC), **Crypto / USDC** (complete Stripe KYB eligibility first)
3. Settings → Billing → Customer portal → enable cancel / update payment method
4. Vercel env (Production):

```
DEMO_PREMIUM=false
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PRICE_BUNDLE_MONTHLY=price_...
STRIPE_PRICE_BUNDLE_12MO=price_...
STRIPE_PRICE_BUNDLE_LIFETIME=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_CHECKOUT=true
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_APP_URL=https://www.missionwinning.com
```

Optional fallback while migrating:

```
NEXT_PUBLIC_STRIPE_LINK_BUNDLE=https://buy.stripe.com/...
NEXT_PUBLIC_STRIPE_LINK_BUNDLE_LIFETIME=https://buy.stripe.com/...
```

5. Stripe → Webhooks → `https://www.missionwinning.com/api/stripe-webhook`  
   - Event: `checkout.session.completed`  
   - Session metadata includes `user_id`, `product_id`, `plan_id`
6. Test (signed-in user → `/bundle` → Unlock):
   - Card `4242…` or USDC in test mode when crypto enabled
   - Supabase `enrollments` row has buyer email + `user_id` when Checkout Sessions used
   - Return URL: `/bundle?checkout=success&session_id=…`
   - Profile → **Manage billing** opens Customer Portal
   - Verify: `node scripts/verify-stripe-enrollment.mjs --check-gates`
   - Webhook: `--ping-webhook` with `STRIPE_WEBHOOK_SECRET`
   - Sessions smoke: `--check-checkout` (expects 401 without session when Sessions configured)

Entity + bank before charging at scale: [LLC_AND_PAYMENTS.md](LLC_AND_PAYMENTS.md).

---

## Legacy Payment Links path

Still supported when `NEXT_PUBLIC_STRIPE_CHECKOUT` is unset and Payment Link env vars are set. Success URL: `/bundle?checkout=success`. Prefer Sessions for wallets + crypto + `user_id` enrollment.

---

## Checkout return UX

After payment, users land on `/bundle?checkout=success`. The page shows **Premium active** when `/api/premium/status` resolves true and fires `checkout_completed` in PostHog.

---

## Coach v1 premium behavior

- **Free:** one generated week (taster); adaptation within the week; locked after week rollover
- **Premium:** unlimited week regeneration + rollover via `generateWeek` / `adaptPlan`; fatigue-aware split when strain ≥ 70

Analytics: `coach_taster_locked`, `coach_week_generated` with `premium` property.

---

## Known gaps (documented, not blocking)

- Subscription cancel / `invoice.payment_failed` do not yet revoke `enrollments` — manage via Customer Portal + support
- Crypto on **subscriptions** depends on Stripe account eligibility; lifetime (`mode: payment`) is the reliable USDC path

**Optional wallet path:** [PHANTOM_USDC_CHECKOUT.md](PHANTOM_USDC_CHECKOUT.md) — lifetime $149 USDC via Phantom (no Stripe).

---

## After beta gates (Phase I)

Per [PLAN.md](../PLAN.md) Phase I — enable live Stripe before scaling invites; keep free core unchanged. Flip-day checklist: [SOFT_LAUNCH_DAY.md](SOFT_LAUNCH_DAY.md).
