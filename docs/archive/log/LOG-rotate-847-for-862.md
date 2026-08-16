# Rotated from LOG.md when `.862` landed

## 2026-08-15 — generateWeek must raise load on a clean last session (`.847`)

GNT-2 U2. `nextTargets` already load-ups on all-easy (`progression.test.ts`).
`planEngine.test.ts` already asserts a rise — with a date literal and an
enumerated id. A planner that computes the rise and discards it at
`generateWeek` would still pass both.

**Ship:** `src/lib/coach/coachEvalProgression.test.ts`. Calls `generateWeek`
only. No date literals. Precondition: the logged movement appears (fail, do
not skip). Easy last session raises weight past last logged. Easy load >
hard last-session load. RPE contrast does not change week `sets:recovery`
(U1 / `loadGuard` light-is-identity). No planner change.

**1 mutant killed** — selector returns seed targets instead of `nextTargets`
→ `easy last session must raise weight past 100, got 0`.

Label `.847` (onto master `.846`).

Excellence-Override: gauntlet GNT-2.U2 round 1 (wedge; RESULT unscored)

Rotated LOG oldest → [docs/archive/log/LOG-rotate-832-for-847.md](LOG-rotate-832-for-847.md).
