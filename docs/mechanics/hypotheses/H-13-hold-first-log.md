---
id: H-13
type: hypothesis
title: The first Log set is held before it is durable
one_line: If a stranger's first working set stays retractable for a few seconds, then more of them keep a real number, because a mistype can be taken back without adding a tap before Log.
targets: B-01
translates: M-16
removes: the identity of tapping Log and writing a durable set
move_class: change
cost_class: S
smallest_test: first-90 still lands a set; a store test retracts inside the window and keeps TAP_BUDGET unchanged.
bar_kind: existing-instrument
instrument: tests/e2e/first-90.spec.ts
kill_criterion: the hold adds a tap, a confirm sheet, or forces TAP_BUDGET up
guardrail: a pre-filled number that expires into persist unread is a fabricated log — same class of input failure X-01 guards
reversibility: one timeout around persist
preconditions_hold:
  precondition_none: yes — the free logger, no account
ratchets_touched:
  TAP_BUDGET: hold
status: killed
---

**The part taken.** Same hold as `H-12`, aimed at the cold path. The first set
is the behaviour every other behaviour depends on. Changing *when* Log becomes
a record is not adding a control.

**Why `change` not `add`.** The Log control already exists. The change is that
its write is no longer synchronous with the tap. Adding an Undo button as a
second red control would trip X-06; the Gmail pattern is a toast on the thing
you just did, not a new dock action.

**H-05 is the neighbour, not the duplicate.** H-05 removes a tap by pre-filling.
This leaves the tap count alone and changes what the tap commits. A world with
both must keep the guardrail: pre-fill plus silent expire is a fake set.

Harvest-9 red team: **killed**. M-16's documented B-01 backfire is this target.
`first-90` only ratifies TAP_BUDGET not rising.
