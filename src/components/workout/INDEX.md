# src/components/workout/

> Active workout logger UI pieces.

## Components

| File | Purpose |
|------|---------|
| `ActiveEmptyState.tsx` | No-session shell — start quick workout |
| `ActiveSessionChrome.tsx` | Compact sticky session bar — timer/Finish primary; Plates/Discard in overflow |
| `ActiveExerciseCard.tsx` | Dense exercise block — Info → form guide; overflow for Note/Swap/SS/Ask/Remove |
| `SetLogRow.tsx` | Strong/Hevy nowrap reps × weight × Log; kinds/Apply behind More |
| `RestTimerBar.tsx` | Rest countdown dock (compact clock + Skip) |
| `WorkoutVictorySheet.tsx` | Post-workout summary sheet |
| `PlateCalculatorSheet.tsx` | Plate math sheet |
| `LiveHeartRate.tsx` | Optional Web Bluetooth BPM strip (wearables flag) |

## Related

| Layer | Path |
|-------|------|
| Page | `ActiveWorkoutPage.tsx` |
| Store | `workoutStore.ts` |
| Lib | `activeWorkoutHelpers.ts`, `restTimer.ts`, `plateCalculator.ts`, `workoutPr.ts`, `setKind.ts` |
