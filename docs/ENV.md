# Mission Winning — Environment Setup

This guide gets **www.missionwinning.com** running with the **private development gate** active so the public only sees the `/private` teaser until they have your access code.

For the full pre-launch security inspection checklist and competitive readiness review, see **[PROTECTION.md](PROTECTION.md)**.

## Quick start (local)

```bash
cd missionwinning
cp .env.example .env.local
# Edit .env.local — at minimum set PRIVATE_ACCESS_SECRET and Supabase keys
npm install
npm run dev
```

Visit http://localhost:3000. With `PRIVATE_MODE=true` in `.env.local`, you should be redirected to `/private` unless you use your access code.

---

## Vercel environment variables (REQUIRED for live gate)

Open **Vercel → your project → Settings → Environment Variables**.

Add these for **Production** and **Preview**:

| Variable | Required | Example / notes |
|----------|----------|-----------------|
| `PRIVATE_ACCESS_SECRET` | **Yes** | Run `openssl rand -base64 32` — pick one strong secret and save it somewhere safe |
| `PRIVATE_ACCESS_CODES` | Optional | Comma-separated aliases accepted at `/private` (e.g. `Done`). Cookies still signed with `PRIVATE_ACCESS_SECRET` |
| `PRIVATE_MODE` | Yes | `true` while in private dev; set `false` when launching publicly |
| `NEXT_PUBLIC_SUPABASE_URL` | Recommended | `https://YOUR-PROJECT.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Recommended | From Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Beta admin + webhooks | Server only — never `NEXT_PUBLIC_` |
| `BETA_ADMIN_EMAILS` | Optional | Your email for Profile → beta funnel (all users) |
| `RESEND_API_KEY` | Optional | Email nudge + receipts |
| `RESEND_FROM` | Optional | `Mission Winning <hello@missionwinning.com>` — verified domain |
| `NEXT_PUBLIC_SITE_URL` | Launch | `https://www.missionwinning.com` — canonicals + OG (use www) |
| `YOUTH_CONSENT_SECRET` | **Yes in prod** | `openssl rand -base64 32` — dedicated; never reuse gate secret |
| `NUDGE_SECRET` | **Yes in prod** | `openssl rand -base64 32` — journey email nudge HMAC |
| `UPSTASH_REDIS_REST_URL` | **Required before public** | Rate limits (L9) **and** premium enrollment memo (L10 — [docs/CACHE_LADDER.md](CACHE_LADDER.md)). Optional in local/dev — without it, every premium check hits Postgres. |
| `UPSTASH_REDIS_REST_TOKEN` | **Required before public** | Pair with Upstash URL above |
| `PRIVATE_ALLOW_QUERY_ACCESS` | Optional | Set `true` only to allow `?access=` bypass in production (deprecated; prefer `/private` form + share code out-of-band) |
| `COACH_LLM_API_URL` | Optional | OpenAI-compatible chat completions URL. Prefer SpaceXAI/xAI: `https://api.x.ai/v1/chat/completions`. Omit for rules-only coach |
| `COACH_LLM_API_KEY` | Optional | Provider API key (e.g. `xai-…` from [console.x.ai](https://console.x.ai/)). **Never** `NEXT_PUBLIC_` |
| `COACH_LLM_MODEL` | Optional | Model slug (e.g. `grok-4.5` — confirm on [docs.x.ai/developers/models](https://docs.x.ai/developers/models)) |
| `COACH_LLM_REQUIRE_ZDR` | Optional | `true` recommended in production when using xAI: fail closed unless response header `x-zero-data-retention: true` |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Optional | Web push public key (`npx web-push generate-vapid-keys`). SW only active when `PRIVATE_MODE=false` prod build |
| `VAPID_PRIVATE_KEY` | Optional | Web push private key — server only, never `NEXT_PUBLIC_` |
| `VAPID_SUBJECT` | Optional | `mailto:support@missionwinning.com` (or site contact URL) |
| `FOUNDER_DIGEST_EMAIL` | Optional | Monday weekly digest (`/api/cron/weekly-digest`) **and** Stripe dispute alerts (`charge.dispute.*` on `/api/stripe-webhook`). Skip send if unset |

### Optional AI Coach + Zero Data Retention (ZDR)

Free core coach logic is **rules-based** and needs no API key. When you enable optional LLM voice/insight:

1. Create/use an xAI team at [console.x.ai](https://console.x.ai/).
2. Delete any **Files** / **Collections** on that team (Console blocks Enable while they remain).
3. **Team Settings → Zero Data Retention (ZDR) → Enable** (team-wide; all keys inherit). Accept the Console acknowledgments.
4. Confirm **Active** badge and team picker **ZDR** badge.
5. Create an API key; set the four `COACH_LLM_*` vars above (with `COACH_LLM_REQUIRE_ZDR=true` in production).
6. Smoke a coach call and confirm the response header `x-zero-data-retention: true` (server logs structured `coach_llm` meta — never prompt bodies).

Canonical docs: [What is Zero Data Retention (ZDR)?](https://docs.x.ai/developers/faq/security#what-is-zero-data-retention-zdr).

**Stay ZDR-compatible:** use only one-shot **chat completions**. Do not add Files, Collections, Batch, deferred completions, or stateful Responses (`store_messages` / `previous_response_id`) on this team.

After adding or changing env vars: **Deployments → Redeploy** (env changes do not apply until redeploy).

### Sync via GitHub (when Vercel dashboard is locked)

If you cannot open Vercel yet (e.g. 2FA reset), push env vars from **GitHub Secrets** instead:

1. **GitHub → repo → Settings → Secrets and variables → Actions → New repository secret**

   | Secret | Required | Notes |
   |--------|----------|-------|
   | `VERCEL_TOKEN` | **Yes** | [vercel.com/account/tokens](https://vercel.com/account/tokens) — scope: full account or project |
   | `VERCEL_PROJECT_ID` | **Yes** | Ask a teammate with Vercel access, or recover from an old deploy log / email |
   | `VERCEL_ORG_ID` | If team project | Team Settings → General → Team ID |
   | `PRIVATE_ACCESS_SECRET` | **Yes** | Same value you use locally — `openssl rand -base64 32` |
   | `PRIVATE_MODE` | Yes | `true` |
   | `NEXT_PUBLIC_SUPABASE_URL` | Recommended | |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Recommended | |
   | `SUPABASE_SERVICE_ROLE_KEY` | Recommended | |
   | `DEMO_PREMIUM` | Yes in prod | `false` |
   | `VERCEL_DEPLOY_HOOK_URL` | Optional | Deploy Hooks → Production — auto-redeploy after sync |

2. **Actions → Sync Vercel env → Run workflow** (manual; does not run until you trigger it).

3. Confirm gate: incognito visit to `/` should redirect to `/private`; unlock with your secret on the `/private` form. Invites use `/private?invite=MW-B-XXXXX` (access code shared separately). `/?access=SECRET` is off in production unless `PRIVATE_ALLOW_QUERY_ACCESS=true`.

Local dry-run (with token in shell):

```bash
export VERCEL_TOKEN=...
export VERCEL_PROJECT_ID=...
export PRIVATE_ACCESS_SECRET=...
npm run sync-vercel-env
```

**Note:** GitHub ↔ Vercel integration auto-deploys on push to `master`; it does **not** copy GitHub Secrets to Vercel automatically. Use the workflow above once secrets are set.

### How you unlock the site (after deploy)

1. **Password:** Go to https://www.missionwinning.com/private and enter `PRIVATE_ACCESS_SECRET`.
2. **URL shortcut (deprecated):** `/?access=SECRET` is disabled in production unless `PRIVATE_ALLOW_QUERY_ACCESS=true`. Prefer the password form — query strings leak via logs and referrer headers.
3. **Sign in:** After unlocking, sign in with Google, Apple, Microsoft, Facebook, or email magic link (Profile or Welcome onboarding).

---

## OAuth sign-in (Google, Apple, Microsoft, Facebook)

In **Supabase → Authentication → URL Configuration**:

| Setting | Value |
|---------|--------|
| Site URL | **`https://www.missionwinning.com`** — must NOT be a `*.vercel.app` preview URL |
| Redirect URLs | `https://www.missionwinning.com/auth/callback` |
| Redirect URLs (dev) | `http://localhost:3000/auth/callback` |

If Google returns you to `something.vercel.app/private`, Supabase **Site URL** (or an allowlisted redirect) is still pointing at a Vercel deployment alias. Change Site URL to www, save, then retry. The app also refuses to use `*.vercel.app` as `redirectTo` and bounces those callbacks back to www.

**Provider callback (all IdPs):** `https://YOUR-PROJECT.supabase.co/auth/v1/callback`  
(Use this in Google / Apple / Microsoft / Facebook consoles — **not** the app `/auth/callback` URL alone.)

| App button | Supabase provider | Env flag | Default |
|------------|-------------------|----------|---------|
| Google | Google | `NEXT_PUBLIC_OAUTH_GOOGLE` | Shown unless `false` |
| Apple | Apple | `NEXT_PUBLIC_OAUTH_APPLE` | Hidden until `true` |
| Microsoft | Azure | `NEXT_PUBLIC_OAUTH_AZURE` | Hidden until `true` |
| Facebook | Facebook | `NEXT_PUBLIC_OAUTH_FACEBOOK` | Hidden until `true` |

**Never** set an app flag to `true` before the matching Supabase provider is enabled with valid credentials. Doing so recreates `Unsupported provider: provider is not enabled`.

### Google (recommended first — fixes “provider is not enabled”)

If Profile shows **`Unsupported provider: provider is not enabled`** / `validation_failed`, Google is **off** in Supabase while the app still shows the button.

1. [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → **OAuth 2.0 Client IDs** → create (or open) a **Web application** client.
2. Authorized redirect URI: `https://YOUR-PROJECT.supabase.co/auth/v1/callback`  
   (callback path: `https://YOUR-PROJECT.supabase.co/auth/v1/callback`)
3. In Supabase → Authentication → Providers → **Google**:
   - **Client IDs** — paste only the Client ID. It must look like a domain:
     ```
     123456789012-xxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
     ```
     Multiple clients (Web + Android + One Tap, etc.) go in the same field as a **comma-separated** list — no spaces, quotes, or newlines.
   - **Client Secret** — paste the secret in the **Secret** field only (often starts with `GOCSPX-`). Never put the secret in Client IDs.
4. Enable the provider → Save.
5. Smoke-test from Profile → Continue with Google → should land on `/auth/callback` then Profile/Today.

**If Supabase says “Invalid characters / domain-like strings”:** you put the wrong value in **Client IDs**. Clear the field and paste only `….apps.googleusercontent.com` (no Client Secret, no JSON download, no URL, no spaces).

Hide the Google button with `NEXT_PUBLIC_OAUTH_GOOGLE=false` only if you intentionally disable it.

### Apple (optional — requires Apple Developer account)

Supabase error **“At least one Client ID is required when Apple sign-in is enabled”** means Apple is toggled on but the **Services ID** field is empty. Either **turn Apple off** until ready, or complete all fields below before saving.

1. [Apple Developer](https://developer.apple.com/account) → **Identifiers** → **Services IDs** → create one (e.g. `com.missionwinning.web`).
   - This identifier is the **Client ID** in Supabase.
   - Enable **Sign in with Apple** → configure **Return URLs**: `https://YOUR-PROJECT.supabase.co/auth/v1/callback`
2. Create a **Sign in with Apple** key (.p8) → note **Key ID** and **Team ID**.
3. In Supabase → Authentication → **Apple**, fill in:
   - **Services ID (Client ID)** — from step 1
   - **Secret Key** — contents of the .p8 file
   - **Key ID** and **Team ID**
4. Save in Supabase, then set:
   ```bash
   NEXT_PUBLIC_OAUTH_APPLE=true
   ```
5. Sync to Vercel (`scripts/sync-vercel-env.mjs` or dashboard) and redeploy / restart dev.

Until step 4, the app **does not show** the Apple button. Do not enable Apple in Supabase until all Client ID fields are filled.

### Microsoft (Azure / Entra — optional)

Supabase provider id is **`azure`** (UI label: Microsoft).

1. [Microsoft Entra admin center](https://entra.microsoft.com/) → App registrations → New registration.
2. Add a **Web** redirect URI: `https://YOUR-PROJECT.supabase.co/auth/v1/callback`
3. Certificates & secrets → create a client secret.
4. Copy **Application (client) ID** + secret into Supabase → Authentication → **Azure** → enable → Save.
5. Set `NEXT_PUBLIC_OAUTH_AZURE=true`, sync env, redeploy.

The app requests `email profile openid` scopes so Supabase receives an email for account linking.

### Facebook (Meta — optional)

1. [Meta for Developers](https://developers.facebook.com/) → create an app → add **Facebook Login**.
2. Valid OAuth Redirect URI: `https://YOUR-PROJECT.supabase.co/auth/v1/callback`
3. Request **email** permission. For public users, switch the app to **Live** mode (Development mode only allows test users).
4. Copy **App ID** + **App Secret** into Supabase → Authentication → **Facebook** → enable → Save.
5. Set `NEXT_PUBLIC_OAUTH_FACEBOOK=true`, sync env, redeploy.

### Enable order (founder checklist)

1. Google in Supabase (unblocks the default button).
2. Microsoft → then `NEXT_PUBLIC_OAUTH_AZURE=true`.
3. Facebook → then `NEXT_PUBLIC_OAUTH_FACEBOOK=true`.
4. Apple (full Services ID + key) → then `NEXT_PUBLIC_OAUTH_APPLE=true`.

Magic link and OAuth both land on `/auth/callback` (**Route Handler** using `@supabase/ssr` cookie PKCE), then redirect to Today (`/log`) or Profile. Users must accept Terms + Privacy in-app before sign-in.

**If you see “PKCE code verifier not found in storage”:** the old client stored the verifier in localStorage. Current builds use cookie storage via `@supabase/ssr`. Confirm Site URL is `https://www.missionwinning.com`, promote the latest build, hard-refresh, and try Google again from www (not a `*.vercel.app` link).

---

## Why the gate may have looked “broken”

Three things caused the full site to appear public even when the gate was deployed:

1. **Loose Supabase bypass (fixed):** Any cookie whose *name* looked like a Supabase auth cookie bypassed the gate — even invalid values. Magic link sign-in from `/private` also let anyone with any email through.
2. **Your browser cookie:** If you previously used `?access=SECRET` or signed in, your browser bypassed the gate while anonymous visitors were blocked.
3. **PWA cache:** An installed PWA may serve an old cached landing page. Clear site data or uninstall the PWA after enabling the gate.

The gate now requires the **`mw_private_access` cookie** (from password, `?access=`, or **verified sign-in** via `POST /api/private-access/session` after OAuth/magic-link). Supabase browser sessions live in **localStorage**, so the proxy cannot see them — the auth callback mints the gate cookie after `getUser()` succeeds. `PRIVATE_ALLOW_AUTH_BYPASS` remains an optional middleware JWT path; prefer the session mint.

---

## Verify the gate is working

From a terminal (no cookies):

```bash
curl -sI https://www.missionwinning.com/ | grep -i location
# Expected: location: /private
```

In a **private/incognito** browser window, visit https://www.missionwinning.com — you should only see “Private Development”, not the landing page or tracker.

---

## Supabase project

Your project ref from the saved config: `YOUR_SUPABASE_REF`

- URL: `https://YOUR-PROJECT.supabase.co`
- **SQL:** Run `supabase/migrations/20250629_complete_base_schema.sql` in SQL Editor (fresh project). If you already have tables, individual migrations in `supabase/migrations/` are safe to re-run.
- Enable Email auth → Magic Link
- Enable **Google** OAuth (see above). Leave **Apple / Azure / Facebook disabled** in Supabase (and app flags off) until each IdP’s credentials are ready.
- Add redirect URL `https://YOUR-DOMAIN/auth/callback` (+ localhost for dev)
- Add the same URL + anon key to Vercel env vars

---

## PayPal webhook (Super Bundle — when LLC ready)

Set in Vercel (server only — never `NEXT_PUBLIC_`):

| Variable | Purpose |
|----------|---------|
| `PAYPAL_WEBHOOK_ID` | From PayPal Developer → your app → Webhooks |
| `PAYPAL_CLIENT_ID` | REST app credentials |
| `PAYPAL_CLIENT_SECRET` | REST app credentials |
| `PAYPAL_ENV` | `sandbox` (default) or `live` |

Webhook URL: `https://www.missionwinning.com/api/paypal-webhook`

Events: `PAYMENT.CAPTURE.COMPLETED`, `BILLING.SUBSCRIPTION.ACTIVATED`

Forged requests without PayPal transmission headers return **401**. Unconfigured env returns **503**.

---

## Content Security Policy

CSP is set in `next.config.js`. Production builds **enforce** by default; local dev uses **Report-Only**.

Set `CSP_ENFORCE=false` in Vercel temporarily if you need report-only on a preview deploy.

---

## Error monitoring (Sentry — required before public)

Disabled unless `NEXT_PUBLIC_SENTRY_DSN` is set (local dev can stay silent, same pattern as PostHog). **Production must set the DSN before `PRIVATE_MODE=false`** ([docs/PRODUCTION_STACK.md](PRODUCTION_STACK.md) L12).

| Variable | Required | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_SENTRY_DSN` | **Yes in Production (before public)** | Project → Settings → Client Keys (DSN) |
| `SENTRY_ORG` | For source maps | Organization slug in Sentry |
| `SENTRY_PROJECT` | For source maps | Project slug (e.g. `mission-winning`) |
| `SENTRY_AUTH_TOKEN` | For source maps | Auth token with `project:releases` — **server/CI only**, never `NEXT_PUBLIC_` |

Add `SENTRY_AUTH_TOKEN` to **GitHub Secrets** (for sync workflow) and Vercel if builds upload source maps. `next.config.js` wraps with `withSentryConfig` only when the DSN is set.

Thrown API route errors and client error boundaries (`app/error.tsx`, `app/global-error.tsx`) report to Sentry when enabled. API routes use `withApiLogging()` for structured request logs + exception capture.

**Smoke:** with DSN live, force a caught API error (or temporary throw in a logged route) and confirm the event appears in the Sentry project.

---

## Going fully public (later)

When ready to launch:

1. Set `PRIVATE_MODE=false` in Vercel (Production)
2. Set `DEMO_PREMIUM=false` (required in production)
3. Set `DEPLOY_READINESS_TARGET=production` on Vercel **Production** builds (fails deploy if `PRIVATE_MODE` is not `false` or secrets missing)
4. Redeploy
5. Run `SMOKE_BASE_URL=https://www.missionwinning.com SMOKE_ACCESS_SECRET=... npm run launch-verify`
5. Optionally remove or keep `proxy.ts` — with `PRIVATE_MODE=false` it is a no-op

---

## Stripe checkout + webhook (Super Bundle)

Preferred path: **Checkout Sessions** (`POST /api/checkout`) with Price IDs. Payment Links remain a fallback.

Set in Vercel:

| Variable | Purpose |
|----------|---------|
| `STRIPE_SECRET_KEY` | Server — create Checkout + Billing Portal sessions |
| `STRIPE_PRICE_BUNDLE_MONTHLY` | Price ID for $11.99/mo |
| `STRIPE_PRICE_BUNDLE_12MO` | Price ID for $59/yr |
| `STRIPE_PRICE_BUNDLE_LIFETIME` | Price ID for $149 lifetime |
| `STRIPE_WEBHOOK_SECRET` | From Stripe Dashboard → Webhooks → signing secret (`whsec_…`) |
| `NEXT_PUBLIC_STRIPE_CHECKOUT` | `true` when Sessions are live (UnlockButton prefers `/api/checkout`) |
| `NEXT_PUBLIC_FREE_BETA` | Free-first mute — default ON; set `false` after business Stripe ([FREE_BETA.md](FREE_BETA.md)) |
| `SUPABASE_SERVICE_ROLE_KEY` | Required for `grantEnrollmentFromWebhook` |
| `NEXT_PUBLIC_APP_URL` | Success/cancel + portal return URLs |

Optional Payment Link fallback:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_STRIPE_LINK_BUNDLE` | Default / annual Payment Link |
| `NEXT_PUBLIC_STRIPE_LINK_BUNDLE_MONTHLY` | Monthly link |
| `NEXT_PUBLIC_STRIPE_LINK_BUNDLE_LIFETIME` | Lifetime link |

Webhook URL: `https://www.missionwinning.com/api/stripe-webhook`

Event: `checkout.session.completed` → inserts `enrollments` (`premium_granted=true`, `product_id=super-bundle`, `user_id` when Sessions metadata present).

Dashboard: enable Card, Link, wallets, PayPal, Crypto (USDC). Customer Portal for cancel/update. Details: [docs/STRIPE_PREMIUM_SETUP.md](STRIPE_PREMIUM_SETUP.md).

Test in Stripe **test mode** before going live. Profile → premium APIs (`/api/premium/*`) return **403** without enrollment unless `DEMO_PREMIUM=true` (dev only).

---

## Phantom USDC lifetime (optional)

Wallet pay for **lifetime only** ($149 USDC on Solana) — see [docs/PHANTOM_USDC_CHECKOUT.md](PHANTOM_USDC_CHECKOUT.md).

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_CRYPTO_CHECKOUT` | `true` to show Pay with Phantom on `/bundle` lifetime |
| `NEXT_PUBLIC_PHANTOM_APP_ID` | Optional — Portal App ID for Google/Apple/deeplink (injected works without) |
| `SOLANA_TREASURY_ADDRESS` | Base58 treasury pubkey (receives USDC) — required when crypto checkout on |
| `SOLANA_RPC_URL` | Helius/QuickNode (preferred over public RPC) |

---

## Surface parking (`NEXT_PUBLIC_SURFACES`)

Which non-wedge surfaces are reachable. Parking removes a surface from the nav, makes
its routes 404 (`notFound()` in the route wrapper), makes its APIs 404 in `proxy.ts`,
and drops it from the sitemap. **Nothing is deleted** — one env var brings it back.
Source of truth: [`src/lib/surface.ts`](../src/lib/surface.ts).

**Build-time.** Like every `NEXT_PUBLIC_*` var it is inlined when the app is built,
including into the middleware — changing it needs a redeploy, not just a restart.

Comma separated, case-insensitive:

| Value | Effect |
|-------|--------|
| `<name>` | Turn that surface on — `NEXT_PUBLIC_SURFACES=wearables,leaderboard` |
| `wedge` | Park every optional surface — Today · Train · Coach · Fuel · You only |
| `all` | Turn everything on (full-surface QA pass) |
| `-<name>` | Force a surface off, beating a preset — `all,-school` |

| Surface | Default | Why |
|---------|---------|-----|
| `america`, `school` | **off** | COPPA / teacher support / youth-consent surface |
| `wearables` | **off** | Hardware + OAuth surface; Horizon 3 |
| `leaderboard` | **off** | Social surface, not the wedge habit loop |
| `cryptoRails`, `paypal` | **off** | Extra payment rails; Stripe is the one live path |
| `move`, `mind`, `track`, `learn`, `guidebook`, `benchmarks`, `calculators`, `programs` | on | [vision.md](../vision.md) keeps six pillars free-usable |

`NEXT_PUBLIC_AMERICA_TRACK_ENABLED=true` and `NEXT_PUBLIC_WEARABLES=true` still work as
legacy aliases; the surface flag wins for wearables.

**The wedge is not expressible here.** `/log`, `/active`, `/coach`, `/nutrition`,
`/profile`, `/history`, `/library`, `/builder` own no surface, so no flag can switch
off the free logger ([CONTEXT.md](../CONTEXT.md) hard rule 2). `src/lib/surface.test.ts`
asserts it.

## Wearables (optional, Horizon 3)

Multi-vendor sync — see [docs/WEARABLES.md](WEARABLES.md). Opt-in; off unless `NEXT_PUBLIC_WEARABLES=true`. Win Score stays log-derived.

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_WEARABLES` | `true` to show Profile wearables + Active live HR |
| `WEARABLES_OAUTH_REDIRECT_BASE` | Optional absolute origin for OAuth callbacks (defaults to request origin) |
| `WHOOP_CLIENT_ID` / `WHOOP_CLIENT_SECRET` | Whoop OAuth |
| `STRAVA_CLIENT_ID` / `STRAVA_CLIENT_SECRET` | Strava OAuth (`activity:read`) — dark until keys + `NEXT_PUBLIC_WEARABLES=true` |
| `MEAL_VISION_API_URL` | Optional OpenAI-compatible multimodal chat URL for Fuel **photo** meal estimates (`/api/fuel/estimate-meal`). Prefer same host style as coach (e.g. `https://api.x.ai/v1/chat/completions`) |
| `MEAL_VISION_API_KEY` | Bearer key for meal vision — **server only**, never `NEXT_PUBLIC_` |
| `MEAL_VISION_MODEL` | Multimodal model id (default `gpt-4o-mini`; use a vision-capable slug for your provider) |
| `MEAL_VISION_REQUIRE_ZDR` | `true` to require ZDR response header (same fail-closed pattern as `COACH_LLM_REQUIRE_ZDR`) |

Without `MEAL_VISION_*`, photo logging still works: **rough local heuristic** + Open Food Facts name match. Users always edit macros before log. Help: [help/fuel-and-nutrition.md](help/fuel-and-nutrition.md).
| `OURA_CLIENT_ID` / `OURA_CLIENT_SECRET` | Oura OAuth |
| `GARMIN_CLIENT_ID` / `GARMIN_CLIENT_SECRET` | Garmin OAuth |
| `FITBIT_CLIENT_ID` / `FITBIT_CLIENT_SECRET` | Fitbit OAuth |
| `POLAR_CLIENT_ID` / `POLAR_CLIENT_SECRET` | Polar AccessLink OAuth |

---

## CI gate-smoke + production deploy secrets

In **GitHub → Settings → Secrets**:

| Secret | Purpose |
|--------|---------|
| `SMOKE_BASE_URL` | Preview or production URL for `npm run gate-smoke` / `rate-limit-smoke` |
| `SMOKE_ACCESS_SECRET` | Same as `PRIVATE_ACCESS_SECRET` when gate is on |
| `SMOKE_EXPECT_PWA` | Set `true` after `PRIVATE_MODE=false` to assert `/sw.js` + manifest in gate-smoke |
| `DEPLOY_READINESS_TARGET` | `production` on Vercel prod builds — enforces launch env in `assertDeployReady()` |
| `VERCEL_TOKEN` | CLI token for [`.github/workflows/deploy-production.yml`](../.github/workflows/deploy-production.yml) |
| `VERCEL_ORG_ID` | Vercel team / org id |
| `VERCEL_PROJECT_ID` | Vercel project id |
| `AIKIDO_SECRET_KEY` | Aikido CI gate (optional until set) — [docs/AIKIDO.md](AIKIDO.md); **not** a Vercel env |

CI job `gate-smoke` skips when `SMOKE_BASE_URL` is unset; `continue-on-error: true` until preview URL exists.

Aikido job skips when `AIKIDO_SECRET_KEY` is unset.

**Layer 9 verify:** `SMOKE_BASE_URL=… npm run rate-limit-smoke` — expects HTTP 429 on `/api/leads` burst.

---

## Migrations (launch checklist)

Run through `supabase/migrations/20260703_reminders_optin.sql` (or latest in `supabase/migrations/`) before inviting beta users.

---

## Checklist

- [ ] `PRIVATE_ACCESS_SECRET` set in Vercel Production + Preview
- [ ] `PRIVATE_MODE=true` in Vercel
- [ ] Redeployed after env changes
- [ ] Verified in incognito → `/private` only
- [ ] Unlocked with `?access=SECRET` for your own browsing
- [ ] Supabase URL + anon key set (optional but needed for magic link sync)
- [ ] Cleared old PWA install on your phone if you tested before the gate
- [ ] `STRIPE_WEBHOOK_SECRET` + test Payment Link → enrollment row in Supabase
- [ ] `DEMO_PREMIUM=false` in Production
- [ ] Latest Supabase migrations applied
- [ ] Before public: Upstash + `NEXT_PUBLIC_SENTRY_DSN` ([docs/PRODUCTION_STACK.md](PRODUCTION_STACK.md))
- [ ] GitHub: `VERCEL_*` + `SMOKE_BASE_URL` for Production deploy + smoke
- [ ] Profile backup export once ([docs/BACKUP_RESTORE.md](BACKUP_RESTORE.md))

See also: `SETUP.md` (full business + Supabase schema), `README.md` (dev commands).
