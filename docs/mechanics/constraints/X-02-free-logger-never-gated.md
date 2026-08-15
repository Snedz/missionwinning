---
id: X-02
type: constraint
title: The free logger is never gated
rule: A first working set must be reachable and saveable with no account, no payment and no private-mode cookie. Not parkable, not degradable, not behind an experiment.
enforcer: src/lib/firstSetUngated.test.ts
enforcer_anchor: firstSetUngated wiring
authority: CONTEXT.md hard rule 2
---

Hard rule 2, and the only rule in the repo written with the word "Ever." It is
also structurally unrepresentable rather than merely forbidden: `src/lib/surface.ts`
has no `Surface` value for the logger, so *"logger off"* is not a sentence the
configuration language can express.

Any hypothesis whose smallest test involves withholding the logger from anyone,
for any duration, for any measurement, is dead on arrival here. That includes
the tempting experimental form — a holdout cohort that cannot log — which is
exactly the shape a naive optimiser proposes first when asked to measure the
logger's effect on retention.
