---
id: M-03
type: mechanic
title: Pre-authorized forgiveness
primitives:
  trigger: absence
  cost_to_produce: low
  visibility: private
  reciprocity: no
  durability: durable-record
  reversibility: yes
  forgiveness: yes
  optimum_direction: personal-band
  precondition: existing-habit
seen_in:
  - product: Duolingo streak freeze
    url: https://blog.duolingo.com/how-duolingo-streak-builds-habit/
    date: 2024-01-01
    class: E1
  - product: Mission Winning planned rest
    instrument: src/lib/plannedRest.ts
    value: streakFromDatesAllowingRest — a declared rest day does not break the run
    date: 2026-08-15
    class: E0
also_seen_in_failures:
  - Snapchat streaks without any freeze — the same counter, no insurance, and the documented result is obligation rather than enjoyment and credential-sharing to keep runs alive
produces:
  - B-02
backfires:
  - behavior: B-02
    how: without the insurance half, the counter converts a voluntary act into a perceived daily duty and breaking it reads as failure
    class: E2
    why_not_e1: the streak-distress literature is largely correlational and commentary rather than experimental
---

**The non-obvious half.** A streak is usually copied as a counter. The counter is
not what works. What works is that the counter can be **protected in advance** —
the user decides *before* the miss that a miss is allowed, so when it happens it
does not read as a failure of identity.

Strip the counter entirely and the mechanic still stands: pre-authorized
forgiveness is a promise made by the athlete to their future self, and the
product's job is to honour it without commentary.

**Already true here, and worth recording as such.** `plannedRest.ts` plus
`streakFromDatesAllowingRest` means a declared rest day does not break the run,
and `src/lib/rewards/INDEX.md` states the surrounding rule — the weekly train
goal is the boss consistency signal, not daily streak shame.

That is why this node produced no candidate. A generator that correctly declines
to build what already exists is `GRAPH_LOOP` rule 3 arriving by itself, and it
is worth more than a novel-looking proposal.
