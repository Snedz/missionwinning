---
id: H-15
type: hypothesis
title: The next lift stays off screen until the current set is logged
one_line: If the first session withholds the next exercise until the current set is logged, then more strangers finish a working set, because the next beat cannot interrupt the one act that counts.
targets: B-01
translates: M-17
removes: any first-session chrome that presents the next lift before a set exists on the board
move_class: add
cost_class: S
smallest_test: cold /welcome → Start → assert the next exercise is not the thing under the thumb until Log set has fired.
bar_kind: existing-instrument
instrument: tests/e2e/first-90.spec.ts — one assertion that the next-lift control is absent until a set is logged
kill_criterion: the next lift is already absent until a set is logged, so the assertion cannot fail, or making it true adds a tap
guardrail: TAP_BUDGET holds; the free logger stays reachable; no modal in front of Log set
reversibility: one visibility rule on the first-session next-lift control
preconditions_hold:
  precondition_none: yes — a logged set is already the act this product detects
ratchets_touched:
  TAP_BUDGET: hold
status: candidate
---

**What Wait To Play is here.** Yousician pauses the song until the note. The
note analog on a first Mission Winning session is a logged set, not a form
score. The next beat is the next lift, not a Coach week.

**Where it is already true.** The logger is built around the current set. If
the next lift is already off-screen until Log set, this hypothesis is a
stepping stone in an empty `activate+add` cell and the kill criterion fires.

**Where it fails.** A version that waits for "correct form" needs a sensor.
A version that adds a confirm before Log set is a tap. Both are kills.
