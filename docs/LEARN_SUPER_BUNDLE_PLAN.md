# PLAN.md — Learn original Super Bundle depth

**Status:** FROZEN 2026-08-13. Implement only this document. Do not expand scope.
**Lane:** Content / Book (ORCHESTRATION) · Excellence-Override: Learn original Super Bundle depth
**Label:** `2026.07-unified.705` (next unused after in-flight `.698`–`.704`; rebase if `.705` lands first)
**PR:** draft · preview at most one · no `PRIVATE_MODE` · no trial

This is the overnight plan. It is **not** [docs/PLAN.md](PLAN.md) (build phases A–I).

---

## 1. Job

Make Super Bundle **beat buying a guidebook + Strong + a coach app** by shipping original Learn depth that teaches **one sequence**, not six apps:

**Train (log on this phone) → Mission Coach (week from those logs) → Fuel / Move / Mind as support for that same week.**

Diataxis. Original MW wording ([guidebook-originality-log.md](guidebook-originality-log.md)). Free intro stays free (wedge).

---

## 2. Collision freeze (do not edit)

| Owner | Paths | Why |
|-------|--------|-----|
| #496 | `src/data/guidebook/chapters.ts` Ch3 `programming-tuning` (`ch3-s1`…`ch3-s3`); `learnPaths.ts` lesson `pd-0` | Free Train+Coach intro on a different chapter/path |
| #479 | `learnPaths.ts` Strength Basics `sb-0` | Free offline Train+Coach intro (`.702`) |
| `.680` | Ch4 `getting-started-mw`; `magazineMeta.ts` | Already shipped wedge CTAs |

**Do not edit these files at all:**

- `src/data/guidebook/chapters.ts`
- `src/data/guidebook/magazineMeta.ts`
- `src/data/learnPaths.ts`
- `src/data/learnLessonEnhancements.ts`
- `public/learn/*-hero.webp`
- `public/magazine/beyond-the-basics.pdf`
- anything that flips `PRIVATE_MODE` or adds a trial

Premium-only depth. No Super Bundle / paywall copy on free chapters.

---

## 3. What stays free (wedge)

These remain ungated. This PR does not add a paywall, trial, or Bundle CTA to them.

| Surface | Ids | Notes |
|---------|-----|--------|
| Free guidebook | 6 chapters: `human-performance`, `movement-mechanics`, `programming-tuning`, `getting-started-mw`, `nutrition-recovery`, `assessments-progress` | Public `/guide`. Floor `guidebookFreeChapters: 6` unchanged. |
| Free Learn paths | 10 paths (existing `FREE_LEARN_PATHS`) | `/learn` ungated. |
| Free logger | `/active` | Never gated. |
| Free Coach generate/adapt | `/coach` weekly from logs | Bundle = voice/chat/regen **depth**, not the week itself. |
| Magazine | `/guide/print` + PDF | Free chapters only. Not rebuilt. |

Help + locked-preview copy must still say the free intro is free.

---

## 4. What we ship (premium-only)

Two **new** original premium guidebook chapters, appended after existing Ch7–10 (corrective / coaching-business / bodybuilding / sports-nutrition). Those four specialist silos stay. The new pair is the Super Bundle thesis: one sequence, not six apps.

Existing premium: 4 chapters × 4 sections = **16**. New: 2 × 4 = **8**. Total **24** sections.

### Ch11 `one-week-sequence` — number 11

**Title:** One Week, One Sequence  
**Subtitle:** Train, then Coach, then Fuel / Move / Mind — the same week, not six apps  
**Diataxis:** tutorial + how-to

| Id | Diataxis | Title | Practice CTA |
|----|----------|-------|----------------|
| `pch11-s1` | tutorial | Tutorial — Log the session you actually did | Open Train logger → `/active` |
| `pch11-s2` | tutorial | Tutorial — Generate the week from that diary | Open Mission Coach → `/coach` |
| `pch11-s3` | how-to | How-to — Fuel, Move, and Mind on this week | Open Today → `/log` |
| `pch11-s4` | how-to | How-to — When the week breaks, adapt here | Open Mission Coach → `/coach` |

Teaching blocks (Diataxis furniture, original MW):

- `pch11-s1` checklist: first logged session (weight/reps or bodyweight; notes; no wearable required)
- `pch11-s3` table: same-week support (Fuel / Move / Mind → what to do → where in the app)

### Ch12 `one-stack` — number 12

**Title:** One Stack  
**Subtitle:** Why Super Bundle beats a guidebook + a logger + a coach app  
**Diataxis:** explanation + reference

| Id | Diataxis | Title | Practice CTA |
|----|----------|-------|----------------|
| `pch12-s1` | explanation | Explanation — Three products, three diaries | Open Train logger → `/active` |
| `pch12-s2` | explanation | Explanation — One sequence, not six apps | Open Today → `/log` |
| `pch12-s3` | reference | Reference — What stays free | Open free guidebook → `/learn/guide` |
| `pch12-s4` | reference | Reference — What Super Bundle adds on this sequence | Open Mission Coach → `/coach` |

Teaching blocks:

- `pch12-s1` callout: shared diary is the product
- `pch12-s3` table: free vs Super Bundle on this sequence (logger, weekly generate, voice/chat, Fuel/Move/Mind **depth**, these two chapters)
- `pch12-s4` checklist: Bundle depth on the same week (not a second program)

`sourceRef` on every new section: `MW product — Super Bundle sequence` (not an ISSA topic).

No new `Win Score` strings. No trial copy. No wearable-required. No invented traction. No medical/depression claims. Educational scope only.

Chapter bodies live in `premiumChapters.ts` (server-only English, same as Ch7–10). Do **not** add guidebook i18n keys for premium (existing rule: `buildGuidebookLocaleKeys` is free chapters + magazine only).

---

## 5. Honesty copy (counts must match the catalog)

Raise floors/constants to the new actual, never type a second number by hand:

| Location | Change |
|----------|--------|
| `src/data/premiumInventory.ts` | `PREMIUM_LEARN_SECTION_COUNT = 24` |
| `src/lib/contentFloors.ts` | `learnPremiumSections: 24` |
| `src/i18n/learnLocales.ts` `learnLockedHint` | Free 6 + 10 paths unchanged. Premium: one-sequence course plus specialist depth — 24 sections. |
| `learnCourseSubtitle` | Sequence first, specialist depth second. |
| `src/i18n/bundleLocales.ts` EN `bundlePillarLearnPremium` | Drop the stale “4 specialist courses”; sequence + specialist depth, chapter progress. Do **not** locale-farm 15 packs. |
| `LearnLockedPreview` `defaultValue`s | Match EN. `PREMIUM_PREVIEW` leads with the two new titles, then one specialist. |
| `docs/help/premium-and-billing.md` + `docs/help/pillars.md` Learn | Super Bundle Learn = sequence course + specialist depth; free intro stays free. No file paths in help. |

`payments.ts` already interpolates `CONTENT_FLOORS.learnPremiumSections` — no hand edit.

FREE_BETA still mutes Bundle UI (`LearnLockedPreview` returns null). Do not add checkout CTAs inside chapter bodies.

---

## 6. Reader wiring (minimal)

`CourseReader` currently renders body + CTA only, so a table/checklist in premium data would be invisible. Import existing `GuideSectionExtras` after the body paragraphs, `variant="app"`. No new chrome, tokens, heroes, or radius.

Optional `diataxis?: 'tutorial' \| 'how-to' \| 'explanation' \| 'reference'` on `GuideSection` in `types.ts`. Titles already name the type. **Do not** add i18n keys or a new label row in the reader — the field is for the guard.

---

## 7. Originality + docs

- Append rows to [guidebook-originality-log.md](guidebook-originality-log.md) for `pch11-s1`…`pch12-s4` and their teaching blocks. Writer: Mission Winning. Date: 2026-08-13.
- [issa-source-map.md](issa-source-map.md): Ch11–12 are **MW product** (no ISSA PDF). Specialist Ch7–10 unchanged.
- Index this plan in [docs/INDEX.md](INDEX.md) product-planning table.
- `src/data/INDEX.md`: note Ch11–12 in the guidebook row.

---

## 8. Tests (falsifiable)

New `src/lib/learn/oneSequenceSuperBundle.test.ts`:

1. **Discover** premium chapter ids from `premiumChapters.ts` source (do not import `server-only`). Assert `one-week-sequence` and `one-stack` exist; section ids `pch11-s1`…`pch12-s4` exist.
2. **Diataxis closed set:** those eight sections declare `diataxis` covering `{tutorial, how-to, explanation, reference}` at least once. Fail if a new premium section in these two chapters omits the field.
3. **Collision:** `chapters.ts` / `learnPaths.ts` / `magazineMeta.ts` do **not** contain `one-week-sequence`, `one-stack`, `pch11-`, `pch12-`. Free chapter ids remain exactly the six listed in §3. Free path count remains 10.
4. **Counts:** section id count in `premiumChapters.ts` equals `PREMIUM_LEARN_SECTION_COUNT` and `CONTENT_FLOORS.learnPremiumSections` (24).
5. **Originality log** mentions each of the eight section ids.
6. **Voice:** new chapter bodies must not match `/Win Score/`, `/\btrial\b/i`, `/PRIVATE_MODE/`, `/ISSA/` (user-visible), `/wearable required/i`.
7. **CourseReader** source includes `GuideSectionExtras`.
8. Mutant: deleting `one-stack` or dropping `diataxis` on a new section must fail (prove by construction in comments; run the suite).

Extend `contentInventory.test.ts` premium-id count to include guidebook sections parsed from `premiumChapters.ts` (same class as mobility/mind file counts).

---

## 9. Ship protocol (same commit as the chapters)

Hard rule 5:

- `APP_BUILD_LABEL` → `2026.07-unified.705`
- `LOG.md` heading `## 2026-08-13 — Learn original Super Bundle sequence (`.705`)` · rotate oldest (`.669`) to `docs/archive/log/` + archive INDEX row · keep ≤15 entries
- `CONTEXT.md` `## Now`: add `.705` bullet with full label; rotate oldest shipped bullet (the `.255` “three jobs” essay) so bullets stay ≤25. Standing Status table untouched. `Excellence-Override` trailer in the commit.

Do not flip `PRIVATE_MODE`. Do not add a trial. Draft PR. At most one preview.

---

## 10. Out of scope

- New pillar tabs, landing redesign, America/F5, locale body farms, magazine PDF rebuild, Learn hero WebP, Android, Coach engine changes, Bundle checkout UI, gating the free logger or free guidebook.

---

## 11. Done when

- This PLAN.md is committed (frozen) and the implementation matches it.
- Ch11 + Ch12 are in the premium guidebook API catalog.
- §3 still free; tests in §8 green.
- Draft PR body states what stayed free + `Excellence-Override: Learn original Super Bundle depth`.
