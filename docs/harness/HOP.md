# Live hop

The open hop only. Not CONTEXT, not GRAPH_LOOP, not LOG.
Write this **before** the first product edit. Clear it back to this
template after the row is marked `done`. `npm run harness:done` is the
closer — the agent's last message is not.

ticket: leftover-benchmarks-first-paint
done_means: Benchmarks first paint is house leftover (title + stats / empty), not RouteLoading. 1RM chart stays parked.
accept: npx tsx --test src/lib/benchmarksFirstPaintHonesty.test.ts
test_written: yes

## progress

Honesty test written first. Accept green (3/3 + houseChrome / context / log / leaderboard / visibility). Walk: `/benchmarks` HTML is title + empty (`No benchmark data yet`), not `Loading Benchmarks`. 1RM chart stays parked.

## decisions

- Route leftover only. Do not restyle Benchmarks cards / 1RM chart internals.
- Stamp stays `.1058`. Not a letter. Do not run harness:done.
