---
id: M-20
type: mechanic
title: The current surface is a date filter; undated capture stays off it until given a day
primitives:
  trigger: calendar
  cost_to_produce: low
  visibility: private
  reciprocity: no
  durability: ephemeral
  reversibility: yes
  forgiveness: yes
  optimum_direction: personal-band
  precondition: none
seen_in:
  - product: Things 3 Today / Inbox
    url: https://culturedcode.com/things/support/articles/4001304/
    date: 2026-08-16
    class: E1
    retrieval: fetched
  - product: Things 3 product page
    url: https://culturedcode.com/things/
    date: 2026-08-16
    class: E1
    retrieval: fetched
also_seen_in_failures:
  - Email clients that dump Inbox onto Today — capture and "do this before the day ends" become one list, so the day opens as a flood
produces:
  - B-01
  - B-02
backfires:
  - behavior: B-01
    how: if the first session is treated as undated capture, Today shows nothing to start
    class: E3
---

**The parts.** Capture can land without a date (Inbox). The list you work from
is a **filter**: start date, deadline, or repeat matches today. An item
scheduled for Saturday is invisible on Today until Saturday, then it hops
in. Unfinished items can be rescheduled. This Evening is still today, just
parked at the bottom.

This is not M-18 (new work waits on unfinished due work). This is not M-19
(the box ends). The primitive is *which surface is allowed to show the
item*, keyed to a calendar day.

**Precondition.** `none` if the product already has a local date and a
planned-vs-inbox distinction. A version that needs a shared family calendar
fails the field.

**Discarded this harvest (not this mechanic).** SuperMemo incremental
reading (portion then later review) sits next to Anki spacing. Kindle
series recap-before-next-book is a different primitive (a summary of the
last completed beat).
