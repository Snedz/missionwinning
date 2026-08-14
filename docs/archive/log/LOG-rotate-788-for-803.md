# Rotated from LOG.md when `.803` landed

## 2026-08-14 — Mission Score leftover copy (`.788`)

The product is Mission Score. Locale values, guidebook bodies, and a
few `defaultValue` fallbacks still said “Win Score”. Keys and
`winScoreSeen` stay — that is a field, not a label.

**Ship:** `src/i18n/*Locales.ts` + packs + `export-locales`. Guidebook
and leaderboard strings. Guard walks `src/` and `public/locales` so the
next leftover cannot hide behind a file list. No `PRIVATE_MODE` flip.

Label `.788` (onto master `.787`).

Excellence-Override: leftover Mission Score copy (i18n + guidebook + fallbacks)
