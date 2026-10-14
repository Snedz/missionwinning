Rotated out of LOG.md on 2026-10-14 so the live log stays at 15 entries after `.1134`
(coach seats: Groq, then any OpenAI-compatible host, then OpenRouter `:free`).

## 2026-09-24 — Workout CSV into local History (`.1112`)

History → Import workout CSV
reads a session export into
the on-device diary. Confirm
merges. No account. Preview
does not write. A second drop
of the same file adds nothing.
An existing session with the
same minute, name, and set
count wins.

Columns: Date, Workout Name,
Duration, Exercise Name, Set
Order, Weight, Weight Unit,
Reps, RPE, Notes. A set-table
export (`exercise_title`,
`set_index`, `set_type`,
`exercise_notes`) uses the
same parser. Names match the
library when exact or a unique
singular/plural (`Squat` →
`squats`, `Front Squat` stays
`front-squat`). A miss stays a
slug and the sets stay. Blank
reps or a blank name is
skipped and counted.

Gaps: session export has no
set kind (all normal work).
RPE is the easy/med/hard
bucket, not 1–10. Workout
notes, distance, and seconds
are ignored. Per-set notes
collapse to the first note on
that exercise. A leading
equipment word is not stripped.
Diary-file import is unchanged.
Native and program-log CSV
stay on Account. No exercise
seed edit (Library catalog,
#998, license and NOTICE
unchanged).

**Mutants killed:** singular
match forced off (`Squat`
stays `squat`); set-table
door rejected; confirm
called on an empty parse
still writing; same-file
reimport appending.

`[skip vercel]`. No
tip-promote. Live www stays
`.697`. PRIVATE_MODE stays.

Label `2026.07-unified.1112`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1097-for-1112.md](docs/archive/log/LOG-rotate-1097-for-1112.md) (`.1097`). `.1096` was already rotated by `.1111`.
