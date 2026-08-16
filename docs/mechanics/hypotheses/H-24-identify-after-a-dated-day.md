---
id: H-24
type: hypothesis
title: Identification waits until a dated workout exists
one_line: If sign-in stays off Today until a workout is logged that day, then more strangers start, because the account ask is not on the date filter.
targets: B-06
translates: M-20
removes: Sign-in chip or waitlist on /log when workoutHistory is empty
move_class: change
cost_class: S
smallest_test: cold /log after I-Day Continue; assert no Sign-in chip before first workout.
bar_kind: existing-instrument
instrument: src/lib/firstSetUngated.test.ts — /log chip hidden when hasFirstWorkout is false
kill_criterion: the chip is already hidden until first workout, so the assertion cannot fail
guardrail: X-02 free logger stays ungated; Profile still offers identify after value
reversibility: one visibility rule already on TodayPageHeader
preconditions_hold:
  precondition_none: yes — hasFirstWorkout is already computed
ratchets_touched:
  TAP_BUDGET: hold
status: killed
---

**Pay axis as a later date.** Identification is not today's Start. Changing
when it appears is `change` on pay.

**Where it is already true.** `hasFirstWorkout && !userEmail` is the chip
predicate. If cold Today has no chip, the kill criterion fires.

Harvest-15 red team: **killed**. Chip already hidden until first workout.
REFUTE #5 fake instrument.
