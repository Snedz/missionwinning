# src/components/workout/

> Active workout logger UI pieces.

## Components

| File | Purpose |
|------|---------|
| `ActiveEmptyState.tsx` | No-session shell — start quick workout |
| `ActiveSessionChrome.tsx` | Live header, coach notes, add-exercise |
| `ActiveExerciseCard.tsx` | One exercise block in the session |
| `SetLogRow.tsx` | Single set row — reps, weight, RPE, kind |
| `RestTimerBar.tsx` | Rest countdown UI |
| `WorkoutVictorySheet.tsx` | Post-workout summary sheet |
| `PlateCalculatorSheet.tsx` | Plate math sheet |

## Related

| Layer | Path |
|-------|------|
| Page | `ActiveWorkoutPage.tsx` |
| Store | `workoutStore.ts` |
| Lib | `activeWorkoutHelpers.ts`, `restTimer.ts`, `plateCalculator.ts`, `workoutPr.ts`, `setKind.ts` |
