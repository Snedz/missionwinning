# Frozen plan — Home gym kit on the free logger

**Status:** FROZEN. Implement only this file.
**Ship:** `2026.07-unified.733`
**Excellence-Override:** free home-gym kit
**Lane:** Engineering-Web · Horizon W · Train logger equipment (`/account` + `/active` read)
**Free forever.** Not Super Bundle bait. No trial. No account. No `PRIVATE_MODE` flip.

Young people start with $0: kit is free, logger is free, no paywall.

---

## Problem

I-Day stores one coarse radio (`bodyweight` / `dumbbells` / `full-gym`) in `mw_equipment`. A garage athlete with a barbell, rack, plates, and a pull-up bar is forced into **full gym** (machines, cables, sleds they do not have) or **dumbbells** (`home-gym` already maps there and **drops barbell work**). The logger cannot read what they actually own.

Identity’s Athlete Table `homeGym` row is **cosmetic projection** (picks-from-sets). It must not become planner input.

---

## Discover, do not rewrite

| PR | Owns | This ship |
|----|------|-----------|
| #503 `.708` plate math + warmup | `plateCalculator.ts` `setRowPlateLine` · `warmupRamp.ts` · set-row W / plates | **Do not** touch those files. Kit may *store* `plates`; plate math inventory stays #503. |
| #514 `.721` garage swap | `src/lib/workout/garageSwap.ts` · Swap sheet on the row | **Do not** touch. Kit does not invent a second Swap. |
| Identity table `homeGym` | Cosmetic pick on `/profile` | **Do not** change picks. Kit may **emit** a mapped pick (Log → Social). Coach never reads identity. |
| I-Day 3 radios | Welcome ≤90s (C5) | **Do not** expand I-Day to six checkboxes. Seed kit from the radio; Account is the editor. |

Occupied labels `.698`–`.732`. This ship is **`.733`**. Do not steal `.698`.

---

## What ships

A **local Home gym kit**: the athlete lists what they have.

Closed items (discover this list in code; do not grow it here):

`barbell` · `rack` · `plates` · `dumbbells` · `pull-up-bar` · `floor`

- Device-local JSON. No account. Backup via existing `mw_*` prefix scan.
- Empty / unset kit → current 3-profile behavior (do not silently strip full-gym machines from athletes who never opened the kit).
- Saving the kit writes the kit **and** a derived `mw_equipment` so Welcome / journey sync stay consistent.
- $0 default when they *do* save a first kit with nothing checked: **floor only**.

---

## A. Pure kit (logger equipment)

**New** `src/lib/workout/homeGymKit.ts` + colocated test. Not under `identity/` (Coach may read kit storage; Coach must not read identity).

| Export | Contract |
|--------|----------|
| `HOME_GYM_ITEMS` | Closed tuple of the six ids |
| `parseHomeGymKit(raw)` | Clamp unknown keys; empty → floor-only when *explicit save*; missing storage → `null` (unset) |
| `kitToEquipmentProfile(kit)` | `floor`-only → `bodyweight`; dumbbells without barbell/rack/plates → `dumbbells`; barbell or rack or plates → **not** `full-gym` (derived `home-gym` string is ok for storage; profile stays the three enums via matching overlay) |
| `kitMatchesExercise(ex, kit)` | Catalog `equipment` → required item(s). Commercial (machine/cable/sled/tire/bike/rower/rings) never match a garage kit. Pull-up family (pull-up / chin-up / hanging / inverted-row) needs `pull-up-bar` even when catalog says Bodyweight. Rack-required lifts (squat / front-squat / bench / incline-bench) need `barbell` **and** `rack`. Deadlift / row / OHP need `barbell` only. Floor work needs `floor`. |
| `seedKitFromEquipmentProfile(profile)` | I-Day seed: bodyweight → `[floor]`; dumbbells → `[floor, dumbbells]`; full-gym → **unset kit** (commercial gym stays full-gym until they list items) |
| `kitToAthleteHomeGymPick(kit)` | Emit-only map to existing table picks (`bodyweight-only` / `dumbbells` / `rack-bars`). Never the reverse. |

Storage: `STORAGE_KEYS.homeGymKit` = `mw_home_gym_kit`. Load/save through `safeStorage` (`readJson` / `writeJson`). Saving also writes derived `mw_equipment` + `scheduleJourneyPush()`.

**Logger read:** Just Go / Active empty start / Coach context use `kitMatchesExercise` when a kit is stored; otherwise existing `equipmentMatches(profile)`.

**Coach substitutions, not rank:** thread kit into `equipmentMatches` / selector **filter only**. Do not pass kit into `rankExercises`. Do not add a fourth `EquipmentProfile` enum (Zod + seedPlan stay three-way). Overlay: `equipmentMatches(ex, profile, kit?: HomeGymKit \| null)` — when `kit` is non-null, kit wins the filter; when null, today’s profile rules.

`contextBuilder.readLocalCoachContext` loads kit from storage and passes it. `CoachContext` may carry optional `homeGymKit` for the filter; generate/adapt still store `equipmentProfile` as the three-way derived value.

---

## B. Account UI (the editor)

**New** `src/components/profile/HomeGymKitCard.tsx` on `/account` **day-one stack** (after units — Train settings, anonymous). Not under More settings. Not on `/profile` identity table.

- Title: **Home gym kit**
- Body: list what you have. Free. Stays on this device.
- Six ≥44px toggles (`variant="selected" | "outline"`, same as units). `data-testid="home-gym-kit"` + `home-gym-kit-{id}`.
- Auto-save on toggle (like preferred days). No poster-red primary. No Bundle / trial copy.
- `id="home-gym-kit"` for `/account#home-gym-kit`.
- On first paint with unset kit: show seeded checkboxes from `mw_equipment` **without writing** until they toggle (full-gym → all six visually, still unset until save).

Emit (optional, same save): if identity table `homeGym` is unset, write `kitToAthleteHomeGymPick`. Never read identity to decide kit. Coach never imports `@/lib/identity`.

---

## C. Logger + Coach wiring (read path)

| Caller | Change |
|--------|--------|
| `ActiveWorkoutPage` Just Go | Pass stored kit into `buildJustGoSession` |
| `justGoSession.pickExercisesForFocus` | When kit set, filter pool with `kitMatchesExercise` (not only the bodyweight string check) |
| `coach/equipment.ts` | Optional kit overlay on `equipmentMatches` |
| `coach/selector.ts` | Filter via `equipmentMatches(ex, ctx.equipment, ctx.homeGymKit)` — **not** rank |
| `coach/contextBuilder.ts` | Load kit; do not import identity |
| Welcome I-Day save | `seedKitFromEquipmentProfile` only when kit still unset |

Do **not** restyle Train chrome. No new nav item. No Android this ship.

---

## Out of scope (hard)

- Rewrite plate math / warmup / garage Swap
- Custom plate inventory (bumper vs iron) — #503 refused it
- Fourth EquipmentProfile enum / API Zod change beyond optional ignore
- I-Day checkbox wall
- Super Bundle / trial / account gate
- America / MAGA / “heartland” copy
- Identity table pick-set expansion
- Ranking, leaderboard, Club from kit
- `PRIVATE_MODE` prod flip · EIN

---

## Tests (falsify, then keep)

- `homeGymKit.test.ts` — parse clamp; $0 empty → floor; barbell+rack matches squat; barbell without rack rejects squat, allows deadlift; floor-only rejects barbell/DB/machine; pull-ups need pull-up-bar; commercial never matches kit; seed full-gym → unset; identity map is one-way.
- `equipment.test.ts` — kit overlay does not change null-kit 3-profile cases; kit does not affect `rankExercises` (selector still ranks by familiarity).
- `justGoSession` — kit barbell+floor does not pick leg-press.
- Domain: `src/lib/coach/` still has no import of `src/lib/identity` (existing C1).
- Free guard discovers `homeGymKit` + `HomeGymKitCard` — no premium/Bundle/trial.
- Mutants: kit-null still full-gym machines; ranking by kit item count must fail.

---

## Docs / ship protocol (same commit as the code)

- This file (already frozen)
- `LOG.md` + rotate oldest live entry so the file stays at 15
- `CONTEXT.md` `## Now` one bullet for `.733`
- `APP_BUILD_LABEL` → `2026.07-unified.733`
- `src/lib/workout/INDEX.md` · `src/lib/coach/INDEX.md` · `src/lib/storage/keys.ts` · help getting-started one line
- i18n keys in `athleteLocales.ts` (EN + beachhead; coverage 0 uncovered)

Commit trailer:

```
Excellence-Override: free home-gym kit
```

Draft PR. Preview at most one (plan commit uses `[skip vercel]`). Never flip `PRIVATE_MODE`.
