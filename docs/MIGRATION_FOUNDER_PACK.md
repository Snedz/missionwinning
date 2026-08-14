# Migration founder pack — one sitting (pre free-beta)

**Audience:** Founder only (credentials). Agents prepare this pack; agents do not apply to prod.  
**When:** Before or while recruiting the first 10 free-logger testers.  
**Companion:** [LAUNCH_RUNBOOK.md](LAUNCH_RUNBOOK.md) §2 · ledger guard `src/lib/migrationLedger.test.ts`

> **Why this exists.** CONTEXT says ~9 migrations pending. The runbook lists them, but the order, verify commands, and “what breaks” live in one dense list. This pack is the **single paste path** for the free-beta window (no charge, no `PRIVATE_MODE` flip required for local SQL apply).

---

## 0. Before you start

1. Supabase project → **SQL Editor** (or `psql "$DATABASE_URL"` with the **service** connection string — never put it in the client).
2. Confirm you are on the **production** project that Vercel Production uses (same URL as `NEXT_PUBLIC_SUPABASE_URL`).
3. Apply **only if** earlier migrations through `20260720_referrals.sql` are already applied (runbook §2 checkbox). If you are unsure, run the discovery query in §3.

**CI alternative:** once repo secret `SUPABASE_DB_URL` is set, Actions → **apply-migration** (see `.github/workflows/apply-migration.yml`). Prefer SQL Editor if you have never used the workflow.

---

## 1. Pending set (apply in this exact order)

Files under `supabase/migrations/`. All are written to be **idempotent** (`if not exists` / safe alters).

| # | File | Without it |
|---|------|------------|
| **P1** | `20260721_beta_invites.sql` | Invite ledger / beta panel cannot record who was invited (ten-tester gate is blind) |
| **P2** | `20260721_workout_sync_v2.sql` | No `client_id` / revision / **tombstones** — multi-device and delete semantics wrong |
| **P3** | `20260721_routines_sync.sql` | Android routines sync incomplete |
| **P4** | `20260721_custom_exercises_prefs_sync.sql` | Android custom exercises / prefs sync incomplete |
| **P5** | `20260721_android_telemetry.sql` | Android weekly heartbeat nowhere to land |
| **P6** | `20260728_anonymous_push.sql` | **Anonymous return loop inert** (nullable `user_id` + `device_id` on push) |
| **P7** | `20260728_week4_exclude_tombstones.sql` | **Boss metric counts deleted workouts** — week-4 number is a lie |
| **P8** | `20260730_wind_down_nudge.sql` | Evening wind-down push columns missing (after P6) |
| **P9** | `20260731_llm_usage.sql` | LLM spend ledger missing — quotas cannot bind if LLM is ever enabled |
| **P10** | `20260801_day_review_push.sql` | Day-review push columns missing (after P6) |
| **P11** | `20260813_week_logged.sql` | Signed-in week-4 working-set rollup has nowhere to land (guests stay local; PostHog still fires) |

**Free-beta minimum for honest ops:** **P1 + P2 + P6 + P7**.  
**Full pack (recommended same sitting):** P1–P11.

**Not in this pack (already assumed applied):** base `20250629_*` through `20260720_referrals.sql` (includes initial `mw_week4_retention()`). P7 **corrects** that function for tombstones.

---

## 2. How to apply (SQL Editor)

For each file in order P1 → P10:

1. Open `supabase/migrations/<file>` in the repo.
2. Paste entire contents into SQL Editor → **Run**.
3. Confirm success (no error). Idempotent re-run should also succeed.
4. Check the box in §4 below.

---

## 3. Discovery (optional — “what is already there?”)

Run in SQL Editor (safe read):

```sql
-- Tables / columns this pack expects
select to_regclass('public.beta_invites') as beta_invites;
select to_regclass('public.llm_usage') as llm_usage;

select column_name
from information_schema.columns
where table_schema = 'public' and table_name = 'push_subscriptions'
  and column_name in ('device_id', 'last_wind_down_at', 'day_review_hour', 'last_day_review_at')
order by 1;

select column_name
from information_schema.columns
where table_schema = 'public' and table_name = 'workout_logs'
  and column_name in ('client_id', 'revision', 'deleted_at')
order by 1;

select proname from pg_proc where proname = 'mw_week4_retention';
```

Interpretation:

| Result | Meaning |
|--------|---------|
| `beta_invites` null | Apply P1 |
| `workout_logs.deleted_at` missing | Apply P2 (and then P7) |
| `device_id` missing on push_subscriptions | Apply P6 (then P8/P10) |
| `mw_week4_retention` missing | Apply `20260720_referrals.sql` first (outside this pack) |
| Function exists but proof fails | Apply P7, re-run proof |

---

## 4. Founder checklist

- [ ] P1 `20260721_beta_invites.sql`
- [ ] P2 `20260721_workout_sync_v2.sql`
- [ ] P3 `20260721_routines_sync.sql`
- [ ] P4 `20260721_custom_exercises_prefs_sync.sql`
- [ ] P5 `20260721_android_telemetry.sql`
- [ ] P6 `20260728_anonymous_push.sql`
- [ ] P7 `20260728_week4_exclude_tombstones.sql`
- [ ] P8 `20260730_wind_down_nudge.sql`
- [ ] P9 `20260731_llm_usage.sql`
- [ ] P10 `20260801_day_review_push.sql`
- [ ] P11 `20260813_week_logged.sql`
- [ ] **Proof (required after P7):**

```bash
# From a machine with DATABASE_URL (Supabase → Database → URI)
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/checks/week4_retention_proof.sql
# Expect: week4 proof OK
```

- [ ] Update [CONTEXT.md](../CONTEXT.md) Status migrations line if agents cannot (founder note to agent: “pack applied”) so the pending count stops lying

---

## 5. After apply — free beta still works without push

| Feature | Needs |
|---------|--------|
| Free logger / Coach rules | **No** cloud migration |
| Invite **email** | `MAIL_POSTAL_ADDRESS` + Resend (separate from this pack) |
| Invite **ledger** / panel counts | **P1** |
| Week-4 readable & honest | Referrals RPC + **P7** + proof |
| Anonymous push return loop | **P6** + VAPID keys (env; still dark until set) |
| Android cloud sync | **P2–P5** |

Testers can use the free logger **today** with zero of these applied. Apply the pack so **panel, retention, and return loop** are not fake when you care about numbers.

---

## 6. Agent / CI notes

- Disk coverage is enforced by `src/lib/migrationLedger.test.ts` against LAUNCH_RUNBOOK filenames.
- Do not invent new migrations in a launch week without a runbook row + ledger green.
- Agents never set `PRIVATE_MODE` or claim migrations applied without founder confirmation.

Changelog: `2026-08-09 — created for agent craft window (pre-EIN free beta).`
