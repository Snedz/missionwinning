# Live hop

The open hop only. Not CONTEXT, not GRAPH_LOOP, not LOG.
Write this **before** the first product edit. Clear it back to this
template after the row is marked `done`. `npm run harness:done` is the
closer — the agent's last message is not.

ticket: leftover-library-first-paint
done_means: Library first paint is house leftover (title + catalog list), not RouteLoading. Posters / merge stay parked.
accept: npx tsx --test src/lib/libraryFirstPaintHonesty.test.ts
test_written: yes

## progress

Honesty test written first (2 red / 1 already green). Route is a static import.
Accept green. Walk next.

## decisions

- Do not restyle Library posters / merge internals or Show-all extras.
- Stamp stays `.1058`. Not a letter. Do not run harness:done.
