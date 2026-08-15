---
id: H-05
type: hypothesis
title: Take one tap out of the cold path to a first set
one_line: If the blank first set row arrives pre-filled with a proposal the athlete can accept or overwrite, then more strangers save a set, because the pressure removed is having to already know your numbers.
targets: B-01
translates: M-06
removes: one tap from the cold-open path, and with it the empty-row-expects-an-expert moment — TAP_BUDGET comes down rather than holding
move_class: remove
cost_class: M
smallest_test: run the hero walk from a cold /welcome with the budget lowered by one and assert a working set still lands, unchanged in every other respect.
bar_kind: existing-instrument
instrument: tests/e2e/first-90.spec.ts — the same walk, one tap cheaper
kill_criterion: the walk cannot lose a tap without either pre-filling a number the athlete did not produce or moving a decision behind a default they cannot see
guardrail: the saved set must still be the athlete's own — a pre-filled value that gets accepted unread is a fabricated log, and a fabricated log is an input-integrity failure exactly as bad as the one X-01 guards
reversibility: the budget is a constant in one spec; restoring it restores the path
preconditions_hold:
  social_graph: yes — dropped. Only the decoupling half of this mechanic is taken; the public, reciprocal, network-bound half is left behind
ratchets_touched:
  TAP_BUDGET: lower
  TODAY_MAX_TOP_LEVEL_BLOCKS: hold
status: candidate
---

**The part taken, and the part left.** `M-06` is Stories, and most of it is
useless here: public, reciprocal, network-bound. One part is not. *Decoupling the
act of creating from the permanent record* is what dropped the cost of posting on
a network where the feed had become a portfolio — and the logger has the same
shape of problem in miniature. A blank set row with a weight field expects
someone who already knows their numbers, which is exactly the athlete this
product says it is for and exactly the one it does not have yet.

**Why this sits in the `remove` cell.** It is the only ratchet in the repo whose
intended direction of travel is down, and `docs/JOURNEY.md` already states the
law in prose — five taps max. A generator with no subtraction operator grows
monotonically; this is the cell that stops that, and the deletion quota exists to
make sure something lands here at least once every five rows whether or not it
feels exciting.

**The guardrail is the interesting half.** A pre-filled number that gets accepted
unread is a fabricated log. `progression.ts` already computes a defensible next
target and `PREV` is already shown in the set row, so there is a legitimate
version — propose the athlete's own last performance, visibly, as something to
overwrite. There is also an illegitimate version that would score identically on
taps. The guardrail is what separates them, and it is why the kill criterion
names the failure rather than the metric.
