# Mission Winning — Build Plan

Living roadmap for the **everything app** (a bodyweight coach app Super Bundle → one PWA). Filter every task through [vision.md](../vision.md).

**Vision comparison:** [VISION_STATUS.md](VISION_STATUS.md) — pillar scorecard, gaps, priorities.

---

## Frozen plan — `.946` F-013 smart defaults on the free logger (2026-08-24)

> **Frozen.** Implement only this section. Plan commit is `[skip vercel]`.
> Label: `2026.07-unified.946` — next free after master `.945` (missed-day).
> Master already has `.945` missed-day — do not smash it.
> Ready for squash. Preview will not deploy. No `PRIVATE_MODE` flip.
> Offline. No account. **Log a set.** Never invent a number.
> Do not remount TARGET-above-PREVIOUS. Do not restyle Today.
> Do not steal the Victory sheet. Keep master's brand: **Log a set. Offline.**

When starting a set, the next row already holds their last
same-exercise working set (weight/reps). Skippable. Editable.
Never blocks Log a set. Empty history is an empty row — no
fake 10, no wearable, no program bump.

### Investigate (done — hypothesis is half-right)

F-013 / #489 is the **dial prefill**, not a new Prev column.
last-set ghost is the one-tap **Last** copy of the same number.
The gap is empty-history honesty **and** warmup leaking into
the dial via set-index last-actuals.

| Layer | What exists | Finding |
|-------|-------------|---------|
| Dial (`resolveSetInput` / `resolveActiveSetDial`) | manual → prescribed → session carry (skips W) → lastPerformance → **suggestion (program bump)** → template default (`10` / `0`) | Prefill already exists. Empty history still invents `10`. A test named *"empty history does not invent a number"* asserts `10 × 0`. Suggestion still sits in the chain for freestyle with no stored set |
| lastPerformance | `getLastPerformanceForSet` — matching **set index** from last live session | Last session set 0 can be a warmup. Dial then starts at the ramp, not the last working set. Ghost already refuses that |
| last-set ghost (`.759`) | `resolveLastSetGhost` — last **working** set, not W, not 0-rep, not tombstone. One-tap Last. Hidden when the dial already matches | Reuse these numbers for the dial. Do not add a second Last / Prev |
| vs-last (`.760`) | After-save `+2.5 kg` / `+1 rep` / `same` on the completed row | Different lane. Leave it |
| Next-set cite (`.939`) | After-complete skippable next-from-logs (`suggestNextSetTarget` + cite). Not a last-actuals ghost | Different lane. Cite may bump; the **dial** must not. Leave cite |
| e1RM (`.761`) | Educational Epley readout after a working set | Must not feed the dial. Leave it |
| Prev column | `formatPrevSetLabels` / `getLastPerformanceForSet` — last-actuals beside the row | Official help. Do not remount Hevy PREVIOUS / `SetLogAdjacencyStack` |
| Victory (`.944`) | Same-shape vs-last receipt after Finish | Leave it |
| Missed-day (`.945`) | Today/Coach skippable prompt | On master. Do not smash |

Not these (do not “fix”):

- Today / HomePage / pin grid / Start
- Victory sheet / `.944` receipt
- Next-set cite surface, vs-last token, e1RM line
- `SetLogAdjacencyStack` / TARGET-above-PREVIOUS (stays unmounted)
- Wearable / program bump / `suggestNextSetTarget` as the starting dial
- Missed-day `.945`

### Ship (only this)

1. **One last-working reader for the dial.** Reuse `resolveLastSetGhost`
   (last working set, warmup / 0-rep / tombstone already excluded).
   `getSetInput` / `resolveActiveSetDial` pass `{ reps, weight }` from
   that ghost as `lastPerformance`. Do not fork a second last-session
   loop. Leave `getLastPerformanceForSet` for the Prev column.

2. **Empty history is empty.** Freestyle with no session carry and no
   last working set returns `{ reps: 0, weight: 0 }` — not template
   `10`, not `suggestNextSetTarget`. `resolveSetInput` keeps `suggestion`
   as a param so callers do not break; the dial must not apply it.
   Prescribed still echoes the plan. Manual still wins. Session carry
   still copies today's last working set onto the next row.

3. **Warmup stays on the ramp.** A live warmup row still uses the set's
   own numbers (`resolveActiveSetDial` already does this). A warmup-only
   history is first-ever: empty dial, no ghost.

4. **Skippable / editable / never blocks.** Athlete can edit the prefill
   (manual wins). Last tap stays for when the dial diverges. Log set
   stays the sole poster-red primary. Do not add a second Prev, a new
   Skip on the prefill, or a Use/Apply for this ship (cite + Use next
   already cover next-from-logs).

5. **Free forever.** No account. Offline. Same-device logs. No wearable.
   No e1RM in the resolver.

### Tests

- Empty history (and warmup-only history) → dial `{ reps: 0, weight: 0 }`.
  Mutant restoring template `10` or `suggestNextSetTarget` as the empty
  prefill dies. The old H-05 case that asserted `10 × 0` is the defect.
- One prior working set → dial prefills those load/reps; a manual edit
  still wins. Session carry still beats last week on set 2.
- Cite / ghost / Prev are not remounted as a second Prev:
  `SetLogTable` still does not import `SetLogAdjacencyStack`; Last tap
  stays `LastSetGhostButton`; `formatPrevSetLabels` stays the Prev column.
- Dial path does not import `sessionE1rm` / readiness / Victory / Today.
- `check-build-label` `.946`. LOG + CONTEXT in the same implement commit.

### Docs / ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.946`
- LOG heading `## 2026-08-24 — F-013 smart defaults on the free logger (\`.946\`)` + rotate oldest live entry
- CONTEXT `## Now` one `.946` bullet; rotate oldest shipped version bullet (`.926`); keep Status table; ≤25 bullets
- Help: one sentence — the next set starts with last time's working load; first-ever is empty; edit or tap Last; Log a set never waits
- `src/lib/workout/INDEX.md` — dial last-working + honest empty
- i18n: reuse `activeLastPerformance` / Log a set. No new Prev chrome
- Every commit: `[skip vercel]`. PR body: how to verify empty first set + one prior prefill on Train

### Hard bans

- No `PRIVATE_MODE` / promote / EIN / secrets / feed
- Do not smash master `.945` missed-day or steal `.944`
- Do not remount Hevy PREVIOUS / `SetLogAdjacencyStack`
- Do not restyle Today
- Do not steal the Victory sheet
- Do not invent a wearable or program-bump default

---

## Frozen plan — `.945` missed-day re-entry (skippable) (2026-08-24)

> **Frozen.** Implement only this section. Plan commit is `[skip vercel]`.
> Label: `2026.07-unified.945` — next free after master `.944` (E-Victory).
> Ready for squash. Preview will not deploy. No `PRIVATE_MODE` flip.
> Offline. No account. Log a set. Free. No medical claims.
> Do not restyle the Train set row. Do not add a feed, leaderboard, or red shame.
> Keep master's product + brand pack: **Log a set. Offline.**

If the athlete skipped a planned day, Today and Coach offer a quiet
way back — do it now, skip, or slide — without shame scores or
streak-break theater.

### Investigate (done — hypothesis holds)

Coach week already has the hole. `adaptPlan` stamps a past
`planned` session `missed`, keeps it on the strip (struck
"Missed", dashed card), and re-spreads remaining days. The
calendar-gap quiet line on Today (`computeReentry`, 2+ days
since last log) is a different trigger: it fires with no plan
and does not offer skip or slide.

The gap this ship closes is **Today/Coach choice copy for a
planned miss**, not a new week engine.

| Layer | What exists | Gap this ship closes |
|-------|-------------|----------------------|
| Coach week hole | `WeekStrip` strikethrough · `PlanSessionCard` dashed + Missed badge · `adaptPlan` auto-marks + re-spreads remaining | Leave the hole. Do not restyle. Do not add a red ✕ |
| Coach re-entry | `CoachAdaptBanner` (full, not compact): "Ready to train again?" + Start this session / Just Go / Open Today | No Skip. No athlete-chosen Slide. Compact Today week strip hides this block |
| Today copy | `TodayReentryCard` = 20-minute line from **days since last log** (`REENTRY_MIN_DAYS = 2`). Mounted on both Today shells via `reentryCardMayMount` | Fires with **no plan**. No skip / slide. Not keyed to a missed planned day |
| Dose | `doseScaleForMissedSessions` + `useStartCoachSession` already ease the session that starts | Keep. Do not rewrite the logger |
| Tone | `reentryTone.ts` + `reentryCopyGuard.test.ts` — no streak-loss / fail copy | New prompt must pass the same shame-free gate |

Not these (do not “fix”):

- Train set row / next-set cite (`.939`)
- Calendar-gap quiet line + dose (`computeReentry`) — leave it
- WeekStrip / PlanSessionCard missed treatment
- `adaptPlan` auto-slide of *remaining* days
- Victory (`.944`), CSV (`.943` / `.940`), gated www, account-lite
- Feed, leaderboard, streak flames, red ✕, shame scores
- Push / email return channel (`RETURN_LOOP_PLAN.md` — still ops-inert)

### Ship (only this)

1. **Pure offer** in `src/lib/coach/plannedMiss.ts` (one home).
   `findPlannedMiss(plan, todayOffset)`:
   - No plan / empty sessions / no overdue not-done session → `{ show: false }`.
   - One (or more) session with `dayOffset < todayOffset` and
     `status !== 'done'` → `{ show: true, session }` for the
     **earliest** such day. Not a stack of shame cards.
   - `canSlide` is true only when a later empty day exists
     (`todayOffset…6` with no session).
   - Recovery days count (a planned day is a planned day).
   - Stale week (`weekStart` not this week) is not this offer —
     callers pass the live week or the finder sees no current hole.

2. **Skip does not invent a fail identity.**
   `applyPlannedMissSkip(plan, sessionId)` **removes** that
   session. It must not write `status: 'missed'`, must not add
   a fail / streak field, must not mint shame copy. The week
   strip hole becomes the existing empty-day "—" — not a new
   "Failed" badge. Bump `revision` so persist matches adapt.

3. **Slide is athlete-chosen**, not a second auto-adapt.
   `applyPlannedMissSlide(plan, sessionId, todayOffset)` moves
   that session to the next empty day as `planned`. No empty
   slot → plan unchanged (`canSlide` was false). Do not
   reimplement strength-spacing; reuse the empty-day slot.

4. **Do it now** starts that session via
   `useStartCoachSession(..., { from: 'reentry' })`. No plan
   rewrite required. Dose already applies.

5. **Today chrome** — both shells (`HomeTodayLean` +
   `HomeTodayDashboard`) → `JourneyHero`. A skippable prompt
   (`TodayPlannedMissPrompt`) mounts only when
   `plannedMissMayMount` is true (shared helper next to
   `reentryCardMayMount`: not i-day, not mid-set, `show`).
   Quiet line + text actions (Do it now / Skip / Slide). Not a
   second red. Not a streak card. Calendar-gap `TodayReentryCard`
   stays; when the planned-miss prompt shows, it is the
   planned-day chrome the tests name.

6. **Coach chrome** — full `CoachAdaptBanner` re-entry block
   adds Skip + Slide beside the existing Start. Compact Today
   week strip stays compact (no extra banner). Do not restyle
   `WeekStrip`.

7. **Persist.** Skip / slide call `savePlan` (Today via the
   pure apply + `savePlan`; Coach via `useCoachPlan`). Free.
   Offline. No account.

### Tests

- `plannedMiss.test.ts`: no plan / no overdue session →
  `show === false`. One overdue `planned` or `missed` →
  skippable offer. Skip removes the session and does **not**
  write `missed` / fail identity. Slide lands `planned` on the
  next empty day. Mutant that skip-stamps `missed` dies.
- `todayGuidanceMount` / shell source: both Today shells pass
  the planned-miss offer; no plan → prompt not mounted.
- `reentryCopyGuard`: new default copy stays shame-free (no
  you-missed / broken streak / failed / guilt).
- `check-build-label` `.945`. LOG + CONTEXT in the same
  implement commit.

### Docs / ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.945`
- LOG heading `## 2026-08-24 — Missed-day re-entry: skippable (\`.945\`)` + rotate oldest live entry (`.925`)
- CONTEXT `## Now` one `.945` bullet; rotate oldest shipped version bullet (`.926`); keep Status table; ≤25 bullets
- Help: one line — if you skip a planned day, Today/Coach offer do it now, skip, or slide. Skip is not a fail. No streak theater.
- `src/lib/coach/INDEX.md` + `src/components/today/INDEX.md` list the offer
- i18n: new keys in `coachLocales.ts` (common namespace). Shame-free EN. Other langs inherit via `...en`
- Every commit: `[skip vercel]`. PR body: how to verify no-plan (no chrome) + one missed day (skippable prompt)

### Hard bans

- No `PRIVATE_MODE` / promote / EIN / secrets / feed / Discord / leaderboard
- Do not steal `.944` or any in-flight label
- Do not restyle the Train set row
- Do not add red shame, streak-break theater, or a fail score
- Do not rewrite `adaptPlan` or `computeReentry`
- Do not gate the free logger or require an account
- Brand pack: **Log a set. Offline.**

---

## Frozen plan — `.944` E-Victory receipt (vs-last, same shape) (2026-08-24)

> **Frozen.** Implement only this section. Plan commit is `[skip vercel]`.
> Label: `2026.07-unified.944` — next free after master `.943` (Strong CSV export).
> Ready for squash. Preview will not deploy. No `PRIVATE_MODE` flip.
> Offline. No account. Log a set. Free. Never invent a first-ever PR.
> Do not restyle Today. Do not add likes, a feed, a share card, or ranks.
> Keep master's product + brand pack: **Log a set. Offline.**

After Finish, Victory is a quiet receipt vs last time — same session
shape — not a feed. Empty history stays empty. One prior same-shape
session fills vs-last. Reuse the existing sheet.

### Investigate (done — hypothesis holds, with one gap)

Victory is already a sheet after Finish (`WorkoutVictorySheet`). There
is no `/victory` page and we will not add one. vs-last is already
assembled and mounted. last-set ghost is the logger prefill, not this
receipt. The remaining defect is **what “last time” means**.

| Layer | What exists | Gap this ship closes |
|-------|-------------|----------------------|
| Surface | `WorkoutVictorySheet` after Finish. First paint: Duration · Volume · Sets + muted vs-last lines + Next dock. Lift table / feel / share / rewards / debrief live in Show all | Hypothesis holds. Reuse. Do not restyle first paint. Do not restyle Today |
| Session vs-last | `pickPriorSameNamedSession` — latest earlier log with the same **name** | Same name + different lifts still compares volume. Different name + same lifts stays quiet (Coach week titles, renamed sessions) |
| Per-lift vs-last | `pickPriorExerciseLog` — last earlier log that contains that exercise, any session name | Keep. Bench vs last bench stays honest even when the session shape differs |
| Assembly | `assembleActiveVictory` → `buildVictoryReceipt` → `summary.receipt` → `VictoryStatsStrip` / `VictoryReceiptStrip` | Wire stays. Switch the session picker only |
| Empty / first-ever | `vsLast: null`, `prCount: 0`, no invented zeros (`.713`) | Keep. Lock: empty history is honest empty, no fake PR |
| Logger ghosts | `lastSetGhost.ts` (Last tap) · `vsLastSet.ts` (after-save row delta) | Do not rewrite. Not Victory |
| Share / ranks | Share + rewards already in Show all | Do not add likes, a feed, a new share card, or ranks. Do not promote Share onto first paint |

Not these (do not “fix”):

- Today / HomePage / pin grid / Start
- last-set ghost, after-save set-row vs-last, next-set cite (`.939`)
- Strong CSV import/export (`.940` / `.943`)
- Field-test receipt (its own vs-last)
- Share ladder, rewards line, feel strip, debrief
- New Victory route, likes, feed, ranks, XP

### Ship (only this)

1. **Session shape** in `victoryReceipt.ts` (one home). `sessionShape(log)` is the sorted unique `exerciseId`s that have at least one logged set. Empty shape is not comparable. Order of logging does not change the shape; adding or dropping a lift does.

2. **`pickPriorSameShapeSession`** replaces the name picker for **session totals** (`vsLast` volume / sets / duration). Latest earlier non-deleted log with the same shape. Keep `pickPriorSameNamedSession` only if a test still names it — session totals must not use it.

3. **Empty history stays empty.** First session (or no prior same shape): `vsLast === null`, `prCount === 0`, no PR badge, no invented `+0`. Per-lift Prev stays `—`. Do not print a fake “vs last”.

4. **One prior same-shape session fills vs-last** even when the workout name differs (Week 2 Push vs Week 3 Push; two Just Go days with the same lifts). Same name + different lifts stays quiet on session totals; per-lift vs-last still fills.

5. **Surface.** Keep Peak-End: stats + Next on first paint; lift receipt in Show all. `assembleActiveVictory` already passes `historyBefore` — do not add a second assembly. Free, offline, no account.

### Tests

- `victoryReceipt.test.ts`: empty history → no vs-last, no PR. One prior same shape (names differ) → volume/sets/duration deltas. Same name + different lifts → `vsLast === null`; lift Prev still fills when that lift existed. Tombstone still ignored. Mutant restoring name-only session pick dies.
- `activeSessionFinish.test.ts`: first finish stays `receipt.vsLast === null`; one prior same-shape log attaches deltas (update the “same-named” case if the fixture already shares a shape).
- `victoryCopyGuard` / `victorySheetChrome`: lift receipt stays in Show all; Share / rewards stay off first paint; no likes / feed.
- `check-build-label` `.944`. LOG + CONTEXT in the same implement commit.

### Docs / ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.944`
- LOG heading `## 2026-08-24 — E-Victory receipt: vs-last same shape (\`.944\`)` + rotate oldest live entry
- CONTEXT `## Now` one `.944` bullet; rotate oldest shipped version bullet (`.925`); keep Status table; ≤25 bullets
- Help: Finish shows vs last time when you have done the same lifts before; a first session has no invented PR
- `src/lib/workout/INDEX.md` — session totals match shape, not name
- i18n: reuse `victoryVsLast` / receipt keys. No new share/rank copy
- Every commit: `[skip vercel]`. PR body: how to verify empty finish + one prior same-shape finish

### Hard bans

- No `PRIVATE_MODE` / promote / EIN / secrets / feed / likes / ranks
- Do not steal `.943` or any in-flight label
- Do not restyle Today
- Do not add a Victory page or share card
- Do not rewrite last-set ghost or set-row vs-last
- Do not gate the free logger or require an account
- Brand pack: **Log a set. Offline.**

---

## Frozen plan — `.943` Strong CSV export (round-trip) (2026-08-24)

> **Frozen.** Implement only this section. Plan commit is `[skip vercel]`.
> Label: `2026.07-unified.943` — next free after master `.942` (#778).
> Ready for squash. Preview will not deploy. No `PRIVATE_MODE` flip.
> Offline. No account. Log a set. Never invent sets.
> Do not invent set-table-a-only columns on the Strong file.
> Do not fight open PRs. No Discord. Do not cite a 3-workout cap.
> Keep master's product + brand pack: **Log a set. Offline.**

Athlete can leave (or round-trip) with a Strong-shaped session CSV.
Preview/confirm is **not** required on export — it is a read-only
download. Import already exists (`.940` / #779). Multiple exports
allowed. F-017 guest path stays: no sign-in on the card.

### Investigate (done — hypothesis holds)

Export already exists as session/set buttons on Account. Strong
shape is already `workoutsToSetTableBCsv`. Do not rewrite the
parser or start a second exporter.

| Layer | What exists | Gap this ship closes |
|-------|-------------|----------------------|
| Parser / shaper | `importCsv.ts` — `SET_TABLE_B_CSV_HEADER` + `workoutsToSetTableBCsv`. Parser-level Strong in+out already in `importCsv.test.ts` | Persist-layer empty / one-fixture / skipped-row export is untested |
| Restore | `importCsvRestore.ts` `buildWorkoutCsvDownload` / `downloadWorkoutCsv`. Reads persist, no write | Empty history returns `{ ok: false, error: 'empty' }` and toasts — no file |
| Card | `ProfileImportCard` on `/account#import` — **Export session CSV** (`set-table-b`) next to import; **Export set CSV** (`set-table-a`) stays | Wire is already there. Empty must download header-only (or honest empty file), not refuse |
| Other downloads | `ProfileBackupCard` JSON device backup; signed-in `ProfileAccountCard` cloud JSON | Leave them. Not the interchange format |
| Reach / guest | I-Day + empty Train → `/account#import`. Card has no `getUser` | Keep. Export must not ask for an account |

Not these (do not “fix”):

- Import preview + confirm (`.940`) — leave pick → preview → confirm
- Set-table-a export button — keep; do not add its columns to Strong
- JSON backup / cloud DSAR download
- #778 gated www / #780 account-lite
- Localized Strong headers, cloud upload, account gate, one-export cap

### Ship (only this)

1. **Empty history is a file.** `buildWorkoutCsvDownload('set-table-b')` on empty persist (or missing store) returns `{ ok: true, csv, count: 0 }` where `csv` is the Strong header plus a trailing newline — no invented data row. Same for `set-table-a` (shared helper). Storage failure still `{ ok: false, error: 'storage' }`. Drop the `'empty'` refuse.

2. **Card downloads, does not preview.** Session CTA still calls `downloadWorkoutCsv('set-table-b')` immediately. No confirm sheet. Empty still clicks and downloads. Toast may say 0 workouts / header-only — never “nothing to export” after a file landed. A second click still downloads (no one-export lock).

3. **Round-trip through persist.** Import the existing Strong fixtures, then export session CSV from the same persist the card reads:
   - `strong-one-workout.csv` → export → parse → exactly those two bench sets. No padded / invented sets. Re-import of the export is a no-op against that history.
   - `strong-malformed-row.csv` → import skips Ghost Press → export must not rewrite that skipped row as a valid set.
   - Header of the Strong download stays `SET_TABLE_B_CSV_HEADER` — no extra columns.

4. **Guest / free.** Card still has no `getUser` / premium check. `/account#import` still opens. F-017 / `TAP_BUDGET` 4 untouched.

### Tests

- `importCsvRestore.test.ts`: empty persist → header-only Strong file, `count === 0`, persist unchanged; one imported fixture round-trips without invented sets; malformed import’s skipped row is absent from the export; two downloads of the same history match (no one-export cap). Mutant restoring `error: 'empty'` on zero history dies.
- `importCsv.test.ts`: `workoutsToSetTableBCsv([])` is header-only; exported header equals `SET_TABLE_B_CSV_HEADER`.
- Card source: session export still `handleExport('set-table-b')`; no preview/confirm on the export path; no `getUser` / premium / one-export lock.
- `importReach` + `csvHistoryFree` still hold.
- `check-build-label` `.943`. LOG + CONTEXT in the same implement commit.

### Docs / ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.943`
- LOG heading `## 2026-08-24 — Strong CSV export: round-trip (\`.943\`)` + rotate oldest live entry (`.923`)
- CONTEXT `## Now` one `.943` bullet; rotate oldest shipped version bullet (`.924`); keep Status table; ≤25 bullets
- Help: one line — Account → Export session CSV downloads the workout file (empty history is header-only). No account. Offline.
- `src/lib/workout/INDEX.md` lists export + persist-layer tests
- i18n: reuse export keys; only add a key if empty-download copy cannot reuse `csvExportDone` / count 0
- Every commit: `[skip vercel]`. PR body: how to verify the download from Account.

### Hard bans

- No `PRIVATE_MODE` / promote / EIN / secrets / feed / Discord
- Do not steal `.942` or any in-flight label
- Do not invent set-table-a-only columns on the Strong file
- Do not invent sets or rewrite skipped import rows as valid
- Do not add preview/confirm on export
- Do not gate the free logger or require an account
- Do not cite a 3-workout free cap
- Brand pack: **Log a set. Offline.**

---

## Frozen plan — `.941` account-lite auth harden (2026-08-24)

> **Frozen.** Implement only this section. Plan commit is `[skip vercel]`.
> Label: `2026.07-unified.941` — next free after master `.940` (#779).
> Do not steal `.935` (#778 gated www, still running).
> Ready for squash. Preview will not deploy. No `PRIVATE_MODE` flip.
> No login wall. No new IdP. No Discord. No invite-only. No Vercel
> Deployment Protection as product auth. Mission ID mint stays
> server-only (503/502 when admin/project is dark).
> F-017 first set without account stays.
> Keep master's product + brand pack: **Log a set. Offline.**

### Investigate (done — hypothesis holds)

The gap is **session restore + copy that still frames an account as
required**, not a missing OAuth provider.

| Layer | What exists | Finding |
|-------|-------------|---------|
| **Guest first set (F-017)** | `firstSetUngated.ts`, Welcome has no sign-in step, Train does not mount `SignInPrompt`, header chip waits for first workout and never paints on `/active` | Already shipped (`.746` / `.762` / `.766`). Keep. |
| **Optional sign-in** | Magic link + Google (Apple/Azure/Facebook env-gated) in `SignInPanel`. No password theater. Skip exists for Welcome-style `allowSkip`. | Do **not** add Discord, SSO on the logger, or a new IdP. |
| **Waitlist / Enter with code** | `/private` teaser + `POST /api/private-access`. Waitlist is `submitLead`. Proxy parks ungated visitors on `/private`, not on Train itself. | Gated-www door. Not a Train lock. Do not move it onto `/active`. |
| **Cookies / session** | `@supabase/ssr` cookie client (`supabase.ts`). Server reads `sb-*-auth-token` in `supabaseAuthCookies.ts`. Gate cookie is HMAC `privateSession`, separate from auth. | No guest JWT. Guest identity is device storage (`mw_device_id` + zustand `workout-tracker-storage`). |
| **Mission ID** | Server mint `GET /api/account/mission-id` → `claimMissionIdForUser` on `mission_ids`. Client `useMissionId` stays null on 401/503/502. Display-only `identity/missionId.ts`. | **Not local-only.** Do not invent a client mint. CONTEXT records the table applied; if the project is paused the route already fails closed. Leave it. |
| **Silent wipe** | `useJourneySync` calls `clearAthleteLocalState()` on **every** `SIGNED_OUT`. That helper deletes the workout store, journey, device id, and every `mw_*` key except consent/locale. Account page also wipes on explicit sign-out (correct). | **This is the defect.** Supabase emits `SIGNED_OUT` on boot-with-no-session, expired JWT, demo client, and token-refresh failure — not only on Profile → Sign out. A returning guest (or a signed-in athlete whose cookie died) loses the local log. |
| **Copy** | `LOCAL_FIRST_COPY` is honest. Train/Today/Welcome already say no account. `SignInPrompt` default (`signInPromptDefault`) still says "Sign in to sync workouts…" on Fuel/Builder/etc. Header "Sign in" is wayfinding after the first workout. | Harden first-set surfaces so they cannot say an account is required to log. Do not restyle Fuel's optional prompt into a wall. |

Not these (do not "fix"):

- Do not add a login wall, skip-sign-in step on I-Day, or `SignInPrompt` under the logger.
- Do not enable Vercel Deployment Protection as product auth.
- Do not flip `PRIVATE_MODE`, promote, open Public GitHub, or add feed/DMs.
- Do not mint Mission ID locally or pretend `/api/account/mission-id` succeeded.
- Geo-blocks stay. No new regions. No pregnancy/PT work.
- Brand: Log a set. Offline. / No account. No wearable.

### Ship (only this)

1. **Pure wipe decision** in `athleteLocalState.ts` (one home):
   - `planSignedOutStorage({ explicitSignOut })` → `'wipe-athlete' | 'keep-local'`.
   - Wipe only when the athlete marked an explicit sign-out.
   - `SIGNED_OUT` without that mark **keeps** the workout store and guest keys.
   - `markExplicitSignOut` / `hasFreshExplicitSignOut` use a timestamp key on the keep-list so other tabs can see the intent. Stale marks do not wipe.
2. **Wire:**
   - `AccountPage.handleSignOut` marks intent, then clears, then `signOut()` (privacy wipe for a real leave stays).
   - `useJourneySync` `SIGNED_OUT` uses the predicate. Presence still flips to guest. No wipe on boot/expiry.
3. **Copy / Train CTA:**
   - First-set surfaces (Welcome, Train, Today header, `LOCAL_FIRST_COPY`, `firstSetUngated`) must not say you need an account to log.
   - Optional auth chrome cannot sit on `/active` or cover the first-set CTA. Reuse F-017 wiring; do not raise `TAP_BUDGET`.
   - Waitlist / Enter with code stays on `/private`. Source guard: Train does not import waitlist, private-access, or `SignInPanel`.
4. **Mission ID:** no product change. Keep fail-closed display. Add a source lock that the client never writes `mission_ids` / never invents an integer.

### Tests

- **Guest first set still works:** existing `firstSetUngated` + `TAP_BUDGET` 4. Mutant adding `SignInPrompt` on Train dies.
- **Signed-out restore does not wipe:** persist a workout-store payload; run `SIGNED_OUT` with `explicitSignOut: false`; history key still present. Explicit mark wipes. Mutant restoring unconditional `clearAthleteLocalState()` in the listener dies.
- **Optional auth cannot block Train CTA:** header chip predicate false on `/active` and before first workout; Welcome has no sign-in step; Train does not import `SignInPanel` / waitlist / private-access.
- `check-build-label` `.941`. LOG + CONTEXT in the same implement commit.

### Docs / ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.941`
- LOG heading `## 2026-08-24 — Account-lite auth harden (\`.941\`)` + rotate oldest live entry (`.921`)
- CONTEXT `## Now` one `.941` bullet; rotate oldest shipped version bullet (`.922`); keep Status table; ≤25 bullets
- Help: one line — returning to this device restores the same local log; sign-out of an account still clears this device
- `src/lib/storage/INDEX.md` + `src/hooks/INDEX.md` if the wipe rule / hook contract changed
- Every commit: `[skip vercel]`

### Hard bans

- No `PRIVATE_MODE` / promote / Public GitHub / invented traction
- No login wall / SSO on the logger / Discord / invite-only
- No new IdP / password theater
- No Vercel Deployment Protection as product auth
- No local Mission ID mint
- Do not steal `.935` (#778) or master's `.940`
- Do not gate the free logger
- Do not weaken geo-block

---

## Frozen plan — `.940` Strong CSV import (preview + confirm) (2026-08-24)

> **Frozen.** Implement only this section. Plan commit is `[skip vercel]`.
> Label: `2026.07-unified.940` (master is `.939` after #777 + Dependabot `8d0300f1`).
> Do not steal `.935` (#778 gated www, still running) · `.938` (#780 account-lite, draft).
> Preview will not deploy. Excellence-Override: Strong CSV import (preview + confirm).
> Offline. No account. Log a set. Never invent sets. Failed rows skip with a count.
> Do not fight #778 #780. Keep master's product + brand pack: **Log a set. Offline.**

English Strong-app export first (`Date,Workout Name,Duration,Exercise Name,Set Order,Weight,Weight Unit,Reps,RPE,Notes`). More than one import allowed — no one-file cap. F-017 path stays: I-Day + empty Train still link `/account#import`; the card never asks for sign-in.

### Investigate (done — hypothesis holds)

A parser already exists from the `.180` draft. Do not rewrite it.

| Layer | What exists | Gap this ship closes |
|-------|-------------|----------------------|
| Parser | `src/lib/workout/importCsv.ts` — `set-table-b` is the English Strong header; quote-aware scanner; `skippedRows`; merge identity (minute + name + set count); existing history wins | Empty / one-workout / malformed Strong fixtures are not first-class; skipped count never reaches the athlete |
| Restore | `importCsvRestore.ts` `importWorkoutCsvText` parses **and writes** in one call | No dry-run. Drop writes immediately |
| Card | `ProfileImportCard` — picker then toast + `reloadAfterRestore` | No preview. No confirm. Toast omits `skippedRows` |
| Reach | I-Day + empty logger → `/account#import` (`.766` / `importReach.test.ts`) | Keep. Do not move. Do not add SignInPrompt |
| Export | `workoutsToSetTableBCsv` + session/set download buttons already on the card | Leave as-is. **Do not start a Hevy-layout export.** Round-trip tests already cover Strong in+out — do not expand |

Not these (do not “fix”):

- #777 next-set cite (`setRowAdjacency`, Train table) — landed `.939`
- #774 Coach why-line (`sessionRationale`)
- #778 gated www / #780 account-lite
- Hevy export, localized Strong headers, cloud upload, account gate
- Mid-set sync data-loss claims. A 3-workout free cap. Force Sync.

### Ship (only this)

1. **Preview is a dry-run.** Add `previewWorkoutCsvText(text)` in `importCsvRestore.ts`: parse + `mergeImportedLogs` against current persist, **do not write**. Return format, workouts, `setCount`, `skippedRows`, `added`, `duplicates`, error. `importWorkoutCsvText` stays the commit. Never invent a set: missing exercise name or non-numeric reps → skip + count; empty / header-only → error, 0 workouts, history unchanged.

2. **Card: pick → preview → confirm.** `ProfileImportCard` parses on file pick, paints a paper preview (workout count, set count, skipped-row count, first few names), then **Confirm** writes and **Cancel** drops the preview. Confirm is a button, not hold-to-confirm (merge is additive; existing history wins). Picker stays after a commit so a second file can be imported. No one-import lock.

3. **Report the skip count.** Preview and the done toast both name `skippedRows` when > 0. A failed row never wipes good rows in the same file.

4. **English Strong fixtures.** New files under `src/lib/workout/fixtures/`:
   - `strong-empty.csv` — empty (or header-only) → 0 workouts, error, no write
   - `strong-one-workout.csv` — one session, exact known sets
   - `strong-malformed-row.csv` — good rows + one unreadable row → skip counted, good sets kept

5. **Multiple imports.** Two different Strong files both add. Re-import of the same file stays a no-op. No cap.

### Tests

- `importCsv.test.ts` + new fixtures: empty file, one workout (exact set count, no invented sets), malformed row (skip + keep), two different files both add.
- `importCsvRestore.test.ts` (new): preview does not write; confirm writes; empty preview leaves persist unchanged; skipped count returned.
- Card source: preview before write; Confirm/Cancel present; no `getUser` / premium / one-import lock; still calls `importWorkoutCsvText` only on confirm.
- `csvHistoryFree` fixture list updated (discover the new files; tests must read them).
- `importReach` still holds. F-017 / `TAP_BUDGET` 4 — no edits that weaken them.
- `check-build-label` `.940`. LOG + CONTEXT in the same implement commit.

### Docs / ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.940`
- LOG heading `## 2026-08-24 — Strong CSV import: preview + confirm (\`.940\`)` + rotate oldest live entry
- CONTEXT `## Now` one `.940` bullet; rotate oldest shipped version bullet if over budget; keep Status table; ≤25 bullets
- Help: one line — import a workout CSV on Account (preview, then confirm). No account. Offline.
- `src/lib/workout/INDEX.md` lists preview + new tests
- i18n: preview / confirm / skipped-count keys on `notificationLocales.ts`; `npm run i18n:fill` + parity
- Commit trailer: `Excellence-Override: Strong CSV import (preview + confirm)`
- Every commit: `[skip vercel]`. PR body: how to verify on a desktop file picker.

### Hard bans

- No `PRIVATE_MODE` / promote / EIN / secrets / feed / Discord
- Do not steal `.935` (#778) or `.938` (#780)
- Do not touch #778 #780
- Do not start a Hevy-layout export
- Do not invent sets
- Do not silent-wipe on a bad row
- Do not gate the free logger or require an account
- Do not cite a 3-workout free cap
- Do not claim mid-set sync data-loss
- Brand pack: **Log a set. Offline.**

---

## Frozen plan — `.939` E-Adjacency next-set cite (2026-08-24)

> **Frozen.** Implement only this section. Plan commit is `[skip vercel]`.
> Label: `2026.07-unified.939` (master is `.938` after #775).
> Do not steal `.934` (Coach why-line #774, landed) · `.938` (honesty #775, landed).
> In-flight leftovers: `#778` `.935` · this PR was `.936` · `#779` `.937`.
> Ready for squash. Preview will not deploy (`[skip vercel]` on every commit).
> Excellence is pass — still do not restyle Train.
> No `PRIVATE_MODE` flip. No Public GitHub. No promote. No Discord. No DMs/feed/Top 8.
> Public line stays **Log a set. Offline.** Do not put Train Anywhere. Win Daily. on the door.
> Name Mission Winning stays. Paper/ink/red tokens stay.
> No medical or PT-safety claims. No field-test work.
> Canada/EEA geo-blocks stay as coded.

Free. On Train / the set row, after a completed working set, show the next set
the logs earn (weight/reps or rest), cited from their last sets. Skippable.
Never blocks logging. Not a feed. Not a paywall. Not a wearable. **E-Adjacency
is not a marketing name on the door.**

### Prior art — closed #487 (`.703`, 2026-08-13)

Product PR #487 drafted E-Adjacency as TARGET stacked above PREVIOUS on the
**live incomplete** row (`SetLogAdjacencyStack`). Craft LGTM, then closed as
superseded by #544 / `.766`. Engines landed (`setRowAdjacency`,
`suggestNextSetTarget`, last-live reader). The stack was **never imported**.

This ship **supersedes #487's surface**, not its engines:

- Recover the cite + double-progression numbers.
- Recover #487 leftover: `getLastSessionSets` must use `lastLiveSessionForExercise`
  (tombstones / 0-rep junk are not Prev evidence). Master still had a private loop.
- Do **not** remount TARGET-above-PREVIOUS. Prev is official last-actuals
  beside the row — it does **not** fill the next number. Do not call Prev
  marketing. Last-set ghost already copies last into the dial. Cite is
  after complete, not a second last-actuals ghost.
- Do not invent a program bump. The category bump fires when **all
  prescribed working sets** hit the top of the range (next session's load).
  We do not write that. Cite this session's next set from logs, or Coach
  plan numbers as-is.
- Import / sync is a later chore (CSV first). Do not claim mid-set
  data-loss. Stay on Train.

### Competitive refuse (Market Intel 2026-08-24)

Beat, not copy. **Do not call Prev marketing.**

| Category move | Our refuse / beat |
|---------------|-------------------|
| Rest timer is table stakes | Already free. Cite may recall last rest; it is not a rest-timer product. |
| Last-actuals beside the live row (Prev) | Official help. They do not fill the next number. We already have Prev + last-set ghost. Cite is **after complete**, skippable, with a why — not another last-actuals ghost. |
| Planner bump | Fires when **every prescribed working set** hits the top of the range → next session load. We do not write that. `prescribed` cites Coach plan numbers as-is. |
| Sync / import | Later PR (chore). Do not claim mid-set data-loss. Same-device logs, offline. |

Stay on Train. No Today restyle. No feed.

### Investigate (done — hypothesis holds, with one extra unused stack)

| Primitive | What it already does | Gap |
|-----------|----------------------|-----|
| `suggestNextSetTarget` | Double-progression next weight/reps from last working sets (`evidenceWorkingIdx`) | Numbers only — no after-complete paint |
| `setRowAdjacency.ts` | Target + weekday/set cite from last *live* session; honest empty; coach cite when prescribed | **Never mounted** on Train |
| `SetLogAdjacencyStack.tsx` | TARGET + cite above PREVIOUS | **Never imported** |
| `lastSetGhost` | One-tap copy of the *last* working set into the dial | Last, not next; not a cite |
| `vsLastSet` | After-save `+2.5 kg` / `+1 rep` / `same` | Comparison of the set just logged, not the next one |
| Header `activeNextTargetLine` | Uncited `Next: 8 × 60 kg` | No provenance; not skippable; not on the set row |
| Coach why-line (#774) | Session story on the Coach **boss card** | Different surface — do not steal |

Conclusion: last-set ghost + vs-last already have *last* numbers. Next-set
numbers already live in `suggestNextSetTarget` / `setRowAdjacency`. The gap is
a **visible, skippable, cited next-set after complete** on the free logger.

### Ship (only this)

1. **One new resolver** in `setRowAdjacency.ts` — `resolveAfterCompleteCite`.
   Reuse `suggestNextSetTarget`, `lastLiveSessionForExercise`, `formatAdjacencyCiteLine`.
   Do not fork double-progression. Do not import readiness / freshness / Recovery % /
   `sessionRationale` / premium.
2. **Evidence, in order:**
   - The completed row must be a **working** set (`completed`, not warmup). Else quiet.
   - Empty history **and** no completed working set this session → `null`. Never invent 8 × 60.
   - One completed working set this session (first-ever) → load/reps from that set via
     `suggestNextSetTarget`; cite `From this session · set N` (no invented weekday).
   - Last live session exists → existing log cite (`From last {day} · set N`).
   - Prescribed next row → planned numbers + `Coach plan` cite (not a fake Tuesday).
   - No next incomplete set, but `recallLastRest` has seconds → rest cite (`Rest 2:30 · Last rest`).
     Do **not** invent rest from the name heuristic — that is not a log.
3. **Paint on `SetLogTable` only** (the live set row). After the completed set's
   rate row: quiet ink line `9 × 60 · From last Mon · set 2` (or rest) + outline **Skip**.
   `data-testid="set-table-next-cite"` / `set-table-next-cite-skip`.
   Skip is session-local state (hide this set id). Log set stays the sole red primary.
   Do not remount `SetLogAdjacencyStack` into the Prev column (that restyles the table).
   Do not add Use/Apply here — ghost and Use next already write the dial.
4. **Free forever.** No premium read. No account. Offline. Same device logs.
5. **Help:** one sentence on the first-workout set log — after a working set, the
   next load or last rest is cited from the log; Skip is fine.

### Tests

- Empty history + no completed working set → `resolveAfterCompleteCite` is `null` (does not invent).
- One logged working set + a next planned row → skippable load cite (target + provenance).
- Skip wiring: `SetLogTable` mounts Skip; Log set is still `primary-action`; Skip is not red.
- `getLastSessionSets` skips tombstones / 0-rep junk via `lastLiveSessionForExercise` (#487 leftover).
- `SetLogTable` does not remount `SetLogAdjacencyStack` (#487 surface stays superseded).
- All prescribed sets at the top of the range still cite Coach plan numbers; history is not rewritten.
- Cite is next-from-logs, not last-set ghost. Cite path does not call Prev marketing or claim mid-set data-loss.
- Cite path does not wire CSV import. Today / Fuel / Coach do not mount the cite.
- Warmup complete stays quiet. Tombstone history is not evidence (existing last-live rule).
- Source: does not import `sessionRationale` / PlanSessionCard / readiness.
- Door / teaser / www do not gain an "E-Adjacency" string.
- `check-build-label` `.939`. LOG + CONTEXT in the same implement commit.

### Docs / ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.939`
- LOG heading `## 2026-08-24 — Next-set cite after a logged set (\`.939\`)` + rotate oldest live entry
- CONTEXT `## Now` one `.939` bullet; rotate oldest shipped version bullet (`.920`); keep Status table; ≤25 bullets
- i18n: cite / skip / weekday / rest keys in `activeWorkoutLocales.ts`; `npm run i18n:fill` + parity
- INDEX: `src/lib/workout/INDEX.md` + `src/components/workout/INDEX.md`
- Every commit: `[skip vercel]`

### Hard bans

- No `PRIVATE_MODE` / Public GitHub / promote / Discord / DMs / feed / Top 8
- Do not steal #774 why-line (Coach boss card) / #775 honesty / #776 brand
- Do not restyle the whole Train screen
- Do not put Train Anywhere. Win Daily. or Win Daily as a company tagline
- Do not print E-Adjacency on the door or in athlete chrome
- No medical / PT-safety / field-test work
- Do not invent new geo-blocks
- Do not gate the free logger
- Do not raise `TAP_BUDGET`

---

## Frozen plan — `.932` Coach why-this-session (reserved `.699` / F-012) (2026-08-24)

> **Frozen.** Implement only this section. Plan commit is `[skip vercel]`.
> This is the **`.699` concern** (F-012 / F-002 session why-line + F-025/F-031 quiet/skippable).
> Build number is **`2026.07-unified.932`** because master is `.930`. Sibling F-008 honesty may take `.931` — do not steal it.
> Old PR **#478** closed unmerged 2026-08-14 (claimed superseded by #544 / `.766`; `.766` is `logCitation`, not this ship).
> Draft PR. **Preview will not deploy** (`[skip vercel]` on every commit).
> No `PRIVATE_MODE` flip. No promote. No Stripe. No invented traction.
> Do not start E-Adjacency. Do not touch field test / PT / pregnancy counsel-holds.
> No feed, no DMs, no injury forecast, no wearable claims. Never cite a 3-workout cap by competitor name.

Week rationale is already on master (`.693` / `weekRationale.ts`). This ship is the **session why-line**: one cite-able story on the Coach boss `PlanSessionCard` that says why this session exists from the athlete’s logs — or an honest empty when there are none. Why stays **free**. Coach stays opt-in / skippable. Free logger untouched.

### Investigate (done — recover, do not rewrite)

| Claim | Verified on master `.930` |
|-------|---------------------------|
| **#478 shape landed via merge-all** | **Yes.** `sessionRationale.ts`, boss-card 3-part paint, grid/page hints, i18n keys, and `sessionRationale.test.ts` are on master. INDEX read-order dropped the file when `.766` took `8c3` for `logCitation.ts`. |
| **#478 ≠ `.766`** | **Yes.** Founder closed #478 as “superseded by #544 / `.766`”. `.766` is the quotable log fact (`CoachLogCite` / `no-logs`). Session why is a different concern that hitchhiked. |
| **Silent empty is the gap** | **Yes.** `buildSessionRationale` returns `null` on clean start (`loggedWorkoutCount === 0`, no whyKey). WhyKey stories can still say “recent sets in your logs” with zero workouts. Done bar now wants an **honest empty**, not theater and not a fake cite. |
| **Coach is already skippable** | **Yes.** Why paints only on `/coach` boss `PlanSessionCard` (`isPrimaryStart`). Not Train, not Today, not I-Day. `CoachTodayCard` has a separate Wave-8 one-liner — do not expand it. |
| **Why is not paywalled in the card** | **Yes today.** `PlanSessionCard` does not read `premium`. Generate is free; Bundle is voice/chat/regen. Guard that. Do not wrap the why in `locked` / `premium`. |

Not these (do not “fix”):

- Week rationale / `CoachAdaptBanner` / `weekDiff` (already shipped).
- `logCitation.ts` / `CoachLogCite` exemption for `PlanSessionCard` — session rationale *is* the cite; do not stack a second `CoachLogCite` under it.
- E-Adjacency / `SetLog*` / Active density.
- F-008 growth honesty / Alpha chrome / PRIVATE_MODE copy.
- Field test, PT, pregnancy.
- Feed, DMs, injury forecast, wearables as score.

### Ship (only this)

1. **Keep the #478 engine.** `buildSessionRationale` still picks one shame-free story from signals the prescription already carries (swap/recovery, progression `whyKey`, load-band hold, post-first-workout focus). Same inspectability shape as week rationale: inputs · rule · effect. Compact line stays on the type for tests.

2. **Honest empty when there are no logs.** On a planned/swapped boss session with `loggedWorkoutCount === 0`, return a `session-empty` kind — one quiet line, no “0 workouts” shame, no wearable claim, no invented set. Do **not** fire whyKey stories that say “your logs” when history is empty.

3. **Paint only on the Coach boss card.** `PlanSessionCard` when `isPrimaryStart`. Other grid days stay quiet. Empty uses the same `data-testid="coach-session-rationale"` plus a kind hook (`data-rationale-kind`). Paper, ink, primary inset edge (not poster). No eyebrow. No Trainer rail. No force onto `/active` or `/log`.

4. **Why stays free.** No `premium` / `locked` / `entitled` branch around the why. Source guard: `PlanSessionCard` does not import premium helpers.

5. **Coach stays skippable (F-025 / F-031).** Athlete can skip `/coach` and log on Train. Why never becomes a Today/I-Day requirement. Do not raise `TAP_BUDGET`. Do not put chat on Today.

6. **INDEX + help.** Put `sessionRationale.ts` back in `src/lib/coach/INDEX.md` (after `logCitation` / `weekDiff`, not instead of them). One help line on [docs/help/mission-coach.md](help/mission-coach.md): the boss session cites why from logs, or says there are none yet. Do not edit PT / pregnancy / field-test help.

### Tests

- `sessionRationale.test.ts`:
  - Empty history → `session-empty` (not `null`); copy does not say “0 workouts” / wearable / predicted.
  - whyKey + `loggedWorkoutCount === 0` → empty, not a fake “recent sets in your logs” story.
  - Existing story kinds still fire when `loggedWorkoutCount > 0`.
  - Done/missed still `null`.
  - Wiring: boss card mounts it; grid passes hints; `CoachPage` wires `ctx.history.length`; no Train/Today force.
- `earnedFromLogsCopy.test.ts`: boss card still surfaces From your logs · Rule · Effect on a cited story; empty kind is allowed; no poster edge; no `premium` import on the card.
- New (or extended) guard: `PlanSessionCard` / session why path does not read `premium` / `isPremium` / `locked`.
- Mutant that restores silent `null` on `loggedWorkoutCount === 0` dies.
- Mutant that paints why on a non-boss card dies (existing `isPrimaryStart` wiring).
- `check-build-label` `.932`. LOG + CONTEXT in the same implement commit.

### Docs / ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.932`
- LOG heading `## 2026-08-24 — Coach why-this-session (\`.932\`)` + rotate oldest live entry
- CONTEXT `## Now` one `.932` bullet that names the `.699` concern; rotate oldest shipped version bullet; keep Status table; ≤25 bullets
- Help: one line on mission-coach — session why cites logs or honest empty; Coach skippable
- `src/lib/coach/INDEX.md` lists `sessionRationale.ts`
- i18n: add empty-kind keys next to existing `coachSessionRationale*`; `npm run i18n:fill` + parity
- Commit trailer: this is the `.699` concern (F-012 why-line). Build number is `.932` because master is `.930`.
- Every commit: `[skip vercel]`. PR title/body say the same label sentence.

### Hard bans

- No `PRIVATE_MODE` / promote / EIN / secrets
- Do not steal F-008 honesty or `.931`
- Do not start E-Adjacency / rewrite `SetLog*`
- Do not touch field test / PT / pregnancy counsel-holds
- No feed, no DMs, no injury forecast, no wearable claims
- Never cite a competitor 3-workout cap
- Do not gate the free logger
- Do not paywall the why-line
- Do not force Coach chrome onto Train / Today / I-Day
- Do not stack a second `CoachLogCite` under the session why (exemption stands)
- Do not change week rationale / generate engine / adapt rules — reuse existing signals only

---

## Frozen plan — `.931` F-008 gated www honesty (old `.698` / #477) (2026-08-24)

> **Rebase note (2026-08-24).** `#774` / `.934` is on master. `#776` owns the door
> strings. This PR keeps leftover F-008 honesty and ships as **`.938`** (do not
> steal `#778` `.935` · `#777` `.936` · `#779` `.937`). Do not fight `#776` on
> Free / Log a set. Offline. Do not squash-merge this hour.

> **Founder brand review (2026-08-24).** Door pack is now **Free / Enter with code / Get notified**.
> Public line: **Log a set. Offline.** Support: **No account. No wearable.**
> Do not use Train Anywhere. Win Daily. as the company tagline on the door.
> Do not use Free beta, invite-only, open alpha, or private beta on the door.
> Name Mission Winning is locked. Visual tokens unchanged.
> Sibling `.933` landed brand-guidelines — do not rewrite those files.
> If a surface already says Free beta, swap to **Free**. Ship label is now `.938`.

> **Frozen.** Implement only this section. Plan commit is `[skip vercel]`.
> This is the `.698` concern (F-008 honesty). Build number is `.931` because master is `.930`.
> Old PR #477 (`Gated www honesty under PRIVATE_MODE (.698)`) closed unmerged 2026-08-14.
> Do not reuse `.698` as `APP_BUILD_LABEL`. Do not steal `.699` why-line work.
> Draft PR. **Preview will not deploy** (`[skip vercel]` on every commit).
> Excellence-Override: F-008 gated www honesty.
> No `PRIVATE_MODE` flip. No promote. No Public GitHub flip. No invented traction.
> Do not touch #505 #519 #536. Do not add a feed, DMs, Top 8, or invite-only language.
> WWW N1 four-scene thesis stays on master. This ship is **copy honesty on the gated door**, not a cinematic restyle of Today / Train.

### Investigate (done — leftover invite-only + inverted honesty guard)

Constitution / WWW_NIGHT copy pack: **Free beta / Enter with code / Get notified**.
No “invite-only”. No “we’re live”. No traction. Gate stays up.

#477 already wrote that pack (`gateEyebrow: 'Free beta'`) plus a closed forbidden list. After it closed, later ships kept the module but **inverted the claim**: EN first paint and the honesty test now say **Alpha** and **ban “free beta”** on the door. That is the defect.

| Surface | Master `.930` | Required |
|---------|---------------|----------|
| `GATED_WWW_HONESTY.gateEyebrow` | `Alpha` | **Free beta** |
| `gateEn.ts` first paint | `Alpha` | **Free beta** |
| `PrivateTeaserClient` kicker | floors `gateEyebrow` → Alpha | **Free beta** |
| Waitlist title / submit | Get notified / Notify me | keep |
| Access submit | Enter with code | keep |
| `gatedWwwHonesty.test.ts` `BANNED` | includes `free beta` | ban invite-only / get an invite / we’re live — **not** Free beta |
| `gateLocales` overlays IT/RU/JA/KO/ZH/TH/VI/HI/ID/AR | invite-only / “by invitation” eyebrows | free-beta equivalents |
| ES/PT/DE waitlist | “ask for an invitation” | notify equivalents |
| Cinematic HUD `defaultValue` | `Alpha` | **Free beta** (gated mode only) |
| `05-exquisite.html` HUD ghosts | `Alpha` | **Free beta** (copy pack; no scene restyle) |
| MarketingNav while gate on | always **Start free** → `/welcome` | **Enter with code** → `/private` |
| Welcome while gate on | no Free beta framing | Free beta kicker + Train→Coach teaser |
| `sites/www` CLOSE.body | “Access is invite-only while Alpha is gated.” | free-beta / Enter with code / Get notified |
| Athlete nav (`navOpenBeta` / `AppHeader`) | **Alpha** | **leave Alpha** (H03 / `.883` — different surface) |

Not these (do not “fix”):

- Athlete launch chrome stays **Alpha** (`alphaNavHonesty.test.ts`). Mute-pay flag stays `isFreeBeta()`.
- Four-scene SET → ANYWHERE → WEEK → DOOR structure. No Today / Train restyle.
- `.699` why-line. Counsel-hold #505 #519 #536.
- `PRIVATE_MODE` / Public GitHub / production promote / SOCIAL_LAUNCH rewrite.
- Email templates (`scripts/send-beta-invite.ts`) — operator mail, not the public door.

### Ship (founder pack — only this)

1. `GATED_WWW_HONESTY` is the founder pack: eyebrow **Free**, public line **Log a set. Offline.**, support **No account. No wearable.**, waitlist **Get notified**, Welcome kicker **Free · About two minutes**, marketing CTA **Enter with code**. Forbidden list is closed and now includes **free beta**, **open alpha**, and **Train Anywhere. Win Daily.**
2. Floor the same strings in `gateEn.ts` so first paint cannot disagree. `PrivateTeaserClient` + `GatePendingChrome` read those floors. One support paragraph (no duplicate teaser).
3. Locale overlays inherit EN public line + support. Eyebrows are Free equivalents — no beta. Packs that said `Free beta` become `Free`.
4. Gated teaser chrome only: Cinematic HUD + `05-exquisite.html` ghosts **Free**; cover kicker is not TAWD. MarketingNav / Welcome when `isClientPrivateGateEnabled()`. Post-unlock / post-flip CTAs stay **Start free**.
5. `sites/www` CLOSE.body is Free / Enter with code / Get notified. Comment on `INVITE_URL` may say the door is `/private`.
6. Help: `/private` is **Free / Enter with code / Get notified**, not “Invite gate” or “Free beta”.
7. Do not rewrite `docs/design/WWW_NIGHT.md` or `docs/brand-guidelines.md` — sibling `.933`.

### Tests

- `gatedWwwHonesty.test.ts`: EN pack is Free / Get notified / Enter with code plus public line + support. Door surfaces do not carry Free beta / invite-only / open alpha / TAWD / we’re live. Mutant `gateEyebrow: 'Free beta'` dies. Do not scan athlete chrome for open alpha.
- `exquisiteComp.test.ts`: HUD pack is **Free**, not `>Alpha<` or `>Free beta<`. No TAWD on the cover.
- Keep `alphaNavHonesty.test.ts` green — athlete badge stays Alpha.
- `check-build-label` `.938`. LOG + CONTEXT in the same implement commit.

### Docs / ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.938` (past `#774` / `.934`; skip `#778` `.935` · `#777` `.936` · `#779` `.937`)
- LOG heading `## 2026-08-24 — F-008 gated www honesty (\`.938\`)` + rotate oldest live entry
- CONTEXT `## Now` one `.938` bullet; rotate oldest shipped version bullet (`.919`); keep Status table; ≤25 bullets
- `src/lib/INDEX.md` lists `gatedWwwHonesty.ts`
- Commit trailer: `Excellence-Override: F-008 gated www honesty`
- Every commit: `[skip vercel]`. PR title tells humans this is reserved **F-008 / old .698 honesty**. PR body writes: “This is the .698 concern (F-008 honesty). Build number is .931 because master is .930.”

### Hard bans

- No `PRIVATE_MODE` / promote / EIN / secrets / Public GitHub flip
- No invented traction / “we’re live”
- Do not steal `.698` as the build number or `.699` why-line
- Do not touch #505 #519 #536
- Do not add a feed, DMs, Top 8, or invite-only language
- Do not restyle Today / Train / the four-scene thesis
- Do not rewrite athlete nav from Alpha to Free beta
- Do not gate the free logger

---

## Frozen plan — `.765` Preview walk P0s (consent dock + landing notify) (2026-08-13)

> **Frozen.** Implement only this section. Plan commit is `[skip vercel]`.
> Brief reserved `2026.07-unified.750` — **occupied** (session history).
> First land was `.755` — **occupied** on master (unilateral L/R).
> This ship lands as `2026.07-unified.765` past master `.764`.
> Do not steal `.697`–`.730` or `.750`–`.764`.
> Draft PR. **Preview will not deploy** (`[skip vercel]` on every commit).
> Excellence-Override: preview walk P0s (consent dock + landing notify).
> No `PRIVATE_MODE` flip. No promote. No Stripe. No invented traction.
> Do not touch #505 #519 #536. Do not redo F-039 `/train` `/today` aliases.

Walk: mission-ops #19 — local `VERCEL_ENV=preview` of `.728` / `cursor/eday-ungated-preview-8e4f` (live Preview is Vercel SSO). Two P0s on the ungated code path.

### Investigate (done — hypothesis holds)

| P0 | Walk claim | Verified on master `.754` |
|----|------------|---------------------------|
| **1** | Consent banner `fixed bottom-0 z-[60]` covers Today's first-set CTA on phones | **Yes.** `AnalyticsConsentBanner` is `fixed bottom-0 inset-x-0 z-[60]` in `I18nPwaProvider` (outside the AppLayout flex column). `ScreenDock` + `MobileNav` are flex siblings that reserve height; a fixed overlay sits on top of both. Playwright: `role="dialog"` intercepts pointer events. Latent unless `NEXT_PUBLIC_POSTHOG_KEY` is set (assume preview/prod). Tablet/desktop escape: `ScreenDock` renders in-flow at `md+`, so Start is in the scroll, not under the bar. |
| **2** | “SUPER BUNDLE: GET NOTIFIED UNTIL STRIPE” has no form | **Yes.** The only notify form is `PrivateTeaserClient.handleWaitlist` → `submitLead` (`source: 'launch-waitlist'`). Ungating makes `hasServerPrivateAccess()` true, so `/private` **always redirects**. `UnlockButton` returns `null` while `isFreeBeta()` (default ON). Landing has **zero** email/notify controls. `/bundle` 307s to `/log` during free-beta. Zero fake checkout — keep that. |

Not these (do not “fix”):

- Cold `/active` → `/welcome` is **JourneyGuard**, not `PRIVATE_MODE`. First-set path stays I-Day → `/log` → Start → Log set.
- F-017: no `SignInPrompt` under the logger; `TAP_BUDGET` stays **4**.
- Geo-block law holds. No country picker that lets blocked ISOs through.
- Logger stays reachable in blocked territories (offline logger ≠ hosted service).

### Ship (only this)

#### P0-1 — Today Start stays tappable under the consent banner

Do **not** remove consent. Do **not** raise `TAP_BUDGET`. Do **not** put chat on Today.

1. Add a reserved flex host in `AppLayout` **between** `#screen-dock` and `MobileNav` (`CONSENT_BANNER_HOST_ID`, `shrink-0 empty:hidden`). Same contract as `ScreenDock`: a flex sibling reserves height; `main` shrinks.
2. `AnalyticsConsentBanner` **portals into that host** when it exists. The docked banner is **in-flow, not `fixed`**. Keep `role="dialog"`, both choices, `shouldShowAnalyticsBanner` (key + undecided + no DNT).
3. Fallback (no host — landing / marketing, no AppLayout): render **in document flow after children**, never `fixed bottom-0`. Marketing has no docked Start.
4. Order on a phone:

```
[main]
[ScreenDock — Today's Start / rest dock]
[consent banner — reserved]
[MobileNav]
```

Start stays above the banner. Tab bar stays below it. Rest-timer dock stays clear.

5. Test hook: `?mw_force_consent=1` shows the real banner when preference is unset (e2e / QA without a PostHog key). Do not persist a fake choice. Do not init PostHog from the hook alone.

#### P0-2 — Real Get-notified on the public landing

Do **not** flip `PRIVATE_MODE`. Do **not** charge. Do **not** invent waitlist traction numbers. Do **not** open checkout. Do **not** claim Stripe is live. Do **not** change `/bundle`'s free-beta 307 (mute stays). Do **not** un-null `UnlockButton` during free-beta (that is checkout).

1. Extract the existing `/private` waitlist (`submitLead` + `{ ok }` handling — never a dead try/catch) into `src/components/public/LaunchNotifyForm.tsx`. Same `/api/leads` path. Source `landing-super-bundle-notify` on landing; keep `launch-waitlist` on `/private`.
2. Mount the form on `LandingPage` as a **quiet band** (after free core / before FAQ, or after FAQ before the poster close). Honest copy: Super Bundle checkout is **not** open; leave an email; we will not charge. **Not** `.primary-action` — `first-90` keeps **exactly two** red actions on `/` (hero + poster close).
3. `PrivateTeaserClient` uses the shared form so gated prod still captures leads.
4. No Stripe, no Payment Link, no `grantPremiumDemo` on this control, no “X people waiting”.

### Tests

- **Consent layout (unit / source):** banner never uses `fixed bottom-0` (docked or fallback). `AppLayout` has the consent host between `#screen-dock` and `MobileNav`. `I18nPwaProvider` still mounts the banner. Mutant restoring `fixed bottom-0 z-[60]` dies.
- **Consent click (Playwright, phone 390×844):** `?mw_force_consent=1`, banner `role="dialog"` visible, Today's `.primary-action` / Start is the `elementFromPoint` at its center and **clicks** (not intercepted). Do not add a tap to `first-90`. Do not raise `TAP_BUDGET`.
- **Notify form (unit / source):** `LandingPage` mounts `LaunchNotifyForm`; email + submit; `submitLead`; no checkout URL / no `/bundle` href on the form. `first-90` still counts 2 `.primary-action` on `/`. `PrivateTeaserClient` still uses the shared form. Mutant deleting the landing mount dies.
- **Notify form (Playwright or unit):** fill email, submit path does not navigate to Stripe / checkout. No traction numerals in copy.
- Geo-block / JourneyGuard / F-017 / `TAP_BUDGET` 4 — no edits that weaken them.
- `check-build-label` `.765`. LOG + CONTEXT in the same implement commit.

### Docs / ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.765`
- LOG heading `## 2026-08-13 — Preview walk P0s: consent dock + landing notify (\`.765\`)` + rotate oldest live entry
- CONTEXT `## Now` one `.765` bullet; rotate oldest shipped version bullet (`.750`); keep Status table; ≤25 bullets
- Help: one line — Super Bundle checkout is not live; get notified on the landing page (no charge)
- INDEX: `src/components/layout/INDEX.md` (host); `src/components/` if the public form is listed; `src/lib/INDEX.md` only if a new helper lands there
- i18n: reuse `gateWaitlist*` for form chrome; add landing-specific title/body keys; `npm run i18n:fill` + parity
- Commit trailer: `Excellence-Override: preview walk P0s (consent dock + landing notify)`
- Every commit: `[skip vercel]`. PR body cites mission-ops #19 and says Preview will not deploy.

### Hard bans

- No `PRIVATE_MODE` / promote / EIN / secrets
- No Stripe / fake checkout / invented traction
- Do not steal `.697`–`.730` or `.750`–`.754`
- Do not touch #505 #519 #536
- Do not redo F-039 `/train` `/today` aliases
- Do not raise `TAP_BUDGET`
- Do not put chat on Today
- Do not remove consent
- Do not weaken geo-block or add a country picker that lets blocked ISOs through
- Do not gate the free logger
- Do not change `/bundle` free-beta redirect or un-null `UnlockButton` in free-beta

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

set-table gap: athletes expect **A1/A2 pair marks**, **exactly two consecutive** exercises, **A then B then rest**, and **the set row stays** (one table — not a second set-table card stack). Current `SS A` is the wrong mark; `toggle` can merge into 3+ giant sets; `unlink` clears only one exercise (orphan peer); no persist / log-order store tests; the set table itself does not show the pair.

### Ship (only this)

1. **Reuse `supersetGroup`.** Add pure helpers in `superset.ts` (no second id):
   - `pairMark(exercises, exIdx)` → `A1`/`A2`/`B1`… — groups ordered by first index; slot 1 = earlier exercise, slot 2 = later. Replace `supersetLabel` output (keep the export as an alias of `pairMark` so existing callers stay).
   - `pairWithNext(exercises, exIdx)` — pair **exactly two consecutive**. New shared id on those two only; any prior partner of either is cleared (no giant sets).
   - `unpair(exercises, exIdx)` — clear `supersetGroup` on **all peers** of that group.
2. **Store wiring only** (`workoutStore.ts`): `toggleSupersetWithNext` / `unlinkSuperset` call the pure helpers. `removeExerciseFromActive` unpairs the remaining peer so a delete cannot leave an orphan. Do not change `logSet` / `logSetAndAdvance` / rest timer / repeat-last / notes.
3. **Table first paint.** Keep `SetLogTable` / `SetLogRow` as the set list. Surface the pair mark on the existing Set cell (`A1`/`A2` prefix + set number) and the existing header badge. `data-pair-mark` on the card/table for tests. Paper, ink, one red, Archivo, radius 0 — no new card chrome, no the set-table logger card clone, no second table.
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
| **a metric-quiet health app** | Dark premium UI, metric-first dashboard (Readiness / Strain / Recovery) |
| **a bodyweight coach app** | Freemium core, Coach, Super Bundle, streaks, challenges, pillar structure |
| **CrossFit app** | WOD logging, timers, daily workout rotation, benchmark culture |
| **Muscle & Fitness / Bodybuilding.com** | Exercise library depth, filters, programs, education tone |

Mission Winning is **none of these** — one unified super app, free core forever, global PWA.

---

## Freeze — Repeat last session from the log (`.717`) — 2026-08-13

> **Frozen.** Implement only this block. Do not expand. Label `2026.07-unified.717`
> (occupied `.698`–`.716`). Draft PR. One Preview max. `[skip vercel]` on the
> plan commit only.

set-table migrants live on **repeat last session**. History already has
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
| 3 | **set-table migrants: logging speed *and* CSV data-in are separate P1s** | The importer existed and was unreachable. I-Day and the empty logger link `/account#import`; the fragment opens the `<details>` it targets. Speed is not touched here — `.694` owns it |

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
