---
id: H-03
type: hypothesis
title: The Coach witnesses the specific thing, with nobody else present
one_line: If the return line names what the athlete actually did rather than how long they were away, then more of them train that session, because acknowledgement from something that read the logs is the working half of kudos.
targets: B-02
translates: M-02
removes: the absence-shaped framing itself — the quiet line's subject stops being the gap and becomes the session, so there is one fewer place the product counts days off
move_class: add
cost_class: S
smallest_test: seed a history whose last session was hard, trigger re-entry at three, seven and fourteen days, and assert the line cites a stored set and never the gap length.
bar_kind: existing-instrument
instrument: src/lib/reentryCopyGuard.test.ts — the three shame axes plus a new assertion that the line quotes a log
kill_criterion: the line cannot be built from a stored set without inference, or any variant needs a number the athlete did not produce
guardrail: the club-identity axis of the outbound tone contract — no XP, rank, tier, leaderboard, badge or squad language may appear as this copy grows
reversibility: one copy path behind the existing re-entry component; deleting it restores the current quiet line
preconditions_hold:
  precondition_none: yes — witnessed-by-one means the Coach, and the Coach is already the only party that has read the logs
ratchets_touched:
  TODAY_MAX_TOP_LEVEL_BLOCKS: hold
status: candidate
---

**The decomposition doing the work.** Kudos as a feature is public, reciprocal and
sits on a ranked network, and it is forbidden here twice over. The part that
produces the measured effect is smaller: acknowledgement from something that
knows what the effort cost. Runners receiving kudos from a clubmate were
measurably more likely to add a session.

In this product there is exactly one party that qualifies and carries no standing
of its own — the Coach. It has read every set. It cannot rank anyone, because
`X-01` means it cannot see anyone.

**What changes.** Today the line is shame-free but absence-shaped: *"Seven days
off. Here's the 20-minute version."* Kind, and still about the gap. The
translation makes the subject the work — the last hard session, the lift that was
progressing — and lets the shorter dose follow from it rather than from the
counter.

**Why the guardrail is the tone contract and not an engagement number.** This is
the axis where a metric-only optimiser reliably lands on streak anxiety, because
loss framing genuinely does move short-horizon engagement. The paired guardrail
is what makes that trade visible instead of profitable: the `club-identity` regex
gets stricter as this copy grows, not looser.

**Honest limit.** Like everything on this axis it cannot be graded on behaviour
until the gate flips. What can be graded now is that the line quotes a stored set
and never infers one — which is the same discipline `logCitation.ts` already
holds the Coach to.
