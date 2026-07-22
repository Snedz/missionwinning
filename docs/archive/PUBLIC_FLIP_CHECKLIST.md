> Superseded by [LAUNCH_RUNBOOK.md](../LAUNCH_RUNBOOK.md) as of 2026-07-19 (Wave 9).

# Public flip checklist — offline, SW, Search Console

**When:** After Horizon 0 gates pass and founder is ready to set `PRIVATE_MODE=false`.  
**Companion:** [SOFT_LAUNCH_DAY.md](SOFT_LAUNCH_DAY.md) · [../SEO_ANALYTICS.md](../SEO_ANALYTICS.md) · [TRACK_D_GO_LIVE.md](TRACK_D_GO_LIVE.md) · [../PRODUCTION_STACK.md](../PRODUCTION_STACK.md) Wave B (L10 PWA)

This is the **agent-prepared** one-pager for the technical smoke after public mode. Founder still owns the Vercel env flip.

**Pre-flip ops:** Upstash + Sentry DSN + rate-limit-smoke green ([../PRODUCTION_STACK.md](../PRODUCTION_STACK.md) Wave A).

---

**Wave 2–3 prep:** [LAUNCH_READY.md](LAUNCH_READY.md) — conversion, SEO, email, growth smoke, ordered flip sequence.

## Pre-flip (gate still on)

### Agent-prepped (code / scripts)

- [x] Invite links use `/private?invite=` (no default `?access=`) — `print-beta-invite` + BetaAdminPanel
- [x] `gate-smoke` asserts invitee `/private?invite=` (`data-mw-invitee=1`) + Profile build label
- [x] `launch-verify` chains gate + growth + rate-limit (+ week4 when `CRON_SECRET` set)
- [x] Hero Mission Score e2e fail-closed via Active builder (no Learn soft-skip)
- [ ] Linux `@visual` baselines committed → then drop `continue-on-error` on `visual-regression`
- [ ] `SMOKE_BASE_URL=… npm run growth-smoke` green against staging/prod
- [ ] `LAUNCH_STRICT=true npm run launch-verify` against prod (with access secret)
- [ ] `SMOKE_BASE_URL=… CRON_SECRET=… npm run week4-smoke` green (digest dryRun)

### Founder / ops

- [ ] CI green on `master` (`build-and-test` + `e2e-critical`)
- [ ] Profile footer build label matches [`src/lib/buildInfo.ts`](../../src/lib/buildInfo.ts)
- [ ] Growth migration applied (verify 6 columns) — [LAUNCH_READY.md](LAUNCH_READY.md) §1
- [ ] `NEXT_PUBLIC_SITE_URL=https://www.missionwinning.com` on Production
- [ ] `RESEND_FROM` is a verified domain (not `resend.dev`) if sending mail
- [ ] `SMOKE_BASE_URL=… npm run rate-limit-smoke` sees 429 (Upstash Wave A)
- [ ] Stripe test path once verified ([../STRIPE_PREMIUM_SETUP.md](../STRIPE_PREMIUM_SETUP.md))

**One-shot pre-flip (preferred):**

```bash
SMOKE_BASE_URL=https://www.missionwinning.com \
SMOKE_ACCESS_SECRET=… \
CRON_SECRET=… \
LAUNCH_STRICT=true \
npm run launch-verify
```

---

## Flip (founder only)

1. Vercel Production: `PRIVATE_MODE=false` (+ confirm `NEXT_PUBLIC_SITE_URL` www)
2. Confirm Serwist SW builds when gate is off (`app/sw.ts`) — `PRIVATE_MODE=false` so SW is not disabled
3. Redeploy from `master`

---

## Post-flip smoke (same day)

### 1. Public access

```bash
curl -sfI https://www.missionwinning.com/ | head -5
curl -sfI https://www.missionwinning.com/log | head -5
# Should NOT permanently redirect the whole app to /private
```

```bash
SMOKE_BASE_URL=https://www.missionwinning.com \
SMOKE_ALLOW_PUBLIC=true \
SMOKE_EXPECT_PWA=true \
npm run launch-verify
```

### 1b. Growth + capture

```bash
SMOKE_BASE_URL=https://www.missionwinning.com npm run growth-smoke
# Landing capture: open / → scroll to launch list → submit test email
# Confirm lead row package_interest = landing-updates (Supabase)
```

### 2. Offline + service worker

**Assert SW file after public build:**

```bash
curl -sfI https://www.missionwinning.com/sw.js | head -5
# Expect 200 (or 304), content-type javascript — not 404
```

On a real phone (production URL):

1. Open site → **Add to Home Screen** / Install when offered  
2. Confirm service worker registered (browser Application → Service Workers, or DevTools)  
3. Open `/offline` once online so it can cache  
4. Airplane mode → open installed PWA → Today or Active still loads shell  
5. Log **one set** offline → come online → confirm local persist still holds  

Checklist:

- [ ] `/offline` returns 200 while online  
- [ ] SW registered when PWA enabled  
- [ ] Airplane: app shell usable  
- [ ] One offline set log survives  

### 3. Search Console (SEO)

- [ ] Property for `https://www.missionwinning.com` verified ([SEO_ANALYTICS.md](SEO_ANALYTICS.md))  
- [ ] Submit `https://www.missionwinning.com/sitemap.xml`  
- [ ] Spot-check `/guide/*` and `/exercises/*` index coverage after 48h  

### 4. Analytics baseline

- [ ] `NEXT_PUBLIC_POSTHOG_KEY` set on Production (if using PostHog)  
- [ ] Capture first 48h: visit → `iday_*` → `first_workout_completed` / `workout_completed`  
- [ ] Note activation rate for week-1 return (feeds Horizon 2 wall metric)

### 5. Soft launch distribution

Follow [SOCIAL_LAUNCH.md](SOCIAL_LAUNCH.md) Phase B + [SOFT_LAUNCH_DAY.md](archive/SOFT_LAUNCH_DAY.md) same-day posts.

---

## Rollback

If public flip breaks auth, payments, or offline badly:

1. Vercel: set `PRIVATE_MODE=true` (or prior value)  
2. Redeploy  
3. File incident note in [LOG.md](../LOG.md)  

---

## Related

| Doc | Role |
|-----|------|
| [SOFT_LAUNCH_DAY.md](archive/SOFT_LAUNCH_DAY.md) | Full flip-day founder checklist |
| [SOCIAL_LAUNCH.md](SOCIAL_LAUNCH.md) | Copy kit |
| [LIGHTHOUSE_BASELINE.md](LIGHTHOUSE_BASELINE.md) | Perf budgets (already ≥90 on key routes) |
| [../ORCHESTRATION.md](../ORCHESTRATION.md) | Horizon sequencing |
