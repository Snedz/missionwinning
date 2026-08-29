# Live hop

The open hop only. Not CONTEXT, not GRAPH_LOOP, not LOG.
Write this **before** the first product edit. Clear it back to this
template after the row is marked `done`. `npm run harness:done` is the
closer — the agent's last message is not.

ticket: leftover-history-list-first-paint
done_means: History list first paint is house leftover (title + list/empty), not RouteLoading. Calendar / charts stay parked.
accept: npx tsx --test src/lib/historyListFirstPaintHonesty.test.ts
test_written: yes

## progress

Honesty test written first (2 red / 1 already green). Route is a static import.
Accept green. Walk: `/history` HTML has `house-history` + Workout History; no "Loading History". "Loading sessions" stays hydrate honesty. Calendar / charts stay parked.

## decisions

- Do not rewrite HistoryPage list internals or unpark calendar / charts / posters.
- Stamp stays `.1058`. Not a letter. Do not run harness:done.
