# Locale JSON (G2 extract)

English and partial translations exported for translator handoff. Runtime uses inline `src/i18n/*Locales.ts` first; client optionally merges `/locales/{lang}/common.json` when `NEXT_PUBLIC_LOCALE_HTTP` is not `false`.

## Regenerate

```bash
npm run export-locales
```

Writes **48 files** per run: 7 namespaces + `common.json` (merged) × 6 languages (`en`, `es`, `zh`, `id`, `th`, `ar`).

## HTTP overrides (post-beta translators)

1. Edit JSON under `public/locales/{lang}/` (or deploy updated files only).
2. Users get merged strings on next load via `LocaleHttpSync` — no app redeploy required for copy-only changes.

Disable: `NEXT_PUBLIC_LOCALE_HTTP=false`

## Files

| File | Source |
|------|--------|
| `*/welcome.json` | `welcomeLocales.ts` |
| `*/today.json` | `todayLocales.ts` |
| `*/fuel.json` | `fuelLocales.ts` |
| `*/nav.json` | `navLocales.ts` |
| `*/bundle.json` | `bundleLocales.ts` |
| `*/history.json` | `historyLocales.ts` |
| `*/active-workout.json` | `activeWorkoutLocales.ts` |
| `*/common.json` | All of the above merged |

Manifest: `src/lib/exportLocales.ts` · loader: `src/lib/localeHttpLoader.ts`
