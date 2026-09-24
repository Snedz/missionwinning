# History year heatmap

## Claim

History shows a Monday-first year of days that have logged sessions, above the session list. A blank day is nothing logged. It is not a missed day.

## Data

- Source: `workoutHistory` on the workout store (`workout-tracker-storage` via `browserStorage` / localStorage). Cloud merge, when signed in, writes the same array through `loadFromCloud`. There is no second diary and no IndexedDB session log.
- Bucketing: `trainedDayKeys` in `src/lib/history/monthGrid.ts` plus `localDateKeyFromIso`. Tombstones (`deletedAt`) drop out. Unparseable `completedAt` drops out. Calendar dates use local fields. `toISOString()` is not a date key.
- Window: 53 Monday-first weeks ending the week of today (injected clock). Sessions outside that window are not cells and are not in the caption totals.
- Level: 0 none, 1 one session, 2 two, 3 three, 4 four or more. Same-day sessions add. Fill height carries the count so color is not the only mark.

## Placement

- `HistoryYearHeatmap` mounts on `/history` after persist hydrate, above the empty invitation and above the session list.
- The week strip scrolls to the current week on mount so a phone shows the days just logged.
- Import stays the existing confirm dialog. The grid is not inside `HistoryImport`.
- The month calendar, charts, and journal stay in Show all.

## Out of scope

- Library / `src/data/free-exercise-db/`
- Strong CSV import and the import dialog body
- `PRIVATE_MODE`, payments, tip-promote, program-67
- Copying aceberg/ExerciseDiary. The grid is ours.

## Accept

- `src/lib/history/yearHeatmap.test.ts` buckets two sessions onto one local day, drops a tomb and a junk timestamp, ignores a day outside the window, and stays on the local day in `Pacific/Kiritimati`.
- `/history` shows `data-testid="history-year-heatmap"` above `session-history-list`.
