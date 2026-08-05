# Rotated from LOG.md for `.504` (2026-08-05)

## 2026-08-05 — Next 16.3.0 + locale public/pack parity (`.489`)

Kaizen night A residual: bump `next` `^16.2.12` → `^16.3.0` (lockfile resolves 16.3.0). Sync `public/locales/**` to `src/i18n/packs` where pack placeholder rewrites from `.484` had not landed on the HTTP override copy (localeFootprint drift: e.g. ja `{{unit}}` vs `{{単位}}`). `formPatterns` test accepts Form Index video packs for front-squat (`.477`) while pinning OHP still-only.

Mutants: public/ja unit as `{{単位}}` again → footprint red; front-squat still-only assert only → pack video green path breaks.
