## 2026-08-05 — Wedge i18n call-site alias guard (`.488`)

Kaizen K3.1: `i18nCallSitePlaceholders.test.ts` scans Train/Today/Coach call sites for forbidden option names (`n`→`current`, `dose`→`count`, …) after stripping defaultValue prose, so English templates and callers cannot re-split like LogConsole `.483`. Pins `activeSetOfParams` on LogConsole.

Mutants: LogConsole `n: setNumber` for activeSetOf → red; t('activeSetOf', { n: 1, total: 2 }) in workout → red.
