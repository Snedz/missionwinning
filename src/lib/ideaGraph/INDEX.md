# src/lib/ideaGraph

**One concern:** reading, checking and selecting from the idea graph in
[docs/mechanics/](../../../docs/mechanics/INDEX.md). Protocol:
[docs/IDEA_LOOP.md](../../../docs/IDEA_LOOP.md).

Build tooling that happens to be typed. **Nothing under `app/`,
`src/components/` or `src/page-components/` may reach it** — asserted in
`ideaGraphContract.test.ts` using the same import walk `domainBoundary.ts`
performs, because otherwise the whole graph lands in the client bundle and
`bundle-budget.mjs` would be the second thing to notice.

## Files

| File | Concern |
|---|---|
| `parse.ts` | Strict front-matter. A deliberate two-level subset of YAML that **throws** rather than guessing |
| `schema.ts` | The vocabulary — node types, the nine behavioural primitives, archive axes, evidence classes, ratchet names |
| `load.ts` | Discovery. Walks `docs/mechanics/` and fails on an unreviewed file |
| `validate.ts` | Every rule the graph must satisfy, asserted against a parsed shape |
| `derive.ts` | Nodes → candidates; fingerprints; emitted history read back from `GRAPH_LOOP.md` |
| `select.ts` | MAP-Elites selection. The four diversity rules |
| `learn.ts` | Verdicts → status rewrite, kill fingerprints, lessons the next spawn can read |
| `pack.ts` | The bounded context pack a spawn is allowed to read |
| `report.ts` | The archive as a grid. Printed by `idea:cells`, checked against `docs/mechanics/INDEX.md` |

## Why any of this is code at all

`GRAPH_LOOP` and `GAUNTLET_LOOP` are pure prose and both work. This one is not,
for one reason: the rule being replaced was **already prose and already failed**.
Every queue block ends with *"Do not invent X2"*, and sixteen consecutive rows
were the same idea anyway. A diversity rule that cannot go red is a suggestion.

So the split is deliberate — the six role prompts stay fenced prose in
`IDEA_LOOP.md`, and only the selection rules and the schema live here.

## Reading order

1. `schema.ts` — the primitives are the reason a feature cannot be filed as a mechanic
2. `select.ts` header — why nothing here asks a model what it thinks
3. `validate.ts` — one rule per failure this repo has already paid for

## Tests

`parse.test.ts` (grammar rejections) · `validate.test.ts` (mutants, one per
rule, against a temp-root fixture) · `select.test.ts` (each diversity rule alone,
plus the replay of the real Q→AK queue) · `learn.test.ts` (verdicts change the
next pick) · `ideaGraphContract.test.ts` (the shipped graph validates, bundle
safety, doc parity).

The replay is the honest acceptance test: feed the real copy-drift history in
and the selector must refuse the second row. If it emits them, nothing else in
this folder matters.

## Commands

```bash
npm run idea:validate
npm run idea:pack <activate|return|trust|depth|tell|pay>
npm run idea:next
npm run idea:cells
```
