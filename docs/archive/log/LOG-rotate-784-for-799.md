# Rotated from LOG.md when `.799` landed

## 2026-08-14 — First-set locale sheet off Train (`.784`)

The first-visit language-and-country overlay opened on `/active`,
I-Day, Today, and the teaser. Same Continue as F-017. First 90
seconds spent picking a country instead of logging a set.

**Ship:** guess language silently on `/`, `/welcome`, `/private`,
`/active`, `/log`, `/feedback`. Auto-open the sheet only off that
path, and only once. Confirm later on Profile / footer. Logger
ungated. No `PRIVATE_MODE` flip.

Mutants: `/active` still auto-opens; `setOpen(true)` without the
predicate.

Label `.784` (onto master `.783`).

Excellence-Override: first-set locale sheet off Train/I-Day (F-017)
