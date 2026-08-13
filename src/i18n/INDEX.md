# src/i18n/

> One concern: Runtime translation strings merged into i18next `common` namespace.

## Canonical languages

[`appLangs.ts`](appLangs.ts) exports **`APP_LANGS`** (15 pack / parity / guidebook):  
`en es fr pt ru de it ko ja th vi hi zh id ar`

and **`UI_LANGS`** (40 first-visit picker + html lang). Country policy is not here — [`supportedRegions.ts`](../lib/legal/supportedRegions.ts). Inventory: [docs/LOCALES.md](../../docs/LOCALES.md).

Guide locale select stays `APP_LANGS`. Profile / footer / first-visit picker use `UI_LANGS`.

## Standard (required)

1. Every user-visible string goes in a `*Locales.ts` key for **all** `APP_LANGS`.
2. No raw English in JSX except via `t('key', { defaultValue })` where `defaultValue` is EN and matches the `en` pack.
3. Guidebook long-form uses `guideSection_*` / editorial / `magazine*` keys (built from chapter data in `buildGuidebookLocaleKeys.ts`).
4. After adding keys: fill packs → `npm run export-locales` → `npm run i18n:parity` must pass.
5. First-class wedge overlays: [`firstClassLocales.ts`](firstClassLocales.ts) (hydrate only — keep off the root-layout static path).
6. Brand / proper nouns may stay identical across langs — list them in [`scripts/i18n-allowlist.json`](../scripts/i18n-allowlist.json).
7. Pack overlays live in [`packs/{lang}.json`](packs/) and merge via [`localePacks.ts`](localePacks.ts) (hydrate + export).

## Commands

```bash
npm run i18n:fill          # translate EN placeholders → packs/{lang}.json
npm run i18n:parity        # key-set + non-EN placeholder gate (CI)
npm run export-locales     # TS + packs → public/locales/
```

## Read order

1. `appLangs.ts` — canonical langs
2. `src/i18n.ts` — **bootstrap** minimal EN + detector (first paint)
3. `bootstrapResources.ts` — lean keys for nav/Today lean
4. `hydrateResources.ts` — dynamic-imports all `*Locales.ts` after idle + pack overlays
5. The `*Locales.ts` file for your feature (table below)
6. `packs/{lang}.json` — MT/human overlays for full body parity
7. `public/locales/README.md` — optional HTTP JSON overrides

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
| `learnContentLocales.ts` | Learn path lesson overrides |
| `guidebookLocales.ts` | Guidebook chrome + content keys |
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
| `firstStepsLocales.ts` | First Steps checklist |
| `whatsNewLocales.ts` | What’s New sheet + First Steps restore |
| `infoLocales.ts` | About, vision, coaching info |
| `infoEnFloor.ts` | English floor for legal/info keys (Privacy/Terms first paint — `.653`; ratchet `.682`) |
| `growthLocales.ts` | Referral / invite / share recognition |
| `leaderboardLocales.ts` | Leaderboard |
| `landingLocales.ts` | Marketing landing |
| `betaLocales.ts` | Beta gates |
| `gateLocales.ts` | Private gate |

## Pattern

Each file exports:
- `mergeXStrings(target, lang)` — merged in hydrate loop
- English defaults inline; other langs spread `...en` + overrides
- Pack JSON overlays apply last for remaining placeholders

## HTTP override (optional)

`public/locales/{lang}/*.json` — used when `NEXT_PUBLIC_LOCALE_HTTP` is enabled. Export from TS via `npm run export-locales`.

## Related (not here)

- `public/locales/README.md` — JSON export workflow
- `scripts/i18n-parity.ts`, `scripts/i18n-fill-missing.ts`

## Do not open

- `src/locales/` — **deprecated empty dirs**; see `src/locales/README.md`
