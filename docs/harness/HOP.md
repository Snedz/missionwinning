# Live hop

The open hop only. Not CONTEXT, not GRAPH_LOOP, not LOG.
Write this **before** the first product edit. Clear it back to this
template after the row is marked `done`. `npm run harness:done` is the
closer — the agent's last message is not.

ticket: leftover-account-first-paint
done_means: Account first paint is house leftover (sign-in / return / prefs), not RouteLoading or a useSearchParams skeleton.
accept: npx tsx --test src/lib/accountFirstPaintHonesty.test.ts
test_written: yes

## progress

Honesty test written first (3 red). Route is a static import; `?authError=`
resolved on the server. Accept 3/3.

## decisions

- Same defect class as `/welcome` `.765` and `/active` `.1058`.
- Do not restart Learn / Move / Mind `useSearchParams`. You kit RouteLoading is next leftover.
- Stamp stays `.1058`. Not a letter. Do not run harness:done.
