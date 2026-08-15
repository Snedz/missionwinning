# docs/gauntlet/ — campaign workbench

**Audience:** LEAD / BUILDER / CRITIC after [GAUNTLET_LOOP.md](../GAUNTLET_LOOP.md)  
**Not a queue.** The baton is one [GRAPH_LOOP.md](../GRAPH_LOOP.md) row per campaign. The role and unit live on the workbench **Next spawn** line.

Closed campaigns rotate to [docs/archive/](../archive/INDEX.md) the same way LOG entries do. Own-app stills live under `docs/gauntlet/<ID>/evidence/`. **Competitor pixels stay out of git.**

## Campaigns

| id | Title | Status | Workbench | GRAPH_LOOP row |
|----|-------|--------|-----------|----------------|
| **GNT-1** | Wedge excellence | `ready-for-founder` | [GNT-1-wedge-excellence.md](GNT-1-wedge-excellence.md) | **AL1** (`done`) |
| **GNT-2** | Coach plan quality eval harness | `open` | [GNT-2-coach-plan-quality.md](GNT-2-coach-plan-quality.md) | **AM1** |

**Naming trap:** `GNT-n` is not GRAPH_LOOP G1, not PFT G1–G8, not journey/build phases. See root [INDEX.md](../../INDEX.md) §2.

## GNT-2 (opened 2026-08-15)

Largest unbarred dimension after the wedge dossier. **Instrument first:** logged-history → expected dose / progression / recovery envelopes, no date literals, plus reference-programme *structure* bands (structures, never copied text — originality-log discipline). Units = plan dimensions (dose bands · progression on green logs · deload/adapt on missed or high-strain weeks · exercise-selection sanity).

Opened on its written gate — GNT-1's report is done, so the campaign is eligible. U1's instrument landed first (`src/lib/coach/coachEval.test.ts`) and immediately found the bar unmet: the week is **magnitude-blind** — every non-empty history produces the same plan. Details in [GNT-2-coach-plan-quality.md](GNT-2-coach-plan-quality.md).

It shipped as a colocated test rather than the sketched `scripts/coach-eval.mjs` ↔ test pair: a new npm check would have to be wired into the gate or `NOT_RUN` (`ciTruth.test.ts`), and a new gate step drags [CLAUDE.md](../../CLAUDE.md) §4 in with it (`gateDocParity.test.ts`). A test-only ratchet is the same pattern the repo already uses for `firstPaintFloor` and `designWeights`, and it runs in `npm test` today.
