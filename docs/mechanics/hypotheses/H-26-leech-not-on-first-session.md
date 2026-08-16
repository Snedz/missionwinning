---
id: H-26
type: hypothesis
title: A leech rule cannot fire on the first session
one_line: If a stuck-item retire needs a lapse history, then the first set cannot disappear, because a cold visitor has no review fails.
targets: B-01
translates: M-21
removes: any first-session path that could hide a lift after one failed or skipped set
move_class: add
cost_class: S
smallest_test: cold /active; log or skip one set; assert the current lift is still on screen.
bar_kind: existing-instrument
instrument: tests/e2e/first-90.spec.ts — one [data-exercise-id] before Log set; laterLiftVisible after first completed set
kill_criterion: nothing retires a lift on first session today, so the assertion cannot fail
guardrail: TAP_BUDGET holds; free logger stays reachable
reversibility: one absence of a leech rule on cold Train
preconditions_hold:
  existing_habit: no — a cold visitor has no lapse history
ratchets_touched:
  TAP_BUDGET: hold
status: killed
---

**Written killed.** M-21's own precondition is existing-habit. Pointing
it at B-01 is the documented backfire. Harvest-16 red team would refuse
it on arithmetic. Recorded so the cell is not pretended empty.

Harvest-16: **killed** on write. Precondition does not hold for B-01.
