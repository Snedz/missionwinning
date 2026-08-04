## 2026-08-04 — NL quarter unicode + couple qty (`.438`)

Add `¼` to the shared vulgar-fraction map; accept hyphenated `three-quarters`; `a couple of eggs` / `couple eggs` → qty 2. One `VULGAR_FRAC` map (no second private copy).

Mutants: drop ¼ from map → full cup → red; drop couple matcher → 1 egg → red.
