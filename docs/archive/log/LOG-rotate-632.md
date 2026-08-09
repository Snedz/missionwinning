## 2026-08-08 — Pre-design gate hygiene (`.617`)

FounderStatusBoard paid its gate costs before the design pass: one import test so coverage does not raise the untested-files floor, and owner-tools copy moved onto `useTranslation` + `athleteLocales` keys so `i18n:coverage` stays at cap 0. No product behavior change.

**Verification (pre-design):** re-run coverage, i18n, typecheck, production build, hero `@gate`, and `@a11y` after this ship; bundle budget remains a known separate red on `/log` and `/active`.

Rotated LOG `.602` → [docs/archive/log/LOG-rotate-617.md](docs/archive/log/LOG-rotate-617.md).
