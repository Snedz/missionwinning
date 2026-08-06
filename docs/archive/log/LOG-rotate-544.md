# Rotated for .544

## 2026-08-05 — Kaizen: Today header date via formatLocalDateKey (`.529`)

Lean + full Today shells label the day with formatLocalDateKey(localDateKey()) — same UTC-safe path as History.

Mutants: new Date().toLocaleDateString on either shell → red.

