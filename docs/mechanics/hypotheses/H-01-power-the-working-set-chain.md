---
id: H-01
type: hypothesis
title: Power the working-set measurement chain end to end on one real install
one_line: If the set-logged to week-logged to retained-week-4 chain is verified end to end on a dogfood install, then activation stops being ungradeable, because the receipt and the metric become the same number.
targets: B-01
translates: M-08
removes: the unverified assumption that the chain works — plus the standing excuse that no behavioural hypothesis can be graded, which currently applies to every other node in this graph
move_class: measure
cost_class: S
smallest_test: drive one real install through a first working set and a second in a later local ISO week, then assert the device rollup and the server row agree with what /account/under-the-hood renders.
bar_kind: existing-instrument
instrument: src/lib/week4Logger.test.ts — extended from unit assertions to one asserted end-to-end chain
kill_criterion: the chain cannot be made to produce a signed number without a founder-only secret, in which case this is a founder row and not an agent one
guardrail: no new AnalyticsEvent name, no PII in any payload, and no rendered count of other people — asserted by the existing "We do not invent traction" assertion in the same file
reversibility: verification only; nothing new ships to athletes, so there is nothing to withdraw
preconditions_hold:
  precondition_none: yes — a receipt of your own data needs no other athlete and no network
status: candidate
---

**Why this and not something more interesting.** Every other behaviour in the
seeded graph reads `blocked-on-telemetry`. That is honest — `PRIVATE_MODE` is on,
no invite can be sent while `MAIL_POSTAL_ADDRESS` is unset, and there are no
users — but it also means the archive currently has no way to grade a single
behavioural claim. A generator that proposed a shiny mechanic before noticing
that would be producing arguments, not ideas.

The code exists. `week4Logger.ts` fires `set_logged` on every non-warmup set and
`week_logged` on the first of a local ISO week; `mw_week4_retention()` is applied
on production and excludes tombstones; the device rollup renders at
`/account/under-the-hood`. What has never happened is one install walking the
whole chain and the three numbers being compared.

**What this is not.** A cohort of one is not traction and must never be reported
as any. `docs/METRICS.md` already forbids rendering the rollup as *"X users
retained"*, and this hypothesis inherits that verbatim as its guardrail. The
output is a wiring proof, not a result.

**The founder-owned part, named rather than assumed.** The PostHog key is a
secret, and agents do not set secrets. If the chain cannot be closed without one,
the kill criterion fires and this becomes a founder row — which is a legitimate
outcome for a `measure` candidate and much better than a half-verified claim.
