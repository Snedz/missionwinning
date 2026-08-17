---
id: M-09
type: mechanic
title: The adjustment narrates itself
primitives:
  trigger: state-change
  cost_to_produce: low
  visibility: self-only
  reciprocity: no
  durability: durable-record
  reversibility: yes
  forgiveness: yes
  optimum_direction: personal-band
  precondition: existing-habit
seen_in:
  - product: Garmin adaptive training plans
    url: https://the5krunner.com/2024/11/12/garmin-adaptive-plans-get-improved-explanations/
    date: 2024-11-12
    class: E1
    retrieval: fetched
also_seen_in_failures:
  - Strava Athlete Intelligence and Garmin Active Intelligence — narration layers with nothing under them. The first went viral in 2024 for telling a user hit by a car that their data showed a consistent athlete; the second was reviewed as good for nothing after a month
produces:
  - B-03
---

**The parts.** Each prescription states three things: **what the session is
trying to achieve · how to execute it · why the change was suggested.** The third
is the rare one.

**Why this node exists at all.** Harvest 1 swept the whole category — Strava
Instant Workouts, a programming app, a bodyweight coach app, a bike-class app IQ, a progression logger, RP,
Juggernaut — and **Garmin is the only one that ships the third clause.** Everyone
else emits an output and asserts it. RP is a partial exception by accident: it
does not explain per session, but it publishes its target variable, so the logic
is auditable from outside.

That makes a narrated adjustment a **differentiator by omission**, which is the
most useful kind to find. It is also direct support for `H-02`.

**The failure column is the important half.** Both mocked products shipped
narration *without* substance. Strava's insight layer became a meme; Garmin's
Active Intelligence picks which single insight to surface at app-open and was
panned. So the mechanic is not "add explanatory copy" — it is **the explanation
being derived from the same computation that produced the change.** Narration
detached from the engine is a worse product than silence, because it invites the
athlete to check and then fails the check.

`precondition: existing-habit` — there is nothing to explain a change *from*
until the athlete has a prior week.
