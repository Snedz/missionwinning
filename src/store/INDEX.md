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
| `restTimer*` | memory | Rest countdown between sets |
| `elapsedSeconds` | memory | Workout clock |
| `hasHydrated` | memory | True after persist rehydrate — gate Active Start |

## Key actions

| Action | Effect |
|--------|--------|
| `startWorkout` / `startEmptyWorkout` | Begin active session |
| `logSet` / `logSetAndAdvance` | Record set; superset advance |
| `completeActiveWorkout` | Push to history, cloud sync, analytics, leaderboard push |
| `loadFromCloud` | Merge Supabase history with local |
| `cancelActiveWorkout` | Discard in-progress |

## Who reads / writes

| Consumer | Usage |
|----------|-------|
| `ActiveWorkoutPage` | Primary UI for active session |
| `BuilderPage` | `addSavedWorkout`, templates |
| `HistoryPage` | `workoutHistory`, charts via lib |
| `HomePage` | Recent history summary |
| `workoutStore` → `supabase.ts` | Cloud sync on complete |

## Related lib

- `workoutMerge.ts` — cloud/local merge
- `leaderboardSync.ts` — post-workout push
- `setKind.ts`, `superset.ts` — set semantics

## Related

- [../hooks/INDEX.md](../hooks/INDEX.md)
- [../lib/INDEX.md](../lib/INDEX.md)
