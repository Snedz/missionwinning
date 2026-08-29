# Live hop

The open hop only. Not CONTEXT, not GRAPH_LOOP, not LOG.
Write this **before** the first product edit. Clear it back to this
template after the row is marked `done`. `npm run harness:done` is the
closer — the agent's last message is not.

ticket: leftover-course-first-paint
done_means: Course first paint is house leftover (title + locked / empty), not RouteLoading. Do not restyle CourseReader internals.
accept: npx tsx --test src/lib/courseFirstPaintHonesty.test.ts
test_written: yes

## progress

Honesty test written first (red 3/3). Accept green (3/3 + houseChrome / context / log / chapter / locked preview / surface). Walk: `/learn/course` HTML is title (`Specialist courses`), not Loading Course. CourseReader internals not restyled.

## decisions

- Route leftover only (`/learn/course`). Do not restyle CourseReader / locked preview internals.
- Stamp stays `.1058`. Not a letter. Do not run harness:done.
