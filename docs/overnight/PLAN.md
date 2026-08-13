# Overnight freeze — Super Bundle Mind premium (journal sessions)

**Status:** FROZEN. Implement only this document. Do not add tabs, audio, trials, locale farms, Android, or a meditation-library expansion.

**Override:** `Excellence-Override: Super Bundle Mind premium (content)`  
Horizon W RESULT is unscored; `/mind` and `src/lib/mind` are surface. Trailer required on the ship commit and draft PR body.

**INTEL_HEALTH_SEQUENCE:** not in this product git (ops / `.hermes` are LOCAL). Locked reading: **journal/question steps beat a Calm-style meditation library.** Do not invent a clinical protocol or a new series tab.

---

## Honest inventory (measured 2026-08-13 on `master` @ `.697`)

| Catalog | Count | Floor (`CONTENT_FLOORS`) | What athletes can still be told |
|---------|------:|-------------------------:|----------------------------------|
| Free guided (`GUIDED_MIND_SESSIONS`) | **32** | `mindFree: 32` | Honest on `/mind` counted headings |
| Premium guided (`PREMIUM_MIND_SESSIONS`) | **60** unique ids | `mindPremium: 60` | **Lies:** locked preview `10` + `17`; bundle i18n `10` + `22`; `docs/PLAN.md` I3b `17` Mind |
| Move premium | 48 | 48 | Out of scope (do not “fix” Move this ship) |

`payments.ts` `BUNDLE_PILLARS` already interpolates `CONTENT_FLOORS`. **`BundlePage` ignores those strings** and renders `t('bundlePillarMindPremium')` → **"22 guided sessions"**. Same class of defect `.606` fixed in `payments.ts`.

`MindLockedPreview` (hidden while `FREE_BETA`) still merchandises **Calm / Waking Up** and **sleep stories**, with **10 / 17**.

---

## Goal

Ship **original MW** Super Bundle Mind depth that is:

1. **Journal/question style** — timed steps the athlete *answers*, not a body-scan / box-breath library clone.
2. **Skippable** — reuse `GuidedStepPlayer` Skip (already wired). No “don’t skip” copy.
3. **No streak guilt** — missed days are data; no streak, freeze, or “don’t break the chain.”
4. **No Calm clone** — no competitor names, no sleep stories, no spa library pitch.
5. **Not clinical** — no diagnosis, therapy, SSRI, disorder, crisis care. Training questions only. [docs/EXERCISE_AS_MEDICINE.md](../EXERCISE_AS_MEDICINE.md) boundary.
6. **Not a new tab** — stay on `/mind`. Do **not** add a collection chip, series rail, route, or nav item. Existing `MIND_COLLECTIONS` length stays **8**.
7. **Honest counts** — floors, constants, preview, bundle Mind row, and `docs/PLAN.md` I3b all state the **new** premium count.

No trial. No `PRIVATE_MODE` flip. Draft PR. At most one preview (the PR’s).

---

## What we will add

**+8 premium sessions** in `src/data/premiumMindSessions.ts`.

| After this ship | Value |
|-----------------|------:|
| Premium ids / `PREMIUM_MIND_SESSION_COUNT` / `CONTENT_FLOORS.mindPremium` | **68** |
| Free (unchanged) | **32** |
| Unlocked total under free-beta | **100** |

### Session ids (frozen)

All ids unique vs the existing 60. Tag with **existing** collection tags only (plus `journal` for tests — `journal` is **not** a collection id).

| id | Collection tags | Minutes | Job |
|----|-----------------|--------:|-----|
| `journal-session-size` | `pre-lift`, `focus` | 5 | Smallest session you will actually finish today |
| `journal-missed-day` | `stress`, `recovery` | 5 | What got in the way; next physical action — no shame |
| `journal-sleep-data` | `sleep` | 5 | Last night as data, not a morality score |
| `journal-after-heavy` | `post-train`, `recovery` | 6 | Where the work sits; sharp vs tired |
| `journal-travel-plan-b` | `travel`, `focus` | 4 | Hotel gym, floor, or walk — start in 10 minutes |
| `journal-feed-vs-program` | `focus`, `anxiety` | 5 | Their highlight vs your next set |
| `journal-one-cue` | `pre-lift`, `focus` | 4 | Keep one cue; drop one |
| `journal-week-close` | `recovery`, `focus` | 6 | Sessions completed; one adjustment; no streak trophy |

### Step rules (every new session)

- ≥4 steps; `minutes` 4–6; step durations sum within ~±30s of `minutes * 60`.
- **≥2 steps contain `?`** (the journal test).
- At most one settle-breath step; the rest are questions or a single commit line.
- Original MW athlete voice (train-anywhere, logs, Coach week). No spa, no “inner peace,” no namaste, no chakras.
- Forbidden substrings in new bodies: `streak`, `Calm`, `Headspace`, `Waking Up`, `sleep stor`, `diagnos`, `depress`, `therap`, `SSRI`, `PTSD`, `disorder`, `suicid`, `clinical`.
- No “do not skip” / “must finish.” Skip is allowed.
- Unique `id`; unique `title` (existing catalog already duplicates “After a bad session” — do not add a third).

Reuse `GuidedMindSession` shape. **No schema change.** Server-only file stays `import 'server-only'`.

---

## Copy + count honesty (same ship)

### Must change

| File | Change |
|------|--------|
| `src/data/premiumMindSessions.ts` | Append the 8 sessions |
| `src/data/premiumInventory.ts` | `PREMIUM_MIND_SESSION_COUNT = 68` |
| `src/lib/contentFloors.ts` | `mindPremium: 68` |
| `src/i18n/mindLocales.ts` | Drop Calm / Waking Up / sleep stories / guided-meditation pitch. `mindLockedHint` interpolates `{{free}}` + `{{premium}}` (no literal 10/17). |
| `src/components/mind/MindLockedPreview.tsx` | Pass `getContentInventory()` into `mindLockedHint`; defaultValues match EN pack. Demo steps become question-shaped, not box-breath. |
| `src/i18n/bundleLocales.ts` | `bundlePillarMindFree` / `bundlePillarMindPremium` use `{{count}}` (no literal 10/22). |
| `src/page-components/BundlePage.tsx` | Mind row: `t(freeKey/premiumKey, { count: CONTENT_FLOORS.mindFree\|mindPremium, defaultValue: pillar.free\|premium })`. Other pillars unchanged. |
| `src/lib/payments.ts` | Mind premium blurb may mention skip + journal prompts; **still interpolate** `CONTENT_FLOORS` (no new hand-typed digits). |
| Pack overlays that still say Calm / sleep stories / `10`+`22` for those Mind keys | Replace with the new EN (mind is not a beachhead CORE_NS). |
| `public/locales/**/mind.json` | `npm run export-locales` so HTTP overlays are not a second Calm clone. |
| `docs/PLAN.md` I3b | `17 Mind + 11 Move` → **68 Mind + 48 Move** (honest floors). |
| `docs/help/pillars.md` Mind | One sentence: skippable journal-style sessions, not a meditation app. |
| `vision.md` Mind pillar bullet | Surgical: premium is skippable training questions / recovery prompts — **not** “Full Calm/Waking Up-style.” Do not rewrite the Super Bundle section. |

### Must not change

- `MIND_COLLECTIONS` / `MIND_SERIES` / sleep-week rail.
- Free catalog (`guidedMindSessions.ts`).
- `GuidedStepPlayer` (skip already exists).
- `PRIVATE_MODE`, Stripe, trials, free-logger gates, Android, new API routes, new i18n keys unless a defaultValue has no key (prefer editing existing keys).
- Rewriting the existing 60 premium sessions (meditation-heavy debt stays; this ship *adds* the journal pack and stops *selling* Calm).

---

## Tests (falsifiable)

1. Update `mindPremD2_588.test.ts`: floor **68**; id-count **68**; constants match file.
2. New `src/lib/mind/mindJournalPrem.test.ts`:
   - The 8 ids exist, unique vs whole catalog, tags, ≥2 `?` steps, duration mix.
   - `MIND_COLLECTIONS.length === 8` and no `journal` collection id.
   - Source scan of **new ids’ bodies** for forbidden streak/clinical/Calm tokens.
   - `mindLocales.ts` + `MindLockedPreview.tsx` EN/defaultValues: no `Calm`, `Waking Up`, `Headspace`, `sleep stor`; `mindLockedHint` contains `{{free}}` and `{{premium}}`.
   - Mutant: deleting one journal id or putting `Calm` back in the title must fail (run the test against a deliberate break once, then restore).
3. Existing `contentInventory.test.ts` / `payments.test.ts` stay green via floor bump only.
4. No new e2e. No visual baselines.

---

## Ship protocol (same commit as the code)

- Label `2026.07-unified.698` (past master `.697`).
- `LOG.md` new heading `## 2026-08-13 — Super Bundle Mind journal sessions (`.698`)`. Rotate oldest live entry (`.669`) → `docs/archive/log/` + `docs/archive/INDEX.md` (live LOG is already 15/15).
- `CONTEXT.md` `## Now`: add `.698` bullet; drop oldest numbered ship bullet (`.636`) so the `- **` count stays ≤25. Standing Status table untouched. Never flip `PRIVATE_MODE`.
- Commit trailer + PR body: `Excellence-Override: Super Bundle Mind premium (content)`.
- Draft PR. Do not merge. Do not request extra previews.

---

## Out of scope (refuse if tempted)

- New `/mind/*` route or collection tab.
- Audio CDN / sleep stories / expert lesson library.
- Wiring Mind sessions into `src/lib/journal/` (that domain is **training notes**, not this pack).
- Clinical screening, crisis flows, streak freeze, Duo guilt.
- Move / Fuel / Learn content.
- Locale body farms beyond replacing Calm/stale-count overlays for the keys this ship edits.
- Founder tasks, traction numbers, `PRIVATE_MODE`.
