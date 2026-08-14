# src/lib/sync/

> One concern: getting local writes to the cloud exactly once, eventually.

## Why this exists

The logger never blocks on the network, which used to mean cloud writes were
fire-and-forget: one `setTimeout` retry that died with the tab, and a
`saveWorkoutLog` that did a blind `insert` with no client identity — so every retry
could create a duplicate row, which then came back through `loadFromCloud`.

Android already had sync v2 (`client_id`, `revision`, tombstones — see
`supabase/migrations/20260721_workout_sync_v2.sql`). This is the web catching up.

## Files

| File | Purpose |
|------|---------|
| `outbox.ts` | Durable queue: persist → retry with backoff → ack. No handler imports. |
| `workoutSync.ts` | The `workout.upsert` handler; read-by-`client_id` then update/insert |

## Kinds and their handlers

Every declared `OutboxKind` must have a registered handler, or its ops queue forever
while the type claims support. Registration happens in `src/hooks/useOutboxDrain.ts`.

| Kind | Handler | dedupeKey | Notes |
|------|---------|-----------|-------|
| `workout.upsert` | `sync/workoutSync.ts` | `clientId` | Per-entity — sessions must not collapse |
| `coach.plan` | `lib/coachSync.ts` | one per kind | Latest-state; handler re-reads storage |
| `journey.state` | `lib/journeySync.ts` | one per kind | Latest-state; handler re-reads storage |
| `leaderboard.push` | `lib/leaderboardSync.ts` | one per kind | Snapshot computed at enqueue — queuing a whole history would bloat storage. **Not enqueued at all while the `leaderboard` surface is parked** |
| `pft.push` | `lib/pftSync.ts` | `session.completedAt` | Per-entity. Inactive while the `america` surface is parked |
| `week.logged` | `lib/week4LoggerSync.ts` | `week:${isoWeek}` | Signed-in ISO-week logger rollup. **Guests never enqueue.** |

**Not on the outbox:** `fuelCoach/fuelSync.ts`. Its `pushFuelPlanToCloud` writes a
per-user key in *device storage*, not a network — there is no transient failure to
retry. Move it here when a real endpoint exists.

**This table described intent, not behaviour, until `.166`.** The `leaderboard.push`
row above claimed the snapshot was computed at enqueue "because queuing a whole
history would bloat storage" — and `scheduleLeaderboardPush` enqueued
`{ workoutHistory, savedCount }`, doing exactly that, on every completed workout, for
a surface that 404s. A doc that states a guarantee is not a guarantee; the assertions
now live in `src/lib/surfaceReality.test.ts`.

**Signed out is not a failure.** Handlers return `true` when there is no user or no
Supabase configured: local storage is the source of truth and the op is re-queued on
sign-in. Returning `false` there would spin the backoff against a condition that
retrying cannot fix.

## Contract

| Guarantee | How |
|-----------|-----|
| Survives the tab closing | Queue lives in device storage, not memory |
| A retry cannot duplicate | Ops key on `clientId`; the DB has a unique index on `(user_id, client_id)` |
| Superseded work collapses | Re-enqueuing a `dedupeKey` replaces the pending op (and mints a new op id, so an in-flight flush cannot ack it away) |
| Nothing is dropped for failing | After `MAX_ATTEMPTS` an op goes `stuck` and waits for `retryStuck()` |
| Edits and deletes propagate | Highest `revision` wins; `deletedAt` is a tombstone, not a removal |

## Reading the queue for display

`getState()` answers *how many* (`{ pending, stuck, oldestCreatedAt }`) and
`subscribe()` pushes it on change — that is what `OnlineStatusBanner` shows.
`listPending()` answers *which*, oldest first, for the offline screen's
waiting-to-sync rows.

**Both are the only readers.** Nothing else may re-parse `STORAGE_KEYS.outbox`:
a second parser is a second source of truth for the same number. `listPending()`
returns kind, time and stuck — deliberately **not** payloads, because nothing
that displays a queue needs to see inside the envelope.

The offline route reads this directly. It is an ordinary same-origin page, not a
service-worker context, so no bridge is needed — a comment in
`app/offline/OfflineContent.tsx` claimed otherwise ("needs an outbox read from
the service-worker fallback context") and deferred the feature on that basis
until `.156`.

Read-then-write rather than `ON CONFLICT`: the unique index is partial
(`where client_id is not null`), which Postgres cannot infer from a column-only
conflict target.

## Drain triggers

`src/hooks/useOutboxDrain.ts`, mounted via `JourneySyncInner` (idle-deferred):
mount · `online` · tab becomes visible · a timer armed off `msUntilNextAttempt()`.

## Adding a kind

1. Add to `OutboxKind` in `outbox.ts`.
2. Write a handler returning `Promise<boolean>` (true = landed).
3. `registerHandler` from a client entry point — never at module scope in a
   server-reachable file.
4. Choose the `dedupeKey` deliberately: one key per kind for latest-state pushes,
   one key per entity for per-record writes.

## Related

- [../storage/INDEX.md](../storage/INDEX.md)
- [../../store/INDEX.md](../../store/INDEX.md)
- `app/api/mobile/sync/workouts/route.ts` — the protocol this mirrors
