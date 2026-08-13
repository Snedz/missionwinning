# Super Bundle content depth — frozen plan (`.700`)

**Status:** frozen 2026-08-13. Catalog volume in this file is for specialists.

**Overnight leftover (2026-08-13):** Move catalog is **#497**; Victory Move seam is **#491**. Do not collide. Implement [SUPER_BUNDLE_SHOP_HONESTY_PLAN.md](SUPER_BUNDLE_SHOP_HONESTY_PLAN.md) only (shop counts, Coach why-line merch, FAQ — label `.705`).

**Status (parent):** frozen 2026-08-13. Do not add catalog volume, new tabs, a trial, à la carte pillars, or a food database.

This is **not** [docs/PLAN.md](PLAN.md) (build phases A–I). One concern: paid depth that is credibly better than buying MFP + Pliability + Calm + Fitbod-Coach, while Strong-class logging stays free.

Excellence-Override: Super Bundle content depth vs competitor stack.

---

## Honest counts (do not change)

Measured from `contentInventory` / `catalogMeta` / `premiumInventory` **before this ship**. Floors stay; shop copy must match.

| Catalog | Free | Premium | After this ship |
|---------|------|---------|-----------------|
| Move flows | 32 | 48 | **32 / 48** (rewrite + tags + one ID fix; no adds) |
| Mind sessions | 32 | 60 | **32 / 60** (rewrite overlap + tags; no adds) |
| Fuel recipes | 48 | 110 | **48 / 110** (premium tips only; no adds) |
| Learn premium sections | — | 16 | **16** (4 chapters × 4; rewrite in place) |
| Guidebook free chapters | 6 | — | unchanged |
| Exercise pages | 228 | — | unchanged |

If a count would change, **stop** and update inventory + floors + shop interpolation in the same commit. This plan chooses **not** to change counts.

---

## Competitor stack (what we are *not*)

| Comp | They sell | Super Bundle sells instead |
|------|-----------|----------------------------|
| **Strong** | Paid logger | Logger stays **free**. Never gate `/active`. |
| **Fitbod / Coach apps** | Chatbot + black-box plan | Log-cited **why** + **adapt** on the week (already `.693`). Chat is not the SKU. |
| **Pliability** | Video mobility shelf | One flow **prescribed from last session** on existing `/move`. |
| **MyFitnessPal** | Food DB / barcode | Recipes + **protein-first Fuel Coach** (training-load adapt). Barcode may exist as a tool; it is **not** the paid pitch. |
| **Calm** | Meditation library + streaks | Short, **skippable**, training-adjacent sessions. **No streak guilt.** |

No trial. No à la carte. Seams not rooms (no new tabs/routes).

---

## In scope (quality, not volume)

### 0. Shop honesty

`BUNDLE_PILLARS` already interpolates `CONTENT_FLOORS`. **`bundleLocales` still lies** (18 Move / 22 Mind / 4 Learn courses vs 48 / 60 / 16). Locked-preview hints still say 10+11 Move and 10+17 Mind.

- EN (and stale locale overrides) interpolate floors or drop hardcoded counts.
- `/bundle` table passes `count` from `CONTENT_FLOORS`.
- Strip clone framing: Pliability, Calm / Waking Up, “sleep stories”, ISSA-cert course list.
- Train premium copy: log-cited why + adapt — not “unlimited plans / chatbot”.
- Fuel premium copy: recipes + protein-first coaching — not barcode / food database.
- Help: [help/premium-and-billing.md](help/premium-and-billing.md) matches the same story.

### 1. Coach (copy + existing engine)

Do **not** change `adapt.ts` / `weekRationale.ts`. Sell what already ships on `/coach`:

- Why-this-week = inputs · rule · effect from logs.
- Adapt = missed / readiness / equipment / load-hold.
- Chat stays available as Bundle chrome; it must not replace the plan in merch.

### 2. Move — prescribed from training

- New pure `src/lib/move/prescribeFromTraining.ts`: last log’s `muscleGroups` → **one** flow id + reason.
  - After lower today → prefer `post-legs-deep-flush-20` (premium) else free `post-squat-flush-12`.
  - After upper today → prefer `overhead-athlete-shoulders-18` else free `pre-overhead-prime`.
  - Else after train → `post-lift-full-body` / free recovery.
  - History but not today → pre-session prime (not shame).
  - No history → `null` (no fake prescription).
- `/move` seam: one “Prescribed after today’s session” card + Start. No new route. Do not auto-play.
- Fix ID collision: premium `morning-wake-up` duplicates free `morning-wake-up` (free wins in `.find()`). Rename premium id.
- Tag the untagged premium flows so collections match. Differentiate 2–3 near-duplicate **names/cues** from free. Do not add flows.

### 3. Mind — not Calm

- Merch: skippable timed sessions, no streak trophy.
- Sleep-week banner: skip any night; sequence is optional; **no streak**.
- Player already has Skip — do not add guilt copy.
- Rename overlapping titles (`post-loss-reset` vs `anger-after-bad-session` both “After a bad session”).
- Tag untagged premium sessions. Do not add sessions. Do not add sleep stories.

### 4. Fuel — not MFP

- Do **not** expand OpenFoodFacts / barcode / search as the SKU.
- Rewrite premium recipe **tips**: forbid “Free core”. Protein-first + train-anywhere. Keep the 110 recipes.
- Fuel Coach locked copy: protein target + training-load adapt, not a static meal selfie.

### 5. Learn — Diataxis, Train+Coach wedge

Rewrite `premiumChapters.ts` in place (**16 sections**). Original MW wording. Practice CTAs to `/active`, `/coach`, `/log` only.

| Chapter (new id) | Diataxis | Job |
|------------------|----------|-----|
| `first-week-with-coach` | tutorial | Log a week so Coach can see you |
| `how-to-adapt` | how-to | Miss / strain / gear / RPE so adapt fires |
| `why-the-week-changed` | explanation | Why ≠ chatbot; inputs · rule · effect |
| `coach-log-reference` | reference | What Coach reads / never reads |

Log originality. Update Learn locked preview teasers. Drop “Coaching Business” / bodybuilding-cert / sports-nutrition-depth as the paid Learn story.

---

## Out of scope (refuse)

- New tabs, routes, pillars, locales, America, F5, landing / N1 www restyle
- Trial, Stripe unmute, `PRIVATE_MODE`, à la carte SKUs
- Adding Move/Mind/recipe/Learn counts
- Scraping copyrighted programs; rewriting `premiumProgramTemplates`
- Chatbot replacing the plan; streak/guilt Mind
- Food database as Super Bundle value
- Stealing parallel `.698` / `.699` ships — this label is **`.700`**
- Android / Expo

---

## Tests (falsifiable)

- Floors still 32/48, 32/60, 48/110, 16; inventory = file id/name counts
- Premium Move/Mind ids ∩ free ids = ∅; premium recipe names ∩ free names = ∅
- No `Free core` in `premiumRecipes.ts` tips
- Merch EN: no Pliability / Calm / Waking Up / MyFitnessPal / Fitbod clone framing; `/bundle` interpolates floors
- `prescribeFromTraining`: empty history → null; legs today → post-legs flagship; no shame copy
- Sleep-week copy matches skip / no-streak
- Premium Learn: 16 sections, each has `diataxis` in {tutorial, how-to, explanation, reference}; CTAs only `/active|/coach|/log`
- Mutant: colliding Move id or stale “18 flows” in EN bundle copy must go red

---

## Docs / ship

Same commit: this file + INDEX route, LOG, `CONTEXT.md` `## Now`, `APP_BUILD_LABEL` `2026.07-unified.700`, originality log, `src/data/INDEX.md` / `src/lib/move/INDEX.md` if file lists change. Trailer: `Excellence-Override: Super Bundle content depth vs competitor stack`.
