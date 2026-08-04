# Rotated from LOG.md for .417

## 2026-08-04 — Drop colliding learnExpanded pack keys (`.402`)

`.401` filled beachhead packs including `learnExpandedBanner` / `learnExpandedDesc` — keys that already mean something else in `guidebookLocales` (same `.178` class as the recorded `fuelTitle` collisions). `localeFootprint.test.ts` caught pack vs `public/locales` drift. Dropped those two keys from `es`/`fr`/`pt` packs; learn beachhead stays at ~32% placeholders. No `export-locales` (would re-surface the dual-namespace EN conflict into public files).
