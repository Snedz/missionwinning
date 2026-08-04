# Improvement log — Kaizen Night (Horizon W, no Pump)

Session branch: `cursor/kaizen-night-be9b`  
Started: 2026-08-04 · Web craft only · Modernist system stands  
Base: `master` @ `2026.07-unified.417`  
Tip: `2026.07-unified.423` · PR #254  
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
| P1 | ActiveExerciseCard decomp | done (`.418`) |
| P2 | Today candidate builder | done (`.419`) |
| P3 | Fuel estimate accuracy | done (`.420`, deepen `.423`) |
| P4 | Coach manage/adjust/schedule axe | done (`.421`) |
| P5 | Victory one-exit slim | done (`.422`) |
| P6 | Soft chrome / fillers | done (`.423`) |

## Standing refuses

Pause/restart · week numbers · Fixed vs Flexible · glow FAB · Habits/community · in-app inbox · LOG scrape · landing redesign · Bundle UI · native · `PRIVATE_MODE` · America · inventing Pump D14.

## Metrics

| Metric | Night start | Tip |
|--------|-------------|-----|
| Build | `.417` | `.423` |
| i18n uncovered cap | 16 | **16** |
| ActiveExerciseCard LOC | 536 | **380** (−156) |
| HomeTodayDashboard LOC | 785 | **714** (−71) |
| ActiveWorkoutPage LOC | 765 | 765 (untouched this night) |
| WorkoutVictorySheet LOC | 387 | **376** (−11) |
| New axe cases | — | 3 (Coach manage / schedule / adjust) |
| Fuel unit cases added | — | fraction `.420` + mixed `.423` |

## Decisions / findings

- Active card fat was set menus + next-target predicates — extract to helpers + colocated menus (Loops 20–32 pattern), not page-local copies.
- Today budget SoT already existed; shell still assembled candidates in JSX — pure `buildTodayCandidates` keeps mount gates identical and locks densest-evening order.
- NL `1/2 cup` was the denominator trap; `1 1/2 cup` was the next sibling (trailing half match) — mixed numbers before fraction matchers.
- Victory already had one primary CTA; dual Share · Share card + page-local secondary Today predicate still competed — one Share + `shouldShowVictoryBackTodaySecondary`.
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

## Next (founder / later nights)

1. Phone excellence walk of Train → Today → Victory → Coach on tip `.423`.
2. Visual baseline bootstrap on Linux when founder ready (not this branch).
3. Pump D14 only when screenshots arrive — do not invent IA.
4. Further Fuel accuracy: vision grounding for honest `high` confidence.
5. More Active/Coach extracts only if they unlock a real test or shrink a hot path.
