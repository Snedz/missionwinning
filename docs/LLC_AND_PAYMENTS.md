# LLC + payments checklist

**Purpose:** Founder steps to form an entity and turn on Stripe (PayPal / USDC via Stripe).  
**Not legal/tax advice** — confirm with a CPA/attorney in your jurisdiction.  
**Companion:** [SETUP.md](archive/SETUP.md) · [docs/STRIPE_PREMIUM_SETUP.md](STRIPE_PREMIUM_SETUP.md) · [LAUNCH_RUNBOOK.md](LAUNCH_RUNBOOK.md) §4 · [PAY_READY_LEGAL.md](PAY_READY_LEGAL.md) (Terms / Privacy / Refunds / DPA / MSA / cyber) · [PRE_REVENUE_CHECKLIST.md](PRE_REVENUE_CHECKLIST.md) · [legal/ENTITY_RESEARCH.md](legal/ENTITY_RESEARCH.md) · [STRIPE_DISPUTE_OPS.md](STRIPE_DISPUTE_OPS.md)

**Entity research / OA draft:** [legal/ENTITY_RESEARCH.md](legal/ENTITY_RESEARCH.md) · [legal/OPERATING_AGREEMENT_DRAFT.md](legal/OPERATING_AGREEMENT_DRAFT.md) — do not duplicate Stripe webhook steps here; see §2 and STRIPE_PREMIUM_SETUP.

---

## Order (do this before native apps)

1. LLC (or local equivalent) + EIN  
2. Business bank account  
3. Stripe under the business (or sole-prop first, migrate later)  
4. Live **Checkout Sessions** (or Payment Links) + webhook on Vercel  
5. Public **refund policy** live at `/refunds` + support path that can issue refunds  
6. Enable PayPal + Crypto (USDC) in Stripe Dashboard after LLC + support/refund path exists ([ENV.md](ENV.md))  
7. **Before school/enterprise or data at scale:** cyber liability insurance quote (~$200–600/yr ballpark — verify with broker); DPA/MSA from [legal/](legal/)

---

## §1 — Entity + bank

- [ ] Form **Mission Winning LLC** (or equivalent) via state portal / attorney / formation service
- [ ] Get **EIN** (US) or local tax ID
- [ ] Open **business checking** (Mercury, Relay, or local bank)
- [ ] Decide support inbox: `support@missionwinning.com` (or `hello@`) — create mailbox before charging anyone
- [ ] Cyber liability insurance (optional day one; required before institutional data at scale) — [PAY_READY_LEGAL.md](PAY_READY_LEGAL.md)

Optional later: Mission Winning Foundation (501(c)(3)) — see [SETUP.md](archive/SETUP.md). Not required for Stripe launch.

**Capital priority (unlimited funds):** entity + counsel + trademark before ads — [PRELAUNCH_CAPITAL.md](PRELAUNCH_CAPITAL.md).

---

## §1b — Counsel review (pay-ready pack)

Live pages already exist; stamp them before charging at scale. **Not legal advice.**

- [ ] Send counsel: `/terms` `/privacy` `/refunds` (+ `/dmca` if relevant) and [PAY_READY_LEGAL.md](PAY_READY_LEGAL.md)
- [ ] Confirm governing law matches LLC formation state
- [ ] Confirm arbitration / refund language is acceptable for Stripe + your jurisdiction
- [ ] File / confirm DMCA agent if US ([LEGAL_SAFETY.md](LEGAL_SAFETY.md))
- [ ] Do **not** claim cyber insurance in Privacy until a policy is bound

---

## §1c — Trademark (“Mission Winning”)

Cheap insurance vs later rebrand. Use a trademark attorney or reputable filing firm.

- [ ] Clearance search (USPTO + common-law / domains / app stores)
- [ ] File intent-to-use or use-based application for software / fitness coaching app classes (counsel picks classes)
- [ ] Optional: logo mark if distinct from word mark
- [ ] Calendar office-action response deadlines; do not DIY after a refusal without counsel
- [ ] Hold off on large brand spends until clearance is clean enough to proceed

---

## §2 — Stripe (code already ready)

App path: `UnlockButton` → `POST /api/checkout` (Sessions) or Payment Link → `/api/stripe-webhook` → `enrollments` → `usePremium`.  
Manage: Profile → **Manage billing** → `POST /api/billing-portal`.

### Products (recommended founders pricing)

| Product | Price | Stripe Price env |
|---------|-------|------------------|
| Super Bundle — monthly | $11.99/mo | `STRIPE_PRICE_BUNDLE_MONTHLY` |
| Super Bundle — 12 months | $59/yr | `STRIPE_PRICE_BUNDLE_12MO` |
| Super Bundle — Founders Lifetime | $149 one-time | `STRIPE_PRICE_BUNDLE_LIFETIME` |

### Dashboard steps

1. https://dashboard.stripe.com — account under LLC when possible  
2. Product catalog → Prices for each tier above  
3. Payment methods → Card, Link, wallets; PayPal after LLC; **Crypto (USDC)** after Stripe crypto eligibility  
4. Customer portal → allow cancel / update payment method  
5. Developers → Webhooks → `https://www.missionwinning.com/api/stripe-webhook`  
   - Event: `checkout.session.completed`  
   - Copy `whsec_…` → `STRIPE_WEBHOOK_SECRET`

### Vercel Production env

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

Optional Payment Link fallback during migration:

```
NEXT_PUBLIC_STRIPE_LINK_BUNDLE=https://buy.stripe.com/...
NEXT_PUBLIC_STRIPE_LINK_BUNDLE_LIFETIME=https://buy.stripe.com/...
```

Redeploy after setting env.

### Verify

```bash
# Test mode first: card 4242 4242 4242 4242 (signed-in → /bundle)
node scripts/verify-stripe-enrollment.mjs --verify-enrollment buyer@email.com
node scripts/verify-stripe-enrollment.mjs --check-gates
node scripts/verify-stripe-enrollment.mjs --check-checkout
# Optional: --ping-webhook (needs STRIPE_WEBHOOK_SECRET)
```

Sign in as buyer → `/api/premium/status` → `premium: true` → Coach unlocks.

Full detail: [STRIPE_PREMIUM_SETUP.md](STRIPE_PREMIUM_SETUP.md).

---

## §3 — PayPal + USDC (after LLC)

Enable **inside Stripe** (Checkout automatic payment methods) — not a separate PayPal button path.  
Standalone PayPal webhook ([ENV.md](ENV.md)) remains for a future MoR path; unconfigured returns 503.

Crypto: complete Stripe USDC eligibility, then lifetime buyers can choose USDC in Checkout.

**Optional:** Phantom wallet USDC for lifetime only — [PHANTOM_USDC_CHECKOUT.md](PHANTOM_USDC_CHECKOUT.md).

---

## §4 — What not to buy yet

- Dual native app builds  
- Social media agency  
- Paid ads (until week-4 retention — [PRELAUNCH_CAPITAL.md](PRELAUNCH_CAPITAL.md))  
- Separate Coinbase Commerce / BitPay stack (Stripe USDC is enough)

**Spend here instead:** formation fees, Stripe, bookkeeping, trademark, counsel review, outreach VA ([OUTREACH_VA_BRIEF.md](OUTREACH_VA_BRIEF.md)), your time on beta invites.
