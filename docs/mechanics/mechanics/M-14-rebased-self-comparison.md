---
id: M-14
type: mechanic
title: Re-base the comparison on the current version of you
primitives:
  trigger: completion
  cost_to_produce: low
  visibility: private
  reciprocity: no
  durability: durable-record
  reversibility: yes
  forgiveness: yes
  optimum_direction: personal-band
  precondition: existing-habit
seen_in:
  - product: Strava Annual Best Efforts — bests tracked per calendar year so the target is the most relevant version of you
    url: https://stories.strava.com/articles/whats-new-on-strava-new-languages-annual-best-efforts-and-weekly-streak-stickers
    date: 2026-04-01
    class: E2
    retrieval: indexed
    why_not_e1: search-index synthesis only; press.strava.com and stories.strava.com were blocked in harvest 1
also_seen_in_failures:
  - Lifetime-PR framing across most logging apps — the same data, never re-based, quietly turning an aging or returning athlete's own history into an unreachable opponent
produces:
  - B-02
---

**The parts.** The comparison target is **re-based on a rolling window** rather
than fixed at the all-time best · the old record still exists and is still
reachable · the athlete can see both · nobody else is involved.

**Why it is interesting here specifically.** Almost every mechanic in the wild
that increases return behaviour does it by putting another person on the screen,
and `X-01` forbids that outright — social comparison is an input-integrity attack
on a planner that reads logs alone. This one increases the same behaviour with
**no second athlete**, because the opponent is a previous version of the same
person and the product chooses which one.

That makes it structurally clean. It is not automatically clean on **tone**: a
rebased comparison is still a comparison, and `X-03` forbids copy that frames an
absence as a loss. A translation would have to survive `reentryCopyGuard`.

**Where it already half-lives.** `docs/THESIS.md` names the split — the Mission
Score is *"a weekly grade that resets"* and points are *"the odometer"*. The
resetting grade is exactly this mechanic applied to the week. What is not rebased
is anything in `/history` or the PR surfaces, which compare against the all-time
best.

**Uncomfortable fact from the same source, recorded rather than hidden.** Strava
shipped this in the same release as Weekly Streak Stickers — a share-to-feed
social artifact. The mechanics arrived together; only one of them is legal here.
Harvesting the pair and taking one is the whole method.
