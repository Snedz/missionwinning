# Vercel Deploy Checklist — Mission Winning

Use when **Vercel 2FA access returns**, or sync env via **GitHub Actions** (see below).

---

## 1. Code on `master`

**Merged:** [#50](https://github.com/Snedz/missionwinning/pull/50) — H1 daily loop, strict gate, UI stack (`2025.06-unified.36+`).

### Preview vs production (canonical)

GitHub↔Vercel integration often creates **Preview-only** builds for `master` even when Production Branch = `master`. Then `www.missionwinning.com` stays stale until a promote.

**Canonical prod path (2026-07-24 onward): the Vercel Deploy Hook.** A GitHub *webhook* POSTs the hook on every `master` push and Vercel builds production. Webhooks are **not** Actions — they are unmetered and unaffected by a spending limit or failed payment, which is why this is now the primary path rather than a backup. Setup: §1.1 below.

**Fallback:** [`.github/workflows/deploy-production.yml`](../.github/workflows/deploy-production.yml) deploys with `vercel deploy --prod` (build runs on Vercel so Sensitive env vars work). Its **push trigger was removed** so it no longer double-deploys alongside the hook, and so a blocked Actions account stops producing a red run on every push. Run it by hand: Actions → **Deploy production** → Run workflow.

**Lean CI (2026-07-24):** Full CI no longer runs on every `master` push — that burned Actions minutes and blocked production deploys when the spending limit hit. Default gate is [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) on **PRs only**. Heavy jobs live in [`.github/workflows/ci-extended.yml`](../.github/workflows/ci-extended.yml) (manual / weekly). CodeQL is **monthly + dispatch** only.

Required GitHub Actions secrets:

| Secret | Value |
|--------|--------|
| `VERCEL_TOKEN` | Vercel CLI / account token |
| `VERCEL_ORG_ID` | `team_Akwar4ZvbahQp5HR911ebrlW` |
| `VERCEL_PROJECT_ID` | `prj_yqoUE2ENzRRdeiMdqkqyC49czxxp` |
| `AIKIDO_SECRET_KEY` | Aikido CI (optional) — GitHub Actions only; see [docs/AIKIDO.md](AIKIDO.md) |

### 1.1 Deploy Hook → GitHub webhook (one-time, founder)

The durable path. No Actions minutes, no billing dependency.

1. Vercel → Project → **Settings → Git → Deploy Hooks** → create a hook for **Production** / `master`.
2. Copy the hook URL. **Treat it as a secret** — anyone holding it can trigger a production
   build. Do not paste it into a chat, an issue, or this repo.
3. GitHub → repo **Settings → Webhooks → Add webhook**.
4. Payload URL = the hook URL · Content type `application/json` · events: **Just the push event**.
5. Save, then check **Recent Deliveries** for a `201`/`2xx`. Vercel should show a new
   Production build within a few seconds.

The hook is Production-scoped on Vercel, so pushes to other branches are harmless.

### 1.2 Shipping a commit that is already on `master`

The webhook only fires on *new* pushes, so a commit merged before setup needs one promote:

1. Vercel → **Deployments** → find the SHA → **Promote to Production**, or
2. `npx vercel deploy --prod --yes` from a clean checkout, or
3. `vercel promote <preview-url> --yes`.

### 1.3 Verify what is actually live

`APP_BUILD_LABEL` (`src/lib/buildInfo.ts`) is rendered on Profile, so the deployed label is
the ground truth — not the Vercel dashboard's "Ready" badge, which can refer to a Preview.
While `PRIVATE_MODE=true` the gate page is the only unauthenticated surface.

### 1.4 If Actions is blocked

A job that fails in **under ~5 seconds with no downloadable logs** never got a runner — that
is a billing/spending-limit state, not a code failure. Symptom: *every* workflow fails
instantly regardless of commit (Deploy production, CI, Aikido together).

1. **Billing** — GitHub → Settings → Billing: clear the spending limit / failed payment.
2. **Confirm secrets** — `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` under repo Actions secrets.
3. Note the **PR gate is inert** while Actions is down: `ci.yml` (lint · typecheck · tests ·
   build · `npm run e2e:gate`) cannot run, so nothing blocks a regression reaching `master`.
   Run `npm run e2e:gate` locally against a production build until it is back.

Deploys themselves do not depend on any of this once §1.1 is wired.

### 1.5 Preview-only diagnosis

GitHub **Deployments** may list only `Preview` from the Git integration — that does not move
the production alias by itself. Check Vercel → **Settings → Git → Production Branch = `master`**;
if it is unset or points elsewhere, that is the root cause and fixing it makes the Actions
workflow redundant rather than load-bearing.

---

## 2. Environment variables

See [ENV.md](ENV.md) and [PROTECTION.md](PROTECTION.md).

| Variable | Required for gate |
|----------|-------------------|
| `PRIVATE_ACCESS_SECRET` | Rotate with `openssl rand -base64 32` — **never** ship the dev placeholder `Done` to Production |
| `PRIVATE_MODE` | `true` during private beta |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Webhooks, leads API, beta panel |
| `BETA_ADMIN_EMAILS` | Founder beta metrics |
| `DEMO_PREMIUM` | **`false`** in production |
| `UPSTASH_REDIS_REST_URL` / `_TOKEN` | **Required before public** — [docs/PRODUCTION_STACK.md](PRODUCTION_STACK.md) L9 |
| `NEXT_PUBLIC_SENTRY_DSN` | **Required before public** — L12 |
| `SMOKE_BASE_URL` (GitHub) | Post-deploy `gate-smoke` + `rate-limit-smoke` (CI extended) |

### Option A — Vercel dashboard

Vercel → Project → Settings → Environment Variables → **Production + Preview** → Redeploy.

### Option B — GitHub Secrets (no Vercel UI)

1. Add secrets listed in [ENV.md § Sync via GitHub](ENV.md) (`VERCEL_TOKEN`, `VERCEL_PROJECT_ID`, `PRIVATE_ACCESS_SECRET`, …).
2. **Actions → Sync Vercel env → Run workflow**.
3. Optional: set `VERCEL_DEPLOY_HOOK_URL` so the workflow triggers a production redeploy.

OAuth redirect: `https://www.missionwinning.com/auth/callback`  
Also enable each social provider in **Supabase → Authentication → Providers** before setting `NEXT_PUBLIC_OAUTH_*` (see [ENV.md](ENV.md) — Google first; Apple / Azure / Facebook are opt-in flags).

---

## 3. Redeploy + verify

```bash
# Gate (incognito, no cookies)
curl -sI https://www.missionwinning.com/ | grep -i location
# Expected: location: /private

# Build label on Profile footer (match latest unified.*)
# e.g. 2025.06-unified.37

# Premium API without auth
curl -sI https://www.missionwinning.com/api/premium/recipes
# Expected: 403

# Local / CI gate smoke
SMOKE_BASE_URL=https://www.missionwinning.com SMOKE_ACCESS_SECRET=… npm run gate-smoke
SMOKE_BASE_URL=https://www.missionwinning.com npm run rate-limit-smoke
```

Ops scorecard: [docs/PRODUCTION_STACK.md](PRODUCTION_STACK.md).

---

## 4. Beta smoke test (mobile)

1. `/private` → access code → `/welcome` I-Day
2. Today → start workout → complete → Win Score updates
3. Profile → language → **العربية** → RTL layout + Arabic nav
4. Fuel → photo estimate → log entry
5. Send beta invites per [BETA_INVITE.md](BETA_INVITE.md)

---

## 5. Before public (`PRIVATE_MODE=false`)

- Beta gates in [PRE_LAUNCH_PLAN.md](archive/PRE_LAUNCH_PLAN.md) pass
- I-Day ≥80%, Basic Training ≥60%
- `DEMO_PREMIUM=false` confirmed on Production
