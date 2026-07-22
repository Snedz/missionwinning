# Backup & Restore

**Layer:** 13 — Availability and recovery  
**Companion:** [PRODUCTION_STACK.md](PRODUCTION_STACK.md) · Profile → Backup card · [src/lib/backup.ts](../src/lib/backup.ts)

Honest targets for a managed PaaS stack (Vercel + Supabase). This is not enterprise DR — it is the minimum playbook before public launch.

---

## RPO / RTO (stated)

| Scope | RPO (how much data you can lose) | RTO (how long to recover) |
|-------|----------------------------------|---------------------------|
| **Signed-in cloud data** (workouts synced, enrollments, profiles) | Supabase platform backup window (typically ≤ 24h on free/pro plans; PITR if enabled on paid) | Founder restores project/backup + redeploy verify: **~1–4 hours** |
| **Anonymous / local-only** (`mw_*` + zustand persist) | Last successful **Profile export** — or device loss = data loss | User re-imports JSON on a device: **minutes** |
| **App binary / config** | Git `master` + Vercel Production env | Redeploy from `master`: **~15–30 minutes** |

There is **no** automatic server recovery for users who never sign in and never export. That is by design for the free offline core — tell them to export or sign in.

---

## User path — Profile backup (client)

**Who:** Any user (especially without an account).  
**Where:** Profile → Backup / export card (`ProfileBackupCard`).

### Export

1. Open **Profile**.
2. Use **Export backup** (downloads JSON: `app: mission-winning`, workout store + all `mw_*` keys).
3. Store the file somewhere durable (cloud drive / password manager attachment).

### Import / merge

1. Open **Profile** on the target device.
2. **Import backup** and choose the JSON file.
3. Confirm merge: histories merge; saved workouts add by id; `mw_*` keys restore (see `mergeBackup` in `backup.ts`).
4. Reload the app if Today / Train look stale.

### Smoke (agent or founder — once per release train)

1. Log a throwaway workout (or use existing history).
2. Export → note file size / `exportedAt`.
3. Clear site data **or** use a second browser profile.
4. Import → confirm history / prefs return.
5. Optional: sign in and confirm cloud sync still works after import.

---

## Operator path — Supabase (founder)

**Who:** Founder only.  
**When:** Accidental data wipe, bad migration, or regional platform incident.

### Before you need it

1. Supabase Dashboard → **Project Settings → Database** — note plan and whether **Point-in-Time Recovery (PITR)** is enabled.
2. Confirm Production env has `SUPABASE_SERVICE_ROLE_KEY` only on the server ([ENV.md](ENV.md)).
3. Keep a recent SQL dump or rely on platform backups (document the last manual dump date in your private ops notes — not in git).

### Restore drill (dry-run annually or before public flip)

1. Identify blast radius: auth users vs `workout_logs` / `nutrition_logs` / `enrollments`.
2. Prefer **PITR restore to a new project** (or branch) over in-place overwrite when unsure.
3. Point a **Preview** deploy at the restored project (temporary Supabase URL/keys) and run:
   ```bash
   SMOKE_BASE_URL=https://…-preview.vercel.app \
   SMOKE_ACCESS_SECRET=… \
   npm run launch-verify
   ```
4. Only after verify: cut Production env to the restored project **or** accept in-place restore per Supabase docs for your plan.
5. Redeploy Production; confirm login + one workout sync + premium status.

### After restore

- [ ] `npm run gate-smoke` against Production URL  
- [ ] Stripe webhook still points at Production  
- [ ] Notify beta users if sessions were invalidated  

---

## What this does **not** cover

- Multi-region active-active failover (Layer 11 — deferred).  
- SIEM / log replay for forensics (Layer 12 SIEM — deferred).  
- Restoring third-party SaaS (Resend, PostHog, Sentry) — recreate from vendor dashboards.

---

## Related code

| Path | Role |
|------|------|
| `src/lib/backup.ts` | Export / import / merge |
| `src/components/profile/ProfileBackupCard.tsx` | UI |
| `src/lib/workout/workoutMerge.ts` | History merge rules |
| `supabase/migrations/` | Schema + RLS source of truth |
