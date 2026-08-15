# Idea Loop — generation protocol

**Audience:** Founder + SCOUT / ANATOMIST / TRANSLATOR / RED TEAM / HISTORIAN spawns
**Lane:** Engineering-Web + Docs · **Horizon:** W (process ratchet, no new product surface)
**Status:** installed `.840` · graph in [docs/mechanics/](mechanics/INDEX.md)
**Does not replace:** [ORCHESTRATION.md](../ORCHESTRATION.md) (what may be built) · [CONTEXT.md](../CONTEXT.md) `## Now` (where we are) · [GRAPH_LOOP.md](GRAPH_LOOP.md) (the queue) · [GAUNTLET_LOOP.md](GAUNTLET_LOOP.md) (grading)

This file is the **generation protocol**. It is not a queue, not a status block,
and not a second grading protocol. Its only output into the build world is **one
row** appended to `GRAPH_LOOP`.

---

## 1. Why this exists

The repo had two of the three organs of an autonomous development system and
both work: `GRAPH_LOOP` decides what gets built next, `GAUNTLET_LOOP` decides
whether it is good enough. Nothing decided **what deserves to exist**.

The gap shows in the queue's own data. After G7 the queue ran
Q → R → S → T → U → V → W → X → Y → Z → AA → … → AK, and roughly sixteen
consecutive rows were the same idea — first-paint copy matching the English
pack, with a drift cap walking 216 → 167. Every block ends with the literal
words **"Do not invent X2."** A generator that has to be told not to continue is
producing junk on demand.

That is monoculture: one fitness axis, no diversity pressure, and no input from
outside the repository. Both natural idea sources were shut — no users
(`PRIVATE_MODE` on, no invite sendable) and no world (nothing ingests anything
external). The only substrate left was the codebase, so the loop ate its own
lint.

**Prose for the roles, code for the selector.** The two organs that work are pure
prose because prose was sufficient for them. It was not sufficient here: *"Do
not invent X2"* is a prose diversity rule and it failed sixteen times. So the
role prompts below are fenced prose like the gauntlet's, and the rules that
already failed as prose live in `src/lib/ideaGraph/` where they can go red.

---

## 2. The seam

```
outside world ─┐
founder-fed  ──┼──▶  IDEA LOOP  ──one row──▶  GRAPH_LOOP  ──▶  GAUNTLET
user behaviour ┘         ▲                                        │
                         └──────────── VERDICT node ◀─────────────┘
```

The Idea Loop never ships product code, never grades, never writes status, and
**never appends more than one row per run**. `GRAPH_LOOP`'s whole contract is one
concern per PR; a generator that queues five has taken the baton from the file
that owns it.

`npm run idea:next` *prints* the row. A human or the spawn taking the loop pastes
it. Handing over the baton is not a side effect of a validation command.

---

## 3. The graph

Full schema: [`src/lib/ideaGraph/schema.ts`](../src/lib/ideaGraph/schema.ts).
Data: [docs/mechanics/](mechanics/INDEX.md).

| Type | Is |
|---|---|
| `B-NN` **behaviour** | Something we want more or less of, in our product |
| `M-NN` **mechanic** | Machinery seen in the world, as a primitive configuration |
| `H-NN` **hypothesis** | mechanic × behaviour × form, with an instrument and a kill criterion |
| `V-NN` **verdict** | What happened. Written whether the idea won or lost |
| `X-NN` **constraint** | A constitution rule **plus a pointer to its live enforcer** |

### A mechanic is never recorded as a feature

Every mechanic is a configuration of nine primitives — `trigger`,
`cost_to_produce`, `visibility`, `reciprocity`, `durability`, `reversibility`,
`forgiveness`, `optimum_direction`, `precondition`. In that vocabulary **"add
badges" is unwritable**; the nearest legal node is a visible-status ladder whose
`precondition` is `population-n`, which fails this product's arithmetic on sight.

Most social mechanics are refused here on **arithmetic, not ideology**. That is
the property worth having: a refusal anyone can check beats a refusal anyone can
argue with.

> **Naming trap.** What this repo calls a MECHANIC is MDA's *dynamic*. Stories
> the feature is the skin; "lowered creation pressure + attendance receipts +
> cheap reply" is the node. Mining at the wrong layer is the cargo-cult failure.

### Evidence classes

`E0` measured here (instrument + value + date) · `E1` documented elsewhere (URL +
date **and `retrieval: fetched`**) · `E2` reported (must say why it is not E1) ·
`E3` agent inference.

**`E1` requires that somebody actually opened the page.** The first real harvest
produced ~40 correct URLs with plausible dates and not one opened page, because
the egress proxy blocked every fetch. That whole batch is `E2`. Open the page,
flip `retrieval`, and only then may the class rise.

**An evidence class is never upgraded.** `E3` may not be written up as `E1`, and
`ANTILIBRARY.md` carries a list of sources whose numbers circulate with no stated
methodology so they cannot be laundered later. With no users `E0` is nearly
empty; that is the honest state, and `X-07` forbids improving on it.

### Three fields that are never optional on a hypothesis

- **`removes`** — what this deletes or replaces. A generator with no subtraction
  operator only grows. Answering it with "nothing" fails.
- **`guardrail`** — a paired metric that gets *worse* if the mechanic turns
  coercive, and it may not be the same metric as the instrument.
- **`kill_criterion`** — pre-registered, so quitting is a trigger rather than an
  argument had later.

`instrument` must be one of the four bar kinds `GAUNTLET_LOOP` §3 already
declares legal. There is no fifth species of bar.

---

## 4. Roles

Six. Tiered so the money lands on the evaluator, which is the component that
decides quality — in the published evolve-and-evaluate systems the model is
roughly interchangeable and `evaluate()` is the whole design.

| Role | Tier | Produces |
|---|---|---|
| **SCOUT** | cheap, batched | facts + URL + date into `docs/mechanics/inbox/`. Never a recommendation |
| **ANATOMIST** | mid | one `mechanic` node, or a discard |
| **TRANSLATOR** | expensive | hypotheses against a behaviour **the selector chose** |
| **RED TEAM** | expensive, different model family, fresh context | refutations |
| **SELECTOR** | code | one queue row |
| **HISTORIAN** | cheap | a `verdict` node and an anti-library line, win or lose |

### SCOUT

```text
You are a Mission Winning idea-loop SCOUT. Cheap, batched, high fan-out.

BOOT: CONTEXT.md → AGENTS.md → docs/IDEA_LOOP.md §3. Do not read docs/mechanics/ wholesale.

HARVEST: changelogs, app-store updates, launches, reviews and complaints, open-source
projects, competitor apps. Look outside this category on purpose — a game, a dev tool,
a marketplace, a bank.

WRITE: one file per observation in docs/mechanics/inbox/, named YYYY-MM-DD-source-slug.md.
Facts, a link, a date. What you saw and where.

BANS: no recommendation, no "we should", no scoring. A recommendation arriving with the
evidence is how the evidence stops being read. No competitor pixels — measurements and
verdicts only. Do not create nodes.
```

### ANATOMIST

```text
You are a Mission Winning idea-loop ANATOMIST. One observation, one decision.

BOOT: docs/IDEA_LOOP.md → src/lib/ideaGraph/schema.ts → the inbox file.

DECOMPOSE: promote to a mechanic node, or discard and say why.
1. Answer all nine primitives. If you cannot, you are looking at a feature, not a mechanic.
2. `precondition` is required. A ladder needs a population, a leaderboard needs
   concurrency, kudos need a club. This is the field cargo-culting always drops.
3. `also_seen_in_failures` is required. Mining only winners is connecting the winning
   dots; a mechanic in successes and failures alike is table stakes or noise.
4. `backfires` edges carry as much weight as `produces` edges. Look for them.

BANS: do not write a hypothesis. Do not score. Do not record a mechanic at surface level.
```

### TRANSLATOR

```text
You are a Mission Winning idea-loop TRANSLATOR. One behaviour axis, N hypotheses.

BOOT: docs/IDEA_LOOP.md, then `npm run idea:pack <behaviour-class>` and read ONLY that.
Do not open docs/mechanics/ wholesale — a large archive of near-duplicates in context
makes you worse at this, not just slower.

You do not choose the behaviour. The selector chose it, from an empty cell.

PROPOSE: for each, name the mechanic part you took and the parts you left. Fill removes,
guardrail, kill_criterion, smallest_test, preconditions_hold against OUR arithmetic.
Prefer cheap-to-falsify over impressive: roughly a third of well-designed experiments
move their metric at a mature experimentation platform, and this product's evaluator is
far weaker than that.

BANS: do not judge your own candidates. Do not raise a ratchet. Do not target the loop's
own process, tooling, docs or queue hygiene — that self-reference is how it collapsed.
```

### RED TEAM

```text
You are a Mission Winning idea-loop RED TEAM. Fresh context. A different model family
than the translator. You try to REFUTE.

BOOT: docs/IDEA_LOOP.md → the constraint nodes → the candidate. Do not read the
translator's reasoning.

REFUTE, in this order:
1. Does it violate a constraint node? Cite the node and its enforcer file.
2. Do the mechanic's preconditions actually hold here? Check the arithmetic.
3. Is it in the anti-library already?
4. Is there a documented backfire edge pointing the other way?
5. Is the instrument fake — a check that could not fail, or a guardrail that is the
   same metric as the instrument?
6. Prospective hindsight: this shipped and it failed. Write the reason.

Default to refuted when uncertain. Compare candidates PAIRWISE with the order randomised,
never as absolute scores. Score on the pre-registered kill criterion, never on how good
the argument sounds — an LLM will produce a confident rationale for anything on demand.
```

### SELECTOR and HISTORIAN

The selector is `src/lib/ideaGraph/select.ts` and takes no prompt — see §5. The
historian writes one `verdict` node plus one `ANTILIBRARY.md` row after the
gauntlet closes a campaign, **whether the idea won or lost**, and keeps the
anti-library row when the dossier later rotates to `docs/archive/mechanics/`.
A campaign verdict names `campaign: GNT-n` and does not fake-settle an `H-NN`.
`src/lib/ideaGraph/learn.ts` is what makes the next `idea:next` / `npm run graph`
actually see it: settled hypotheses stop being candidates, failed ones join the
refuse list by fingerprint, and the `learned` line is printed. A done GNT row
with no `V-NN` is a yellow note, not a silent close.

---

## 5. Selection

An **archive, not a ranked list** — one elite per cell over
(behaviour × move × cost). A ranked list reproduces monoculture by construction,
because the best-scoring *kind* of idea keeps winning.

Axes: `activate · return · trust · depth · tell · pay` ×
`add · change · remove · measure` × `S · M · L`.

Four rules, each independently tested against the real Q→AK queue history:

1. **No two consecutive rows from the same (behaviour, move) cell.**
2. **At least one `remove` or `measure` per 5 emitted.**
3. **Novelty floor 0.6** — Jaccard similarity to the last 8 emitted rows, or to
   any anti-library fingerprint. Measured, not guessed: consecutive drift rows
   in the real queue sit at 0.588–0.733.
4. **Stepping stones are kept.** A candidate that scores badly but occupies an
   empty cell survives; empty cells are where the next harvest is aimed.

Score inputs are only things a model cannot fabricate: cost class, whether
preconditions hold, evidence class, and whether the behaviour is measurable
today. **Argument quality is not an input.**

---

## Stop rules

- **Marginal yield.** Two consecutive harvests producing zero candidates that survive the constitution filter *and* novelty *and* land in an unfilled cell — the source region is mined out. Stop. Do not refill.
- **Cost ratchet.** Cost per surviving candidate must not rise run over run beyond a factor. If it does, change source class rather than spending more on the same one.
- **Declared cap.** Every run writes its cap into `LEDGER.md` before it starts. Unused cap is success.
- **Cadence is weekly.** The outside world does not produce new mechanics hourly.
- **Empty output is legitimate.** `idea:next` emitting nothing is an answer, not a bug.

---

## 6. Memory

A context window is not a memory system: accuracy degrades well before the
stated limit, worst against near-duplicate content, which is exactly what an
idea archive is made of.

- **Node budget 6000 bytes; 60 nodes per type.** Stated in
  `docs/mechanics/INDEX.md` because a cap nobody can see is a cap nobody keeps.
- **Pack budget 24000 bytes.** `npm run idea:pack <class>` prints all
  constraints + the anti-library + the target behaviours + one hop of mechanics.
  One hop, not two.
- **The anti-library is always loaded and survives rotation.** A memory system
  that forgets what it killed re-proposes it forever.
- **Cost.** Frozen cached prefix = ontology + constraints + product context;
  candidates go after the last breakpoint. Never switch models inside one cached
  conversation — spawn a subagent instead. Batch the sweeps.

---

## 7. Bans

Inherited from `GRAPH_LOOP`, plus four this analysis adds.

- Never flip `PRIVATE_MODE`, invent traction, write excellence `status: pass`, or mark a founder task done.
- Never gate the free logger. Never propose anything that reads standing into the planner.
- Never raise `TAP_BUDGET`, `firstPaintFloor`, bundle caps or any ratchet — auto-kill.
- Never commit competitor pixels. Never invent an `AnalyticsEvent` name.
- Never become a second `## Now` or a second queue.
- **Never emit more than one row per run.** Ambition lives in the graph.
- **Never let the model that generated a candidate be the model that judges it** — the red team is a different model family, and it never judges its own translation.
- **Never target the loop's own process, tooling or queue hygiene as a behaviour.** Self-reference is how the queue collapsed.
- **Never upgrade an evidence class**, and never score a candidate on the quality of its own argument.

---

## 8. Commands

```bash
npm run idea:validate            # the graph is well-formed; every constraint has a live enforcer
npm run idea:pack <class>        # exactly what a spawn may read
npm run idea:next                # the one row, or the rule that refused each candidate
npm run idea:cells               # the archive as a grid; INDEX.md must match
```

Step 4 of `npm run gate` runs the validator.

## 9. Related

- Queue — [GRAPH_LOOP.md](GRAPH_LOOP.md) · Grading — [GAUNTLET_LOOP.md](GAUNTLET_LOOP.md)
- Horizons — [ORCHESTRATION.md](../ORCHESTRATION.md) · Metrics — [METRICS.md](METRICS.md)
- Graph data — [docs/mechanics/INDEX.md](mechanics/INDEX.md) · Code — [src/lib/ideaGraph/INDEX.md](../src/lib/ideaGraph/INDEX.md)
- Recipe 13 — [AGENT_RECIPES.md](AGENT_RECIPES.md)
