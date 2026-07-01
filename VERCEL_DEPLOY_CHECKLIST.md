# Vercel Deploy Checklist — Mission Winning

Use when **Vercel 2FA access returns**, or sync env via **GitHub Actions** (see below).

---

## 1. Code on `master`

**Merged:** [#50](https://github.com/Snedz/missionwinning/pull/50) — H1 daily loop, strict gate, UI stack (`2025.06-unified.36+`).

Vercel auto-deploys on push to `master` when the GitHub integration is connected.

---

## 2. Environment variables

See [ENV.md](ENV.md) and [PROTECTION.md](PROTECTION.md).

| Variable | Required for gate |
|----------|-------------------|
| `PRIVATE_ACCESS_SECRET` | Rotate with `openssl rand -base64 32` — **not** the old placeholder `Done` |
| `PRIVATE_MODE` | `true` during private beta |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Webhooks, leads API, beta panel |
| `BETA_ADMIN_EMAILS` | Founder beta metrics |
| `DEMO_PREMIUM` | **`false`** in production |

### Option A — Vercel dashboard

Vercel → Project → Settings → Environment Variables → **Production + Preview** → Redeploy.

### Option B — GitHub Secrets (no Vercel UI)

1. Add secrets listed in [ENV.md § Sync via GitHub](ENV.md) (`VERCEL_TOKEN`, `VERCEL_PROJECT_ID`, `PRIVATE_ACCESS_SECRET`, …).
2. **Actions → Sync Vercel env → Run workflow**.
3. Optional: set `VERCEL_DEPLOY_HOOK_URL` so the workflow triggers a production redeploy.

OAuth redirect: `https://www.missionwinning.com/auth/callback`

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

# Local / CI gate smoke (optional)
npm run gate-smoke -- https://www.missionwinning.com
```

---

## 4. Beta smoke test (mobile)

1. `/private` → access code → `/welcome` I-Day
2. Today → start workout → complete → Win Score updates
3. Profile → language → **العربية** → RTL layout + Arabic nav
4. Fuel → photo estimate → log entry
5. Send beta invites per [BETA_INVITE.md](BETA_INVITE.md)

---

## 5. Before public (`PRIVATE_MODE=false`)

- Beta gates in [PRE_LAUNCH_PLAN.md](PRE_LAUNCH_PLAN.md) pass
- I-Day ≥80%, Basic Training ≥60%
- `DEMO_PREMIUM=false` confirmed on Production
