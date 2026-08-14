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
| `VERCEL_ORG_ID` | Vercel team / org ID (GitHub secret only — do not paste real IDs into docs) |
| `VERCEL_PROJECT_ID` | Vercel project ID (GitHub secret only — do not paste real IDs into docs) |
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

### 1.3 Public open source — protect dispatch workflows

When the GitHub repo is **Public**, anyone with write access (or a leaked PAT) can run
`workflow_dispatch` jobs that inject production secrets (`deploy-production`,
`sync-vercel-env`, `apply-migration`).

**Founder setup (once):**

1. Prefer the **Deploy Hook** (§1.1) for day-to-day prod — no Actions secrets on the hot path.
2. GitHub → Settings → **Environments** → create `production`.
3. Require **reviewers** (yourself) on that environment.
4. Point the dispatch workflows that hold deploy/DB secrets at `environment: production`
   (or keep them manual-only and rarely used).

See [OPEN_SOURCE.md](OPEN_SOURCE.md) pre-public checklist.

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
   **Run `npm run gate` before pushing** — it runs the same checks locally and starts and
   stops the production server itself ([scripts/gate.mjs](../scripts/gate.mjs)). It does not
   cover `npm run a11y`, `npm run e2e:visual` or Lighthouse; run those separately.

Deploys themselves do not depend on any of this once §1.1 is wired.

### 1.5 Preview-only diagnosis

GitHub **Deployments** may list only `Preview` from the Git integration — that does not move
the production alias by itself. Check Vercel → **Settings → Git → Production Branch = `master`**;
if it is unset or points elsewhere, that is the root cause and fixing it makes the Actions
workflow redundant rather than load-bearing.

### 1.6 Free-tier deploy quota (100 / rolling day) — **read before thrashing**

Vercel **Hobby (free)** caps **deployments** (production + preview + redeploys) at about
**100 per rolling 24 hours** (`api-deployments-free-per-day`). When exhausted:

- **Production promote fails** even if `master` is green.
- **Preview deploys for every PR** (including Dependabot) still count against the same bucket.
- Symptom: CLI / dashboard error containing `api-deployments-free-per-day` or “too many
  deployments”; www can lag `master` by one or more `.N` labels.

**Measured 2026-08-03:** after ships `.265`–`.277` in one day, master was `.277` while
www stayed on `.276` until the quota recovered. Code ahead of production is a **trust bug**
for beta testers (Profile build label ≠ repo).

#### Agent / ship discipline (default)

| Do | Don’t |
|----|--------|
| **1–2 meaningful PRs per day** that touch `src` / `app` (each merge → prod hook) | Ten chrome-only ships the same afternoon |
| Batch small fixes into **one** concern-coherent PR | Open a Dependabot PR storm + craft PRs the same hour |
| Prefer **promote existing deployment** when the build already exists (§1.2) | Redeploy-from-scratch just to “nudge” |
| Docs-only / spine-only PRs when possible (no product deploy if Vercel ignores docs-only — still check) | Assume every commit is free |
| After quota error: **stop shipping** product deploys; wait for reset or founder Pro | Retry promote in a loop |

#### Founder UI levers (Vercel project)

1. **Git → Ignored Build Step** (or “Skip deployments” for paths) for pure docs if available on plan.
2. **Disable automatic preview** for Dependabot / bot branches if the project setting allows it —
   Dependabot bumps still run CI on GitHub; they do not need a full Vercel preview each time
   during free-tier crunch.
3. Optional: **Pro** if craft velocity stays high for weeks — removes the ceiling; not required
   for Horizon W if agents batch.

#### Recovery checklist when www ≠ master

1. Confirm error was quota (not secrets / build failure).
2. Wait until the rolling window frees slots (often next calendar day UTC-ish).
3. Promote the latest successful Production-ready deployment for the desired SHA (§1.2), or
   one `vercel deploy --prod` / Deploy Hook fire — **once**.
4. Verify Profile / health shows the expected `APP_BUILD_LABEL` (§1.3).

**Kaizen note:** success is not “number of `.N` builds per day.” Prefer activation and honest
product over paint-layer thrash that burns the deploy budget.

---

## 2. Environment variables

See [ENV.md](ENV.md) and [PROTECTION.md](PROTECTION.md).

| Variable | Required for gate |
|----------|-------------------|
| `PRIVATE_ACCESS_SECRET` | Rotate with `openssl rand -base64 32` — **never** ship the dev placeholder `Done` to Production as the HMAC secret |
| `PRIVATE_ACCESS_CODES` | Optional aliases for `/private` (e.g. `Done`) — **Production + Preview**, same value |
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
