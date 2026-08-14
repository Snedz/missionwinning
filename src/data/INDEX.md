# src/data/

> One concern: Static catalogs and content — exercises, programs, recipes, guidebook, mind/mobility.

## Read order

1. File for your content type (table below)
2. `exerciseEnrichment.ts` — tags/alternatives added to base exercises

## Content map

| File(s) | Content |
|---------|---------|
| `exercises.ts` | Base catalog; extended/volume-2 via `ensureFullExerciseCatalog()` |
| `exercisesExtended.ts`, `exercisesVolume2.ts` | Additional exercises (dynamic import from `exercises.ts`) |
| `exerciseEnrichment.ts` | Tags, levels, alternatives |
| `programTemplates.ts` | Builder program templates (lazy-loaded on `/builder`) |
| `starterPrograms.ts` | Free starter programs |
| `premiumProgramTemplates.ts` | Premium programs (server-gated) |
| `mobilityFlows.ts` | Free mobility flows (UI runner — not loggable sets) |
| `premiumMobilityFlows.ts` | Premium mobility (server-only, clock-honest; 56 floor) |
| `guidedMindSessions.ts` | Free mind sessions |
| `premiumMindSessions.ts` | Premium mind |
| `recipes/freeRecipes.ts`, `recipes/premiumRecipes.ts` | Nutrition recipes (`premiumRecipes` dynamic import on API route) |
| `recipes/PLAN.md` | **Frozen** Super Bundle Fuel recipe + protein-first copy plan (`.700`) |
| `guidebook/chapters.ts`, `guidebook/premiumChapters.ts` | Guidebook content (+ optional `heroImage` / `figure`) |
| `guidebook/types.ts` | Guide chapter/section types incl. `GuideFigure` |
| `guidebook/magazineMeta.ts` | Beyond the Basics magazine front matter + PDF path |
| `learnVsPages.ts` | Public Learn vs-pages (Strong / Hevy / Fitbod) — AEO explanation, not magazine chapters |
| `learnPaths.ts`, `learnLessonEnhancements.ts` | Learn pillar paths |
| `presidentialFitnessStandards.json` | PFT scoring standards |
| `pftWeekOneChallenge.ts` | PFT challenge data |

## Coach note

Mission Coach **recovery days** use loggable exercise ids from the exercise catalog — not `mobilityFlows.ts` steps (see `src/lib/coach/INDEX.md`).

## Related (not here)

- Exercise types: `src/types/index.ts`
- Premium API serving: `app/api/premium/`
