# src/lib/workout/

> One concern: active logger, history merge, set kinds, rest timer, victory, Just Go targets.

Root-level `@/lib/{name}` paths re-export from here for compatibility — prefer `@/lib/workout/...` for new code.

## Read order

1. `setKind.ts` — normal/warmup/drop; volume + PR eligibility  
2. `restTimer.ts` — rest seconds, clock format, defaults  
3. `superset.ts` — peer links, advance after log, rest gate  
4. `nextSetTargets.ts` — Strong/Hevy-style next set suggestions  
4a. `setRowAdjacency.ts` — E-Adjacency: set-row target + log cite (above PREVIOUS)  
5. `percentLoad.ts` — TrainHeroic-style % of e1RM → absolute weight (`loadPct`)  
6. `workoutTemplate.ts` — template → logged sets  
7. `workoutPr.ts` — personal record detection  
8. `workoutMerge.ts` — local/cloud history fingerprint merge  
9. `workoutVictory.ts` — post-workout summary; early/no-plan → Mission Coach; freestyle progression skipped when prescribed (`.410`); one-exit secondary Today helper (`.422`)  
10. `activeWorkoutHelpers.ts` — next incomplete set, last session, set stats, `buildConsoleSet` / `planApplyTargets` / `resolveActiveSetDial` (`.297`/`.303`)  
11. `activeWorkoutPulse.ts` — nav pulse flag without store  
12. `workoutPersistLite.ts` — history/streak from localStorage (cold path)
13. `sessionCheckInOffer.ts` — pure W1 gate: never Mind-sheet the first mission (`.293`)
14. `loggerSpeed.ts` — Enter/Use-next helpers (`.288`)
15. `activeSessionFinish.ts` — log-set payload/PR/rest/haptic + Victory + empty-finish toast (`.405`/`.409`)
16. `activeSessionCheckIn.ts` — check-in dismiss + volume-trim toast kind (`.406`)
17. `activeSetInputPatches.ts` — Use next / plate / apply-targets field patches (`.407`)
18. `activeTableSetControls.ts` — desktop table set dial + kind projection (`.408`)
19. `activeWorkoutHelpers.ts` — also `resolveExerciseNextTarget` + loadPct/menu gates (`.418`); `formatPrevSetLabels` + footer peel (`.425`)

## Tests (colocated)

| File | Covers |
|------|--------|
| `setKind.test.ts` | Volume / PR eligibility |
| `restTimer.test.ts` | Clock + defaults + start seconds (`.292`) |
| `superset.test.ts` | Advance, rest gate |
| `nextSetTargets.test.ts` | Progression targets |
| `setRowAdjacency.test.ts` | Target + weekday/set-number cite; no freshness picker |
| `percentLoad.test.ts` | e1RM max, % → weight, scale |
| `workoutTemplate.test.ts` | Template logging |
| `workoutPr.test.ts` | PR detection |
| `workoutMerge.test.ts` | Conflict / cap / fingerprint |
| `workoutVictory.test.ts` | Victory next action |
| `activeWorkoutHelpers.test.ts` | Next set, last session stats |
| `sessionCheckInOffer.test.ts` | First-mission never offers check-in (`.293`) |
| `loggerSpeed.test.ts` | Use-next offer rules (`.288`) |

## UI & integration (not in this folder)

| Layer | Path |
|-------|------|
| Store | `src/store/workoutStore.ts` |
| Page | `src/page-components/ActiveWorkoutPage.tsx` |
| Components | `src/components/workout/` |
| Just Go | `src/lib/justGoSession.ts` (uses `nextSetTargets`) |
