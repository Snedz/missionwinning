---
id: B-02
type: behavior
title: An athlete comes back after a gap and trains rather than closing the app
behavior_class: return
observable: event:reentry_shown
measurable: blocked-on-telemetry
source:
  - ORCHESTRATION.md Horizon W criterion 4 — missed day, re-entry without shame
  - src/lib/reentry.ts — the failure is tone plus size, not a missing feature
---

The behaviour with the most mechanics pointed at it in the wild and the most
documented ways to get it wrong. Loss-framed counters move it; they also produce
obligation rather than enjoyment, and in club-sport settings the same social
exposure drives athletes to hide or delete sessions outright.

**What already serves it.** `computeReentry` fires between two and ninety days
and scales the first session back by `doseScale`; the shipped line is *"Two days
off. Here's the 20-minute version."*; planned rest does not break a streak; the
outbound tone contract is regex-enforced across three axes.

The interesting design space left is not *more* re-entry copy. It is whether
anything can acknowledge the return without measuring the absence — which is
what `M-02` is for, and what `M-07` cannot do.
