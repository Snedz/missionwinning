# Locale JSON (G2 extract)

English strings exported for translator handoff. Runtime still uses `src/i18n/*Locales.ts` — merge translated JSON back in a follow-up or load via i18next HTTP backend post-beta.

## Regenerate

```bash
node scripts/export-locale-json.mjs
```

## Files

| File | Source module |
|------|----------------|
| `en/welcome.json` | `welcomeLocales.ts` |

Add `en/today.json`, `es/welcome.json`, etc. by extending `scripts/export-locale-json.mjs`.
