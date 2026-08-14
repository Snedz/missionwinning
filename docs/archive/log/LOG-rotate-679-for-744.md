## 2026-08-12 — Today /log coach fatigue-regen refresh loop (`.679`)

Scout dogfood on live `.618`: Chrome **Aw, Snap!** (renderer code 9) on `/log` with title "Today · Mission Winning". Root cause: `regenerateFutureSessions` always returned `revision + 1` (same class as `.207` on `adaptPlan`). `useCoachPlan.refresh` saves when revision moves, listens synchronously for `mw-coach-plan-changed`; on Today with free beta (= premium) and strain ≥ 70, `TodayCoachWeekStrip` / `CoachTodayCard` mount → infinite synchronous recursion until stack overflow. Fix: `sessionsEqual` gate before bumping revision (equipment profile unchanged). Regression in `adapt.test.ts`. Label `.679` (not `.678`) so it can land after skeleton PR #463 if that keeps `.678`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-656-for-679.md](docs/archive/log/LOG-rotate-656-for-679.md).
