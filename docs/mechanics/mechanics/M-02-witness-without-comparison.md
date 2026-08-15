---
id: M-02
type: mechanic
title: Witness without comparison
primitives:
  trigger: completion
  cost_to_produce: low
  visibility: witnessed-by-one
  reciprocity: no
  durability: session
  reversibility: yes
  forgiveness: yes
  optimum_direction: personal-band
  precondition: none
seen_in:
  - product: Strava kudos
    url: https://www.sciencedirect.com/science/article/pii/S0378873322000909
    date: 2022-11-01
    class: E1
  - product: Strava kudos — documented backfire in the same literature
    url: https://pmc.ncbi.nlm.nih.gov/articles/PMC12938745/
    date: 2025-01-01
    class: E1
also_seen_in_failures:
  - Peach waves and Google Plus plus-ones — the same cheap acknowledgement gesture, on networks that never reached the density it needs
produces:
  - B-02
backfires:
  - behavior: B-03
    how: athletes who perceive their performance as poor hide or delete sessions, which corrupts the planner's only input
    class: E1
    url: https://pmc.ncbi.nlm.nih.gov/articles/PMC12938745/
---

**The decomposition is the whole value of this node.** Kudos as a *feature* is a
public reciprocal social gesture on a ranked network. The part that does the
work is much smaller: **acknowledgement from something that knows what the effort
cost**. Runners receiving kudos from a clubmate were measurably more likely to
add a session; the effect is small and real.

The rest of the feature is what carries the harm. The same exposure, when
performance dips, produces evaluative concern and the documented coping
behaviour — hiding or deleting the session. In this product that is not a tone
problem, it is `X-01`'s input-integrity attack arriving through the front door,
which is why the `backfires` edge points at `B-03` rather than at `B-02`.

So the primitives here are set deliberately against the source: `visibility` is
`witnessed-by-one`, not `public`; `reciprocity` is `no`. What is left is
something that can only be delivered by the Coach, because the Coach is the only
party in this product that has read the logs and has no standing of its own.

`M-07` is the same source product with the other primitive row, kept as a
separate node precisely so the two can be told apart.
