# Done Contract — Mission Winning

A card, PR, or agent task is **done** only when every line below is true. "Code written" is not done.

1. **Verify passes.** `npm run verify` exits 0 on the PR branch, and the PR body contains the `── verify summary ──` block from that run (not paraphrased).
2. **CI is green.** All required GitHub checks pass on the head commit. A red check is never merged "because it's flaky" — rerun once, then fix or stop.
3. **One PR per card.** A retry updates the existing branch/PR; it never opens a second PR for the same card. Duplicates are closed pointing to the kept PR.
4. **Proof is attached.** The PR or card links the evidence: test output, screenshot, dry-run log, or merge SHA. The card's `Outcome:` is `SHIPPED <sha>` only after merge.
5. **Tests earn their place.** New or changed tests pass the authoring gate in [TEST_AUDIT.md](TEST_AUDIT.md).
6. **Rails respected.** No secrets, env values, `PRIVATE_MODE`, or `paymentUrl` changes unless the card explicitly owns them; no deploys or promotes from an agent lane; nothing to `master` except via a merged PR.
7. **Stop rule.** After 3 failed attempts at the same step, stop, record the blocker on the card, and hand off. Do not loop.

If any line is false, the status is `NEEDS_REVIEW` or `BLOCKED`, not `DONE`.
