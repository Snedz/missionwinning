# GNT-2 — Coach plan quality

**Status:** `open` · GRAPH_LOOP **AM1** · hard cap **≤10 build PRs** (1 spent: `.840`)
**Opened:** 2026-08-15, on the gate written in [INDEX.md](INDEX.md) — *"enters GRAPH_LOOP only after GNT-1's report"*. That report is written; GNT-1 is `ready-for-founder`.
**Product:** an instrument that can tell a good generated week from a bad one, and a planner that clears it.
**Terminal agent state:** `ready-for-founder`. Never `status: pass`.

**Next spawn:** BUILDER on **U1** — make the week respond to training *magnitude*, not just to "any logs at all". Brief is the finding below; the evidence it worked is `MIN_DISTINCT_DOSE_SHAPES` going up.

Instrument first: this campaign may not grade a week against taste. Every unit's bar is [GAUNTLET_LOOP.md](../GAUNTLET_LOOP.md) §3 source 1 or 2 — an existing measured instrument, or a new ratchet on the canonical pattern. Reference programmes contribute **structure bands only** (never copied text — guidebook originality-log discipline).

## Units / bars

| Unit | Bar | Instrument (exact command) | Budget |
|------|-----|----------------------------|--------|
| **U1** | The week's dose moves with training **magnitude**, not just presence | `npx tsx --test src/lib/coach/coachEval.test.ts` — `MIN_DISTINCT_DOSE_SHAPES` ratchet + monotonicity across the 0→20 strain sweep | 3 rounds |
| **U2** | Progression on green logs — a clean block raises prescribed work | not commissioned. First round commissions it | 3 rounds |
| **U3** | Deload / adapt on missed or high-strain weeks | partly covered by `adapt.test.ts`; needs a missed-week envelope | 2 rounds |
| **U4** | Exercise selection is sane for the declared gear | not commissioned. Must discover the catalog, not enumerate a few ids | 2 rounds |

## Round log

| unit | round | builder ref | critic verdict | biggest gap |
|------|-------|-------------|----------------|-------------|
| U1 | 1 | `.840` — commissioned `coachEval.test.ts` (sweep ratchet, 2 mutants killed). No planner change. | **instrument landed; bar not yet met.** The sweep measures 2 dose shapes across 11 strain levels — `48:0` cold, `34:2` for every non-empty history. | The week is magnitude-blind: 2 logs and 20 logs produce an identical plan |

## Evidence dossier

| unit | instrument paste | note |
|------|------------------|------|
| U1 | **2026-08-15 (paste):** `npx tsx --test src/lib/coach/coachEval.test.ts` → `# tests 2 # pass 2 # fail 0`. Sweep measurement: `0 logs → 48 sets / 0 recovery` · `2…20 logs → 34 sets / 2 recovery` (identical at every level ≥2). **Mutants killed (2):** log-blind planner (`history: []`) → `planner collapsed to 1 dose shape(s) across 6 strain levels (floor 2): 48:0` + `a high-strain history must insert recovery`; cold-treated-as-strained → `collapsed to 1 … 34:2`. One further mutation (amplifying already-saturated histories) changed nothing observable and is not counted. | The floor of **2** documents today's behaviour; it is not an endorsement of it |

## Report skeleton

- Bar as written · round log · PASS evidence per unit · remaining gaps
- Agent terminal state: `ready-for-founder` — **never** `status: pass`
