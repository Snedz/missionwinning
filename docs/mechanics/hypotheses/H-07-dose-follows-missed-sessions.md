---
id: H-07
type: hypothesis
title: The first session back scales with sessions missed, not days elapsed
one_line: If the returning dose is keyed to planned sessions actually missed rather than to calendar days away, then more athletes finish that first session, because the relief lands on demonstrated struggle instead of on the calendar.
targets: B-02
translates: M-12
removes: the days-elapsed branch as the sole input to doseScale — the calendar stops being the thing that decides how hard the way back is
move_class: change
cost_class: M
smallest_test: build two histories with the same fourteen-day gap, one from an athlete who planned four sessions a week and one who planned one, and assert the returning dose differs.
bar_kind: existing-instrument
instrument: src/lib/reentryCopyGuard.test.ts — extended with a dose assertion alongside the three shame axes
kill_criterion: the planned-session count cannot be recovered from stored logs without inference, or any variant requires the athlete to rate themselves
guardrail: the athlete is never asked to declare a level, and the quiet line still names no absence length — the club-identity and absence-length axes of the tone contract must stay green as this grows
reversibility: one input to an existing pure function; restoring the day counter restores today's behaviour
preconditions_hold:
  precondition_none: yes — private, self-only, no other athlete and no network
ratchets_touched:
  TODAY_MAX_TOP_LEVEL_BLOCKS: hold
status: candidate
---

**What is wrong with the calendar.** `computeReentry` fires between two and
ninety days and scales the first session by `doseScale`. `REENTRY_MIN_DAYS = 2`
exists because *"one rest day is part of training"*, which is already an
admission that the day counter is the wrong unit — it needed a floor bolted on to
stop it firing at people who were fine.

The floor does not fix the general case. An athlete who trains once a week and
missed nothing looks identical, at fourteen days, to one who planned four
sessions a week and missed eight. The first is on schedule. The second is in
trouble. Both get the same twenty-minute version.

**What Hades does instead.** God Mode starts at 20% resistance and adds 2% **per
failed run**. It never asks the player to assess themselves; it watches. The
percentage banks when toggled off, so relief is a resource the system grants on
evidence rather than a label the player accepts.

The contrast case is the one that makes this precise. Celeste asks the player to
set dials up front, which put the whole weight on the wording — and the wording
had to be rewritten because it **"felt othering"**, leaving players insulted for
needing help. Any version of this hypothesis that surfaces a chooser inherits
that problem. The guardrail is written to forbid it.

**Already half-present, which is why this is `change` and not `add`.** The engine
already knows the planned week — `CoachPlan.sessions` carries `status` of
`planned | done | missed | swapped`, and `adaptPlan` marks misses deliberately;
a thirty-line comment records that deleting those markers once killed the whole
adaptation story. The count this hypothesis needs is already computed. It is
simply not what `reentry.ts` reads.

**Where it fails.** If the miss count cannot be recovered without inference — a
cold-start athlete with no plan, freestyle logging with no prescription — the
kill criterion fires and the day counter stays. That is a real possibility, not a
formality: `adapt.ts` explicitly drops unplaceable past days on a cold start
rather than labelling them missed.
