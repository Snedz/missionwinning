# PLAN — house black+yellow 4th skin density (`.1059`)

**Status:** FROZEN. Implement only what this file names.  
**Base:** `cursor/active-compose-first-paint` @ `23d4b13c` (`.1058` set table).  
**Paper:** next stamp `.1059`. Master paper stays `.1057` (`f302f40f`). Do not promote.  
**Not** `docs/PLAN.md` (build phases A–I). This file is the craft-window freeze.

---

## Goal

Elevate the signed-in house beyond thin black/white. Keep modernist IA (rooms, Start, set table) and Patreon-class structure (72 icon rail, 264 second bar, hover labels) without copying Patreon pixels. Recreate Today / Train / Victory / Coach as a **full black + yellow suit** — deep black surfaces, amber press, metric chips — Bevel-inspired density, not a costume paste.

## One concern

House 4th-skin materials and first-paint density on the real Train / Today / Victory / Coach loops. Nothing else.

## Token table (4th skin)

Scoped to `.mw-house` only. Field-manual `src/index.css` / `/private` / landing / www stay paper/ink.

| Token | New value | Role |
|-------|-----------|------|
| `--house-void` | `#070707` | Stage behind sheet |
| `--house-paper` | `#111111` | Canvas, cards, rails |
| `--house-stage` | `#070707` | Same as void |
| `--house-ink` | `#f4f4f5` | Primary text |
| `--house-muted` | `#a3a3a8` | Secondary |
| `--house-faint` | `#73737a` | Disabled |
| `--house-line` | `#2a2a2e` | 1px hairline |
| `--house-soft` | `#1a1a1d` | Soft fill |
| `--house-chip` | `#1c1c20` | Hover fill |
| `--house-selected` | `#242428` | Selected row / rail mark |
| `--house-press` | `#f5c518` | Primary pill / Log set / Generate / Start |
| `--house-press-ink` | `#111111` | Text on yellow |
| `--house-amber` | `#f5c518` | Metric accent (alias of press) |
| `--house-live` | `#ae1800` | Train pulse **only** (unchanged) |

Radii, rail widths (72 / 264 / 300), motion, and system-ui face stay. Inherited shadcn HSL inside `.mw-house` remaps to the same dark + yellow so History / Library / Coach / set table pick it up.

## Files to touch

### Skin + spec

- `src/components/house/house.css` — token remapping; replace leftover `#ffffff` / `#27272a` / `rgba(0,0,0,…)` chrome with tokens; recreate the four first-paint rooms (below).
- `src/components/house/DESIGN.md` — token table + 4th-skin note. Keep leftover sentences that tests pin.
- `src/components/house/INDEX.md` — one-line: 4th skin is dark + yellow, scoped to `.mw-house`.

### Surface recreation (CSS-first; JSX only if a hook class is missing)

1. **Today / `/log`** — Start stays the one filled yellow action. Week strip: today = amber hairline + soft fill; done = yellow fill + press-ink (metric chip). First-rooms ticks use amber when done. Date kicker / session title stay house type, now on dark paper.
2. **Train / `/active`** — set table on dark paper; Log set = `--house-press`; number cells brighter; completed row amber-tint; Prev / vs-last stay muted cites. Train plus (rail + floor) becomes yellow press, not a white circle.
3. **Victory** — receipt + stats on dark; volume / stat numerals as metric chips (tabular, amber); labels stay `--house-muted`.
4. **Coach** — empty mark circle amber-tinted; Generate dock stays the one filled yellow action.

Do **not** rewrite `TodayDesk.tsx` / `CoachPage.tsx` / Victory sheet JSX unless a class is missing. Recreate via existing leftovers (`house-week-cell`, `house-set-log`, `house-victory*`, `house-empty`, `house-generate-dock`, `house-btn-primary`).

### Tests (color pins must move with the skin)

- `src/lib/houseChrome.test.ts` — drop `#ffffff` / `--background: 0 0% 100%` / `--house-selected: #eeeeee` pins; assert the 4th-skin tokens.
- `src/lib/workout/setTableLogSetHousePress.test.ts` — `--house-press: #f5c518`.
- `src/lib/workout/logConsoleLogSetHousePress.test.ts` — same.
- `src/lib/houseSkinDensity.test.ts` — **new**. Asserts: press is `#f5c518`; paper is `#111111`; stage is `#070707`; week done uses press; Log set / Generate / Start use press; no leftover white canvas (`--house-paper: #ffffff` absent); `/private` + `LandingPage` + `sites/www` unchanged.
- `src/lib/workout/INDEX.md` — press hex in the leftover table.

### Ship protocol (visual only)

- `src/lib/buildInfo.ts` — `2026.07-unified.1059`.
- `LOG.md` — new `.1059` heading; rotate `.1042` to `docs/archive/log/LOG-rotate-1042-for-1059.md` (file is at 15 entries).
- `CONTEXT.md` `## Now` — `.1059` bullet; rotate oldest shipped if over 25.
- `docs/archive/INDEX.md` — list the rotate file.
- `docs/archive/log/LOG-rotate-1042-for-1059.md` — whole `.1042` section.

## Refuse list

- Do not merge. Do not promote. Do not flip `PRIVATE_MODE`.
- Do not touch `LandingPage`, `sites/www`, `/private`, or field-manual `src/index.css` `:root`.
- No Discord / DMs / Feed / costume boards / Studio / bell on Today.
- No Hevy / ChatGPT finish-workout as Coach identity.
- No Android / Expo / iOS restyle.
- No new rooms, tabs, locales, America, F5.
- Do not invent traction.
- Prefer `[skip vercel]`. One Preview max if the founder asks.
- Do not copy Patreon pixels or Bevel brand marks. Density only.

## Done when

- This PLAN.md is frozen, then implemented without expanding the file list.
- Visual PR open vs `cursor/active-compose-first-paint`, labeled `visual` + `do-not-merge` + `do-not-promote`.
- Title: `house: black+yellow 4th skin density (.1059)`.
- PR body lists screens touched + this refuse list.
- `/active`, `/log`, Victory, Coach first paints read as elevated black+yellow vs thin B&W.
- Guest. First set ungated. Today still one Start. Live www stays `.696`.
