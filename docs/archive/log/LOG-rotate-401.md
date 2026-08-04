## 2026-08-04 — Active isActiveSetCell extract (`.386`)

Kaizen Loop 28 L2. `isActiveSetCell` owns next-set cell identity so ActiveExerciseCard does not inline the exIdx/setIdx pair compare. Wiring guard on the card. Cap 16.
