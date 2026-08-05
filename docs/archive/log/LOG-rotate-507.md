# Rotated for .507

## 2026-08-05 — Next nested postcss floor + full pack/public parity (`.491`)

After `.489` next@16.3.0, nested `postcss` is 8.5.23 (past Dependabot #44–#45 / 8.4.31). `nextNestedPostcss.test.ts` floors the lockfile copy and pins `package.json` next ≥16.3. Locale footprint pack↔public agreement discovers **all** pack langs (not only ja/es/de/ar) so hi/vi/th drift from `.490` cannot hide. SECURITY_AUDIT_TRIAGE marks postcss cleared.

Mutants: POSTCSS_FLOOR 9.0.0 → red; pack/public disagree on hi key → footprint red; next `^16.2.12` again → range pin red.


