---
id: M-11
type: mechanic
title: Perfect information, minus one deliberate hole
primitives:
  trigger: state-change
  cost_to_produce: low
  visibility: self-only
  reciprocity: no
  durability: session
  reversibility: yes
  forgiveness: yes
  optimum_direction: personal-band
  precondition: none
seen_in:
  - product: Into the Breach — every enemy action telegraphed, randomness stripped, one chance element kept on purpose
    url: https://www.gdcvault.com/play/1025772/-Into-the-Breach-Design
    date: 2019-03-18
    class: E2
    retrieval: indexed
    why_not_e1: GDC 2019 postmortem (Matthew Davis, Subset Games); the vault page and the slide PDF both blocked in harvest 1
  - product: Slay the Spire — enemy intent icons; the original interface almost killed the game
    url: https://www.youtube.com/watch?v=r_BPJzNPF6M
    date: 2019-05-02
    class: E2
    retrieval: indexed
    why_not_e1: Ars Technica War Stories with Yano and Giovannetti; read via search index only
also_seen_in_failures:
  - XCOM ships the opposite answer successfully — displayed hit chance is deliberately not the computed one. Same genre, same era, opposite choice, both shipped. See M-15
produces:
  - B-03
---

**The finding, and it is the sharpest in harvest 1.** Into the Breach strips
randomness almost entirely so that every death is the player's own fault. Aside
from spawns, the **only** chance element left is "Resist" — a small possibility
that a city block survives. The stated reason it exists:

> if players knew for certain they were going to lose from the next enemy
> attack, there was no reason to hit End Turn.

**Total certainty of a bad outcome destroys the commit action.** Not motivation,
not mood — the *button*. A sliver of doubt is load-bearing.

Slay the Spire is the same lesson from the other side: the underlying systems
were fine and the original interface nearly killed the game, because the player
could not see what was coming well enough to decide.

**What travels here.** A plan the athlete can see they will fail is a plan they
will not start. That is not a tone problem to solve with softer copy — it is a
structural property of showing someone a complete, accurate forecast of their own
shortfall. The product already knows this in one place: `reentry.ts` scales the
first session back rather than presenting the full week someone has already
missed, and the header says the failure mode is *"tone plus size"*.

**The cost of the mechanic, stated by its own designer:** perfect information
does not scale. It is bought with a board small enough that the information is
*readable*, not merely available. A six-pillar dashboard cannot have it.

**Not yet a candidate.** The translation this suggests — never render a forecast
the athlete cannot act on — overlaps `H-05` and `H-07` closely enough that a
separate hypothesis would be refused by the novelty floor. Recorded as a
mechanic, left for a later cell.
