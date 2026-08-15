# Rotated from LOG.md when `.845` landed

## 2026-08-15 — plannedRest old path still resolves (`.830`)

Webpack still asked for `@/lib/rewards/plannedRest` after `.825` moved
the file. No source import remains.

**Ship:** one-line re-export shim.

Label `.830` (onto master `.829`).

Excellence-Override: plannedRest shim (surface; RESULT unscored)
