# LLC + payments checklist

**Purpose:** Founder steps to form an entity and turn on Stripe (PayPal later).  
**Not legal/tax advice** — confirm with a CPA/attorney in your jurisdiction.  
**Companion:** [SETUP.md](../SETUP.md) · [docs/STRIPE_PREMIUM_SETUP.md](STRIPE_PREMIUM_SETUP.md) · [LAUNCH_RUNBOOK.md](../LAUNCH_RUNBOOK.md) §4

---

## Order (do this before native apps)

1. LLC (or local equivalent) + EIN  
2. Business bank account  
3. Stripe under the business (or sole-prop first, migrate later)  
4. Live Payment Links + webhook on Vercel  
5. PayPal only after LLC + support/refund path exists ([ENV.md](../ENV.md))

---

## §1 — Entity + bank

- [ ] Form **Mission Winning LLC** (or equivalent) via state portal / attorney / formation service
- [ ] Get **EIN** (US) or local tax ID
- [ ] Open **business checking** (Mercury, Relay, or local bank)
- [ ] Decide support inbox: `support@missionwinning.com` (or `hello@`) — create mailbox before charging anyone

Optional later: Mission Winning Foundation (501(c)(3)) — see [SETUP.md](../SETUP.md). Not required for Stripe launch.

---

## §2 — Stripe (code already ready)

App path: `UnlockButton` → Payment Link → `/api/stripe-webhook` → `enrollments` → `usePremium`.

### Products (recommended founders pricing)

| Product | Price | Env var |
|---------|-------|---------|
| Super Bundle — 12 months | $59/yr recurring | `NEXT_PUBLIC_STRIPE_LINK_BUNDLE` |
| Super Bundle — Founders Lifetime | $149 one-time | `NEXT_PUBLIC_STRIPE_LINK_BUNDLE_LIFETIME` |

### Dashboard steps

1. https://dashboard.stripe.com — account under LLC when possible  
2. Product catalog → Payment Links for each product  
3. Success URL: `https://www.missionwinning.com/bundle?checkout=success`  
4. Developers → Webhooks → `https://www.missionwinning.com/api/stripe-webhook`  
   - Event: `checkout.session.completed`  
   - Copy `whsec_…` → `STRIPE_WEBHOOK_SECRET`

### Vercel Production env

```
DEMO_PREMIUM=false
NEXT_PUBLIC_STRIPE_LINK_BUNDLE=https://buy.stripe.com/...
NEXT_PUBLIC_STRIPE_LINK_BUNDLE_LIFETIME=https://buy.stripe.com/...
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_SERVICE_ROLE_KEY=...   # required for webhook enrollment writes
```

Redeploy after setting env.

### Verify

```bash
# Test mode first: card 4242 4242 4242 4242
node scripts/verify-stripe-enrollment.mjs --verify-enrollment buyer@email.com
node scripts/verify-stripe-enrollment.mjs --check-gates
# Optional: --ping-webhook (needs STRIPE_WEBHOOK_SECRET)
```

Sign in as buyer → `/api/premium/status` → `premium: true` → Coach unlocks.

Full detail: [STRIPE_PREMIUM_SETUP.md](STRIPE_PREMIUM_SETUP.md).

---

## §3 — PayPal (after LLC)

Deferred until entity + Stripe are live. Set `PAYPAL_WEBHOOK_ID` + secrets per [ENV.md](../ENV.md). Unconfigured PayPal returns 503; forged requests 401.

---

## §4 — What not to buy yet

- Dual native app builds  
- Social media agency  
- Paid ads  

Spend here: formation fees, Stripe, bookkeeping, your time on beta invites.
