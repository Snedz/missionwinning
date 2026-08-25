# src/lib/workout/

> One concern: active logger, history merge, set kinds, rest timer, victory, Just Go targets.

Root-level `@/lib/{name}` paths re-export from here for compatibility — prefer `@/lib/workout/...` for new code.

## Read order

1. `setKind.ts` — normal/warmup/drop/failure; volume + PR eligibility; optional row tags W / D / F (`toggleSetTag`, `.966`)  
1b. `dropSet.ts` — start a drop of the last working set (−20% load, skip rest) (`.754`); log/tag a drop zeros a running timer (`.986`)  
1c. `unilateral.ts` — optional L/R/Alt on a unilateral set (not a SetKind, not a pair) (`.755`)  
1d. `bodyweightLoad.ts` — BW + added load on one row (`.758`); `weight` is belt/vest  
1e. `setRowType.ts` — open row speaks weight · bodyweight reps · duration · assisted (`.994`). Empty / custom stays weight×reps. Vest is extra only.  
2. `restTimer.ts` — rest seconds, clock format, defaults, last-rest per exercise (`.745`) with warmup vs work lanes (`.995`)  
2b. `workClock.ts` — optional EMOM interval / AMRAP countdown on the live set row (`.987`). Not rest. Empty invents nothing.  
2c. `customExercise.ts` — named custom on the live picker (`.990`). Local notebook. Unlimited. Empty invents nothing.  
3. `superset.ts` — group of two or more (`groupWithNext` / `unpair` / `pairMark` A1/A2/A3), advance after log, rest gate, rest identity on first peer (`.749` / `.980` / concern `.979`)  
4. `nextSetTargets.ts` — set-table-style next set suggestions  
5. `percentLoad.ts` — a team-training app-style % of e1RM → absolute weight (`loadPct`)
5b. `setRowPercent.ts` — optional % of a **known** 1-rep max on the live set row (`.981`). Empty invents nothing. Not Epley.  
6. `workoutTemplate.ts` — template → logged sets  
7. `workoutPr.ts` — personal record detection  
8. `workoutMerge.ts` — local/cloud history fingerprint merge  
9. `workoutVictory.ts` — post-workout summary; early/no-plan → Mission Coach; freestyle progression skipped when prescribed (`.410`); one-exit secondary Today helper (`.422`); vs-last `receipt` from `victoryReceipt.ts` (`.713` / merge-all); `workingReps` for BW volume (`.886`)
9b. `victoryReceipt.ts` — vs-last session totals by **shape** (sorted unique lift ids, `.944`) + per-lift rows (`.713`). Close receipt ready-gate + private text keep (`.956`). Session notes ride the keep when present (`.982`)
9c. `completedLogSets.ts` — one set-count for a completed log (Today highlights + Victory) (`.930`)
9d. `sessionNote.ts` — optional private session diary; empty invents nothing; cloud upsert omits it (`.982`)  
10. `activeWorkoutHelpers.ts` — next incomplete set, last session, set stats, `buildConsoleSet` / `planApplyTargets` / `resolveActiveSetDial` (`.297`/`.303`); `getLastSessionSets` reads `lastLiveSessionForExercise` (`.939` recovers #487 leftover); Prev matches working-set index and stays quiet on warmup (`.966`)  
10c. `inSetCues.ts` — short written setup on the open live lift (`.973`). Cap 3. Optional still from media we already have. Empty invents nothing. Cue list may link to Quiet Learn (`.978`).
10a. `repeatLastSession.ts` — last completed log → startWorkout template (`.717`); wraps `historyRetrain.templateFromCompletedLog` (working sets only — warmup omitted, `.966`)  
10a2. `honorSavedRoutine.ts` — saved notebook over Wednesday / Just Go (`.960`). `pickHonoredStart` / `honorCiteStart` / confirm-gated `decideSavedWrite`. Empty invents nothing.  
10a4. `startAgain.ts` — session-out Start this again from a finished log (`.991`). Wraps `templateFromCompletedLog` + `protectLiveStart`. Empty invents nothing. Not a shop.  
10a5. `movementHistory.ts` — prior sessions of the open lift (`.993`). Newest first. Empty invents nothing. Short list stays a notebook. Not a chart.  
10a6. `editFinishedSession.ts` — edit the sets on a finished History log (`.997`). Confirm-gated. Empty invents nothing. Never wipes. Not Resume.  
10a3. `thinHistory.ts` — 1–2 live sessions are a notebook (`.971`). Wednesday and the week strip both read `isThinHistory`. Empty invents nothing.  
10b. `openSessionContinuity.ts` — desk → gym decide for the *open* session (`.958`); `reconcileOpenSession.ts` pulls/applies. `sessionNote` stays on device
10b2. `sessionResume.ts` — this-device leave/return + Finish-partial (`.963`). Live Start is keep. Empty leftovers invent no volume
11. `activeWorkoutPulse.ts` — nav pulse flag without store
12. `workoutPersistLite.ts` — history/streak from localStorage (cold path)
13. `sessionCheckInOffer.ts` — pure W1 gate: never Mind-sheet the first mission (`.293`)
14. `loggerSpeed.ts` — Enter/Use-next helpers (`.288`)
15. `activeSessionFinish.ts` — log-set payload/PR/rest/haptic + Victory + empty-finish toast (`.405`/`.409`)
16. `activeSessionCheckIn.ts` — check-in dismiss + volume-trim toast kind (`.406`)
17. `activeSetInputPatches.ts` — Use next / plate / apply-targets field patches (`.407`)
18. `activeTableSetControls.ts` — desktop table set dial + kind projection (`.408`)
19. `activeWorkoutHelpers.ts` — also `resolveExerciseNextTarget` + loadPct/menu gates (`.418`); `formatPrevSetLabels` + footer peel (`.425`)
20. `exerciseNote.ts` — this-session diary on the lift (unset vs clear). Appearance drops a leaked note; last History is not a pin (`.748` / `.996`)
20b. `exercisePin.ts` — pinned reminder per lift id. Returns next session. Not History (`.996`)
21. `garageSwap.ts` — 1–2 bodyweight/garage stand-ins on a logger or Coach plan line (`.752`); not a generate rewrite
21b. `sessionExerciseOnce.ts` — skip or swap this exercise **this session** (`.959`); does not write Wednesday / saved / plan
21c. `sessionReorder.ts` — drag the live list **this session** (`.998`); does not write Wednesday / saved / plan
22. `rir.ts` — optional integer 0–5 reps in reserve; empty valid; never replaces RPE (`.756`)
22b. `rpe10.ts` — optional integer 1–10 RPE; empty valid; never required to log (`.967`)
22c. `workSetIntensity.ts` — last work set RPE/RIR cite token; empty stays empty (`.967`)
23. `tempo.ts` — optional ecc/pause/con parse + last-tempo recall (`.757`)
24. `lastSetGhost.ts` — last **working** set ghost (not warmup W); one-tap accept (`.759`). Dial prefill reuses the same reader via `lastWorkingForDial` (`.946` / F-013)
25. `vsLastSet.ts` — after-save vs-last delta on the set row (`.760`); working-set index; not ghost prefill
25c. `inSetPr.ts` — quiet diary PR on the live set (`.999`). Heaviest / most reps / best logged 5. No prior invents nothing. Not Epley.
25b. `setRowAdjacency.ts` — next-set target + log cite; `resolveAfterCompleteCite` after a completed working set (`.939`)
26. `sessionE1rm.ts` — educational Epley e1RM from this session's working sets (`.761`); hide pref `mw_show_session_e1rm`
27. `homeGymKit.ts` — local Home gym kit (barbell/rack/plates/dumbbells/pull-up-bar/floor). Logger + Just Go + Coach filter; never rank; Train empty Start stays repeat-last (`.763`)
28. `warmupRamp.ts` — free warmup batch from the working weight (½ / ⅔ / ¾, concern `.984` / stamp `.985`); set-column `W` ordinals (`.764`); plate line is `src/lib/plateCalculator.ts` `setRowPlateBreakdown` (`.948`)
29. `importCsv.ts` + `importCsvRestore.ts` — workout CSV in/out. Strong session export is `workoutsToSetTableBCsv` / `buildWorkoutCsvDownload('set-table-b')`. Hevy set export is `set-table-a`. MW native export is `workoutsToMwCsv` / `buildWorkoutCsvDownload('mw')` (`.953`). Empty history is header-only (`.943`). Import preview + confirm stays `.940`. English Hevy workout CSV is `set-table-a` (`.947`) — same Account path, no new dialect
29b. `importHevyMeasurements.ts` — Hevy official wide `measurement_data.csv` → `bodyMetrics`. Header-only detect. Existing native fields win (`.951`)

## Tests (colocated)

| File | Covers |
|------|--------|
| `setKind.test.ts` | Volume / PR eligibility + `toggleSetTag` (`.966`) |
| `setRowTags.test.ts` | Free W / D / F on the row; warmup is not Prev / vs-last / Wednesday; no paywall / formulas (`.966`) |
| `dropSet.test.ts` | Load rule / start plan / rest compose (`.754`); drop log/tag stay at zero (`.986`) |
| `unilateral.test.ts` | L/R/Alt persist, skip bilateral, suggest next side (`.755`) |
| `bodyweightLoad.test.ts` | BW + belt format + plus-load detect (`.758`) |
| `bodyweightLoadGuard.test.ts` | Free logger; skip-at-0; one formatter (`.758`) |
| `importCsv.ts` | Workout CSV parse + merge. English Strong export is `set-table-b`; English Hevy workout export is `set-table-a` |
| `importCsvRestore.ts` | Preview (dry-run) then confirm write; session/set export (`.940`). Diary door also lands Hevy measurements (`.951`) |
| `importHevyMeasurements.ts` | Hevy measurement header detect + parse + merge. Wide `date`/`weight_kg`/`fat_percent`/`*_in`/`*_cm` |
| `importCsv.test.ts` | Strong + Hevy fixtures: empty, one workout, malformed row; no invented sets; measurements header is not a workout dialect (`.951`) |
| `importCsvRestore.test.ts` | Preview does not write; confirm writes; second file still adds (`.940` / `.947` / `.951`); MW dump no-op (`.953`) |
| `importHevyMeasurements.test.ts` | Empty / one / malformed measurements; merge existing-wins; re-import no-op (`.951`) |
| `importReach.test.ts` | set-table CSV import stays reachable from I-Day + empty logger (`.766`); preview + confirm (`.940`) |
| `restTimer.test.ts` | Clock + defaults + start seconds (`.292`) + last-rest recall / skip (`.745`) + warmup vs work lanes (`.995`) |
| `exerciseRestSurface.test.ts` | Open-lift rest strip; Today stays one Start; global Default stays the dock (`.995`) |
| `workClock.test.ts` | EMOM interval / AMRAP countdown + rest compose + surface refuse (`.987`) |
| `customExercise.test.ts` | Named custom on live picker; unlimited; catalog miss does not unmount; empty invents nothing (`.990`) |
| `superset.test.ts` | Group persist, A1/A2/A3 marks, advance, rest gate, first-peer rest (`.749` / `.980` / concern `.979`) |
| `nextSetTargets.test.ts` | Progression targets |
| `percentLoad.test.ts` | e1RM max, % → weight, scale |
| `workoutTemplate.test.ts` | Template logging |
| `workoutPr.test.ts` | PR detection |
| `workoutMerge.test.ts` | Conflict / cap / fingerprint |
| `workoutVictory.test.ts` | Victory next action + BW working reps (`.886`) |
| `volumeDisplay.test.ts` | Load vs reps volume label |
| `victoryReceipt.test.ts` | Vs-last session by shape + per-lift receipt (`.713` / `.944`). Close: empty → no receipt; finished → one keepable text (`.956`) |
| `sessionNote.test.ts` | Optional session diary; empty omit; merge keeps local note; text keep only when present (`.982`) |
| `sessionNoteSurface.test.ts` | Notes stay off Today / `/private`; jot off Active first paint; receipt field is not Start (`.982`) |
| `activeSessionFinish.test.ts` | Log-set rest/PR + Victory assembly including receipt |
| `activeWorkoutHelpers.test.ts` | Next set, last session stats |
| `repeatLastSession.test.ts` | Last-session copy + empty-history path (`.717`) |
| `honorSavedRoutine.test.ts` | Save then Start uses their routine; Wednesday cite does not overwrite a saved PPL; empty invents nothing (`.960`) |
| `startAgain.test.ts` | Finished log → Start; empty / live-keep invent nothing (`.991`) |
| `startAgainSurface.test.ts` | Receipt + History wire Start this again; Today stays one Start; not a shop (`.991`) |
| `movementHistory.test.ts` | Per-lift diary: empty / short invent nothing; warmup / tombstone skipped (`.993`) |
| `movementHistorySurface.test.ts` | Tap the open lift; Today stays one Start; no chart / paywall / Feed (`.993`) |
| `setRowType.test.ts` | Type resolve + vest volume + duration parse; custom name is not a guess (`.994`) |
| `setRowTypeSurface.test.ts` | Open row speaks the type; Today one Start; no Track BW invent / paywall (`.994`) |
| `thinHistory.test.ts` | Two named logs invent no Wednesday; week strip does not score 1–2 sessions; saved notebook still wins (`.964`) |
| `inSetCues.test.ts` | Setup first, cap 3; empty invents nothing; no remote clip URL; Train-only (`.973`) |
| `openSessionContinuity.test.ts` | Desk start → phone finish is one session; guest; no wipe; no Force Sync (`.958`) |
| `sessionResume.test.ts` | Leave Today → back = same session; Finish-partial keeps logged sets; empty invents nothing (`.963`) |
| `vsLastSet.test.ts` | After-save vs-last: +weight / +reps / first-ever (`.760`) |
| `inSetPr.test.ts` | Honest diary PR: empty / warmup / heaviest / most reps / best logged 5 (`.999`) |
| `inSetPrSurface.test.ts` | Live-set chrome only; Today one Start; History Edit stays on History (`.999`) |
| `setRowAdjacency.test.ts` | Honest empty + one-set skippable cite; no all-prescribed bump; not a last-actuals ghost; Train-only (`.939`) |
| `sessionCheckInOffer.test.ts` | First-mission never offers check-in (`.293`) |
| `loggerSpeed.test.ts` | Use-next offer rules (`.288`) |
| `exerciseNote.test.ts` | This-session note + appearance wipe; last History is not a pin (`.748` / `.996`) |
| `exercisePin.test.ts` | Pin normalize / per-id persist / cap / refuse History seed (`.996`) |
| `exerciseNotePinSurface.test.ts` | Open-lift note + pin; Today one Start; pin off History (`.996`) |
| `editFinishedSession.test.ts` | Finished-session edit: typo applies; empty does not wipe; drop needs confirm (`.997`) |
| `editFinishedSessionSurface.test.ts` | History door; Today one Start; not Resume; no permalink (`.997`) |
| `garageSwap.test.ts` | Garage list ≤2, load clear, plan-line swap, wiring (`.752`) |
| `sessionExerciseOnce.test.ts` | Skip once leaves the rest; swap once does not change Wednesday; empty invents nothing (`.959`) |
| `sessionReorder.test.ts` | Move a card; sets travel; empty / same / OOB invent nothing (`.998`) |
| `sessionReorderSurface.test.ts` | Handle on the name row; Today one Start; later lifts stay hidden until first set (`.998`) |
| `rir.test.ts` | Optional 0–5 parse; empty OK; Log set ungated (`.756`) |
| `rpe10.test.ts` | Optional 1–10 parse; empty OK; Log set ungated (`.967`) |
| `setRowPercent.test.ts` | Known max is a logged single; type 80% + max ⇒ load; no max invents nothing (`.981`) |
| `workSetIntensity.test.ts` | Last work set cite; no invented number; warmup skipped (`.967`) |
| `tempo.test.ts` | Optional tempo parse / last-tempo / not a Log set gate (`.757`) |
| `lastSetGhost.test.ts` | First-ever no ghost; returning last working set not warmup (`.759`) |
| `smartDefaultsF013.test.ts` | Empty history no invented default; one prior working set prefills and is editable; cite/ghost not a second Prev (`.946`) |
| `sessionE1rm.test.ts` | Epley formula + warmup / load-0 exclusion (`.761`) |
| `sessionE1rmCopy.test.ts` | Copy names Epley; does not say "your max" |
| `homeGymKit.test.ts` | Parse, $0 floor, matching, I-Day seed, free-path (`.763`) |
| `warmupRamp.test.ts` | ½ / ⅔ / ¾ batch, ordinals, idempotent insert, no bar gate (`.764` / `.985`) |
| `plateWarmupFree.test.ts` | Plate/warmup path never imports premium (`.764`) |
| `importCsv.test.ts` | Strong / Hevy / set-table / MW parse + header-only empty Strong export (`.943`) |
| `importCsvRestore.test.ts` | Preview vs confirm (`.940` / `.947` / `.951`); persist-layer Strong export round-trip (`.943`); MW dump re-imports as a no-op (`.953`) |
| `importHevyMeasurements.test.ts` | Hevy measurement_data.csv header + merge (`.951`) |
| `csvHistoryFree.test.ts` | Transfer path never consults premium; empty export is not a refuse |

## UI & integration (not in this folder)

| Layer | Path |
|-------|------|
| Store | `src/store/workoutStore.ts` |
| Page | `src/page-components/ActiveWorkoutPage.tsx` |
| Components | `src/components/workout/` |
| Just Go | `src/lib/justGoSession.ts` (uses `nextSetTargets`) |
