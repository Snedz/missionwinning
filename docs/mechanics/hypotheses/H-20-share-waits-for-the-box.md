---
id: H-20
type: hypothesis
title: Share waits for the time box, not only for Finish
one_line: If the tell control stays off until the session box has ended, then more athletes finish the due act, because a share cannot appear while the box still has time on it.
targets: B-05
translates: M-19
removes: any share control that can mount while elapsed session time is still inside the box
move_class: change
cost_class: S
smallest_test: start a session, log a set, assert share is absent while elapsedSeconds is below the box; it may appear only after the box or Finish.
bar_kind: existing-instrument
instrument: src/components/workout/WorkoutVictorySheet.tsx — Share mounts on Victory with no duration check; first-90 has no share selector
kill_criterion: share is already Finish-gated and absent on /active, so a "no share until the box" assertion cannot fail
guardrail: TAP_BUDGET holds; X-01 still forbids comparison inbound; Victory Share stays optional after Finish
reversibility: one duration gate on the Victory share control
preconditions_hold:
  precondition_none: yes — elapsedSeconds already ticks from startedAt
ratchets_touched:
  TAP_BUDGET: hold
status: killed
---

**Tell as a beat after the box.** M-19 says more work is not the next beat
when the box ends. Share is new work on the tell axis. Changing *when* it
may appear is `change`, not H-19's `add` of an absence assertion.

**Where it is already true.** `/active` has no share. Victory Share waits
for Finish, not a clock. If that is the whole story, the kill criterion
fires.

Harvest-14 red team: **killed**. Share is already Finish-only and absent
on the logger; no box exists to wait for. REFUTE #5 fake instrument.
