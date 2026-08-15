---
id: M-01
type: mechanic
title: Proposal with a visible diff
primitives:
  trigger: state-change
  cost_to_produce: low
  visibility: self-only
  reciprocity: no
  durability: durable-record
  reversibility: yes
  forgiveness: yes
  optimum_direction: personal-band
  precondition: none
seen_in:
  - product: GitHub pull request
    url: https://docs.github.com/en/pull-requests
    date: 2026-08-15
    class: E1
  - product: Google Docs suggesting mode
    url: https://support.google.com/docs/answer/6033474
    date: 2026-08-15
    class: E1
also_seen_in_failures:
  - Google Wave inline threaded edits — the same proposal-and-history machinery shipped with under a million users a year after general availability
produces:
  - B-03
---

**The parts, separated from the skin.** A change is *proposed* rather than
applied · the proposal is *visible as a difference from what stood before* ·
feedback attaches to the thing rather than living beside it · approval is what
changes state · the history survives the decision.

None of that is about code review. It is the machinery for *making a change to
someone's work legible and consented*, and it travels — design handoff, legal
redlines, expense approval, and a coaching plan that adapts itself weekly.

**Why the failure column matters here.** Wave had proposals, attached feedback,
durable history and real-time visibility, and it died anyway. So the mechanic is
not sufficient on its own; what it needs is a change the recipient already cares
about and would otherwise have to accept blind. That precondition is satisfied
here in a way it was not at Wave: the Coach already rewrites the athlete's week,
and today it does so without showing its work.

**What it must not become.** The diff is `self-only`. A proposal visible to
anyone else is a different mechanic with a different primitive row, and it dies
against `X-01`.
