---
id: H-14
type: hypothesis
title: The planner does not read a set that can still be undone
one_line: If Coach adaptation ignores sets still inside the undo window, then the week stays earned from logs the athlete meant, because a retracted typo cannot become next week's load.
targets: B-03
translates: M-16
removes: the planner's read of in-flight, not-yet-emitted sets
move_class: measure
cost_class: S
smallest_test: log then retract inside the window; adaptSummary / seed-plan inputs match the pre-log state.
bar_kind: existing-instrument
instrument: src/lib/coach/adapt.test.ts
kill_criterion: the planner has to wait on a timer, or today's finished session never counts because the window never closes
guardrail: after the window, the set is an ordinary log — this is not a hide-from-Coach switch
reversibility: the filter is one predicate on set age
preconditions_hold:
  precondition_none: yes — device-local logs, no other athlete
ratchets_touched:
  TODAY_MAX_TOP_LEVEL_BLOCKS: hold
status: killed
---

**The part taken.** The hold is only real if nothing downstream treats the
in-flight set as a log. Gmail does not put an undone message in Sent. A planner
that reads the buffer is Outlook recall with extra steps.

**Why `trust` × `measure`.** Trust here is "the Coach week is earned from logs."
The instrument already exists (`adapt.test.ts`). The measurement is: in-flight
sets are absent from the input the planner already claims to use. X-01 still
holds — this is logs, not standing.

**Depends on a hold existing.** Without `H-12` or `H-13` there is no window to
ignore. That is a sequencing note, not a reason to skip the cell: an empty
`trust/measure` cell with a cheap instrument is what harvest is for.

Harvest-9 red team: **killed**. No window means an identity filter;
`adapt.test.ts` cannot fail. H-12 and H-13 are one mechanism, not two.
