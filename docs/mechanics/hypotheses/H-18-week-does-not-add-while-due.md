---
id: H-18
type: hypothesis
title: The week does not add a new lift while an earlier planned day is still due
one_line: If adapt never appends an unseen exercise to a later day while an earlier planned day has zero completed sets, then we can see whether new work waits on due work inside the week.
targets: B-04
translates: M-18
removes: the week-rewrite that introduces a new lift id while yesterday's prescribed session is still `planned`
move_class: measure
cost_class: S
smallest_test: two planned days, day 0 still planned with no logs, run adapt, assert day 1's exercise ids are a subset of the pre-adapt plan.
bar_kind: existing-instrument
instrument: src/lib/coach/adapt.test.ts — add the subset assertion next to the existing miss/swap cases
kill_criterion: adapt already never introduces a new lift id on a rewrite, so the assertion cannot fail, or the helper cannot see session status without a new field
guardrail: the planner stays blind to standing (X-01); no athlete is asked to rate a backlog
reversibility: one assertion in adapt.test.ts; deleting it restores today's silence
preconditions_hold:
  precondition_none: yes — planned vs logged is already on CoachPlan.sessions
ratchets_touched:
  TAP_BUDGET: hold
status: killed
---

**Measure, not a new surface.** B-04 is the empty depth cell. The thing being
measured is whether the week adds *more* (a new lift, a deeper session) while
due work is still open. Anki's default is that new cards stay off when the
review cap is hit.

**Where it fails.** If `adaptPlan` cannot name "unseen exercise id" without
inference, or if every rewrite is already a reshuffle of the same catalog
ids, the kill criterion fires.

Harvest-13 red team: **killed**. adapt already never introduces a new lift
id on a later-day rewrite; subset assertion cannot fail. REFUTE #5 fake
instrument.
