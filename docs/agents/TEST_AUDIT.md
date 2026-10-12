# Test Audit — authoring gate and audit sweep

> Adapted for Mission Winning from the `test-audit` skill in
> [openclaw/openclaw](https://github.com/openclaw/openclaw/tree/main/.agents/skills/test-audit)
> (MIT License, © OpenClaw contributors). Trimmed and re-pointed at this repo's tooling (`tsx --test`, `npm run verify`).

Two modes, one value bar. **Authoring** gates every new or changed test at write time. **Audit** sweeps for tests that re-assert source, duplicate stronger proof, or couple to implementation. Optimize for confidence, not deletion count.

## Authoring gate

Before adding a test, answer all four. A missing answer means don't add it yet.

1. What observable behavior, invariant, or contract does it protect?
2. What credible regression makes it fail?
3. Why doesn't existing coverage already catch that? Each contract has one primary owner test at the strongest boundary; prefer extending a table-driven case over a near-duplicate.
4. Does it need a production seam (export, flag, wrapper) no production caller needs? If yes, test at the real boundary instead.

Bug regression tests must **fail on the pre-fix code** and pass after the fix. One regression at the owning boundary is enough.

## Junk patterns (reject on authoring, hunt on audit)

- assertion-free coverage probes; self-comparisons
- copied fixtures, manifests, or export lists
- exact source / import / string greps (unless it is the cheapest guard of a user-facing contract)
- duplicate invocations of the same contract across layers
- tests whose only purpose is keeping test-only exports alive; dead code only tests call
- expected values produced by the helper under test
- mocks that implement the behavior being asserted
- negative controls that pass for an unrelated reason
- names that promise more than the input exercises

## Retention bar

Keep a test when it independently enforces a public API, route contract, config, migration, storage, security, i18n parity, payment/gating, or architecture contract — and keep observable ordering and credible regressions. "Static" or "slow" is not a reason to delete. A retained test that fails on baseline is a possible product bug: reproduce and fix the owner.

## Audit evidence (record before deleting anything)

- test name + file; what failure it can detect
- non-test callers of what it covers
- stronger remaining proof, or why none is needed
- history / why it exists; what deletion it unlocks
- risk + focused command (`npx tsx --test path/to/x.test.ts`)

## Validation

1. Run the focused tests, then `npm run verify`.
2. `git diff --check`; report production LOC vs test LOC separately.
3. One coherent PR per batch; paste the verify summary in the body.
