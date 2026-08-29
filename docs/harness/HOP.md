# Live hop

The open hop only. Not CONTEXT, not GRAPH_LOOP, not LOG.
Write this **before** the first product edit. Clear it back to this
template after the row is marked `done`. `npm run harness:done` is the
closer — the agent's last message is not.

ticket: leftover-guidebook-first-paint
done_means: Guidebook first paint is house leftover (title + chapter list), not RouteLoading. Do not restyle guidebook internals. Course / chapter stay parked.
accept: npx tsx --test src/lib/guidebookFirstPaintHonesty.test.ts
test_written: yes

## progress

Honesty test written first (red 2 / green 1). Accept green (3/3 + houseChrome / context / log / Learn leftover). Walk: `/learn/guide` HTML is title + chapter list (`Beyond the Basics`), not Loading Guidebook. Internals not restyled. Course / chapter stay parked.

## decisions

- Route leftover only (`/learn/guide`). Do not restyle guidebook internals.
- Stamp stays `.1058`. Not a letter. Do not run harness:done.
