# Live hop

The open hop only. Not CONTEXT, not GRAPH_LOOP, not LOG.
Write this **before** the first product edit. Clear it back to this
template after the row is marked `done`. `npm run harness:done` is the
closer — the agent's last message is not.

ticket: leftover-log-set-house-press
done_means: Log set under .mw-house is --house-press ink (#18181b), not poster red.
accept: npx tsx --test src/lib/workout/setTableLogSetHousePress.test.ts
test_written: yes

## progress

Honesty test written first (3 red / 1 already green). Log set className + leftover
`.house-set-log` rule under compose-live. Accept 4/4.

## decisions

- Slice starts at `data-testid="set-table-log-set"` so house classes follow that attribute.
- Press is `--house-press` / #18181b via `.house-btn-primary` + leftover `.house-set-log`.
- Finish / Skip / Swap / Form guide / Repeat last stay not filled.
- Stamp stays `.1058`. Not a letter. Do not run harness:done — leftover on #889.
