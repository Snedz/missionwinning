---
id: M-04
type: mechanic
title: An existing ritual carries the hard step
primitives:
  trigger: calendar
  cost_to_produce: low
  visibility: witnessed-by-one
  reciprocity: yes
  durability: durable-record
  reversibility: yes
  forgiveness: yes
  optimum_direction: more
  precondition: social-graph
seen_in:
  - product: WeChat red envelopes, Spring Festival 2014
    url: https://www.forbes.com/sites/davidyin/2015/02/19/tencents-wechat-sends-1-billion-virtual-red-envelopes-on-new-years-eve/
    date: 2015-02-19
    class: E1
also_seen_in_failures:
  - Google Plus circles bound to an existing Gmail graph — an existing relationship structure did not carry the new behaviour, and the product was shut for low adoption and limited interaction
produces:
  - B-06
---

**The parts.** A ritual that already exists and already has a date · a hard
deadline the calendar supplies for free · a high-friction setup step folded
inside the play rather than presented as a step · reciprocity that makes the
second participant do the setup too.

Digitising *hongbao* moved a bank-card binding — normally the most expensive
conversion in consumer software — inside a gift-giving game with a fixed
calendar deadline. Nobody was asked to add a payment method; they were asked to
join in.

**Translating it here needs one substitution.** This product's expensive step is
not payment. Payment is muted by a default-true flag until the EIN lands, and no
agent touches that. The expensive step is **identification** — and `docs/THESIS.md`
is explicit that the relationship must be *offered after value and never as a
wall*.

**Why this stays honest rather than becoming a candidate today.** The precondition
is `social-graph`, and there is not one: no users, no invites sendable while
`MAIL_POSTAL_ADDRESS` is unset, no reciprocity partner to receive anything. That
is arithmetic, not taste, and it is the reason `H-06` is `blocked-on-telemetry`
rather than a proposal someone has to argue against.
