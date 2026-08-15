# docs/mechanics — the graph

**One concern:** the nodes the Idea Loop reasons over. Protocol lives in
[../IDEA_LOOP.md](../IDEA_LOOP.md); this folder is data.

Not a queue ([GRAPH_LOOP](../GRAPH_LOOP.md) owns that), not a status block
([CONTEXT.md](../../CONTEXT.md) `## Now` owns that), not a grading protocol
([GAUNTLET_LOOP](../GAUNTLET_LOOP.md) owns that).

---

## Layout

| Path | Holds | ID |
|---|---|---|
| `behaviors/` | A behaviour we want more or less of, in our product | `B-NN` |
| `mechanics/` | Machinery observed in the world, as a primitive configuration | `M-NN` |
| `hypotheses/` | mechanic × behaviour × form, with an instrument and a kill criterion | `H-NN` |
| `verdicts/` | What happened. Written whether the idea won or lost | `V-NN` |
| `constraints/` | A constitution rule **plus a pointer to its live enforcer** | `X-NN` |
| `inbox/` | Raw observations awaiting an anatomist. **Not nodes** | — |
| `ANTILIBRARY.md` | Killed ideas and unciteable sources. Always loaded | — |
| `LEDGER.md` | Per-run cost and yield | — |

A file under this folder that is in none of those places and not in `NOT_A_NODE`
fails `npm run idea:validate`. Discovery, not enumeration — a tree like this
grows a file nobody wires up, and that is `.220` waiting to happen.

## Budgets

**≤6000 bytes per node file. ≤60 nodes per type.**

Stated here because a cap nobody can see is a cap nobody keeps — the same reason
`CONTEXT.md` `## Now` prints its own bullet budget. Enforced in
`src/lib/ideaGraph/validate.ts`, which also fails if this line stops matching the
constants.

Over budget → split the node, or rotate a settled one to `docs/archive/mechanics/`
**and leave its anti-library row where it is.**

## Adding a node

1. `npm run idea:pack <behaviour-class>` for what you are allowed to read. Do not
   open this folder wholesale — a large archive of near-duplicates in context
   makes a model worse, not just slower.
2. Copy the shape of an existing node of that type. Fields are a closed set in
   `src/lib/ideaGraph/schema.ts`; an unknown key fails.
3. A mechanic is recorded as **primitives**, never as prose. If you can write it
   without the ontology, you have recorded a feature and not a mechanic.
4. Every hypothesis needs `removes`, `guardrail` and `kill_criterion`. None of
   the three is optional and none may be answered with a shrug.
5. `npm run idea:validate`, then `npm run idea:next` to see whether it would be
   emitted and, if not, which rule refused it.

## Current fill

Generated — `npm run idea:cells` prints this, and `ideaGraphContract.test.ts`
fails if the two disagree. The command does not write the file: a command that
edits a doc as a side effect is how the doc stops being read.

| | activate | return | trust | depth | tell | pay |
|---|---|---|---|---|---|---|
| **add** | — | H-03 · H-04 killed | H-11 killed | — | — | H-06 blocked-on-telemetry |
| **change** | — | H-07 | H-02 | — | — | — |
| **remove** | H-05 | — | H-08 | H-10 blocked-on-telemetry | — | — |
| **measure** | H-01 | H-09 | — | — | — | — |

Empty cells are not a backlog. They are where the next harvest is pointed, and a
candidate that scores badly while occupying one is kept as a stepping stone
rather than ranked away.

**Aim a harvest with `uncoveredCells`, never `unvisitedCells`.** The first real
harvest was very nearly aimed at the wrong one — see `select.ts`.

## Related

- Protocol · roles · stop rules — [../IDEA_LOOP.md](../IDEA_LOOP.md)
- Where an emitted row goes — [../GRAPH_LOOP.md](../GRAPH_LOOP.md)
- How it is then graded — [../GAUNTLET_LOOP.md](../GAUNTLET_LOOP.md)
- Code — [../../src/lib/ideaGraph/INDEX.md](../../src/lib/ideaGraph/INDEX.md)
