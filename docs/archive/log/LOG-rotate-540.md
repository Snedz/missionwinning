# Rotated for .540

## 2026-08-05 — Kaizen: trend axis labels via formatLocalDateKey (`.525`)

`resolveTrendSeries` labelFor uses shared formatLocalDateKey — no parallel UTC-midnight date parse for chart axes.

Mutants: labelFor reintroduces new Date(y, m-1, d) → red.

