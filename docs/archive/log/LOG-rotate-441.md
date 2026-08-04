## 2026-08-04 — Today trainReady one definition (`.426`)

`isTodayTrainReady` is the one home for Just Go train-ready gates. Lean, full dashboard Just Go meta, and `runTodayPrimaryAction` all call it — lean no longer omits commissioned. Wiring guard discovers the three call sites.

Mutants: restore inline `href === '/active' || !!startWorkout` in a shell → wiring red.
