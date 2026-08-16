# Rotated from LOG.md when `.863` landed

## 2026-08-15 — mid-week adapt records misses without adding work (`.848`)

GNT-2 U3. `adaptPlan` already marks past planned days `missed` and keeps
remaining load on leftover days. `adapt.test.ts` covers that with date
literals. `adaptMissedNarration.test.ts` pins the banner on hand-built
sessions and derives dates from `toISOString()`. A planner that relabels
nothing would still pass some of those.

**Ship:** `src/lib/coach/coachEvalAdapt.test.ts`. `generateWeek` then
`adaptPlan`. No date literals. Precondition: the generated week has planned
sessions before today (fail, do not skip). After adapt: zero `planned` in
the past; `missed.length` equals that past count; remaining planned sit on
leftover days and fit; remaining planned sets do not rise. No planner
change. High-strain shape stays U1.

**1 mutant killed** — `adaptPlan` returns the plan unchanged → past sessions
still `planned`.

Label `.848` (onto master `.847`).

Excellence-Override: gauntlet GNT-2.U3 round 1 (wedge; RESULT unscored)

Rotated LOG oldest → [docs/archive/log/LOG-rotate-833-for-848.md](LOG-rotate-833-for-848.md).
