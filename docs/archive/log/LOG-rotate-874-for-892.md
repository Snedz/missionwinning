# Rotated from LOG.md for `.892`

## 2026-08-16 — The override a branch never asked for (`.874`)

`check-excellence-gate` read its commit messages from `git log base...HEAD` —
the **symmetric difference**, which carries every commit on the *base* side the
branch has not merged yet. 24 of the last 40 `master` commits carry an
`Excellence-Override:` trailer, so a branch even one commit behind `master`
borrowed one and shipped surface paths while RESULT is `unscored`. Measured,
not argued: a fixture branch with one commit, no trailer and one surface file
printed `✓ excellence unscored (override)` and exited 0 — an override it never
asked for, named in the output as though it had. The identical branch rebased
onto the tip blocked. So the stop-rule was deciding on **how recently someone
else had merged**, which is exactly why it reads from the outside as an
arbitrary build blocker: the same change passes or fails on a fact about
`master`, not about the change.

The two dot counts are correct in exactly one pairing, and nothing about
reading `log` next to `diff` suggests they should differ. The **diff** wants
`base...HEAD` — changes since the merge base, *what this branch touched*. The
**log** wants `base..HEAD` — commits this branch adds, *who consented*. Only
one of those is a range that can consent to anything. Each verb now ships with
its own range as full argv (`overrideLogArgs` / `changedPathDiffArgs`), so the
pairing is unswappable at the call site rather than something a guard has to
police after the fact.

The guard runs against a **real repository** instead of asserting a git-fixture
count. **4 mutants killed:** three-dot log, two-dot diff, and both swapped
pairings.

**Ship:** `overrideCommitRange` / `changedPathRange` + argv pairs in
`excellenceGate.ts` · `check-excellence-gate` wiring · 3 git-fixture guards.
File 10 → 13 tests.

Label `.874` (onto master `.873`).
