## 2026-08-05 — Outdoor log console set-kind collapse (`.482`)

Autoplan A1: four always-visible 44px set-kind chips sat above reps/weight and stole thumb height on the outdoor work-set path. Console now defaults to **Work + Kind** expand; full Warmup/Failure/Drop strip only when expanded or a non-work kind is selected. Pure helpers `visibleSetKinds` / `shouldShowSetKindExpand` in `loggerSpeed`. Log set marked `primary-action` + test id. A11y e2e expands kinds before Warmup assert.

Mutants: force expanded always → outdoor density regresses; drop expand control → non-work kinds unreachable from collapsed Work.

