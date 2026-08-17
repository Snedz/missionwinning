# PLAN.md — Super Bundle Move premium flows (frozen)

**Status:** FROZEN 2026-08-13. Implement only this document.  
**Lane:** Content / Super Bundle depth (not wedge chrome).  
**Ship label:** `2026.07-unified.709` (retagged 2026-08-13 — `.699` is #478; `.698` is #477 / #491).  
**Excellence-Override:** Super Bundle Move premium flows (content)

This is the overnight session plan. It is **not** the living roadmap at [docs/PLAN.md](../PLAN.md).

---

## 0. What this is

Super Bundle **Move** is prescribed, train-anywhere, original timed flows — press play, follow cues. It is **not**:

- a a mobility app / ROMWOD video library
- a mobility score
- a new tab / nav item
- a trial, a logger gate, or a `PRIVATE_MODE` flip

S6 (#491, draft) already owns the Victory seam: one post-session line that deep-links a **free** `MOBILITY_FLOWS` id. This ship **does not touch that line**. It improves the catalogs that seam can deep-link, and it adds real premium depth behind `/api/premium/mobility`.

---

## 1. Honest inventory (measured on master `.697`)

| Catalog | Actual ids | Floor (`CONTENT_FLOORS`) | Constant |
|---------|------------|--------------------------|----------|
| Free `MOBILITY_FLOWS` | **32** unique | `moveFree: 32` | array length |
| Premium `PREMIUM_MOBILITY_FLOWS` | **48** unique | `movePremium: 48` | `PREMIUM_MOVE_FLOW_COUNT = 48` |

Findings (not arguments):

1. **ID collision:** `morning-wake-up` exists in **both** catalogs. `MovePage` concatenates free then premium; the free row wins. Rename the **premium** id only.
2. **Early premium rows are untagged** (~first 16). Collections fall back to keyword match; later D2 rows have real tags.
3. **Advertised minutes lie.** Several premium `durationMin` values are ~2× the sum of `durationSec`. The card says 18 min; the timer runs ~9. Super Bundle depth that is not on the clock is wallpaper.
4. **Equipment without a floor fallback** (foam roller, band, bar, wall) on train-anywhere copy.
5. **Stale locked-preview copy:** `moveLockedHint` still says “10 flows / 11 premium” against 32 / 48.
6. **Living roadmap stale:** [docs/PLAN.md](../PLAN.md) I3b still says “17 Mind + 11 Move”.
7. **`post-upper-flush`** is tagged `post-legs` — wrong collection.

S6 #491 maps these **free** ids (do not rename, delete, or retarget):

| Muscle | Free id | Display name prefix S6 asserts |
|--------|---------|--------------------------------|
| Legs | `post-leg-day` | Post-Leg-Day Recovery |
| Back | `tspine-opener` | T-Spine Opener |
| Chest | `tspine-opener` | T-Spine Opener |
| Shoulders | `shoulder-cars` | Shoulder CARs Flow |
| Arms | `wrist-elbow-care` | Wrist & Elbow Care |
| Core | `lateral-line` | Lateral Line |
| Cardio | `post-run-cooldown` | Post-Run Cooldown |
| Full Body | `recovery-wind-down` | Recovery Wind-Down |

Name rule S6 will test: `free.name === flow.name || free.name.startsWith(flow.name + ' (')`. Keep those prefixes. Parenthetical minutes may change.

---

## 2. Non-goals (refuse)

- Any file #491 owns for the seam: `postSessionFlow.ts`, `victorySecondaryLinks.ts`, `WorkoutVictorySheet.tsx`, `VictorySecondaryLinks.tsx`, `workoutVictory.ts` working-muscle plumbing, `?flow=` hydration on `MovePage`.
- New routes, tabs, collections, scores, video, or a second runner.
- Gating the free logger. Trial. `PRIVATE_MODE`. Android / Expo.
- Locale body farms. Changing EN Move copy that already exists is allowed; do not add new `APP_LANGS`.
- Inventing traction. Preview: **at most one** Vercel preview (the draft PR).

---

## 3. Build (only this)

### 3.1 Improve the free catalog S6 can deep-link

Edit `src/data/mobilityFlows.ts` **in place** for the eight ids in §1.

- Keep `id` and name prefix.
- Rewrite cues so each step is **prescribed** (reps, hold seconds, breath count) and **train-anywhere** (floor / hotel / park; doorway or band optional with a floor fallback).
- Stay post-session / joint-care in spirit (S6 is recovery, not a pre-lift primer).
- Do not add free rows (floor stays 32). Do not change other free ids except trivial tag/cue consistency if a step is unsafe.

### 3.2 Improve existing premium rows

Edit `src/data/premiumMobilityFlows.ts`:

1. **Rename** premium `morning-wake-up` → `morning-wake-premium-11`. Do not touch free `morning-wake-up`.
2. **Tags on every row** — at least two of the collection tags in `filterFlows.ts` (`hips`, `post-legs`, `recovery`, `desk`, `thoracic`, `neck`, `pre-lift`, `primer`, `ankles`, `travel`, `no-equipment`, `yoga-lite`, `shoulders`, `long`, `wrists`).
3. **Clock honesty:** for every premium flow, `sum(steps.durationSec) >= durationMin * 60 - 60` (within one advertised minute). Prefer **lengthening holds/steps** so long-form cards stay long; do not silently drop `durationMin` on rows already sold as 15–20 min.
4. **Train-anywhere:** any step that names foam roller / band / bar / wall must include a no-gear alternative in the same cue.
5. **Fix** `post-upper-flush`: drop `post-legs`; keep shoulders / thoracic / recovery.
6. Original cues only. No a mobility app / ROMWOD product names in flow `name` / `focus` / `cue`. No medical-treatment claims; “stop if sharp pain” is allowed on joint-care rows.

### 3.3 Add eight original premium flows (48 → 56)

Append eight **new ids** (no overlap with free or existing premium). Each: ≥6 steps, `durationMin` 14–18, tags ≥2, train-anywhere, prescribed, clock-honest.

| id | Job (why it is not a duplicate) |
|----|----------------------------------|
| `post-pull-lat-flush-16` | After rows / pulldowns — lats + T-spine. S6’s free `tspine-opener` is the snack; this is Bundle depth. |
| `post-press-chest-open-15` | After bench / push-ups. Chest currently shares S6’s T-spine snack; premium gets a real press flush. |
| `knee-friendly-lower-14` | Pain-free range, no forced deep squat / pigeon. Gap in catalog. |
| `floor-only-hotel-16` | No wall, doorway, band, or bar — bed or floor. Stricter than existing travel rows. |
| `rotational-athlete-15` | Throw / golf / combat rotation. Gap. |
| `post-carry-suitcase-14` | After farmer / suitcase / ruck — grip + lateral line. Distinct from `grip-elbow-care-long`. |
| `park-bench-recovery-16` | Outdoor / park bench only. Train-anywhere ICP. |
| `evening-hips-breath-18` | Long rest-day hips + nasal downshift. Distinct from yoga-lite studio rows. |

### 3.4 Honest counts (single source)

After the eight rows exist:

| Place | Change |
|-------|--------|
| `src/lib/contentFloors.ts` | `movePremium: 56` |
| `src/data/premiumInventory.ts` | `PREMIUM_MOVE_FLOW_COUNT = 56` |
| `src/lib/move/movePremD2_587.test.ts` | Stop asserting floor **equals** 48. Keep D2 id presence. Floor equality moves to the new test. |
| New `src/lib/move/movePremD3_709.test.ts` | Floor 56; eight new ids; unique ids vs free; clock honesty; tags; collision gone; S6 target ids still present on free catalog. |
| `moveLockedHint` + `MoveLockedPreview` | Interpolate `CONTENT_FLOORS.moveFree` / `movePremium`. No hand-typed counts. EN drops “a mobility app” product voice (timed original flows, not a video library). |
| [docs/PLAN.md](../PLAN.md) I3b | Honest current floors (Mind premium 60, Move premium 56) — one line, not a second inventory. |

`payments.ts` already interpolates `CONTENT_FLOORS`; no hand-typed Move counts there.

### 3.5 Ship protocol (same commit as the content)

Hard rule 5:

- `APP_BUILD_LABEL` → `2026.07-unified.709`
- `LOG.md` new heading `## 2026-08-13 — … (.709)`; rotate oldest live entry (`.669`) to `docs/archive/log/LOG-rotate-669-for-709.md` + archive INDEX row. (If #491 merges first and already rotated `.669`, rotate whatever is then oldest — do not invent a second archive of the same heading.)
- `CONTEXT.md` `## Now`: date + label `.709` bullet; drop one oldest ship bullet to stay ≤25. Do not steal `.698` / `.699`.
- Excellence-Override trailer on the commit **and** the PR body.

Docs indexes: `src/data/INDEX.md` one line if the premium file’s concern changed; `docs/INDEX.md` row pointing at this frozen plan. No new tab, no help-page redesign beyond a factual Move sentence if counts are named.

---

## 4. Tests (must be able to go red)

Mutants the new test must kill:

1. `CONTENT_FLOORS.movePremium` left at 48 → red  
2. Missing any of the eight new ids → red  
3. Premium `morning-wake-up` still colliding with free → red  
4. A premium flow with `sum(durationSec) < durationMin * 60 - 60` → red  
5. A premium flow with fewer than two tags → red  
6. Deleting S6 free id `tspine-opener` (or any §1 map id) → red  
7. `moveLockedHint` / preview defaultValue containing a raw digit that is not interpolated → red  

Do not weaken `contentInventory.test.ts` floors. Do not skip tests.

---

## 5. Done when

- [ ] This file exists and is frozen (this commit).
- [ ] Eight S6 free targets improved; ids and name prefixes unchanged.
- [ ] Premium catalog: collision gone, tags, clock-honest, train-anywhere fallbacks, eight new original flows.
- [ ] Floors and constants are **56**; locked hint and I3b match; no hand-typed 10/11.
- [ ] Unit tests green for the files above. Draft PR. At most one preview.
- [ ] Logger still free. No `PRIVATE_MODE` change. No Victory seam files.

**Not done:** a video library, a score, a new tab, S6’s Victory line, or a count we did not measure.
