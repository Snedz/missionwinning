# Play Billing gate — Mission Winning Android

**Status (1.7.0 / Phase 7):** entitlement **recognition only**. No Play Billing Library, no in-app purchase UI, no Stripe / web checkout links inside the app.

## Product rules

| Rule | Why |
|------|-----|
| Free offline logger is permanent | Core mission; never gated on Super Bundle |
| Super Bundle is recognized via `/api/mobile/premium/status` | Server-side enrollment (web / founder), Bearer session |
| Coach shows adapt depth when `premium == true` | Premium coach UX without sell surfaces |
| Account shows Free logger / Super Bundle chips + refresh | Status only; copy says purchase is not offered in-app |
| Zero Buy / Subscribe / Open Stripe CTAs | Play policy: digital goods → Play Billing when sold on Android |

## What ships in Phase 7

- `AuthRepository.refreshPremium()` → `GET /api/mobile/premium/status`
- Account: entitlement chips + “Refresh entitlement”
- Coach: Access banner (Offline free / Free coach / Super Bundle); product-path adapt preview when premium
- Lab seed adapt remains debug-only for non-premium QA

## What is **blocked** until founder adopts Play Billing

Do **not** implement without an explicit founder decision + Play Console billing setup:

1. `com.android.billingclient` / Billing Library dependency  
2. Subscribe / Buy Super Bundle buttons or paywalls  
3. Deep links to Stripe Checkout, PayPal, or web pricing from product surfaces  
4. Client-side “unlock premium” toggles that bypass server entitlement  
5. Declaring paid digital content in Play listing without Billing integration  

Web Super Bundle (Stripe etc.) remains valid **outside** the Play-distributed APK/AAB. Users enrolled on web refresh entitlement on Android after sign-in.

## When to open the gate

Founder checklist:

1. Play Console → Monetize with Play → products / subscriptions configured  
2. License testers + base plan SKUs for Super Bundle  
3. Backend maps Play purchase tokens → same premium flag as web (`premium/status`)  
4. Legal / refunds copy aligned with Play  
5. Ship a version that adds Billing Library + purchase UI **and** keeps free offline core  

Until then: ship Internal / production as **free app** with optional account sync; Data safety “Payment / purchase history” = **Not in this wedge** ([PLAY_LISTING.md](PLAY_LISTING.md)).

## Related

- [PLAY_LISTING.md](PLAY_LISTING.md) — store copy + data safety  
- [FOUNDER_ACCEPT.md](FOUNDER_ACCEPT.md) — device checks U6 / C8  
- OpenAPI: `/api/mobile/premium/status`  
- Vision: free core + Super Bundle (server-side enrollment)
