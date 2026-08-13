# src/store/

> Zustand client state — active workout session and persisted workout data.

## Files

| File | Purpose |
|------|---------|
| `workoutStore.ts` | Single store: saved workouts, history, active session, rest timer |

## State slices (`workoutStore`)

| Slice | Persistence | Notes |
|-------|-------------|-------|
| `savedWorkouts` | zustand persist | Builder templates |
| `workoutHistory` | zustand persist | Completed logs — merges with cloud |
| `activeWorkout` | memory + persist | In-progress session |
| `restTimer*` | memory | Rest countdown between sets; `restExerciseId` keys last-rest writes (`.715`) |
| `elapsedSeconds` | memory | Workout clock |
| `hasHydrated` | memory | True once rehydration settles — gates Active Start. Owned by the reconciliation block *after* `create()`, never inside `onRehydrateStorage` (zustand runs that synchronously during `create()`, so touching the store there throws a swallowed TDZ error and the logger stays disabled). |

## Key actions

| Action | Effect |
|--------|--------|
| `startWorkout` / `startEmptyWorkout` | Begin active session; `startWorkout` seeds per-exercise notes from history (`.748`) |
| `setExerciseNote` | Write / clear the one-line diary on an active exercise |
| `logSet` / `logSetAndAdvance` | Record set; pair advance (A then B) |
| `toggleSupersetWithNext` / `unlinkSuperset` | Pair exactly two consecutive; unlink clears both peers (`.749`) |
| `completeActiveWorkout` | Mint `clientId`, push to history, enqueue the cloud write on the outbox, analytics, leaderboard push |
| `loadFromCloud` | Merge Supabase history with local |
| `cancelActiveWorkout` | Discard in-progress |

## Who reads / writes

| Consumer | Usage |
|----------|-------|
| `ActiveWorkoutPage` | Primary UI for active session |
| `BuilderPage` | `addSavedWorkout`, templates |
| `HistoryPage` | `workoutHistory`, charts via lib |
| `HomePage` | Recent history summary |
| `workoutStore` → `lib/sync/outbox.ts` | Durable cloud write on complete |

## Persistence version

`persist` is at `version: 1`. The v0→v1 migration backfills `clientId` / `revision`
on pre-sync-v2 logs so they can reach the cloud without duplicating.

## Related lib

- `workoutMerge.ts` — cloud/local merge, keyed on `clientId`
- `lib/sync/outbox.ts` — durable queue for the cloud write
- `lib/storage/safeStorage.ts` — guarded device storage
- `leaderboardSync.ts` — post-workout push
- `setKind.ts`, `superset.ts` — set semantics

## Related

- [../hooks/INDEX.md](../hooks/INDEX.md)
- [../lib/INDEX.md](../lib/INDEX.md)
