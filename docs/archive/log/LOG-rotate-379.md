## 2026-08-04 — Add-exercise sheet a11y (`.364`)

Kaizen Loop 21 E1. Seeded axe on `/active` with Add exercise sheet open.

**Real axe findings fixed in `ExercisePicker`:**
1. Search input had no accessible name → `aria-label={copy.searchPlaceholder}`
2. Nested `ul[role=listbox]` + `li` + `button[role=option]` failed listitem/parent rules → `div role=listbox` with option buttons as direct children; empty state is `<p>` not `<li>`
3. Listbox gets `aria-label` + `tabIndex={0}` for name + keyboard

Also fixes `benchmarksLocales` type parity (duplicate `benchmarksQuickStarters`, missing `benchmarksWeightTimesReps`) so typecheck stays green.

Mutants: omit search name → serious; restore nested list → serious. Cap 16.
