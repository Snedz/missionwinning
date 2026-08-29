# Live hop

The open hop only. Not CONTEXT, not GRAPH_LOOP, not LOG.
Write this **before** the first product edit. Clear it back to this
template after the row is marked `done`. `npm run harness:done` is the
closer — the agent's last message is not.

ticket: leftover-fuel-first-paint
done_means: Fuel first paint is house leftover (title + notepad / today log / remaining), not RouteLoading. Search / barcode / recipes stay parked.
accept: npx tsx --test src/lib/fuelFirstPaintHonesty.test.ts
test_written: yes

## progress

Honesty test written first (2 red / 1 already green). Route is a static import.
Accept green. Walk next.

## decisions

- Route leftover only. Do not restart Fuel notepad / today log / remaining chrome.
- Stamp stays `.1058`. Not a letter. Do not run harness:done.
