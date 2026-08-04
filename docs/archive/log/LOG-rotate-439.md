## 2026-08-04 — NL word-half qty (Fuel accuracy) (`.424`)

`half a cup` / `half cup` / `one and a half cups` / `a cup and a half` / bare `half chicken` parse as true half/1.5 qty. Removed `half` from GLOBAL_PORTION (was double-scaling word qty to ~0.65×). Matcher order: and-a-half before bare half-portion so trailing `half cups` cannot steal. `small` plate-size scale unchanged.

Mutants: put half-portion before and-a-half → `one and a half cups` = 0.5 → red; restore GLOBAL half → double scale → red.
