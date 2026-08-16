---
id: H-16
type: hypothesis
title: Victory's next action stays off screen until Finish
one_line: If the second-pillar offer is withheld until the session is finished, then more athletes see it as a next beat rather than a mid-set interruption, because Fuel and Mind cannot appear while a set is still the current act.
targets: B-04
translates: M-17
removes: any mid-session Fuel or Mind offer that appears before Finish
move_class: change
cost_class: S
smallest_test: start a session, log one set, assert no Fuel/Mind next-action until Finish has produced Victory.
bar_kind: existing-instrument
instrument: src/lib/workout/workoutVictory.test.ts — next-action helpers stay uncalled until the session is finished
kill_criterion: Victory already cannot mount a next action before Finish, so the assertion cannot fail
guardrail: TAP_BUDGET holds; no chat on Today; second pillar stays an offer after Victory, never a requirement
reversibility: one mount condition on the Victory next-action picker
preconditions_hold:
  precondition_none: yes — Finish is already an event this product detects
ratchets_touched:
  TAP_BUDGET: hold
status: killed
---

**Why this is `change` on depth.** B-04 is the only depth behaviour: a second
pillar in the hour after training. M-17 says withhold the next beat until the
current act is done. The current act during a session is the session. The next
beat is Victory's offer.

**Where it is already true.** `pickVictoryNextAction` already runs on a
finished session. If no Fuel/Mind CTA can appear mid-set, the kill criterion
fires and this cell still got a stepping stone.

**Where it fails.** Parking a second pillar for taste, or adding a tap to
reach Victory, is not this mechanic.

Harvest-11 red team: **killed**. Victory only mounts after Finish
(`handleComplete` → `completeActiveWorkout` → `setVictoryOpen`). The named
instrument cannot fail. REFUTE #5 fake instrument.
