# Improvement log — Kaizen Night (2026-08-05 full-launch)

Plan: `.hermes/plans/2026-08-05_kaizen-night-plan.md`  
**Tip:** `2026.07-unified.518` · PRs **#300–#320** on master · unit tests **1803** green  
Local gate authoritative (GitHub Actions often billing-blocked).

## Contract

Full-launch override · free logger never gated · no `PRIVATE_MODE` · small PRs · merge when local green.

## Shipped this night

| Build | PR | Summary |
|-------|-----|---------|
| `.507` | #300 | Lean Today rewards · milestone badges · More Leaderboard · CONTEXT override |
| `.508` | #301 | `americaHomeOrFallback` join/teacher/PFT |
| `.509` | #304 | Victory consume-once Strict Mode |
| `.510` | #305 | FREE_BETA Unlock + Bundle dual-mode pins |
| `.511` | #307 | Share text never parked `/america` |
| `.512` | #308 | still_mind + Coach from-logs pins |
| `.513` | #310 | EN rewards UI strings |
| `.514` | #312 | perfect_week spectrum pure + workout emit |
| `.515` | #314 | perfect_week fuel + pillar apply paths |
| `.516` | #316 | Challenge Done XP from catalog |
| `.517` | #318 | EN ranks + badge titles |
| `.518` | #320 | Re-entry shame-free copy guard |

## Metrics

| | Start | Now |
|--|-------|-----|
| Build | `.506` | **`.518`** |
| Tests | 1778 | **1803** |
| Merged PRs | 0 | **#300–#318** |

## Remaining

- Fat decomp (HomeTodayDashboard / History / Nutrition / Active)
- Outdoor one-thumb measured friction
- Android Accept B (founder)
- Ops: postal · migrations · invites · Actions billing · visual baseline Linux

## Refuses

`PRIVATE_MODE` · invent traction · gate free logger · America marketing w/o enable · iOS · wearables-as-score · coin wallet

---

# Improvement log — Kaizen Night (Horizon W, no Pump)

Session branch: `cursor/kaizen-night-be9b`  
Started: 2026-08-04 · Web craft only · Modernist system stands  
Base: `master` @ `2026.07-unified.417`  
Tip: `2026.07-unified.512` · PR #254 · **merged to master (night closed)**  
Prior night: #234 (`.294`–`.403`) + follow-on media/Learn through `.417`

## Contract

- Horizon W: Train / Today / Victory / Coach excellence + Fuel estimate accuracy.
- No Pump D14 (no screenshots). Steal only already-documented D7–D13 structure.
- Refuse: Bundle UI / Bundle i18n pack · `PRIVATE_MODE` · native · Habits · landing · pause/restart · glow FAB.
- Ship protocol each web ship; i18n uncovered cap stays **16**.

## Priority (from plan)

| # | Track | Status |
|---|--------|--------|
| P0 | Bootstrap | done |
| P1 | ActiveExerciseCard decomp | done (`.418`, deepen `.425`) |
| P2 | Today candidate builder | done (`.419`, trainReady `.426`) |
| P3 | Fuel estimate accuracy | done (`.420`, `.423`, `.424`) |
| P4 | Coach manage/adjust/schedule axe | done (`.421`) |
| P5 | Victory one-exit slim | done (`.422`) |
| P6 | Soft chrome / fillers | done (`.423`) |
| Cont. | Word-half · footer · trainReady | done (`.424`–`.426`) |

## Standing refuses

Pause/restart · week numbers · Fixed vs Flexible · glow FAB · Habits/community · in-app inbox · LOG scrape · landing redesign · Bundle UI · native · `PRIVATE_MODE` · America · inventing Pump D14.

## Metrics

| Metric | Night start | Tip |
|--------|-------------|-----|
| Build | `.417` | **`.454`** |
| i18n uncovered cap | 16 | **16** |
| ActiveExerciseCard LOC | 536 | **224** (−312) |
| HomeTodayDashboard LOC | 785 | **714** (−71) |
| ActiveWorkoutPage LOC | 765 | **632** (−133) |
| CoachPage LOC | 322 | **292** (−30) |
| WorkoutVictorySheet LOC | 387 | **264** (−123) |
| CoachChatPanel LOC | 492 | **281** (−211) |
| New axe cases | — | 3 (Coach manage / schedule / adjust) |
| Fuel unit cases added | — | fraction · mixed · word-half · quarter · thirds · unicode · couple · few · dab · pair · bare tbsp · dozen · some |

## Decisions / findings

- Active card fat was set menus + next-target predicates — extract to helpers + colocated menus (Loops 20–32 pattern), not page-local copies; footer peel continues the same pattern (`.425`).
- Today budget SoT already existed; shell still assembled candidates in JSX — pure `buildTodayCandidates` keeps mount gates identical and locks densest-evening order.
- NL `1/2 cup` was the denominator trap; `1 1/2 cup` was the next sibling (trailing half match); word `half` / `and a half` was GLOBAL_PORTION double-scale — remove `half` from plate adjectives.
- Victory already had one primary CTA; dual Share · Share card + page-local secondary Today predicate still competed — one Share + `shouldShowVictoryBackTodaySecondary`.
- Lean omitted commissioned in trainReady while dashboard included it — `isTodayTrainReady` one home (`.426`).
- MoreSheet Bundle kicker soft chrome ≠ Bundle deepen; solid `text-primary-foreground` only.
- Aikido MCP often fails (`Cannot autolaunch D-Bus without X11 $DISPLAY`) — note and continue when blocked.
- Playwright: use `localhost:3000` not `127.0.0.1` against tmux `next-dev-kaizen`.

## Loops

### Loop 0 — Bootstrap

| Wave | Status | Notes |
|------|--------|-------|
| K0 Branch + log + PR | done | `cursor/kaizen-night-be9b` · #254 |

### Loop 1 — ActiveExerciseCard (P1)

| Wave | Status | Notes |
|------|--------|-------|
| `.418` | done | `resolveExerciseNextTarget` + menu gates; MoreMenu / SetOptionsMenu; 536→380 |

### Loop 2 — Today builder (P2)

| Wave | Status | Notes |
|------|--------|-------|
| `.419` | done | `buildTodayCandidates` + tests; dashboard maps specs→nodes→`planTodayBlocks` |

### Loop 3 — Fuel accuracy (P3)

| Wave | Status | Notes |
|------|--------|-------|
| `.420` | done | Fraction qty `1/2 cup` — not 2× |

### Loop 4 — Coach axe (P4)

| Wave | Status | Notes |
|------|--------|-------|
| `.421` | done | Seeded open-state axe: manage / schedule / adjust (3/3 green) |

### Loop 5 — Victory one-exit (P5)

| Wave | Status | Notes |
|------|--------|-------|
| `.422` | done | Secondary Today helper + single Share; free ritual ungated |

### Loop 6 — Fillers (P6)

| Wave | Status | Notes |
|------|--------|-------|
| `.423` | done | MoreSheet solid Premium kicker + NL mixed `1 1/2 cup` |


### Loop 7 — Fuel word-half

| Wave | Status | Notes |
|------|--------|-------|
| `.424` | done | half a cup / and-a-half; half left GLOBAL_PORTION |

### Loop 8 — Active footer

| Wave | Status | Notes |
|------|--------|-------|
| `.425` | done | ActiveExerciseFooter + formatPrevSetLabels; card 380→343 |

### Loop 9 — Today trainReady

| Wave | Status | Notes |
|------|--------|-------|
| `.426` | done | isTodayTrainReady one-home lean+dashboard+primary |

### Loop 10 — Soft chrome ratchet

| Wave | Status | Notes |
|------|--------|-------|
| `.427` | done | Ban bare opacity-90/95; TrackWeeklyInsights solid |

### Loop 11 — Today More mount

| Wave | Status | Notes |
|------|--------|-------|
| `.428` | done | shouldAppendTodayMoreDetails one-home |

### Loop 12 — Victory feel strip

| Wave | Status | Notes |
|------|--------|-------|
| `.429` | done | VictoryFeelStrip + formatVictorySignedDelta; sheet →316 |

### Loop 13 — Today focus line

| Wave | Status | Notes |
|------|--------|-------|
| `.430` | done | buildTodayHeaderFocusLine show + bodyweight tag |

### Loop 14 — Active header

| Wave | Status | Notes |
|------|--------|-------|
| `.431` | done | ActiveExerciseHeader; card 343→224 |

### Loop 15 — Active readiness strip

| Wave | Status | Notes |
|------|--------|-------|
| `.432` | done | ActiveReadinessDeltaStrip; page 765→743 |

### Loop 16 — NL quarter

| Wave | Status | Notes |
|------|--------|-------|
| `.433` | done | quarter cup / quarter of a cup → 0.25× |

### Loop 17 — Active inline add

| Wave | Status | Notes |
|------|--------|-------|
| `.434` | done | ActiveInlineAddExercise; page →727 |

### Loop 18 — NL thirds

| Wave | Status | Notes |
|------|--------|-------|
| `.435` | done | third / two thirds cup → ⅓ / ⅔ |

### Loop 19 — NL unicode

| Wave | Status | Notes |
|------|--------|-------|
| `.436` | done | unicode ½/¾/1½ + residual word forms |

### Loop 20 — Coach chat peel

| Wave | Status | Notes |
|------|--------|-------|
| `.437` | done | FreeFormAsk + SoftTip; panel 492→399 |

### Loop 21 — NL ¼ + couple

| Wave | Status | Notes |
|------|--------|-------|
| `.438` | done | shared VULGAR_FRAC +¼; three-quarters hyphen; couple → 2 |

### Loop 22 — Active exercise list

| Wave | Status | Notes |
|------|--------|-------|
| `.439` | done | ActiveExerciseList peel; page →686; readiness wiring → strip |

### Loop 23 — Active session dock

| Wave | Status | Notes |
|------|--------|-------|
| `.440` | done | ActiveSessionDock peel; page →660; rest/console chrome |

### Loop 24 — NL few + dab

| Wave | Status | Notes |
|------|--------|-------|
| `.441` | done | few → 3; dash/splash/pinch → tsp dab scale |

### Loop 25 — Coach session grid

| Wave | Status | Notes |
|------|--------|-------|
| `.442` | done | CoachPlanSessionGrid + resolveCoachBossSessionId; page →292 |

### Loop 26 — NL pair / dab / bare tbsp

| Wave | Status | Notes |
|------|--------|-------|
| `.443` | done | pair → 2; dab/bit dab-scale; bare tablespoon → 0.5× |

### Loop 27 — Victory body delta

| Wave | Status | Notes |
|------|--------|-------|
| `.444` | done | VictoryBodyDeltaStrip; sheet →290 |

### Loop 28 — Coach chat client

| Wave | Status | Notes |
|------|--------|-------|
| `.445` | done | coachChatClient helpers; panel 399→349 |

### Loop 29 — NL dozen / some

| Wave | Status | Notes |
|------|--------|-------|
| `.446` | done | dozen → 12; half-dozen → 6; some → 3 |

### Loop 30 — Victory stats + next

| Wave | Status | Notes |
|------|--------|-------|
| `.447` | done | VictoryStatsStrip + VictoryNextActionStrip; sheet →264 |

### Loop 31 — Coach chat UI peel

| Wave | Status | Notes |
|------|--------|-------|
| `.448` | done | Transcript + Composer; panel 349→287 |

### Loop 32 — NL lots / bowl-of

| Wave | Status | Notes |
|------|--------|-------|
| `.449` | done | several/lots/double-portion/servings; bowl-of demotion |

### Loop 33 — Active sheets cluster

| Wave | Status | Notes |
|------|--------|-------|
| `.450` | done | ActiveWorkoutSheets overlay cluster; page →632 |

### Loop 34 — NL plenty / loads

| Wave | Status | Notes |
|------|--------|-------|
| `.451` | done | plenty/loads/heap/bunch/ton → 2; bananas plural |

### Loop 35 — Victory share helpers

| Wave | Status | Notes |
|------|--------|-------|
| `.452` | done | buildVictorySharePayload + file/text next; cancel stays done |

### Loop 36 — Coach stream reader

| Wave | Status | Notes |
|------|--------|-------|
| `.453` | done | readCoachChatStream + abort helper; panel →281 |

## Next (founder / later nights)

1. Phone excellence walk of Train → Today → Victory → Coach on tip `.453`.
2. Visual baseline bootstrap on Linux when founder ready (not this branch).
3. Pump D14 only when screenshots arrive — do not invent IA.
4. Further Fuel accuracy: vision grounding for honest `high` confidence.
5. More Active/Coach extracts only if they unlock a real test or shrink a hot path.
6. Soft-chrome ratchet: bare opacity-90/95 already banned (`.427`).

## Night close

`.454` typecheck green; founder **Merge and slash (A)** — merge #254 to master; Kaizen Night ends.
