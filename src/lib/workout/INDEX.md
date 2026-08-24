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
4. `nextSetTargets.ts` — set-table-style next set suggestions  
5. `percentLoad.ts` — a team-training app-style % of e1RM → absolute weight (`loadPct`)  
6. `workoutTemplate.ts` — template → logged sets  
7. `workoutPr.ts` — personal record detection  
8. `workoutMerge.ts` — local/cloud history fingerprint merge  
9. `workoutVictory.ts` — post-workout summary; early/no-plan → Mission Coach; freestyle progression skipped when prescribed (`.410`); one-exit secondary Today helper (`.422`); vs-last `receipt` from `victoryReceipt.ts` (`.713` / merge-all); `workingReps` for BW volume (`.886`)
9b. `victoryReceipt.ts` — vs-last session totals + per-lift rows for Victory (`.713`)  
9c. `completedLogSets.ts` — one set-count for a completed log (Today highlights + Victory) (`.930`)  
10. `activeWorkoutHelpers.ts` — next incomplete set, last session, set stats, `buildConsoleSet` / `planApplyTargets` / `resolveActiveSetDial` (`.297`/`.303`); `getLastSessionSets` reads `lastLiveSessionForExercise` (`.936` recovers #487 leftover)  
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
25b. `setRowAdjacency.ts` — next-set target + log cite; `resolveAfterCompleteCite` after a completed working set (`.934`)
26. `sessionE1rm.ts` — educational Epley e1RM from this session's working sets (`.761`); hide pref `mw_show_session_e1rm`
27. `homeGymKit.ts` — local Home gym kit (barbell/rack/plates/dumbbells/pull-up-bar/floor). Logger + Just Go + Coach filter; never rank; Train empty Start stays repeat-last (`.763`)
28. `warmupRamp.ts` — free set-table 40/60/80 warmup insert + set-column `W` ordinals (`.764`); plate line is `src/lib/plateCalculator.ts` `setRowPlateLine`

## Tests (colocated)

| File | Covers |
|------|--------|
| `setKind.test.ts` | Volume / PR eligibility |
| `dropSet.test.ts` | Load rule / start plan / rest compose (`.754`) |
| `unilateral.test.ts` | L/R/Alt persist, skip bilateral, suggest next side (`.755`) |
| `bodyweightLoad.test.ts` | BW + belt format + plus-load detect (`.758`) |
| `bodyweightLoadGuard.test.ts` | Free logger; skip-at-0; one formatter (`.758`) |
| `importReach.test.ts` | set-table CSV import stays reachable from I-Day + empty logger (`.766`) |
| `restTimer.test.ts` | Clock + defaults + start seconds (`.292`) + last-rest recall / skip (`.745`) |
| `superset.test.ts` | Pair persist, pair-of-two, A1/A2 marks, advance, rest gate (`.749`) |
| `nextSetTargets.test.ts` | Progression targets |
| `percentLoad.test.ts` | e1RM max, % → weight, scale |
| `workoutTemplate.test.ts` | Template logging |
| `workoutPr.test.ts` | PR detection |
| `workoutMerge.test.ts` | Conflict / cap / fingerprint |
| `workoutVictory.test.ts` | Victory next action + BW working reps (`.886`) |
| `volumeDisplay.test.ts` | Load vs reps volume label |
| `victoryReceipt.test.ts` | Vs-last session + per-lift receipt (`.713`) |
| `activeSessionFinish.test.ts` | Log-set rest/PR + Victory assembly including receipt |
| `activeWorkoutHelpers.test.ts` | Next set, last session stats |
| `repeatLastSession.test.ts` | Last-session copy + empty-history path (`.717`) |
| `vsLastSet.test.ts` | After-save vs-last: +weight / +reps / first-ever (`.760`) |
| `setRowAdjacency.test.ts` | Honest empty + one-set skippable cite; no next-session bump; Train-only (`.936`) |
| `sessionCheckInOffer.test.ts` | First-mission never offers check-in (`.293`) |
| `loggerSpeed.test.ts` | Use-next offer rules (`.288`) |
| `exerciseNote.test.ts` | Prefill / clear / persist seed + first-paint guards (`.748`) |
| `garageSwap.test.ts` | Garage list ≤2, load clear, plan-line swap, wiring (`.752`) |
| `rir.test.ts` | Optional 0–5 parse; empty OK; Log set ungated (`.756`) |
| `tempo.test.ts` | Optional tempo parse / last-tempo / not a Log set gate (`.757`) |
| `lastSetGhost.test.ts` | First-ever no ghost; returning last working set not warmup (`.759`) |
| `sessionE1rm.test.ts` | Epley formula + warmup / load-0 exclusion (`.761`) |
| `sessionE1rmCopy.test.ts` | Copy names Epley; does not say "your max" |
| `homeGymKit.test.ts` | Parse, $0 floor, matching, I-Day seed, free-path (`.763`) |
| `warmupRamp.test.ts` | 40/60/80 ramp, ordinals, idempotent insert (`.764`) |
| `plateWarmupFree.test.ts` | Plate/warmup path never imports premium (`.764`) |

## UI & integration (not in this folder)

| Layer | Path |
|-------|------|
| Store | `src/store/workoutStore.ts` |
| Page | `src/page-components/ActiveWorkoutPage.tsx` |
| Components | `src/components/workout/` |
| Just Go | `src/lib/justGoSession.ts` (uses `nextSetTargets`) |
