---
id: H-02
type: hypothesis
title: The Coach week arrives as a proposal with a visible diff
one_line: If the adapted week is shown as a difference from last week with the log fact that caused it, then more athletes start the planned session, because an adaptation you can see is one you can consent to.
targets: B-03
translates: M-01
removes: the unexplained revision bump — the adapt banner currently asserts that the week changed without showing what changed, and that assertion surface goes away rather than gaining a sibling
move_class: change
cost_class: M
smallest_test: render Today and Coach against two seeded log histories and assert the diff names the same session count change the engine actually made, with the citing log fact present.
bar_kind: existing-instrument
instrument: src/lib/today/todayBlockBudget.test.ts — the diff replaces the banner rather than adding a block
kill_criterion: the diff cannot be rendered without a seventh top-level block on Today, or it needs a log fact the engine does not already store
guardrail: taps from cold open to a logged set, which must not rise — an explanation that costs a tap has been paid for by the wrong person
reversibility: the diff is one component behind the existing adapt path; removing it restores the banner
preconditions_hold:
  precondition_none: yes — self-only visibility, no other athlete involved, no network
ratchets_touched:
  TODAY_MAX_TOP_LEVEL_BLOCKS: hold
  TAP_BUDGET: hold
status: candidate
---

**The gap is legibility, not capability.** The engine already re-spreads a missed
week, swaps a session on low readiness, caps progression in a high load band, and
refuses to bump its own revision unless sessions genuinely changed — `.207` fixed
the version that told every athlete on every visit that their week had adapted,
on the grounds that *"an unchanged week is not an adaptation."*

But the athlete still receives a conclusion. `adaptSummary` says *"Life happened
— missed Monday. Remaining days are re-spread."* What it does not show is the
before and after, which is the difference between being told and being shown.

**The mechanic underneath a pull request, applied literally.** Propose rather than
apply; show it as a difference; attach the reason to the thing; let approval
change state; keep the history. Concretely: *three sessions became two, because
you logged two of four last week* — with the stored set that proves it, which
`logCitation.ts` already produces and which exists because survey clarity scored
2.56 out of 5.

**Where it could fail, stated in advance.** `X-04` caps Today at six top-level
blocks and the ratchet only goes down, so this cannot be a new card. It has to
replace the banner. If it cannot, the kill criterion fires — and that is the
honest outcome, not a request to raise the budget.

This node is also the proof that the graph is not producing copy-drift. Nothing
in the letter queue that ran Q through AK could have reached it, because the
mechanic came from a developer tool and the queue only ever read this repo.
