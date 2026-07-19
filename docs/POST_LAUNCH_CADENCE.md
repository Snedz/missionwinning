# Post-launch operating cadence

**Wall metric (year one):** week-4 retained weekly loggers — users who log ≥1 workout in week 4 after first workout. Everything else is vanity until this holds. ([STRATEGY.md](../STRATEGY.md))

## How to measure week-4 retention

### From founder beta panel

Profile (while `BETA_ADMIN_EMAILS` matches) → funnel counts. Good for activation; retention needs history.

### From Supabase (signed-in loggers)

Approximate: users whose first `workout_logs` row is ≥28 days ago and who have ≥1 log in days 22–28 after that first workout.

Shipped as RPC **`mw_week4_retention()`** (migration `20260720_referrals.sql`, service role). Manual equivalent:

```sql
select * from mw_week4_retention();
-- or the expanded CTE in git history if RPC not applied yet
```

Target: **≥10%** of eligible cohort across two cohorts. If below: stop acquisition, 10 interviews ([REDTEAM.md](../REDTEAM.md) A4).

**Automated:** Monday cron `GET /api/cron/weekly-digest` emails funnel + retention + referral stats to `FOUNDER_DIGEST_EMAIL` (dryRun supported).

### From PostHog

Weekly retention on `workout_completed` / `first_workout_completed` — see [SEO_ANALYTICS.md](SEO_ANALYTICS.md).

Local-only users (no account) won’t appear in Supabase — interview them manually from beta DMs.

---

## Weekly (1 hour)

1. **Automated:** weekly founder digest (cron) + skim founder beta panel — retention is in the email via `mw_week4_retention`
2. Talk to 2 users (or read 2 feedback emails)
3. Fix the #1 confusion within 48h — ship, tell the tester
4. ≤1 social post if public ([SOCIAL_LAUNCH.md](SOCIAL_LAUNCH.md) Phase C)

## Before every deploy

```bash
npm test
SMOKE_BASE_URL=https://www.missionwinning.com SMOKE_ACCESS_SECRET=… npm run gate-smoke
# After public:
SMOKE_ALLOW_PUBLIC=true SMOKE_EXPECT_PWA=true npm run launch-verify
```

## Monthly

- Re-read [REDTEAM.md](../REDTEAM.md) §1 against falsifying evidence
- Stripe → `enrollments` reconciliation
- `npm audit`

## Hard rules

- **Do not** flip or re-enable feature waves while week-4 retention fails its evidence check
- **Do not** add pillars, native apps, America track, or mass i18n until retention holds
- If A1 falsified (users demand app store): [TWA_MOBILE_PLAYBOOK.md](TWA_MOBILE_PLAYBOOK.md) before native
- If A4 falsified (&lt;10% week-4): stop acquisition, 10 interviews, fix the loop (likely Coach / Today)
- **No paid social ads** until week-4 holds

Companion: [LAUNCH_RUNBOOK.md](../LAUNCH_RUNBOOK.md) §6 · [TRACK_D_GO_LIVE.md](TRACK_D_GO_LIVE.md) · [SOCIAL_LAUNCH.md](SOCIAL_LAUNCH.md)
