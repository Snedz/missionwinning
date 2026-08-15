---
id: H-11
type: hypothesis
title: Show a readiness number calibrated to how athletes misread it
one_line: If the readiness figure shown is tuned to the athlete's predictable misreading rather than to the computation, then it produces the intended behaviour, because people read a percentage emotionally rather than mathematically.
targets: B-03
translates: M-15
removes: the correspondence between what the engine computed and what the athlete is told — which is the thing being spent, not a side effect
move_class: add
cost_class: S
smallest_test: none legal. Every version requires shipping a number the code knows to be untrue.
bar_kind: existing-instrument
instrument: src/lib/week4Logger.test.ts — which fails the build rather than grading the idea
kill_criterion: fired on arrival
guardrail: none available — any guardrail would have to be measured with the same instrument the hypothesis proposes to falsify
reversibility: not applicable
preconditions_hold:
  precondition_none: yes — and holding preconditions is not a defence when the constitution refuses it outright
violates:
  - X-07
status: killed
---

Kept because the argument behind it is **good**, which is exactly what makes it
dangerous. A graph that only recorded obviously-bad ideas would be a graph nobody
needed.

**The case for it, stated fairly.** Jake Solomon shipped this in XCOM 2 and
defended it on the record: *"That 85 percent isn't actually 85 percent. Behind
the scenes, we wanted to match the player's psychological feeling about that
number."* His reasoning is empirical — a player reads 85% as *"that basically
should not miss"* rather than as a fifteen-in-a-hundred loss. Rather than fight
the reading, the system was tuned until outcomes matched it. It shipped in an
acclaimed game and hidden assists run on every difficulty except the top one.

Translated here it is tempting: readiness is a composite the athlete already
misreads, low numbers read as failure, and nudging the displayed value would
plausibly produce better training decisions.

**Why it is dead.** `X-07`. This codebase is built on the opposite instinct and
has paid for it repeatedly: `load.ts` returns `null` under fourteen days rather
than a plausible-looking ratio, and says so in its header — *"a number you cannot
sign is worse than one you know is high."* `.207` made the adapt banner earn
itself by diffing. `.607` renamed the Mission Score's parameters so lifetime data
became a typecheck failure, on the grounds that a flattering number was the one
thing this codebase would not ship.

A readiness figure calibrated to misreading is that discipline inverted and
pointed at the athlete's own body.

**Note the dissenting population, because it is the tell.** A Steam mod exists
purely to remove XCOM's hidden assists. Some users want the number to be true,
and they had to write software to get it. In a training product those users are
the ones who would notice a deload that never fired.

**What survives, and it is genuinely useful.** The observation — *a technically
correct number can still mislead* — is true and the graph keeps it in `M-15`. The
legal response is to change **which number is shown**, not the truth behind it: a
band instead of a point estimate, a unit the athlete reads correctly, or nothing
at all under fourteen days. `loadGuard.ts` already does the honest version, and
it is the reason this node's fingerprint is in the anti-library rather than its
idea being in the queue.
