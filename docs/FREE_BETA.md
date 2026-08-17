# Alpha mute-pay (`isFreeBeta` flag)

**Status:** ON by default via `isFreeBeta()` / `MwFreeBeta.ENABLED`  
**Why:** Texas LLC filed (~4 weeks) + EIN pending — business Stripe/PayPal cannot open yet. Founder chose **hard no** on individual Stripe interim ([LLC_AND_PAYMENTS.md](LLC_AND_PAYMENTS.md) §1d overridden for this window).

**Launch name:** Mission Winning **Alpha 0.1.0**. This file names the mute-pay flag, not the product.

**Shop restore:** `/bundle` merchandises Super Bundle (Free vs one paid SKU). Live checkout stays muted. Frozen plan: [SUPER_BUNDLE_SHOP_PLAN.md](SUPER_BUNDLE_SHOP_PLAN.md).

## Product rule

- **Mute pay (charges):** no live Stripe, no Payment Link, no Phantom USDC, no fake Subscribe. Waitlist / **Get notified** only.
- **Merchandise the shop:** `/bundle` is a real page — stacked **Free forever** vs **Super Bundle** ($59/year primary, $11.99/mo, $149 lifetime). No 7-day trial. No à la carte pillar SKUs.
- **Unlock depth:** treat everyone as premium-entitled — Coach chat, Fuel Coach, GPS catalogs, Move/Mind/Learn premium sessions, adapt depth. No $ credits wallet. Do not bait-and-switch by gating depth with no buy path.
- **More nav:** Bundle row restored (shop). F-004 (`.695`) demotes the More/rail **Pillars** tier until the first logged workout (`workoutHistory.length` / `basic.workout`); Wedge + You stay. After first workout, pillars reappear.
- Show: logger, Today, Victory, Coach week + depth, free + unlocked pillar tools, Guide, Super Bundle shop (honest “checkout opens when payments go live”).
- Frame: “Alpha — full tools free while we grow with you.” Logger never gated. `isFreeBeta()` is mute-pay, not the product name.

## Flags

| Surface | Flag | Default |
|---------|------|---------|
| Web | `NEXT_PUBLIC_FREE_BETA` | **ON** unless `false` / `0` / `off` |
| Android | `MwFreeBeta.ENABLED` in designsystem | `true` |

Helpers: `isFreeBeta()` · `isFreeBetaPremiumUnlocked()` · `isPaidCheckoutAllowed()` · server `isPremiumBypassEnabled()` (demo **or** mute-pay). The identifier is mute-pay, not the product name.

Turn off after business bank + Stripe/PayPal live:

```bash
# Vercel / .env
NEXT_PUBLIC_FREE_BETA=false
```

```kotlin
// apps/android/.../MwFreeBeta.kt
const val ENABLED: Boolean = false
```

Then grandfather early Alpha users with founders price / enrollment grants — not leftover credits.

## Code entry points

- [`src/lib/freeBeta.ts`](../src/lib/freeBeta.ts) · [`src/lib/premiumServer.ts`](../src/lib/premiumServer.ts) (`isPremiumBypassEnabled`)
- [`src/lib/payments.ts`](../src/lib/payments.ts) `isPaidCheckoutAllowed()` — false while free beta
- [`src/hooks/usePremium.ts`](../src/hooks/usePremium.ts) — premium true while free beta
- `/api/premium/*` + Coach chat/voice — bypass enrollment
- [`UnlockButton`](../src/components/UnlockButton.tsx) → waitlist (Get notified), never checkout, while free beta
- `/bundle` → Super Bundle shop (no redirect to `/log`)
- Android Coach: `MwFreeBeta.ENABLED || auth.premium`; no Play subscribe banner

## Ops

- Acquire free users; measure activated workouts + D7 return + week-4 retention.
- Watch Coach LLM spend (rate limits stay on).
- YC F26: apply with honest free-beta / pre-revenue status (Jul 27 deadline).
- EIN week: flip flags; Subscribe Now becomes live; founders pricing for beta cohort.

## Related

[CONTEXT.md](../CONTEXT.md) · [LLC_AND_PAYMENTS.md](LLC_AND_PAYMENTS.md) · [SUPER_BUNDLE_SHOP_PLAN.md](SUPER_BUNDLE_SHOP_PLAN.md)
