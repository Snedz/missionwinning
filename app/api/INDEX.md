# app/api/

> HTTP API route handlers — thin wrappers over `src/lib/`.  
> Full reference: [docs/API.md](../../docs/API.md) · Security: [docs/OWASP_AUDIT.md](../../docs/OWASP_AUDIT.md)

## Security inventory (auth · rate · schema)

Legend:

| Auth | Meaning |
|------|---------|
| **public** | No session (may still be gate-cookie limited while `PRIVATE_MODE`) |
| **gate** | Reachable while private gate on (proxy allows or cookie) |
| **session** | Supabase user via cookie/JWT |
| **premium** | Session + server enrollment |
| **teacher** | Session + class PIN or creator |
| **sig** | Provider signature (Stripe/PayPal) |
| **secret** | Shared secret header/bearer |
| **token** | Signed unsubscribe/consent token |

| Rate | Default memory limiter; Upstash when configured |

---

### Mobile (Android / future iOS)

| Route | Methods | Auth | Rate | Body |
|-------|---------|------|------|------|
| `mobile/coach/plan` | GET, POST | public if not PRIVATE_MODE; else Bearer/cookie/gate | 30/min | Zod `mobileCoachPlanBodySchema` · OpenAPI [openapi-mobile.yaml](../../docs/openapi-mobile.yaml) |
| `mobile/coach/adapt` | POST | same bootstrap rules | 30/min | Zod `mobileCoachAdaptBodySchema` |
| `mobile/workouts` | POST | optional Bearer (sync when present) | 40/min | Zod `mobileWorkoutLogBodySchema` |

### Gate & leads

| Route | Methods | Auth | Rate | Body |
|-------|---------|------|------|------|
| `private-access` | POST | public password | 8/min/IP | password |
| `leads` | POST | public (gate path) | 5/min/IP | Zod `leadsBodySchema`; fire-and-forget confirm email |
| `leads/unsubscribe` | GET | public token | 20/min/IP | HMAC `NUDGE_SECRET` |
| `journey/welcome` | POST | session | 5/min/IP | one-time welcome email |

### Coach

| Route | Methods | Auth | Rate | Body |
|-------|---------|------|------|------|
| `coach/daily-insight` | POST | session or gate app access | 12/min + 32 KiB | Zod |
| `coach/plan-voice` | POST | session or gate app access + premium | 6/min + 64 KiB | Zod |
| `coach/chat` | POST | app access + premium | 10/min + 32 KiB | Zod `coachChatSchema`; 402 free; 503 offline |
| `referral` | GET/POST | session | 20/min GET · 5/min POST | Lazy MW-code; redeem ≤7d; service role |
| `cron/weekly-digest` | GET | CRON_SECRET | — | Monday founder email; dryRun |

### Premium content

| Route | Methods | Auth | Rate | Notes |
|-------|---------|------|------|-------|
| `premium/status` | GET | public → anonymous free | — | Never trusts client `mw_premium` in prod |
| `premium/recipes` | GET | premium | — | 401/403 anonymous |
| `premium/programs` | GET | premium | — | |
| `premium/mobility` | GET | premium | — | |
| `premium/mind` | GET | premium | — | |
| `premium/fuel-plan` | GET | premium | — | |
| `premium/guidebook` | GET | premium | — | |

### Fuel helpers

| Route | Methods | Auth | Rate | Body |
|-------|---------|------|------|------|
| `fuel/search-food` | GET | public/gate | 30/min | query |
| `fuel/barcode` | GET | public/gate | 30/min | query |
| `fuel/estimate-meal` | POST | public/gate | 10/min | Zod |

### School

| Route | Methods | Auth | Rate | Notes |
|-------|---------|------|------|-------|
| `school/class` | POST | session | 10/min/IP | Zod create schema |
| `school/class/mine` | GET | session | — | |
| `school/class/[code]/access` | GET, POST | session + PIN | — | |
| `school/class/[code]/verify` | GET, POST | gate + PIN | — | |
| `school/class/[code]/stats` | GET | teacher | — | IDOR-closed |
| `school/class/[code]/leaderboard` | GET | teacher | — | IDOR-closed |
| `school/class/[code]/export` | GET | teacher | — | redacted ids |

### Youth (COPPA-sensitive)

| Route | Methods | Auth | Rate | Notes |
|-------|---------|------|------|-------|
| `youth/consent-verify` | POST | token HMAC | limited | fail-closed secret |
| `youth/consent-notify` | POST | optional session | 3/min/IP | Zod `youthConsentNotifySchema` |
| `youth/consent-status` | GET | token/session | — | |
| `youth/consent-confirm` | GET | token | — | |

### Journey, nudges, cron

| Route | Methods | Auth | Rate |
|-------|---------|------|------|
| `journey/nudge` | POST | session | 5/min/IP + 4 KiB body | Zod `journeyNudgeBodySchema` |
| `nudges/unsubscribe` | GET | signed token | 20/min/IP | query `u`+`t` |
| `cron/nudges` | GET | `Authorization: Bearer CRON_SECRET` | — | |

### Checkout & webhooks

| Route | Methods | Auth | Rate | Notes |
|-------|---------|------|------|-------|
| `checkout` | POST | session | 10/min | Stripe Checkout session |
| `billing-portal` | POST | session | 10/min | |
| `crypto-checkout/intent` | POST | session | 8/min | Phantom USDC lifetime; amount server-fixed |
| `crypto-checkout/confirm` | POST | session | 10/min | Zod; intent ownership enforced; on-chain verify |
| `stripe-webhook` | POST | Stripe HMAC sig | — | enroll + checkout recovery + dispute founder notify |
| `paypal-webhook` | POST | PayPal REST verify | — | service role enroll |
| `beta/metrics` | GET | beta admin email **or** `x-beta-admin-secret` | — | service role aggregate |

### Wearables (flag: `NEXT_PUBLIC_WEARABLES`)

| Route | Methods | Auth | Rate | Body |
|-------|---------|------|------|------|
| `wearables/status` | GET | session | 30/min | — |
| `wearables/sync` | POST | session | 8/min | Zod `wearableSyncSchema` |
| `wearables/disconnect` | POST | session | 10/min | Zod `wearableDisconnectSchema` |
| `wearables/hub-ingest` | POST | session | 20/min | Zod `wearableHubIngestSchema` |
| `wearables/oauth/[provider]/start` | GET | session | 10/min | redirect to vendor |
| `wearables/oauth/[provider]/callback` | GET | signed state | 20/min | code exchange → `/profile` |

---

## Red-team quick curls (Wave 1)

```bash
BASE=https://www.missionwinning.com   # or localhost:3000

# Premium must not leak
curl -sI "$BASE/api/premium/recipes"          # 401/403
curl -sI "$BASE/api/premium/programs"         # 401/403/503

# Webhooks reject forgery
curl -s -X POST "$BASE/api/stripe-webhook" -H 'Content-Type: application/json' -d '{}'
curl -s -X POST "$BASE/api/paypal-webhook" -H 'Content-Type: application/json' -d '{}'

# Cron / admin
curl -sI "$BASE/api/cron/nudges"              # 401
curl -sI "$BASE/api/beta/metrics"             # 403

# School IDOR
curl -sI "$BASE/api/school/class/MWTEST/leaderboard"  # 401/403

# Crypto without session
curl -s -X POST "$BASE/api/crypto-checkout/intent" -H 'Content-Type: application/json' -d '{}'  # 401
```

Automated: `SMOKE_BASE_URL=… npm run security-smoke` (alias of `gate-smoke`).

---

## Adding a route

1. Create `app/api/.../route.ts`
2. Logic in `src/lib/`
3. Zod in `src/lib/apiSchemas.ts`
4. `rateLimitAsync` on mutating / expensive public endpoints
5. Wrap with `withApiLogging('path/under/api', handler)`
6. Update **this inventory** + [docs/API.md](../../docs/API.md)

## Deleted — do not recreate

- `app/api/coach/plan/route.ts` — use client `src/lib/coach/` + `plan-voice`

## Related

- [../INDEX.md](../INDEX.md) — page routes
- [../../src/lib/apiSchemas.ts](../../src/lib/apiSchemas.ts)
- [../../docs/SECURITY_AUDIT_TRIAGE.md](../../docs/SECURITY_AUDIT_TRIAGE.md)
