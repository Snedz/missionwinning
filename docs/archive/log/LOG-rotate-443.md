## 2026-08-04 — Today details More mount gate (`.428`)

`shouldAppendTodayMoreDetails` is the one definition for mounting Today's details disclosure (quick links, accordion, or budget spill). Dashboard wires it; unit + wiring guards.

Mutants: restore inline `belowFoldReady && (showQuickLinks || …)` → wiring red.
