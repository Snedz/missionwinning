# Locale JSON (G2 extract)

English and partial translations exported for translator handoff. Runtime still uses inline `src/i18n/*Locales.ts` — merge translated JSON back in a follow-up or load via i18next HTTP backend post-beta.

## Regenerate

```bash
npm run export-locales
```

Writes **42 files** (7 namespaces × 6 languages): `en`, `es`, `zh`, `id`, `th`, `ar`.

## Files

| File | Source module |
|------|----------------|
| `*/welcome.json` | `welcomeLocales.ts` |
| `*/today.json` | `todayLocales.ts` |
| `*/fuel.json` | `fuelLocales.ts` |
| `*/nav.json` | `navLocales.ts` |
| `*/bundle.json` | `bundleLocales.ts` |
| `*/history.json` | `historyLocales.ts` |
| `*/active-workout.json` | `activeWorkoutLocales.ts` |

Manifest logic: `src/lib/exportLocales.ts` · script: `scripts/export-locale-json.ts`.
