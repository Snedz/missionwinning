# src/hooks/

> Client-side React hooks — orchestrate lib, store, and API fetches.

## Hook map

| Hook | Consumers | Depends on |
|------|-----------|------------|
| `useCoachPlan.ts` | `CoachPage`, coach cards | `src/lib/coach/*`, localStorage |
| `useFuelPlan.ts` | `FuelMealPlanCard`, Nutrition | `src/lib/fuelCoach/*`, `/api/premium/recipes` |
| `useDailyCoachInsight.ts` | `CoachInsightCard`, Today | `/api/coach/daily-insight`, `score.ts` |
| `useMissionJourney.ts` | Journey components, guards | `missionJourney.ts` |
| `useJourneySync.ts` | `AppLayout`, Profile | `journeySync.ts`, Supabase |
| `usePremium.ts` | Gated UI, Bundle | `/api/premium/status` |
| `useUnits.ts` | Workout, calculators | `units.ts`, localStorage |
| `useUiMode.ts` | Layout, simplified UI | `uiMode.ts` |
| `useTodayLayout.ts` | Today sections | `missionJourney.ts` phase flags |
| `use-toast.ts` | shadcn toast primitive | UI only |
| `useScrollReveal.ts` | marketing `Reveal` | IntersectionObserver |

## Conventions

- Hooks may call `fetch` to API routes — never embed premium secrets.
- Prefer reading pure logic from `src/lib/`; keep hooks thin.
- No hooks in `src/lib/` — lib stays framework-agnostic.

## Related

- [../store/INDEX.md](../store/INDEX.md) — active workout state
- [../lib/coach/INDEX.md](../lib/coach/INDEX.md) — coach engine
- [../page-components/INDEX.md](../page-components/INDEX.md) — pages
