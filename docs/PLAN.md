# Mission Winning — Build Plan

Living roadmap for the **everything app** (Freeletics Super Bundle → one PWA). Filter every task through [vision.md](../vision.md).

**Vision comparison:** [VISION_STATUS.md](VISION_STATUS.md) — pillar scorecard, gaps, priorities.

---

## Frozen plan — `.719` logger supersets (2026-08-13)

> **Frozen.** Implement only this section. Plan commit is `[skip vercel]`.
> Label: `2026.07-unified.719` (occupied `.698`–`.718` — do not steal).
> Draft PR, one Preview max. Excellence-Override: logger supersets.
> Offline, no account. Set-log table stays first paint. No social. No XP.
> Speech never owns this.

### Investigate (done — do not invent a second group id)

Existing grouping already lives on the free logger:

| Layer | What exists |
|-------|-------------|
| Type | `ActiveExerciseLog.supersetGroup?: string` |
| Lib | `src/lib/workout/superset.ts` — `getSupersetPeers`, `supersetLabel` (`SS A`/`SS B`), `advanceAfterLog` (peer at same set index), `shouldRestAfterLog` (skip rest mid-round) |
| Store | `toggleSupersetWithNext` / `unlinkSuperset`; `logSetAndAdvance` already calls `advanceAfterLog`; `partialize` already persists `activeWorkout` |
| Rest | `planLogSetRest` in `activeSessionFinish.ts` already gates on `shouldRestAfterLog` — **do not edit** `restTimer.ts` or that finish helper |
| UI | Overflow “Superset w/ next” / “Unlink”; card badge `SS A`; poster-red left edge on the card |

Hevy/Strong gap: athletes expect **A1/A2 pair marks**, **exactly two consecutive** exercises, **A then B then rest**, and **the set row stays** (one table — not a second Hevy-style card stack). Current `SS A` is the wrong mark; `toggle` can merge into 3+ giant sets; `unlink` clears only one exercise (orphan peer); no persist / log-order store tests; the set table itself does not show the pair.

### Ship (only this)

1. **Reuse `supersetGroup`.** Add pure helpers in `superset.ts` (no second id):
   - `pairMark(exercises, exIdx)` → `A1`/`A2`/`B1`… — groups ordered by first index; slot 1 = earlier exercise, slot 2 = later. Replace `supersetLabel` output (keep the export as an alias of `pairMark` so existing callers stay).
   - `pairWithNext(exercises, exIdx)` — pair **exactly two consecutive**. New shared id on those two only; any prior partner of either is cleared (no giant sets).
   - `unpair(exercises, exIdx)` — clear `supersetGroup` on **all peers** of that group.
2. **Store wiring only** (`workoutStore.ts`): `toggleSupersetWithNext` / `unlinkSuperset` call the pure helpers. `removeExerciseFromActive` unpairs the remaining peer so a delete cannot leave an orphan. Do not change `logSet` / `logSetAndAdvance` / rest timer / repeat-last / notes.
3. **Table first paint.** Keep `SetLogTable` / `SetLogRow` as the set list. Surface the pair mark on the existing Set cell (`A1`/`A2` prefix + set number) and the existing header badge. `data-pair-mark` on the card/table for tests. Paper, ink, one red, Archivo, radius 0 — no new card chrome, no Hevy card clone, no second table.
4. **Log order** stays A → B → rest via existing `advanceAfterLog` + `shouldRestAfterLog`. Lock it with tests; do not re-implement rest.
5. **Persist** is the active session on device (`partialize.activeWorkout`). Pair survives JSON round-trip / store write. Do not add template/builder pairing, completed-log pairing, cloud schema, or account gates.
6. **Speech never owns this.** Keep the overflow menuitem. Do not add voice / Ask / coach-chat ownership of pair/unpair.

### Tests

- `superset.test.ts`: pair persist (JSON round-trip keeps `supersetGroup`); `pairWithNext` is exactly two and does not merge giant sets; `unpair` clears both peers; `pairMark` is `A1`/`A2`; log order A then B; rest after B only.
- `workoutStore.test.ts`: toggle writes a shared group; unlink clears both; `logSetAndAdvance` after pairing returns the peer at the same set index.
- `check-build-label` `.719`. LOG + CONTEXT in the same implement commit.

### Docs / ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.719`
- LOG heading `## 2026-08-13 — Supersets on the set log (\`.719\`)` + rotate oldest live entry
- CONTEXT `## Now` one `.719` bullet; keep Status table; ≤25 bullets
- Help: one line on first-workout set log (pair two consecutive, A then B then rest)
- `src/lib/workout/INDEX.md` if the helper list changes

### Hard bans

- No `PRIVATE_MODE` / `FREE_BETA` / EIN / secrets
- Do not steal `.698` #477 or `.699` #478
- Do not edit rest timer, repeat-last, notes, vs-pages, field test, plate math, #506
- No social. No XP. No speech ownership.

---

## Design north stars (UI + product)

| Source | What we borrow |
|--------|----------------|
| **Bevel** | Dark premium UI, metric-first dashboard (Readiness / Strain / Recovery) |
| **Freeletics** | Freemium core, Coach, Super Bundle, streaks, challenges, pillar structure |
| **CrossFit app** | WOD logging, timers, daily workout rotation, benchmark culture |
| **Muscle & Fitness / Bodybuilding.com** | Exercise library depth, filters, programs, education tone |

Mission Winning is **none of these** — one unified super app, free core forever, global PWA.

---

## Freeze — Repeat last session from the log (`.717`) — 2026-08-13

> **Frozen.** Implement only this block. Do not expand. Label `2026.07-unified.717`
> (occupied `.698`–`.716`). Draft PR. One Preview max. `[skip vercel]` on the
> plan commit only.

Strong/Hevy migrants live on **repeat last session**. History already has
“Train this again” (`templateFromCompletedLog`). Today and Train empty Start
do not: Active empty seeds Just Go; Today primary builds Just Go / Coach.
This ship is **one control** that copies the last completed session into the
free logger — not a template marketplace.

### Already in the tree (deepen; do not fork)

| Primitive | Role | Do not |
|-----------|------|--------|
| `src/lib/workout/historyRetrain.ts` `templateFromCompletedLog` | Maps a finished log → startWorkout template (names, set counts, last loads/reps as **uncompleted** targets) | Rewrite the mapper |
| History `retrainFromLog` / `historyTrainAgain` | Same primitive for a *picked* log | Add a session picker on Today/Train |
| `getLastPerformanceForSet` / `resolveSetInput` lastPerformance + session carry | F-013 / #489 dial prefills (Prev column + next-set carry) | Rewrite `resolveSetInput` or #489 |
| `resolveRepeatLastTarget` / `activeRepeatLast` | Mid-session **repeat last set** | Reuse that key or label for this session control |
| `startWorkout` | Builds uncompleted sets from the template; rest stays off | Call `startRestTimer` on start |

### Behavior (one primary)

**Last repeatable session** = newest `workoutHistory` entry (array is newest-first) where `templateFromCompletedLog` returns non-null (skips `deletedAt`, empty exercises, no `exerciseId`). Pure helper `repeatLastSessionTemplate(history)` in `src/lib/workout/repeatLastSession.ts` — wraps the existing mapper, does not copy its loop.

1. **Resume** an in-progress session still wins (unchanged).
2. **Train empty (`/active`):** if a last session exists → `startWorkout(template)` (not `prescribed`). Else → `startEmptyWorkout()` (existing empty logger). **Stop seeding Just Go / Coach from Active empty.** Train is the logger; Coach stays on `/coach` and on Today when a live plan exists.
3. **Today (`/log`) one primary, in order:** resume → **live Coach session** (existing honesty: Start names the plan; do not steal this) → **repeat last session** → existing Just Go / journey seed / href. Repeat-last does **not** apply re-entry `doseScale` (copy last as-is). Do not auto-start Coach on the repeat-last branch.
4. **Prefills:** template targets are last loads/reps. Compose with existing `getLastPerformanceForSet` / `resolveSetInput` (manual > session carry > last performance > template default). Do not auto-progress via `suggestNextSetTarget` at start.
5. **Empty history:** existing empty logger. Shame-free — no missed / skipped / streak-loss / “get back” copy. Button stays **Start workout**.
6. **Copy when last exists:** **Repeat last session** (new keys). Description: same exercises and last loads, log when ready. Do not reuse `activeRepeatLast` (“Repeat last set”).
7. **Hard no:** auto-start rest; auto-start Coach on this control; social share; speech/voice owning the flow; second button / template list; gating the free logger; account/network required (local `workoutHistory` only). Set-log table remains first paint when exercises are copied.

### Files (expected)

- `src/lib/workout/repeatLastSession.ts` + colocated test
- Slim `resolveActiveEmptyStart` to last-session or empty (drop Just Go/coach/dose from this path)
- `ActiveWorkoutPage` empty start + `ActiveEmptyState` label
- `runTodayPrimaryAction` + `justGoHeroMeta` source `repeat_last` (hero and tap must agree)
- i18n: `activeRepeatLastSession` / `todayRepeatLastCta` (+ title/desc/kicker) in `activeWorkoutLocales` + `todayLocales`; `npm run i18n:fill` if packs require
- Help: one sentence in `docs/help/getting-started.md`
- INDEX: `src/lib/workout/INDEX.md` (+ Active empty row if props change)
- Analytics: reuse `history_train_again` with `from: 'today' | 'active_empty'`
- Ship protocol: `APP_BUILD_LABEL` `.717`, LOG (rotate oldest to stay ≤15), CONTEXT `## Now`, trailer `Excellence-Override: repeat last session`

### Tests

- Last-session copy: exercises, name, last loads/reps as uncompleted targets; newest-first; skip tombstone/empty
- Empty-history path: helper null; Active empty still `startEmptyWorkout`; no guilt phrases in empty copy
- Wiring: Active empty + Today primary call the helper; Active empty no longer `buildJustGoSession`
- No rest on start (source scan: empty-start path does not call `startRestTimer`)
- Copied session is not `prescribed`
- `resolveSetInput` order untouched (do not edit that function)
- `node scripts/check-build-label.mjs` for `.717`

### Out of scope (hard bans)

`PRIVATE_MODE` / `FREE_BETA` / Top 8 / EIN / field test / plate math / Super Bundle shop / public GitHub #506 / Learn vs-pages / stealing `.698`–`.716` / rewriting #489 / Builder marketplace / speech.

---

## Phase status

| Phase | Focus | Status |
|-------|-------|--------|
| **A** | Free core alignment (nutrition, streaks, challenges, today's workout, leads) | ✅ Done — [LOG.md](../LOG.md) |
| **B** | Six working pillar free tiers (Move, Mind, Learn, Track) | ✅ Done |
| **C** | Super Bundle synergy + Supabase hardening | ✅ Done |
| **D** | Content scale (200+ exercises, Learn paths) | ✅ Done |
| **F** | Simple UI + Mission Journey (I-Day → Commissioned) | ✅ Done — [JOURNEY.md](JOURNEY.md) |
| **G** | PFT / America track (school, teacher, youth, leaderboard) | ✅ Done — build `.45` |
| **H** | Public launch + PWA + security P0 | ⬜ **Blocked** — founder ops → [LAUNCH_RUNBOOK.md](LAUNCH_RUNBOOK.md) |
| **I** | Premium depth + AI Coach + live payments | 🟡 Partial — engines + Mind/Move/Learn/I5 + de body; live Stripe next |

> **Naming:** Journey “Phase 0–3” (JOURNEY.md) ≠ build phases here ≠ PFT sub-phases G1–G8.

---

## Phase G — PFT / America track (G1–G8) ✅

Optional US national-fitness side track (`NEXT_PUBLIC_AMERICA_TRACK_ENABLED`). Does not replace global mission.

| Sub | Deliverable | PR / build |
|-----|-------------|------------|
| **G1** | Presidential Fitness Test scoring, `/fitness-test`, `/america` | #52 |
| **G2** | School class codes, youth gate, PFT cloud sync | #53 |
| **G3** | Teacher dashboard, Week 1 printable, class API | #54 |
| **G4** | PFT leaderboard board, teacher PIN, verified youth consent | #55 |
| **G5** | Youth consent server sync, class leaderboard scope | #56 |
| **G6** | Teacher creator auth, print/CSV export, council hero tiers | #57 |
| **G7** | Hashed teacher PINs, council i18n (es/fr/ja/de/zh) | #58 |
| **G8** | HTML class report export, PFT gate-smoke, council env hints | #59 |

**Ops before prod:** Run Supabase migrations (`fitness_test_school`, `pft_leaderboard_teacher_pin`, `youth_consent_records`); set `RESEND_API_KEY`, `YOUTH_CONSENT_SECRET`; legal OK before `NEXT_PUBLIC_SHOW_MAHA_COPY=true`.

**Done when:** `/america` + `/fitness-test` pass gate smoke; teacher export works; build label on Profile matches deploy.

---

## Phase H — Launch & global accessibility ⬜

*Formerly “Phase E” in older docs.* See [PRE_LAUNCH_PLAN.md](archive/PRE_LAUNCH_PLAN.md) + [PROTECTION.md](PROTECTION.md).

> **2026-07-02 — Launch package shipped (code side of Phase H):** security hardening migration
> (`20260702_security_hardening.sql` — teacher PIN column privileges, authenticated-only leaderboard
> reads), consent-notify rate limit, PWA manifest (`app/manifest.ts` — was 404), `.env.local.save`
> untracked, leaderboard bots relabeled as honest "Pacers" (+ kill switch), America/PFT track now
> **opt-in** (`NEXT_PUBLIC_AMERICA_TRACK_ENABLED=true` to enable), premium redesign of Landing /
> Bundle / private gate / Welcome / Coaching (display type system, no hype copy, no fake
> testimonials), UnlockButton → real Stripe checkout when links configured / honest founders
> waitlist otherwise. **Remaining Phase H work is founder ops → [LAUNCH_RUNBOOK.md](LAUNCH_RUNBOOK.md).**
> Strategy + risk docs: [STRATEGY.md](STRATEGY.md) · [REDTEAM.md](REDTEAM.md).
>
> **2026-07-03 — Pre-launch v2 shipped:** real PWA icons (placeholders were broken 87-byte files),
> working backup export/import (`src/lib/backup.ts`), error boundaries, offline-for-real (the SW
> now actually registers under App Router — next-pwa@5 never registered it — plus `/offline`
> fallback; verified by Playwright with the network disabled), decluttered new-user Today, logger
> upgrades (tap-to-type entry, per-set previous values, swap/remove exercise, persistent notes,
> honest sync-failure toast), PostHog funnel analytics (env-gated), and Resend email nudges
> (streak-at-risk / comeback / week-1 recap; opt-in + one-tap unsubscribe; daily Vercel cron).
> New founder env steps: run `20260703_reminders_optin.sql`, set `CRON_SECRET`, optionally
> `NEXT_PUBLIC_POSTHOG_KEY`. Next build phase: **AI Coach v1** (Track D) once beta activation ≥40%.

### Product gates (F4 / JOURNEY)

| Gate | Target |
|------|--------|
| Beta cohort | ≥10 real users |
| I-Day completion | ≥80% |
| Basic Training (first workout) | see [ORCHESTRATION.md](../ORCHESTRATION.md) Horizon 0 task 5 |
| Commissioned in 14 days | ≥25% stretch |

**Do not set `PRIVATE_MODE=false` until the Basic Training gate in [ORCHESTRATION.md](../ORCHESTRATION.md) Horizon 0 task 5 is met.** That row is the single home for the number — `.606` found this gate stated three different ways in three files.

### Security & infra gates

| Task | Status |
|------|--------|
| Rotate `PRIVATE_ACCESS_SECRET` | ⬜ Vercel / GitHub Secrets |
| `DEMO_PREMIUM=false` in production | ⬜ |
| Supabase service role + migrations | ⬜ |
| GitHub → Vercel env sync workflow | ✅ #51 — run manually |
| Gate + PFT smoke (`npm run gate-smoke`) | ✅ script shipped |
| Privacy + Terms | ✅ |
| Enable PWA (`PRIVATE_MODE=false`) | ⬜ |

### www first paint floor (frozen scope, `.765`)

Measured on live `www.missionwinning.com` 2026-08-13 (the Preview link is behind
Vercel SSO, so the gated production HTML was the artifact read). `PRIVATE_MODE`
is on, so `/` → `/private` for every visitor: **the gate *is* the website.** Its
whole server-rendered body was the three words `Checking sign-in…`, and
`/welcome` — the other public entry — server-rendered no visible text at all.
Frozen scope, seven items, no route or IA changes:

| # | Defect on the gated path | Floor this establishes |
|---|--------------------------|------------------------|
| 1 | `/private` HTML = `Checking sign-in…` — the poster waited on a 6 s session probe | The gate poster is in the first byte; the probe never replaces it |
| 2 | `/welcome` HTML = an `aria-hidden` skeleton (`useSearchParams` bailed the page to its Suspense fallback at prerender) | I-Day step 1 is server-rendered text |
| 3 | Chrome badge read `Open beta` while the doors need an access code (the landing already says *invite-only*) | Chrome states the gate it is actually behind |
| 4 | The gate waitlist took an email from every territory, including the hard-blocked ones | No capture we cannot serve — [supportedRegions.ts](../src/lib/legal/supportedRegions.ts) decides |
| 5 | The language picker listed fr/de/it/ar/id with no word on service territory | Language is not availability; `/regions` is one tap away |
| 6 | The consent banner is `fixed bottom-0 z-[60]` over a `z-50` nav — it lands on the logger's own controls the day `NEXT_PUBLIC_POSTHOG_KEY` is set | Hard rule 2: nothing chrome-level covers the free logger |
| 7 | `t('guidebookTitle')` / `t('bundleUnlockCta')` carry no `defaultValue` and are absent from `BOOTSTRAP_EN`, so first paint printed the key | No camelCase key can reach a screen |

Out of scope, deliberately: no `PRIVATE_MODE` flip, no locale added or removed
(a language is not a territory), no landing redesign, no traction claims.

### East Asia shard P0s (frozen scope, `.766`)

Second frozen scope, from the East Asia survey shard (mission-ops #13). Taken
without waiting for the other shards, as instructed.

| # | Finding | Fix, and its floor |
|---|---------|--------------------|
| 1 | **Coach-from-logs clarity 2.56/5 — the lowest item**, from an AI-skeptical / Alpha-curious cohort: *"coach output has no log-derived labels"*. Every Coach surface made a *provenance claim* ("built from your logs", "AI weekly plan") and none showed evidence | [logCitation.ts](../src/lib/coach/logCitation.ts) quotes the device's own last loaded set, or says `no-logs`. Any `t('coach…')` claim matching *from your logs* must sit beside a rendered `<CoachLogCite />` |
| 2 | **CN/HK believe the offline claim (3.97) and not the implementation** — "forced cloud sync / data opacity" | Both public entries name the mechanism from one source (`LOCAL_FIRST_COPY.gateLocalFirst` / `.welcomeLocalFirst`): no account, written to this device, nothing uploaded unless you sign in |
| 3 | **Strong/Hevy migrants: logging speed *and* CSV data-in are separate P1s** | The importer existed and was unreachable. I-Day and the empty logger link `/account#import`; the fragment opens the `<details>` it targets. Speed is not touched here — `.694` owns it |

### Shard 3 P0s (frozen scope, `.767`)

IL/IN/SEA (ops #14) confirms the same three findings across two more regions, so
the scope is *depth on the same three*, not a fourth theme.

| # | Finding | Fix, and its floor |
|---|---------|--------------------|
| 1 | Too many taps to log a set — **new to scope**; `.766` deliberately left speed to master | Measured at 390×844: the returning path ran Start → full-viewport check-in sheet → Log set, now **2 interactions**. `sessionCheckInOffer.ts` extends its own first-mission rule to every session; the sheet records only rows the athlete moved |
| 2 | Coach not visibly grounded in logs (repeat) | `CoachInsightCard` carries the `.766` citation; the guard's claim pattern widened to the derived phrasing ("from your recent training load") it could not see |
| 3 | Offline-logging disbelief (repeat) | The **landing hero** — where these regions arrive by SEO — states the mechanism from the same constant as the gate and I-Day |

Deferred with a reason, not dropped: the cold path's 2 I-Day taps. Halving it
needs a profile-less `completeIDay()`, because the current one writes
experience/equipment/goal — recording answers nobody gave is what `.767` just
removed from the check-in sheet.

Out of scope for this shard: `navCoach` stays "AI weekly plan" — `primaryNav.ts`
records that screen name as a kept decision, and overturning it on one shard is
a founder call. It is the last generic-AI string on first paint.

### Hero flow QA (mobile)

1. `/welcome` I-Day (≤3 min)
2. Today → Start first workout
3. Complete workout → Win Score updates
4. Sign in → cloud sync on Profile
5. Language switch → nav labels change

**Done when:** Public URL, installable PWA, premium API 403 without enrollment, beta gates pass.

---

## Phase I — Premium parity & synergy 🟡

Aligns revenue with [vision.md](../vision.md) without gating free core.

| Sub | Deliverable | Status | Vision link |
|-----|-------------|--------|-------------|
| **I1** | Live Stripe bundle + verified webhook → `enrollments` | 🟡 Code ready — founder wires live links ([docs/STRIPE_PREMIUM_SETUP.md](STRIPE_PREMIUM_SETUP.md)) | Super Bundle revenue engine |
| **I2** | AI Coach v1 — plan generator, premium-gated Train Coach | ✅ Engine + taster + regen; polish remaining | “Personal trainer in pocket” |
| **I2b** | Fuel Coach — adaptive meal plans synced to macros / training | ✅ Premium-gated (`src/lib/fuelCoach/`) | Fuel depth |
| **I3** | Track GPS premium MVP — live recording, pace chart, weekly stats | ✅ Shipped | Track |
| **I3b** | Mind / Move premium depth beyond unlock cards | ✅ 17 Mind + 11 Move premium sessions | Bundle proof |
| **I3c** | Learn premium specialist chapters | ✅ 4 courses / 16 sections + course fix | Bundle proof |
| **I4** | i18n G2 — Today/Fuel/Active/Welcome body for Tier 1 + AR RTL | 🟡 es + **fr** shipped; **de** next (one locale at a time) | Global equity |
| **I5** | Cross-pillar recommendation depth (coach → multi-pillar CTAs) | ✅ Victory/guided/course CTAs + Learn in single insight | 1+1+1 > sum |

**Done when:** Paying users get differentiated premium; free core unchanged; bundle LTV measurable.

---

## Phase A–D + F (archive summary)

<details>
<summary>Phases A–D, F — completed (click to expand)</summary>

### Phase A — Free core ✅
Nutrition un-gated, challenges, Today's Workout, exercise library, leads API.

### Phase B — Pillar free tiers ✅
Move, Mind, Learn, Track usable free experiences.

### Phase C — Bundle & backend ✅
Win Score weighting, bundle page, Supabase schema, cloud merge.

### Phase D — Content ✅
200+ exercises, program tags, 8 Learn paths.

### Phase F — Journey & unified UI ✅
I-Day → Commissioned, 5-tab nav, More for everyone, beta metrics, legal pages. See [UX_UNIFIED_PLAN.md](archive/UX_UNIFIED_PLAN.md).

</details>

---

## Recommended work order (now)

**Long-term sequencing (horizons 0–3, role split, kill criteria):** [ORCHESTRATION.md](../ORCHESTRATION.md) — read this before starting a multi-week initiative.

**Agent H1 eng prep:** complete. **Growth Wave 2–3:** leads/email/SEO + `npm run growth-smoke` + [docs/archive/LAUNCH_READY.md](archive/LAUNCH_READY.md). Flip checklist: [docs/archive/PUBLIC_FLIP_CHECKLIST.md](archive/PUBLIC_FLIP_CHECKLIST.md).

1. **Horizon 0 — Phase H founder ops** — migration + Vercel secrets + Stripe + recruit beta ([LAUNCH_RUNBOOK.md](LAUNCH_RUNBOOK.md), [docs/archive/LAUNCH_READY.md](archive/LAUNCH_READY.md)) — **current bottleneck**
2. **Hit beta gates** — 10+ users, I-Day ≥80%, BT ≥60% — then `PRIVATE_MODE=false` ([docs/archive/SOFT_LAUNCH_DAY.md](archive/SOFT_LAUNCH_DAY.md), [docs/archive/PUBLIC_FLIP_CHECKLIST.md](archive/PUBLIC_FLIP_CHECKLIST.md))
3. **Horizon 1 — Phase I1** — live Stripe + webhook verify ([docs/STRIPE_PREMIUM_SETUP.md](STRIPE_PREMIUM_SETUP.md)); offline/SW/Search Console smoke
4. ~~Lighthouse + Serwist + growth smoke~~ — **shipped** ([docs/LIGHTHOUSE_BASELINE.md](LIGHTHOUSE_BASELINE.md); `npm run growth-smoke`)
5. **Horizon 2 — week-4 retention** — measure before new features ([docs/POST_LAUNCH_CADENCE.md](POST_LAUNCH_CADENCE.md), funnel in [docs/SEO_ANALYTICS.md](SEO_ANALYTICS.md))
6. **Horizon 3 — i18n / SEO / TWA** — only after PMF (es/fr/de body already partial)
7. **Agent idle only** — Profile/Nutrition extract, landing i18n Batch C — not launch-blocking

---

## Git workflow (Mac + GitHub + Vercel)

```
GitHub (source of truth)
   ↑ push / merge
Cursor / Cloud Agent (implements)
   ↓ git pull
Your Mac (local dev: npm run dev)
   ↓ auto-deploy when Vercel connected
www.missionwinning.com
```

```bash
cd ~/missionwinning
git pull origin master
npm install
npm run dev
```

---

Last updated: 2026-07-14 (ORCHESTRATION.md horizons; S-Tier build `2026.07-unified.58`)

---

## S-Tier improvement track (2026-07-14) — closed into ORCHESTRATION

| Wave | Status | Notes |
|------|--------|-------|
| **0** Focus + pricing | ✅ | `bundleConfig` monthly/$11.99 · 12mo/$59 · lifetime/$149; Basic nav train-only |
| **1** First hour | ✅ | Welcome real Just Go preview; landing single primary CTA; journey empty copy |
| **2** Daily polish | ✅ | ErrorState/Skeleton, MobileNav `aria-current`, Escape menu, token pass |
| **3** Perf + page splits | ✅ | Fuel sections + BuilderArrange + ProfileBackup; further ActiveWorkout later |
| **4** Coach + money honesty | ✅ | Victory one next action; week recap; coach invite; Bundle inventory |
| **5** Launch ops | ⬜ | → Horizon 0 in [ORCHESTRATION.md](../ORCHESTRATION.md) |
