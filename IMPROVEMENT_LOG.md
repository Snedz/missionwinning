# Improvement log — Kaizen Night (no new Pump screenshots)

Session branch: `cursor/kaizen-wedge-night-be9b`  
Started: 2026-08-03 · Web craft only · Modernist system stands  
Reference: prior Pump D7–D13 + gym-speed `.285`–`.293` (no new Pump screenshots)
PR: #234

## Contract

- Steal Pump *structure/behavior* already documented; never chrome.
- Horizon W craft window; refuse new pillars / Habits / landing redesign / pause-restart.
- Commit frequently; ship protocol on each web ship.

## Loop 1 waves

| Wave | Status | Notes |
|------|--------|-------|
| K0 Bootstrap | done | Branch + living log |
| K1 Today composure | done (`.294`) | dashboard 22→32; budget 7→6 |
| K2 Fuel photo honesty | done (`.294`) | heuristic ≤ medium; DB → `api` |
| K3 Seeded a11y | done (`.295`) | History + Coach green; anatomy a11y |
| K4 Zero-state caps | done (`.295`) | `/builder` 1, `/profile` 1 |
| K5 Active decomp | done (`.295`) | `rankSwapCandidates` |
| K6 i18n ratchet | done (`.295`) | Cap 685→680 |

## Loop 2 waves

| Wave | Status | Notes |
|------|--------|-------|
| L1 Victory + CheckIn i18n | done (`.296`) | ~33 keys; toast leak fixed; cap **680→647** |
| L2 buildConsoleSet extract | done (`.297`) | + `planApplyTargets`; wiring guards |
| L3 Fuel NL + mealDraft | done (`.298`) | tsp/ml/plate; `api`→database guard |
| L4 i18n batches | done (`.299`) | Active/Fuel/Today; cap **647→566** |
| L5 fillers | done (`.300`) | track/mind 1; Victory a11y; soft chrome |

## Standing refuses

- Pause / restart / week numbers · Fixed vs Flexible · glow FAB · Habits/community
- In-app inbox · LOG scrape · landing redesign · Bundle UI · native · `PRIVATE_MODE`
- D14 without new Pump screenshots (parked if they arrive)

## Decisions / findings

- **K1:** Densest evening room=4 → session/week/day-review/intent; Mission Score in More.
- **K2:** Filename+palette must not claim `high`; DB tap must not reset to heuristic via useEffect.
- **K3:** `adaptPlan` drops all `missed` when any `planned` remains — seed needs done + overflow misses. Dynamic `import()` of seed helper fails under Playwright CJS.
- **K3 anatomy:** `role=img` on SVG wrapping `<a>` = nested-interactive; figcaption labels Front/Back.
- **K4:** Cap ratchet under-cap failure forced `/profile` to 1 (Continue absent when onboarded).
- **K5:** Swap sort extracted; wiring guard asserts Active no longer inlines muscle-share sort.
- **K6:** Five LogConsole aria/step keys into `activeWorkoutLocales` EN (other langs inherit via `...en`).
- **L1:** Coverage only counts `t('singleQuotes')`; pack Victory/CheckIn + finish toast desc.
- **L2:** Console IIFE + Apply-targets decisions are one definition each; page must not re-import `buildOverloadCue`.
- **L3:** 3 tsp ≈ 1 tbsp on shared 0.5-serving scale; bare “tsp/ml/plate” stays rough.
- **L4:** zh/id/th/ar Today packs are full objects (not `...en`) — inherit new keys via `en.*` refs.
- **L5:** `/track` reds were Log Activity + GPS Start + body Log; `/mind` was Breath Start + Check-In Save.

## Metrics

| Metric | Loop 1 start | Loop 1 end | Loop 2 end |
|--------|--------------|------------|------------|
| Build | `.293` | `.295` | `.300` |
| i18n uncovered cap | 685 | 680 | **566** |
| Zero-state `/builder` | 3 | 1 | 1 |
| Zero-state `/profile` | 4 | 1 | 1 |
| Zero-state `/track` | 3 | 3 | **1** |
| Zero-state `/mind` | 2 | 2 | **1** |
| Today max top-level | 7 | 6 | 6 |

## End of Loop 2

**Delivered:** L1–L5 on `cursor/kaizen-wedge-night-be9b` → PR #234 (`.296`–`.300`).
**Verified:** unit helpers; `i18n:coverage` @566; zero-state `/track`+`/mind`; Victory a11y axe.
**Aikido:** `aikido_full_scan` failed again — `Cannot autolaunch D-Bus without X11 $DISPLAY`. Noted; continue.
**Next:** Pump screenshot batch → D14; founder phone excellence; visual baseline bootstrap.

## Loop 3 waves

| Wave | Status | Notes |
|------|--------|-------|
| M1 Coach/History i18n | done (`.301`) | Adjust/chat/today + History + Active set/jot; cap **566→515** |
| M2 Debrief reply ids | done (`.302`) | Stable `harder`/`exact`/`easy` + SessionDebriefCard i18n |
| M3 resolveActiveSetDial | done (`.303`) | Freestyle carry + suggestion + prescription; wiring guard |
| M4 Soft chrome + Fuel search | done (`.304`) | Coach/Active solid chrome; search/describe/estimate pack; **515→489** |
| M5 Move zero-state + a11y | done (`.305`) | `/move` **1→0**; Move+assess i18n; TimedFlowRunner seeded axe; **489→473** |

## Metrics

| Metric | Loop 2 end | Loop 3 end |
|--------|------------|------------|
| Build | `.300` | **`.305`** |
| i18n uncovered cap | 566 | **473** |
| Zero-state `/move` | 1 | **0** |
| Zero-state `/track` | 1 | 1 |
| Zero-state `/mind` | 1 | 1 |

## End of Loop 3

**Delivered:** M1–M5 on `cursor/kaizen-wedge-night-be9b` → PR #234 (`.301`–`.305`).
**Verified:** i18n @473; zero-state `/move` 0; ship-protocol guards green.
**Aikido:** `aikido_full_scan` still fails without X11 `$DISPLAY`. Noted; continue.
**Next:** Loop 4 — more Fuel/Today/Mind i18n batches, Active decomp leftovers, soft-chrome residue, seeded a11y.

## Loop 4 plan (execute immediately)

| Wave | Ship | Scope |
|------|------|-------|
| N1 | `.306` | Mind check-in / breathing i18n batch → lower cap |
| N2 | `.307` | Fuel adapt/targets/weight leftovers i18n |
| N3 | `.308` | Active helper extract (overload cue / rest dock decision) or soft-chrome residue |
| N4 | `.309` | Today/pillars i18n batch |
| N5 | `.310` | Seeded a11y (Fuel sheet open or Mind check-in) + living-log close |

## Loop 4 waves

| Wave | Status | Notes |
|------|--------|-------|
| N1 Mind i18n | done (`.306`) | Check-in / breathing / page; cap **473→447** |
| N2 Fuel leftovers | done (`.307`) | Adapt/targets/weight/recipes/toasts; **447→381** |
| N3 Repeat-last + chrome | done (`.308`) | `resolveRepeatLastTarget`; solid onInk/outline/footer |
| N4 Today/Behavior i18n | done (`.309`) | BehaviorStrip / DayReview / freshness / reentry; **381→332** |
| N5 Fuel sheet a11y | done (`.310`) | Seeded axe on FuelLogSheet open |

## Metrics

| Metric | Loop 3 end | Loop 4 end |
|--------|------------|------------|
| Build | `.305` | **`.310`** |
| i18n uncovered cap | 473 | **332** |
| Zero-state `/move` | 0 | 0 |

## End of Loop 4

**Delivered:** N1–N5 on `cursor/kaizen-wedge-night-be9b` → PR #234 (`.306`–`.310`).
**Verified:** i18n @332; unit helpers for repeat-last; ship-protocol guards green.
**Aikido:** `aikido_full_scan` still fails without X11 `$DISPLAY`. Noted; continue.
**Next:** Pump screenshot batch → D14; founder phone excellence; visual baseline bootstrap; more profile/track i18n if craft continues.

## Loop 5 waves

| Wave | Status | Notes |
|------|--------|-------|
| O1 Track/reminders i18n | done (`.311`) | Body metrics + progress photos + reminders; **332→299** |
| O2 Profile + soft chrome | done (`.312`) | Backup/account pack; FileUpload/Today/nav solid chrome; **299→274** |
| O3 Living-log close | done (docs) | Loop 5 recorded; craft window continues if agents resume |

## Metrics

| Metric | Loop 4 end | Loop 5 end |
|--------|------------|------------|
| Build | `.310` | **`.312`** |
| i18n uncovered cap | 332 | **274** |

## End of Loop 5

**Delivered:** O1–O2 on `cursor/kaizen-wedge-night-be9b` → PR #234 (`.311`–`.312`).
**Verified:** i18n @274; ship-protocol guards green.
**Aikido:** `aikido_full_scan` still fails without X11 `$DISPLAY`. Noted; continue.
**Next:** Pump screenshot batch → D14; founder phone excellence; visual baseline bootstrap.

## Loop 6 waves

| Wave | Status | Notes |
|------|--------|-------|
| P1 Profile privacy/CSV | done (`.313`) | Privacy/premium/CSV/sync; **274→235** |
| P2 History journal/anatomy | done (`.314`) | Journal + anatomy keys; **235→220** |
| P3 GuidedStepPlayer | done (`.315`) | Move/Mind runner chrome; **220→209** |
| P4 Track import | done (`.316`) | ActivityImportPanel keys; **209→193** |
| P5 Journal seeded a11y | done (`.317`) | Journal edit chrome + Loop 6 living-log close |

## Metrics

| Metric | Loop 5 end | Loop 6 end |
|--------|------------|------------|
| Build | `.312` | **`.317`** |
| i18n uncovered cap | 274 | **193** |

## End of Loop 6

**Delivered:** P1–P5 on `cursor/kaizen-wedge-night-be9b` → PR #234 (`.313`–`.317`).
**Verified:** i18n @193; journal edit a11y axe green (`localhost` — `127.0.0.1` blocked by Next `allowedDevOrigins` in this VM).
**Aikido:** `aikido_full_scan` still fails without X11 `$DISPLAY`. Noted; continue.
**Next:** Loop 7 — profile wearables/owner leftovers, library/builder/session HR i18n, soft chrome, Active extracts.

## Loop 7 waves

| Wave | Status | Notes |
|------|--------|-------|
| Q1 Profile wearables | done (`.318`) | Wearables connect/sync pack; **193→176** |
| Q2 Library filters | done (`.319`) | Filters/details leftovers; **176→162** |
| Q3 Builder/templates | done (`.320`) | Start/arrange/finish + templates + `retry`; **162→141** |
| Q4 LiveHeartRate | done (`.321`) | Connect/idle/hint pack; **141→134** |
| Q5 Library filters a11y | done (`.322`) | Seeded axe on Filters dialog; Loop 7 living-log close |

## Metrics

| Metric | Loop 6 end | Loop 7 end |
|--------|------------|------------|
| Build | `.317` | **`.322`** |
| i18n uncovered cap | 193 | **134** |

## End of Loop 7

**Delivered:** Q1–Q5 on `cursor/kaizen-wedge-night-be9b` → PR #234 (`.318`–`.322`).
**Verified:** i18n @134; Library Filters a11y axe green (`localhost`).
**Aikido:** `aikido_full_scan` still fails without X11 `$DISPLAY`. Noted; continue.
**Next:** Loop 8 — Coaching/Leaderboard/Welcome/FileUpload leftovers, ProfileOwnerTools, soft chrome, Active extracts; Bundle UI still refused (free-first).

## Loop 8 waves

| Wave | Status | Notes |
|------|--------|-------|
| R1 Coaching form | done (`.323`) | Interest-list leftovers; **134→121** |
| R2 Leaderboard | done (`.324`) | Empty/error chrome; **121→112** |
| R3–R4 Welcome/upload/owner | done (`.325`) | Session-ready + FileUpload + OwnerTools; **112→92** |
| R5 Builder blank a11y | done (`.326`) | Seeded axe after Blank workout; Loop 8 living-log close |

## Metrics

| Metric | Loop 7 end | Loop 8 end |
|--------|------------|------------|
| Build | `.322` | **`.326`** |
| i18n uncovered cap | 134 | **92** |

## End of Loop 8

**Delivered:** R1–R5 on `cursor/kaizen-wedge-night-be9b` → PR #234 (`.323`–`.326`).
**Verified:** i18n @92; Builder blank-draft a11y axe green (`localhost`).
**Aikido:** `aikido_full_scan` still fails without X11 `$DISPLAY`. Noted; continue.
**Next:** Loop 9 — Learn/CourseReader, AnalyticsConsent, CoachAdaptDemo leftovers; soft chrome; Active extracts. Bundle UI still refused.

## Loop 9 waves

| Wave | Status | Notes |
|------|--------|-------|
| S1–S2 Learn/consent/demo | done (`.327`) | Learn/CourseReader + AnalyticsConsent + CoachAdaptDemo; **92→69** |
| S3 Soft chrome | done (`.328`) | FileUpload/History/WeekStrip/Move/Today/Builder solid borders |
| S4 Active dock extract | done (`.329`) | `resolveActiveDockMode` + wiring guard |
| S5 Learn no-match a11y | done (`.330`) | Seeded axe on empty search; Loop 9 living-log close |

## Metrics

| Metric | Loop 8 end | Loop 9 end |
|--------|------------|------------|
| Build | `.326` | **`.330`** |
| i18n uncovered cap | 92 | **69** |

## End of Loop 9

**Delivered:** S1–S5 on `cursor/kaizen-wedge-night-be9b` → PR #234 (`.327`–`.330`).
**Verified:** i18n @69; dock helper unit tests; Learn no-match a11y axe green (`localhost`).
**Aikido:** `aikido_full_scan` still fails without X11 `$DISPLAY`. Noted; continue.
**Next:** Loop 10 — remaining uncovered batches (Bundle refused); soft chrome leftovers; more Active extracts; seeded a11y.

## Loop 10 waves

| Wave | Status | Notes |
|------|--------|-------|
| T1–T3 Programs/Learn/Library/Builder/Coach | done (`.331`) | Pack leftovers; Bundle refused; **69→44** |
| T4 Form-guide + chrome | done (`.332`) | `resolveFormGuideSheet`; SignIn/DangerZone/Intent solid |
| T5 Library detail a11y | done (`.333`) | Seeded axe on detail sheet; Loop 10 living-log close |

## Metrics

| Metric | Loop 9 end | Loop 10 end |
|--------|------------|------------|
| Build | `.330` | **`.333`** |
| i18n uncovered cap | 69 | **44** |

## End of Loop 10

**Delivered:** T1–T5 on `cursor/kaizen-wedge-night-be9b` → PR #234 (`.331`–`.333`).
**Verified:** i18n @44; form-guide helper unit tests; Library detail a11y axe green (`localhost`).
**Aikido:** `aikido_full_scan` still fails without X11 `$DISPLAY`. Noted; continue.
**Next:** Loop 11 — Compare/Benchmarks/About/offline/landing leftovers (Bundle refused); soft chrome; Active extracts; seeded a11y.

## Loop 11 waves

| Wave | Status | Notes |
|------|--------|-------|
| U1–U2 Compare/Benchmarks/nav leftovers | done (`.334`) | About/landing/offline/pacer/misc; Bundle refused; **44→16** |
| U3–U4 Soft chrome + volume-trim | done (`.335`) | Intent/Move/Ceremony/Unlock solid; `shouldOfferVolumeTrim` |
| U5 Benchmarks anatomy a11y | done (`.336`) | Seeded weighted history; Select name + Table keyboard scroll fixes |

## Metrics

| Metric | Loop 10 end | Loop 11 end |
|--------|-------------|-------------|
| Build | `.333` | **`.336`** |
| i18n uncovered cap | 44 | **16** (Bundle-only refuse) |

## End of Loop 11

**Delivered:** U1–U5 on `cursor/kaizen-wedge-night-be9b` → PR #234 (`.334`–`.336`).
**Verified:** i18n @16 Bundle-only; volume-trim helper unit tests; Benchmarks anatomy a11y axe green (`localhost`) after Select `aria-label` + Table `tabIndex`.
**Aikido:** `aikido_full_scan` still fails without X11 `$DISPLAY`. Noted; continue.
**Next:** Loop 12 — soft chrome leftovers (toast destructive, BetaAdmin, secondary/20 cards); more Active extracts; offline-banner / coaching-form seeded a11y; Bundle i18n still refused.

## Loop 12 waves

| Wave | Status | Notes |
|------|--------|-------|
| V1 Soft chrome leftovers | done (`.337`) | Toast/BetaAdmin/Benchmarks/Guide/Calc/Builder/Phantom solid |
| V2 Active body-score deltas extract | done (`.338`) | `bodyScoreDeltas` + wiring guard |
| V3 Offline banner seeded a11y + log close | done (`.339`) | Seeded axe on OnlineStatusBanner; Loop 12 living-log close |

## Metrics

| Metric | Loop 11 end | Loop 12 end |
|--------|-------------|-------------|
| Build | `.336` | **`.339`** |
| i18n uncovered cap | 16 (Bundle refuse) | **16** (unchanged) |

## End of Loop 12

**Delivered:** V1–V3 on `cursor/kaizen-wedge-night-be9b` → PR #234 (`.337`–`.339`).
**Verified:** design-system green; bodyScoreDeltas unit + wiring; offline banner a11y axe green (`localhost`).
**Aikido:** `aikido_full_scan` still fails without X11 `$DISPLAY` when that path is used. Noted; continue.
**Next:** Loop 13 — coaching-form filled a11y; more Active extracts; residual soft chrome in ui primitives where design gate allows; Bundle i18n still refused.

## Loop 13 waves

| Wave | Status | Notes |
|------|--------|-------|
| W1 Coaching filled-form a11y | done (`.340`) | Route was outside GATED_ROUTES; filled lead form axe green |
| W2 Active extract | done (`.341`) | `resolveSwapCandidatesWhenOpen` + wiring guard |
| W3 Soft chrome / log close | done (`.342`) | text-foreground/90 → solid; table muted solid; Loop 13 close |

## Metrics

| Metric | Loop 12 end | Loop 13 end |
|--------|-------------|-------------|
| Build | `.339` | **`.342`** |
| i18n uncovered cap | 16 (Bundle refuse) | **16** (unchanged) |

## End of Loop 13

**Delivered:** W1–W3 on `cursor/kaizen-wedge-night-be9b` → PR #234 (`.340`–`.342`).
**Verified:** coaching filled-form a11y green; swap-when-open unit + wiring; design-system green.
**Aikido:** `aikido_full_scan` fails without X11 `$DISPLAY`. Noted; continue.
**Next:** Loop 14 — more seeded a11y (Compare story / Programs filter); Active extracts; Bundle i18n still refused.

## Loop 14 waves

| Wave | Status | Notes |
|------|--------|-------|
| X1 Programs no-match a11y | done (`.343`) | Hypertrophy × Bodyweight EmptyState axe green |
| X2 Active extract | done (`.344`) | `activeSessionBottomClass` + `shouldShowReadinessDelta` |
| X3 Soft chrome / log close | done (`.345`) | status-warn solid; sticky/SignIn solid; Loop 14 close |

## Metrics

| Metric | Loop 13 end | Loop 14 end |
|--------|-------------|-------------|
| Build | `.342` | **`.345`** |
| i18n uncovered cap | 16 (Bundle refuse) | **16** (unchanged) |

## End of Loop 14

**Delivered:** X1–X3 on `cursor/kaizen-wedge-night-be9b` → PR #234 (`.343`–`.345`).
**Verified:** Programs no-match a11y green; pad/readiness-delta unit + wiring; design-system green.
**Aikido:** `aikido_full_scan` fails without X11 `$DISPLAY`. Noted; continue.
**Next:** Loop 15 — Compare story / Mind / Track seeded a11y; more Active extracts; Bundle i18n still refused.

## Loop 15 waves

| Wave | Status | Notes |
|------|--------|-------|
| Y1 Mind breathing-timer a11y | done (`.346`) | Box pattern Start → running chrome axe green |
| Y2 Active extract | done (`.347`) | `shouldShowVolumeTrimOffer` + wiring guard |
| Y3 Soft chrome / log close | pending | |

