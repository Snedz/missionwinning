# Graph loop — continuation protocol

**Audience:** Founder + the next Hermes / Grok Build / graph agent  
**Lane:** Engineering-Web (unless a loop says Android)  
**Status:** ACTIVE 2026-08-16 · web `2026.07-unified.867` · Alpha 0.1.0 · **AL1 done — GNT-1 `ready-for-founder` · AM1 done — GNT-2 `ready-for-founder` · AN–AT done — `IL-H-07` `.865` · founder no-French `.866` · W1 I-Day → `/log` `.867`**  
**Does not replace:** [ORCHESTRATION.md](../ORCHESTRATION.md) (what may be built) · [CONTEXT.md](../CONTEXT.md) `## Now` (where we are) · [vision.md](../vision.md) (constitution) · [docs/THESIS.md](THESIS.md) (wedge) · [docs/PLAN.md](PLAN.md) (phases A–I)

This file is the **execution queue** for the agent graph: one concern per loop, spawn, ship, mark done, spawn the next. It is not a second status block and not a license to skip standing hard bans.

---

## Who runs the graph (Hermes vs Grok Build)

Agents do **not** need a group chat. This file is the baton. One spawn reads the top `open` row, ships one PR, marks it `done`, exits. The next spawn (Hermes cron, or you) reads the new top row.

| Machine | Job |
|---------|-----|
| **Hermes** (local, always-on) | Build + **machine tests** (`npm test` of the loop, typecheck if you touched TS). Serial. One loop per spawn. |
| **Grok Build** (this terminal) | Founder **eyes**: Preview, “show me the gate/homepage”, does it still look like `.696` after Done. Not a second test runner. |
| **Neither** | `PRIVATE_MODE`, excellence `status: pass`, postal, invites, EIN |

Hermes already has tests in the loop (rule 4). Do not park a loop for “Grok will test it.” Park it only if the founder must *see* a screen.

Do not run Hermes and Grok Build writing `master` at the same time.

## This session — H0 done; G queue named (2026-08-14)

H0-1…H0-7 shipped. Founder: keep building toward Year-1 wedge + the Next www (Alpha gate → `.696` landing). W1–W4 return as **G4–G7**.

| Still true | What this session does **not** do |
|------------|-----------------------------------|
| [ORCHESTRATION.md](../ORCHESTRATION.md) still names Horizon W as the standing NOW | Do not write `status: pass` in [EXCELLENCE_RESULT.md](EXCELLENCE_RESULT.md) |
| Surface PRs still need `Excellence-Override` while RESULT is `unscored` | Do not restore `CinematicWww` as `/` |
| Hard bans (logger, `PRIVATE_MODE`, traction, America / wearables-as-score / iOS) | Do not invent ≥10 beta, EIN, or secrets |

---

## What “the graph / loop” is

A standing cycle, not a chat:

```text
read spine → pick the top open loop here → one PR → tests + ship protocol
    → mark the loop done in this file → spawn the next agent with the prompt below
```

### Where rows come from (`.840`)

Until now every row on this queue was written by an agent reading **this repo's
own source**, and it showed: after G7 the queue ran one row per letter and
roughly sixteen consecutive rows were the same idea — first-paint copy drift,
cap walking 216 → 167 — which is why every block below ends with *"Do not invent
X2."* A prose diversity rule, tried sixteen times.

[docs/IDEA_LOOP.md](IDEA_LOOP.md) is the third organ: it harvests behavioural
mechanics from outside, kills most of them on the way in, and emits **exactly one
candidate row** here per run. It is **not a second queue** and does not write to
this file — `npm run idea:next` prints the row and a human or the spawn taking
the loop pastes it, because handing over the baton is not a side effect of a
command. Rows it produced are prefixed `IL-`.

Nothing else about this file changes. One `open` row at a time, one concern per
PR, and the `done` edit is still the baton.

### Which row is live (`.850`)

`npm run graph` answers that by **reading this file** — the `## Queue` region
only, tables addressed by header name, status taken from the parsed Status cell.
It names the live ticket, the route (`build` · `gauntlet` · `harvest`), the recipe,
the workbench and its `Next spawn` line, and any `founder`/`blocked` row it stepped
over. It also prints closed-loop **lessons** (`docs/mechanics/verdicts/`) and, on
a harvest route, the `idea:next` pick. Like `idea:next` it prints and never writes;
the `done` edit is still the baton. Recipe 14, `src/lib/loopQueue/`, `src/lib/ideaGraph/learn.ts`.

Two things it settles that prose could not:

- **A grep cannot read this file.** `grep '`open`'` returns thirteen hits, nine of
  them prose, and three of the remaining table rows are `done` rows whose *Moves*
  text contains the word — `D1`, `K2`, `N1`. Status is a cell, not a spelling.
- **`MAX_SINGLE_ROW_RUN` is *"Do not invent X2"* with teeth.** Rows per `Now`
  section run `7 7 8 4 2 1 2 1 1 1 1 1 2 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1`: a
  trailing run of **sixteen** one-row sections, which is the drift era measured
  rather than described. It is a ratchet and may only go down — a new `Now` section
  carries ≥2 rows, or the queue takes a harvest first. It never displaces a live
  `open` row; it bites at the moment the last row closes.

Recent turns:

| Turn | What it was | Outcome |
|------|-------------|---------|
| Kaizen nights | Wedge UX density | Merged (#222, #234) |
| Live-walk graph (sand, 2026-08-12) | Beta honesty | **Partial.** Merged #453 #454 #455 #462 #463 #464. Closed unmerged #451–#461 — harvest is parked with W |
| `.772`–`.779` | Form stills, coach RAG, LLM $ cap, Mission Server, PAR-Q, privacy program | On master. Craft window, not phone excellence sign-off |
| This file v1 | Horizon W queue 0–8 | Docs-only. **Parked** this session |
| This file v2 | Horizon 0+ queue (research 2026-08-14) | Docs |
| **H0-1** | PWA `start_url` flag-switch | `.780` this PR — **done** |
| **H0-2** | Launch env H0 vs H1 (FREE_BETA) | `.781` this PR — **done** |
| **H0-3** | API inventory + glob guard | `.787` — **done** |
| **H0-5** | Win Score → Mission Score leftover copy | `.788` this PR — **done** |
| **H0-6** | Guidebook chapter heroes | `.268` already paper; leftover glyphs `.789` — **done** |
| **H0-7** | Runbook / scorecard vs CONTEXT | docs — **done** |

---

## “Limitless” — how to read the founder ask

Map the path to the constitution. Prefer delete/refine and wedge depth over another planning memo. Do not refuse a loop because it is “too much product” if it is on **this** queue.

Agents still may not: flip `PRIVATE_MODE`, invent traction, mark founder tasks done, gate the free logger, start iOS / America marketing / wearables-as-score / locale-body farms without a **new** override, or spawn ten agents on one concern.

Ambition lives in the **queue**. Each running agent still ships **one loop**.

---

## Loop rules (every agent)

1. **Read** CONTEXT → AGENTS → INDEX → ORCHESTRATION → **this file** → the folder INDEX you will edit.
2. **Take only the top `open` loop.** If you finish early, stop. Do not start the next loop in the same PR (one concern).
3. **Investigate in source** before coding. If the loop’s claim is already false on master, mark it `done (already true)` with the file that proves it — do not restyle.
4. **Ship protocol** if you touch `src/`, `app/`, `scripts/`, or `supabase/`: bump `APP_BUILD_LABEL` **past master**, LOG + CONTEXT `## Now` in the same commit, `[skip vercel]` unless the founder asked for Preview, `Excellence-Override: <reason>` if the path class is `surface` while RESULT is unscored. Docs-only PRs do **not** mint a version.
5. **Hard bans (standing):** free logger never gated · no `PRIVATE_MODE` flip · no invented traction · no America/wearables-as-score/iOS · no chat on Today · do not raise `TAP_BUDGET` · do not steal occupied build labels.
6. **After merge:** edit this file — set the loop `done`, put the PR/label in the Outcome column, leave the next loop `open`. That edit is the baton.

### Shapes (sequence is not a dependency)

The queue is a graph. Most Continue nights ran it as a chain and paid for it: two writers on one tree, then a shim for a stale bundler.

| Shape | When | How |
|-------|------|-----|
| **Chain** | B consumes A’s output | Ship protocol is always a chain: label, LOG, CONTEXT `## Now`. One writer. |
| **Diamond** | Leftovers do not share files or state | Discover first. Isolated worktrees. **One** serial joiner assigns the next free label and rotates LOG/CONTEXT. Never two writers on one tree. |
| **Router** | already-true / founder / blocked | Webpack “can’t resolve” an old path when source already imports the new module is `already true` + restart `next dev`. Not a ship. Do not put a shim back under `src/lib/rewards/` (AG1 / `.830` — C2/C7). |
| **Controlled cycle** | Amount of work unknown | Continue after residual thin is **not** a cycle. Every cycle needs a discover proof, a hard stop, and a budget. |

A join is worth the wait only for the complete set (cross-file label, LOG rotation, CONTEXT bullets). Independent first-paint leftovers do not consume each other.

### Stop the graph if

- Two loops in a row ship without moving an H0 agent-allowed item (or an explicit queue item)
- You are about to write another plan instead of executing the top `open` loop
- A loop requires a founder secret / postal / invite / env flip — mark it `founder` and take the next **agent** `open` row

Do **not** stop solely because RESULT is `unscored` while this skip-W note is in force.

---

## Queue

Status key: `open` · `done` · `parked` · `hold` · `founder` · `blocked`. Backticked, in the Status cell — `npm run graph` reads that cell as a value, not the row as text.

### Now — Horizon 0 (agents)

Verified in source 2026-08-14 (master `.779`). Findings with proof paths: [§ Research](#research--verified-2026-08-14).

| # | Loop | Moves | Status |
|---|------|-------|--------|
| **H0-1** | PWA `start_url` flag-switch (same predicate as SW) | Public-flip landmine | `done` — `.780` this PR |
| **H0-2** | `check-env --launch` vs FREE_BETA (H0 vs H1 profiles) | Launch-verify can succeed | `done` — `.781` this PR |
| **H0-3** | API INDEX + `docs/API.md` + PROGRAM_STATUS census | Docs match reality | `done` — `.787` |
| **H0-4** | Public-flip checklist: `start_url` curl + SW; runbook pointers | Flip-day smoke | `done` — docs |
| **H0-5** | “Win Score” → Mission Score leftover strings | Public copy honesty | `done` — `.788` |
| **H0-6** | Guidebook chapter heroes still navy/emerald | Design honesty before baselines | `done` — already `.268`; leftover glyphs `.789` |
| **H0-7** | Production-stack / runbook vs CONTEXT (Upstash, `.104`) | Docs match reality | `done` — docs |

### Now — G queue (agents · 2026-08-14)

H0 is empty. Top `open` row is the only live ticket.

| # | Loop | Moves | Status |
|---|------|-------|--------|
| **G1** | Next landing: empty Reveal bands + photo slots | After Done, `/` is `.696`. Reveal leaves blank paper; three photo slots empty | `done` — `.793` this PR |
| **G2** | Landing chrome honesty | Status bar leftover / Alpha vs Free-beta | `done` — `.794` this PR |
| **G3** | `sites/www` **about** page only | Commissioned Astro. Do **not** steal `www.missionwinning.com` from Next | `done` — `.795` this PR |
| **G4** | Today: one next session | Old W1. Phone shows train / resume | `done (already true)` — JourneyHero Resume / one train CTA; `justGoHeroMeta.ts`; `todayPrimaryAction.ts`; Lean + Dashboard `ScreenDock` |
| **G5** | Logger one-thumb | Old W2. Outdoor set log | `done` — `.796` this PR |
| **G6** | Coach week on Coach **and** Today | Old W3. Dose + adapt visible | `done` — `.797` this PR |
| **G7** | Missed-day re-entry, in-app | Old W4. No shame copy | `done (already true)` — JourneyHero `TodayReentryCard` quiet line; `doseScale` on Start; `reentryCopyGuard.test.ts`; Lean + Dashboard `reentryCardMayMount` |

Do not reopen cinematic. Do not add Compare. Club / Server / Athlete public URL stay off this table.

### Now — C queue (craft · full-launch override · 2026-08-14)

G is empty. Horizon W pass is founder-later. C1–C8 are done. **Do not invent C9.**

| # | Loop | Moves | Status |
|---|------|-------|--------|
| **C1** | `sites/www` **vision** page only | Additive Astro. Do **not** steal host or Next `/vision` | `done` — `.798` this PR |
| **C2** | `sites/www` **compare** index only | Links Next `/guide/mission-winning-vs-*`. Do not move SEO URLs | `done` — `.799` this PR |
| **C3** | Track strap honesty | Wearable card must not imply a live sync | `done` — `.800` this PR |
| **C4** | In-app Help / FAQ | `docs/help` into the app. Not a Today tab | `done` — `.801` this PR |
| **C5** | Programs merch honesty | No second-store / coming-soon paid coach | `done` — `.802` this PR |
| **C6** | Rewards planned rest | R4b. Weekly goal stays boss | `done` — `.803` this PR |
| **C7** | Victory Fuel/Mind ritual | Residual. Mark already-true if wired | `done (already true)` — `pickVictoryNextAction` high strain → `/mind?collection=post-train` (`src/lib/workout/workoutVictory.ts` + `.test.ts`). Wedge next stays Coach when a plan exists. No restyle. |
| **C8** | Fuel estimate residual | Investigate. Do not invent NL tokens | `done (already true)` — `estimateLogAllowed` + `MealEstimateDraft` edit-before-log (`.270`/`.411`). Low / requireEdit cannot log until the athlete touches the draft. No invented NL tokens. |

### Now — D queue (revised 2026-08-14 · Alpha)

First D list mixed Alpha with leftover open-beta shop work. Product stamp is **Alpha 0.1.0**. `isFreeBeta()` is mute-pay, not the name.

| # | Loop | Moves | Status |
|---|------|-------|--------|
| **D1** | Alpha copy leftover | Athlete-facing “open beta” → Alpha. Do not rename `isFreeBeta()` | `done` — `.804` this PR |
| **D2** | Alpha docs frame | `docs/FREE_BETA.md` Frame line. Mute-pay fact stays | `done` — this PR |
| **D3** | CareerLine empty → `/active` | `CareerLineCard.tsx` invitation copy, no exit | `done` — `.805` this PR |
| **D4** | Astro compare rail / www 5th nav | Hold. 3 live vs-pages. One red | `hold` |

**Dropped:** Astro `/press` · Astro `/bundle` · Pacers (already-true) · Accept B (founder) · dual-mode FREE_BETA tests (old + already-true).

After D3 residual is thin → stop for phone. Do not invent D5 to refill eight slots.

### Now — K queue (kaizen · founder Continue 2026-08-14)

D is done except D4 hold. Founder skipped phone. Goal: leftover empty rooms + leftover “beta opens” words. Not a letter after D.

| # | Loop | Moves | Status |
|---|------|-------|--------|
| **K1** | Builder category empty | `ProgramTemplatesPanel` dead `<p>` → EmptyState `/active` | `done` — `.806` this PR |
| **K2** | www CTA leftover | `Get an invite` / `when the beta opens` vs Alpha | `done` — `.807` this PR |

### Now — N1 (plan after `.807`)

K residual was thin. Founder Execute of `.hermes/plans/2026-08-14_200951-next-after-807.md`.

| # | Loop | Moves | Status |
|---|------|-------|--------|
| **N1** | Help markdown Alpha frame | `docs/help` names Alpha, not free-first / open / private beta | `done` — this PR |

Do not invent N2. D4 stays hold.

### Now — Q (kaizen hour · 2026-08-14)

Founder Continue after N1. Not N2.

| # | Loop | Moves | Status |
|---|------|-------|--------|
| **Q1** | Help docs Mission Score | `docs/help` current name, not leftover Win Score | `done` — this PR |
| **Q2** | Help first-paint title | `infoHelpTitle` defaultValue matches pack `Help`. Drift cap 216 | `done` — `.808` this PR |

### Now — R (Continue after Q · 2026-08-14)

Not Q3. Builder first-paint leftover.

| # | Loop | Moves | Status |
|---|------|-------|--------|
| **R1** | Builder first-paint | count + empty saved match pack. Drift cap 214 | `done` — `.809` this PR |

D4 stays hold. Do not invent R2.

### Now — S (Continue after R · 2026-08-14)

Not R2. Visibility report leftover.

| # | Loop | Moves | Status |
|---|------|-------|--------|
| **S1** | Visibility Alpha frame | Account Visibility reason is Alpha mute-pay, not free-first beta | `done` — `.810` this PR |

D4 stays hold. Do not invent S2.

### Now — T (Continue after S · 2026-08-14)

Not S2. S1 left the access-row details.

| # | Loop | Moves | Status |
|---|------|-------|--------|
| **T1** | Visibility access Alpha | Access details say Alpha mute-pay, not Open-beta | `done` — `.811` this PR |

D4 stays hold. Do not invent T2.

### Now — U (Continue after T · 2026-08-14)

Not T2. History first-paint leftover.

| # | Loop | Moves | Status |
|---|------|-------|--------|
| **U1** | History first-paint | Title, count, empty, no-match match pack. Drift cap 210 | `done` — `.812` this PR |

D4 stays hold. Do not invent U2.

### Now — V (Continue after U · 2026-08-14)

Not U2. Move first-paint leftover. Not Mind/Learn.

| # | Loop | Moves | Status |
|---|------|-------|--------|
| **V1** | Move first-paint | Title + chrome match pack. Drift cap 205 | `done` — `.813` this PR |

D4 stays hold. Do not invent V2.

### Now — W (hydration · 2026-08-14)

Not V2. Landing footer geo guess hydrates.

| # | Loop | Moves | Status |
|---|------|-------|--------|
| **W1** | Locale control hydrate | Country lock waits for mount. No timezone first-paint | `done` — `.814` |
| **W1 residual** | Intl country names | Country select after mount. Node ≠ browser DisplayNames | `done` — `.815` this PR |

D4 stays hold. Do not invent W2.

### Now — X (plan after `.815` · 2026-08-14)

Not W2. Mind first-paint leftover. Not Learn.

| # | Loop | Moves | Status |
|---|------|-------|--------|
| **X1** | Mind first-paint | Title + chrome match pack. Drift cap 201 | `done` — `.816` this PR |

D4 stays hold. Do not invent X2.

### Now — Y (Continue after X · 2026-08-14)

Not X2. Learn first-paint leftover.

| # | Loop | Moves | Status |
|---|------|-------|--------|
| **Y1** | Learn first-paint | Title + chrome match pack. Drift cap 195 | `done` — `.817` this PR |

D4 stays hold. Do not invent Y2.

### Now — Z (Continue after Y · 2026-08-14)

Not Y2. Coach first-paint leftover. Not Today card.

| # | Loop | Moves | Status |
|---|------|-------|--------|
| **Z1** | Coach first-paint | Subtitle + empty title + free-core match pack. Drift cap 192 | `done` — `.818` this PR |

D4 stays hold. Do not invent Z2.

### Now — AA (Continue after Z · 2026-08-14)

Not Z2. Today Coach card leftover.

| # | Loop | Moves | Status |
|---|------|-------|--------|
| **AA1** | Today Coach card | Mission + locked chrome match pack. Drift cap 189 | `done` — `.819` this PR |

D4 stays hold. Do not invent AA2.

### Now — AB (Continue after AA · 2026-08-14)

Not AA2. Fuel page title leftover.

| # | Loop | Moves | Status |
|---|------|-------|--------|
| **AB1** | Fuel title first-paint | Title is Nutrition. Drift cap 188 | `done` — `.820` this PR |

D4 stays hold. Do not invent AB2.

### Now — AC (Continue after AB · 2026-08-14)

Not AB2. FuelTodayLogCard leftover.

| # | Loop | Moves | Status |
|---|------|-------|--------|
| **AC1** | Fuel log card first-paint | Load from Cloud + empty match pack. Drift cap 186 | `done` — `.821` this PR |

D4 stays hold. Do not invent AC2.

### Now — AD (Continue after AC · 2026-08-14)

Not AC2. Learn locked-preview leftover.

| # | Loop | Moves | Status |
|---|------|-------|--------|
| **AD1** | Learn locked preview | Read intro chapter →. Drift cap 185 | `done` — `.822` this PR |

D4 stays hold. Do not invent AD2.

### Now — AE (Continue after AD · 2026-08-14)

Not AD2. Today progress leftover. #621 shipped the test only.

| # | Loop | Moves | Status |
|---|------|-------|--------|
| **AE1** | Today progress first-paint | CTAs + wins chrome match pack. Drift cap 176 | `done` — `.828` this PR |

D4 stays hold. Do not invent AE2.

### Now — AF (Continue after AE · 2026-08-15)

Not AE2. Journal strip leftover. plannedRest import is already `@/lib/plannedRest` (stale webpack).

| # | Loop | Moves | Status |
|---|------|-------|--------|
| **AF1** | Today journal strip | Log check-in →. Drift cap 174 | `done` — `.829` this PR |

D4 stays hold. Do not invent AF2.

### Now — AG (dev-server leftover · 2026-08-15)

Not AF2. Webpack still asked for the pre-`.825` path.

| # | Loop | Moves | Status |
|---|------|-------|--------|
| **AG1** | plannedRest shim | `src/lib/rewards/plannedRest.ts` re-exports moved module | `done` — `.830` this PR |

D4 stays hold. Do not invent AG2.

### Now — AH (Continue after AG · 2026-08-15)

Not AG2. Profile account leftover.

| # | Loop | Moves | Status |
|---|------|-------|--------|
| **AH1** | Profile account first-paint | Sync + optional-sign-in match core EN pack | `done` — `.831` this PR |

D4 stays hold. Do not invent AH2.

### Now — AI (Continue after AH · 2026-08-15)

Not AH2. Profile journey leftover.

| # | Loop | Moves | Status |
|---|------|-------|--------|
| **AI1** | Profile journey first-paint | First-time setup + Begin + Edit profile | `done` — `.832` this PR |

D4 stays hold. Do not invent AI2.

### Now — AJ (Continue after AI · 2026-08-15)

Not AI2. Coach insight leftover.

| # | Loop | Moves | Status |
|---|------|-------|--------|
| **AJ1** | Coach insight first-paint | Title + desc match pack. Drift cap 169 | `done` — `.833` this PR |

D4 stays hold. Do not invent AJ2.

### Now — AK (Continue after AJ · 2026-08-15)

Not AJ2. Builder arrange leftover.

| # | Loop | Moves | Status |
|---|------|-------|--------|
| **AK1** | Builder arrange first-paint | Mobility + habit stack CTAs match pack. Drift cap 167 | `done` — `.834` this PR |

D4 stays hold. Do not invent AK2.

### Now — AL (gauntlet · founder-directed 2026-08-15)

Not AK2. Protocol + GNT-1 workbench. Grading, not a second queue.

| # | Loop | Moves | Status |
|---|------|-------|--------|
| **AL1** | Gauntlet GNT-1 wedge excellence | [docs/GAUNTLET_LOOP.md](GAUNTLET_LOOP.md) + [docs/gauntlet/GNT-1-wedge-excellence.md](gauntlet/GNT-1-wedge-excellence.md). U2/U3/U4 R2 critic pass closed the render gap; report written; 4 of ≤14 build PRs spent | `done` — `ready-for-founder`. **Founder action:** phone walk against the report, then `status: pass` in [EXCELLENCE_RESULT.md](EXCELLENCE_RESULT.md) if it holds. Agents never write it |

D4 stays hold. Do not invent AL2.

### Now — AM (gauntlet GNT-2 · 2026-08-15)

Not AL2. GNT-2 opened on its own written gate — *"enters GRAPH_LOOP only after GNT-1's report"* — and that report is written. Grading, not a second queue.

| # | Loop | Moves | Status |
|---|------|-------|--------|
| **AM1** | Gauntlet GNT-2 coach plan quality | [docs/gauntlet/GNT-2-coach-plan-quality.md](gauntlet/GNT-2-coach-plan-quality.md). Report written. U1–U4 critic PASS (engine). SMOOTHER R1 walked. 5 of ≤10 build PRs spent (only `.845` changed the planner) | `done` — `ready-for-founder`. **Founder action:** walk the planner-quality report. This campaign does **not** write [EXCELLENCE_RESULT.md](EXCELLENCE_RESULT.md) — that remains GNT-1 / Horizon W. Agents never write `status: pass` |

D4 stays hold. Do not invent AM2. Do not paste a second idea onto this AM section.

### Now — AN (harvest · 2026-08-16)

Not AM2. One `IL-` row from `idea:next`. A harvest row closes the 16-run; it is not the next letter.

| # | Loop | Moves | Status |
|---|------|-------|--------|
| **IL-H-01** | Power the working-set measurement chain end to end on one real install | [H-01](mechanics/hypotheses/H-01-power-the-working-set-chain.md) | `done` — `.853` this PR. Device rollup, hood snapshot, and account enqueue are one chain; PostHog is not required |

D4 stays hold. Do not invent AN2.

### Now — AO (harvest · 2026-08-16)

Not AN2. Next `idea:next` pick after H-01 was emitted. One `IL-` row.

| # | Loop | Moves | Status |
|---|------|-------|--------|
| **IL-H-09** | Every cohort number declares the selection it was drawn from | [H-09](mechanics/hypotheses/H-09-selection-frame-guard.md) | `done` — `.855` this PR. `frameCohort` + discover guard. `unknown=yes` stays in the output |

D4 stays hold. Do not invent AO2.

### Now — AP (harvest · 2026-08-16)

Not AO2. Next `idea:next` pick. One `IL-` row.

| # | Loop | Moves | Status |
|---|------|-------|--------|
| **IL-H-03** | The Coach witnesses the specific thing, with nobody else present | [H-03](mechanics/hypotheses/H-03-coach-witnesses-the-specific-thing.md) | `done` — `.857` this PR. Quiet line quotes the last stored exerciseId; never the gap |

D4 stays hold. Do not invent AP2.

### Now — AQ (harvest · 2026-08-16)

Not AP2. Next `idea:next` pick. One `IL-` row.

| # | Loop | Moves | Status |
|---|------|-------|--------|
| **IL-H-08** | The Coach diff appears only when the change is material | [H-08](mechanics/hypotheses/H-08-diff-only-when-material.md) | `done` — `.859` this PR. Order-only weeks are not an adapt |

D4 stays hold. Do not invent AQ2.

### Now — AR (harvest · 2026-08-16)

Not AQ2. Next `idea:next` pick. One `IL-` row.

| # | Loop | Moves | Status |
|---|------|-------|--------|
| **IL-H-02** | The Coach week arrives as a proposal with a visible diff | [H-02](mechanics/hypotheses/H-02-coach-week-as-proposal.md) | `done` — `.861` this PR. Session-count proposal replaces the banner. Citation is the stored set |

D4 stays hold. Do not invent AR2.

### Now — AS (harvest · 2026-08-16)

Not AR2. Next `idea:next` pick. One `IL-` row.

| # | Loop | Moves | Status |
|---|------|-------|--------|
| **IL-H-05** | Take one tap out of the cold path to a first set | [H-05](mechanics/hypotheses/H-05-drop-a-tap-from-cold-open.md) | `done` — `.863` this PR. `TAP_BUDGET` 5→4. Last stored set beats a suggestion |

D4 stays hold. Do not invent AS2.

### Now — AT (harvest · 2026-08-16)

Not AS2. Next `idea:next` pick. One `IL-` row.

| # | Loop | Moves | Status |
|---|------|-------|--------|
| **IL-H-07** | The first session back scales with sessions missed, not days elapsed | [H-07](mechanics/hypotheses/H-07-dose-follows-missed-sessions.md) | `done` — `.865` this PR. Stored miss count sets dose; no plan keeps calendar scale |

D4 stays hold. Do not invent AT2.

### After H0 (orientation — not open until H0-1…H0-7 are done or `founder`)

Do not pull these forward while H0 agent loops remain `open`.

| Horizon | Agent-allowed | Founder-only |
|---------|---------------|--------------|
| **1 — Public** | Offline + SW smoke after the flip; Search Console wiring; PostHog activation baseline **code**; residual 403 matrix | `PRIVATE_MODE=false`; VAPID / Sentry / Upstash / `CRON_SECRET` / `SMOKE_BASE_URL`; EIN → unmute Bundle; Lifetime vs Grok option 1/2/3 in runbook §5 (code default 15¢/day already `.775`) |
| **2 — PMF** | In-app return loop polish; interview-driven copy &lt;48h; one wall-metric SQL helper if the RPC shape is wrong | Week-4 proof SQL; 10 interviews; stop-acquisition call |
| **3 — Scale** | SEO compound, i18n bodies, TWA, wearables **as inputs**, iOS | Only after week-4 holds on two cohorts |

**Fuel estimate accuracy** already has edit-before-log (C8). Do **not** invent more NL tokens without founder dogfood.

**Two week-4 definitions already exist** — set-level in [docs/METRICS.md](METRICS.md) and workout RPC `mw_week4_retention()`. Do not invent a third.

### Parallel (do not jump the wedge)

| # | Loop | Moves | Status |
|---|------|-------|--------|
| **A** | Android Accept B prep (`apps/android/**` only) | Play path | `open` — separate lane |
| **W** | `sites/www` remaining pages / host split | Marketing die | `open` — sliced as **G3** (about only). Host still claimed by Next + Astro; do not flip DNS. |

### Founder (agents never mark done)

| Item | Why the graph cannot finish it |
|------|-------------------------------|
| `MAIL_POSTAL_ADDRESS` | Invite email hard-exits (`scripts/send-beta-invite.ts`, `src/emails/renderEmail.ts`) |
| Phone excellence `status: pass` | [EXCELLENCE_RESULT.md](EXCELLENCE_RESULT.md) |
| Android Accept B checkbox | [apps/android/FOUNDER_ACCEPT.md](../apps/android/FOUNDER_ACCEPT.md) |
| ≥10 invites | Public-flip gate |
| VAPID · `CRON_SECRET` · Sentry · Upstash · `SMOKE_BASE_URL` | Return loop / ops stay dark — CONTEXT Status table |
| EIN → unmute Bundle | [FREE_BETA.md](FREE_BETA.md) |
| `PRIVATE_MODE=false` | Founder only |
| Visual baseline bootstrap | Linux CI after Actions billing |
| CodeQL enable / secrets history scan / DMCA counsel | Founder |

### Parked — Horizon W (resume if founder unparks)

| # | Loop | Status |
|---|------|--------|
| W0 | Harvest closed live-walk PRs #451–#461 | `parked` |
| W1 | Phone hero: one next session | queued as **G4** |
| W2 | Logger one-thumb outdoors | queued as **G5** |
| W3 | Coach week earned from logs, on Coach **and** Today | queued as **G6** |
| W4 | Missed-day re-entry, in-app only | queued as **G7** |
| W5 | Form Index Wave D — next unique stills | `parked` |
| W6 | “Win Score” leftover strings | `done` — same as H0-5 `.788` |
| W7 | API INDEX drift | `done` — same as H0-3 `.787` |
| W8 | Guidebook chapter heroes | `done` — same as H0-6 `.268` / `.789` |

---

## Research — verified 2026-08-14

Do not treat this as a second `## Now`. Status → [CONTEXT.md](../CONTEXT.md). These are **code proofs** for the H0 loops.

### H0-1 — `start_url` is not flag-switched (load-bearing)

SW **is** flag-switched. Manifest **is not**.

- [`next.config.js`](../next.config.js): `pwaDisabled` when `privateGateActive` (CJS mirror of [`isPrivateModeEnabledFromEnv`](../src/lib/privateModeFlag.ts)). Preview short-circuit first.
- [`app/manifest.ts`](../app/manifest.ts): `start_url: '/private'` **hardcoded**. `id: '/log'` (stable — do not change).
- [`src/lib/pwaManifest.test.ts`](../src/lib/pwaManifest.test.ts): requires `start_url === '/private'` and **forbids** `/`, `/log`, `/active` **unconditionally**. After `PRIVATE_MODE=false` rebuild, this test would still demand the teaser.
- Pattern already used: [`sites/www/src/lib/appLinks.ts`](../sites/www/src/lib/appLinks.ts) (`INVITE_URL` vs `START_URL`); [`app/sitemap.ts`](../app/sitemap.ts) imports `privateModeFlag` (guard in `privateModeFlag.test.ts`).
- Manifest is **build-time**. Flip day is a rebuild. Gate builds already set `PRIVATE_MODE=false` so SW compiles — start_url must become `/log` in those builds.
- [`docs/archive/PUBLIC_FLIP_CHECKLIST.md`](archive/PUBLIC_FLIP_CHECKLIST.md) does **not** mention `start_url`. Offline spec needs the ungated build ([`tests/e2e/offline.spec.ts`](../tests/e2e/offline.spec.ts)).

**Ungated start_url is `/log` (Today), not `/active`.** `.768` made `/active` gate-public so a first set can happen while gated; the installed home after flip is Today, matching `id`.

**Preview** (`VERCEL_ENV=preview`) is ungated → start_url `/log`. That is correct for phone review.

### H0-2 — `LAUNCH_STRICT` cannot succeed during free-first public flip

**Landed `.781`.** `evaluateCheckEnv` in [`scripts/check-env.mjs`](../scripts/check-env.mjs): `--launch` is Horizon 0 while FREE_BETA is on (Stripe not required; `MAIL_POSTAL_ADDRESS` fails). `--paid` / `LAUNCH_PAID=true` / FREE_BETA off is Horizon 1 (today’s Stripe hard-fails). [`scripts/launch-verify.mjs`](../scripts/launch-verify.mjs) default stays `--launch`; it does not embed `--paid`.

Finding that justified the loop (pre-`.781`): `launchRequired` included `STRIPE_WEBHOOK_SECRET`; missing Checkout **and** Payment Link hard-failed; postal was warning-only; FREE_BETA was a log line, not a skip. Horizon 0 public flip is during FREE_BETA; EIN / unmute pay is Horizon 1. The founder still has to *set* `MAIL_POSTAL_ADDRESS`.

### H0-3 — API inventory drift

`find app/api -name route.ts` = **74** handlers. [docs/security/PROGRAM_STATUS.md](security/PROGRAM_STATUS.md) still says **71** and lists 9 missing from INDEX.

**Missing from [`app/api/INDEX.md`](../app/api/INDEX.md)** (verified by path substring 2026-08-14):

`account/mission-id` · `beta/feedback` · `beta/invites` · `beta/invites/landed` · `beta/invites/redeem` · `cron/day-review` · `health` · `metrics/week-logged` · `mobile/premium/play-purchase`

[`docs/API.md`](API.md) already has `GET /api/health` and `beta/invites` (+ landed/redeem). It does **not** have mission-id, week-logged, beta/feedback, cron/day-review, play-purchase.

Headers on those routes already say “See: app/api/INDEX.md, docs/API.md”. Discover remaining `route.ts` rather than copying this list — a name that claims “all handlers” must fail on an unreviewed file.

### H0-4 / H0-7 — checklists and runbook vs CONTEXT

[CONTEXT.md](../CONTEXT.md) `## Now` wins (`.178`). [LAUNCH_RUNBOOK.md](LAUNCH_RUNBOOK.md) §1 still talks `.104` / “CI billing cleared 2026-07-22”; §2b checks Upstash live; CONTEXT Status table: Actions exhausted, Upstash **unset**. Do not “fix” by copying the Status table into the runbook. Add a pointer: if the runbook disagrees, CONTEXT wins. H0-4 adds the missing `start_url` curl to the flip checklist.

### H0-5 — Win Score leftover copy (`done` · `.788`)

Athlete strings say Mission Score. Keys (`landingFreeWinScore`, `winScoreSeen`) unchanged. Guard: [`src/lib/missionScoreCopy.test.ts`](../src/lib/missionScoreCopy.test.ts).

### H0-6 — chapter heroes (`done` · already `.268` · leftover glyphs `.789`)

Every `public/learn/*.webp` measures 0–1% ink and ≥1% brand red. Guard: [`src/lib/guidebookHeroPalette.test.ts`](../src/lib/guidebookHeroPalette.test.ts). This pass only reminted “Win Score” baked into `getting-started-mw-hero` and `win-score-offline`.

### Also true (not a loop)

- Return-loop **code** shipped ([RETURN_LOOP_PLAN.md](RETURN_LOOP_PLAN.md)); **inert** without VAPID + SW (founder).
- `/bundle` still 307s to `/log` while free-beta ([`src/lib/bundleShop.test.ts`](../src/lib/bundleShop.test.ts)).
- `sites/www` photography 3 vs ~12 wanted — not blocking.

---

## H0-1 — PWA `start_url` flag-switch (`done` · `.780`)

**Concern:** After the founder sets `PRIVATE_MODE=false` and rebuilds, installed PWAs must open Today (`/log`), not the teaser. Today they would still open `/private` because the manifest is hardcoded and the test forbids any other value.

**Do this, then stop:**

1. Extract `pwaStartUrl(env)` next to the existing predicate — `isPrivateModeEnabledFromEnv` from [`src/lib/privateModeFlag.ts`](../src/lib/privateModeFlag.ts). Do **not** copy the Preview short-circuit into a third private function. Gated → `'/private'`. Ungated → `'/log'`.
2. [`app/manifest.ts`](../app/manifest.ts) calls `pwaStartUrl()`. Keep `id: '/log'`.
3. Rewrite [`src/lib/pwaManifest.test.ts`](../src/lib/pwaManifest.test.ts):
   - Source coupling: `app/manifest.ts` imports `pwaStartUrl` and has **no** `start_url: '/private'` literal (same shape as the sitemap guard in `privateModeFlag.test.ts`).
   - Env matrix on the helper: production+unset → `/private`; `PRIVATE_MODE=false` → `/log`; `VERCEL_ENV=preview` → `/log`; explicit `PRIVATE_MODE=true` → `/private`.
   - When gated, start_url is `isPrivateGatePublicPath`. When ungated, start_url is `/log` (not `/active`, not `/`).
4. Falsify: a mutant that hardcodes `start_url: '/private'` in `manifest.ts` must go red. A mutant that returns `/active` when ungated must go red.
5. `Excellence-Override: H0 PWA start_url flag-switch (founder skip-W 2026-08-14)` — `app/manifest.ts` is path class `surface`.
6. Ship protocol: label past master `.779`, LOG + CONTEXT `## Now`, `[skip vercel]`.

**Hard bans:** do not flip `PRIVATE_MODE`. Do not change `id`. Do not point start_url at `/active` (logger stays free; it is not the install home). Do not start H0-2 in this PR.

**Done when:** gated production still cold-starts `/private`; ungated / Preview / gate-build cold-start `/log`; tests kill the hardcoded-teaser mutant.

---

## H0-2 — Launch env profiles (`done` · `.781`)

**Concern:** `LAUNCH_STRICT=true npm run launch-verify` cannot go green on the planned free-first public flip.

**Shipped:** `evaluateCheckEnv` in `scripts/check-env.mjs`. `--launch` = H0 while FREE_BETA on (no Stripe; postal fails). `--launch --paid` / `LAUNCH_PAID=true` / FREE_BETA `false|0|off` = H1 (Stripe webhook + Checkout). `launch-verify` uses `checkEnvNodeArgs` — default has no `--paid`. Tests in `src/lib/checkEnvLaunch.test.ts`. No production env set.

**Hard bans:** do not start H0-3 in this commit. Founder still sets `MAIL_POSTAL_ADDRESS`.

---

## H0-3 — API inventory

**Concern:** 9 live handlers missing from INDEX; PROGRAM_STATUS census is 71 vs 74 files.

**Ship:** rows in `app/api/INDEX.md` **and** the five `docs/API.md` holes (mission-id, week-logged, beta/feedback, cron/day-review, play-purchase). Update PROGRAM_STATUS count by discovering `route.ts`. Guard: a test that globs `app/api/**/route.ts` and fails if INDEX has no substring for that path — so the next handler cannot go missing silently. No handler behavior change. Mark parked W7 done.

---

## H0-4 — Flip checklist `start_url`

**Concern:** The agent-prepared flip one-pager never asks what the baked manifest’s `start_url` is.

**Ship:** one curl + expected value in [PUBLIC_FLIP_CHECKLIST.md](archive/PUBLIC_FLIP_CHECKLIST.md) (gated: `/private`; post-flip rebuild: `/log`) and a pointer from [LAUNCH_RUNBOOK.md](LAUNCH_RUNBOOK.md) §5. Do not restate CONTEXT Status. Depends on H0-1 having landed (or land the curl as “after H0-1”).

---

## H0-5 — Mission Score leftover copy (`done` · `.788`)

**Shipped:** i18n values + packs + `export-locales`, guidebook/leaderboard/welcome leftovers, `missionScoreCopy.test.ts`. Keys and `winScoreSeen` unchanged. W6 marked done.

---

## H0-6 — Guidebook chapter heroes (`done` · `.789`)

**Already true:** `.268` paper/ink/one-red + `check-guidebook-heroes.mjs`. All 19 `public/learn/*.webp` measure 0–1% ink. **This pass:** leftover “Win Score” glyphs in two figures. W8 marked done.

---

## H0-7 — Runbook / scorecard vs CONTEXT (`done` · docs)

**Shipped:** pointer at LAUNCH_RUNBOOK §1 and PRODUCTION_STACK scorecard. Upstash-live unchecked (CONTEXT: unset). Status table not copied.

---

## Copy-paste prompt (next graph agent)

```text
You are the next Mission Winning graph-loop agent. Unattended. Local machine.

BOOT (every spawn):
1. CONTEXT.md → AGENTS.md → INDEX.md → ORCHESTRATION.md → docs/GRAPH_LOOP.md
2. Do not use chat, ~/.grok/sessions, or .hermes/plans as product truth.

QUEUE:
3. Run `npm run graph`. It names the live ticket, the route and the recipe by
   reading this file — status from the parsed Status cell, not from the row text.
   Take the route it names. If you disagree with it, fix the queue or the router in
   its own PR; do not route around it. (Recipe 14.)
4. Route `gauntlet` (GNT-*): stop using this prompt as a builder brief.
   Read docs/GAUNTLET_LOOP.md + the campaign workbench. Follow recipe 12.
   Do the workbench **Next spawn** line (role · unit · round). One unit-round, then exit.
   Do not mark the GRAPH_LOOP campaign row `done` until the campaign report is written.
5. Route `build`: investigate on current master. If the defect is already gone, mark done (already true) with proof paths and stop this spawn.
5b. Route `harvest` (no agent-open row): follow recipe 13 and docs/IDEA_LOOP.md.
   It emits ONE row, prefixed `IL-`, and you paste it. Do not mint the next letter
   section instead — `MAX_SINGLE_ROW_RUN` is red-on-breach, not advice.

SHIP (ordinary loops, and gauntlet BUILDER rounds only):
6. One concern. One PR. Branch from master. [skip vercel] unless the founder asked for Preview.
7. Touch src|app|scripts|supabase → bump APP_BUILD_LABEL past origin/master, LOG.md + CONTEXT.md ## Now in the same commit. Surface paths need Excellence-Override: <reason> while EXCELLENCE_RESULT status is unscored. Gauntlet builders use: Excellence-Override: gauntlet GNT-<n>.U<u> round <r>
8. Run the loop’s tests (at least the colocated npm test files). Do not leave “Grok will test it.”
9. Ordinary loop: after merge, set that loop done in GRAPH_LOOP.md (Outcome = PR + label). Leave the next loop open. Do not start that next loop in this PR.
   Campaign row: leave `open`. Update the workbench only.

BANS:
- Free logger (/active) never gated
- Do not flip PRIVATE_MODE
- Do not write excellence status: pass
- Do not invent traction
- No America / wearables-as-score / iOS
- No chat on Today
- Do not raise TAP_BUDGET
- Do not restore CinematicWww as /
- Do not commit .hermes/, ops/, or .env.local
- Do not implement a whole GNT-* campaign in one PR

STOP THE GRAPH if two loops ship without moving a queued G-item, if you are about to write another plan, or if the loop needs a founder secret — mark founder, take the next agent-open row.

When this spawn finishes, print: loop id · role (if gauntlet) · PR + label or critic verdict (or already-true proof) · next spawn. Then exit.
```

---

## Decade map (so the graph has somewhere to go)

Unchanged constitution; gates in ORCHESTRATION. Orientation, not a build ticket.

| Stage | Product | Unlock |
|-------|---------|--------|
| **Year 1 — earn the wedge** | Free offline logger + Mission Coach from logs. Web PWA + Android. Guidebook as SEO. | Excellence pass → ≥10 beta → public → week-4 |
| **Years 2–3 — deepen pillars** | Fuel/Move/Mind/Track/Learn premium depth. iOS. Locale bodies. Wearables as inputs. | Week-4 holds on two cohorts |
| **Years 4+ — platform** | B2B/schools/teams, human coaching ops, Foundation scholarships. Free core still free. | Retention + revenue, legal, founder |

Pitch stays **Train + Mission Coach**. Never “everything app.”

---

## Related

- Horizons / forbidden: [ORCHESTRATION.md](../ORCHESTRATION.md)  
- Phone sign-off: [docs/EXCELLENCE_RESULT.md](EXCELLENCE_RESULT.md)  
- Launch (founder): [docs/LAUNCH_RUNBOOK.md](LAUNCH_RUNBOOK.md)  
- Public flip smoke: [docs/archive/PUBLIC_FLIP_CHECKLIST.md](archive/PUBLIC_FLIP_CHECKLIST.md)  
- Form media: [docs/MEDIA_SYSTEM.md](MEDIA_SYSTEM.md) · `src/lib/formMedia.ts`  
- Return channel: [docs/RETURN_LOOP_PLAN.md](RETURN_LOOP_PLAN.md)  
- Agent playbooks: [docs/AGENT_RECIPES.md](AGENT_RECIPES.md) recipes 11–12
- Grading protocol: [docs/GAUNTLET_LOOP.md](GAUNTLET_LOOP.md) · campaigns [docs/gauntlet/INDEX.md](gauntlet/INDEX.md)
