# docs/graph/

> One concern: the live hop contract. Not the queue, not Neo4j recall.

| File | Role |
|------|------|
| [HOP.md](HOP.md) | The open hop — ticket, one-sentence done, accept command |
| [PINNED.md](PINNED.md) | Rules that must be re-read after compaction (≤40 lines) |

The queue stays [GRAPH_LOOP.md](../GRAPH_LOOP.md). History stays LOG + CONTEXT.
Closer: `npm run graph:done` (`scripts/graph-hop-done.ts`). Parser: `src/lib/loopQueue/hop.ts`.

Do not add `SPEC.md` / `PLAN.md` / `PROGRESS.md` / `DECISIONS.md` here — those
names already mean other things in this repo.
