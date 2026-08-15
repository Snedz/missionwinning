---
id: H-04
type: hypothesis
title: A public standing ladder on Today
one_line: If athletes can see where they rank among other athletes on Today, then more of them come back, because a contested rung is a reason to return.
targets: B-02
translates: M-07
removes: nothing — and that is the first thing wrong with it
move_class: add
cost_class: M
smallest_test: none legal. Every version of this test requires another athlete's number on the logging path.
bar_kind: existing-instrument
instrument: src/lib/domainBoundary.test.ts — which fails the build rather than grading the idea
kill_criterion: fired on arrival, twice and independently
guardrail: none available — sessions logged per weekly active would be the right pair, and it cannot be measured with zero users
reversibility: not applicable
preconditions_hold:
  population_n: no — zero users, and this repo's own club planning puts promotion-only leagues at roughly three hundred weekly actives
violates:
  - X-01
  - X-06
status: killed
---

Kept, in full, because a graph that records only its survivors is survivorship
bias with a schema. The fingerprint of this node is what stops a future
translator re-deriving it in six months and presenting it as new.

**It dies twice, and the two deaths are worth telling apart.**

*Arithmetic.* `M-07` declares `precondition: population-n`. There are no users. A
ladder with nobody on it is not a weak version of a ladder, it is a different
and worse object — an empty board that says the product is empty. No amount of
design changes the denominator, and this refusal needs no opinion about
gamification to hold.

*Constitution.* Even fully populated it would be forbidden. `X-01` keeps the
planner blind to standing because a logged set here is the Coach's input, not a
post; an athlete with a reason to shade what they log corrupts the only signal
the week is built from. `X-06` kills the surface separately, since Today already
spends its one red action.

**The near miss worth naming.** `M-02` comes from the same source product and
survives as `H-03`. The difference is four primitives — `visibility`,
`reciprocity`, `reversibility`, `forgiveness` — and nothing else. That is the
whole argument for recording mechanics as primitive configurations instead of as
features: at the feature layer these two are both "Strava kudos", and one of them
would break the planner.
