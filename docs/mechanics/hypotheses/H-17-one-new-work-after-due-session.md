---
id: H-17
type: hypothesis
title: After today's due session, only one new thing is introduced
one_line: If Victory introduces at most one new action once today's prescribed session is done, then more athletes take that next beat, because new work cannot stack on a finished due pile.
targets: B-04
translates: M-18
removes: a second post-session CTA stacked on the first (share plus Fuel plus Coach rewrite)
move_class: add
cost_class: S
smallest_test: finish a prescribed session and assert pickVictoryNextAction returns one href; no second new-work control is mounted.
bar_kind: existing-instrument
instrument: packages/mw-core/src/workout/victory.ts — pickVictoryNextAction already returns one action; extend workoutVictory.test.ts to forbid a sibling CTA
kill_criterion: Victory already returns exactly one next action and no sibling CTA exists, so the assertion cannot fail
guardrail: TAP_BUDGET holds; the free logger stays reachable; Fuel stays an offer never a Bundle paywall
reversibility: one assertion on the Victory next-action picker
preconditions_hold:
  precondition_none: yes — Finish is already an event this product detects
ratchets_touched:
  TAP_BUDGET: hold
status: killed
---

**What Anki's cap is here.** New cards stay off while reviews are due. After
today's prescribed session is done, the due pile for *today* is empty. The
next thing is new work. Anki still does not dump the whole unused quota.
One new action is the quota.

This is not H-16 (withhold Fuel until Finish). Finish has already happened.
This is the cap on what is allowed to appear *after* that.

**Where it is already true.** `pickVictoryNextAction` returns a single
`VictoryNextAction`. If nothing else mounts beside it, the kill criterion
fires and this cell still got a stepping stone.

Harvest-13 red team: **killed**. Victory already returns exactly one next
action; named instrument cannot fail. REFUTE #5 fake instrument.
