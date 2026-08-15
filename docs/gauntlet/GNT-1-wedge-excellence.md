# GNT-1 — Wedge excellence gauntlet

**Status:** `open` · GRAPH_LOOP **AL1** · hard cap **≤14 build PRs** (3 spent: `.835` `.836` `.837`)  
**Product:** the evidence dossier that makes the founder’s phone walk a confirmation.  
**Terminal agent state:** `ready-for-founder`. Only the founder writes `status: pass` in [EXCELLENCE_RESULT.md](../EXCELLENCE_RESULT.md).

**Next spawn:** `ready-for-founder` — U2/U4 PASS. U3 Today two-week docks differ; `/coach` still 307. Do not write `status: pass`.

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
| U1 | 1 | already-true on master `.834` — unit pins green. | **FAIL** — first-90 cold visitor: expected `/log`, got `/active`. Logger stills exist. | I-Day Continue lands on `/active` (Active dump), not Today |
| U2 | 2 | `.839` `/log` gate-public | **PASS** (Today stills + zero-state `/log` green 3.4s). Cold = one dock Just Go. | Sign-in chip on returning stills — not the dock |
| U3 | 3 | Today two injected weeks (plan cleared). `/coach` 307. | **PARTIAL** — Today A dock Upper Body Strength; B Recovery & Mobility. Engine 2/2. No `/coach` stills. | `/coach` stills (gate cookie) |
| U4 | 2 | `/log` public after `.839` | **PASS** — quiet lines on Today: 3/7/14 days off + 20-minute version. Guard 5/5. No streak-guilt. | — |
| U5 | 1 | `.837` — TAP_BUDGET=5 + firstPaintFloor 167 **named** (copy-drift, not 90s). | **FAIL** at critic time — first-90 expected `/log`, got `/active`. **Closed by `.839`.** | I-Day Continue must land Today — done `.839` |
| Smoother | 1 | `.839` already on tip — first-90 green. | logged — DESIGN_REVIEW row + §10 ritual. `check-design-system` 1116 files / 0 drift. | U2–U4 on-Today stills |

## Evidence dossier (per unit)

Fill as rounds ship. Own-app stills under `GNT-1/evidence/` named `U<n>-R<r>-<beat>.png`.

| unit | stills | instrument paste | A/B (measurements only) |
|------|--------|------------------|-------------------------|
| U1 | `U1-R1-set-row.png` · `U1-R1-rest.png` · `U1-R1-ghost.png` · `U1-R1-finished.png` · `U1-R1-first-90-landed-active.png` | **2026-08-15 critic R1 e2e (paste):** `npx playwright test tests/e2e/logger-depth.spec.ts tests/e2e/first-90.spec.ts:32 --project=mobile-chrome` → first-90 cold visitor **FAIL** `Expected pattern: /\\/log/` `Received: http://localhost:3000/active` (timeout 15s). logger-depth empty-start **FAIL** `page.goto /active waitUntil networkidle` hit 60s test timeout. Unit pins (36) still green. Stills: one red Log set; rest 1:21 + Skip; PREV column present (underscore on first Just Go); finish = Session locked + red NEXT. | no founder FLOORS — do not FAIL |
| U2 | R2: `U2-R2-cold.png` · `U2-R2-returning.png` · `U2-R2-mid-plan.png`. R1 Notify-me kept as historical fail. | **2026-08-15 R2:** `npx playwright test tests/e2e/zero-state.spec.ts -g "/log offers"` → **1 passed (4.1s)**. Cold dock = Chest Just Go. | no founder FLOORS |
| U3 | R3: `U3-R3-today-history-a.png` (Upper Body Strength) · `U3-R3-today-history-b.png` (Recovery & Mobility). `/coach` 307. | Injected generateWeek-shaped plans after clearing `mw_coach_plan`. Today docks differ. Engine `gnt1HistoryDose` 2/2. | — |
| U4 | `U4-R2-missed-3.png` · `U4-R2-missed-7.png` · `U4-R2-missed-14.png` | **2026-08-15 R2:** dock lines “Seven days off. Here's the 20-minute version.” / “14 days off…”. Guard 5/5. No you-missed / streak-guilt. | no founder FLOORS |
| U5 | `U5-R1-cold-open.png` (first-90 fail: landed `/active`). first-set / victory / clear-next **not taken** — walk never reached Today. | **2026-08-15 critic R1:** `npx tsx --test src/lib/gnt1First90.test.ts` → **3 pass / 0 fail**. `npx playwright test tests/e2e/first-90.spec.ts:32 --project=mobile-chrome` → **FAIL** `Expected /\\/log/` `Received http://localhost:3000/active`. Timed ≤90s walk aborted at I-Day. firstPaintFloor 167 is not this bar. | no founder FLOORS — do not FAIL |
| Smoother | DESIGN_REVIEW ritual + Passes row this PR. | `npm run check-design-system` → 1116 files scanned, 12 allowlisted, 0 drift. first-90 green on `.839`. | — |

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
