# LOG rotate — `.286` (2026-08-03)

Rotated from [LOG.md](../../../LOG.md) when `.301` shipped.

---

## 2026-08-03 — Re-entry dose actually trims the session (`.286`)

`doseScale` from `computeReentry` now scales Just Go / plan starts via
`scaleExercisesByDose` on the Today primary CTA. Re-entry card copy names the
real percent (e.g. 70% / 50%) so the promise matches the workout.
