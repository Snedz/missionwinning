# Rotated for .608

## 2026-08-07 — fix: Lean Today evening continuity + Fuel depth subtitle (`.592`)

HomeTodayLean passes localHour (parity with dashboard). Fuel subtitle shows free/premium recipe inventory counts.

Mutants: HomeTodayLean without localHour → red; NutritionPage without fuelSubtitleDepth → red.
