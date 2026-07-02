# Mission Winning — Deploy & Environment (canonical)

One doc for **local env setup, Vercel deployment, environment variables, the private gate, OAuth, payments webhooks, and launch verification**. Consolidates the former `ENV.md` and `VERCEL_DEPLOY_CHECKLIST.md`.

Related docs:
- [SETUP.md](SETUP.md) — business structure, Supabase schema, product model
- [PROTECTION.md](PROTECTION.md) — private-gate security model + inspection checklist
- [PRE_LAUNCH_PLAN.md](PRE_LAUNCH_PLAN.md) — beta gates before going public

---

## 1. Local quick start

```bash
cd missionwinning
cp .env.example .env.local
# Edit .env.local — at minimum set PRIVATE_ACCESS_SECRET and Supabase keys
npm install
npm run dev
```

Visit http://localhost:3000. With `PRIVATE_MODE=true` in `.env.local`, anonymous visits redirect to `/private` until you use your access code.

Useful scripts: `npm run check-env` (validates `.env.local`), `npm test`, `npm run lint`, `npm run typecheck`, `npm run gate-smoke -- <url>`.

---

## 2. Environment variables

Set in **Vercel → Project → Settings → Environment Variables** for **Production + Preview**. After adding or changing env vars: **Deployments → Redeploy** (changes do not apply until redeploy).

| Variable | Required | Notes |
|----------|----------|-------|
| `PRIVATE_ACCESS_SECRET` | **Yes** | `openssl rand -base64 32` — one strong secret, saved somewhere safe. Not a placeholder. |
| `PRIVATE_MODE` | **Yes** | `true` during private beta; `false` to launch publicly |
| `DEMO_PREMIUM` | **Yes in prod** | **`false`** — the single highest-impact misconfiguration if left on |
| `NEXT_PUBLIC_SUPABASE_URL` | Recommended | `https://YOUR-PROJECT.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Recommended | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Webhooks + beta admin | Server only — never `NEXT_PUBLIC_` |
| `BETA_ADMIN_EMAILS` | Optional | Your email for Profile → beta funnel metrics |
| `RESEND_API_KEY` | Optional | Email nudges + receipts |
| `CSP_ENFORCE` | Optional | Production enforces CSP by default; `false` = Report-Only (previews) |

### PayPal webhook (Super Bundle — when LLC ready)

Server only — never `NEXT_PUBLIC_`:

| Variable | Purpose |
|----------|---------|
| `PAYPAL_WEBHOOK_ID` | PayPal Developer → your app → Webhooks |
| `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` | REST app credentials |
| `PAYPAL_ENV` | `sandbox` (default) or `live` |

Webhook URL: `https://www.missionwinning.com/api/paypal-webhook` · Events: `PAYMENT.CAPTURE.COMPLETED`, `BILLING.SUBSCRIPTION.ACTIVATED`. Forged requests without PayPal transmission headers return **401**; unconfigured env returns **503**.

### Stripe webhook

| Variable | Purpose |
|----------|---------|
| `STRIPE_WEBHOOK_SECRET` | Signature verification (`whsec_…`) — unconfigured returns **503** |

Webhook URL: `https://www.missionwinning.com/api/stripe-webhook` · Event: `checkout.session.completed`.

### Sync via GitHub (when the Vercel dashboard is locked)

If you cannot open Vercel (e.g. 2FA reset), push env vars from **GitHub Secrets**:

1. **GitHub → repo → Settings → Secrets and variables → Actions → New repository secret**

   | Secret | Required | Notes |
   |--------|----------|-------|
   | `VERCEL_TOKEN` | **Yes** | [vercel.com/account/tokens](https://vercel.com/account/tokens) |
   | `VERCEL_PROJECT_ID` | **Yes** | From a teammate, old deploy log, or email |
   | `VERCEL_ORG_ID` | If team project | Team Settings → General → Team ID |
   | + every app variable above | | Same values you'd set in the dashboard |
   | `VERCEL_DEPLOY_HOOK_URL` | Optional | Deploy Hooks → Production — auto-redeploy after sync |

2. **Actions → Sync Vercel env → Run workflow** (manual trigger).
3. Verify the gate (§4).

Local dry-run: `export VERCEL_TOKEN=… VERCEL_PROJECT_ID=… PRIVATE_ACCESS_SECRET=…` then `npm run sync-vercel-env`.

**Note:** the GitHub ↔ Vercel integration auto-deploys on push to `master`; it does **not** copy GitHub Secrets to Vercel. Use the workflow.

---

## 3. Deploying

Vercel auto-deploys on push to `master` when the GitHub integration is connected. Manual: `npx vercel --prod`.

- Domain: add `www.missionwinning.com` + apex in Vercel; update DNS at the registrar with the records Vercel provides.
- Redirects + security headers: see `vercel.json` (old `/programs` → `/learn`, `/beta` → `/bundle`).
- PWA: Serwist (`@serwist/next`) generates `public/sw.js` at build. **Precache is disabled while `PRIVATE_MODE=true`** (prevents offline leak of the full app) and in dev.
- CSP is set in `next.config.mjs`; production enforces by default (override with `CSP_ENFORCE`).

---

## 4. Verify after deploy

```bash
# Private gate (no cookies)
curl -sI https://www.missionwinning.com/ | grep -i location
# Expected: location: /private

# Premium API without auth
curl -sI https://www.missionwinning.com/api/premium/recipes
# Expected: 403

# Full gate smoke
npm run gate-smoke -- https://www.missionwinning.com
```

- Build label on Profile footer should match the latest `2025.06-unified.*`.
- In **incognito**, the site should show only “Private Development”.

### Unlocking the site (private mode)

1. **Password:** https://www.missionwinning.com/private → enter `PRIVATE_ACCESS_SECRET`.
2. **URL shortcut:** visit `/?access=YOUR_SECRET` once — sets a 30-day httpOnly cookie.
3. Then sign in (Google / magic link) via Profile or Welcome.

If the gate looks “broken”: check your own browser cookie (`mw_private_access`), and clear/uninstall any previously installed PWA that cached the public landing page. Details in [PROTECTION.md](PROTECTION.md).

---

## 5. OAuth sign-in (Google + Apple)

In **Supabase → Authentication → URL Configuration**:

| Setting | Value |
|---------|-------|
| Site URL | `https://www.missionwinning.com` (or `http://localhost:3000` dev) |
| Redirect URLs | `https://www.missionwinning.com/auth/callback` (+ localhost for dev) |

**Google (recommended first):** Google Cloud Console → Credentials → OAuth client (Web) → redirect URI `https://YOUR-PROJECT.supabase.co/auth/v1/callback` → copy Client ID + Secret into Supabase → Authentication → Google. The button shows automatically when Supabase keys are set (hide with `NEXT_PUBLIC_OAUTH_GOOGLE=false`).

**Apple (optional — requires Apple Developer account):** create a **Services ID** (e.g. `com.missionwinning.web`) with Sign in with Apple enabled and return URL `https://YOUR-PROJECT.supabase.co/auth/v1/callback`; create a `.p8` key (note Key ID + Team ID); fill all fields in Supabase → Authentication → Apple; then set `NEXT_PUBLIC_OAUTH_APPLE=true`. **Leave Apple disabled in Supabase until every field is filled** — the “At least one Client ID is required” error means it was toggled on empty.

Magic link and OAuth both land on `/auth/callback`, then redirect to Today (`/log`).

---

## 6. Supabase project

- **SQL:** run `supabase/migrations/20250629_complete_base_schema.sql` in the SQL Editor (fresh project; idempotent). Individual migrations in `supabase/migrations/` are safe to re-run. Full reference: `supabase/schema.sql`. Table docs in [SETUP.md](SETUP.md).
- Enable Email auth → Magic Link; enable Google OAuth (§5).
- Add redirect URL `https://YOUR-DOMAIN/auth/callback` (+ localhost).
- Copy URL + anon key into Vercel env vars (§2).

---

## 7. Beta smoke test (mobile)

1. `/private` → access code → `/welcome` I-Day
2. Today → start workout → complete → Win Score updates
3. Profile → language → **العربية** → RTL layout + Arabic nav
4. Fuel → photo estimate → log entry
5. Send beta invites per [BETA_INVITE.md](BETA_INVITE.md)

---

## 8. Going public (`PRIVATE_MODE=false`)

Pre-conditions — see [PRE_LAUNCH_PLAN.md](PRE_LAUNCH_PLAN.md):
- Beta gates pass (≥10 users; I-Day ≥80%; Basic Training ≥60%)
- `DEMO_PREMIUM=false` confirmed on Production

Then:
1. Set `PRIVATE_MODE=false` in Vercel (Production)
2. Redeploy — the PWA precache activates automatically
3. `proxy.ts` becomes a no-op with the gate off (keep or remove)

---

## Checklist

- [ ] `PRIVATE_ACCESS_SECRET` set in Vercel Production + Preview
- [ ] `PRIVATE_MODE=true` (beta) in Vercel
- [ ] `DEMO_PREMIUM=false` in Production
- [ ] Redeployed after env changes
- [ ] Incognito visit → `/private` only; premium API → 403
- [ ] Unlocked with `?access=SECRET` for your own browsing
- [ ] Supabase URL + anon key set; migrations run
- [ ] Cleared old PWA install on test devices from before the gate
