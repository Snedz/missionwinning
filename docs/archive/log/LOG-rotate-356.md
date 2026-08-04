## 2026-08-04 — Swap candidates when-open extract (`.341`)

Kaizen Loop 13 W2. `resolveSwapCandidatesWhenOpen` owns the open-idx gate around `rankSwapCandidates` (wiring guard). Active map no longer inlines the empty-array ternary.
