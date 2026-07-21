# Play Billing — Mission Winning Android

**Status (1.14.0 / Phase 15):** Super Bundle via **Google Play Billing** on Coach only. Free offline logger remains permanent.

## Product rules

| Rule | Why |
|------|-----|
| Free offline logger is permanent | Core mission; never gated on Super Bundle |
| Super Bundle deepens coach only | Insights / adapt depth — not sets, history, or routines |
| Purchase only via Play Billing | Play policy for digital goods in the APK/AAB |
| Server grants enrollment | Client never trusts a local “unlock” flag alone |
| No Stripe / PayPal / web checkout links in-app | Web Super Bundle stays on www only |

## SKUs (Play Console)

Create **subscription** products (or match aliases):

| Product ID | Suggested plan |
|------------|----------------|
| `super_bundle_monthly` | Super Bundle monthly |
| `super_bundle_yearly` | Super Bundle yearly |

Package: `com.missionwinning.app` (debug suffix `.debug` accepted by server if base matches).

License testers required for Internal testing purchases.

## Client

- `PlayBillingGateway` (`:app`) — Billing Library 7, query offers, launch flow, acknowledge
- After purchase → `POST /api/mobile/premium/play-purchase` → `AuthRepository.refreshPremium()`
- UI: **Coach** Access card → “Subscribe Super Bundle” (signed-in + free only)
- Logger / Active / History: **no** paywall

## Server

| Env | Purpose |
|-----|---------|
| `GOOGLE_PLAY_PACKAGE_NAME` | e.g. `com.missionwinning.app` |
| `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` | Service account JSON (Android Publisher API) |
| `PLAY_BILLING_DEV_GRANT=true` | **Dev only** — grant without Google verify (blocked in production) |

Endpoint: `POST /api/mobile/premium/play-purchase`  
Body: `{ productId, purchaseToken, packageName?, orderId? }`  
On success: enrollment row `provider=play_billing` → same `GET /api/mobile/premium/status` as web.

## Founder checklist

1. Play Console → Monetize → subscriptions with IDs above  
2. Link service account to Play Console (API access)  
3. Set env on Vercel (package + service account JSON)  
4. License testers; Internal track AAB  
5. Buy with tester → Coach shows Super Bundle depth  
6. Cancel in Play → after status refresh, free depth only; logger unchanged  

## Data safety

Payment / purchase history: **Yes** when user buys Super Bundle via Play (processed by Google; app stores purchase token only for server verify). See [PLAY_LISTING.md](PLAY_LISTING.md).

## Related

- [FOUNDER_ACCEPT.md](FOUNDER_ACCEPT.md)  
- OpenAPI: `/api/mobile/premium/play-purchase`  
- Vision: free core + Super Bundle  
