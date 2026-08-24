# Live hop

The open hop only. Not CONTEXT, not GRAPH_LOOP, not LOG.
Write this **before** the first product edit. Clear it back to this
template after the row is marked `done`. `npm run harness:done` is the
closer — the agent's last message is not.

ticket: .956 E-Victory close receipt
done_means: After Finish, a finished session shows one private keepable receipt (sets, load, vs-last if we have it, duration if we have it) on first paint. Empty session shows no fake receipt. Guest sees it. No public permalink.
accept: npm test -- src/lib/workout/victoryReceipt.test.ts src/lib/workout/victorySheetChrome.test.ts src/lib/workout/victoryCopyGuard.test.ts src/lib/workout/activeSessionFinish.test.ts src/lib/firstSetUngated.test.ts
test_written: yes

## progress

Plan frozen in docs/PLAN.md. `.944` covers vs-last math. This hop is first-paint density + private keep.

## decisions

- Reuse `WorkoutVictorySheet`. No `/victory` route.
- Promote `VictoryReceiptStrip` to first paint; do not copy it inside Show all.
- Private text download of this session. Not a public workout URL.
- Do not rewrite `pickPriorSameShapeSession`.
- Do not remount Coach. Do not touch Today.
