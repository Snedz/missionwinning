# src/components/workout/

> Active workout logger UI pieces.

## Components

| File | Purpose |
|------|---------|
| `ActiveEmptyState.tsx` | No-session shell — start quick workout |
| `ActiveSessionChrome.tsx` | Session bar — name, compact elapsed · sets, Finish. No Live session eyebrow. Plates + coach tip + Cue me in overflow. Compact Add exercise is after the table |
| `ActiveSessionDock.tsx` | One `ScreenDock` for rest only. Set entry is `SetLogTable`; `resolveActiveDockMode` no longer emits `console` |
| `ActiveWorkoutSheets.tsx` | Check-in · hard-session warning · form · add · plates · victory overlay cluster (`.450`) |
| `ActiveExerciseList.tsx` | Maps session exercises → `ActiveExerciseCard` (swap candidates, table controls, open-idx). Page mounts this instead of inlining the map (`.439`) |
| `ActiveExerciseCard.tsx` | Dense exercise block — Info → form guide; overflow for Note/Swap/SS/Ask/Remove. **Swap** is `AdaptiveOverlay` + `ExercisePicker` (not an inline max-h-48 list) |
| `SetLogTable.tsx` | Set list on **every** surface — Set · Prev · kg · Reps · Log. Prev is the row anchor. ≥44px inputs. One poster-red inline `Log set`. After-complete cite via `SetLogNextCite`. |
| `SetLogNextCite.tsx` | Skippable next-set cite after a completed working set (`.939`). Not a feed. |
| `SetLogPlateLine.tsx` | Skippable both-sides plate breakdown on the live barbell row (`.948`). Editable bar. Never blocks Log set. |
| `SetLogAdjacencyStack.tsx` | Unused TARGET-above-PREVIOUS stack — do not remount into Prev (would restyle the table). |
| `SetLogRow.tsx` | Legacy read-only set record (not mounted on Active). Kept for tests of the old compact density. |
| `LogConsole.tsx` | Legacy compact dock entry. Active dock is rest-only; set entry is the table. |
| `AddExerciseSheet.tsx` | `ExercisePicker` in a sheet with the confirm in the footer. **Test contract:** keeps the `search exercises` placeholder, `option` rows and `add selected exercise` name — `logger-depth`, `first-90` and `hero-flows` all drive them |
| `HardSessionWarningSheet.tsx` | Pre-start hard-session warning — Back does not start; never gates Log set. Stop line follows pregnancy flag (`.746` v1) |
| `RestTimerBar.tsx` | Rest countdown — **takes the `ScreenDock` over from `LogConsole`, never both**. **Ambient running** while `remaining > 0` (`data-rest-running`, ticking `rest-clock`, depleting ambient fill + meters). Skip via `data-testid="rest-skip"`; accent fill only in final ≤10s |
| `WorkoutVictorySheet.tsx` | Post-workout receipt — stats + Next. Feel, share, rewards, debrief in Show all |
| `VictoryFeelStrip.tsx` | Post-session feel 1–5 energy (free ritual) (`.429`) |
| `VictoryBodyDeltaStrip.tsx` | Readiness · strain · recovery signed deltas (`.444`) |
| `VictoryStatsStrip.tsx` | Volume · sets · duration grid (`.447`); BW prints reps via `formatWorkoutVolumeDisplay` (`.886`) |
| `VictoryReceiptStrip.tsx` | Per-lift vs-last receipt on Victory (`.713`); session totals match shape (`.944`) |
| `VictoryNextActionStrip.tsx` | Primary Next CTA block (`.447`) |
| `PlateCalculatorSheet.tsx` | Plate math sheet |
| `LiveHeartRate.tsx` | Optional Web Bluetooth BPM strip (wearables flag) |

## Related

| Layer | Path |
|-------|------|
| Page | `ActiveWorkoutPage.tsx` |
| Store | `workoutStore.ts` |
| Lib | `activeWorkoutHelpers.ts`, `restTimer.ts`, `plateCalculator.ts`, `workoutPr.ts`, `setKind.ts` |
