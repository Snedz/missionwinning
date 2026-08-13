# Premium and billing

Mission Winning is **mostly free**. The only paid SKU is the **Super Bundle**. There is no 7-day trial and no à la carte pillar checkout (Train / Fuel / Move / Mind / Learn are not sold separately).

## What's always free

- Workout logger, library, builder, history, benchmarks — **never gated**
- Basic nutrition logging and calculators
- Today dashboard, readiness, Mission Score
- Public guide chapters and exercise catalog
- PFT fitness test (core flow)

No account and no card are required to log a set.

## What Super Bundle includes

One SKU, not four apps. Typical access:

- **Mission Coach** — weekly AI plan + adaptation from your logs (`/coach`)
- **Fuel** — premium recipes and meal depth
- **Move / Mind** — premium guided sessions
- **Learn** — full guidebook depth and programs
- **Track** — advanced features where gated

Exact catalog floors are on `/bundle` (they track shipped content, not empty SKUs). Profile shows your enrollment status.

Standalone `$15/$10/…` figures on the shop compare table are an **illustrative vs-stack**, not live SKUs.

## Plans (one Super Bundle)

- **Founders annual — $59/year** (primary)
- Monthly — $11.99/mo
- Lifetime — $149

## Buying (when checkout is live)

During **free-first beta**, `/bundle` merchandises Super Bundle but **does not charge**. The paid card is **Get notified** (waitlist). Copy: “Checkout opens when payments go live.” Depth stays unlocked so this is not bait-and-switch.

When payments go live:

1. Sign in (Profile) with the email you will pay with.
2. Go to **Bundle** (`/bundle`).
3. Choose monthly, founders annual, or lifetime.
4. Checkout via **Stripe** — card, Apple Pay, Google Pay, PayPal, or **USDC** when offered.
5. **Lifetime only:** you can also **Pay with Phantom (USDC)** on Solana — wallet transfer, no Stripe card form.
6. After payment, premium activates for your account (same email / signed-in user).
7. Refresh Profile if content doesn't unlock immediately (usually instant).

Lifetime is the best plan if you prefer paying with USDC (Stripe or Phantom).

## Restore access

Premium ties to your **signed-in account** and the **email used at checkout**:

1. Sign in with the **same email** you paid with.
2. If still locked, check spam for receipt and contact support with your email and approximate purchase date.
3. Do not rely on browser tricks — server enrollment is authoritative in production.

Free-beta depth unlock is **not** a purchase. “Already included” on `/bundle` appears only after real enrollment once free-beta is off.

## Refunds and cancellation

- **Policy:** [/refunds](/refunds) — 14-day money-back on first paid charge (subscriptions); lifetime/USDC rules on the same page.
- **Subscriptions:** Profile → **Manage billing** opens Stripe’s customer portal (cancel / update card). After the 14-day window, cancel stops future charges; we do not prorate mid-cycle.
- Also see [/terms](/terms). Receipt emails from Stripe include manage links when applicable.

## Beta and demo mode

Beta testers may receive complimentary access — your invite email explains. Production builds do not honor client-side "demo premium" flags. While `FREE_BETA` is on, Coach and pillar depth are unlocked for everyone; checkout stays muted.

## Human coaching

`/coaching` is a **lead form** for 1:1 coaching — separate product from Mission Coach AI and Super Bundle.

More: [mission-coach.md](mission-coach.md), [faq.md](faq.md).
