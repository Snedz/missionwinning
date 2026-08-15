---
id: M-06
type: mechanic
title: Lowered creation pressure
primitives:
  trigger: none
  cost_to_produce: low
  visibility: public
  reciprocity: yes
  durability: ephemeral
  reversibility: yes
  forgiveness: yes
  optimum_direction: more
  precondition: social-graph
seen_in:
  - product: Instagram Stories
    url: https://techcrunch.com/2017/04/13/instagram-stories-bigger-than-snapchat/
    date: 2017-04-13
    class: E1
also_seen_in_failures:
  - Threads at launch — a low-friction posting surface with enormous distribution whose daily actives fell roughly seventy per cent within two weeks, because cheap posting was never the scarce thing on that network
produces:
  - B-05
---

**The parts.** Posting is decoupled from the permanent record, so the stakes of
creating drop · the artifact expires, so it need not be good · viewers are
listed back to the creator, which is an attendance receipt rather than a score ·
replying is private and cheap · the expiry itself is a reason to post again.

The lesson usually drawn is "ephemerality works", which is the skin. The lesson
worth keeping is that **the binding constraint was creation pressure**, and the
mechanic removed it. Instagram supplied distribution; the mechanic supplied the
missing low-friction surface. Threads is the control condition: the same
distribution, a low-friction surface, and it did not hold, because on that
network cheap posting was not what was scarce.

**Why it is in this graph despite `precondition: social-graph`.** Only one of its
parts needs a network. *Decoupling the act from the permanent record* does not —
and that half is directly transplantable to a logger, where the equivalent
pressure is the blank set row that expects you to already know your numbers. A
translation may take one part and leave the rest, provided it says which part it
took; `H-05` does exactly that and drops the public, reciprocal, network-bound
half entirely.
