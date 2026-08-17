---
id: H-10
type: hypothesis
title: Retire a pillar surface no logged behaviour supports
one_line: If a secondary surface is retired once logs show nobody reaches it, then the wedge gets clearer, because every surface costs first paint, i18n parity, sitemap entries and a QA matrix whether or not anyone opens it.
targets: B-04
translates: M-08
removes: one parked-or-live secondary surface, chosen by evidence rather than by taste
move_class: remove
cost_class: S
smallest_test: not runnable today. Choosing the surface honestly requires logs from athletes who are not the founder.
bar_kind: existing-instrument
instrument: src/lib/surface.test.ts — parking is already reversible with one env var and deletes no code
kill_criterion: the surface chosen is one the athlete reached but did not convert from, which is a different problem with a different fix
guardrail: the wedge is structurally unrepresentable as a parked surface, so no version of this may reach the logger — and secondary pillars stay free-usable rather than becoming a paid tier by subtraction
reversibility: parking is one environment variable and deletes nothing
preconditions_hold:
  existing_habit: no — this needs athletes whose behaviour can be observed, and PRIVATE_MODE is on with no invite sendable
status: blocked-on-telemetry
---

**Written now, deliberately unbuilt, because the temptation is to guess.**

The machinery is already built and unusually good. `src/lib/surface.ts` can park
any of fifteen surfaces with one environment variable, deletes no code, and makes
*"logger off"* structurally unrepresentable. `railGroupsForNav` drops parked
hrefs and empties groups, because *"a rail entry that 404s is worse than no
entry."* Five surfaces are already parked by default with the cost stated
plainly: each one costs first paint, i18n parity, sitemap entries, an API attack
surface and a QA matrix — *"before a single user exists."*

**What is missing is not the mechanism. It is the evidence.** Choosing which
surface to retire without logs is choosing by taste, and taste dressed as
evidence is worse than taste admitted.

**Two cautionary cases from the harvest, pointing in opposite directions.**

Fitbit removed Challenges, Adventures, trophies and Open Groups in March 2023,
citing *"a limited number of active users compared to other offerings"* — a usage
threshold, published, no outcome data.

a bike-class app filtered its Feed to achievement-only posts in February 2025 and **rolled
it back** around May 2026, then split it into All / Following / My Teams. The
reported reason for the rollback is the one worth carrying: members used the feed
for **ordinary day-to-day activity**, not milestones. High-signal filtering
destroyed the mundane-presence value that made the surface worth opening at all.
A usage metric would not have caught that in advance.

So the kill criterion is written against exactly that: if the surface turns out
to be one athletes *reach* but do not convert from, retiring it is the wrong
move and the finding belongs elsewhere.

**Why it stays blocked.** `precondition: existing-habit` fails. There are no
athletes to observe. `H-01` — powering the measurement chain — is upstream of
this and of most of the `measure` column.
