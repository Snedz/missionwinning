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
| `PRIVATE_MODE` | Yes | `true` while in private dev; set `false` when launching publicly |
| `NEXT_PUBLIC_SUPABASE_URL` | Recommended | `https://YOUR-PROJECT.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Recommended | From Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Beta admin + webhooks | Server only — never `NEXT_PUBLIC_` |
| `BETA_ADMIN_EMAILS` | Optional | Your email for Profile → beta funnel (all users) |
| `RESEND_API_KEY` | Optional | Email nudge + receipts |
| `YOUTH_CONSENT_SECRET` | **Yes in prod** | `openssl rand -base64 32` — dedicated; never reuse gate secret |
| `NUDGE_SECRET` | **Yes in prod** | `openssl rand -base64 32` — journey email nudge HMAC |
| `UPSTASH_REDIS_REST_URL` | Optional | Distributed rate limits (Vercel serverless) |
| `UPSTASH_REDIS_REST_TOKEN` | Optional | Pair with Upstash URL above |
| `PRIVATE_ALLOW_QUERY_ACCESS` | Optional | Set `true` only to allow `/?access=` bypass in production (deprecated) |

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

3. Confirm gate: incognito visit to `/` should redirect to `/private`; unlock with your secret on `/private` or `/?access=SECRET`.

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
3. **Sign in:** After unlocking, sign in with Apple, Google, or email magic link (Profile or Welcome onboarding).

---

## OAuth sign-in (Google + Apple)

In **Supabase → Authentication → URL Configuration**:

| Setting | Value |
|---------|--------|
| Site URL | `https://www.missionwinning.com` (or `http://localhost:3000` for dev) |
| Redirect URLs | `https://www.missionwinning.com/auth/callback` |
| Redirect URLs (dev) | `http://localhost:3000/auth/callback` |

### Google (recommended first)

1. [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → OAuth client (Web).
2. Authorized redirect URI: `https://YOUR-PROJECT.supabase.co/auth/v1/callback`
3. Copy **Client ID** + **Client Secret** into Supabase → Authentication → **Google** → Save.

Google sign-in button shows automatically when Supabase keys are set. Hide with `NEXT_PUBLIC_OAUTH_GOOGLE=false` in `.env.local`.

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
4. Save in Supabase, then in `.env.local` set:
   ```bash
   NEXT_PUBLIC_OAUTH_APPLE=true
   ```
5. Redeploy / restart dev server.

Until step 4, the app **does not show** the Apple button (email + Google only). Do not enable Apple in Supabase until all Client ID fields are filled.

Magic link and OAuth both land on `/auth/callback`, then redirect to Today (`/log`) or Profile. Users must accept Terms + Privacy in-app before sign-in.

---

## Why the gate may have looked “broken”

Three things caused the full site to appear public even when the gate was deployed:

1. **Loose Supabase bypass (fixed):** Any cookie whose *name* looked like a Supabase auth cookie bypassed the gate — even invalid values. Magic link sign-in from `/private` also let anyone with any email through.
2. **Your browser cookie:** If you previously used `?access=SECRET` or signed in, your browser bypassed the gate while anonymous visitors were blocked.
3. **PWA cache:** An installed PWA may serve an old cached landing page. Clear site data or uninstall the PWA after enabling the gate.

The gate now requires the **`mw_private_access` cookie** (from password or `?access=`) unless you explicitly set `PRIVATE_ALLOW_AUTH_BYPASS=true`.

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

Your project ref from the saved config: `tnzauplicgfrozvnowqp`

- URL: `https://tnzauplicgfrozvnowqp.supabase.co`
- **SQL:** Run `supabase/migrations/20250629_complete_base_schema.sql` in SQL Editor (fresh project). If you already have tables, individual migrations in `supabase/migrations/` are safe to re-run.
- Enable Email auth → Magic Link
- Enable **Google** OAuth (see above). Leave **Apple disabled** until Services ID + key are ready.
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

## Going fully public (later)

When ready to launch:

1. Set `PRIVATE_MODE=false` in Vercel (Production)
2. Set `DEMO_PREMIUM=false` (required in production)
3. Redeploy
4. Run `SMOKE_BASE_URL=https://www.missionwinning.com npm run gate-smoke` (or set GitHub secret `SMOKE_BASE_URL` for CI)
5. Optionally remove or keep `proxy.ts` — with `PRIVATE_MODE=false` it is a no-op

---

## Stripe webhook (Super Bundle)

Set in Vercel (server only):

| Variable | Purpose |
|----------|---------|
| `STRIPE_WEBHOOK_SECRET` | From Stripe Dashboard → Webhooks → signing secret (`whsec_…`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Required for `grantEnrollmentFromWebhook` |

Webhook URL: `https://www.missionwinning.com/api/stripe-webhook`

Event: `checkout.session.completed` → inserts `enrollments` row (`premium_granted=true`, `product_id=super-bundle`).

Test in Stripe **test mode** before going live. Profile → premium APIs (`/api/premium/*`, `/api/coach/plan`) return **403** without enrollment unless `DEMO_PREMIUM=true` (dev only).

---

## CI gate-smoke (optional)

In **GitHub → Settings → Secrets**:

| Secret | Purpose |
|--------|---------|
| `SMOKE_BASE_URL` | Preview or production URL for `npm run gate-smoke` |
| `SMOKE_ACCESS_SECRET` | Same as `PRIVATE_ACCESS_SECRET` when gate is on |

CI job `gate-smoke` skips when `SMOKE_BASE_URL` is unset; `continue-on-error: true` until preview URL exists.

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

See also: `SETUP.md` (full business + Supabase schema), `README.md` (dev commands).
