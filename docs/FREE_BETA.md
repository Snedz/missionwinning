# Free-first beta (LLC / EIN window)

**Status:** ON by default via `isFreeBeta()` / `MwFreeBeta.ENABLED`  
**Why:** Texas LLC filed (~4 weeks) + EIN pending — business Stripe/PayPal cannot open yet. Founder chose **hard no** on individual Stripe interim ([LLC_AND_PAYMENTS.md](LLC_AND_PAYMENTS.md) §1d overridden for this window).

## Product rule

- **Mute pay:** no Super Bundle, checkout, founders pricing, Play subscribe, crypto Lifetime CTAs, Unlock CTAs.
- **Unlock depth:** treat everyone as premium-entitled — Coach chat, Fuel Coach, GPS catalogs, Move/Mind/Learn premium sessions, adapt depth. No $ credits wallet.
- **More nav:** Bundle stays muted. F-004 (`.695`) demotes the More/rail **Pillars** tier until the first logged workout (`workoutHistory.length` / `basic.workout`); Wedge + You stay. After first workout, pillars reappear (progressive disclosure — not a permanent hide).
- Show: logger, Today, Victory, Coach week + depth, free + unlocked pillar tools, Guide.
- Frame: “Open beta — full platform free while we grow with you.”

## Flags

| Surface | Flag | Default |
|---------|------|---------|
| Web | `NEXT_PUBLIC_FREE_BETA` | **ON** unless `false` / `0` / `off` |
| Android | `MwFreeBeta.ENABLED` in designsystem | `true` |

Helpers: `isFreeBeta()` · `isFreeBetaPremiumUnlocked()` · server `isPremiumBypassEnabled()` (demo **or** free beta).

Turn off after business bank + Stripe/PayPal live:

```bash
# Vercel / .env
NEXT_PUBLIC_FREE_BETA=false
```

```kotlin
// apps/android/.../MwFreeBeta.kt
const val ENABLED: Boolean = false
```

Then grandfather early beta users with founders price / enrollment grants — not leftover credits.

## Code entry points

- [`src/lib/freeBeta.ts`](../src/lib/freeBeta.ts) · [`src/lib/premiumServer.ts`](../src/lib/premiumServer.ts) (`isPremiumBypassEnabled`)
- [`src/hooks/usePremium.ts`](../src/hooks/usePremium.ts) — premium true while free beta
- `/api/premium/*` + Coach chat/voice — bypass enrollment
- [`src/lib/navConfig.ts`](../src/lib/navConfig.ts) · [`src/lib/moreSheetTiers.ts`](../src/lib/moreSheetTiers.ts) — Pillars demoted until first workout (F-004)
- [`UnlockButton`](../src/components/UnlockButton.tsx) → `null` when free beta
- `/bundle` → redirect `/log`
- Android Coach: `MwFreeBeta.ENABLED || auth.premium`; no Play subscribe banner

## Ops

- Acquire free users; measure activated workouts + D7 return + week-4 retention.
- Watch Coach LLM spend (rate limits stay on).
- YC F26: apply with honest free-beta / pre-revenue status (Jul 27 deadline).
- EIN week: flip flags; restore Bundle; founders pricing for beta cohort.

## Related

[CONTEXT.md](../CONTEXT.md) · [LLC_AND_PAYMENTS.md](LLC_AND_PAYMENTS.md) · [YC_THESIS.md](YC_THESIS.md)
