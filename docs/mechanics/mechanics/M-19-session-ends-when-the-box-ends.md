---
id: M-19
type: mechanic
title: The session ends when the time box ends; more work is not the next beat
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
  - product: Pomodoro Technique
    url: https://en.wikipedia.org/wiki/Pomodoro_Technique
    date: 2026-08-16
    class: E1
    retrieval: fetched
  - product: Forest focus timer
    url: https://forestapp.cc/
    date: 2026-08-16
    class: E1
    retrieval: fetched
  - product: Duolingo Energy
    url: https://blog.duolingo.com/duolingo-energy/
    date: 2025-07-03
    class: E1
    retrieval: fetched
also_seen_in_failures:
  - Duolingo Hearts — a mistake tax that stopped beginners mid-lesson; the company replaced it because the box punished being wrong, not using the session
produces:
  - B-01
  - B-02
  - B-04
backfires:
  - behavior: B-01
    how: if the box can fire before the first set is logged, the rest is an interstitial on the hero path
    class: E3
---

**The parts.** A session is given a bound (a timer, a battery, a length the
athlete picked). When the bound is reached the product **stops offering more
work** and the next beat is a break or a finish, not another lift. Starting
another box is a new session, not a continuation of this one.

This is not M-17 (wait for the current act). This is not M-18 (new work waits
on unfinished due work). The due pile can still be open; the box still ends.

**Precondition.** `none` if the bound is time or a count this product already
has (elapsed session, sets logged). A bound that needs a heart-rate sensor or
a payment to lift the cap fails the field.

**Discarded this harvest (not this mechanic).** Forest Plant Together: the
tree dies for the whole room — `precondition` is a group. Forest tree-death
as shame copy. Duolingo gem/ad refill: that is a gate on continuing, and
`X-02` forbids gating the logger.
