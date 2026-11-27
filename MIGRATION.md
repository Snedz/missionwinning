# Using v2 alongside Mission Winning

This build does not replace the production app, change its data, or redirect installed clients. Use a separate origin for evaluation. In the existing app, download a Mission Winning backup, then open **You → Import backup** in v2. Check History, an in-progress workout, and units before relying on the new copy. Export from v2 to take the data back. Keep the original file until you've verified both copies.

The portable envelope is unchanged: `{ app: "mission-winning", version: 1, exportedAt, workoutStore, localKeys }`. The restore routine merges workout IDs and revisions and retains populated device keys on conflict. Older feature data under `mw_*` can round-trip even when no v2 screen reads it. An existing destination session takes precedence over an imported one. Use a fresh destination to restore the source session.

## Supabase and Compose Android

No schema migration is required for the core adapter. `mapCloudToLocal` in `packages/core/src/lib/workout/workoutMerge.ts` accepts existing `workout_logs` fields (`id`, `client_id`, `revision`, `updated_at`, `deleted_at`, `workout_name`, `started_at`, `completed_at`, `duration_seconds`, `exercises`, and `total_volume`). It normalizes both web nested exercise sets and Android flat sets. `mergeWorkoutHistories` reconciles logical client IDs and revisions; `flattenExercises` is the reverse boundary used by the current Android API. The compatibility fixtures are synthetic examples shaped from the original contracts, not customer data. V2 does not yet fetch cloud rows or accept a raw rows file through You.

Keep deployed Compose clients on the current service:

| Contract | Maintain at the existing backend |
|---|---|
| `/api/mobile/coach/plan`, `/api/mobile/coach/adapt` | Existing JSON plan/adapt DTOs and access behavior (guest when public; cookie or Bearer for private); shared seed for offline starts |
| `/api/mobile/sync/workouts` | Supabase Bearer auth, push/pull, native flat sets; preserve client IDs, revisions, tombstones, and idempotency |
| `/api/mobile/sync/routines`, `/api/mobile/sync/customs`, `/api/mobile/sync/prefs` | Supabase Bearer auth and existing DTOs |
| Premium, purchase and telemetry routes | Remain on the existing app; v2 does not handle these requests |

Before a rollout, run a read-only authenticated pilot against the existing contracts, compare web/Android history, and test revision conflicts and deletions on staging. Only then add authenticated transport that drains the durable outbox. Keep the old service as rollback until both clients are verified.

## Deliberately left out

Live accounts, cloud sync, Android binaries or API replacement, analytics, payments, wearables, Fuel, Move, Mind, Track, Learn, leaderboards, social, and marketing pages. Existing app data and routes remain in the existing product; they are not deleted by this prototype.
