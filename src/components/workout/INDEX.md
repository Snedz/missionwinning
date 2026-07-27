# src/components/workout/

> Active workout logger UI pieces.

## Components

| File | Purpose |
|------|---------|
| `ActiveEmptyState.tsx` | No-session shell — start quick workout |
| `ActiveSessionChrome.tsx` | Session bar — Elapsed/Sets pair, progress, Plates + Finish; **Add exercise is a trigger** for `AddExerciseSheet`, not an inline picker |
| `ActiveExerciseCard.tsx` | Dense exercise block — Info → form guide; overflow for Note/Swap/SS/Ask/Remove |
| `SetLogTable.tsx` | **Desktop** set list — the handoff's table (`Set · Prev · kg · Reps`), inline inputs + inline `Log set` on the active row. Compact uses `SetLogRow` + `LogConsole` instead |
| `SetLogRow.tsx` | **A read-only record of one set** — `#n · 8 × 60 kg`, kind tag, PR honor, RPE, `Check`. Carries no inputs: entry is `LogConsole` |
| `LogConsole.tsx` | **Compact only** — desktop enters the set in its row.  **The only place a set is entered.** Ink panel in the `ScreenDock`: name + `Set n of m`, target line, 48×52px steppers, one poster-red `Log set`. Replaced a per-set control band that was ~340px inside 326px and hid Log behind `overflow-x-auto` |
| `AddExerciseSheet.tsx` | `ExercisePicker` in a sheet with the confirm in the footer. **Test contract:** keeps the `search exercises` placeholder, `option` rows and `add selected exercise` name — `logger-depth`, `first-90` and `hero-flows` all drive them |
| `RestTimerBar.tsx` | Rest countdown — **takes the `ScreenDock` over from `LogConsole`, never both**. Stacked on compact; at `md+` the handoff's `#restDock`: `sticky bottom-0`, full-bleed, **one row**, 30px clock, no presets — via `md:contents`, so it stays one markup tree. Skip must stay exactly `Skip` (`logger-depth` matches `/^skip$/i`) |
| `WorkoutVictorySheet.tsx` | Post-workout summary sheet |
| `PlateCalculatorSheet.tsx` | Plate math sheet |
| `LiveHeartRate.tsx` | Optional Web Bluetooth BPM strip (wearables flag) |

## Related

| Layer | Path |
|-------|------|
| Page | `ActiveWorkoutPage.tsx` |
| Store | `workoutStore.ts` |
| Lib | `activeWorkoutHelpers.ts`, `restTimer.ts`, `plateCalculator.ts`, `workoutPr.ts`, `setKind.ts` |
