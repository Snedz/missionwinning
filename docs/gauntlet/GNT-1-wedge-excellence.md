# GNT-1 — Wedge excellence gauntlet

**Status:** `open` · GRAPH_LOOP **AL1** · hard cap **≤14 build PRs**  
**Product:** the evidence dossier that makes the founder’s phone walk a confirmation.  
**Terminal agent state:** `ready-for-founder`. Only the founder writes `status: pass` in [EXCELLENCE_RESULT.md](../EXCELLENCE_RESULT.md).

Split by the **five founder criteria** (not the four surfaces). Surfaces cross-cut them.

Own-app stills: [GNT-1/evidence/](GNT-1/evidence/README.md). Competitor pixels stay local.

## Units / bars (written before round 1)

| Unit | Bar (criterion) | Instruments / reference | Critic evidence | Budget |
|------|-----------------|-------------------------|-----------------|--------|
| **U1** | One-thumb outdoor set logging | thumbSweep 44px · `tests/e2e/logger-depth.spec.ts` · first-90 TAP_BUDGET=5 · first-steps-reach REACH_BUDGET=2 · ref: Hevy/Strong set table + previous-set ghost | Stills of set row / rest / ghost / finished; real instrument output; blind A/B vs Hevy/Strong *measurements* | 3 rounds |
| **U2** | One clear next session on Today | redActions on `/log` · Today ≤6 blocks (`todayBlockBudget`) · `tests/e2e/zero-state.spec.ts` · `src/lib/todayPrimaryAction.test.ts` · ref: Freeletics “one Start” | Cold / returning / mid-plan stills; instrument output; A/B verdict | 2 rounds |
| **U3** | Coach week feels earned from logs | `planEngine.test` / `adapt.test` goldens · `scripts/seed-coach-adapt-demo.mjs` seeded states · falsification: two log histories must render visibly different dose+adapt on Coach and Today | Stills under seed A vs seed B; rendered diff; test output | 3 rounds |
| **U4** | Missed-day re-entry without shame | `src/lib/reentryCopyGuard.test.ts` · shame-lexicon sweep (extend the guard if a new phrase class appears — discover, don’t enumerate) · anti-ref: Duolingo guilt (MASCOT anti-guilt) | Stills after simulated 3 / 7 / 14 missed days; guard output | 2 rounds |
| **U5** | Phone hero ≤90s feels intentional | first-90 TAP_BUDGET=5 · firstPaintFloor **167** (never raise) · timed walk: cold open → set → Victory → clear next ≤90s · ref: Bevel metric hierarchy | Timestamped per-beat walk + still per beat; instrument output; blind A/B vs Bevel *measurements* | 3 rounds |
| **Smoother** | Four wedge surfaces read as one app | DESIGN_ORCHESTRATION 8 surface bars | DESIGN_REVIEW dated row + UX_PLAYBOOK §10 closing ritual | 1 round |

U2 (GRAPH_LOOP G4) and U4 (G7) are expected to open evidence-first or `done (already true)` — the dossier is still produced.

## Round log

| unit | round | builder ref | critic verdict | biggest gap |
|------|-------|-------------|----------------|-------------|
| — | — | — | — | — |

## Evidence dossier (per unit)

Fill as rounds ship. Own-app stills under `GNT-1/evidence/` named `U<n>-R<r>-<beat>.png`.

| unit | stills | instrument paste | A/B (if named) |
|------|--------|------------------|----------------|
| U1 | | | |
| U2 | | | |
| U3 | | | |
| U4 | | | |
| U5 | | | |
| Smoother | | | |

## Report skeleton

- Bar as written (table above)
- Full round log
- PASS evidence per criterion, mapped to EXCELLENCE_RESULT checklist:

| RESULT line | GNT-1 unit | Evidence |
|-------------|------------|----------|
| W1 Activation | U1 + U5 | |
| W2 One boss CTA | U2 | |
| W3 Logger + Victory | U1 + U5 | |
| W4 Coach continuity | U3 + U4 | |
| C5 Phone hero ≤90s | U5 | |

- Remaining gaps
- Agent terminal state: `ready-for-founder` — **never** `status: pass`
