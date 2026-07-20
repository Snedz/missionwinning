# Locale JSON export

English plus pack overlays for all **`APP_LANGS`** (15). Runtime uses inline `src/i18n/*Locales.ts` + [`packs/{lang}.json`](../src/i18n/packs/); client optionally merges `/locales/{lang}/common.json` when `NEXT_PUBLIC_LOCALE_HTTP` is not `false`.

## Regenerate

```bash
npm run i18n:fill       # fill packs for placeholders
npm run i18n:parity     # must pass
npm run export-locales  # write public/locales/
```

Writes namespace JSON + `common.json` for each of the 15 `APP_LANGS`.

## HTTP overrides (post-beta translators)

1. Edit JSON under `public/locales/{lang}/` (or deploy updated files only).
2. Prefer updating `src/i18n/packs/{lang}.json` or `*Locales.ts` as source of truth, then re-export.
3. Users get merged strings on next load via `LocaleHttpSync` when HTTP overrides are enabled.

Disable: `NEXT_PUBLIC_LOCALE_HTTP=false`

## Standard

See [`src/i18n/INDEX.md`](../src/i18n/INDEX.md) — every user-visible string for all `APP_LANGS`.
