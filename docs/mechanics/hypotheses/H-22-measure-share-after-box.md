---
id: H-22
type: hypothesis
title: Measure whether share fires only after the box ends
one_line: If we measure share events against session elapsed time, then we can see whether tell waits for the box or only for Finish.
targets: B-05
translates: M-19
removes: the unexamined assumption that Finish-gated share is the same as box-gated share
move_class: measure
cost_class: S
smallest_test: not runnable as E0 today. Share events exist; a join to elapsedSeconds at share time does not.
bar_kind: existing-instrument
instrument: src/lib/share/victoryShare.ts plus workout_shared track — no elapsed field on the event
kill_criterion: B-05 is blocked-on-telemetry and the event does not carry elapsedSeconds, so the measurement cannot be taken
guardrail: X-07 no invented share rate; TAP_BUDGET holds
reversibility: one optional field on an existing track call
preconditions_hold:
  existing_habit: no — PRIVATE_MODE is on and no invite is sendable, so there is no share corpus
ratchets_touched:
  TAP_BUDGET: hold
status: killed
---

**Measure, not a new control.** The empty tell/measure cell. Anki-style
honesty: if we cannot join share to the box, this dies as telemetry, not
as a feature.

Harvest-14 red team: **killed**. Share×elapsed cannot be measured today
(no field, no corpus, no box). REFUTE #5 fake instrument.
