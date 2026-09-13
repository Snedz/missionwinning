# PLAN — house black+yellow 4th skin density (`.1059`)

**Status:** FROZEN (rev. C2). Implement only what this file names.  
**Base:** `cursor/active-compose-first-paint` @ `23d4b13c` (`.1058` set table).  
**Paper:** stamp `.1059`. Master paper stays `.1057` (`f302f40f`). Do not promote.  
**Law:** Design Polish **C2 · Instrument** (`scripts/design-variants/themes.mjs` id `c2-instrument`, `docs/design/variants/c2-instrument.html`). Not the research brief `#F5C400` / `#0A0A0A` table. Not zinc `#f5c518`.  
**Not** `docs/PLAN.md` (build phases A–I). This file is the craft-window freeze.

---

## Goal

Elevate the signed-in house beyond thin black/white. Keep modernist IA (rooms, Start, set table) and Patreon-class structure (72 icon rail, 264 second bar, hover labels) without copying Patreon pixels. Recreate Today / `/log` / Train set table / Victory / Coach (and Library / Builder if they already ride house chrome) as a **full C2 black + signal-yellow suit** — instrument density, not a costume paste.

## One concern

House 4th-skin materials and first-paint density on the real Train / Today / Victory / Coach loops. Nothing else.

## Token table (C2 · Instrument)

Scoped to `.mw-house` only. Field-manual `src/index.css` / `/private` / landing / www stay paper/ink.

| Token | Value | C2 role |
|-------|-------|---------|
| `--house-void` | `#0a0c0f` | Ground / paper |
| `--house-stage` | `#0a0c0f` | Same as void |
| `--house-paper` | `#0a0c0f` | Canvas (ground) |
| `--house-soft` | `#0f1319` | Card |
| `--house-chip` | `#12161b` | Field / raised / hover |
| `--house-selected` | `#1a2028` | Selected row / rail mark |
| `--house-ink` | `#e6ebef` | Primary text |
| `--house-muted` | `#7d8a95` | Quiet |
| `--house-faint` | `#5f6b75` | Disabled |
| `--house-line` | `#1e252c` | 1px hairline |
| `--house-press` | `#ffb000` | Signal yellow — **one filled field per screen** |
| `--house-press-deep` | `#c98a00` | Signal deep (hover) |
| `--house-press-tint` | `#1a1607` | Signal tint |
| `--house-press-ink` | `#0a0c0f` | On-signal |
| `--house-amber` | `#ffb000` | Alias of press (metrics ≥19px only) |
| `--house-live` | `#ae1800` | Train pulse **only** (unchanged) |

Radii max **8px** on cards. Kill `999px` pills on primary — `--house-pill: 8px`. Rail widths 72 / 264 / 300 and motion stay.

Type: **Archivo 400/600/800** (already loaded — do not add a second face in `app/layout.tsx`). System mono for telemetry numerals only. Drop the thin system-ui-first stack as the *display* face; keep `ui-sans-serif` as fallback so leftover pins still see it.

Inherited shadcn HSL inside `.mw-house` remaps to the same C2 ground + `#ffb000` so History / Library / Coach / set table pick it up.

### One yellow field per screen

Filled `--house-press` is Start / Log set / Generate / Victory Next / live cue only. Never yellow wallpaper. Never yellow body text under ~19px. Prefer `#ffb000` over COD `#ffd000`. Week-done and first-rooms ticks use selected / ink, not a yellow flood.

## Files to touch

### Skin + spec

- `src/components/house/house.css` — C2 token remapping; pill 8px; Archivo; remake leftover `#ffffff` / `#27272a` / zinc chrome; recreate the rooms below; remake `.mw-house .poster-field` so portaled Victory Next is not field-manual red.
- `src/components/house/DESIGN.md` — token table + C2 note. Keep leftover sentences that tests pin (`#eee` selected *role* copy stays).
- `src/components/house/INDEX.md` — one-line: 4th skin is C2 instrument dark + `#ffb000`, scoped to `.mw-house`.

### Surface recreation (CSS-first; JSX only if a hook class is missing)

1. **Today / `/log`** — Start is the one filled yellow action. Week strip: today = press hairline + soft fill; done = selected fill + ink (not yellow wallpaper). First-rooms ticks use press color on the mark only, not a yellow cell.
2. **Train / `/active`** — set table on C2 ground; Log set = `--house-press` (the one fill). Number cells tabular + mono. Completed row uses press-tint, not a yellow flood. Train plus is selected/chip, not a second yellow circle. Prev / vs-last stay muted cites.
3. **Victory** — receipt + stats on dark; volume / stat numerals ≥19px may use amber; labels stay `--house-muted`. Next strip: add `mw-house` hook on `VictoryNextActionStrip` (dialog portals outside the shell). Poster-field remakes to dark card + yellow primary (not `#ae1800` wallpaper).
4. **Coach** — empty mark uses press-tint + press icon (not a yellow disc flood). Generate dock stays the one filled yellow action.
5. **Library / Builder** — inherit via remapped tokens only. No JSX rewrite.

Do **not** rewrite `TodayDesk.tsx` / `CoachPage.tsx` / Victory sheet JSX except the missing `mw-house` hook on the Next strip. Recreate via existing leftovers (`house-week-cell`, `house-set-log`, `house-victory*`, `house-empty`, `house-generate-dock`, `house-btn-primary`, `poster-field`).

- `src/components/workout/VictoryNextActionStrip.tsx` — add `mw-house` on the poster-field wrapper so C2 tokens apply when Radix portals to `body`. DialogContent stays not-`mw-house` (existing pin).

### Tests (color pins must move with C2)

- `src/lib/houseChrome.test.ts` — paper `#0a0c0f`; selected `#1a2028`; radius 8px / `--radius: 0.5rem`; week today still press hairline; week-done / set-done not a yellow flood pin if they use selected/tint.
- `src/lib/workout/setTableLogSetHousePress.test.ts` — `--house-press: #ffb000`.
- `src/lib/workout/logConsoleLogSetHousePress.test.ts` — same.
- `src/lib/houseSkinDensity.test.ts` — press `#ffb000`; paper/void `#0a0c0f`; Start / Log set / Generate use press; Victory Next remake uses press; no leftover `#f5c518` / `#ffffff` paper; `/private` + `LandingPage` + `sites/www` unchanged.
- `src/lib/workout/INDEX.md` — press hex `#ffb000`.

### Ship protocol (visual only)

- `src/lib/buildInfo.ts` — keep `2026.07-unified.1059`.
- `LOG.md` — update the `.1059` heading to name C2 / `#ffb000`.
- `CONTEXT.md` `## Now` — `.1059` bullet names C2 tokens.
- No new rotate unless the file goes over 15 entries.

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
- No Bevel strain rings as home. No wearable-as-permission.
- No yellow wallpaper. No SpaceX D-DIN. No COD yellow everywhere.
- No glow / gradient blobs / glass.

## Done when

- This PLAN.md is frozen at C2, then implemented without expanding the file list beyond what this revision names.
- Visual PR open vs `cursor/active-compose-first-paint`, labeled `visual` + `do-not-merge` + `do-not-promote`.
- Title: `house: black+yellow 4th skin density (.1059)`.
- PR body lists screens touched + this refuse list.
- `/active`, `/log`, Victory, Coach first paints read as C2 instrument (ground `#0a0c0f` + signal `#ffb000`) vs thin B&W.
- Guest. First set ungated. Today still one Start. Live www stays `.696`.
