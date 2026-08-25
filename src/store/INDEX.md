# src/store/

> Zustand client state — active workout session and persisted workout data.

## Files

| File | Purpose |
|------|---------|
| `workoutStore.ts` | Single store: saved workouts, history, active session, rest timer |
| `sessionResume.store.test.ts` | This-device leave/return + Finish-partial through the store (`.963`) |
| `setRpe10.test.ts` | Optional 1–10 RPE persist / complete / empty (`.967`) |
| `setLoadPct.test.ts` | Optional % of known 1RM persist / complete / empty (`.981`) |
| `sessionNote.store.test.ts` | Live jot → completed log; receipt edit / clear stays local (`.982` / stamp `.983`) |
| `workoutStore.test.ts` | Insert / remove free warmup batch from working weight (`.984` / stamp `.985`). This-session note does not prefill from History (`.996`). |

## State slices (`workoutStore`)

| Slice | Persistence | Notes |
|-------|-------------|-------|
| `savedWorkouts` | zustand persist | Their notebook — Start honors it (`.960`) |
| `workoutHistory` | zustand persist | Completed logs — merges with cloud |
| `activeWorkout` | memory + persist | In-progress session — `clientId` / `revision` ride for desk → gym (`.958`) |
| `pendingRemoteOpenSession` | memory | Other-device session waiting on confirm — never silent-wipe |
| `restTimer*` | memory | Rest countdown between sets. `restLane` is warmup vs work (`.995`). |
| `workClock*` | memory | Optional EMOM / AMRAP on the live set row (`.987`). Not rest. |
| `elapsedSeconds` | memory | Workout clock |
| `hasHydrated` | memory | True once rehydration settles — gates Active Start. Owned by the reconciliation block *after* `create()`, never inside `onRehydrateStorage` (zustand runs that synchronously during `create()`, so touching the store there throws a swallowed TDZ error and the logger stays disabled). |

## Key actions

| Action | Effect |
|--------|--------|
| `addSavedWorkout` / `replaceSavedWorkout` | Append a new named routine, or replace one in place after confirm (`.960`) |
| `startWorkout` / `startEmptyWorkout` | Begin active session. Refuse to replace a live session (`.963`) |
| `logSet` / `logSetAndAdvance` | Record set; group advance; working-set week-4 events (`week4Logger`) |
| `rateSetRpe10` | Optional 1–10 RPE on a logged set (`.967`). Empty is valid. Never required to log |
| `completeActiveWorkout` | Finish-partial through `finishPartialFromActive` (`.963`); mint `clientId`, attach session note when present (`.982`), push to history, enqueue the cloud write on the outbox, analytics, leaderboard push |
| `setHistorySessionNote` | Receipt add / edit of a finished session note. Local only. Empty clears (`.982`) |
| `loadFromCloud` | Merge Supabase history with local |
| `syncCurrentHistoryToCloud` | Re-queue local logs — called from `useJourneySync` on `SIGNED_IN` (`.949`). Also enqueues the open session (`.958`) |
| `restoreActiveWorkout` | Adopt a remote open session without minting a second `clientId` (`.958`) |
| `ensureOpenSessionIdentity` | Stamp `clientId` once on a pre-`.958` persist |
| `cancelActiveWorkout` | Discard in-progress. Tombstones the open session so the other surface does not reopen it |
| `skipExerciseInActive` | Skip this exercise once, this session (`.959`). Keeps logged sets. Does not rewrite the plan |
| `insertWarmupRampOnExercise` / `removePlannedSetAt` | Free warmup batch from the working weight; athlete can delete any incomplete warmup (`.984` / stamp `.985`) |

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
- `setKind.ts`, `superset.ts`, `warmupRamp.ts` — set semantics + free warmup batch

## Related

- [../hooks/INDEX.md](../hooks/INDEX.md)
- [../lib/INDEX.md](../lib/INDEX.md)
