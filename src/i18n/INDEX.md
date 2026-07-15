# src/i18n/

> One concern: Runtime translation strings merged into i18next `common` namespace.

## Read order

1. `src/i18n.ts` — **bootstrap** minimal EN + detector (first paint)
2. `bootstrapResources.ts` — lean keys for nav/Today lean
3. `hydrateResources.ts` — dynamic-imports all `*Locales.ts` after idle
4. The `*Locales.ts` file for your feature (table below)
5. `public/locales/README.md` — optional HTTP JSON overrides

## Locale files (`*Locales.ts`)

| File | Namespace content |
|------|-------------------|
| `welcomeLocales.ts` | I-Day / welcome flow |
| `todayLocales.ts` | Today dashboard |
| `coachLocales.ts` | Mission Coach |
| `navLocales.ts` | Navigation labels |
| `bundleLocales.ts` | Super Bundle |
| `fuelLocales.ts` | Nutrition |
| `moveLocales.ts` | Move pillar |
| `mindLocales.ts` | Mind pillar |
| `learnLocales.ts` | Learn pillar |
| `guidebookLocales.ts` | Guidebook |
| `builderLocales.ts` | Workout builder |
| `historyLocales.ts` | History |
| `trackLocales.ts` | Track |
| `benchmarksLocales.ts` | Benchmarks |
| `activeWorkoutLocales.ts` | Active workout logger |
| `assessmentsLocales.ts` | PAR-Q |
| `calculatorsLocales.ts` | Calculators |
| `fitnessTestLocales.ts` | PFT |
| `programsLocales.ts` | Programs |
| `libraryLocales.ts` | Exercise library |
| `feedbackLocales.ts` | Feedback |
| `infoLocales.ts` | About, vision, coaching info |
| `leaderboardLocales.ts` | Leaderboard |
| `bundleLocales.ts` | Bundle marketing |

## Pattern

Each file exports:
- `mergeXStrings(target, lang)` — merged in `i18n.ts` loop
- English defaults inline; other langs spread `...en` + overrides

## HTTP override (optional)

`public/locales/{lang}/*.json` — used when `NEXT_PUBLIC_LOCALE_HTTP` is enabled. Export from TS via `npm run export-locales`.

## Related (not here)

- `public/locales/README.md` — JSON export workflow

## Do not open

- `src/locales/` — **deprecated empty dirs**; see `src/locales/README.md`
