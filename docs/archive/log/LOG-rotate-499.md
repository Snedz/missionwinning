## 2026-08-05 — Locale pack interpolation keys (`.484`)

Machine-translated `src/i18n/packs/*.json` had "translated" `{{placeholders}}` (`{{peso}}`, `{{単位}}`) while call sites pass English keys (`weight`, `unit`). Runtime left literals on Active plate calc, rest copy, History volume, and more. Rewrote pack placeholders to match English `*Locales.ts`; guard `i18nPackPlaceholders.test.ts` fails on the next drift.

Mutants: es `calcPlateTotal` with `{{peso}}` again → test red; leave translated prose, only fix keys.

