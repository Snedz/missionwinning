---
id: M-12
type: mechanic
title: Relief keyed to observed struggle, never to a declared level
primitives:
  trigger: completion
  cost_to_produce: low
  visibility: private
  reciprocity: no
  durability: durable-record
  reversibility: yes
  forgiveness: yes
  optimum_direction: personal-band
  precondition: none
seen_in:
  - product: Hades God Mode — starts at 20% damage resistance, gains 2% per failed run, caps at 80%, banked when toggled off
    url: https://hades.fandom.com/wiki/God_Mode
    date: 2020-09-17
    class: E2
    retrieval: indexed
    why_not_e1: search-index synthesis only; the egress proxy blocked every fetch in harvest 1
  - product: Celeste Assist Mode — granular dials the player sets, and a documented rewrite of the explanatory text
    url: https://www.vice.com/en/article/celeste-assist-mode-change-and-accessibility/
    date: 2019-09-09
    class: E1
    retrieval: fetched
also_seen_in_failures:
  - a streak league Energy, 2025 — an adjustment applied to everyone with no opt-out and no revert, replacing a system paying users could switch off entirely. Same axis, moved the wrong way, and it produced public quitting
produces:
  - B-02
---

**The pair is the point.** Both are difficulty relief in acclaimed games. They
differ on one thing, and it is the thing that matters here.

**Celeste** asks the player to choose dials — game speed, dash count,
invincibility — *before* they know what they need. That framing put the whole
weight on the wording, and the wording needed a walk-back: it referenced the
*intended* experience and players reported it **"felt othering"**, leaving them
insulted for needing the assists at all. The text was rewritten.

**Hades** removes the self-assessment entirely. Resistance starts at 20% and
climbs 2% **per failed run** — it responds to demonstrated struggle, banks the
percentage when toggled off, and never requires the player to say *"I am bad at
this."* Kasavin's stated goal: *"take the sting of failure and reduce that as
much as possible."*

Note also the shape of the dial. Thorson's own claim is that the useful assist
options are the **in-between** ones — slowing the game 20%, one extra dash —
rather than options that make it trivial.

**What this product does today, and where it differs.** `reentry.ts` scales the
first session back by `doseScale`, keyed to **elapsed calendar days**
(`REENTRY_MIN_DAYS = 2`, long-gap at 14, lapsed past 90). That is the Celeste
axis measured by the calendar rather than declared by the athlete — better than
asking, and still not what Hades does. Hades would key it to **sessions actually
missed against sessions planned**, which is demonstrated struggle rather than
elapsed time. Somebody who trains once a week and misses nothing looks identical
to a lapse under a day counter.

`H-07` is that translation.
