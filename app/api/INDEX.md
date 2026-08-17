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
| `mobile/coach/plan` | GET, POST | public if web gate off (`isPrivateModeEnabled`); else Bearer/cookie/gate | 30/min | Zod `mobileCoachPlanBodySchema` · OpenAPI [openapi-mobile.yaml](../../docs/openapi-mobile.yaml) |
| `mobile/coach/adapt` | POST | same bootstrap rules | 30/min | Zod `mobileCoachAdaptBodySchema` |
| `mobile/workouts` | POST | optional Bearer (sync when present) | 40/min | Zod `mobileWorkoutLogBodySchema` (legacy summary; prefer sync v2) |
| `mobile/sync/workouts` | POST | Bearer | 30/min | Batch ≤50 full-fidelity upserts (client_id + revision) |
| `mobile/sync/workouts` | GET | Bearer | 60/min | Cursor pull `?since=&limit=` including tombstones |
| `mobile/sync/routines` | POST | Bearer | 30/min | Batch ≤50 routine template upserts |
| `mobile/sync/routines` | GET | Bearer | 60/min | Cursor pull routines (tombstones included) |
| `mobile/sync/customs` | POST, GET | Bearer | 30–60/min | Custom exercises sync |
| `mobile/sync/prefs` | POST, GET | Bearer | 30–60/min | Units/rest/equipment/bar prefs |
| `mobile/premium/status` | GET | Bearer (or cookie fallback) | 60/min | Super Bundle flag for native Account |
| `mobile/premium/play-purchase` | POST | Bearer | 20/min/IP | Zod Play token → enrollment. Logger never depends on this |
| `mobile/telemetry` | POST | public (opaque install id only) | 20/min | Privacy-first weekly Android heartbeat |

### Gate & leads

| Route | Methods | Auth | Rate | Body |
|-------|---------|------|------|------|
| `private-access` | POST | public password | 8/min/IP (Upstash) | password |
| `private-access/session` | POST | Bearer access_token (getUser) + territory | 20/min/IP | mints gate cookie after OAuth; 401 no bearer; 403 blocked ISO |
| `geo` | GET | public (CDN country headers) | 60/min/IP | first-visit lang/units; `blocked` from `hostedServiceAccessFromHeaders` |
| `leads` | POST | public (gate path) + territory on waitlist | 5/min/IP | Zod `leadsBodySchema`; waitlist 403 blocked ISO; feedback still open |
| `leads/unsubscribe` | GET | public token | 20/min/IP | HMAC `NUDGE_SECRET` |
| `journey/welcome` | POST | session | 5/min/IP | one-time welcome email |

### Mission Server

| Route | Methods | Auth | Rate | Body |
|-------|---------|------|------|------|
| `social/messages` | GET, POST | session | 60/min GET · 20/min POST | Zod `socialMessageBodySchema` / `socialMessagesQuerySchema`. Shared Garage. Guests 401. Missing table fail-open. |
| `social/presence` | GET, POST | session | 60/min GET · 20/min POST | Zod `socialPresenceBodySchema`. Others' real rows only. |
| `social/reports` | POST | session | 10/min | Zod `socialReportBodySchema`. Cannot report own message. |

### Account (GDPR)

| Route | Methods | Auth | Rate | Body |
|-------|---------|------|------|------|
| `account/export` | GET | session (id from getUser only) | 3/5min/user | Art. 20 — every owned table as JSON attachment; wearable tokens redacted (`src/lib/accountDataServer.ts`) |
| `account/delete` | POST | session (id from getUser only) | 2/5min/user | Art. 17 — Zod `accountDeleteBodySchema` (`confirm: 'DELETE'`); client `userId` rejected; client `deviceId` ignored (P2-1); email-keyed cleanups then linked-device anonymous wipe then `auth.admin.deleteUser` cascade |
| `account/mission-id` | GET | session | 30/min/user | Sequential integer claim. No client mint. **503** unconfigured · **502** opaque |

### Coach

| Route | Methods | Auth | Rate | Body |
|-------|---------|------|------|------|
| `coach/daily-insight` | POST | session or gate app access; **LLM branch: premium + daily quota** (`.188`) | 12/min + 32 KiB + daily quota | Zod |
| `coach/plan-voice` | POST | session or gate app access + premium (LLM branch only) + daily quota | 6/min + 64 KiB | Zod |
| `coach/chat` | POST | app access + premium | 10/min + 32 KiB + daily quota | Zod `coachChatSchema` (compact citations, never raw logs); ReAct + local RAG; 402 free; 503 offline; 429 `coach_quota` |
| `coach/debrief-voice` | POST | app access + premium (LLM branch) + daily quota | 6/min + 16 KiB | Zod; rules fallback when free / dark / over quota |
| `referral` | GET/POST | session | 20/min GET · 5/min POST | Lazy MW-code; redeem ≤7d; service role |
| `cron/weekly-digest` | GET | CRON_SECRET | — | Monday founder email; dryRun |
| `push/subscribe` | POST/DELETE | **optional** session | 10/min + 4 KiB | Service role. Anonymous devices allowed — `deviceId` links to the account made later. See [docs/RETURN_LOOP_PLAN.md](../../docs/RETURN_LOOP_PLAN.md) |

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
| `fuel/estimate-meal` | POST | session or gate; **vision branch: premium + daily quota** (`.188`) | 10/min | multipart photo; hasAppAccess; heuristic never gated |

### Leaderboard

| Route | Methods | Auth | Rate | Notes |
|-------|---------|------|------|-------|
| `leaderboard/snapshot` | POST | session | 20/min/IP | Zod `leaderboardSnapshotBodySchema`. Service-role upsert. Server computes standings from that user's logs. Client scores are ignored. |

### PFT

| Route | Methods | Auth | Rate | Notes |
|-------|---------|------|------|-------|
| `pft/results` | POST | session | 20/min/IP | Zod `pftResultBodySchema`. Service-role insert. Server computes `overall_tier` from event scores. `class_code` is always NULL — no membership table. |

### School

| Route | Methods | Auth | Rate | Notes |
|-------|---------|------|------|-------|
| `school/class` | POST | session | 10/min/IP | Zod create schema |
| `school/class/mine` | GET | session | — | |
| `school/class/[code]/access` | GET, POST | session + PIN | — | |
| `school/class/[code]/verify` | POST | gate + PIN | 5/min/IP | PIN in body only (GET removed) |
| `school/class/[code]/stats` | GET | teacher | — | IDOR-closed |
| `school/class/[code]/leaderboard` | GET | teacher | — | IDOR-closed |
| `school/class/[code]/export` | GET | teacher | — | redacted ids |

### Youth (COPPA-sensitive)

| Route | Methods | Auth | Rate | Notes |
|-------|---------|------|------|-------|
| `youth/consent-verify` | POST | token HMAC | limited | 404 when youth parked; fail-closed secret |
| `youth/consent-notify` | POST | session | 3/min/IP + 3/hour/recipient | 404 when youth parked (P2-3); Zod `youthConsentNotifySchema` |
| `youth/consent-status` | GET | session | — | 404 when youth parked |
| `youth/consent-confirm` | GET | token | — | 404 when youth parked |

### Journey, nudges, cron

| Route | Methods | Auth | Rate |
|-------|---------|------|------|
| `journey/nudge` | POST | session | 5/min/IP + 4 KiB body | Zod `journeyNudgeBodySchema` |
| `nudges/unsubscribe` | GET | signed token | 20/min/IP | query `u`+`t` |
| `cron/nudges` | GET | `Authorization: Bearer CRON_SECRET` | — | Daily 17:00 UTC |
| `cron/wind-down` | GET | `Authorization: Bearer CRON_SECRET` | — | **Hourly, from `.github/workflows/cron-wind-down.yml`** (Vercel Hobby caps crons at daily). Evening (19–22 local) note after a session that ran hot. Push only; own `last_wind_down_at` marker so it never suppresses a comeback. `?dryRun=1` reports `localHour` per candidate |
| `cron/day-review` | GET | `Authorization: Bearer CRON_SECRET` | — | Hourly evening doorbell. No numbers on the push. Own `last_day_review_at` |
| `health` | GET | none (shallow) · `Bearer CRON_SECRET` when `?deep=1` | — | `{ ok, build, time }`. Deep adds checks |
| `metrics/week-logged` | POST | session | 20/min/IP | Zod `weekLoggedBodySchema`. Guests 401. No PII beyond uid |

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
| `beta/feedback` | GET, POST | beta admin email **or** `x-beta-admin-secret` | POST 30/min/IP + 8 KiB | GET inbox + optional review join. POST Zod `feedbackReviewBodySchema` — founder dest. Missing table 503 `reviews_unavailable`. Never returns a Postgres `error.message` |
| `beta/invites` | GET, POST | beta admin email **or** `x-beta-admin-secret` | POST rate-limited | GET funnel rows. POST issue code + `/private?invite=` link |
| `beta/invites/landed` | POST | public (opaque) | 30/min/IP | Sets `first_landed_at` once; always 200 |
| `beta/invites/redeem` | POST | session | 5/min/IP | Bind invite to user; ≤7-day account |

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
