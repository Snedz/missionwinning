# Rotated from LOG.md when `.864` landed

## 2026-08-15 — generateWeek programs only catalog ids legal for declared gear (`.849`)

GNT-2 U4. `equipmentMatches` already filters the catalog. `selector` already
calls it. `equipment.test.ts` tests the predicate. `planEngine.test.ts`
asserts `!exerciseId.includes('bench')` — one spelling, date literal.

**Ship:** `src/lib/coach/coachEvalGear.test.ts`. Calls `generateWeek` only.
No date literals. All three profiles plus one Home gym kit overlay. Every
programmed id exists in `EXERCISES` and passes `equipmentMatches`. Discover
the catalog; do not enumerate banned ids. No planner change.

**1 mutant killed** — selector drops `equipmentMatches` → bodyweight week
programs ids the predicate rejects (`lat-pulldown`, `overhead-press`, …).

Label `.849` (onto master `.848`).

Excellence-Override: gauntlet GNT-2.U4 round 1 (wedge; RESULT unscored)

Rotated LOG oldest → [docs/archive/log/LOG-rotate-834-for-849.md](LOG-rotate-834-for-849.md).
