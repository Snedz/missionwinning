---
id: H-21
type: hypothesis
title: Identification chrome stays off while the session box is running
one_line: If waitlist, notify-me and sign-in stay off the logger until the box ends, then more strangers log the set, because identification cannot interrupt the bound session.
targets: B-06
translates: M-19
removes: waitlist, notify-me, or sign-in chrome on /active or cold Today while a session is in progress
move_class: remove
cost_class: S
smallest_test: cold /welcome → Start → assert zero waitlist/notify-me/sign-in controls before Finish.
bar_kind: existing-instrument
instrument: tests/e2e/first-90.spec.ts plus /active — no UnlockButton or LaunchNotifyForm on the logger
kill_criterion: identification chrome is already absent on the first-90 path, so the assertion cannot fail
guardrail: X-02 the free logger stays ungated; identification stays after value, never a wall
reversibility: one absence assertion
preconditions_hold:
  precondition_none: yes — a running session is already state this product detects
ratchets_touched:
  TAP_BUDGET: hold
status: killed
---

**Pay axis without a paywall.** B-06 is identification after value. M-19
says the box is still the current act. Removing an identify ask that
appears *during* the box is the subtractive cell.

**Where it is already true.** first-90 and `/active` do not mount waitlist
or Unlock. Today sign-in is after a finished first workout. If nothing
is there to remove, the kill criterion fires.

Harvest-14 red team: **killed**. Identification chrome is already absent
on first-90 and `/active`. REFUTE #5 fake instrument.
