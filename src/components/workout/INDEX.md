# src/components/workout/

> Active workout logger UI pieces.

## Components

| File | Purpose |
|------|---------|
| `ActiveEmptyState.tsx` | No-session shell — start quick workout |
| `ActiveSessionChrome.tsx` | Session bar — Elapsed/Sets pair, progress, Plates + Finish; **Add exercise is a trigger** for `AddExerciseSheet`, not an inline picker |
| `ActiveSessionDock.tsx` | One `ScreenDock` for rest **or** compact `LogConsole` — never both (`.440`). Mode from `resolveActiveDockMode` |
| `ActiveWorkoutSheets.tsx` | Check-in · form · add · plates · victory overlay cluster (`.450`) |
| `ActiveExerciseList.tsx` | Maps session exercises → `ActiveExerciseCard` (swap candidates, table controls, open-idx). Page mounts this instead of inlining the map (`.439`) |
| `ActiveExerciseCard.tsx` | Dense exercise block — Info → form guide; overflow for Note/Swap/SS/Ask/Remove. **Swap** is `AdaptiveOverlay` + `ExercisePicker` (not an inline max-h-48 list). Footer Rest offers last rest for that exercise (`.715`) |
| `SetLogTable.tsx` | **Desktop** set list — Strong/Hevy density (`Set · Prev · kg · Reps`); **Prev is the row anchor** (`data-prev-anchor`); ≥44px inputs; one poster-red inline `Log set` (sole red at md+). Compact uses `SetLogRow` + `LogConsole` |
| `SetLogRow.tsx` | **Read-only set record** — **Prev metric anchor** + this-session line (no "In the console" prose), kind/PR/RPE, `Check`. ≥44px row + RPE. No filled red — entry is `LogConsole` |
| `LogConsole.tsx` | **Compact only** — **the only place a set is entered.** Dense ink `ScreenDock`: name + `Set n of m`, overload cue, collapsed Work/Kind chips (ink selected, never accent fill), 52px steppers, one poster-red `Log set` in the thumb zone (F-003) |
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
| Lib | `activeWorkoutHelpers.ts`, `restTimer.ts`, `plateCalculator.ts`, `workoutPr.ts`, `setKind.ts` |
