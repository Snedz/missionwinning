# Live hop

The open hop only. Not CONTEXT, not GRAPH_LOOP, not LOG.
Write this **before** the first product edit. Clear it back to this
template after the row is marked `done`. `npm run harness:done` is the
closer — the agent's last message is not.

ticket: leftover-leaderboard-first-paint
done_means: Leaderboard first paint is house leftover (title + board), not RouteLoading. Do not invent room chrome.
accept: npx tsx --test src/lib/leaderboardFirstPaintHonesty.test.ts
test_written: yes

## progress

Honesty test written first (3 red). Route is a static import. `?board=` / `?scope=` / `?class=` server-resolved.
Accept green. Walk: `/leaderboard` HTML has Leaderboard + Optional ranks; no "Loading Leaderboard". Do not invent room chrome.

## decisions

- `?board=` / `?scope=` / `?class=` stay server-resolved on the route. Do not restyle the board.
- Stamp stays `.1058`. Not a letter. Do not run harness:done.
