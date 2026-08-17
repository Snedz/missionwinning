# Inspection & Protection — Mission Winning Pre-Launch

**Metaphor:** Like a C-RAM system, we **detect** threats (audit), **track** exposure (competitive gaps), and **intercept** before they reach production (hardening). This document is the inspection checklist and protection status before Phase E (public launch).

Last updated: 2026-08-05 (founder launch §2c security checklist; S2 2026-07-22; OWASP 2026-07-05)

**Founder launch checklist (secrets, smokes, RLS ops):** [LAUNCH_RUNBOOK.md](LAUNCH_RUNBOOK.md) §2c · secrets program [SECRETS.md](SECRETS.md).

---

## Executive summary

Mission Winning has a strong **free-core vision** and solid pillar scaffolding, but going public against a metric-quiet health app, a bodyweight coach app, Strong, a food diary, and Calm requires both **security hardening** and **product depth**. This pass implemented critical protections; remaining gaps are prioritized below.

| Layer | Status |
|-------|--------|
| Private gate (pre-launch) | Hardened — signed cookies, **Upstash** rate limit (`rateLimitAsync`) |
| Payment webhooks | Hardened — Stripe + PayPal sig verify (PayPal 503 until webhook id set) |
| Premium bypass | Hardened — server `/api/premium/status`; no localStorage in prod |
| Premium content leak | Hardened — recipes + pro programs server-split |
| Supabase RLS | Improved — enrollment read by email |
| Security headers | Added in `vercel.json` / Next config |
| PWA cache (gated mode) | Disabled while `PRIVATE_MODE` active |
| School class APIs | Hardened — teacher PIN/creator; **GET PIN verify removed** |
| Fuel meal estimate | Hardened — `hasAppAccess` before vision/heuristic |
| Crypto confirm | Hardened — pending→confirmed race checks row count |
| OWASP audit | [docs/OWASP_AUDIT.md](OWASP_AUDIT.md) — S2 refresh 2026-07-22 |
| Competitive product depth | Documented — see § Competitive gap analysis |
| Simple UI + member journey | Planned — see [JOURNEY.md](JOURNEY.md) |

---

## Critical protections implemented

### 1. Private access gate (`proxy.ts`, `privateSession.ts`)

**Before:** Cookie stored raw `PRIVATE_ACCESS_SECRET` (oracle attack); no rate limit; weak secret (`Done`) documented.

**Now:**
- Signed opaque token in `mw_private_access` cookie (HMAC-SHA256, 30-day TTL)
- Timing-safe password compare on `/api/private-access`
- Rate limit: 8 attempts / minute / IP via **`rateLimitAsync`** (Upstash when configured; was in-memory-only until S2)
- Legacy raw-secret cookies still accepted briefly for migration

**Action required:** Rotate `PRIVATE_ACCESS_SECRET` to `openssl rand -base64 32` in Vercel before any wider sharing. Confirm `PRIVATE_ALLOW_QUERY_ACCESS` unset/false.

### Red/blue S2 (2026-07-22) — live www

**Founder S0 (parallel — agents do not own):** rotate GH `VERCEL_TOKEN`; enable CodeQL; promote `.104`+; Wave A Sentry DSN; keep Upstash live (rate-limit-smoke green).

**Red team verified on https://www.missionwinning.com (build `.103` at probe time):**

| Check | Result |
|-------|--------|
| `npm run security-smoke` | All checks passed |
| `npm run rate-limit-smoke` (`/api/leads`) | 429 after 5 |
| Gate `/` `/log` → `/private`; forged cookie | 307 → `/private` |
| Premium recipes/programs anonymous | 403 |
| Premium status anonymous | `premium:false` |
| Stripe unsigned webhook | 401 |
| PayPal unsigned | 503 (not configured — fail-closed) |
| Crypto intent/confirm no session | 401 |
| Coach LLM / mobile coach / beta redeem | 403 private gate |
| Private-access wrong password | 401 then 429 |
| Hero e2e (local) Today→Active→Victory score | 11/11 pass |
| Coach chat lock teaser (local) | 2 pass / 1 skip (LLM week gen) |

**`LAUNCH_STRICT` launch-verify:** fails on **local** missing `SUPABASE_SERVICE_ROLE_KEY` / `STRIPE_WEBHOOK_SECRET` / Checkout Sessions — founder env on the machine running verify, not a www perimeter hole (leads 429 proves Upstash on prod).

**Blue team shipped (this pass):**

1. `private-access` → `rateLimitAsync`
2. `fuel/estimate-meal` → `hasAppAccess`
3. School verify **GET** removed (PIN query leak)
4. Crypto `markIntentConfirmed` requires pending→confirmed row
5. `gate-smoke` extended: estimate-meal 401/403; school GET reject

### 2. Payment webhooks

**Before:** PayPal/Stripe accepted forged POSTs → free premium grants.

**Now:**
- **Stripe:** Signature verification (v1 HMAC) before enrollment insert; idempotent via `provider` + `external_id`
- **PayPal:** Signature verification via PayPal REST API (`verify-webhook-signature`); rejects forged POSTs with 401
- Webhooks use `SUPABASE_SERVICE_ROLE_KEY` via `supabaseAdmin.ts` (never anon client)

### 3. Premium authority

**Before:** `localStorage.mw_premium = true` unlocked entire app in production.

**Now:**
- `/api/premium/status` — server-verified Supabase enrollment
- `usePremium()` hook for UI (Builder, Nutrition, Sidebar)
- `grantPremiumDemo()` only works in `NODE_ENV=development`
- Production: `DEMO_PREMIUM` must be explicitly `true` to bypass (never on Vercel prod)

### 4. Premium content extraction

**Before:** 104 recipes + all program templates in client JS bundle.

**Now:**
- **Recipes:** 12 free in `src/data/recipes/freeRecipes.ts`; 92 premium in server-only `premiumRecipes.ts` → `/api/premium/recipes`
- **Pro programs:** Server-only `premiumProgramTemplates.ts` → `/api/premium/programs`; 56 free templates remain in client bundle

### 5. Infrastructure

- Security headers: HSTS, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`
- PWA disabled while private gate active (prevents offline leak of full app shell)
- `.env.local.save` gitignored
- Supabase RLS: enrollments readable by `user_id` OR matching JWT email

---

## Verification commands (run before launch)

```bash
# 1. Gate — incognito, no cookies → should redirect to /private
curl -sI https://www.missionwinning.com/ | grep -i location

# 2. Premium bypass — production build, browser console (should NOT unlock)
localStorage.setItem('mw_premium','true'); location.reload()

# 3. Webhook forgery — should return 401/503 after hardening
curl -X POST https://www.missionwinning.com/api/paypal-webhook \
  -H 'Content-Type: application/json' \
  -d '{"event_type":"PAYMENT.CAPTURE.COMPLETED","resource":{"payer":{"email_address":"x@test.com"}}}'

# 4. Premium recipes without auth — should 403
curl -sI https://www.missionwinning.com/api/premium/recipes

# 5. Env check
npm run check-env
```

---

## Competitive gap analysis (vs market)

Mission Winning’s **positioning** (free global PWA, six pillars, Super Bundle) is differentiated. **Execution gaps** vs incumbents:

| Competitor | Their strength | Our gap | Priority |
|------------|----------------|---------|----------|
| **a metric-quiet health app** | Polish, readiness/strain/recovery rings, AI coach UX | AI coach is rule-based; no wearables; metrics less refined | P1 post-launch |
| **a bodyweight coach app** | AI Coach, 30+ plans, video, brand | No video cues; coach is templates not adaptive ML | P1 |
| **set-table** | Best-in-class logging UX, charts, social | Logging solid; charts/social minimal | P2 |
| **a food diary** | Massive food DB, barcode scan | Manual food log only; no barcode | P2 |
| **Strava / MapMy** | GPS, segments, social | Track pillar is manual log only | P1 for Track premium |
| **Calm / a sit library** | Audio libraries, sleep stories | Mind is breathing + check-in only | P2 |
| **a mobility app / ROMWOD** | Video mobility, sport-specific | Move has timed flows, no video | P2 |

**What we already compete on:**
- Unified Win Score across six pillars (unique)
- 216-exercise library with tags/cues (Phase D)
- Free core without account (PWA offline for train/log)
- Super Bundle value narrative + comparison UI
- ISSA-aligned Learn paths (8 free paths)

**Recommended pre-public minimum (Phase E+):**
1. Rotate secrets + Supabase RLS deployed
2. Stripe live with verified webhook
3. One “hero” polished flow: Today Hub → Start workout → Complete → Win Score update (mobile)
4. Remove or gate remaining client-bundle premium (pro program JSON → server-only split)
5. Legal: disclaimers, privacy policy, terms (support@missionwinning.com)

---

## Protection backlog (prioritized)

### P0 — Before public (`PRIVATE_MODE=false`)

- [x] Rotate `PRIVATE_ACCESS_SECRET` (stop using weak placeholders) — Production set per [LAUNCH_RUNBOOK.md](LAUNCH_RUNBOOK.md) §2
- [x] Run `supabase/schema.sql` in production Supabase (or `migrations/20250629_complete_base_schema.sql`)
- [x] Apply `20260702_security_hardening.sql` + `20260705_leads_api_only.sql` (and later migrations through referrals — see [LAUNCH_RUNBOOK.md](LAUNCH_RUNBOOK.md) §2)
- [x] Set `YOUTH_CONSENT_SECRET` and `NUDGE_SECRET` (dedicated — not shared with gate secret) — per LAUNCH_RUNBOOK §2
- [x] Set `SUPABASE_SERVICE_ROLE_KEY` + `STRIPE_WEBHOOK_SECRET` in Vercel (never `NEXT_PUBLIC_`) — per LAUNCH_RUNBOOK §2
- [x] Set `DEMO_PREMIUM=false` explicitly in production — per LAUNCH_RUNBOOK §2
- [x] **Required before public:** `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` (distributed rate limits — [docs/PRODUCTION_STACK.md](PRODUCTION_STACK.md) L9) — done 2026-07-22, `rate-limit-smoke` saw 429 on www. **Status lives in [LAUNCH_RUNBOOK.md](LAUNCH_RUNBOOK.md) §2b; this row mirrors it.** It sat unticked here for a week after the runbook ticked it, which sends the founder to redo finished work.
- [ ] **Required before public:** `NEXT_PUBLIC_SENTRY_DSN` on Production ([ENV.md](ENV.md), [docs/PRODUCTION_STACK.md](PRODUCTION_STACK.md) L12)
- [ ] GitHub Actions: `VERCEL_TOKEN` + `VERCEL_ORG_ID` + `VERCEL_PROJECT_ID`; `SMOKE_BASE_URL` (+ access secret) for gate-smoke — rotate `VERCEL_TOKEN` if stale
- [ ] Verify gate + growth + rate-limit with `LAUNCH_STRICT=true npm run launch-verify` (and `npm run rate-limit-smoke` sees 429)
- [ ] Backup drill: Profile export once + skim [docs/BACKUP_RESTORE.md](BACKUP_RESTORE.md)
- [x] Privacy policy + Terms pages linked from `/about`

### Wave B — Flip day (Layer 10)

- [ ] `PRIVATE_MODE=false` redeploy enables Serwist PWA (`next.config.js`); spot-check Today/Train offline ([docs/archive/PUBLIC_FLIP_CHECKLIST.md](archive/PUBLIC_FLIP_CHECKLIST.md))
- [ ] IaC / multi-region / SIEM **deferred** (Layers 6, 11, SIEM) — do not block launch on them

### P1 — First 30 days public

- [ ] **Aikido:** connect repo + set GitHub Actions secret `AIKIDO_SECRET_KEY` ([docs/AIKIDO.md](AIKIDO.md)); confirm workflow runs on `master`
- [x] Split `pro` program templates to server-only module (like recipes)
- [x] PayPal webhook signature verification (`src/lib/paypalWebhook.ts`)
- [x] CSP header enforced in production (`next.config.js`; `CSP_ENFORCE=false` for report-only)
- [x] Leads table: rate limit on `/api/leads` (5/min/IP; server insert via service role); anon INSERT revoked (`20260705_leads_api_only.sql`)
- [x] JWT gate bypass: `getUser()` verifies tokens (F1). A verified session is **not** a gate pass — cookie (invite- or password-minted) or `?access=` only (P1-1 / `.772`).

### P2 — Competitive parity

- [x] AI Coach v1 — Mission Coach engine + daily insight + plan-voice (`src/lib/coach/`)
- [x] GPS / activity import for Track — premium GPS panel (`src/lib/trackGps.ts`)
- [x] Form cues + instructional diagrams (`FormGuideSheet`, 30 SVGs in `public/form-guides/`; [MEDIA_SYSTEM.md](MEDIA_SYSTEM.md); WebM loops for top-5 later)
- [x] Barcode / food search API for Fuel (`BarcodeLookup.tsx`, Open Food Facts)
- [x] Audio-guided Mind sessions — premium timed guided sessions (CDN audio optional next)

### Referral fraud note (Wave 8)

Referral **v1 is recognition only** (recruit counts + brass badges at 3/10/25). No Stripe discounts, free months, or premium grants — those create fraud + refund entanglement pre-launch. Codes use service-role writes; a BEFORE UPDATE trigger reverts client spoofing of `referral_code` / `referred_by`. Redeem is limited to accounts ≤7 days old. Revisit monetary rewards only after week-4 retention holds and abuse tooling exists.

---

## Environment reference

| Variable | Exposure | Purpose |
|----------|----------|---------|
| `PRIVATE_ACCESS_SECRET` | Server only | Pre-launch gate password |
| `YOUTH_CONSENT_SECRET` | Server only | Parent consent HMAC (required in prod) |
| `NUDGE_SECRET` | Server only | Journey nudge HMAC (required in prod) |
| `UPSTASH_REDIS_REST_*` | Server only | Distributed rate limits (**required before public**) |
| `NEXT_PUBLIC_SENTRY_DSN` | Client (expected) | Error monitoring (**required before public**) |
| `PRIVATE_ALLOW_QUERY_ACCESS` | Server only | Allow deprecated `?access=` bypass in prod |
| `PRIVATE_MODE` | Server only | `true` until public launch |
| `DEMO_PREMIUM` | Server only | Never `true` in production |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Webhooks, admin |
| `STRIPE_WEBHOOK_SECRET` | Server only | Stripe signature verify |
| `PAYPAL_WEBHOOK_ID` | Server only | PayPal webhook id from Developer dashboard |
| `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` | Server only | PayPal REST OAuth for signature verify |
| `PAYPAL_ENV` | Server only | `sandbox` (default) or `live` |
| `CSP_ENFORCE` | Server/build | `true` to enforce CSP; default enforce in production |
| `NEXT_PUBLIC_SUPABASE_*` | Client (expected) | Anon key — RLS must protect data |

See [ENV.md](ENV.md), [docs/OWASP_AUDIT.md](OWASP_AUDIT.md), and [.env.example](../.env.example).

---

## Inspection cadence (ongoing)

Repeat before each major release:

1. **Ammunition check** — dependency audit: `npm audit`
2. **Perimeter scan** — curl gate, headers, webhook rejection
3. **Paywall drill** — confirm premium APIs 403 without enrollment
4. **Bundle recon** — search client chunks for premium filenames (`premiumRecipes`, pro program ids)
5. **Competitive spot-check** — one user journey vs a bodyweight coach app/a metric-quiet health app on mobile

---

*This file is the living protection log. Update after each security or pre-launch change.*
