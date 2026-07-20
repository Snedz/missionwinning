# Vercel Deploy Checklist — Mission Winning

Use when **Vercel 2FA access returns**, or sync env via **GitHub Actions** (see below).

---

## 1. Code on `master`

**Merged:** [#50](https://github.com/Snedz/missionwinning/pull/50) — H1 daily loop, strict gate, UI stack (`2025.06-unified.36+`).

Vercel auto-deploys on push to `master` when the GitHub integration is connected and **Production Branch** is set to `master`.

### Preview vs production (2026-07-19)

GitHub integration often creates **Preview-only** builds for `master` even when Production Branch = `master`. Then `www.missionwinning.com` stays stale until a promote.

**Canonical fix (repo):** [`.github/workflows/deploy-production.yml`](.github/workflows/deploy-production.yml) runs on **push to `master`** and `workflow_dispatch`, and deploys with `vercel deploy --prod` (build runs on Vercel so Sensitive env vars work).

Required GitHub Actions secrets (set 2026-07-19):

| Secret | Value |
|--------|--------|
| `VERCEL_TOKEN` | Vercel CLI / account token |
| `VERCEL_ORG_ID` | `team_Akwar4ZvbahQp5HR911ebrlW` |
| `VERCEL_PROJECT_ID` | `prj_yqoUE2ENzRRdeiMdqkqyC49czxxp` |
| `AIKIDO_SECRET_KEY` | Aikido CI (optional) — GitHub Actions only; see [docs/AIKIDO.md](docs/AIKIDO.md) |

**Manual fallback** if the workflow is not wired yet:

1. Vercel → Project → **Settings → Git** → confirm Production Branch = `master`
2. Promote latest Ready Preview: `vercel promote <preview-url> --yes`
3. Or **Actions → Deploy production** / `npx vercel deploy --prod --yes`

GitHub **Deployments** tab may list only `Preview` — that does not update the production alias by itself.

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
| `UPSTASH_REDIS_REST_URL` / `_TOKEN` | **Required before public** — [docs/PRODUCTION_STACK.md](docs/PRODUCTION_STACK.md) L9 |
| `NEXT_PUBLIC_SENTRY_DSN` | **Required before public** — L12 |
| `SMOKE_BASE_URL` (GitHub) | Post-deploy `gate-smoke` + `rate-limit-smoke` |

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

Ops scorecard: [docs/PRODUCTION_STACK.md](docs/PRODUCTION_STACK.md).
---

## 4. Beta smoke test (mobile)

1. `/private` → access code → `/welcome` I-Day
2. Today → start workout → complete → Win Score updates
3. Profile → language → **العربية** → RTL layout + Arabic nav
4. Fuel → photo estimate → log entry
5. Send beta invites per [BETA_INVITE.md](BETA_INVITE.md)

---

## 5. Before public (`PRIVATE_MODE=false`)

- Beta gates in [PRE_LAUNCH_PLAN.md](docs/archive/PRE_LAUNCH_PLAN.md) pass
- I-Day ≥80%, Basic Training ≥60%
- `DEMO_PREMIUM=false` confirmed on Production
