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
| harvest-1 | 2026-08-15 | 3 | inline | inline | inline | ≤10 M / ≤8 H / **0 PR** | 7 M / 5 H / **1 PR** | 0 | 5 of 5 | — |
| harvest-2 | 2026-08-16 | 0 | — | — | — | **1 PR** (paste) | **1 PR** | 1 (`IL-H-01`) | — | — |
| harvest-3 | 2026-08-16 | 0 | — | — | — | **1 PR** (paste) | **1 PR** | 1 (`IL-H-09`) | — | — |
| harvest-4 | 2026-08-16 | 0 | — | — | — | **1 PR** (paste) | **1 PR** | 1 (`IL-H-03`) | — | — |
| harvest-5 | 2026-08-16 | 0 | — | — | — | **1 PR** (paste) | **1 PR** | 1 (`IL-H-08`) | — | — |
| harvest-6 | 2026-08-16 | 0 | — | — | — | **1 PR** (paste) | **1 PR** | 1 (`IL-H-02`) | — | — |
| harvest-7 | 2026-08-16 | 0 | — | — | — | **1 PR** (paste) | **1 PR** | 1 (`IL-H-05`) | — | — |
| harvest-8 | 2026-08-16 | 0 | — | — | — | **1 PR** (paste) | **1 PR** | 1 (`IL-H-07`) | — | — |
| harvest-9 | 2026-08-16 | 3 | 1 | 3 | 1 spawn | ≤3 inbox / ≤1 M / ≤3 H / **0 PR** | 3 inbox / 1 M / 3 H / **0 PR** | 0 | 0 of 3 | — |

The seed run harvested nothing. Its nodes were hand-written from repo truth and
one research pass, which is why the scout, anatomist, translator and red-team
columns are empty rather than zero — those roles do not exist until Phase 3.

**harvest-1 notes.** Three scouts (in-category · out-of-category · negative
corpus), ~110 searches. Anatomist, translator and red-team ran inline rather than
as separate spawns — Phase 3 has not shipped, so the role *separation* that makes
a red team worth having was **not** in force this run. Every candidate below
should be read as translator-graded, and the first genuinely separate red-team
pass is owed.

**The cap was overrun and is recorded as an overrun.** 0 build PRs were declared;
1 was spent, on `.841` — a defect the harvest exposed in the harvest tooling
(`emptyCells` aimed at the wrong signal; `E1` had no way to know whether anyone
had read the page). A cap that moves to fit the spend is not a cap, so the
declared figure stays as written.

**Yield: 0 emitted.** Correct, and the point. `idea:next` still returned `H-01`
after harvest-1, because nothing harvested beats powering the measurement chain
while every behaviour node reads `blocked-on-telemetry`. Coverage went 5 → 10 of
24 cells; that harvest's product was coverage, not throughput.

**harvest-2 notes.** Founder `/graph --paste`. No new scout. The pick was still
`H-01`; this run's only product is the paste (`IL-H-01` on GRAPH_LOOP AN) and
the ratchet seeing an `IL-` row as the closer the notes already named. 1 PR
spent on that, not on the week-4 chain — that is hop 2.

**harvest-6 notes.** Founder `/graph --paste`. No new scout. The pick after
H-08 is `H-02`; this run's only product is the paste (`IL-H-02` on GRAPH_LOOP AR).
1 PR spent on that, not on the visible-diff replace — that is the next hop.

**harvest-7 notes.** Founder `/graph --paste`. No new scout. The pick after
H-02 is `H-05`; this run's only product is the paste (`IL-H-05` on GRAPH_LOOP AS).
1 PR spent on that, not on dropping a tap — that is the next hop.

**harvest-8 notes.** Founder `/graph --paste`. No new scout. The pick after
H-05 is `H-07`; this run's only product is the paste (`IL-H-07` on GRAPH_LOOP AT).
1 PR spent on that, not on missed-session dose — that is the next hop.

**harvest-9 notes.** Founder override: regenerate, wait for approval. Source
class changed: three pages **opened** (GitHub draft PR docs, Stripe test-clock
docs, Gmail Undo Send help + 2023-02-07 Keyword post). Anatomist promoted
Gmail Undo Send to `M-16` (E1). Discarded GitHub drafts (`precondition` is a
reviewer graph) and Stripe clocks (sandbox time-skip, sits next to `X-07`).
Translator wrote H-12 / H-13 / H-14 into uncovered cells. Separate red-team
spawn killed all three (fake instrument ×2, own-axis backfire ×1). No paste.
Unused PR cap held.

**Cost signal for the next run.** Every scout fetch was blocked, so the marginal
cost of *verification* was infinite and the marginal cost of *breadth* was
ordinary. That is the opposite of the usual shape and it explains the evidence
classes: breadth was cheap, depth was unavailable. The single highest-value
action for harvest 2 is not more searching — it is opening ten already-cited
pages and upgrading them to `E1`.

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
