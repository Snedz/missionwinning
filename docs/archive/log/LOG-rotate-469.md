## 2026-08-04 — Typecheck green for Kaizen Night merge (`.454`)

CI typecheck: `units: 'metric'` + NextSetTarget `reason` on next-target mocks; `MuscleGroup[]` on Active inline/sheets add callbacks. Unblocks merge of #254.

Mutants: units stay `'kg'` → tsc red; suggest mock omit reason → tsc red.
