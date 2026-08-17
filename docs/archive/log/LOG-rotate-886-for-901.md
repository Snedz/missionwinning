# Rotated from LOG.md for `.901`

## 2026-08-16 — Victory prints reps, not 0 kg, for bodyweight (`.886`)

A Just Go chest session (push-ups) printed Volume 0 kg. Load×reps is 0
when the bar is empty, so the first-session receipt said nothing
happened. The helper already existed (`formatWorkoutVolumeDisplay`).
Victory and the share card were still printing raw tonnage.

**Ship:** `summarizeWorkoutVictory` carries `workingReps` via
`sumWorkingReps`. Victory cell + share card + share text use the
existing helper. Warmups stay out. Loaded volume still prints kg.

Vision U1 R1. `#727` invents a second helper — left unmerged.

Label `.886` (stacked on `.885`).

No `PRIVATE_MODE` flip.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-868-for-886.md](docs/archive/log/LOG-rotate-868-for-886.md).
