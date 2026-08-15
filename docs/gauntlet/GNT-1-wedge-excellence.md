# GNT-1 — Wedge excellence gauntlet

**Status:** `open` · GRAPH_LOOP **AL1** · hard cap **≤14 build PRs** (3 spent: `.835` `.836` `.837`)  
**Product:** the evidence dossier that makes the founder’s phone walk a confirmation.  
**Terminal agent state:** `ready-for-founder`. Only the founder writes `status: pass` in [EXCELLENCE_RESULT.md](../EXCELLENCE_RESULT.md).

**Next spawn:** `CRITIC · GNT-1 U1 R1` — oldest shipped unit with an empty critic cell. Do not open a builder (including a U3 render instrument) until U1–U5 critics land.

Unused cap is success. The cap counts only PRs that touch `src|app|scripts|supabase`. U1/U2 already-true did not spend it.

Split by the **five founder criteria** (not the four surfaces). Surfaces cross-cut them.

Own-app stills: [GNT-1/evidence/](GNT-1/evidence/README.md). Competitor pixels stay local. Named references (Hevy / Strong / Freeletics / Bevel / Duolingo) are **measurements-only** until this file has founder FLOORS/BANDS. They are not a FAIL condition.

## Units / bars (written before round 1)

| Unit | Bar (criterion) | Instruments (exact commands) | Critic evidence | Budget |
|------|-----------------|------------------------------|-----------------|--------|
| **U1** | One-thumb outdoor set logging | `npx playwright install chromium` if needed. `npx playwright test tests/e2e/logger-depth.spec.ts tests/e2e/first-90.spec.ts tests/e2e/mobile-nav.spec.ts`. Unit pins already pasted. REACH is `mobile-nav.spec.ts` (`REACH_BUDGET = 2`), **not** `first-steps-reach.spec.ts` (More-checklist). | Stills: set-row / rest / ghost / finished. Pasted e2e last lines. | 3 rounds |
| **U2** | One clear next session on Today | `npx playwright test tests/e2e/zero-state.spec.ts`. `npx tsx --test src/lib/todayPrimaryAction.test.ts src/lib/today/todayBlockBudget.test.ts`. redActions: `tests/e2e/helpers/redActions.ts`. | Stills: cold / returning / mid-plan. Pasted output. | 2 rounds |
| **U3** | Coach week feels earned from logs | Engine pin (shipped `.835`, not a render proof): `npx tsx --test src/lib/coach/gnt1HistoryDose.test.ts`. **Do not** use `scripts/seed-coach-adapt-demo.mjs` — that is a one-plan 60s IIFE and can clobber a real `mw_coach_plan`. A Coach+Today two-history **render** instrument is not commissioned until U1–U5 critics land. | Stills of `/coach` + `/log` under two log histories if you can seed them via the logger. Engine paste is not a render PASS. | 3 rounds |
| **U4** | Missed-day re-entry without shame | `npx tsx --test src/lib/reentryCopyGuard.test.ts`. | Stills after 3 / 7 / 14 missed days + guard last lines. | 2 rounds |
| **U5** | Phone hero ≤90s feels intentional | `npx playwright test tests/e2e/first-90.spec.ts` (`TAP_BUDGET = 5`). Timed walk (not `firstPaintFloor` 167 — that ratchet is i18n copy-drift, a standing gate, **not** a U5 pass): cold open → first set logged → Victory → clear next on Today, wall-clock ≤90s. `.837` `gnt1First90.test.ts` is a source pin of TAP_BUDGET + the 167 floor; it does not time 90 seconds. | Timestamped still per beat + first-90 last lines. | 3 rounds |
| **Smoother** | Four wedge surfaces read as one app | DESIGN_ORCHESTRATION 8 surface bars | DESIGN_REVIEW dated row + UX_PLAYBOOK §10 closing ritual | 1 round |

U2 (GRAPH_LOOP G4) and U4 (G7) opened evidence-first / already-true. The dossier is still produced.

## Walk beats (critic)

| Unit | Beats (filename `U<n>-R1-<beat>.png`) |
|------|----------------------------------------|
| U1 | `set-row` · `rest` · `ghost` · `finished` |
| U2 | `cold` · `returning` · `mid-plan` |
| U3 | `coach-history-a` · `coach-history-b` · `today-history-a` · `today-history-b` (skip render stills if you cannot seed two histories without the demo IIFE; say so) |
| U4 | `missed-3` · `missed-7` · `missed-14` |
| U5 | `cold-open` · `first-set` · `victory` · `clear-next` + wall-clock on the still or in the paste |

## Round log

| unit | round | builder ref | critic verdict | biggest gap |
|------|-------|-------------|----------------|-------------|
| U1 | 1 | already-true on master `.834` — instruments green (paste below). No product PR. | — | Critic U1: stills + e2e last lines |
| U2 | 1 | already-true on master `.834` — instruments green (paste below). No product PR. | — | Critic U2 after U1 |
| U3 | 1 | `.835` — engine pin `gnt1HistoryDose.test.ts` (not a render proof). | — | Critic U3 after U2 |
| U4 | 1 | `.836` — 3/7/14-day quiet lines + long-gap at 14. | — | Critic U4 after U3 |
| U5 | 1 | `.837` — TAP_BUDGET=5 + firstPaintFloor 167 **named** (copy-drift, not 90s). | — | Critic U5 timed walk after U4 |

## Evidence dossier (per unit)

Fill as rounds ship. Own-app stills under `GNT-1/evidence/` named `U<n>-R<r>-<beat>.png`.

| unit | stills | instrument paste | A/B (measurements only) |
|------|--------|------------------|-------------------------|
| U1 | pending critic | 2026-08-15 builder R1: `npx tsx --test src/lib/workout/lastSetGhost.test.ts src/lib/workout/setTableDensity694.test.ts src/lib/firstSetUngated.test.ts` → **36 pass / 0 fail**. Critic must also run the **e2e** commands in the unit table (unit-only paste is not the named bar). | no founder FLOORS — do not FAIL |
| U2 | pending critic | 2026-08-15 builder R1: `npx tsx --test src/lib/todayPrimaryAction.test.ts src/lib/today/todayBlockBudget.test.ts src/lib/justGoHeroMeta.test.ts` → **28 pass / 0 fail**. Critic runs `zero-state.spec.ts` + those unit tests. | no founder FLOORS — do not FAIL |
| U3 | pending critic | 2026-08-15 builder R1 `.835`: `npx tsx --test src/lib/coach/gnt1HistoryDose.test.ts` → **2 pass / 0 fail**. Engine-only. Not a Coach/Today render PASS. | — |
| U4 | pending critic | 2026-08-15 builder R1 `.836`: `npx tsx --test src/lib/reentryCopyGuard.test.ts` → **5 pass / 0 fail**. | no founder FLOORS — do not FAIL |
| U5 | pending critic | 2026-08-15 builder R1 `.837`: `npx tsx --test src/lib/gnt1First90.test.ts` → **3 pass / 0 fail**. Source pin. Critic runs `first-90.spec.ts` and the timed walk. | no founder FLOORS — do not FAIL |
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
