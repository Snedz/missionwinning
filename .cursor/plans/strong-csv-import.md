# Workout CSV → local History

## Goal

A guest on History can pick one workout CSV and merge those sessions into on-device History. No account. No network. Confirm before write. Empty invents nothing.

Account → Import workout CSV already parses this file and writes the same local store. This plan adds the History door so week-1 is not blank when the only file in hand is a session export. The diary door (`.1013`) stays the round-trip for a file this app saved.

## Dialect

One dialect first: **session export** (`set-table-b` in `src/lib/workout/importCsv.ts`). Header match is by column name, not column order and not the filename.

| CSV column | Lands on |
|---|---|
| Date | `startedAt` / `completedAt` (local fields; `YYYY-MM-DD HH:mm:ss` or a parseable local stamp). Date-only `YYYY-MM-DD` is local noon, never UTC midnight. |
| Workout Name | `workoutName`. Rows that share name + date are one session. |
| Duration | `durationSeconds`. Shapes `1h 5m`, `55m`, `32s`. |
| Exercise Name | Library id when the name matches loosely (below). Otherwise a slug. The sets stay either way. |
| Set Order | Set order within the exercise (1-based in the file). |
| Weight + Weight Unit | Display weight. `kg` / `lbs` on the row win. A missing unit uses the device preference. |
| Reps | `reps`. Blank reps skip the row and increment `skippedRows`. A real `0` stays. |
| RPE | Bucket `easy` / `med` / `hard` via the existing number map. The 1–10 figure is not stored. |
| Notes | First non-empty note on that exercise. |

**Same adapter, second header (trivial):** set-table export (`set-table-a`). Columns `title`, `start_time`, `end_time`, `exercise_title`, `set_index`, `set_type`, `weight_kg` or `weight_lbs`, `reps`, `rpe`, `exercise_notes`. `set_type` maps warmup / drop / failure. This door accepts it because `parseWorkoutCsv` already does. No second parser.

## Name → Library id

`exerciseIdForName` reads the live `EXERCISES` list (house names win; a later catalog splice is visible when its length changes). It does not edit seed files.

1. Exact name, case-insensitive, punctuation and parenthetical equipment ignored: `Bench Press (Barbell)` → `bench-press`.
2. Unique singular/plural: `Squat (Barbell)` → `squats` because the catalog name is `Squats` and no other name singularizes to `squat`. `Front Squat` stays `front-squat` (exact), not `squats`.
3. Otherwise a slug (`Zercher Carry` → `zercher-carry`). Sets are kept. The preview says how many names missed the library.

Sibling library absorb (PR #998) owns exercise seed files. This plan does not touch `src/data/exercises*.ts` or `src/data/free-exercise-db/`.

## Files

| File | Role |
|---|---|
| `.cursor/plans/strong-csv-import.md` | This plan |
| `src/lib/workout/importCsv.ts` | Loose name match; session-export `Notes`; set-table `exercise_notes` |
| `src/lib/history/importSessionCsv.ts` | Pure preview + confirm merge. Only `set-table-b` and `set-table-a`. |
| `src/lib/history/fixtures/session-export-sample.csv` | Session-export fixture |
| `src/lib/history/fixtures/set-export-sample.csv` | Set-table fixture |
| `src/lib/history/importSessionCsv.test.ts` | Parse, match, skip, merge, refuse |
| `src/lib/history/importSessionCsvSurface.test.ts` | History door, no login wall, Today stays one Start |
| `src/components/history/HistorySessionCsvImport.tsx` | File picker, preview, confirm |
| `src/page-components/HistoryPage.tsx` | Button + dialog on both empty and list |
| `src/i18n/historyLocales.ts` | English strings (other packs spread `en`) |

Write path: confirm calls `mergeImportedLogs` then the existing `applyImportedHistory` store action (local persist + outbox). Signed-out cloud push is a no-op. Preview never writes.

## Refuse

- No AGPL paste from openGym or wger. No GymVisual media.
- No private-API scrape. File picker only.
- No `PRIVATE_MODE` flip. No `paymentUrl`. No tip-promote.
- No Program 67 / kitchen paths.
- No edit of exercise seed files.
- This door does not import the native MW CSV or a program-log dump (Account already does). It does not replace the diary file door.
- No export round-trip in this change (follow-up).
- No Coach plan generated from the import.

## Known gaps

- Session export has no set-kind column. Warmup / drop / failure land as normal work. The set-table export does map `set_type`.
- RPE becomes `easy` / `med` / `hard`, not the 1–10 number.
- `Workout Notes`, distance, and seconds columns are ignored. A row with empty reps (typical cardio) is skipped and counted.
- Per-set notes collapse to the first non-empty note on that exercise.
- `Barbell Bench Press` without a parenthetical does not strip a leading equipment word (that would call a dumbbell press a barbell `bench-press`). It stays a slug unless the full name matches.
- Re-import identity is completed-at minute + workout name + set count. A native session with that same key wins; the file does not clobber it.

## Done when

- Draft PR.
- Guest History → Import workout CSV → confirm → those sessions are in the list.
- Fixture tests cover one session export, one set-table export, a skipped row, a library hit, a library miss, and a second import that adds nothing.
- Diary import still refuses this header (its own door).
