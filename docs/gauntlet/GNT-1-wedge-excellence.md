# GNT-1 — Wedge excellence gauntlet

**Status:** `ready-for-founder` · GRAPH_LOOP **AL1** · hard cap **≤14 build PRs** (**4 spent**: `.835` `.836` `.837` `.839` — `.839` touched `src/`, so it counts; 10 unused, and unused cap is success)  
**Product:** the evidence dossier that makes the founder’s phone walk a confirmation.  
**Terminal agent state:** `ready-for-founder`. Only the founder writes `status: pass` in [EXCELLENCE_RESULT.md](../EXCELLENCE_RESULT.md).

**Next spawn:** `ready-for-founder` — **every unit now has render evidence.** U2/U3/U4 R2 closed the last gap (the on-Today stills R1 could not take). No open builder brief. Next action is the **founder phone walk** against the report below; only the founder writes `status: pass`.

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
| U1 / U5 | 2 | no builder — `.839` on tip. Critic re-run only. | **PASS** — `first-90.spec.ts:32` `✓ a cold visitor logs a set within the tap budget, with no interstitial (2.4s)` · `1 passed`. R1's landing FAIL is closed on tip. | ≤90s wall-clock stays a founder beat (no agent stopwatch) |
| U2 | 1 | already-true on master `.834` — unit pins green. | **FAIL** — `/log` zero-state: 1 red action, cap 0. Capture is marketing Notify-me, not Today. returning/mid-plan stills not taken. | Cold `/log` e2e is not on Today (1 red vs grey-Just-Go cap 0) |
| U3 | 1 | `.835` — engine pin `gnt1HistoryDose.test.ts` (not a render proof). | **FAIL** (no render PASS) — engine 2/2 green; Coach+Today stills skipped (cannot seed two histories without the forbidden demo IIFE). | Two-history render on `/coach` + `/log` is unproven |
| U4 | 1 | `.836` — 3/7/14-day quiet lines + long-gap at 14. | **FAIL** (no render PASS) — guard 5/5; Today stills skipped (`/log` → `/private`). | Quiet line after 3/7/14 days is unproven on-screen |
| U5 | 1 | `.837` — TAP_BUDGET=5 + firstPaintFloor 167 **named** (copy-drift, not 90s). | **FAIL** at critic time — first-90 expected `/log`, got `/active`. **Closed by `.839`.** | I-Day Continue must land Today — done `.839` |
| Smoother | 1 | `.839` already on tip — first-90 green. | logged — DESIGN_REVIEW row + §10 ritual. `check-design-system` 1116 files / 0 drift. | U2–U4 on-Today stills |
| U2 | 2 | no builder — already-true on tip `.839`. Critic evidence pass only, no product change. | **PASS** — zero-state 17/17 incl. `/log offers something and asks for one thing`. Red in `main` **0** (cap 0) on cold / returning / mid-plan; dock hero is the one red. Unit pins 14/14. Stills taken. | none on this bar |
| U3 | 2 | no builder — engine pin `.835` on tip. Critic render pass only. | **PASS (render)** — two histories paint visibly different weeks: cold "2 sessions · mostly strength · ~120 min" / "clean start"; 20 hard logs "1 sessions · **recovery-heavy** · ~60 min" + Sat **Mobility** + "From your logs: 20 workout(s)". Engine 2/2. | none on this bar |
| U4 | 2 | no builder — copy shipped `.836`. Critic render pass only. | **PASS (render)** — quiet line renders in the dock at each gap: 3d "Three days off. Here's the 20-minute version." · 7d "Seven days off…" · 14d "14 days off…". Guard 5/5. Shame-free; dose drop visible. | none on this bar |

## Evidence dossier (per unit)

Fill as rounds ship. Own-app stills under `GNT-1/evidence/` named `U<n>-R<r>-<beat>.png`.

| unit | stills | instrument paste | A/B (measurements only) |
|------|--------|------------------|-------------------------|
| U1 | `U1-R1-set-row.png` · `U1-R1-rest.png` · `U1-R1-ghost.png` · `U1-R1-finished.png` · `U1-R1-first-90-landed-active.png` | **2026-08-15 critic R1 e2e (paste):** `npx playwright test tests/e2e/logger-depth.spec.ts tests/e2e/first-90.spec.ts:32 --project=mobile-chrome` → first-90 cold visitor **FAIL** `Expected pattern: /\\/log/` `Received: http://localhost:3000/active` (timeout 15s). logger-depth empty-start **FAIL** `page.goto /active waitUntil networkidle` hit 60s test timeout. Unit pins (36) still green. Stills: one red Log set; rest 1:21 + Skip; PREV column present (underscore on first Just Go); finish = Session locked + red NEXT. | no founder FLOORS — do not FAIL |
| U2 | `U2-R1-cold.png` (zero-state failure capture). returning / mid-plan **not taken** — `/log` e2e never painted Today. | **2026-08-15 critic R1:** `npx tsx --test src/lib/todayPrimaryAction.test.ts src/lib/today/todayBlockBudget.test.ts` → **14 pass / 0 fail**. `npx playwright test tests/e2e/zero-state.spec.ts --project=mobile-chrome -g "/log offers"` → **FAIL** `/log: 1 red actions, cap 0` (cap reason: docked hero is grey Just Go before any data). Failure PNG is the Alpha Notify-me poster (`/private` or `/`), not JourneyHero. | no founder FLOORS — do not FAIL |
| U3 | **skipped** — cannot seed two logger histories without `seed-coach-adapt-demo.mjs` (forbidden; clobbers `mw_coach_plan`). | **2026-08-15 critic R1:** `npx tsx --test src/lib/coach/gnt1HistoryDose.test.ts` → **2 pass / 0 fail** (re-run). Engine: empty → 4 strength / 12 sets; 20 hard logs → recovery days + fewer sets; Thursday adapt keeps remaining kinds different. Workbench: engine paste is not a render PASS. | — |
| U4 | **skipped** — `/log` redirected to `/private?next=%2Flog` (PRIVATE_MODE). Did not commit Notify-me as a 3/7/14 still. | **2026-08-15 critic R1:** `npx tsx --test src/lib/reentryCopyGuard.test.ts` → **5 pass / 0 fail**. 3d/7d gap + 14d long-gap copy still shame-free in domain. Not a Today render PASS. | no founder FLOORS — do not FAIL |
| U5 | `U5-R1-cold-open.png` (first-90 fail: landed `/active`). first-set / victory / clear-next **not taken** — walk never reached Today. | **2026-08-15 critic R1:** `npx tsx --test src/lib/gnt1First90.test.ts` → **3 pass / 0 fail**. `npx playwright test tests/e2e/first-90.spec.ts:32 --project=mobile-chrome` → **FAIL** `Expected /\\/log/` `Received http://localhost:3000/active`. Timed ≤90s walk aborted at I-Day. firstPaintFloor 167 is not this bar. | no founder FLOORS — do not FAIL |
| Smoother | DESIGN_REVIEW ritual + Passes row this PR. | `npm run check-design-system` → 1116 files scanned, 12 allowlisted, 0 drift. first-90 green on `.839`. | — |
| **U2 R2** | `U2-R2-cold.png` · `U2-R2-returning.png` · `U2-R2-mid-plan.png` (all Today, 390×844) | **2026-08-15 critic R2 (paste):** `npx playwright test tests/e2e/zero-state.spec.ts --project=mobile-chrome` → `17 passed (1.7m)`, incl. `✓ 1 … /log offers something and asks for one thing @gate (3.5s)` — the R1 FAIL (`/log: 1 red actions, cap 0`) is gone. `npx tsx --test src/lib/todayPrimaryAction.test.ts src/lib/today/todayBlockBudget.test.ts` → `# tests 14 # pass 14 # fail 0`. Red-action count by computed background (same RGB + tolerance 24 as `tests/e2e/helpers/redActions.ts`): `main` **0/0/0**, `#screen-dock` 0/0/0 — cold paints the grey-to-red dock hero `Chest — Just Go`. | no founder FLOORS — do not FAIL |
| **U3 R2** | `U3-R2-coach-history-a.png` · `U3-R2-coach-history-b.png` · `U3-R2-today-history-a.png` · `U3-R2-today-history-b.png` | **2026-08-15 critic R2 (paste):** `npx tsx --test src/lib/coach/gnt1HistoryDose.test.ts` → `# tests 2 # pass 2 # fail 0`. **Render proof (the R1 gap):** seeded two histories through `workout-tracker-storage` (the store's own persist key, same log shape as the engine pin) — **not** `seed-coach-adapt-demo.mjs`, so no `mw_coach_plan` clobber. `/coach` history-a: "No sets logged yet — log one and Coach builds the week from it", dose "2 sessions · mostly strength · ~120 min", why "week shaped from your schedule and gear (clean start)". `/coach` history-b: "From your log: squat 140kg × 5", Sat = **Mobility**, dose "1 sessions · **recovery-heavy** · ~60 min", why "From your logs: 20 workout(s) in your log". Today mirrors it: 0 days logged / BASIC TRAINING vs 6 days logged / 20-DAY STREAK. | — |
| **U4 R2** | `U4-R2-missed-3.png` · `U4-R2-missed-7.png` · `U4-R2-missed-14.png` | **2026-08-15 critic R2 (paste):** `npx tsx --test src/lib/reentryCopyGuard.test.ts` → `# tests 5 # pass 5 # fail 0`. **Render proof (the R1 gap):** `/log` on local dev is ungated, so Today paints. Docked TRAIN hero reads, per gap: 3d → `Three days off. Here's the 20-minute version.` · 7d → `Seven days off. Here's the 20-minute version.` · 14d → `14 days off. Here's the 20-minute version.` Shame-free, states the fact, offers the smaller dose; red stays in the dock (`main` 0). | no founder FLOORS — do not FAIL |

**Why R1 could not shoot these.** R1 recorded `/log` → `/private?next=%2Flog` and captured the Alpha Notify-me poster. That is a gated *origin*, not a product defect: `src/lib/privateModeFlag` treats local `next dev` as ungated unless `PRIVATE_MODE` is explicitly true, and `docs/gauntlet/GNT-1/evidence/README.md` already says not to `next start` for stills. `npm run dev` + a seeded athlete paints Today directly. Seeds used, all through the app's own keys: `mw_experience` + `mw_equipment` (`hasLegacyOnboarding` ⇒ `isIDayComplete`, so `JourneyGuard` stops bouncing to `/welcome`), `mw_locale_choice=1` (first-visit language sheet), `mw_privacy_consent_v1`, and `workout-tracker-storage`. No product code was changed to take these stills.

## Report skeleton

- Bar as written (table above)
- Full round log
- PASS evidence per criterion, mapped to EXCELLENCE_RESULT checklist:

| RESULT line | GNT-1 unit | Evidence |
|-------------|------------|----------|
| W1 Activation | U1 + U5 | I-Day **Continue lands Today** (`.839`, closing the R1 FAIL where cold visitors landed `/active`). `U1-R1-first-90-landed-active.png` + `U5-R1-cold-open.png` are the *before*. **Re-run on tip R2:** `first-90.spec.ts:32` → `✓ 1 … a cold visitor logs a set within the tap budget, with no interstitial (2.4s)` · `1 passed (3.2s)`. |
| W2 One boss CTA | U2 | `U2-R2-cold.png` · `U2-R2-returning.png` · `U2-R2-mid-plan.png`. Red in `main` **0** (cap 0) in all three states — the one red is the docked hero (`Chest — Just Go`). zero-state 17/17 incl. `/log`. |
| W3 Logger + Victory | U1 + U5 | `U1-R1-set-row.png` · `U1-R1-rest.png` (1:21 + Skip) · `U1-R1-ghost.png` (PREV column) · `U1-R1-finished.png` (Session locked + red NEXT). Unit pins 36 green. |
| W4 Coach continuity | U3 + U4 | `U3-R2-coach-history-a/b.png` — the same app, two log histories, two visibly different weeks: "mostly strength · ~120 min" vs "**recovery-heavy** · ~60 min" + Sat Mobility, each with a "WHY THIS WEEK — FROM YOUR LOGS" panel. `U4-R2-missed-3/7/14.png` — quiet re-entry line per gap, shame-free. |
| C5 Phone hero ≤90s | U5 | first-90 `TAP_BUDGET = 5` green on tip (same paste as W1); the walk reaches Today after `.839`. **Wall-clock ≤90s on a real phone is the founder's own beat** — the agent bar is the tap budget, not the stopwatch. |

**Remaining gaps (honest):**

1. **The ≤90s wall-clock is unmeasured by an agent.** `first-90` pins taps, not seconds; `firstPaintFloor` is copy drift. C5 stays a founder observation.
2. **No founder FLOORS/BANDS for the named references** (Hevy · Strong · Freeletics · Bevel · Duolingo). Every A/B cell reads *measurements-only* by design — a reference with no numeric floor cannot FAIL a unit (GAUNTLET_LOOP §5).
3. **Stills are seeded local dev, not a production phone.** Seeds go through the app's own storage keys and no product code was changed, but a gated production origin still paints `/private` — which is exactly what R1 hit.
4. **U2 `returning` and `mid-plan` render the same Today** (both have a session inside the week). The bar does not separate them; a distinct mid-plan state would need a generated plan on the device.
5. `e2e:visual` remains the dark gate repo-wide — unrelated to this campaign, still unbaselined.

- Agent terminal state: `ready-for-founder` — **never** `status: pass`
