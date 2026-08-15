---
id: X-04
type: constraint
title: Today holds at most six top-level blocks
rule: The Today screen may render no more than TODAY_MAX_TOP_LEVEL_BLOCKS top-level blocks. The number lives in source; nothing may restate it, and it only ever goes down.
enforcer: src/lib/today/todayBlockBudget.ts
enforcer_anchor: TODAY_MAX_TOP_LEVEL_BLOCKS = 6
authority: docs/JOURNEY.md — one boss screen
---

The anti-bloat ratchet with the most surface area, because Today is where every
new idea wants to land. Every pillar, every nudge, every card that "just needs
one row" is a proposal against this budget.

A generator has no instinct for restraint and infinite patience, which is
Brooks' second system with the brakes removed. So the budget is not advice to
the translator — it is a field on every hypothesis (`ratchets_touched`) and a
hard kill when the direction is `raise`.
