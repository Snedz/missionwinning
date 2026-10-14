## 2026-09-24 — Library absorbs a free-exercise-db subset (`.1111`)

Train and Library search were
limited to the house catalog
(228 unique after dedupe).
`ensureFullExerciseCatalog()`
now also splices 120 strength
movements from
yuhonas/free-exercise-db
(Unlicense, commit
`a859101d633a01c4a1a920d6a8ce41dabba0705f`).
Rows map into the existing
`Exercise` type. Ids are
`fedb-`. House names win.
Equipment is round-robin
across the Library chips so
one bucket cannot fill the
cap. Upstream file is 876
rows; this ship keeps a
curated subset.

No image bytes and no image
URLs. The upstream LICENSE is
Unlicense and the README
calls the JPG tree public
domain, but those files came
from the exercises.json pack
and `Exercise` has no image
field. Attribution:
`src/data/free-exercise-db/NOTICE.md`.

No AGPL paste. No Train
rewrite. Public exercise-page
floor stays 228
(under-promise). `[skip vercel]`.
No tip-promote. Live www stays
`.697`. PRIVATE_MODE stays.

**Mutants killed:** stretching
and unmapped equipment
accepted as catalog rows;
house name `Push-ups`
replaced; round-robin cap
ignored.

Label `2026.07-unified.1111`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1096-for-1111.md](docs/archive/log/LOG-rotate-1096-for-1111.md) (`.1096`).
