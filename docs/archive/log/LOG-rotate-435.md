## 2026-08-04 — NL meal fraction qty parse (`.420`)

NL meal parse treated the **denominator** of a fraction as the count: `1/2 cup rice` became 2× rice (~4× calories). `findQtyBefore` now matches `N/D` (+ optional portion word) before whole-number portion paths, and digit matchers refuse a preceding `/`. Confidence stays `medium` for portion-scaled singles — never invented `high`. Tests: half-cup rice, half chicken, 3/4 cup oats; regressions on `2 cups` / `12 eggs` / scoops.
