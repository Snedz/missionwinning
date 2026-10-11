# Done contract

A builder is done only when all three are true:

1. The file exists. The change is in the tree, not only described.
2. `npm run verify` exits 0.
3. That verify output is pasted in the builder's final message (and in the PR body when a PR is opened).

The output that counts is the summary: each step `PASS`, `FAIL`, or `SKIP`, then `VERIFY PASS` or `VERIFY FAIL`, and the wall time. A claim of done without that output is not done.

`npm run verify` is the merge bar. `npm run gate` stays the full local gate (coverage, production build, Playwright). Verify does not nest gate. See [PLAN-verify.md](PLAN-verify.md) and [TEST_AUDIT.md](TEST_AUDIT.md).

## Three failures, then stop

After 3 failed attempts at the same blocker, stop. Name the blocker in the final message. Do not take a fourth attempt at that same failure.

## Never lower the bar

Never lower a coverage floor, a bundle budget, or a test threshold to get green.

Do not edit `scripts/coverage.mjs`, `scripts/bundle-budget.mjs`, or a ratchet number so this command passes. If a step is already red on `master`, say so in the PR and leave the floor where it is.
