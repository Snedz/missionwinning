# src/lib/workout/

> One concern: active logger, history merge, set kinds, rest timer, victory, Just Go targets.

Root-level `@/lib/{name}` paths re-export from here for compatibility — prefer `@/lib/workout/...` for new code.

## Read order

1. `setKind.ts` — normal/warmup/drop; volume + PR eligibility  
1b. `dropSet.ts` — start a drop of the last working set (−20% load, skip rest) (`.754`)  
1c. `unilateral.ts` — optional L/R/Alt on a unilateral set (not a SetKind, not a pair) (`.755`)  
1d. `bodyweightLoad.ts` — BW + added load on one row (`.758`); `weight` is belt/vest  
2. `restTimer.ts` — rest seconds, clock format, defaults, last-rest per exercise (`.745`)  
3. `superset.ts` — pair-of-two (`pairWithNext` / `unpair` / `pairMark` A1/A2), advance after log, rest gate (`.749`)  
4. `nextSetTargets.ts` — Strong/Hevy-style next set suggestions  
5. `percentLoad.ts` — TrainHeroic-style % of e1RM → absolute weight (`loadPct`)  
6. `workoutTemplate.ts` — template → logged sets  
7. `workoutPr.ts` — personal record detection  
8. `workoutMerge.ts` — local/cloud history fingerprint merge  
9. `workoutVictory.ts` — post-workout summary; early/no-plan → Mission Coach; freestyle progression skipped when prescribed (`.410`); one-exit secondary Today helper (`.422`)  
10. `activeWorkoutHelpers.ts` — next incomplete set, last session, set stats, `buildConsoleSet` / `planApplyTargets` / `resolveActiveSetDial` (`.297`/`.303`)  
10a. `repeatLastSession.ts` — last completed log → startWorkout template (`.717`); wraps `historyRetrain.templateFromCompletedLog`  
11. `activeWorkoutPulse.ts` — nav pulse flag without store
12. `workoutPersistLite.ts` — history/streak from localStorage (cold path)
13. `sessionCheckInOffer.ts` — pure W1 gate: never Mind-sheet the first mission (`.293`)
14. `loggerSpeed.ts` — Enter/Use-next helpers (`.288`)
15. `activeSessionFinish.ts` — log-set payload/PR/rest/haptic + Victory + empty-finish toast (`.405`/`.409`)
16. `activeSessionCheckIn.ts` — check-in dismiss + volume-trim toast kind (`.406`)
17. `activeSetInputPatches.ts` — Use next / plate / apply-targets field patches (`.407`)
18. `activeTableSetControls.ts` — desktop table set dial + kind projection (`.408`)
19. `activeWorkoutHelpers.ts` — also `resolveExerciseNextTarget` + loadPct/menu gates (`.418`); `formatPrevSetLabels` + footer peel (`.425`)
20. `exerciseNote.ts` — per-exercise diary seed (unset vs clear) + history wrap (`.748`)
21. `garageSwap.ts` — 1–2 bodyweight/garage stand-ins on a logger or Coach plan line (`.752`); not a generate rewrite
22. `rir.ts` — optional integer 0–5 reps in reserve; empty valid; never replaces RPE (`.756`)
23. `tempo.ts` — optional ecc/pause/con parse + last-tempo recall (`.757`)
24. `lastSetGhost.ts` — last **working** set ghost (not warmup W); one-tap accept (`.759`)
25. `vsLastSet.ts` — after-save vs-last delta on the set row (`.760`); working-set index; not ghost prefill

## Tests (colocated)

| File | Covers |
|------|--------|
| `setKind.test.ts` | Volume / PR eligibility |
| `dropSet.test.ts` | Load rule / start plan / rest compose (`.754`) |
| `unilateral.test.ts` | L/R/Alt persist, skip bilateral, suggest next side (`.755`) |
| `bodyweightLoad.test.ts` | BW + belt format + plus-load detect (`.758`) |
| `bodyweightLoadGuard.test.ts` | Free logger; skip-at-0; one formatter (`.758`) |
| `restTimer.test.ts` | Clock + defaults + start seconds (`.292`) + last-rest recall / skip (`.745`) |
| `superset.test.ts` | Pair persist, pair-of-two, A1/A2 marks, advance, rest gate (`.749`) |
| `nextSetTargets.test.ts` | Progression targets |
| `percentLoad.test.ts` | e1RM max, % → weight, scale |
| `workoutTemplate.test.ts` | Template logging |
| `workoutPr.test.ts` | PR detection |
| `workoutMerge.test.ts` | Conflict / cap / fingerprint |
| `workoutVictory.test.ts` | Victory next action |
| `activeWorkoutHelpers.test.ts` | Next set, last session stats |
| `repeatLastSession.test.ts` | Last-session copy + empty-history path (`.717`) |
| `vsLastSet.test.ts` | After-save vs-last: +weight / +reps / first-ever (`.760`) |
| `sessionCheckInOffer.test.ts` | First-mission never offers check-in (`.293`) |
| `loggerSpeed.test.ts` | Use-next offer rules (`.288`) |
| `exerciseNote.test.ts` | Prefill / clear / persist seed + first-paint guards (`.748`) |
| `garageSwap.test.ts` | Garage list ≤2, load clear, plan-line swap, wiring (`.752`) |
| `rir.test.ts` | Optional 0–5 parse; empty OK; Log set ungated (`.756`) |
| `tempo.test.ts` | Optional tempo parse / last-tempo / not a Log set gate (`.757`) |
| `lastSetGhost.test.ts` | First-ever no ghost; returning last working set not warmup (`.759`) |

## UI & integration (not in this folder)

| Layer | Path |
|-------|------|
| Store | `src/store/workoutStore.ts` |
| Page | `src/page-components/ActiveWorkoutPage.tsx` |
| Components | `src/components/workout/` |
| Just Go | `src/lib/justGoSession.ts` (uses `nextSetTargets`) |
