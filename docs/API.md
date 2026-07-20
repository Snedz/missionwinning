# API Reference — Mission Winning

HTTP handlers live in `app/api/**/route.ts`. Business logic in `src/lib/`. Inventory: [app/api/INDEX.md](../app/api/INDEX.md).

**Auth legend**

| Tag | Meaning |
|-----|---------|
| `gate` | Private-mode gate cookie or Supabase session |
| `session` | Valid Supabase user JWT |
| `premium` | Session + enrollment (or dev `DEMO_PREMIUM`) |
| `teacher` | Creator session or verified teacher PIN |
| `webhook` | Signature-verified provider |
| `cron` | `CRON_SECRET` header |
| `public` | No user session (may still need gate in private beta) |

**Rate limits** use `rateLimitAsync` (Upstash when configured) or in-memory fallback.

---

## Health

### `GET /api/health`

| | |
|--|--|
| Auth | none (shallow) |
| Response | `{ ok: true, build, time }` — always **200** (liveness) |

### `GET /api/health?deep=1`

| | |
|--|--|
| Auth | `Authorization: Bearer $CRON_SECRET` |
| Response | same + `checks` (Supabase, Redis if configured, env sanity). **503** if hard-fail; **401** if bad bearer |

```bash
curl -sS "$BASE/api/health"
curl -sS -H "Authorization: Bearer $CRON_SECRET" "$BASE/api/health?deep=1"
```

Public while private gate is on. See [OPS_MONITORING.md](OPS_MONITORING.md).

---

## Beta invites

### `POST /api/beta/invites/landed`

| | |
|--|--|
| Auth | public (opaque) |
| Rate | 30/min/IP |
| Body | `{ code: "MW-B-XXXXX" }` |
| Notes | Sets `first_landed_at` once; always 200 |

### `POST /api/beta/invites/redeem`

| | |
|--|--|
| Auth | `session` |
| Notes | ≤7-day account; writes `profiles.invited_via` + first `signed_up_user_id` |

### `GET|POST /api/beta/invites`

| | |
|--|--|
| Auth | `BETA_ADMIN_EMAILS` session or `x-beta-admin-secret` |
| GET | invite funnel rows + totals |
| POST | `{ label, email? }` → issue code + full `?access=&invite=` link |

---

## Private gate

### `POST /api/private-access`

| | |
|--|--|
| Auth | `public` (password form) |
| Rate | 8/min/IP |
| Schema | `privateAccessBodySchema` — `{ password }` |
| Response | Sets httpOnly gate cookie on success |

```bash
curl -X POST "$BASE/api/private-access" \
  -H 'Content-Type: application/json' \
  -d '{"password":"YOUR_SECRET"}'
```

---

## Leads

### `POST /api/leads`

| | |
|--|--|
| Auth | `gate` |
| Rate | 5/min/IP |
| Schema | `leadsBodySchema` |
| Insert | Service role only (anon INSERT revoked) |

---

## Coach (LLM)

### `POST /api/coach/daily-insight`

| | |
|--|--|
| Auth | `gate` + `hasAppAccess` |
| Rate | 12/min/IP |
| Schema | `coachDailyContextSchema` |
| Notes | LLM when env set; else rules fallback keys |

### `POST /api/coach/plan-voice`

| | |
|--|--|
| Auth | `gate` + `hasAppAccess` |
| Rate | 6/min/IP |
| Schema | `coachPlanVoiceSchema` |

### `POST /api/coach/chat`

| | |
|--|--|
| Auth | `gate` + `hasAppAccess` + **premium** (402 `premium_required` if free) |
| Rate | 10/min/IP |
| Body cap | 32KB |
| Schema | `coachChatSchema` — message ≤1000, turns ≤12, compact context (scores + optional today session / exerciseId) |
| Success | `{ message, actionLabel?, actionPath?, source: 'llm' }` |
| Errors | 503 `coach_offline` (LLM unconfigured / ZDR fail-closed), 502 other LLM fail |
| Notes | No rules fallback. ZDR one-shot via `coachLlmClient`. Transcript not stored server-side. |

---

## Growth

### `GET /api/referral` / `POST /api/referral`

| | |
|--|--|
| Auth | Session (`getUserFromRequest`) |
| Rate | GET 20/min · POST 5/min · POST body 4KB |
| GET | `{ code, recruitCount }` — lazy-gen `MW-XXXXX` via service role |
| POST | Body `{ code }` matching `referralRedeemBodySchema`; attribute `referred_by` for accounts ≤7d; opaque `ignored` on invalid/self/old |
| Notes | Client cannot spoof columns (DB trigger). Recognition-only rewards. |

### `GET /api/cron/weekly-digest`

| | |
|--|--|
| Auth | `Authorization: Bearer $CRON_SECRET` |
| Schedule | `0 16 * * 1` (Monday) |
| dryRun | `?dryRun=1` returns composed subject/text + data |
| Send | `FOUNDER_DIGEST_EMAIL` via Resend; skipped if unset |

---

## Premium (gated content)

All `GET` — auth `premium` (session + `isPremiumForUser`) except status.

Catalog responses use `Cache-Control: private, max-age=60, stale-while-revalidate=300` (browser only — never shared CDN). Enrollment checks are memoized in Upstash when configured (~90s TTL); see [CACHE_LADDER.md](CACHE_LADDER.md).

| Route | Content |
|-------|---------|
| `/api/premium/status` | Enrollment boolean |
| `/api/premium/recipes` | Premium recipe bundle |
| `/api/premium/programs` | Pro program templates |
| `/api/premium/mobility` | Mobility flows |
| `/api/premium/mind` | Mind sessions |
| `/api/premium/guidebook` | Full guidebook payload |
| `/api/premium/fuel-plan` | Adaptive Fuel Coach plan |

```bash
# Expect 401/403 without session + enrollment
curl -sI "$BASE/api/premium/recipes"
```

---

## Checkout & billing

### `POST /api/checkout`

| | |
|--|--|
| Auth | `session` (signed-in email required) |
| Rate | 10/min/IP |
| Schema | `checkoutBodySchema` — `{ planId: "monthly" \| "12mo" \| "lifetime" }` |
| Response | `{ url, sessionId }` — redirect browser to `url` |
| Notes | Requires `STRIPE_SECRET_KEY` + `STRIPE_PRICE_BUNDLE_*`. Metadata includes `user_id`. |

```bash
curl -X POST "$BASE/api/checkout" \
  -H 'Content-Type: application/json' \
  -d '{"planId":"lifetime"}'
# Expect 401 without session
```

### `POST /api/billing-portal`

| | |
|--|--|
| Auth | `session` |
| Rate | 10/min/IP |
| Response | `{ url }` — Stripe Customer Portal |
| Notes | Looks up Stripe Customer by account email |

### `POST /api/crypto-checkout/intent`

| | |
|--|--|
| Auth | `session` |
| Rate | 8/min/IP |
| Response | `{ intentId, reference, treasury, amountUsdc, expiresAt, rpcUrl }` |
| Notes | Lifetime $149 USDC only — see [PHANTOM_USDC_CHECKOUT.md](PHANTOM_USDC_CHECKOUT.md) |

### `POST /api/crypto-checkout/confirm`

| | |
|--|--|
| Auth | `session` |
| Rate | 10/min/IP |
| Schema | `cryptoCheckoutConfirmSchema` — `{ intentId, signature }` |
| Notes | Verifies Solana tx → `enrollments` with `provider: phantom` |

---

## Wearables (optional)

Gated by `NEXT_PUBLIC_WEARABLES=true`. See [WEARABLES.md](WEARABLES.md).

### `GET /api/wearables/status`

| | |
|--|--|
| Auth | `session` |
| Rate | 30/min/IP |
| Response | `{ enabled, providers[] }` |

### `POST /api/wearables/sync`

| | |
|--|--|
| Auth | `session` |
| Rate | 8/min/IP |
| Schema | `wearableSyncSchema` — `{ provider, sinceIso? }` |
| Response | `{ ok, inserted, activityHints }` |

### `POST /api/wearables/disconnect`

| | |
|--|--|
| Auth | `session` |
| Rate | 10/min/IP |
| Schema | `wearableDisconnectSchema` — `{ provider, deleteSamples? }` |

### `POST /api/wearables/hub-ingest`

| | |
|--|--|
| Auth | `session` |
| Rate | 20/min/IP |
| Schema | `wearableHubIngestSchema` — native shell HealthKit / Health Connect samples |

### `GET /api/wearables/oauth/[provider]/start` · `…/callback`

| | |
|--|--|
| Auth | start: `session` · callback: signed `state` |
| Providers | `whoop`, `strava`, `oura`, `garmin`, `fitbit`, `polar` |
| Notes | Requires provider `*_CLIENT_ID` / `*_CLIENT_SECRET` |

---

## Fuel

### `GET /api/fuel/search-food?q=`

| | |
|--|--|
| Auth | `gate` |
| Rate | 30/min/IP |
| Schema | `fuelSearchQuerySchema` |

### `GET /api/fuel/barcode?code=`

| | |
|--|--|
| Auth | `gate` |
| Rate | 30/min/IP |
| Schema | `fuelBarcodeQuerySchema` |

### `POST /api/fuel/estimate-meal`

| | |
|--|--|
| Auth | `gate` |
| Rate | 10/min/IP |
| Body | `multipart/form-data` — `photo` (image), optional `palette` |

---

## School / PFT

### `POST /api/school/class`

| | |
|--|--|
| Auth | `session` |
| Schema | `schoolClassCreateSchema` |
| Body | `{ code, name?, teacherPin? }` |

### `GET /api/school/class/mine`

| | |
|--|--|
| Auth | `session` |
| Response | Teacher's cloud-synced classes |

### `POST /api/school/class/[code]/access`

| | |
|--|--|
| Auth | `session` optional + PIN in body |
| Rate | 5/min/IP per code |
| Schema | `schoolPinBodySchema` (partial) |

### `POST /api/school/class/[code]/verify`

| | |
|--|--|
| Auth | `gate` |
| Rate | 5/min/IP per code |
| Schema | `schoolPinBodySchema` |

### `GET /api/school/class/[code]/stats`

| | |
|--|--|
| Auth | `teacher` — header `x-teacher-pin` or creator |
| Response | Aggregate class stats |

### `GET /api/school/class/[code]/leaderboard`

| | |
|--|--|
| Auth | `teacher` |
| Response | Redacted `athleteId` labels |

### `GET /api/school/class/[code]/export`

| | |
|--|--|
| Auth | `teacher` |
| Response | CSV export |

```bash
# Expect 401/403 without PIN
curl -sI "$BASE/api/school/class/MWTEST/leaderboard"
```

---

## Youth consent (COPPA)

| Route | Method | Auth | Rate | Schema |
|-------|--------|------|------|--------|
| `/api/youth/consent-verify` | POST | gate | 5/min/IP per email hash | `youthConsentVerifySchema` |
| `/api/youth/consent-notify` | POST | session | — | — |
| `/api/youth/consent-status` | GET | session | — | — |
| `/api/youth/consent-confirm` | GET | token link | — | — |

---

## Journey / nudges

### `POST /api/journey/nudge`

| | |
|--|--|
| Auth | `session` |
| Notes | Schedule journey email nudge |

### `POST /api/nudges/unsubscribe`

| | |
|--|--|
| Auth | signed token in body/query |

### `GET /api/cron/nudges`

| | |
|--|--|
| Auth | `cron` — `Authorization: Bearer $CRON_SECRET` |

---

## Webhooks

### `POST /api/stripe-webhook`

| | |
|--|--|
| Auth | `webhook` — Stripe-Signature |
| Notes | Grants enrollment via `premiumServer.grantEnrollmentFromWebhook` (email + optional `user_id` from Session metadata) |

```bash
curl -X POST "$BASE/api/stripe-webhook" -H 'Content-Type: application/json' -d '{}'
# Expect 401
```

### `POST /api/paypal-webhook`

| | |
|--|--|
| Auth | `webhook` — PayPal transmission headers |

---

## Beta admin

### `GET /api/beta/metrics`

| | |
|--|--|
| Auth | `session` + beta admin email allowlist |

---

## Zod schemas

Defined in [`src/lib/apiSchemas.ts`](../src/lib/apiSchemas.ts). Add new POST bodies there; use `parseJsonBody` / `parseQuery`.

---

## Private mode behavior

When `PRIVATE_MODE=true`, most routes require gate cookie unless listed in `isPublicApiPathWhileGated` ([`publicRoutes.ts`](../src/lib/publicRoutes.ts)): gate endpoint, webhooks, some self-authenticating paths.

---

## Related

- [ARCHITECTURE.md](ARCHITECTURE.md)
- [PROTECTION.md](../PROTECTION.md)
- Smoke: `npm run security-smoke`
