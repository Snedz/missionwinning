---
id: H-25
type: hypothesis
title: Measure whether identify chrome appears on undated Today
one_line: If we measure waitlist or sign-in mounts on cold Today, then we can see whether the date filter is leaking capture.
targets: B-06
translates: M-20
removes: the unexamined assumption that Today never mounts identify before a dated workout
move_class: measure
cost_class: S
smallest_test: not runnable as E0. B-06 is blocked-on-telemetry; no waitlist event on /log.
bar_kind: existing-instrument
instrument: src/lib/firstSetUngated.test.ts — the /log case already asserts the chip is off
kill_criterion: B-06 is blocked-on-telemetry and the unit already holds, so the measurement cannot fail
guardrail: X-07 no invented waitlist rate; TAP_BUDGET holds
reversibility: one existing unit assertion
preconditions_hold:
  existing_habit: no — PRIVATE_MODE is on and no invite is sendable
ratchets_touched:
  TAP_BUDGET: hold
status: killed
---

**Measure.** The empty pay/measure cell. If the chip test already holds and
there is no corpus, this dies as telemetry, not as a feature.

Harvest-15 red team: **killed**. Unit already holds; no /log waitlist
telemetry. REFUTE #5 fake instrument.
