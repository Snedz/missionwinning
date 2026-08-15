---
id: X-05
type: constraint
title: Taps from cold open to a logged set only go down
rule: The tap count from a cold /welcome to a working set on the board is capped by TAP_BUDGET in the hero e2e. Never raise it. Lowering it is the whole game.
enforcer: tests/e2e/first-90.spec.ts
enforcer_anchor: const TAP_BUDGET = 5
authority: ORCHESTRATION.md Horizon W criterion 5
---

The only ratchet in the repo whose *intended* direction of travel is down, which
makes it the natural home for a `remove` candidate. `docs/JOURNEY.md` states the
law in prose — "Five taps max" — and this spec is what makes the prose fail a
build.

Note what it does not measure. The ninety seconds in criterion 5 is wall clock
on a real walk; this is taps. `.837` pinned both in one test and the GNT-1
workbench had to say out loud that the pin *"does not time 90 seconds"* — a
useful reminder that an instrument adjacent to a bar is not that bar.
