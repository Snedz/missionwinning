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

## Contract

| Guarantee | How |
|-----------|-----|
| Survives the tab closing | Queue lives in device storage, not memory |
| A retry cannot duplicate | Ops key on `clientId`; the DB has a unique index on `(user_id, client_id)` |
| Superseded work collapses | Re-enqueuing a `dedupeKey` replaces the pending op (and mints a new op id, so an in-flight flush cannot ack it away) |
| Nothing is dropped for failing | After `MAX_ATTEMPTS` an op goes `stuck` and waits for `retryStuck()` |
| Edits and deletes propagate | Highest `revision` wins; `deletedAt` is a tombstone, not a removal |

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
