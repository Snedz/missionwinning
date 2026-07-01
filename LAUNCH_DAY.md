# Launch Day — Mission Winning

**When:** After beta gates pass (see [PRE_LAUNCH_PLAN.md](PRE_LAUNCH_PLAN.md)).  
**Build reference:** Profile footer label · run `npm run phase-h-readiness` before merge.

---

## Pre-flight (same day, before flipping public)

1. **Beta metrics** — Profile founder panel: I-Day ≥80%, Basic Training ≥60%, 10+ users
2. **Tests + static checks**
   ```bash
   npm run phase-h-readiness
   npm run predeploy
   ```
3. **Supabase** — All migrations in [PRE_LAUNCH_PLAN.md](PRE_LAUNCH_PLAN.md) applied
4. **Secrets** — [ENV.md](ENV.md): rotate `PRIVATE_ACCESS_SECRET`, confirm `DEMO_PREMIUM=false`

---

## Vercel env (production)

| Variable | Launch value |
|----------|----------------|
| `PRIVATE_MODE` | **`false`** (only after gates) |
| `DEMO_PREMIUM` | **`false`** |
| `PRIVATE_ACCESS_SECRET` | Rotated strong secret (still used for optional `/fitness-test?access=` if needed) |
| `NEXT_PUBLIC_SUPABASE_URL` | Set |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Set |
| `SUPABASE_SERVICE_ROLE_KEY` | Set |
| `BETA_ADMIN_EMAILS` | Founder emails |
| `RESEND_API_KEY` | If youth consent email in prod |
| `YOUTH_CONSENT_SECRET` | Set |

Sync from GitHub: **Actions → Sync Vercel env** (or `npm run sync-vercel-env` locally with tokens).

---

## Deploy sequence

1. Merge `master` with latest build label (Phase J complete)
2. Vercel production deploy completes
3. **Gate smoke (gated or public):**
   ```bash
   SMOKE_BASE_URL=https://www.missionwinning.com npm run gate-smoke
   # After public:
   SMOKE_BASE_URL=https://www.missionwinning.com SMOKE_ALLOW_PUBLIC=true npm run gate-smoke
   ```
4. Set `PRIVATE_MODE=false` → **redeploy** (PWA enables on next build per `next.config.js`)
5. Verify:
   - `/` loads Today/marketing (no redirect to `/private`)
   - PWA install prompt / Add to Home Screen
   - `/welcome` → workout → Profile sync
   - Offline banner when airplane mode
   - `/assessments` Pathfinder flow
   - `/builder` offline plans section

---

## Rollback

Set `PRIVATE_MODE=true` in Vercel → redeploy. PWA precache disables automatically.

---

## Post-launch (Phase I)

- Live Stripe Super Bundle
- Premium AI Coach (cloud LLM)
- i18n body copy Tier 1

See [PLAN.md](PLAN.md) Phase I.
