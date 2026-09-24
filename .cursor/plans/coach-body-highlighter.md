# Coach muscle balance map

Frozen 2026-09-24. Implement this file. Do not revise it mid-build.

## Claim

On `/coach`, show anterior and posterior muscle frequency from recent completed sessions, using the MIT npm package `react-body-highlighter` (giavinh79 / GV79). Mission Winning owns the wrapper and the log→data map. The SVG stays in the package.

## Laws

- Draft PR only. No merge. No tip-promote. Live www stays `.697`. Paper stamp only.
- `[skip vercel]` on the commit.
- Do not flip `PRIVATE_MODE`. Do not invent `paymentUrl`.
- No AGPL paste. No GymVisual or ExerciseDB GIF packs. No copied highlighter polygons.
- No Program 67 sauce. No new per-exercise anatomy dump.
- Ship protocol: `LOG.md` + `CONTEXT.md` `## Now` + `APP_BUILD_LABEL` `2026.07-unified.1111` in the same commit. Rotate LOG and `## Now` to stay inside budget.

## Dependency

`react-body-highlighter` (MIT, published license Copyright (c) 2020 GV79). Runtime dependency. Attribution in `src/lib/bodyHighlighter/NOTICE.md` (copyright + permission notice). Do not vendor the SVG source into `src/`.

## Data

Pure module `src/lib/bodyHighlighter/muscleBalance.ts`.

`muscleBalanceFromHistory(history, windowDays = 14)` returns `{ name, muscles, frequency }[]`.

- Window is 14 days, the same span History already uses for the heatmap.
- Session count comes from `buildMuscleHeatmap` (one definition). A session counts once per major group. Deleted logs do not count.
- Muscle tags: stored `muscleGroups` first, then the existing catalog fallback inside that heatmap. `Full Body` and `Cardio` stay unmapped.
- `name` is the major group (`Chest`, `Back`, `Legs`, `Shoulders`, `Arms`, `Core`).
- `frequency` is that session count. Rows with frequency 0 are omitted so untrained regions stay the body color.
- Display projection only, disjoint, closed:

| Major group | Highlighter slugs |
|---|---|
| Chest | chest |
| Back | trapezius, upper-back, lower-back |
| Shoulders | front-deltoids, back-deltoids |
| Arms | biceps, triceps |
| Core | abs, obliques |
| Legs | quadriceps, hamstring, gluteal, calves |

Do not paint forearm, adductor, abductors, head, neck, knees, or soleus. Those are not MW major groups.

Not a planner input. Do not import this module from `src/lib/coach/planEngine.ts` or `packages/mw-core`.

## UI

`src/components/coach/MuscleBalanceMap.tsx` (`'use client'`).

- One mount on `CoachPage`, visible whenever the page is not in its first loading paint. Reads `workoutHistory` from the workout store.
- Two `Model` views: `anterior` and `posterior`. Same data array. The package draws only the slugs on that side.
- Override `bodyColor` and `highlightedColors` with `hsl(var(--…))` token strings. Do not ship the package’s default blue hex ramp. No raw hex, radius, or second typeface in our source.
- Text list of group + session count is the accessible reading. Figures are `aria-hidden`.
- Empty window: blank bodies plus one honest sentence. No invented highlights.
- Copy in `src/i18n/coachLocales.ts` (`t` + English, with es/de overrides). Not a second red action. Not premium-gated.

## Tests

Colocated `muscleBalance.test.ts`. Relative timestamps only (no calendar date literals).

- Empty history → `[]`.
- Tombstone ignored.
- Two lifts in one session, same group → frequency 1.
- Two sessions → frequency 2.
- Outside the window → omitted.
- Stored groups beat the catalog name.
- `Full Body` / `Cardio` → no row.
- Mapped slugs are disjoint and exclude the unmapped vendor parts above.
- `CoachPage` mounts `MuscleBalanceMap`.
- The component imports `react-body-highlighter`, passes highlight colors, and does not contain polygon point data or hex colors.
- `NOTICE.md` carries the MIT copyright line.

## Docs

- `src/lib/bodyHighlighter/INDEX.md`
- Row in `src/lib/INDEX.md` and `src/components/coach/INDEX.md`
- One plain sentence in `docs/help/mission-coach.md` (no internal paths)
