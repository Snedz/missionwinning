# src/lib/workout/

> One concern: active logger, history merge, set kinds, rest timer, victory, Just Go targets.

Root-level `@/lib/{name}` paths re-export from here for compatibility — prefer `@/lib/workout/...` for new code.

## Read order

1. `setKind.ts` — normal/warmup/drop; volume + PR eligibility  
2. `restTimer.ts` — rest seconds, clock format, defaults  
3. `superset.ts` — peer links, advance after log, rest gate  
4. `nextSetTargets.ts` — Strong/Hevy-style next set suggestions  
5. `workoutTemplate.ts` — template → logged sets  
6. `workoutPr.ts` — personal record detection  
7. `workoutMerge.ts` — local/cloud history fingerprint merge  
8. `workoutVictory.ts` — post-workout summary + next pillar action  
9. `activeWorkoutHelpers.ts` — next incomplete set, last session, set stats  
10. `activeWorkoutPulse.ts` — nav pulse flag without store  
11. `workoutPersistLite.ts` — history/streak from localStorage (cold path)

## Tests (colocated)

| File | Covers |
|------|--------|
| `setKind.test.ts` | Volume / PR eligibility |
| `restTimer.test.ts` | Clock + defaults |
| `superset.test.ts` | Advance, rest gate |
| `nextSetTargets.test.ts` | Progression targets |
| `workoutTemplate.test.ts` | Template logging |
| `workoutPr.test.ts` | PR detection |
| `workoutMerge.test.ts` | Conflict / cap / fingerprint |
| `workoutVictory.test.ts` | Victory next action |
| `activeWorkoutHelpers.test.ts` | Next set, last session stats |

## UI & integration (not in this folder)

| Layer | Path |
|-------|------|
| Store | `src/store/workoutStore.ts` |
| Page | `src/page-components/ActiveWorkoutPage.tsx` |
| Components | `src/components/workout/` |
| Just Go | `src/lib/justGoSession.ts` (uses `nextSetTargets`) |
