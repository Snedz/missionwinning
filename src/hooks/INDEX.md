# src/hooks/

> Client-side React hooks — orchestrate lib, store, and API fetches.

## Hook map

| Hook | Consumers | Depends on |
|------|-----------|------------|
| `useCoachPlan.ts` | `CoachPage`, coach cards | `src/lib/coach/*`, localStorage |
| `usePlannedMissOffer.ts` | Today shells → `JourneyHero` | `plannedMiss.ts` + `loadPlan` only — never `useCoachPlan` (that auto-generates) |
| `useFuelPlan.ts` | `FuelMealPlanCard`, Nutrition | `src/lib/fuelCoach/*`, `/api/premium/recipes` |
| `useDailyCoachInsight.ts` | `CoachInsightCard`, Today | `/api/coach/daily-insight`, `score.ts` |
| `useMissionJourney.ts` | Journey components, guards | `missionJourney.ts` |
| `useJourneySync.ts` | `AppLayout`, Profile | `journeySync.ts`, Supabase. `SIGNED_OUT` wipes only after `markExplicitSignOut` (`.941`). `SIGNED_IN` adopts guest history and calls `syncCurrentHistoryToCloud` — no Force Sync tap (`.949`). Also `reconcileOpenSession` on sign-in / visible (`.958`) |
| `useOutboxDrain.ts` | `JourneySyncInner` (idle) | `lib/sync/outbox.ts` — drains on mount / online / visible; registers `week.logged` |
| `usePremium.ts` | Gated UI, Bundle | `/api/premium/status` |
| `useUnits.ts` | Workout, calculators | `units.ts`, localStorage |
| `useBarWeight.ts` | Train set-row plate line | `plateCalculator.ts`, `mw_bar_weight` (`.948`) |
| `useUiMode.ts` | Layout, simplified UI | `uiMode.ts` |
| `useTodayLayout.ts` | Today sections | `missionJourney.ts` phase flags |
| `use-toast.ts` | shadcn toast primitive | UI only |
| `useScrollReveal.ts` | marketing `Reveal` | IntersectionObserver |
| `useFileUploadQueue.ts` | Track import, Profile backup | per-file progress/retry queue |
| `useIsCompact.ts` | `ScreenDock`, `JourneyHero` | `matchMedia('(max-width: 767px)')` — **the line between the two designs**, see below |
| `useVisualViewportKeyboardOverlap.ts` | `AppLayout` | `visualViewport` overlap — lifts the logger dock above the keys |
| `useHonorSavedRoutine.ts` | Victory / Builder / History save door | `honorSavedRoutine.ts` + store — confirm before write (`.960`) |
| `useActiveWorkoutPulse.ts` | Lean Today Resume, MobileNav | First-paints from flag / persist — not a forced false (`.963`) |

## Conventions

- Hooks may call `fetch` to API routes — never embed premium secrets.
- Prefer reading pure logic from `src/lib/`; keep hooks thin.
- No hooks in `src/lib/` — lib stays framework-agnostic.

## Two designs, one boundary

The signed-in app is **two designs, not one responsive design**: the desktop app
(handoff 2) and the mobile app (handoff 3). `useIsCompact()` is the only line
between them, and it reuses the one the shell already had — Tailwind's `md`
(768px), where `Sidebar` appears and `MobileNav` hides.

**Branch on it; never render both and hide one with `md:hidden`.** Two copies in
the DOM is how `first-90`'s `.primary-action` count breaks — it counts hidden
nodes too.

## Related

- [../store/INDEX.md](../store/INDEX.md) — active workout state
- [../lib/coach/INDEX.md](../lib/coach/INDEX.md) — coach engine
- [../page-components/INDEX.md](../page-components/INDEX.md) — pages
