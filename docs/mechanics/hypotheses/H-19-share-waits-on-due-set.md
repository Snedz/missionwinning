---
id: H-19
type: hypothesis
title: Share stays off until the first set is due-work done
one_line: If the tell surface is treated as new work and withheld until a set exists on the board, then more strangers finish the first set, because a share control cannot interrupt the due act.
targets: B-05
translates: M-18
removes: any share or invite chrome on the first-session logger before Log set has fired
move_class: add
cost_class: S
smallest_test: cold /welcome → Start → assert zero share/invite controls before Log set.
bar_kind: existing-instrument
instrument: tests/e2e/first-90.spec.ts — one assertion that share/invite controls are absent until a set is logged
kill_criterion: the first-90 path already has no share control, so the assertion cannot fail
guardrail: TAP_BUDGET holds; X-01 still forbids comparison inbound; no chat on Today
reversibility: one absence assertion on the first-90 path
preconditions_hold:
  precondition_none: yes — a logged set is already the act this product detects
ratchets_touched:
  TAP_BUDGET: hold
status: killed
---

**Tell as new work.** B-05 is showing the product to one other person. That
surface is new work. Anki does not introduce new cards while reviews are
due. The first session's due work is the set.

This is not a competitor hub (anti-library `tell+add+compare`). It is the
absence of a share control, not the addition of a comparison.

**Where it is already true.** first-90 does not click a share control today.
If none exists on `/active` before Log set, the kill criterion fires.

Harvest-13 red team: **killed**. first-90 path already has no share control
before Log set; assertion cannot fail. REFUTE #5 fake instrument.
