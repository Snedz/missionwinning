## 2026-08-13 — Unilateral L/R on the set log (`.755`)

Optional **L / R / Alt** on a unilateral exercise (lunge, DB row, split squat)
without splitting the lift into two movements or two social posts. Investigation
found no laterality field on `Exercise`, `LoggedSet`, mw-core, or Android —
`SetKind` stays warmup/failure/drop; a superset pair is not left/right.

**Ship:** `side?: SetSide` on the logged set; `isUnilateralExercise` detector;
chips on compact `LogConsole` + desktop footer; quiet badge on the same table
row. Default unset. After L, suggest R on the next planned set of the same
exercise. Bilateral strips stray `side` on complete. Offline, no account.
Speech never owns this.

Label `.755` (onto master `.754`). Originally reserved `.724`; landed as `.755` past master `.754`.
Excellence-Override below.

Excellence-Override: unilateral L/R

Rotated LOG oldest → [docs/archive/log/LOG-rotate-696-for-755.md](LOG-rotate-696-for-755.md).
