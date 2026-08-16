# Rotated from LOG.md when `.865` landed

## 2026-08-15 — One command decides which loop runs (`.850`)

Three protocols now sit behind one queue — `GRAPH_LOOP` builds, `GAUNTLET_LOOP`
grades, `IDEA_LOOP` generates — and choosing between them was prose, written three
times. `AGENT_RECIPES` §11 says "if that row is a gauntlet campaign, stop and use
recipe 12"; the `GRAPH_LOOP` copy-paste prompt says the same thing differently and
does not mention the idea loop at all; §13 names its own trigger in a third place.
A routing table with three homes is what `.178` exists to prevent, and it was only
reachable from inside the repo.

**Ship:** `npm run graph` (`queue:next` is the same command) — `src/lib/loopQueue/` + `scripts/queue-next.ts`.
It reads the `## Queue` region of `GRAPH_LOOP.md` and names the live ticket, the
route (`build` · `gauntlet` · `harvest`), the recipe, the workbench and its `Next
spawn` line, and any `founder`/`blocked` row it stepped over. Like `idea:next` it
prints and never writes: the `done` edit is still the baton. Recipe **14** is the
procedure, including finding the repo from another directory.

**Two things that could not stay prose.**

*A grep cannot read this file.* `grep '`open`'` over `GRAPH_LOOP.md` returns
thirteen hits, nine of them prose, and three of the remaining table rows are
`done` rows whose *Moves* text contains the word — `D1` ("open beta"), `K2`
("when the beta opens"), `N1` ("open / private beta"). A router keyed to that
spelling names the wrong live ticket on a file nobody edited wrongly. So tables
are addressed by header name and status is read from the parsed cell; those three
rows are the acceptance test.

*`MAX_SINGLE_ROW_RUN` is "Do not invent X2" with teeth.* Rows per `Now` section,
in document order, are `7 7 8 4 2 1 2 1 1 1 1 1 2 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1`
— a trailing run of **sixteen** one-row sections, recovering by measurement the
number `IDEA_LOOP.md` states about itself. That sentence is written at the foot of
sixteen consecutive blocks and was obeyed zero times. As a ratchet it may only go
down: a new `Now` section carries ≥2 rows, or the queue takes a harvest first. It
never displaces a live `open` row — it bites at the moment one closes.

**Rejected on measurement, recorded so nobody re-derives it.** The first design
was a text-similarity check reusing `tokenize`/`jaccard` from `ideaGraph`.
Consecutive Jaccard over the drift rows' Moves cells came back
0.07 / 0.23 / 0.00 / 0.36 / 0.00 / 0.50 — indistinguishable from the H0 and G
batches at 0.00–0.17. Those rows repeat *structurally*, not lexically. A check
that does not separate is not a check, so it was dropped rather than tuned.

**Found by the parser on its first run:** `D4`'s status is `hold`, a state used in
earnest (it closes ~20 section blocks) and absent from the file's own status key,
and unbackticked besides. The key was stale, not the row; both corrected.

**Falsified, 6 mutants, each alone:** status read as a line grep (5 red) · section
filter widened to include the Parallel lane (2) · the `GNT-*` branch deleted (3) ·
the ratchet counting sections of 1 *or* 2 (4) · a drifted-header table silently
skipped instead of reported (1) · the `founder`/`blocked` skip made silent (1).
Baseline 0.

`/graph` is the machine-local skill over this — `~/.claude/skills/graph/`, never
`.claude/skills/` (hard rule 6), following the gstack precedent in `CLAUDE.md`
§gstack. It is a loader: locate and *verify* the repo, boot the spine, run
`npm run graph`, take that one route, ship one PR, print the next spawn. Where it and
the repo disagree, the repo wins.

**Found by the router disagreeing with the workbench, and it was mine.** The
`Next spawn` reader picked the role with `ROLES.find(...)`, which scans in *this
file's* declaration order — so `SMOOTHER — U1–U4 critic PASS … Then LEAD writes
the campaign report` reported **`LEAD U1`**: `LEAD` because it is first in the
array and named as the step *after* this one, `U1` out of the range `U1–U4` that
describes what is already done. Two positional readers, both answering from
incidental text rather than from the sentence — `.220` again, in the file written
to stop it. Role is now the earliest role *in the line*; the unit is only read
from the `<ROLE> on **U<n> R<r>**` shape every spawn line actually uses, so a
SMOOTHER round correctly has no unit. Replayed against all five real `Next spawn`
lines this campaign and GNT-1 have carried; both readers falsified independently.

Label `.850` (onto master `.849`). Cut twice before this: `.847`, taken by
GNT-2 U2 (#677) while this was open, then `.849`, taken by GNT-2 U4 (#684) the
same way. Stealing an occupied label is a standing ban (loop rule 5), so this
renumbered both times rather than force-landing.

Excellence-Override: dev tooling, no product surface (RESULT unscored)

Rotated LOG oldest → [docs/archive/log/LOG-rotate-835-for-850.md](docs/archive/log/LOG-rotate-835-for-850.md).
