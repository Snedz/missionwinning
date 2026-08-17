# src/lib/loopQueue

**One concern:** deciding which loop runs next, from
[docs/GRAPH_LOOP.md](../../../docs/GRAPH_LOOP.md). Printed by
`npm run harness`; procedure in
[docs/AGENT_RECIPES.md](../../../docs/AGENT_RECIPES.md) §14.

Build tooling that happens to be typed. `npm run harness` still **prints**.
`npm run idea:paste` writes one harvest row — that is the harvest baton.

## Files

| File | Concern |
|---|---|
| `parse.ts` | The `## Queue` region as a shape. Tables addressed by header name, status read from the parsed cell |
| `route.ts` | Live ticket → build (11) · gauntlet (12) · harvest (13) · path (15) · stalled, plus the single-row-section ratchet (`IL-*` closes the run) |
| `criticalPath.ts` | ORCHESTRATION checklist (W then H0) when the queue is empty and harvest emits nothing |
| `hop.ts` | Live hop file (`docs/harness/HOP.md`) — ticket / done_means / accept. Closer is `npm run harness:done` |
| `pasteHarvest.ts` | Write one `IL-` harvest section. Called by `npm run idea:paste` |

## Why this is code and not another paragraph

Three protocols now sit behind one queue and the choice between them lives in
prose: `AGENT_RECIPES.md` §11 says "if that row is a gauntlet campaign, stop and
use recipe 12", and the `GRAPH_LOOP` copy-paste prompt does not mention the idea
loop at all. That is a routing table written three times in three files, which is
the condition `.178` exists to prevent.

Two things here could not be prose at all.

**Status is a value, not a word.** `grep '`open`'` over `docs/GRAPH_LOOP.md`
returns thirteen hits, nine of them prose, and three of the remaining table rows
are `done` rows whose *Moves* text contains "open" — `D1` ("open beta"), `K2`
("when the beta opens"), `N1` ("open / private beta"). A router that reads text
names the wrong live ticket on a file nobody edited wrongly. `parse.test.ts` uses
those three as its acceptance case.

**`MAX_SINGLE_ROW_RUN` is the first mechanical form of "Do not invent X2".** Rows
per `Now` section, in document order, are `7 7 8 4 2 1 2 1 1 1 1 1 2 1 1 1 1 1 1
1 1 1 1 1 1 1 1 1 1` — a trailing run of sixteen one-row sections, which recovers
by measurement the number [docs/IDEA_LOOP.md](../../../docs/IDEA_LOOP.md) states
about itself. Every one of those blocks ends with the literal words *"Do not
invent X2."* Written sixteen times, obeyed zero. As a ratchet it may only go
down: a new `Now` section carries two rows, or the queue takes a harvest first.

A text-similarity check was tried first and rejected on measurement — consecutive
Jaccard over the drift rows' Moves cells ran 0.07–0.50, indistinguishable from
the H0 and G batches at 0.00–0.17. Those rows repeat structurally, not lexically.
The reasoning is kept in `route.ts` so nobody re-derives it.

## Related

- Queue and its rules: [docs/GRAPH_LOOP.md](../../../docs/GRAPH_LOOP.md)
- Grading: [docs/GAUNTLET_LOOP.md](../../../docs/GAUNTLET_LOOP.md)
- Generation: [docs/IDEA_LOOP.md](../../../docs/IDEA_LOOP.md) · [src/lib/ideaGraph/](../ideaGraph/INDEX.md)
