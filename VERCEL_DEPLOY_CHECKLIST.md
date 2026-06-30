# Vercel Deploy Checklist — Mission Winning

Use when **Vercel 2FA access returns**. Merge open PRs to `master` first (recommended order: #22 → #26), then deploy.

---

## 1. Merge PR stack

| PR | Topic |
|----|--------|
| [#22](https://github.com/Snedz/missionwinning/pull/22) | Challenge i18n, photo estimate, wins badges |
| [#23](https://github.com/Snedz/missionwinning/pull/23) | Staggered hero + section reorder |
| [#24](https://github.com/Snedz/missionwinning/pull/24) | PayPal verify + CSP enforce |
| [#25](https://github.com/Snedz/missionwinning/pull/25) | Fuel i18n + leads rate limit |
| [#26](https://github.com/Snedz/missionwinning/pull/26) | Pro programs server-split |
| Latest | … pillar polish (#30), CI/tests (#31) |

---

## 2. Vercel env vars (Production + Preview)

See [ENV.md](ENV.md) and [PROTECTION.md](PROTECTION.md).

| Variable | Required for gate |
|----------|-------------------|
| `PRIVATE_ACCESS_SECRET` | Rotate with `openssl rand -base64 32` |
| `PRIVATE_MODE` | `true` during private beta |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Webhooks, leads API, beta panel |
| `BETA_ADMIN_EMAILS` | Founder beta metrics |
| `DEMO_PREMIUM` | **`false`** in production |
| `STRIPE_WEBHOOK_SECRET` | When Stripe live |
| `PAYPAL_*` | When PayPal live |

OAuth redirect: `https://www.missionwinning.com/auth/callback`

---

## 3. Redeploy + verify

```bash
# Gate (incognito, no cookies)
curl -sI https://www.missionwinning.com/ | grep -i location
# Expected: location: /private

# Build label on Profile footer (match latest unified.*)
# e.g. 2025.06-unified.16

# Premium API without auth
curl -sI https://www.missionwinning.com/api/premium/recipes
# Expected: 403
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
