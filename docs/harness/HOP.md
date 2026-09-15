# Live hop

The open hop only. Not CONTEXT, not GRAPH_LOOP, not LOG.
Write this **before** the first product edit. Clear it back to this
template after the row is marked `done`. `npm run harness:done` is the
closer — the agent's last message is not.

ticket: paper .1082 identity CapResult deny consistency
done_means: When a mini lacks identity scope, every identity method returns the same CapResult deny (`scope_denied`). Product minis `l1.health` and `utility.clearshot` keep stub success. No product mini lacks identity — test-only `test.noidentity` is the deny fixture.
accept: npx tsx --test src/lib/mission-os/identity.test.ts packages/mw-core/src/module/capabilities.test.ts
test_written: yes

## progress

PLAN: product minis both declare `identity.read`. Add test-only mini
without identity. Closed `IDENTITY_METHODS` = `read`. Unscoped →
`scope_denied`. Scoped → guest/injected stub success. No auth UI.
No Supabase. No tip-promote.

## decisions

- Do not steal identity from Health or ClearShot.
- Do not reuse `test.billing` as the named deny fixture (it stays the
  billing grant). Assert it also denies identity as a second unscoped
  shape, so the deny is not id-hardcoded.
- Do not add `identity.write` as a fake method this hop — Health and
  ClearShot would then fail "keep stub success."
- ClearShot Android cash stays Next ONE.
