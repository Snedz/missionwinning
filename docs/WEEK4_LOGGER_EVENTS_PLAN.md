# PLAN — Week-4 retained logger events (`.740`)

**Status:** FROZEN 2026-08-13. Implement against this file; do not expand scope.
**Excellence-Override:** week-4 retention events.
**Do not:** flip `PRIVATE_MODE`, invent traction, add a public live-user count, apply the migration, commit secrets or EIN.

---

## Why

The year-one boss metric is **week-4 retained weekly loggers**. Today we can count
completed *workouts* (PostHog `workout_completed` + RPC `mw_week4_retention()`),
but not the actual habit: a **working set saved**. Warmups, empty sessions, and
vanity counters must not inflate it. Guests stay local-only.

## Metric (one definition)

An install is **week-4 retained** when:

1. It has saved ≥1 **working set** (kind ≠ `warmup`) in some local ISO week W₀.
2. The current local ISO week Wₙ satisfies `isoWeekOffset(W₀, Wₙ) ≥ 3` (1-indexed week ≥ 4).
3. It has saved ≥1 working set in Wₙ.

Weeks 2–3 may be empty. This is return-in-week-4, not a four-week streak.

### Not counted

- Warm-up sets (`kind === 'warmup'`, UI label **W**)
- Empty sessions (finish with no working set saved)
- Planned / incomplete sets
- Emails, EIN, PII, user counts, marketing copy

`failure` and `drop` **are** working sets.

## Ship

| # | What | Where |
|---|------|--------|
| 1 | Client event `set_logged` `{ source: guest\|account, exercise_id, has_load }` | PostHog via `track()` after a working set is saved in `logSet` |
| 2 | Client event `week_logged` the first time a working set is saved in the current local ISO week | Same path; de-dupe in `mw_week4_retention` |
| 3 | Derived `retained_week_4` for **this install only** | Pure compute from local first-week + this-week log |
| 4 | Surface the flag on `/account` **Under the Hood** | This-device diagnostic — not a vanity counter |
| 5 | Document in `docs/METRICS.md` | Definition, exclusions, honesty |
| 6 | Optional signed-in sink | Migration `week_logged` (user_id + iso_week). **Do not apply.** CoS applies via MCP. Guests never write. |

## Design decisions (frozen)

1. **ISO week, local timezone** — add `localIsoWeekKey` / `isoWeekOffset` to `src/lib/time/localDate.ts` (local fields, never `toISOString()`). Format `YYYY-Www`.
2. **Working set = not warmup** — one predicate; `logSet` reads the set's existing `kind`.
3. **`logSet` stays sync** — no `await`, `fetch`, `getUser`, or outbox flush (F-001 / `.696`–`.697` guards). Recorder is fire-and-forget.
4. **Source** — `guest` \| `account` from a cached auth-presence flag (updated by `useJourneySync`). Default `guest`. Do not invent account status.
5. **PostHog** — both sources, only if analytics allowed (existing `track()`). No PII properties.
6. **Supabase** — signed-in `week_logged` only (one row per user per ISO week). High-volume `set_logged` stays PostHog. Cloud write rides the durable outbox (`week.logged`). Guest path never enqueues and never fetches.
7. **Under the Hood** — `/account` More settings. Shows this install's first week, this week, logged-this-week, `retained_week_4`. Copy states it is this device only and we do not invent traction. No public count.
8. **Reuse** `STORAGE_KEYS.week4Retention` (`mw_week4_retention`) for the local rollup JSON.

## Files (expected)

- `src/lib/time/localDate.ts` + test — ISO week
- `src/lib/authPresence.ts` — guest/account cache
- `src/lib/week4Logger.ts` + test — decide / persist / record
- `src/lib/week4LoggerSync.ts` + test — outbox enqueue + handler
- `src/lib/analytics.ts` — new event names
- `src/store/workoutStore.ts` — call recorder from `logSet`
- `src/hooks/useJourneySync.ts` — set auth presence
- `src/hooks/useOutboxDrain.ts` — register handler
- `app/api/metrics/week-logged/route.ts` — session + service-role upsert
- `src/lib/apiSchemas.ts` — Zod
- `supabase/migrations/20260813_week_logged.sql` — table + RLS off (API writes)
- `src/lib/accountDataRegistry.ts` — export story
- `src/components/profile/UnderTheHoodCard.tsx`
- `src/page-components/AccountPage.tsx`
- `src/i18n/athleteLocales.ts`
- `docs/METRICS.md` + indexes + runbook ledger
- Ship protocol: `buildInfo.ts` `.740`, `LOG.md`, `CONTEXT.md` `## Now`

## Tests (must exist)

- Warmup does **not** fire `set_logged` (or `week_logged`)
- Guest path does **not** enqueue / fetch / write the server
- `week_logged` only on the first working set of an ISO week
- `retained_week_4` false in weeks 1–3; true in week ≥4 with a log this week
- `logSet` body still has no `await` / `fetch` / `getUser` (existing guard)

## Out of scope

- Marketing numbers, landing counters, inventing cohort %
- Applying the migration
- Changing `mw_week4_retention()` (completed-workout RPC stays; this is the set-level instrument)
- Android native events (web PWA only this ship)
- Flipping analytics default on
