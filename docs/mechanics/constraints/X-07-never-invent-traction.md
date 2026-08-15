---
id: X-07
type: constraint
title: Never invent traction
rule: No marketing number, no public live-user count, no cohort percentage, no rendered "X users retained". A measurement that has not been taken is stated as absent, never estimated.
enforcer: src/lib/week4Logger.test.ts
enforcer_anchor: We do not invent traction
authority: docs/METRICS.md
---

The house rule the whole codebase is built on — em-dashes instead of invented
zeros, `ratio` returning `null` under fourteen days rather than a
plausible-looking number, the adapt banner earning itself by diffing sessions.

The Idea Loop inherits it as the evidence-class system: `E0` observed here, `E1`
documented elsewhere with a URL and a date, `E2` reported, `E3` inferred. An
agent may not write an inference up as a citation, and the anti-library carries a
list of sources whose numbers circulate widely with no stated methodology so
that they cannot be laundered into `E1` later.

This constraint is why so much of the seeded graph reads
`blocked-on-telemetry`. That is the honest state of a product with no users, and
saying so is cheaper than discovering later that a whole branch of the graph was
grown from a guess.
