---
id: H-06
type: hypothesis
title: An existing ritual carries the identification ask
one_line: If the offer to keep your history rides an occasion the athlete already observes, then more of them identify themselves, because the ask arrives inside something they were doing anyway rather than as a wall.
targets: B-06
translates: M-04
removes: the standalone identification prompt — the ask stops being its own moment and becomes a line inside an existing one
move_class: add
cost_class: M
smallest_test: not runnable today. Any honest version needs a second person and a calendar occasion that means something to them.
bar_kind: existing-instrument
instrument: src/lib/week4Logger.test.ts — the traction assertion, which is the only part of this that can be checked today
kill_criterion: the ask appears before the product has been useful, or any variant requires a manufactured occasion rather than one the athlete already keeps
guardrail: first-set completion rate, which must not move at all — an identification prompt that touches the free path has become a wall, and the free logger is never gated
reversibility: one line in an existing surface; deleting it removes the ask entirely
preconditions_hold:
  social_graph: no — no users, no reciprocity partner, and no invite can be sent while MAIL_POSTAL_ADDRESS is unset
status: blocked-on-telemetry
---

**Recorded now, deliberately unbuilt.** This is the strongest mechanic in the
seeded graph and the one it would be most tempting to act on, which is exactly
why it is written down with its precondition failing rather than left as an
instinct someone acts on later.

**What the source actually did.** Digitising red envelopes for Spring Festival
2014 folded a bank-card binding — the most expensive conversion in consumer
software — inside a gift game with a calendar deadline nobody had to be sold on.
Roughly forty million envelopes moved that festival; a billion the following New
Year's Eve. Nobody was asked to add a payment method. They were asked to join in,
and the reciprocity made the second participant do the setup too.

**The substitution this product needs.** The expensive step here is not payment.
Payment is muted by a default-true flag until the EIN lands and no agent touches
that. The expensive step is identification, and `docs/THESIS.md` already fixes
the shape of the offer: the score resets weekly and the odometer does not, so
*"your history outlives your phone"* is a reason to identify that an athlete
actually wants — offered after value and never as a wall.

**Why it stays blocked.** `M-04` requires a social graph. There is not one. The
temptation is to build the single-player half now and add reciprocity later, and
that is worth naming as the failure mode it is: the single-player half is just a
prompt, and a prompt on the free path is the wall this hypothesis exists to
avoid. The precondition is arithmetic, and wanting it to hold does not make it
hold.
