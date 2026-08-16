---
id: M-18
type: mechanic
title: New work is withheld while due work is unfinished; a missed day does not raise tomorrow's new quota
primitives:
  trigger: state-change
  cost_to_produce: low
  visibility: private
  reciprocity: no
  durability: ephemeral
  reversibility: yes
  forgiveness: yes
  optimum_direction: personal-band
  precondition: none
seen_in:
  - product: Anki daily limits
    url: https://docs.ankiweb.net/deck-options.html#daily-limits
    date: 2026-08-16
    class: E1
    retrieval: fetched
  - product: Anki FAQ — spaced repetition algorithms
    url: https://faqs.ankiweb.net/what-spaced-repetition-algorithm
    date: 2026-08-16
    class: E1
    retrieval: fetched
also_seen_in_failures:
  - Inbox-zero and "catch-up" email that dumps every missed message the day you return — the quota did not hold, so the first session back is a flood
produces:
  - B-02
  - B-03
  - B-04
backfires:
  - behavior: B-01
    how: if the only available act is classified as "new work" and there is no due work yet, the cap hides the first set
    class: E3
---

**The parts.** The product already knows two piles: work that is *due*
(reviews, unfinished prescribed sessions) and work that is *new* (cards never
seen, lifts the week has not introduced). While the due pile is at its cap,
the new pile is not presented. A missed calendar day resets the new quota to
the same number — it does not add yesterday's unused new slots.

This is not M-17 (withhold the next beat until the current act). M-17 waits
inside one session for one log. This waits *across* the day or week: new
prescription stays off while unfinished prescription still exists.

**Precondition.** `none` only because this product already stores planned vs
logged. A version that needs the athlete to declare a backlog, or a sensor
for "correct form," fails the field.

**Discarded this harvest (not this mechanic).** Lichess Puzzle Streak
(changelog 2021-03-29): one miss ends the run. `forgiveness: no` on a first
set is a gate, and the skip token is already M-03. Beeminder Bright Red Line
(contract page): enforcement is a charge. `X-02` forbids gating the logger;
the week-delay on slope change is a different primitive and was not promoted.
