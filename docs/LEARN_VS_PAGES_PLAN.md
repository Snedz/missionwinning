# Learn vs-pages — frozen plan (`.716`)

**Status:** frozen. Implement **only** this file.  
**Label:** `2026.07-unified.716` (occupied `.698`–`.715` on other drafts).  
**Excellence-Override:** Learn vs-pages AEO  
**Preview:** one draft PR max. Do not flip `PRIVATE_MODE`.

This is **product Learn** (open HTML on `/guide`). It is not Growth’s docs-only [#486](https://github.com/Snedz/missionwinning/pull/486). Read #486 / `seo/aeo` briefs for **structure**, then write **original** copy. Do not merge, rebase onto, or edit #486.

---

## Why

Answer engines cite **comparison pages**, not praise pages (Gamma AEO). Titles match how people type into ChatGPT: **Mission Winning vs Strong**, **vs Hevy**, **vs Fitbod**.

Diataxis: **explanation** (who each product is for, what differs). Not a tutorial, not a how-to, not magazine curriculum.

---

## Pages (exactly three)

| Id | H1 | Public URL |
|----|----|------------|
| `mission-winning-vs-strong` | Mission Winning vs Strong | `/guide/mission-winning-vs-strong` |
| `mission-winning-vs-hevy` | Mission Winning vs Hevy | `/guide/mission-winning-vs-hevy` |
| `mission-winning-vs-fitbod` | Mission Winning vs Fitbod | `/guide/mission-winning-vs-fitbod` |

No Boostcamp page. No `/compare` restore (`.668` / `.692` redirect stays). No Medium/Substack. No paywall, no Super Bundle hero, no trial SKU.

---

## Collision freeze (do not touch)

| Owner | Paths / ids |
|-------|-------------|
| #496 | Ch3 `programming-tuning`, `pd-0` |
| #479 | Strength Basics `sb-0`, `learnPaths.ts`, `learnLessonEnhancements.ts` |
| #502 | Ch11/Ch12 (`one-week-sequence`, `one-stack`) if present on other branches; `premiumChapters.ts` |
| Magazine | `magazineMeta.ts`, print `/guide/print`, `public/learn/*-hero.webp` |
| Growth | `seo/aeo/**`, #486 files |
| Curriculum | `src/data/guidebook/chapters.ts` (keep floor at **6**) |

Add **new** catalog ids only. Do not fight those drafts.

---

## Architecture

New catalog, not magazine chapters:

- `src/data/learnVsPages.ts` — three explanation pages (English bodies; reuse `GuideSection` table/callout/checklist furniture).
- `src/lib/learnVsPages.ts` — lookup, hrefs, JSON-LD (`Article` + `isAccessibleForFree: true`).
- `src/page-components/LearnVsPublicPage.tsx` — **Server Component** + `PublicPageShell` (citation chrome, **not** magazine TOC / `CH 07`).
- Thin routes: `app/guide/mission-winning-vs-{strong,hevy,fitbod}/page.tsx` (`force-static`). Static segments beat `app/guide/[chapter]`.
- Sitemap: emit the three URLs (already under public `/guide` prefix while gated).
- `/guide` index: a **Compare** band of three links — not “All chapters” / not `CH` numbers.
- Cross-links between the three pages + `/welcome` + `/guide`. No `/bundle` hero. No competitor trademarks in logo lockups (text names only).

**i18n:** English-only catalog. No new `t('…')` keys (no locale farm; `i18n:parity` / coverage stay clean). Chrome via existing `PublicPageShell` English defaults.

**Counts:** `CONTENT_FLOORS.guidebookFreeChapters` stays **6**. Premium Learn section floor stays **16**. Vs-pages are a separate catalog of **3**.

---

## Honest facts (do not invent)

**Mission Winning (verify on this tree):**

- Free forever **logger** — never for sale. Super Bundle is the only paid SKU (muted in free-first beta; do not pitch checkout).
- Offline, no account to log a set. Coach from **logs**, no wearable required.
- CSV **import** of Strong/Hevy is **live** (`importCsv.ts` + Profile card).
- CSV **export** in Strong/Hevy dialects is **not on master** (draft #490). Say **product intent**, not live. JSON device backup **is** live.
- Beta 0.1. No traction, user counts, “#1”, testimonials, or “ChatGPT recommends us.”
- Voice: **Train Anywhere. Win Daily.** No everything-app / WeChat / MySpace / civilizational cosplay.

**Competitor intel (founder-confirmed in #486 AEO brief — use; do not “correct” without a new in-repo source):**

| Product | Must say | Must not say |
|---------|----------|----------------|
| Strong | Free = **3 templates**, not locked logs. Polished gym-logger UX. | Logs are paywalled. We are faster. |
| Hevy | **Social is free.** Approachable logger + feed. | Social is paid. MW has an in-app Feed. |
| Fitbod | **7-day trial**, then paid AI programming. Convenient day-of plans. | **3 workouts then lock** (false). No free/trial path. |

Do not paste competitor help text. Do not cite third-party ARR.

---

## Page shape (each)

1. **Lead (40–60 words):** who each is for + one wedge sentence. No superlatives.
2. **H2 Comparison table** — rows: free tier (errata), account to start?, offline logging, wearable required?, coach model, social feed, bodyweight/park, CSV in/out (honest: import live / Strong-Hevy export planned).
3. **H2 Where they win** — name it.
4. **H2 Where Mission Winning differs** — wedge only.
5. **H2 Who should pick what** — include “stay on X if…”.
6. **CTA:** Start free → `/welcome`. While gated, do **not** say “we’re live / open beta.” Logger is free; `/welcome` is already a public path.

Diataxis extras: one callout per page (key distinction). Optional “who should stay” checklist.

---

## Tests (`src/lib/learnVsPages.test.ts`)

Discover the catalog rather than hardcoding a private copy of bodies.

- **Catalog ids** — exactly the three ids; each has a public `/guide/…` href; sitemap source includes them.
- **Originality / voice** — ban: everything-app, WeChat, MySpace, civilizational cosplay, `#1`, invented traction / user counts, Fitbod “3 workouts”, Strong “locked logs”, Hevy “paid social”, Bundle-as-hero, in-app Feed merch, “we’re live”.
- **Counts honest** — guidebook chapters still 6; vs catalog length 3; CSV export-live claim absent; import + planned-export wording present.
- Collision: vs source files do not edit frozen paths (assert those files are not in this ship’s concern — test reads `learnVsPages.ts` only).
- JSON-LD `isAccessibleForFree`.
- `check-build-label` `.716` + LOG heading + CONTEXT `## Now` (implementation commit, not this freeze).

Falsify: a mutant that claims Fitbod “3 workouts then lock” or that Strong/Hevy CSV **export** is live must fail.

---

## Ship protocol (implementation commit only)

- `APP_BUILD_LABEL` → `2026.07-unified.716`
- LOG.md entry (`.716`); rotate oldest live `##` if over 15
- CONTEXT.md `## Now` bullet; rotate oldest **ship** bullet if over 25 (keep Status table)
- Originality log row for the three pages
- INDEX rows: `src/data/INDEX.md`, `app/INDEX.md`, `src/page-components/INDEX.md`
- Draft PR title: `Learn vs Strong / Hevy / Fitbod citation pages (.716)`
- Commit trailer: `Excellence-Override: Learn vs-pages AEO`

---

## Out of scope

- `llms.txt`, Reddit posts, Ch4 FAQ blocks, Boostcamp vs-page, restoring `/compare`, locale packs, magazine PDF, Learn in-app paywall, secrets/EIN, `PRIVATE_MODE`, Craft UI chrome, #490 export code.

---

## Definition of done

Three original, free, indexable `/guide/mission-winning-vs-*` explanation pages; honest table including CSV intent; tests green; `.716` ship protocol; draft PR; freeze files untouched.
