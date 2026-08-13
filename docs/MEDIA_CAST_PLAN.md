# PLAN.md — .736 Multicultural exercise + www media

**Status: FROZEN** · 2026-08-13 · build `.736` · start with catalog **006 `squats`**

This file is the implementation plan. Do not reopen scope after freeze except a
**founder addendum**. Representation rules live in [MEDIA.md](MEDIA.md); pipeline
facts stay in [MEDIA_SYSTEM.md](MEDIA_SYSTEM.md).

### Founder addendum (2026-08-13) — first-wave regions

Cast must include **East Asian** (Korean / Japanese / Chinese — one look;
Cantonese/HK is not a separate slot), **Arab** (modest dress / hijab where the
squat still reads), and **Jewish/Israeli** (kippah and/or tzitzit as natural
training wear, not a costume). Named in MEDIA.md as first-wave **cast**, not a
campaign and not a market list. `cast-d` is the Jewish/Israeli still (replaces
the generic older athlete in the freeze roster). Alt still describes the
movement only.

**Addendum 2 (library-wide, not a sample):** Generate remaining exercise-library
stills, not a 5-exercise sample. Rotate looks **across** the library so one card
is not a UN collage. Token max. The first ship may land a subset if generation
is truncated; the roster then lists only ids that have files on disk, and the
rest stay athlete-a until recast. Do not regenerate `side.mp4` in this wave.

**Addendum 3 (geo-block, 2026-08-13):** Representation ≠ service territory.
Keep generating diverse athletes (race, religion, body, modest dress, kippah,
hijab as a person in a **served** country — e.g. an Arab or Muslim athlete in
the US or Israel — not an OIC-market campaign). Do **not** add copy, alt,
filenames, or www heroes that imply we operate in blocked countries.
First-wave **library targeting** follows `src/lib/legal/supportedRegions.ts`:
Israel is served; Indonesia / Malaysia / Türkiye / Gulf / Europe / Canada /
Ukraine are **not** markets. Casting an East Asian, Arab, or Jewish look is not
a claim that CN, SA, or EU are launch territories. See [MEDIA.md](MEDIA.md).

---

## Why

People of many races, religions, ages, body types, and genders should see themselves
in the product. Representation is default, not a campaign. Founder call-out: **006
squats**. Generated stills only — no stock photos of real people, no scraped faces,
no celebrity likeness.

---

## Inventory (investigated before freeze)

There is no `sites/www`. Marketing is the Next.js PWA (`LandingPage` at `/`). There
is no numbered asset `006.*`. Catalog order in `src/data/exercises.ts`:

| # | id | name | Form Index pack today |
|---|----|------|------------------------|
| 001 | `push-ups` | Push-ups | photoreal `athlete-a` + loop |
| 002 | `pull-ups` | Pull-ups | photoreal still-only |
| 003 | `bench-press` | Bench Press | photoreal + loop |
| 004 | `incline-bench` | Incline Bench | SVG / pattern only |
| 005 | `dumbbell-press` | Dumbbell Chest Press | SVG / pattern only |
| **006** | **`squats`** | **Squats (barbell)** | **stick SVG only** (`/form-guides/squats.svg`) |

Related squat ids (not 006; out of this ship except as follow-up):

| id | today |
|----|--------|
| `air-squat` | photoreal light-skinned male (`athlete-a`) + `side.mp4` |
| `front-squat` | same single default + loop |
| `goblet-squat` / `jump-squats` / `landmine-squat` | SVG or still; landmine still is athlete-a |

### Surfaces

| Surface | Path | People in frame? | This ship |
|---------|------|------------------|-----------|
| Form Index packs | `public/form/{id}/side.webp` (+ optional `side.mp4`) | Yes — one light-skinned male (`media/form-kit/refs/athlete-a-side.webp`) on every raster pack | **Generate a 4-still cast for `squats` only.** Other packs listed as follow-up. |
| Legacy form diagrams | `public/form-guides/*.svg` | Stick figures (race/gender-neutral) | Leave. Fallback when no pack. |
| Pattern rasters | `public/form/pattern-*/side.webp` | Stick / diagram | Leave. |
| Learn chapter heroes | `public/learn/*-hero.webp` | **No.** Metric / typographic / stick diagrams (paper/ink, `.268` re-ink). | Leave. Already contract-compliant. Recasting would be a rainbow sticker on teaching figures. |
| Learn section figures | `public/learn/*.webp` | No people | Leave. |
| Landing `/` | `LogToPlanHero` (real engine demo, no photo) + `GrayscalePhoto` slots | Slots exist (`/photo/phone-bench`, `home-rack`, `bare-wrist`) but **`public/photo/` has only a README** — placeholders, not a white-male hero | Leave placeholders. `GrayscalePhoto` is documentary photography, not generated faces. Filling those slots with AI people would violate its own contract. |
| Marketing art | `public/art/*.webp` | Abstract fields, no athletes | Leave. Not a single-default lifter. |
| Social | `public/social/` | README only | Leave. |
| Android | `FormGuideMedia.kt` → SVG URLs | Sticks | Leave this PR. Native raster cast is follow-up. |
| Videos | `public/form/{id}/side.mp4` (~500–700 KB each) | Same single athlete, motion | **Do not regenerate video.** Note recast as follow-up. `squats` has no loop today. |

---

## Ship (this PR)

1. **`docs/MEDIA.md`** — representation contract (who appears). Pipeline stays in
   `MEDIA_SYSTEM.md`. Pointers from INDEX + MEDIA_SYSTEM. Rules:
   - Representation is default. Every **exercise still set** includes more than one
     body, more than one skin tone, and at least one modest/religious-dress option
     (hijab, turban, long sleeves, loose pants) where the movement still reads.
   - Do not tokenize (no one-of-each checkbox collage in UI). Do not use a victim’s
     name. Do not brand USMC/ACFT-official. Do not make medical-device claims.
   - Generated media is illustration or clearly-generated stills of **unnamed**
     athletes — never photoreal “this is a real named person.”
   - Alt / caption describes the **movement**, not the person’s race. Race/religion
     live in the cast of the set, not in the caption.
2. **`squats` (006) still set** — 4 clearly-generated clinical stills, same barbell
   back-squat cue (side, bottom position, paper cyclorama `#f3f2f2`):
   - `cast-a` — woman, deep brown skin, athletic long-sleeve + shorts
   - `cast-b` — man, East Asian, compact build, long-sleeve + shorts
   - `cast-c` — woman, hijab + long sleeves + loose training pants (modest; bar on
     back still reads)
   - `cast-d` — Jewish/Israeli man, kippah + tzitzit as natural training wear (founder addendum)
   Files: `public/form/squats/cast-{a,b,c,d}.webp` + `side.webp` (canonical path =
   the deterministically picked still, or a copy of `cast-a` for the stable URL).
   Target ≤120 KB WebP each.
3. **Wire** `src/lib/formMedia.ts` (+ small `formCast.ts` if the picker needs a
   home): register `squats` in `FORM_PACK_SIDE_IDS`; resolver picks one still from
   the set with a **deterministic hash of exercise id** (`hash(id) % n`). Locale /
   preference later. No paywall. Caption stays movement-only
   (`Side view · full range of motion`).
4. **Honest www/Learn audit in the PR body** — recast nothing that is already
   people-free; list every left asset with why.
5. **Inbox optimize** — extend `scripts/optimize-media-inbox.mjs` so
   `form-{id}-cast-{letter}-frame` lands at `public/form/{id}/cast-{letter}.webp`.
6. **Guards** — colocated tests: set length 3–6; ≥1 modest-dress flag; pick is
   stable; caption has no race/religion words; files on disk match the roster
   (discover, do not hardcode a silent miss). Raise `CONTENT_FLOORS.formPackSide`
   18 → 19.
7. **Ship protocol** — `APP_BUILD_LABEL` `2026.07-unified.736`, LOG + CONTEXT
   `## Now`. `Excellence-Override` ( `src/lib/formMedia.ts` is classified surface).
   Do not flip `PRIVATE_MODE`. Do not invent traction. `[skip vercel]` on
   intermediate commits.

---

## Follow-up (named, not this PR)

- Recast remaining Form Index packs (`air-squat`, `front-squat`, `bench-press`, …)
  to the same cast-set contract. `.736` shipped `squats` / `push-ups` / `pull-ups`.
  Other raster packs remain one `athlete-a` body.
- Video recast of existing `side.mp4` loops (do not I2V in this PR).
- Documentary landing photos in `public/photo/` when real photography exists —
  not generated faces in `GrayscalePhoto`.
- Android Compose consuming `/form/{id}/cast-*.webp` instead of SVG-only.
- Locale / user preference picker for which still in a set.

---

## Out of scope

- Diversity marketing page / DEI blog
- Canada payment block, `PRIVATE_MODE`, EIN, secrets, mission-ops
- Gating the free logger
- New pillars / locales / America / F5
- Celebrity / influencer likenesses
- Regenerating long video

---

## Done

- This plan frozen, then code.
- Draft PR titled **Multicultural exercise + www media (start with 006 squats)**.
- `squats` has a multicultural still set wired. `push-ups` and `pull-ups` recast
  still-only (legacy loops not paired). Remaining raster packs listed as follow-up.
- `docs/MEDIA.md` exists.
- www / Learn single-default heroes recast **or** listed as follow-up with a reason.
- No production flip. No secrets.
