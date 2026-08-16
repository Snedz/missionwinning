---
id: H-23
type: hypothesis
title: First-session Today carries no tell control
one_line: If share stays off Today until a dated session exists, then more strangers tap Start, because tell is undated capture and does not belong on the date filter.
targets: B-05
translates: M-20
removes: any share or invite control on cold /log before a workout is logged
move_class: remove
cost_class: S
smallest_test: cold /welcome → Continue → assert zero share/invite controls on /log before Start.
bar_kind: existing-instrument
instrument: tests/e2e/first-90.spec.ts — after /log, before Start
kill_criterion: first-session Today already has no share control, so the assertion cannot fail
guardrail: TAP_BUDGET holds; X-01 still forbids comparison inbound
reversibility: one absence assertion on first-session Today
preconditions_hold:
  precondition_none: yes — local date and I-Day landing already exist
ratchets_touched:
  TAP_BUDGET: hold
status: killed
---

**Tell as undated capture.** M-20 says Inbox is not Today. Share is not
dated work. Removing it from the first Today paint is the subtractive cell.

**Where it is already true.** HomeTodayLean does not import share. If
first-90 already has zero tell controls on /log, the kill criterion fires.

Harvest-15 red team: **killed**. First-session Today already has no share
control. REFUTE #5 fake instrument.
