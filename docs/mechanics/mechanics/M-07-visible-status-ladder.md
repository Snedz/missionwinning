---
id: M-07
type: mechanic
title: Visible status ladder with a contested top
primitives:
  trigger: completion
  cost_to_produce: low
  visibility: public
  reciprocity: no
  durability: durable-record
  reversibility: no
  forgiveness: no
  optimum_direction: more
  precondition: population-n
seen_in:
  - product: Duolingo leagues
    url: https://blog.duolingo.com/leaderboards-and-leagues/
    date: 2024-01-01
    class: E2
    retrieval: indexed
    why_not_e1: search-index synthesis only; no scout in either run could open the page (egress proxy blocked every fetch), so the citation is a pointer, not a reading
  - product: Peloton live leaderboard
    url: https://www.onepeloton.com/press
    date: 2026-08-15
    class: E2
    why_not_e1: the retention figures that circulate for this feature come from gamification vendors with no stated methodology
also_seen_in_failures:
  - Google Plus and countless enterprise gamification programmes — the same ladder with too few concurrent participants to make any rung contested
produces:
  - B-02
backfires:
  - behavior: B-03
    how: rank visible to the logging path gives the athlete a reason to shade what they log, which is the failure X-01 exists to prevent
    class: E2
    retrieval: indexed
    why_not_e1: search-index synthesis only; no scout in either run could open the page (egress proxy blocked every fetch), so the citation is a pointer, not a reading
    url: https://pmc.ncbi.nlm.nih.gov/articles/PMC12938745/
---

Kept in the graph **because** it fails, not despite it. A mechanic that only ever
records the winners is survivorship bias with extra steps, and the negative edge
is what stops a future translator from re-deriving this from scratch.

**It fails twice, independently, and both failures are checkable.**

*Arithmetic.* `precondition: population-n`. A ladder needs enough concurrent
participants that a rung is contested. This product has zero users, and even the
repo's own club planning puts promotion-only leagues at roughly three hundred
weekly actives. No amount of design fixes a denominator.

*Constitution.* `visibility: public` on a `completion` trigger puts another
athlete's number on the logging path, which `X-01` forbids and
`src/lib/domainBoundary.test.ts` fails a build over.

Note the two primitives that separate this from `M-02`, which comes from the
same category and survives: `reversibility: no` and `forgiveness: no`. A ladder
you cannot pause and cannot be forgiven on is the configuration that turns
engagement into obligation. That is the row cargo-culting drops, and it is why
the ontology requires it.

**The cross-check harvest 1 ran, and it is the most useful result in the whole
sweep.** Taking a negative corpus seriously — Foursquare, Fitocracy, Nike
FuelBand, Zynga, Clubhouse, Quibi, BeReal, Fleets — almost **nothing** in the
standard engagement toolkit discriminates winners from losers. Streaks, points,
badges, public leaderboards, ephemerality, daily drip and reciprocity gates all
appear in currently-successful products *and* in dead ones. Nike's FuelBand died
with the same abstract-score-plus-daily-ring mechanic Apple Watch won with.

Two discriminators survived the cross-check:

1. **A status good that regenerates versus a fixed scarce slot.** Foursquare's
   mayorship is one slot per venue and dilutes as the population grows; Strava's
   segments regenerate every ride. Same mechanic class, opposite trajectory.
2. **Voluntariness with an exit.** The same real-time ranked-rate display is
   Peloton's leaderboard and Disneyland's laundry "electronic whip"; a rider
   chose the class and can hide the board, a laundry worker could do neither.

`M-07` fails both, which is a better reason than any effect size.

This is also the answer to why `also_seen_in_failures` is a required field. Had
the graph mined only winners, every mechanic in it would look causal.

`H-04` is the translation, recorded as `killed` with both citations, so the
anti-library has a fingerprint to match against.
