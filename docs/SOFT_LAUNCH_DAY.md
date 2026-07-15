# Soft launch day — ready checklist

**Do not run the flip until beta `launchReady` is true** (10+ profiles, I-Day ≥80%, BT ≥60%).  
Agents prepare this checklist; **you** flip Vercel env.

Full commands: [TRACK_D_GO_LIVE.md](TRACK_D_GO_LIVE.md) · Posts: [SOCIAL_LAUNCH.md](SOCIAL_LAUNCH.md) Phase B

---

## Pre-flight (same week as flip)

- [ ] Profile founder panel: `launchReady: true`
- [ ] Stripe test checkout → `enrollments` row ([LLC_AND_PAYMENTS.md](LLC_AND_PAYMENTS.md))
- [ ] `DEMO_PREMIUM=false` on Vercel Production
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set on Vercel
- [ ] Gate-on verify:
  ```bash
  LAUNCH_STRICT=true \
  SMOKE_BASE_URL=https://www.missionwinning.com \
  SMOKE_ACCESS_SECRET=… \
  npm run launch-verify
  ```

## Flip

1. Vercel → Production env: `PRIVATE_MODE=false`
2. Redeploy (or wait for GitHub deploy)
3. Public verify:
   ```bash
   SMOKE_BASE_URL=https://www.missionwinning.com \
   SMOKE_ALLOW_PUBLIC=true \
   SMOKE_EXPECT_PWA=true \
   npm run launch-verify
   ```
4. Phone: Install / Add to Home Screen → airplane mode → log one set

## Same-day distribution

Follow [SOCIAL_LAUNCH.md](SOCIAL_LAUNCH.md) Phase B order:

1. Beta testers  
2. Product Hunt  
3. Show HN  
4. Communities  
5. Shorts/Reels  
6. Waitlist email  

## Analytics (enable the week of flip)

- [ ] `NEXT_PUBLIC_POSTHOG_KEY` on Vercel ([SEO_ANALYTICS.md](SEO_ANALYTICS.md))
- [ ] Google Search Console property + sitemap `https://www.missionwinning.com/sitemap.xml`
- [ ] Funnel: pageview → `iday_started` → `iday_completed` → `first_workout_completed`

## After flip

Operate on [POST_LAUNCH_CADENCE.md](POST_LAUNCH_CADENCE.md). Do not start [TWA_MOBILE_PLAYBOOK.md](TWA_MOBILE_PLAYBOOK.md) unless A1 falsifies.
