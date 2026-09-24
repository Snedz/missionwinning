# src/lib/programShell/

> One concern: offline program templates. Program → Week → Session → exercise → suggested set.

Not logged workout history. Not `src/data/programTemplates.ts` (flat Builder cycles). No billing fields.

## Read order

1. `types.ts` — the tree
2. `parse.ts` — accept a program; refuse billing keys
3. `seed.ts` — one full-body template
4. `library.ts` — seed plus device copies (`mw_program_shell`)
5. `toTrainDraft.ts` — suggested sets → logger draft. Does not write history

UI: `src/components/builder/ProgramShellPanel.tsx`, mounted inside Builder Show all.
