## 2026-08-04 — ActiveExerciseList peel (`.439`)

Exercise-card map peels into `ActiveExerciseList`. Page mounts the list; swap candidates, table controls, and open-idx stay with the cards. Page ~727→686. Wiring guards follow list (swap/isOpenIdx) + strip (readiness/volume-trim).

Mutants: leave `ActiveExerciseCard` map on the page → wiring red; drop `resolveSwapCandidatesWhenOpen` from list → wiring red.
