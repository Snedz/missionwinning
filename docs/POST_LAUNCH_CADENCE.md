# Post-launch operating cadence

**Wall metric (year one):** week-4 retained weekly loggers — users who log ≥1 workout in week 4 after first workout. Everything else is vanity until this holds. ([STRATEGY.md](../STRATEGY.md))

## How to measure week-4 retention

### From founder beta panel

Profile (while `BETA_ADMIN_EMAILS` matches) → funnel counts. Good for activation; retention needs history.

### From Supabase (signed-in loggers)

Approximate: users whose first `workout_logs` row is ≥28 days ago and who have ≥1 log in days 22–28 after that first workout.

```sql
-- Week-4 retained weekly loggers (signed-in cloud logs)
with first_workout as (
  select user_id, min(completed_at) as first_at
  from workout_logs
  group by user_id
),
week4 as (
  select f.user_id
  from first_workout f
  join workout_logs w on w.user_id = f.user_id
  where f.first_at < now() - interval '28 days'
    and w.completed_at >= f.first_at + interval '21 days'
    and w.completed_at < f.first_at + interval '28 days'
  group by f.user_id
)
select
  (select count(*) from first_workout where first_at < now() - interval '28 days') as cohort_eligible,
  (select count(*) from week4) as week4_retained;
```

Target: **≥10%** of eligible cohort across two cohorts. If below: stop acquisition, 10 interviews ([REDTEAM.md](../REDTEAM.md) A4).

### From PostHog

Weekly retention on `workout_completed` / `first_workout_completed` — see [SEO_ANALYTICS.md](SEO_ANALYTICS.md).

Local-only users (no account) won’t appear in Supabase — interview them manually from beta DMs.

---

## Weekly (1 hour)

1. Check founder beta panel + Supabase profiles vs gates / retention query above
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
