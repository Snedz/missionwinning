# Inspection & Protection — Mission Winning Pre-Launch

**Metaphor:** Like a C-RAM system, we **detect** threats (audit), **track** exposure (competitive gaps), and **intercept** before they reach production (hardening). This document is the inspection checklist and protection status before Phase E (public launch).

Last updated: 2026-06-29

---

## Executive summary

Mission Winning has a strong **free-core vision** and solid pillar scaffolding, but going public against Bevel, Freeletics, Strong, MyFitnessPal, and Calm requires both **security hardening** and **product depth**. This pass implemented critical protections; remaining gaps are prioritized below.

| Layer | Status |
|-------|--------|
| Private gate (pre-launch) | Hardened — signed cookies, rate limit |
| Payment webhooks | Hardened — Stripe + PayPal sig verify |
| Premium bypass | Hardened — server `/api/premium/status`; no localStorage in prod |
| Premium content leak | Partial — recipes server-split; pro templates UI+API gated |
| Supabase RLS | Improved — enrollment read by email |
| Security headers | Added in `vercel.json` |
| PWA cache (gated mode) | Disabled while `PRIVATE_MODE` active |
### Competitive product depth | Documented — see § Competitive gap analysis |
| Simple UI + member journey | Planned — see [JOURNEY.md](JOURNEY.md) |

---

## Critical protections implemented

### 1. Private access gate (`proxy.ts`, `privateSession.ts`)

**Before:** Cookie stored raw `PRIVATE_ACCESS_SECRET` (oracle attack); no rate limit; weak secret (`Done`) documented.

**Now:**
- Signed opaque token in `mw_private_access` cookie (HMAC-SHA256, 30-day TTL)
- Timing-safe password compare on `/api/private-access`
- Rate limit: 8 attempts / minute / IP
- Legacy raw-secret cookies still accepted briefly for migration

**Action required:** Rotate `PRIVATE_ACCESS_SECRET` to `openssl rand -base64 32` in Vercel before any wider sharing.

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
- **Pro programs:** UI gated + `/api/premium/programs` (template metadata still in bundle — see backlog)

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
| **Bevel** | Polish, readiness/strain/recovery rings, AI coach UX | AI coach is rule-based; no wearables; metrics less refined | P1 post-launch |
| **Freeletics** | AI Coach, 30+ plans, video, brand | No video cues; coach is templates not adaptive ML | P1 |
| **Strong / Hevy** | Best-in-class logging UX, charts, social | Logging solid; charts/social minimal | P2 |
| **MyFitnessPal** | Massive food DB, barcode scan | Manual food log only; no barcode | P2 |
| **Strava / MapMy** | GPS, segments, social | Track pillar is manual log only | P1 for Track premium |
| **Calm / Headspace** | Audio libraries, sleep stories | Mind is breathing + check-in only | P2 |
| **Pliability / ROMWOD** | Video mobility, sport-specific | Move has timed flows, no video | P2 |

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

- [ ] Rotate `PRIVATE_ACCESS_SECRET` (stop using `Done`)
- [x] Run `supabase/schema.sql` in production Supabase (or `migrations/20250629_complete_base_schema.sql`)
- [ ] Set `SUPABASE_SERVICE_ROLE_KEY` + `STRIPE_WEBHOOK_SECRET` in Vercel (never `NEXT_PUBLIC_`)
- [ ] Set `DEMO_PREMIUM=false` explicitly in production
- [ ] Verify gate + premium API with curl checklist above
- [x] Privacy policy + Terms pages linked from `/about`

### P1 — First 30 days public

- [ ] Split `pro` program templates to server-only module (like recipes)
- [x] PayPal webhook signature verification (`src/lib/paypalWebhook.ts`)
- [x] CSP header enforced in production (`next.config.js`; `CSP_ENFORCE=false` for report-only)
- [ ] Leads table: CAPTCHA or rate limit on `/api` lead inserts
- [ ] JWT gate bypass: verify signature via Supabase JWKS if `PRIVATE_ALLOW_AUTH_BYPASS=true`

### P2 — Competitive parity

- [ ] AI Coach v1 (LLM + user context from Today Hub)
- [ ] GPS / activity import for Track
- [ ] Video or GIF cues for top 50 exercises
- [ ] Barcode / food search API for Fuel
- [ ] Audio-guided Mind sessions

---

## Environment reference

| Variable | Exposure | Purpose |
|----------|----------|---------|
| `PRIVATE_ACCESS_SECRET` | Server only | Pre-launch gate password |
| `PRIVATE_MODE` | Server only | `true` until public launch |
| `DEMO_PREMIUM` | Server only | Never `true` in production |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Webhooks, admin |
| `STRIPE_WEBHOOK_SECRET` | Server only | Stripe signature verify |
| `PAYPAL_WEBHOOK_ID` | Server only | PayPal webhook id from Developer dashboard |
| `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` | Server only | PayPal REST OAuth for signature verify |
| `PAYPAL_ENV` | Server only | `sandbox` (default) or `live` |
| `CSP_ENFORCE` | Server/build | `true` to enforce CSP; default enforce in production |
| `NEXT_PUBLIC_SUPABASE_*` | Client (expected) | Anon key — RLS must protect data |

See [ENV.md](ENV.md) and [.env.example](.env.example).

---

## Inspection cadence (ongoing)

Repeat before each major release:

1. **Ammunition check** — dependency audit: `npm audit`
2. **Perimeter scan** — curl gate, headers, webhook rejection
3. **Paywall drill** — confirm premium APIs 403 without enrollment
4. **Bundle recon** — search client chunks for premium filenames (`premiumRecipes`, pro program ids)
5. **Competitive spot-check** — one user journey vs Freeletics/Bevel on mobile

---

*This file is the living protection log. Update after each security or pre-launch change.*
