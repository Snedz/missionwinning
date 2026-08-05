## 2026-08-04 — Library session studio multi-select (`.461`)

Craft-index Phase 5: pick exercises with ✓ on `/library` (max 12), sticky bar **Train selected** starts a freestyle session (or adds to active). Pure helpers in `librarySessionPick` — toggle, templates, session name.

Mutants: pick past max → list unchanged; templatesFromLibraryPick drops unknown ids; empty pick name → Library session.
