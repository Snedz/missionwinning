---
id: H-08
type: hypothesis
title: The Coach diff appears only when the change is material
one_line: If the week's diff is shown only when the adaptation is material, then athletes keep reading it, because a consent surface that arrives every week regardless of content stops being read regardless of content.
targets: B-03
translates: M-10
removes: the unconditional weekly appearance of the adapt surface — the banner stops being a fixture and becomes an event
move_class: remove
cost_class: S
smallest_test: generate two consecutive weeks whose sessions differ only in ordering, and assert no diff surface mounts.
bar_kind: existing-instrument
instrument: src/lib/coach/adapt.test.ts — a materiality threshold beside the existing sessionsEqual comparison
kill_criterion: materiality cannot be defined from the plan shape alone and needs a judgement call per athlete, or the threshold silences a change the athlete would have wanted
guardrail: adaptation itself must not become invisible — the count of weeks where the plan changed and the athlete was never told is the number that must stay near zero
reversibility: one predicate in front of an existing surface
preconditions_hold:
  precondition_none: yes — self-only, no network, no other athlete
ratchets_touched:
  TODAY_MAX_TOP_LEVEL_BLOCKS: hold
status: candidate
---

**This exists to protect `H-02` from a documented failure.** `H-02` proposes
showing the Coach week as a diff against last week — the pull-request mechanic,
`M-01`. `M-10` is the same machinery measured at scale, and it does not hold:
roughly **85% of Dependabot security pull requests go unmerged**, and the
**most common** browser SSL warning had the **lowest** adherence rate. Nothing
about those interfaces was wrong. Only the arrival rate was.

A weekly plan generates a weekly diff. That is fifty-two consent prompts a year
for an athlete whose week usually did not change much. `M-01` never declared the
precondition it depends on — that proposals are scarce relative to attention —
and this is the node that pays for it.

**Why `remove` rather than `add` a threshold.** Because the thing being deleted
is the guarantee. Today `adaptSummary` produces beats whenever there are beats
and the surface mounts when `hasCoachAdaptationSignal` is true. The change is not
new logic bolted on; it is the removal of *"and therefore we tell them."*

**`.207` already got half of this right and is worth reading first.** The
revision number used to increment unconditionally, so `CoachAdaptBanner` told
every athlete on every visit that their week had adapted — including when nothing
changed. The fix made the revision *earned* by diffing sessions field-wise,
because *"an unchanged week is not an adaptation."* This hypothesis is the same
argument one level up: a changed week is not necessarily a change worth
interrupting for.

**The guardrail is the hard part, and it points the other way.** Suppress too
much and the product silently reshapes someone's training without telling them —
which is precisely the failure `.207` was fixing in the opposite direction. So
the paired metric is not engagement: it is the count of weeks where the plan
changed and nobody said so. That number going up is this hypothesis failing, even
if every other number improves.

**What the literature says does not work:** making the surface louder or more
severe. What does: **variation**, and **grouping** many small changes into one
durable summary rather than a stream.
