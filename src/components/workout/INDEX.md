# src/components/workout/

> Active workout logger UI pieces.

## Components

| File | Purpose |
|------|---------|
| `ActiveEmptyState.tsx` | No-session shell — start quick workout |
| `ActiveSessionChrome.tsx` | Session bar — name, compact elapsed · sets, Finish. Session title is a house title. Session clock cite is house leftover. Session clock size is house leftover. Finish is house-btn, not filled. Session more is a house leftover (ghost more + house-card overflow). Elapsed is a pause/resume control (`.1001`). No Live session eyebrow. Plates + coach tip + Cue me in overflow. Hold-to-confirm to take the other device's session when decide is `needs-confirm` (`.958`) |
| `ActiveSessionDock.tsx` | One `ScreenDock` for rest only. Set entry is `SetLogTable`; `resolveActiveDockMode` no longer emits `console` |
| `ActiveWorkoutSheets.tsx` | Check-in · hard-session warning · form · add · plates · victory overlay cluster (`.450`) |
| `SessionCheckInSheet.tsx` | Pre-session readiness. Check-in lead cite is house leftover (`house-lede` / `--house-muted`). Check-in scale value cite is house leftover (`house-lede` / `--house-muted`). Check-in scale hints is house leftover (`house-lede` / `--house-muted`). Check-in confirm is house leftover (Save house-btn, Not now ghost). Check-in scale is house leftover. Never gates Log set. |
| `ActiveExerciseList.tsx` | Maps session exercises → `ActiveExerciseCard` (swap candidates, table controls, open-idx, reorder `.998`). Page mounts this instead of inlining the map (`.439`) |
| `ActiveExerciseCard.tsx` | Dense exercise block — Info → form guide; overflow for Note/Swap/Skip/SS/Ask/Remove/Hide from library. Exercise card is house leftover. Skip / swap are **this session** (`.959`). Hide from library does not remove the live card (`.1004`). Open lift shows short written cues (`.973`). Tap the name for prior sessions of that lift (`.993`). Work vs warmup rest on the open lift (`.995`). Their note + pin on the open lift (`.996`). Drag the name row to reorder (`.998`). Quiet diary PR on the live set (`.999`). Group of two or more is one round (`.980` / concern `.979`). Free warmup batch from the working weight (`.984` / stamp `.985`). |
| `ActiveExerciseHeader.tsx` | Title, menus, next line, e1RM. Name opens this-movement history (`.993`). Grip reorders the live list (`.998`). Exercise head is house leftover. Form guide is house-btn ghost. Form guide confirm is house-btn, not filled. Form guide body is house leftover. Swap is house-btn ghost. Skip this exercise is house-btn hold. Exercise more is house leftover (ghost more + house-card overflow). Set options is house leftover (ghost more + house-card overflow). Reorder handle is house leftover (ghost house-btn grip and arrows). |
| `ExerciseReorderHandle.tsx` | Drag handle + up/down on the name row (`.998`). Tap the name still opens history. Reorder handle is house leftover (ghost house-btn grip and arrows). |
| `MovementHistorySheet.tsx` | Prior sessions of the open lift — their diary. Empty invents nothing. Not a chart (`.993`). Close is house-btn; rows are house-movement-row. |
| `InSetCueList.tsx` | Short setup / execute on the open live exercise. Optional still. Hide never blocks Log set (`.973`). In-set cue line is house leftover. In-set cue line size is house leftover. In-set cue still is house leftover. In-set cue mark is house leftover. Quiet link to Learn when they want more than a rack card (`.978`) |
| `SessionSwapSheet.tsx` | This-session swap door — garage stand-ins + another movement; confirm is house-btn, not filled (`.959`). Portaled overlay root carries `mw-house`. |
| `GarageSwapList.tsx` | Short garage stand-ins for Train swap + Coach line. Garage swap is house leftover (ghost house-btn, selected `#eee`). Swap garage lead cite is house leftover (`house-lede` / `--house-muted`). |
| `SetLogTable.tsx` | Set list on **every** surface — Set · Prev · load · Reps · Log. Open row honors type (`.994`): weight · BW vest · time · assist. Empty / unknown stays kg × reps. Open empty load is blank, not 0 (`.1048`); store stays 0; `SetRowLoadField` keeps a local draft so `0.` / `2.5` stay typeable. Completed empty load is BW (`.1025`). Prev is the row anchor. Prev cite is house leftover (`--house-muted`). Set row hairline is house leftover (`--house-line`). Upcoming set row is house leftover (`--house-muted`). Kind chip row is house leftover (`--house-muted`). Set table size is house leftover (14px, not `text-sm`). ≥44px inputs. One house leftover `Log set` (`--house-press`). Log set size is house leftover (12px on the set table, not `text-xs`; LogConsole stays 19px). Log set weight is house leftover (700 on the set table, not `font-extrabold`; LogConsole stays extrabold). Log set leading is house leftover (1.25 on the set table, not `leading-tight`). Last-set ghost is house leftover (house-btn ghost, not filled). Warmup toggle is house leftover (ghost house-btn, hover is house-chip, not muted). Optional free W / D / F chips per set (`.966`). Optional % of a known 1-rep max (`.981`). After-complete cite via `SetLogNextCite`. Incomplete warmup batch rows show planned weight and can be removed (`.984` / stamp `.985`). Optional EMOM / AMRAP on the live row (`.987`). Quiet diary PR after a working set that beats a number they already logged (`.999`). |
| `SetLogNextCite.tsx` | Skippable next-set cite after a completed working set (`.939`). Not a feed. |
| `SetLogPlateLine.tsx` | Skippable both-sides plate breakdown on the live barbell row (`.948`). Editable bar. Never blocks Log set. |
| `SetRpe10Select.tsx` | Optional 1–10 RPE on a completed set (`.967`). Native select. Never required. |
| `SetRirSelect.tsx` | Optional 0–5 RIR on a completed set (`.725`). Native select. Never required. |
| `SetSideSelect.tsx` | Optional L / R / Alt on a completed set (`.1042` History). Native select. Never required. Set side is house-num. Live chips stay on Train (`.724`). |
| `SetTempoField.tsx` | Optional e-p-c tempo on a completed set (`.734` live, `.1043` History). Never required. Live last-used stays on Train. |
| `SetLoadPctField.tsx` | Optional authored % of a known 1-rep max on a finished History set (`.1044`). Empty is valid. Never cites % from kg. Load-% cell is house-num. Live `SetRowPercentField` stays on Train (`.981`). |
| `SetLogAdjacencyStack.tsx` | Unused TARGET-above-PREVIOUS stack — do not remount into Prev (would restyle the table). |
| `SetLogRow.tsx` | Legacy read-only set record (not mounted on Active). Kept for tests of the old compact density. |
| `LogConsole.tsx` | Legacy compact dock entry. Active dock is rest-only; set entry is the table. LogConsole Log set is house leftover press (`--house-press`), not poster-red. |
| `AddExerciseSheet.tsx` | `ExercisePicker` in a sheet with the confirm in the footer. Confirm is house-btn, not filled. Do not rewrite shared ExercisePicker. **Test contract:** keeps the `search exercises` placeholder, `option` rows and `add selected exercise` name — `logger-depth`, `first-90` and `hero-flows` all drive them. Typed catalog miss can name a custom (`.990`). Hidden names stay off the list (`.1004`). Unlimited. Free. Empty invents nothing. |
| `HardSessionWarningSheet.tsx` | Pre-start hard-session warning — Back does not start; never gates Log set. Stop line follows pregnancy flag (`.746` v1). Hard-session lead cite is house leftover (`house-lede` / `--house-muted`). Hard-session not-care cite is house leftover (`house-lede` / `--house-muted`). Hard-session clinician cite is house leftover (`house-lede` / `--house-muted`). Hard-session confirm is house leftover. |
| `RestTimerBar.tsx` | Rest countdown — **takes the `ScreenDock` over from `LogConsole`, never both**. **Ambient running** while `remaining > 0` (`data-rest-running`, ticking `rest-clock`, depleting ambient fill + meters). Skip via `data-testid="rest-skip"`; accent fill only in final ≤10s. Global Default chips stay here — not a second rest home (`.995`). |
| `ExerciseRestStrip.tsx` | Work vs warmup rest on the open lift. Settable. Free. Writes the lift, not Profile (`.995`). |
| `ExerciseNoteField.tsx` | This-session note on the open lift. Last History is not a pin (`.748` / `.996`). |
| `ExercisePinnedNoteField.tsx` | Pinned reminder on the open lift. Returns next session. Not History (`.996`). |
| `SessionJotField.tsx` | Optional private session notes — live Show all + close receipt (`.982`). Empty invents nothing. |
| `ActiveReadinessDeltaStrip.tsx` | Post-check-in readiness delta in Show all (`.432`). Readiness extra is house leftover. Hidden until a real before/after. |
| `WorkoutVictorySheet.tsx` | Post-workout close receipt — stats + lift table + notes + Next on first paint. Feel, share, rewards, debrief in Show all (`.956` / `.982`). Outline **Save as routine** (`.960`). Outline **Start this again** (`.991`) |
| `SaveHonoredRoutineDoor.tsx` | Confirm-gated save / replace for a named routine (`.960`). Not the Today red Start |
| `VictoryFeelStrip.tsx` | Post-session feel 1–5 energy (free ritual) (`.429`) |
| `VictoryBodyDeltaStrip.tsx` | Readiness · strain · recovery signed deltas (`.444`) |
| `VictoryStatsStrip.tsx` | Volume · sets · duration grid (`.447`); BW prints reps via `formatWorkoutVolumeDisplay` (`.886`) |
| `VictoryReceiptStrip.tsx` | Per-lift vs-last receipt on Victory first paint (`.713` / `.944` / `.956`); private Save receipt |
| `VictoryNextActionStrip.tsx` | Primary Next CTA block (`.447`) |
| `PlateCalculatorSheet.tsx` | Plate math sheet |
| `LiveHeartRate.tsx` | Optional Web Bluetooth BPM strip (wearables flag) |

## Related

| Layer | Path |
|-------|------|
| Page | `ActiveWorkoutPage.tsx` |
| Store | `workoutStore.ts` |
| Lib | `activeWorkoutHelpers.ts`, `restTimer.ts`, `plateCalculator.ts`, `workoutPr.ts`, `setKind.ts` |
