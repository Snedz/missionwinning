# src/lib/fuelCoach/

> One concern: Fuel Coach — deterministic adaptive meal plan engine (client-side).

## Read order (engine pipeline)

1. `types.ts` — `FuelPlan`, `FuelPlanDay`, `PlannedMeal`, `FuelContext`, `TrainingLoad`
2. `contextBuilder.ts` — goal, TDEE/macros (`calcHelpers`), training load from workout history
3. `mealSelector.ts` — `pickMealsForDay`, recipe catalog → meal slots
4. `adapt.ts` — `adaptDailyTargets` — heavy/rest day calorie + carb bumps
5. `planEngine.ts` — `generateFuelPlan`, `regenerateFuelPlan`
6. `storage.ts` — `loadFuelPlan`, `saveFuelPlan` (`mw_fuel_plan`)
7. `fuelSync.ts` — cloud push/pull per user id
8. `synergy.ts` — `hasFuelPlanThisWeek`, `todayFuelSynergyBump` for Today chips + Win Score
9. `rng.ts` — re-exports `coach/rng.ts` for deterministic variety

## Tests (colocated)

| File | Covers |
|------|--------|
| `mealSelector.test.ts` | Budget-hitting selection, catalog mapping |
| `adapt.test.ts` | Heavy/rest target adaptation |
| `planEngine.test.ts` | Multi-day plan, determinism, regeneration |

## UI & integration (not in this folder)

| Layer | Path |
|-------|------|
| Hook | `src/hooks/useFuelPlan.ts` |
| Components | `src/components/nutrition/FuelMealPlanCard.tsx`, `FuelLockedPreview.tsx` |
| Page | `src/page-components/NutritionPage.tsx` |
| API | `app/api/premium/fuel-plan/route.ts` |
| Synergy | `src/lib/pillarScoreInputs.ts`, `src/lib/crossPillarCoach.ts` |

## Related

- Macro math: `src/lib/calcHelpers.ts`, `src/lib/macroTargets.ts`
- Recipes: `src/data/recipes/freeRecipes.ts`, `premiumRecipes.ts`
- Training Coach pattern: [../coach/INDEX.md](../coach/INDEX.md)
