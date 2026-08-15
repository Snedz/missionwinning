# Ledger — what each harvest cost and what it yielded

One row per run. The stop rules in `docs/IDEA_LOOP.md` read this file; nothing
else does.

**Budget from the failure rate, not the hope rate.** Roughly a third of
well-designed experiments move their metric at a mature experimentation
platform, and an evolutionary agent working against *perfect machine-checkable
evaluators* improved on the state of the art in about a fifth of the open
problems it attempted. This product's evaluator is weaker than either — no
ground truth, a feedback loop measured in weeks, and currently no users at all.
So the design target is not a high hit rate. It is that **a losing idea costs
close to nothing.**

Unused cap is success. That rule is inherited from GNT-1, where the campaign
hard cap is ≤14 build PRs and spending fewer is the good outcome.

---

## Runs

| run | date | scout | anatomist | translator | red team | cap declared | spent | emitted | survived red team | later PASS |
|---|---|---|---|---|---|---|---|---|---|---|
| seed | 2026-08-15 | — | — | — | — | 1 PR | 1 PR | 0 | — | — |

The seed run harvested nothing. Its nodes were hand-written from repo truth and
one research pass, which is why the scout, anatomist, translator and red-team
columns are empty rather than zero — those roles do not exist until Phase 3.

---

## Derived, per run

- **Cost per surviving candidate** — the ratchet. If this rises run over run
  beyond a factor, the source region is mined out; move to a different source
  class rather than spending more on the same one.
- **Marginal yield** — candidates that survived the constitution filter *and*
  novelty *and* landed in an unfilled cell. Two consecutive runs at zero means
  stop, and it is the measured replacement for the prose rule that failed:
  *"Do not invent X2."*

## Standing cost rules

- The frozen cached prefix is the primitive ontology, every constraint node, and
  product context. Candidates under judgement go after the last breakpoint —
  which is also where the decision-relevant material belongs for attention
  reasons. The two constraints agree.
- Never switch models inside one cached conversation; caches are model-scoped
  and a swap invalidates the whole prefix. Tier by spawning a subagent instead.
- Harvest and bulk re-scoring are not interactive. Batch them.
- No timestamps, UUIDs or unsorted JSON in the cached prefix. Any byte change
  invalidates everything after it, silently.
- Cadence is weekly. The outside world does not produce new mechanics hourly,
  and a harvest that runs hourly is a token bonfire with a progress bar.
