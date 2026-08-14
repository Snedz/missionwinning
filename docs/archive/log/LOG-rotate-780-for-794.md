# Rotated from LOG.md when `.794` landed

## 2026-08-14 — PWA start_url follows the private gate (`.780`)

The service worker already flag-switches with `PRIVATE_MODE` (`next.config.js`
`pwaDisabled`). The web manifest did not: `start_url` was a `/private` literal
and `pwaManifest.test.ts` forbade `/log` unconditionally. A public-flip rebuild
would still have opened installed icons on the teaser.

**Ship:** `pwaStartUrl()` uses `isPrivateModeEnabledFromEnv` (Preview
short-circuit included). Gated → `/private`. Ungated / Preview / gate-build →
`/log` (Today). `id` stays `/log`. Logger `/active` is not the install home.
No `PRIVATE_MODE` flip.

Label `.780` (onto master `.779`). Excellence-Override below.

Excellence-Override: H0 PWA start_url flag-switch (founder skip-W 2026-08-14)

Rotated LOG oldest → [docs/archive/log/LOG-rotate-765-for-780.md](docs/archive/log/LOG-rotate-765-for-780.md).
