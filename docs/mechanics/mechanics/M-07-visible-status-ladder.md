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
    class: E1
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
    class: E1
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

`H-04` is the translation, recorded as `killed` with both citations, so the
anti-library has a fingerprint to match against.
