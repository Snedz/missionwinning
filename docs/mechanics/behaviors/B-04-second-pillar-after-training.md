---
id: B-04
type: behavior
title: An athlete uses a second pillar in the hour after training
behavior_class: depth
observable: event:pillar_win
measurable: blocked-on-telemetry
source:
  - ORCHESTRATION.md Horizon 2 product bets — post-workout ritual polish, kill if no fuel or mind after victory
  - packages/mw-core/src/workout/victory.ts — one post-session next action
---

The only behaviour on this axis the constitution actually wants, and it is
deliberately narrow: the pitch is Train plus Mission Coach, never the everything
app, so "uses more pillars" is not a goal in itself.

The existing mechanism is the victory ladder — one boss action after a session,
with a strain-triggered branch to Mind and a protein branch to Fuel, capped at
two quiet secondary links because Hick's law and one red action both say so.

`ORCHESTRATION.md` already carries the kill criterion for this bet in prose. The
Idea Loop's contribution is not a new idea here; it is that the criterion now has
a node, so a future candidate on this axis inherits it instead of inventing a
softer one.
