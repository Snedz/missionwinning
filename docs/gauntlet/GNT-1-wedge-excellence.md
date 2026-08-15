# GNT-1 — Wedge excellence gauntlet

**Status:** report written · GRAPH_LOOP **AL1** `done` · hard cap **≤14 build PRs** (7 spent: `.835` `.836` `.837` `.839` `.840` `.841` `.844`)  
**Product:** the evidence dossier that makes the founder’s phone walk a confirmation.  
**Terminal agent state:** `ready-for-founder`. Only the founder writes `status: pass` in [EXCELLENCE_RESULT.md](../EXCELLENCE_RESULT.md). RESULT remains `unscored`.

**Next spawn:** none — campaign closed. Founder scores RESULT on a phone against this dossier. GNT-2 stays `named` until the founder opens it. Do **not** write `status: pass`. Do not merge `#656`.

Unused cap is success. The cap counts only PRs that touch `src|app|scripts|supabase`. U1/U2 already-true did not spend it. `.839`, `.840`, `.841` and `.844` spent it. Do not merge `cursor/gnt-1-report-f368` (#656) — it closed AL1 against a stack that is not this master.

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
| U1 | 2 | already-true on origin/master `.839` — `idayFinishPath` cold → `/log`; `/log` gate-public; first-90 cold visitor green per LOG. Coach stays gated in production. No product this spawn. | **FAIL** — landed_after_continue=http://localhost:3000/log. Walk 390×844: Continue → Today → Chest Just Go → 8×BW+20 Log set → rest 1:30 → PREV — (no last-set-ghost) → Victory. COMMAND: `npx playwright test tests/e2e/logger-depth.spec.ts tests/e2e/first-90.spec.ts tests/e2e/mobile-nav.spec.ts` LAST LINES: `18 failed` / `14 passed (15.9m)`. logger-depth **FAIL** (empty-start `goto /active waitUntil networkidle` 60s; sideways-scroll PASS). first-90 **FAIL** (cold visitor PASS 2.0s `/log`; homepage `.primary-action` expected 2 got 0; library Escape leaves dialog; sitemap `307 /bundle`; rest mostly networkidle 60s). mobile-nav **FAIL** (tab bar fits PASS; REACH + More Escape `goto /log waitUntil networkidle` 60s — REACH_BUDGET=2 ungraded). STILLS: `U1-R2-landed-after-continue.png` · `U1-R2-set-row.png` · `U1-R2-rest.png` · `U1-R2-ghost.png` · `U1-R2-finished.png`. FEEL (founder-only, not a builder brief): Victory sheet leaves Session locked / empty Active stacked under the overlay. | Logger-depth empty-start, REACH, and thumb-sweep still `goto(..., { waitUntil: 'networkidle' })` which never settles on `npm run dev`, so those written U1 cases cannot grade. |
| U1 | 3 | `.841` — empty-start dock primary (I-Day complete, drop `mw_equipment`); REACH = tabs + More rows (no `/assessments`); first-90 teaser `/` + 19:00 without VAPID Turn on. `.840` `gotoHydrated`. Branch `cursor/gnt-1-u1-r3-networkidle-f368`. PR #665. TAP_BUDGET stays 5. No `PRIVATE_MODE` flip. | **PASS** — landed_after_continue=http://localhost:3000/log. Walk 390×844: Begin → Continue → Today (Chest — Just Go) → Log set 8×BW+0 → REST 1:30 → PREV — (last-set-ghost=false) → Victory. COMMAND: `npx playwright test tests/e2e/logger-depth.spec.ts tests/e2e/first-90.spec.ts tests/e2e/mobile-nav.spec.ts` LAST LINES: `✓ 22 [mobile-chrome] › tests/e2e/first-90.spec.ts:359:7 › First 90 seconds @gate › every control in the feedback sheet is thumb-sized @gate (1.4s)` / `✓ 23 … logger-depth … start empty, add push-ups, log set, rest timer, skip rest, finish (2.0s)` / `✓ 24 … logging a set does not scroll the phone sideways (1.5s)` / `✓ 25–28 … Logger resilience @gate` (4 cases) / `✓ 29 … the tab bar fits the narrowest phone we support (514ms)` / `✓ 30 … before the first workout the pillars are not on the rail at all (1.4s)` / `✓ 31 … every rail screen is reachable within the tap budget (1.4s)` / `✓ 32 … the More sheet closes on Escape and restores focus (1.3s)` / `32 passed (45.3s)`. logger-depth **PASS**. first-90 **PASS** (cold visitor 2.5s `/log`; homepage teaser 405ms; sitemap 16.5s; 19:00 one red 1.3s; logger thumb 2.7s). mobile-nav **PASS** (REACH_BUDGET=2). STILLS: `U1-R3-landed-after-continue.png` · `U1-R3-set-row.png` · `U1-R3-rest.png` · `U1-R3-ghost.png` · `U1-R3-finished.png`. FEEL (founder-only, not a builder brief): Victory sheet still stacks Session locked / empty Active under the overlay. | Victory finish still paints Session locked / No session running under the sheet, so the Peak-End beat is not a clean one-thumb exit |
| U2 | 2 | `.839` `/log` gate-public | **PASS** (Today stills + zero-state `/log` green 3.4s). Cold = one dock Just Go. | Sign-in chip on returning stills — not the dock |
| U3 | 3 | Today two injected weeks (plan cleared). `/coach` 307. | **PARTIAL** — Today A dock Upper Body Strength; B Recovery & Mobility. Engine 2/2. No `/coach` stills. | `/coach` stills (gate cookie) |
| U3 | 4 | critic-only `/coach` stills on `npm run dev`. No product this spawn. Builder budget already spent. | **PASS** — coach_status=200 coach_url=http://localhost:3000/coach. Walk 390×844 `npm run dev`: I-Day Continue → `/log` → `/coach` empty (cite no-logs; dose 2 sessions · mostly strength · ~120 min) → 7 logger finishes (not `seed-coach-adapt-demo.mjs`) → clear `mw_coach_plan` → `/coach` (cite From your log: Full Body Strength · Aug 15; dose 2 sessions · mixed strength & recovery · ~92 min; Sun Mobility). COMMAND: `npx tsx --test src/lib/coach/gnt1HistoryDose.test.ts` LAST LINES: `ok 1 - cold vs high-strain history changes Coach week kinds and set count` / `ok 2 - Thursday adapt keeps the two weeks visibly different` / `# tests 2` `# pass 2` `# fail 0` `# duration_ms 179.633819`. STILLS: `U3-R4-coach-history-a.png` · `U3-R4-coach-history-b.png` · `U3-R4-today-history-a.png` · `U3-R4-today-history-b.png`. FEEL (founder-only, not a builder brief): Today dock stays Full Body Strength on both histories. | Same-week adapt after seven logger finishes still painted mostly-strength with both days Done until `mw_coach_plan` was cleared, so a week generated from empty logs does not earn recovery until regenerate or Monday rollover |
| U4 | 2 | `/log` public after `.839` | **PASS** — quiet lines on Today: 3/7/14 days off + 20-minute version. Guard 5/5. No streak-guilt. | — |
| U5 | 1 | `.837` — TAP_BUDGET=5 + firstPaintFloor 167 **named** (copy-drift, not 90s). | **FAIL** at critic time — first-90 expected `/log`, got `/active`. **Closed by `.839`.** | I-Day Continue must land Today — done `.839` |
| U5 | 2 | already-true on tip `.841` — I-Day → `/log` closed `.839`. No product this spawn. | **PASS** — landed_after_continue=http://localhost:3000/log. wall_clock_s=3.3. Walk 390×844: Begin → Continue → Today (Training — Just Go) → Log set → REST 1:30 (SETS 1/12) → Victory → Back to Today (Just Go — Chest, 1 primary). COMMAND: `npx playwright test tests/e2e/first-90.spec.ts` LAST LINES: `✓   1 [mobile-chrome] › tests/e2e/first-90.spec.ts:34:7 › First 90 seconds @gate › a cold visitor logs a set within the tap budget, with no interstitial (2.5s)` / `✓  22 [mobile-chrome] › tests/e2e/first-90.spec.ts:359:7 › First 90 seconds @gate › every control in the feedback sheet is thumb-sized @gate (1.7s)` / `22 passed (36.7s)`. TAP_BUDGET=5 case green. COMMAND: `npx tsx --test src/lib/gnt1First90.test.ts` LAST LINES: `ok 1 - first-90 TAP_BUDGET is 5 and must not be raised` / `ok 2 - logger-depth walk reaches Victory / Back to Today` / `ok 3 - first-paint drift cap is 167 and down-only` / `# tests 3` `# pass 3` `# fail 0` `# duration_ms 142.949559`. firstPaintFloor 167 is not this bar. STILLS: `U5-R2-cold-open.png` · `U5-R2-first-set.png` · `U5-R2-victory.png` · `U5-R2-clear-next.png` + `U5-R2-timing.txt`. FEEL (founder-only, not a builder brief): I-Day still reads ABOUT TWO MINUTES and previews Just Go — Legs, then Today docks Training — Just Go and Victory closes Just Go — Chest over Session locked / empty Active. | Victory finish still stacks Session locked / empty Active under the sheet, so the 90s Peak-End is not a clean one-thumb close |
| Smoother | 1 | `.839` already on tip — first-90 green. | logged — DESIGN_REVIEW row + §10 ritual. `check-design-system` 1116 files / 0 drift. | U2–U4 on-Today stills |
| Smoother | 2 | `.844` — Victory-open empty Active mounts the honor sheet only; close 44px. Branch `cursor/gnt-1-smoother-841-f368`. | 8/8 bars × 4 surfaces PASS on 390×844 `npm run dev` (ungated). STILLS: `SMOOTHER-today.png` · `SMOOTHER-train.png` · `SMOOTHER-victory.png` · `SMOOTHER-coach.png`. `check-design-system` 1116 files / 12 allowlisted / 0 drift. Victory `noSessionRunning=false` `sessionLocked=true` thumbs=[] First Blood. Coach `From your log: Just Go — Chest · Aug 15`; Sat Done; Sign in outline; `Start this session` below fold. | Next spawn `LEAD · GNT-1 report` |

## Evidence dossier (per unit)

Fill as rounds ship. Own-app stills under `GNT-1/evidence/` named `U<n>-R<r>-<beat>.png`.

| unit | stills | instrument paste | A/B (measurements only) |
|------|--------|------------------|-------------------------|
| U1 | R3: `U1-R3-landed-after-continue.png` · `U1-R3-set-row.png` · `U1-R3-rest.png` · `U1-R3-ghost.png` · `U1-R3-finished.png`. R1 kept. | **2026-08-15 critic R3 e2e (paste):** COMMAND: `npx playwright test tests/e2e/logger-depth.spec.ts tests/e2e/first-90.spec.ts tests/e2e/mobile-nav.spec.ts` LAST LINES: `✓ 22 … feedback sheet is thumb-sized @gate (1.4s)` `✓ 23 … start empty, add push-ups, log set, rest timer, skip rest, finish (2.0s)` `✓ 24 … logging a set does not scroll the phone sideways (1.5s)` `✓ 25 … unparseable JSON (417ms)` `✓ 26 … wrong shape (411ms)` `✓ 27 … null active workout (425ms)` `✓ 28 … no exercises array (393ms)` `✓ 29 … tab bar fits (514ms)` `✓ 30 … pillars are not on the rail at all (1.4s)` `✓ 31 … every rail screen is reachable within the tap budget (1.4s)` `✓ 32 … More sheet closes on Escape (1.3s)` `32 passed (45.3s)`. Walk: landed_after_continue=http://localhost:3000/log; Chest — Just Go; Log set 8×BW+0; rest REST 1:30; PREV —; last-set-ghost=false. | no founder FLOORS — do not FAIL |
| U2 | R2: `U2-R2-cold.png` · `U2-R2-returning.png` · `U2-R2-mid-plan.png`. R1 Notify-me kept as historical fail. | **2026-08-15 R2:** `npx playwright test tests/e2e/zero-state.spec.ts -g "/log offers"` → **1 passed (4.1s)**. Cold dock = Chest Just Go. | no founder FLOORS |
| U3 | R4: `U3-R4-coach-history-a.png` (no-logs · mostly strength) · `U3-R4-coach-history-b.png` (From your log · mixed strength & recovery) · `U3-R4-today-history-a.png` (0 days logged · Full Body Strength) · `U3-R4-today-history-b.png` (7 sessions logged · Full Body Strength). R3 Today stills kept. | **2026-08-15 critic R4:** COMMAND: `npx tsx --test src/lib/coach/gnt1HistoryDose.test.ts` LAST LINES: `ok 1 - cold vs high-strain history changes Coach week kinds and set count` / `ok 2 - Thursday adapt keeps the two weeks visibly different` / `# tests 2` `# pass 2` `# fail 0` `# duration_ms 179.633819`. Walk: coach_status=200 coach_url=http://localhost:3000/coach on `npm run dev`. Two histories seeded via the logger (7 finishes); not the demo IIFE. Paste: `U3-R4-engine.txt`. | no founder FLOORS — do not FAIL |
| U4 | `U4-R2-missed-3.png` · `U4-R2-missed-7.png` · `U4-R2-missed-14.png` | **2026-08-15 R2:** dock lines “Seven days off. Here's the 20-minute version.” / “14 days off…”. Guard 5/5. No you-missed / streak-guilt. | no founder FLOORS |
| U5 | R2: `U5-R2-cold-open.png` · `U5-R2-first-set.png` · `U5-R2-victory.png` · `U5-R2-clear-next.png` + `U5-R2-timing.txt` (`landed_after_continue=http://localhost:3000/log` · `wall_clock_s=3.3`). R1 `U5-R1-cold-open.png` kept (landed `/active`). | **2026-08-15 critic R2:** COMMAND: `npx playwright test tests/e2e/first-90.spec.ts` LAST LINES: `✓   1 … a cold visitor logs a set within the tap budget, with no interstitial (2.5s)` / `✓  22 … every control in the feedback sheet is thumb-sized @gate (1.7s)` / `22 passed (36.7s)`. COMMAND: `npx tsx --test src/lib/gnt1First90.test.ts` LAST LINES: `ok 1 - first-90 TAP_BUDGET is 5 and must not be raised` / `ok 2 - logger-depth walk reaches Victory / Back to Today` / `ok 3 - first-paint drift cap is 167 and down-only` / `# tests 3` `# pass 3` `# fail 0` `# duration_ms 142.949559`. Timed walk ≤90s **PASS** (3.3s). firstPaintFloor 167 is not this bar. | no founder FLOORS — do not FAIL |
| Smoother | R2: `SMOOTHER-today.png` · `SMOOTHER-train.png` · `SMOOTHER-victory.png` · `SMOOTHER-coach.png`. DESIGN_REVIEW Passes row + UX_PLAYBOOK §10 closing ritual this PR. | `npm run check-design-system` → 1116 files scanned, 12 allowlisted, 0 drift. Walk 390×844 `npm run dev`. Victory: no “No session running” under Session locked (`.844`). Coach cite: From your log: Just Go — Chest · Aug 15. | — |

## Campaign report

LEAD maps critic-pasted evidence onto the [EXCELLENCE_RESULT.md](../EXCELLENCE_RESULT.md) checklist. LEAD does not score RESULT. Unit bars below are critic verdicts on the written instruments, not founder phone sign-off.

Bar as written: unit table above. Full round log: table above. Build PRs spent: **7 / 14** (`.835` `.836` `.837` `.839` `.840` `.841` `.844`). Unused cap is success.

### RESULT mapping (W1–W4 + C5)

| RESULT line | Unit | Critic bar | Evidence (critic-pasted; LEAD maps, does not score RESULT) |
|-------------|------|------------|-------------------------------------------------------------|
| W1 Activation | U1+U5 | **PASS** | U1 R3: Continue → `/log`; logger-depth + first-90 + mobile-nav **32 passed (45.3s)**. Stills `U1-R3-landed-after-continue.png`, `U1-R3-set-row.png`. U5 R2: TAP_BUDGET cold visitor **2.5s**; Continue → `/log`. Stills `U5-R2-cold-open.png`, `U5-R2-clear-next.png`. |
| W2 One boss CTA | U2 | **PASS** | U2 R2: `/log` zero-state **1 passed (4.1s)**; cold dock Chest Just Go. Stills `U2-R2-cold.png`, `U2-R2-returning.png`, `U2-R2-mid-plan.png`. |
| W3 Logger + Victory | U1+U5+smoother | **PASS** | U1 R3 outdoor stills `U1-R3-set-row.png` · `rest` · `ghost` · `finished`. U5 R2 `U5-R2-first-set.png`, `U5-R2-victory.png`. Smoother R2 `.844`: Victory honor sheet only (`noSessionRunning=false`); still `SMOOTHER-victory.png`. |
| W4 Coach continuity | U3+U4 | **PASS** | U3 R4: engine **2/2**; `/coach` **200** on `npm run dev`; logger 0 vs 7 finishes change dose (mostly strength → mixed + mobility). Stills `U3-R4-coach-history-a.png` · `U3-R4-coach-history-b.png`. U4 R2: 3/7/14 quiet lines; guard 5/5. Stills `U4-R2-missed-3.png` · `missed-7` · `missed-14`. |
| C5 Phone hero ≤90s | U5 | **PASS** | U5 R2: TAP_BUDGET **5**; timed walk `wall_clock_s=3.3`; first-90 **22 passed (36.7s)**; pin `gnt1First90.test.ts` **3/3**. Stills `U5-R2-cold-open.png` → `first-set` → `victory` → `clear-next`. |

### Remaining gaps (founder-only — not builder briefs)

- `docs/EXCELLENCE_RESULT.md` is still `status: unscored` — agents never write `status: pass`.
- Founder phone walk of W1–W4 + C5. This dossier makes that scoring a formality, not a substitute.
- U3: a week generated from empty logs did not earn recovery until `mw_coach_plan` was cleared; Today dock stayed Full Body Strength on both histories.
- U2 returning stills carry a Sign-in chip (not the dock).
- I-Day copy still reads ABOUT TWO MINUTES and can preview a different Just Go than Today docks.
- No founder FLOORS/BANDS, so Hevy / Strong / Freeletics / Bevel A/B never FAILed a unit.
- `#656` closed AL1 against an unmerged stack — ignore it.

### Terminal state

`ready-for-founder` — **never** `status: pass`.
