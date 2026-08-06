# Rotated for .542

## 2026-08-05 — Kaizen: mergeTodayIntoNutritionLog + fuel date labels (`.527`)

Pure `mergeTodayIntoNutritionLog` for Nutrition single-writer. Fuel week/past/weight labels use `formatLocalDateKey`.

Mutants: NutritionPage re-inlines older/todayRows merge → red; Fuel* T12:00:00 toLocaleDateString → red.

