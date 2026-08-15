---
id: M-08
type: mechanic
title: A receipt of the same measurement the product runs on
primitives:
  trigger: calendar
  cost_to_produce: low
  visibility: private
  reciprocity: no
  durability: durable-record
  reversibility: yes
  forgiveness: yes
  optimum_direction: personal-band
  precondition: none
seen_in:
  - product: Whoop weekly and monthly performance assessments
    url: https://www.whoop.com/us/en/thelocker/
    date: 2026-08-15
    class: E2
    retrieval: indexed
    why_not_e1: search-index synthesis only; no scout in either run could open the page (egress proxy blocked every fetch), so the citation is a pointer, not a reading
  - product: Mission Winning under-the-hood retention readout
    instrument: src/lib/week4Logger.ts
    value: retained_week_4 computed on-device and shown at /account/under-the-hood
    date: 2026-08-15
    class: E0
also_seen_in_failures:
  - Year-in-review recaps built from a separate analytics pipeline — the user-facing number and the internal number drift, and the recap becomes marketing rather than a receipt
produces:
  - B-02
  - B-03
---

**The parts.** The product measures the user to do its job · it shows the user
that same measurement rather than a prettier parallel one · the showing is
private · the number is dated, so it can be re-checked.

The discipline is in the second part. When the receipt is generated from a
separate pipeline it drifts from the number the product actually acts on, and
then it is advertising. When it is the same number, instrumenting the user and
serving the user are the same act — which is the only version of measurement
this constitution permits, since `X-07` forbids inventing traction and the
device-local rollup *"must never be rendered as X users retained"*.

**Why this is the highest-value node in the seeded graph right now.** Every other
behaviour here is `blocked-on-telemetry`. Nothing in the archive can be graded on
behaviour until one measurement chain runs end to end on a real install. This
mechanic is the one whose translation unblocks the others, and it does so
without needing a single additional user — the founder's own dogfood install is
a cohort of one, and a cohort of one is not traction, it is a wiring test.

That is `H-01`, and it is the `measure` cell's elite.
