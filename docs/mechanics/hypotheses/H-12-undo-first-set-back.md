---
id: H-12
type: hypothesis
title: The first set back can be taken back before it is a record
one_line: If a returning athlete can undo the first logged set for a few seconds, then more of them stay for the session, because a mistyped number never becomes the thing the Coach will later witness.
targets: B-02
translates: M-16
removes: the instant permanence of the first set after a gap — persist waits for the window
move_class: remove
cost_class: S
smallest_test: log one set, retract inside the window, assert history and the outbox do not contain it.
bar_kind: existing-instrument
instrument: src/store/workoutStore.test.ts — completed-set keep rule, inverted for the window
kill_criterion: retract after the window still works (that is recall, not delay) or retract fabricates a miss the re-entry line can name
guardrail: re-entry copy must still name no gap and no delete — X-03 stays red if undo is narrated as a comeback failure
reversibility: one timeout around persist; removing it restores today's instant write
preconditions_hold:
  precondition_none: yes — private, no other athlete, no network
ratchets_touched:
  TAP_BUDGET: hold
  TODAY_MAX_TOP_LEVEL_BLOCKS: hold
status: killed
---

**The part taken.** Commit and emit are not the same instant. Gmail's Undo is
a hold, not a recall. The half left behind is any recipient-side delete.

**Why `return` × `remove`.** The return path already has add (H-03), change
(H-07) and measure (H-09). What it does not have is a deletion: the first set
back is currently as permanent as any other set, and `M-02`'s own backfire is
athletes hiding or deleting sessions they think look poor. Taking the set back
*before it is a session* is the subtractive form of that, and it does not wait
for a cloud delete.

**Not a confirmation modal.** A modal before Log is a tap. X-05 forbids buying
safety that way.

Harvest-9 red team: **killed**. The named history/outbox check is already true
mid-session without a window, so the instrument cannot fail.
