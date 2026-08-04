## 2026-08-04 — Public craft-index exercise library (`.457`)

`/exercises` cards match the in-app craft index (number, pattern label, form-diagram marker, cues). Public detail puts form media first, then coach language / setup / execute. Related mesh prefers same movement pattern via `relatedExercisesByPattern`.

Mutants: relatedByPattern on deadlift with always-null pattern → falls back to muscle list still non-empty; drop pattern filter from public cards → visual regress (manual).
