# Improvement log — Pump Kaizen Night (D11–D13)

Session branch: `cursor/pump-kaizen-d11-d13-0dc6`  
Started: 2026-08-03 · Web craft only · Modernist system stands

## Contract

- Steal Pump *structure/behavior*; never chrome (dark mode, radius, glow FAB).
- Horizon W craft window; refuse new pillars / Habits tab / landing redesign / durable pause-restart.
- Commit frequently; ship protocol on each web ship.

## Waves

| Wave | Status | Notes |
|------|--------|-------|
| D11 History Exercises | done (branch) | 4th History tab; Trends first-class |
| D12 Coach program sheet | done (branch) | Schedule + one-red + manage sheet |
| D13 FAQ + What’s New | done (`.282`) | Exclusive-open FAQ; thin build-label sheet; First Steps show-again |

## Kaizen

| ID | Status | Notes |
|----|--------|-------|
| K1 Just Go honesty leftovers | done (branch) | Adapt re-entry no longer says Just Go on coach days |
| K2 fitness → default | done (branch) | Alias folded; chips use selected |
| K3–K5 Fuel + Today soft | done (`.281`) | NL cup/piece/handful/slice; Today 2px chrome; Fuel dual-red →1 |
| K6–K7 a11y + i18n | pending | |

## Refuses (standing)

- Pause / restart program / week numbers (no durable plan history)
- Fixed vs Flexible as a second planner engine
- Glow AI FAB, Habits primary tab, community/podcast pillars
- In-app notification inbox; scraping LOG into athlete UI

## Decisions / findings

- **K3:** Portion words share one `portionWordScale` path (cup=1, piece=1, handful/slice=0.5); honesty chips unchanged.
- **K5:** Fuel empty state CTA removed — docked Log food is the single red (`/nutrition` ratchet 2→1).
- **D13 What’s New:** hand-authored `WHATS_NEW_BULLETS` in `whatsNew.ts` — never auto from LOG. Last-seen key `mw_whats_new_seen_label` via safeStorage.
- **D13 FAQ:** controlled `<details open>` + prevented summary click so only one panel opens; Arrow/Home/End move focus between summaries.
- **D13 First Steps:** `clearFirstStepsDismissed()` under Profile; More already kept the checklist after Today dismiss (`.243`).
