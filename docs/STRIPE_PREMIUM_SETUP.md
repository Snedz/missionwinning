# Stripe + premium enrollment

Mission Coach and Super Bundle premium are **code-complete**; production needs live Stripe + webhook env.

---

## What ships today

| Piece | Path |
|-------|------|
| Checkout links | `UnlockButton` → `NEXT_PUBLIC_STRIPE_LINK_BUNDLE` / `_PREMIUM` |
| Webhook | [`app/api/stripe-webhook/route.ts`](../app/api/stripe-webhook/route.ts) |
| Enrollment grant | [`src/lib/premiumServer.ts`](../src/lib/premiumServer.ts) → `enrollments` table |
| Coach premium gate | [`src/hooks/useCoachPlan.ts`](../src/hooks/useCoachPlan.ts) — free taster week, then `locked` without premium |
| Premium status API | `/api/premium/status` + [`usePremium`](../src/hooks/usePremium.ts) |

---

## Production setup

1. Stripe Dashboard → Products → Super Bundle payment link
2. Vercel env (Production):
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_STRIPE_LINK_BUNDLE`
   - `STRIPE_WEBHOOK_SECRET`
   - `DEMO_PREMIUM=false`
3. Stripe → Webhooks → endpoint `https://www.missionwinning.com/api/stripe-webhook`
   - Event: `checkout.session.completed`
4. Test with a real card (or Stripe test mode on Preview):
   - Complete checkout → check Supabase `enrollments` for buyer email
   - Sign in with that email → `/coach` regenerates weekly plan (not locked)
   - Return URL: configure Stripe Payment Link success URL → `/bundle?checkout=success`
   - Verify: `node scripts/verify-stripe-enrollment.mjs` (row shape)
   - Verify gates: `npm run verify-premium` or `--check-gates` with `SMOKE_BASE_URL`
   - Webhook test: `--ping-webhook` with `STRIPE_WEBHOOK_SECRET`

---

## Checkout return UX

After payment, users land on `/bundle?checkout=success`. The page shows **Premium active** when `/api/premium/status` resolves true and fires `checkout_completed` in PostHog.

---

## Coach v1 premium behavior

- **Free:** one generated week (taster); adaptation within the week; locked after week rollover
- **Premium:** unlimited week regeneration + rollover via `generateWeek` / `adaptPlan`; fatigue-aware split when strain ≥ 70

Analytics: `coach_taster_locked`, `coach_week_generated` with `premium` property.

---

## After beta gates (Phase I)

Per [PLAN.md](../PLAN.md) Phase I — enable live Stripe before scaling invites; keep free core unchanged.
