# src/components/workout/

> Active workout logger UI pieces.

## Components

| File | Purpose |
|------|---------|
    | `ActiveEmptyState.tsx` | No-session shell — Start workout, or Repeat last session when history exists |
| `ActiveSessionChrome.tsx` | Session bar — Elapsed/Sets pair, progress, Plates + Finish; **Add exercise is a trigger** for `AddExerciseSheet`, not an inline picker |
| `ActiveSessionDock.tsx` | One `ScreenDock` for rest **or** compact `LogConsole` — never both (`.440`). Mode from `resolveActiveDockMode` |
| `ActiveWorkoutSheets.tsx` | Check-in · form · add · plates · victory overlay cluster (`.450`) |
| `ActiveExerciseList.tsx` | Maps session exercises → `ActiveExerciseCard` (swap candidates, table controls, open-idx). Page mounts this instead of inlining the map (`.439`) |
| `ActiveExerciseCard.tsx` | Dense exercise block — Info → form guide; overflow for Note/Swap/SS/Ask/Remove. **Swap** is `AdaptiveOverlay` + `GarageSwapList` (1–2 garage stand-ins). Footer Rest offers last rest (`.745`). Note field sits **after** the set rows (`.748`) |
| `ExerciseNoteField.tsx` | Always-visible one-line diary on the exercise — last cue prefills at start/add/swap; no autofocus (`.748`) |
| `ActiveExerciseFooter.tsx` | Add Set · **Drop** after a working set (`.754`, outline, not red) · Rest · desktop kind chips · optional L/R/Alt · set options |
| `SetLogTable.tsx` | **Desktop** set list — Strong/Hevy density (`Set · Prev · kg · Reps`); **Prev is the row anchor** (`data-prev-anchor`); pair mark `A1·n` when paired (`.749`); optional L/R/Alt; completed rows optional RIR + tempo beside RPE (`.756`/`.757`); ≥44px inputs; one poster-red inline `Log set`. Compact uses `SetLogRow` + `LogConsole` |
| `SetLogRow.tsx` | **Read-only set record** — **Prev metric anchor** + this-session line, pair mark `A1·n` when paired (`.749`), kind/PR/RPE, optional L/R/Alt + RIR + tempo, `Check`. ≥44px row. No filled red — entry is `LogConsole` |
| `SetRirSelect.tsx` | Compact native 0–5 RIR select for completed rows (`.756`). Empty default. |
| `SetTempoField.tsx` | Compact optional `e-p-c` tempo on a **completed** set row (`.757`). Never required to log |
| `LogConsole.tsx` | **Compact only** — **the only place a set is entered.** Dense ink `ScreenDock`: name + `Set n of m`, overload cue, collapsed Work/Kind chips, optional L/R/Alt on unilateral, 52px steppers, one poster-red `Log set` in the thumb zone (F-003) |
| `GarageSwapList.tsx` | Short 1–2 garage stand-ins for logger + Coach session Swap (`.752`). Not the catalog picker |
| `AddExerciseSheet.tsx` | `ExercisePicker` in a sheet with the confirm in the footer. **Test contract:** keeps the `search exercises` placeholder, `option` rows and `add selected exercise` name — `logger-depth`, `first-90` and `hero-flows` all drive them |
| `RestTimerBar.tsx` | Rest countdown — **takes the `ScreenDock` over from `LogConsole`, never both**. **Ambient running** while `remaining > 0` (`data-rest-running`, ticking `rest-clock`, depleting ambient fill + meters). Skip via `data-testid="rest-skip"`; accent fill only in final ≤10s |
| `WorkoutVictorySheet.tsx` | Post-workout summary sheet |
| `VictoryFeelStrip.tsx` | Post-session feel 1–5 energy (free ritual) (`.429`) |
| `VictoryBodyDeltaStrip.tsx` | Readiness · strain · recovery signed deltas (`.444`) |
| `VictoryStatsStrip.tsx` | Volume · sets · duration grid (`.447`) |
| `VictoryNextActionStrip.tsx` | Primary Next CTA block (`.447`) |
| `PlateCalculatorSheet.tsx` | Plate math sheet |
| `LiveHeartRate.tsx` | Optional Web Bluetooth BPM strip (wearables flag) |

## Related

| Layer | Path |
|-------|------|
| Page | `ActiveWorkoutPage.tsx` |
| Store | `workoutStore.ts` |
| Lib | `activeWorkoutHelpers.ts`, `restTimer.ts`, `plateCalculator.ts`, `workoutPr.ts`, `setKind.ts`, `dropSet.ts` |
