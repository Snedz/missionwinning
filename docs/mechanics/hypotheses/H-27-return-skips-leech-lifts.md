---
id: H-27
type: hypothesis
title: The first session back does not include a lift that kept failing
one_line: If return dose drops lifts that lapsed past a threshold, then more athletes finish that session, because the stuck item is not the whole hour.
targets: B-02
translates: M-21
removes: putting a repeatedly-failed lift back on the returning 20-minute session
move_class: change
cost_class: S
smallest_test: not runnable. There is no lapse counter on stored sets.
bar_kind: existing-instrument
instrument: src/lib/reentry.ts — doseScale has no leech input
kill_criterion: no lapse field exists on logs, so the change cannot be asserted
guardrail: X-03 no shame copy; athlete is never asked to rate a lift as a leech
reversibility: one unused input to doseScale
preconditions_hold:
  existing_habit: no — PRIVATE_MODE, no lapse corpus
ratchets_touched:
  TAP_BUDGET: hold
status: killed
---

**Written killed.** No lapse instrument. Measuring or changing return
dose by leech count invents a field.

Harvest-16: **killed** on write. Fake instrument + precondition.
