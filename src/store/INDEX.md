# src/store/

> Zustand client state — active workout session and persisted workout data.

## Files

| File | Purpose |
|------|---------|
| `workoutStore.ts` | Single store: saved workouts, history, active session, rest timer |
| `sessionResume.store.test.ts` | This-device leave/return + Finish-partial through the store (`.963`) |
| `sessionClock.store.test.ts` | Pause / resume session elapsed; finish duration; rest / EMOM stay (`.1001`) |
| `setRpe10.test.ts` | Optional 1–10 RPE persist / complete / empty (`.967`) |
| `setLoadPct.test.ts` | Optional % of known 1RM persist / complete / empty (`.981`) |
| `sessionNote.store.test.ts` | Live jot → completed log; receipt edit / clear stays local (`.982` / stamp `.983`) |
| `workoutStore.test.ts` | Insert / remove free warmup batch from working weight (`.984` / stamp `.985`). This-session note does not prefill from History (`.996`). History Save replaces the diary and leaves the live set (`.997`). Backfill prepends a new log and leaves the live set (`.1000`). Merge remaps history onto the keeper (`.1002`). Delete tombs one finished log and leaves the live set (`.1003`). Restore clears that tombstone (`.1006`). Name writes a private title (`.1007`). Import merge/upserts the diary file they saved (`.1013`). Move re-dates a finished log and leaves the live set (`.1027`). |

## State slices (`workoutStore`)

| Slice | Persistence | Notes |
|-------|-------------|-------|
| `savedWorkouts` | zustand persist | Their notebook — Start honors it (`.960`) |
| `workoutHistory` | zustand persist | Completed logs — merges with cloud |
| `activeWorkout` | memory + persist | In-progress session — `clientId` / `revision` ride for desk → gym (`.958`) |
| `pendingRemoteOpenSession` | memory | Other-device session waiting on confirm — never silent-wipe |
| `restTimer*` | memory | Rest countdown between sets. `restLane` is warmup vs work (`.995`). |
| `workClock*` | memory | Optional EMOM / AMRAP on the live set row (`.987`). Not rest. |
| `elapsedSeconds` | memory | Workout clock — derived from `sessionClock` (`.1001`) |
| `hasHydrated` | memory | True once rehydration settles — gates Active Start. Owned by the reconciliation block *after* `create()`, never inside `onRehydrateStorage` (zustand runs that synchronously during `create()`, so touching the store there throws a swallowed TDZ error and the logger stays disabled). |

## Key actions

| Action | Effect |
|--------|--------|
| `addSavedWorkout` / `replaceSavedWorkout` | Append a new named routine, or replace one in place after confirm (`.960`) |
| `startWorkout` / `startEmptyWorkout` | Begin active session. Refuse to replace a live session (`.963`) |
| `toggleSessionClock` | Pause / resume SESSION elapsed (`.1001`). Not rest. Not EMOM. Not Today Resume |
| `logSet` / `logSetAndAdvance` | Record set; group advance; working-set week-4 events (`week4Logger`) |
| `rateSetRpe10` | Optional 1–10 RPE on a logged set (`.967`). Empty is valid. Never required to log |
| `completeActiveWorkout` | Finish-partial through `finishPartialFromActive` (`.963`); mint `clientId`, attach session note when present (`.982`), push to history, enqueue the cloud write on the outbox, analytics, leaderboard push |
| `setHistorySessionNote` | Receipt add / edit of a finished session note. Local only. Empty clears (`.982`) |
| `saveEditedHistoryLog` | History Save of a finished session they own. Same id. Confirm lives in the helper. Never wipes. Leaves the live set (`.997`) |
| `saveBackfillLog` | History Save of a past session they typed. New id. Never overwrites. Leaves the live set (`.1000`) |
| `applyMergedExercises` | Confirm-gated merge of two exercise ids. Source identity gone. Sets travel (`.1002`) |
| `deleteFinishedHistoryLog` | History delete of one finished session. Confirm lives in the helper. Never wipes the account. Leaves the live set (`.1003`) |
| `moveFinishedHistoryLog` | History re-date of one finished session. Same id. Vacated day drops it (`.1027`) |
| `applyImportedHistory` | History confirm-gated import of the diary file `.1011` saved (`.1013`). Confirm lives in the helper. |
| `loadFromCloud` | Merge Supabase history with local |
| `syncCurrentHistoryToCloud` | Re-queue local logs — called from `useJourneySync` on `SIGNED_IN` (`.949`). Also enqueues the open session (`.958`) |
| `restoreActiveWorkout` | Adopt a remote open session without minting a second `clientId` (`.958`) |
| `ensureOpenSessionIdentity` | Stamp `clientId` once on a pre-`.958` persist |
| `cancelActiveWorkout` | Discard in-progress. Tombstones the open session so the other surface does not reopen it |
| `skipExerciseInActive` | Skip this exercise once, this session (`.959`). Keeps logged sets. Does not rewrite the plan |
| `reorderExerciseInActive` | Move this exercise in the live list, this session (`.998`). Sets travel. Does not rewrite the plan |
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
