# Rotated for .517

## 2026-08-05 — Kaizen K3/K5: Coach invite vs week + week-1 train contract (`.501`)

K3: readiness no longer stacks invite + empty coach-week. Pure `todayCoachWeekMayMount` — week strip only when plan exists (commissioned always); invite hides when `hasCoachPlan`. Dashboard re-reads plan on `mw-coach-plan-changed`. K5: week-1 activation contract asserts readiness Today primary, Victory, and First Steps all pin `/active` after first log (not PAR-Q/guidebook).

Mutants: readiness + hasCoachPlan invite true → red; readiness primary `/assessments` after one log → red.

