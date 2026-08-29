# Live hop

The open hop only. Not CONTEXT, not GRAPH_LOOP, not LOG.
Write this **before** the first product edit. Clear it back to this
template after the row is marked `done`. `npm run harness:done` is the
closer — the agent's last message is not.

ticket: leftover-guide-chapter-first-paint
done_means: Guide chapter first paint is house leftover (title + body), not RouteLoading. Do not restyle chapter internals. Course stays parked.
accept: npx tsx --test src/lib/guideChapterFirstPaintHonesty.test.ts
test_written: yes

## progress

Honesty test written first (red 2 / green 1). Accept green (3/3 + houseChrome / context / log / guidebook / kaizen 565). Walk: `/learn/guide/human-performance` HTML is title + body (`Human Performance Science`), not Loading Guide. Internals not restyled. Course stays parked.

## decisions

- Route leftover only (`/learn/guide/[chapterId]`). Do not restyle chapter internals.
- Stamp stays `.1058`. Not a letter. Do not run harness:done.
