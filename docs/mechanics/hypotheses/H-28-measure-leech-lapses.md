---
id: H-28
type: hypothesis
title: Measure whether any lift lapses enough to retire
one_line: If we counted Again-on-review per lift, then we could see whether retire-stuck has a substrate here.
targets: B-03
translates: M-21
removes: the assumption that we already know which lifts are stuck
move_class: measure
cost_class: S
smallest_test: not runnable as E0. No lapse event.
bar_kind: existing-instrument
instrument: src/lib/coach/adapt.test.ts — no lapse assertion exists
kill_criterion: no field, no corpus, so the measurement cannot be taken
guardrail: X-07 no invented fail rate; TAP_BUDGET holds
reversibility: one unshipped counter
preconditions_hold:
  existing_habit: no
ratchets_touched:
  TAP_BUDGET: hold
status: killed
---

**Written killed.** Trust/measure is H-14 killed already. No lapse
telemetry. Not a live candidate.

Harvest-16: **killed** on write. Fake instrument.
