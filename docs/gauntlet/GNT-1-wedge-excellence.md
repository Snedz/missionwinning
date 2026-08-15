# GNT-1 — Wedge excellence gauntlet

**Status:** `open` · GRAPH_LOOP **AL1** · hard cap **≤14 build PRs** (4 spent: `.835` `.836` `.837` `.839`)  
**Product:** the evidence dossier that makes the founder’s phone walk a confirmation.  
**Terminal agent state:** `ready-for-founder`. Only the founder writes `status: pass` in [EXCELLENCE_RESULT.md](../EXCELLENCE_RESULT.md).

**Next spawn:** `CRITIC · GNT-1 U3 R2` — U2 stopped. U3 R2 shipped the two-history Coach+Today render instrument ([#651](https://github.com/Snedz/missionwinning/pull/651)). Brief = written U3 bar + R2 builder-ref. GRAPH_LOOP AL1 left open.

Unused cap is success. The cap counts only PRs that touch `src|app|scripts|supabase`. U1/U2 already-true did not spend it. U1 R2 already-true (docs) does not spend it. U1 R3 spends `.839`. U2 R2 already-true (docs) does not spend it. U3 R2 tests/docs does not spend it.

Split by the **five founder criteria** (not the four surfaces). Surfaces cross-cut them.

Own-app stills: [GNT-1/evidence/](GNT-1/evidence/README.md). Competitor pixels stay local. Named references (Hevy / Strong / Freeletics / Bevel / Duolingo) are **measurements-only** until this file has founder FLOORS/BANDS. They are not a FAIL condition.

## Units / bars (written before round 1)

| Unit | Bar (criterion) | Instruments (exact commands) | Critic evidence | Budget |
|------|-----------------|------------------------------|-----------------|--------|
| **U1** | One-thumb outdoor set logging | `npx playwright install chromium` if needed. `npx playwright test tests/e2e/logger-depth.spec.ts tests/e2e/first-90.spec.ts tests/e2e/mobile-nav.spec.ts`. Unit pins already pasted. REACH is `mobile-nav.spec.ts` (`REACH_BUDGET = 2`), **not** `first-steps-reach.spec.ts` (More-checklist). | Stills: set-row / rest / ghost / finished. Pasted e2e last lines. | 3 rounds |
| **U2** | One clear next session on Today | `npx playwright test tests/e2e/zero-state.spec.ts`. `npx tsx --test src/lib/todayPrimaryAction.test.ts src/lib/today/todayBlockBudget.test.ts`. redActions: `tests/e2e/helpers/redActions.ts`. | Stills: cold / returning / mid-plan. Pasted output. | 2 rounds |
| **U3** | Coach week feels earned from logs | Engine pin (shipped `.835`, not a render proof): `npx tsx --test src/lib/coach/gnt1HistoryDose.test.ts`. **Do not** use `scripts/seed-coach-adapt-demo.mjs` — that is a one-plan 60s IIFE and can clobber a real `mw_coach_plan`. Render (U3 R2 — logger persist helper, Coach UI generates the week; 390×844): `npx playwright test tests/e2e/gnt1-coach-history-render.spec.ts --project=mobile-chrome` | Stills of `/coach` + `/log` under two log histories if you can seed them via the logger. Engine paste is not a render PASS. | 3 rounds |
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
| U1 | 2 | already-true on origin/master `.838` (`npm run dev`, ungated). I-Day Continue lands `/log` (Today), not `/active`. Land print: `landed_after_continue=http://localhost:3000/log`. Proof files: `src/lib/idayFinishPath.ts` (`isEdit:false`, `hasLoggedWork:false`, `gateOn:false` → `'/log'`); `src/page-components/WelcomePage.tsx` `finish()` → `idayFinishPath({… gateOn: isClientPrivateGateEnabled() })`; `tests/e2e/first-90.spec.ts:49` `toHaveURL(/\/log/)`. Isolated: `npx playwright test tests/e2e/first-90.spec.ts:32 --project=mobile-chrome` last lines: `✓ … a cold visitor logs a set within the tap budget, with no interstitial (1.7s)` / `1 passed (2.1s)`. Full instruments: `npx playwright test tests/e2e/logger-depth.spec.ts tests/e2e/first-90.spec.ts tests/e2e/mobile-nav.spec.ts --project=mobile-chrome` last lines: cold visitor `✓ (2.5s)`; `18 failed` / `14 passed (16.8m)` — homepage emerald; sitemap; hero demo; Today red 9:00/19:00; logger thumb; block budget 19:00; `/log` thumb morning+evening; feedback sheet; logger-depth start-empty + 4 resilience `page.goto … waitUntil networkidle` 60s; mobile-nav 3× `goto /log waitUntil networkidle` 60s. `npx tsx --test src/lib/idayFinishPath.test.ts` last lines: `# tests 4` `# pass 4` `# fail 0`. `TAP_BUDGET = 5` unchanged. `/active` HTTP 200 (logger ungated). No product edit. GRAPH_LOOP AL1 left open. | **FAIL** — trio: 390×844 walk · stills `U1-R2-*.png` · pasted last lines. `landed_after_continue=http://localhost:3000/log`. Cold-visitor TAP_BUDGET **PASS** (1.7s). logger-depth **FAIL** (empty-start + 4 resilience `goto /active waitUntil networkidle` 60s; sideways-scroll ✓). mobile-nav REACH **FAIL** (3 cases `goto /log waitUntil networkidle` 60s). Outdoor stills **PASS**. Command last lines: **21 failed / 11 passed (18.8m)**. | logger-depth empty-start, REACH, and first-90 thumbSweep/redActions never complete because `/log` and `/active` `waitUntil: 'networkidle'` hit the 60s timeout on origin/master `npm run dev` |
| U1 | 3 | [#647](https://github.com/Snedz/missionwinning/pull/647) `.839`. `gotoHydrated` (no `networkidle`) on `/log` `/active`. Empty `/active` dock is Start workout. REACH drops `/assessments` (`REACH_BUDGET = 2`). `TAP_BUDGET = 5`. Command: `npx playwright test tests/e2e/logger-depth.spec.ts tests/e2e/first-90.spec.ts tests/e2e/mobile-nav.spec.ts` last lines: `✓ … the More sheet closes on Escape and restores focus (1.0s)` / `32 passed (48.5s)`. `npm run lint` 0. `npm run typecheck` 0. `/active` ungated. GRAPH_LOOP AL1 left open. | **PASS** — trio: 390×844 walk · stills `U1-R3-*.png` · pasted last lines. `landed_after_continue=http://localhost:3000/log`. Command: **32 passed (47.4s)**. Cold-visitor TAP_BUDGET **PASS**. logger-depth **PASS**. REACH_BUDGET=2 **PASS**. Outdoor stills **PASS**. Unit U1 stopped (bar met). | On 390×844 the Victory NEXT control sits under the rail, so the outdoor finish beat is on-screen but the next action is not fully tappable without scroll |
| U2 | 1 | already-true on master `.834` — unit pins green. | **FAIL** — `/log` zero-state: 1 red action, cap 0. Capture is marketing Notify-me, not Today. returning/mid-plan stills not taken. | Cold `/log` e2e is not on Today (1 red vs grey-Just-Go cap 0) |
| U2 | 2 | [#649](https://github.com/Snedz/missionwinning/pull/649) already-true on `origin/cursor/gnt-1-u1-r3-f368` `.839` (`npm run dev`, ungated). `origin/master` is `.838` (U1 R3 not merged). Cold `/log` after zero-state seed: URL `http://localhost:3000/log`, title `Today · Mission Winning`, `redCount=0`, `notifyMeCount=0`, dock `READY TO TRAIN … Chest — Just Go`. `/log` HTTP 200 (no 307 to `/private`). `RED_ACTION_CAP['/log']` still 0. `TODAY_MAX_TOP_LEVEL_BLOCKS` still 6. No product edit. GRAPH_LOOP AL1 left open. Commands (last lines): `npx playwright test tests/e2e/zero-state.spec.ts` → `✓ … /log offers something and asks for one thing @gate (2.9s)` / `17 passed (1.2m)`. Isolated `-g "/log offers"` → `1 passed (3.6s)`. `npx tsx --test src/lib/todayPrimaryAction.test.ts src/lib/today/todayBlockBudget.test.ts` → `# tests 14` `# pass 14` `# fail 0`. | **PASS** (`/log` bar). Trio: 390×844 walk · stills `U2-R2-*.png` · pasted last lines. `log_url=http://localhost:3000/log` title Today. `/log` zero-state **PASS** 0 red vs cap 0 (3.0s). Unit tests **14 pass / 0 fail**. Stills are Today not teaser. Full `zero-state.spec.ts` **1 failed / 16 passed** (`/account` 0 red vs cap 1 — critic: not this bar). Unit U2 stopped. | Returning and mid-plan stills are the same pixels because the first logger session already auto-generated the week, so Today already showed session two before `/coach` was opened |
| U3 | 1 | `.835` — engine pin `gnt1HistoryDose.test.ts` (not a render proof). | **FAIL** (no render PASS) — engine 2/2 green; Coach+Today stills skipped (cannot seed two histories without the forbidden demo IIFE). | Two-history render on `/coach` + `/log` is unproven |
| U3 | 2 | [#651](https://github.com/Snedz/missionwinning/pull/651) tests/docs on `origin/cursor/gnt-1-u1-r3-f368` `.839` (`npm run dev`, ungated). No `APP_BUILD_LABEL` bump (no `src|app|scripts|supabase`). Logger persist helper; Coach UI generates the week; does not plant `mw_coach_plan`. **Do not** use `seed-coach-adapt-demo.mjs`. Commands (last lines): `npx tsx --test src/lib/coach/gnt1HistoryDose.test.ts` → `# tests 2` `# pass 2` `# fail 0`. `npx playwright test tests/e2e/gnt1-coach-history-render.spec.ts --project=mobile-chrome` → `gnt1_u3_history_a_coach_dose="This week’s dose: 4 sessions · mostly strength · ~240 min"` · `gnt1_u3_history_b_coach_dose="This week’s dose: 4 sessions · mixed strength & recovery · ~240 min"` · `gnt1_u3_history_a_today_dose="This week’s dose: 4 sessions · mostly strength · ~240 min"` · `gnt1_u3_history_b_today_dose="This week’s dose: 4 sessions · mixed strength & recovery · ~240 min"` · `gnt1_u3_history_a_mobility=0` · `gnt1_u3_history_b_mobility=2` · `gnt1_u3_history_a_cite=session` · `gnt1_u3_history_b_cite=set` / `2 passed (5.4s)`. `/log` `/active` HTTP 200. GRAPH_LOOP AL1 left open. Cap not spent. | | |
| U4 | 1 | `.836` — 3/7/14-day quiet lines + long-gap at 14. | **FAIL** (no render PASS) — guard 5/5; Today stills skipped (`/log` → `/private`). | Quiet line after 3/7/14 days is unproven on-screen |
| U5 | 1 | `.837` — TAP_BUDGET=5 + firstPaintFloor 167 **named** (copy-drift, not 90s). | **PASS** (written instruments). Trio: 390×844 walk · stills `U5-R1-*.png` · pasted last lines. Cold-visitor TAP_BUDGET **PASS** (4 taps / 5; Continue→`/log`). Timed walk **PASS** `wall_clock_s=5.215`. Source pin 3/3. Full `first-90.spec.ts` file had 10 other fails (homepage / sitemap / thumb / 19:00 red) — critic did not treat those as the U5 bar. | On 390×844 the Victory sheet clips the NEXT / Back to Today control below the fold, so the last hero beat is not fully on-screen |

## Evidence dossier (per unit)

Fill as rounds ship. Own-app stills under `GNT-1/evidence/` named `U<n>-R<r>-<beat>.png`.

| unit | stills | instrument paste | A/B (measurements only) |
|------|--------|------------------|-------------------------|
| U1 | R1–R2 as before. R3: `U1-R3-after-continue.png` · `U1-R3-set-row.png` · `U1-R3-rest.png` · `U1-R3-ghost.png` · `U1-R3-finished.png` · `U1-R3-timing.txt` | **R3 critic paste:** `npx playwright test tests/e2e/logger-depth.spec.ts tests/e2e/first-90.spec.ts tests/e2e/mobile-nav.spec.ts` → **32 passed (47.4s)**. `landed_after_continue=http://localhost:3000/log`. logger-depth empty-start + sideways + 4 resilience **PASS**. REACH_BUDGET=2 **PASS**. Unit stopped. | no founder FLOORS — do not FAIL |
| U2 | R1: `U2-R1-cold.png` (Notify-me, not Today). R2: `U2-R2-cold.png` · `U2-R2-returning.png` · `U2-R2-mid-plan.png` | **R2 critic paste:** `npx playwright test tests/e2e/zero-state.spec.ts` → `/log` ✓ 3.0s 0 red vs cap 0; file **1 failed / 16 passed** (`/account` 0 vs cap 1). Units **14 pass / 0 fail**. `log_url=http://localhost:3000/log`. | no founder FLOORS — do not FAIL |
| U3 | **skipped** — cannot seed two logger histories without `seed-coach-adapt-demo.mjs` (forbidden; clobbers `mw_coach_plan`). | **2026-08-15 critic R1:** `npx tsx --test src/lib/coach/gnt1HistoryDose.test.ts` → **2 pass / 0 fail** (re-run). Engine: empty → 4 strength / 12 sets; 20 hard logs → recovery days + fewer sets; Thursday adapt keeps remaining kinds different. Workbench: engine paste is not a render PASS. | — |
| U4 | **skipped** — `/log` redirected to `/private?next=%2Flog` (PRIVATE_MODE). Did not commit Notify-me as a 3/7/14 still. | **2026-08-15 critic R1:** `npx tsx --test src/lib/reentryCopyGuard.test.ts` → **5 pass / 0 fail**. 3d/7d gap + 14d long-gap copy still shame-free in domain. Not a Today render PASS. | no founder FLOORS — do not FAIL |
| U5 | `U5-R1-cold-open.png` · `U5-R1-first-set.png` · `U5-R1-victory.png` · `U5-R1-clear-next.png` · `U5-R1-timing.txt` | **2026-08-15 critic R1 paste:** `npx playwright test tests/e2e/first-90.spec.ts` → cold-visitor **PASS** (2.5s). File overall **10 failed / 12 passed** (homepage emerald; content-library menu; sitemap; hero demo; Today red at 19:00; logger thumb; Today block budget 9:00; /log thumb morning+evening; feedback sheet thumb). Timed walk: `start_ts=2026-08-15T07:53:54.729Z end_ts=2026-08-15T07:53:59.944Z wall_clock_s=5.215 landed_after_continue=http://localhost:3000/log today_url_after=http://localhost:3000/log` (4 taps, Today `.primary-action` count 1). `npx tsx --test src/lib/gnt1First90.test.ts` → **3 pass / 0 fail**. | no founder FLOORS — do not FAIL |
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
