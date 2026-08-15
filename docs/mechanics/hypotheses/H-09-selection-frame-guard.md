---
id: H-09
type: hypothesis
title: Every cohort number declares the selection it was drawn from
one_line: If any adherence or retention number must name its selection frame at the point it is computed, then the first cohort read will be believable, because engagement programmes recruit the already-engaged and this product's own features censor its own data.
targets: B-02
translates: M-08
removes: the assumption that a logged cohort is a random one — and with it the option of reporting a week-4 figure without saying who could have appeared in it
move_class: measure
cost_class: S
smallest_test: add a reader that computes a cohort figure without declaring its frame, and assert the guard fails.
bar_kind: new-ratchet
instrument: a new guard beside src/lib/week4Logger.test.ts, paired with the reader it checks
kill_criterion: a selection frame cannot be expressed as a checkable declaration and degrades into a prose comment nobody parses
guardrail: the guard must not become a formality — a declaration that says unknown is a legal answer and must stay visible in the output rather than satisfying the check
reversibility: a test and a field; deleting both restores today's behaviour
preconditions_hold:
  precondition_none: yes — this measures our own data and needs no other athlete
status: candidate
---

**Two independent biases, both pointing the same way, both already true here.**

*Selection.* The Illinois Workplace Wellness study randomised 4,834 employees and
found participants' baseline annual medical spending was **$1,384 lower** than
non-participants', and that they were already more likely to use campus rec
facilities and run races. **Engagement programmes recruit the already-engaged.**
Any comparison of people who used a feature against people who did not is
contaminated before it starts.

*Censoring.* The Strava literature documents club runners **hiding activities and
deleting sessions** when performance dips or during injury. A training app's own
logged data is therefore censored *by its own features*, and censored hardest for
exactly the athletes under most pressure — the ones whose retention you most want
to measure. `X-01` already argues this qualitatively as an input-integrity attack
on the planner. This is the same fact arriving in the metrics.

**Why the deliverable is an enforcer rather than a feature.** There is no live
guard for either bias, and `schema.ts` refuses to record a constraint whose
`enforcer` does not exist — correctly, because a constraint that cannot fail a
build is prose, and prose is what this whole system was built to replace. So the
first commission is the instrument, and `X-09` gets written only once the guard
runs. That is `GAUNTLET_LOOP` §3's *"no legal bar → the first commission is the
instrument itself, as its own round"*, arriving on its own.

**Why now, with zero users.** This is the cheapest moment it will ever be. There
is no cohort yet, so nothing has to be re-derived and no published number has to
be retracted. Every guard in this repo that arrived after the fact — the tombstone
readers, the lifetime-vs-week-scoped Mission Score — cost more because the wrong
number had already been somewhere.

`docs/METRICS.md` already carries the shape of the answer: it names precisely who
is counted (working sets, not warmups), who is excluded, and which sinks receive
what. What it does not say is **who could have been counted and was not.**

**The honest failure mode.** A selection frame that becomes a box everyone types
`n/a` into is worse than nothing, because it launders the problem into a green
check. Hence the guardrail: `unknown` is a legal declaration and must stay
*visible in the output*, not merely accepted by the test.
