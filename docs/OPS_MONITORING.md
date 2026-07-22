# Ops monitoring — Mission Winning

**Audience:** founder + whoever holds Vercel/Sentry/Upstash.  
**Goal:** know within minutes if prod is down, checkout broke, or error rate spiked — before public flip and after.

Companion: [LAUNCH_RUNBOOK.md](LAUNCH_RUNBOOK.md) · [PRODUCTION_STACK.md](PRODUCTION_STACK.md) · [API.md](API.md) (`GET /api/health`).

---

## 1. Health endpoint

| Mode | Auth | Use |
|------|------|-----|
| `GET /api/health` | none | Liveness — always **200** `{ ok, build, time }` |
| `GET /api/health?deep=1` | `Authorization: Bearer $CRON_SECRET` | Readiness — Supabase ping, Redis (if configured), env sanity. **503** if hard-fail |

```bash
curl -sS https://www.missionwinning.com/api/health
curl -sS -H "Authorization: Bearer $CRON_SECRET" \
  "https://www.missionwinning.com/api/health?deep=1"
```

Wrong bearer on deep → **401**.

---

## 2. Uptime monitor (post-flip: 1-min interval)

Point an external pinger at **shallow** health only (no secret in third-party):

- **URL:** `https://www.missionwinning.com/api/health`
- **Expect:** HTTP 200, body contains `"ok":true`
- **Interval:** 1 minute after public flip; 5 minutes is fine while private
- **Alert:** email/SMS to founder on 2 consecutive failures

Optional weekly deep check (local or CI with secret):

```bash
curl -sf -H "Authorization: Bearer $CRON_SECRET" \
  "$SMOKE_BASE_URL/api/health?deep=1" | jq .
```

Suggested providers: Better Stack, Checkly, UptimeRobot, or Vercel Monitoring if enabled.

---

## 3. Sentry alert rules to create

When `NEXT_PUBLIC_SENTRY_DSN` is set:

1. **Error-rate spike** — project-wide: errors/min > baseline × 3 for 5 minutes → notify founder.
2. **New issue in checkout / webhook** — filter issues whose stack or transaction includes:
   - `stripe-webhook`
   - `checkout`
   - `crypto-checkout`
   - `premium`
3. **Unhandled API 500** — issue title/message contains `Enrollment failed` or `webhook` → high priority.

Escalation path: **founder only** (email/phone in Sentry team). No on-call rotation yet.

---

## 4. Where dashboards live

| Surface | What |
|---------|------|
| **Vercel → Project → Deployments / Logs** | Build failures, function errors, cron runs |
| **Sentry → Issues / Performance** | Client + server exceptions (when DSN set) |
| **Supabase → Table Editor / Logs** | `profiles`, `beta_invites`, `checkout_recovery`, enrollments |
| **Stripe → Developers → Webhooks** | Delivery success for `checkout.session.completed` + `expired` |
| **PostHog** (if key set) | Funnel events after user analytics allow |
| **Profile → Beta funnel** (`BETA_ADMIN_EMAILS`) | In-app invite + launch gates |

---

## 5. Cron jobs to watch

| Path | Schedule | Dry-run |
|------|----------|---------|
| `/api/cron/nudges` | daily | `?dryRun=1` — retention + invite day-2/7 + checkout recovery |
| `/api/cron/weekly-digest` | Monday | `?dryRun=1` — founder digest |

Auth: `Authorization: Bearer $CRON_SECRET`.

---

## 6. Escalation

1. Confirm shallow `/api/health` and Vercel status.
2. Check latest deploy + Sentry new issues.
3. Stripe webhook delivery log if payments broken.
4. Rollback last deploy if needed (Vercel Instant Rollback).
5. Founder owns user comms if downtime &gt; 15 min post-flip.
