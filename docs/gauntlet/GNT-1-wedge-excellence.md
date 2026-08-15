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
| U1 | 1 | already-true on master `.834` — instruments green (paste below). No product PR. Critic stills not this spawn. | — | Critic: 390×844 stills of set row / rest / ghost / finished + blind A/B measurements vs Hevy/Strong |
| U2 | 1 | already-true on master `.834` — instruments green (paste below). No product PR. | — | Critic: cold/returning/mid-plan stills + redActions on `/log` + Freeletics A/B |
| U3 | 1 | `.835` this PR — `gnt1HistoryDose.test.ts` pins cold vs high-strain week kinds + Thursday adapt. | — | Critic: stills seed A vs seed B on `/coach` + Today |
| U4 | 1 | `.836` this PR — 3/7/14-day quiet lines + long-gap at 14. | — | Critic: stills after 3/7/14 missed days |
| U5 | 1 | `.837` this PR — TAP_BUDGET=5 + firstPaintFloor 167 + Victory walk named. | — | Critic: timed ≤90s walk + Bevel A/B measurements |

## Evidence dossier (per unit)

Fill as rounds ship. Own-app stills under `GNT-1/evidence/` named `U<n>-R<r>-<beat>.png`.

| unit | stills | instrument paste | A/B (if named) |
|------|--------|------------------|----------------|
| U1 | pending critic | 2026-08-15 builder R1: `npx tsx --test src/lib/workout/lastSetGhost.test.ts src/lib/workout/setTableDensity694.test.ts src/lib/firstSetUngated.test.ts` → **36 pass / 0 fail**. `setTableDensity694`: LogConsole one `primary-action` + `min-h-[52px]`; SetLogRow `min-h-[44px]` + `data-prev-anchor` + `prevLabel`; SetLogTable `min-h-[44px]` + `set-table-prev`; LastSetGhostButton outline, never poster-red; both LogConsole and SetLogTable mount ghost. `lastSetGhost`: last working set not warmup; tombstones skipped. `firstSetUngated`: first-90 TAP_BUDGET stays 5. Source pins: `tests/e2e/first-90.spec.ts` `const TAP_BUDGET = 5`; `tests/e2e/mobile-nav.spec.ts` `const REACH_BUDGET = 2` (not `first-steps-reach.spec.ts`, which is More-checklist reachability). `tests/e2e/logger-depth.spec.ts` exists (set-row-target-empty → rest → Victory). | pending critic |
| U2 | pending critic | 2026-08-15 builder R1: `npx tsx --test src/lib/todayPrimaryAction.test.ts src/lib/today/todayBlockBudget.test.ts src/lib/justGoHeroMeta.test.ts` → **28 pass / 0 fail**. G4 already `JourneyHero` Resume / one train CTA (`todayPrimaryAction.ts` + Lean/Dashboard `ScreenDock`). `tests/e2e/zero-state.spec.ts` exists. redActions helper: `tests/e2e/helpers/redActions.ts`. | pending critic |
| U3 | pending critic | 2026-08-15 builder R1 `.835`: `npx tsx --test src/lib/coach/gnt1HistoryDose.test.ts` → **2 pass / 0 fail**. Empty history → 4 strength / 12 sets. 20 hard logs → recovery days enter + fewer sets. Thursday adapt keeps remaining kinds different. Goldens in `planEngine.test.ts` still use `history: []` — this pin is the two-history falsification. | pending critic |
| U4 | pending critic | 2026-08-15 builder R1 `.836`: `npx tsx --test src/lib/reentryCopyGuard.test.ts` → **5 pass / 0 fail**. 3d/7d = gap “Three/Seven days off. Here's the 20-minute version.” 14d = long-gap “14 days off…”. FORBIDDEN lexicon still empty. | pending critic |
| U5 | pending critic | 2026-08-15 builder R1 `.837`: `npx tsx --test src/lib/gnt1First90.test.ts` → **3 pass / 0 fail**. Pins `TAP_BUDGET = 5`, welcome→Today→Active→Log set, logger-depth Victory / Back to Today, `MAX_FIRST_PAINT_COPY_DRIFT = 167` down-only. Cap not raised. Timed walk stills pending critic. | pending critic |
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
