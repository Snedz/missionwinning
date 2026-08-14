# Super Bundle Fuel — premium recipes + protein-first coach copy

**Status:** FROZEN. Implement only this file.  
**Lane:** Content / Fuel (one concern).  
**Build label:** `2026.07-unified.700` (do not mint `.698` or `.699`).  
**Excellence-Override:** Super Bundle Fuel premium recipes (content)

Overnight founder order: Super Bundle content depth so $59 beats buying MFP + Pliability + Calm separately. This PR owns **Fuel only**. Other agents own Move / Mind.

---

## Done looks like

- `PLAN.md` in this PR (this file)
- Recipe + inventory diff
- Honest free vs premium counts (shop copy cannot lie about Fuel)

---

## In scope

1. **+30 premium recipes** — `PREMIUM_RECIPES` 110 → **140**
2. **Inventory honesty** — floors, catalog meta, teasers, Fuel shop strings
3. **Protein-first coach copy** — Fuel Coach + Fuel insight + Fuel bundle blurbs
4. **Guards** so a later catalog add cannot leave shop copy stale

## Out of scope (refuse)

- Food database, barcode, TDEE / goal-wizard math
- Free recipe catalog (stays **48**)
- New tabs, à la carte pillar SKUs, trial
- Move / Mind / Learn catalog depth or their shop counts
- Restyle N1 www / landing
- Live Stripe, `PRIVATE_MODE` flip
- Rewriting the existing 110 premium rows (append only)
- Locale body farm (`i18n:fill` for all 15 packs)

---

## Why 140 (not another +8)

`.591` added 8 and stopped at 110. Super Bundle vs MFP is not a barcode catalog — it is a **cookable protein-first library** for garage / travel / leftover kitchens. +30 is one extra month of dinners, or a week of 4-slot days, without slop-farming hundreds of near-duplicates.

Free stays 48. Shop must say those two numbers, or interpolate them.

---

## Frozen recipe names (30)

Append these exact names to `src/data/recipes/premiumRecipes.ts`. No collisions with free or existing premium names.

**Breakfast**

1. Garage Whey Oat Mug
2. Cooler Cottage Apple Crunch
3. Skillet Turkey Egg Whites
4. Rice Cooker Chicken Congee Bowl

**No-cook / travel**

5. Tuna Pouch Rice Cooler
6. Jerky Cheese Apple Plate
7. Greek Yogurt Whey Travel Cup
8. Rotisserie Packet Street Plate
9. Canned Chicken Corn Salad

**One-pan / garage**

10. Cast Iron Turkey Hash
11. One-Pan Chicken Thigh Rice
12. Garage Chili Mac Lean
13. Sheet Pan Cod Broccoli
14. Skillet Steak Bites Peppers

**Post-session**

15. Post-Session Chocolate Milk Rice
16. Warm Whey Banana Mash
17. Garage Recovery Burrito Bowl
18. After-Lift Cottage Potato
19. Cold Chicken Pasta Tub

**Plant-complete**

20. Tempeh Peanut Garage Bowl
21. Lentil Turkey Tomato Pot
22. Edamame Egg Fried Rice
23. Black Bean Cottage Skillet

**Leftover / prep**

24. Sunday Chicken Batch Plate
25. Leftover Steak Egg Fried
26. Fridge Rice Protein Remix
27. Two-Day Turkey Soup Pot

**Rest / evening**

28. Slow Casein Cocoa Cup
29. Light Fish Microwave Rice
30. Garage Night Yogurt Crunch

### Recipe quality bar (every new row)

| Rule | Floor |
|------|--------|
| `protein` | ≥ 25 g (prefer ≥ 30) |
| `cals` | > 0 and plausible vs macros |
| `ingredients` / `instructions` / `tip` | all present; ingredients > 10 chars |
| Voice | Original MW — garage / train-anywhere / leftover. Mission briefing, not gym-bro. |
| Forbidden in new text | ISSA, Ch5, Ch12, MyFitnessPal, MFP, barcode, TDEE, “Free core”, competitor product names |
| Equipment | Pantry + one pan / microwave / no-cook. No restaurant plating. |
| Tip job | Coach the plate: protein first, then carbs around hard sessions. |

Reuse the existing `Recipe` shape (`name`, `protein`, `cals`, `carbs`, `fat`, `ingredients`, `instructions`, `tip`). Keep `import 'server-only'`.

---

## Inventory (single source)

| File | Change |
|------|--------|
| `src/data/recipes/catalogMeta.ts` | `PREMIUM_RECIPE_COUNT = 140` |
| `src/lib/contentFloors.ts` | `recipesPremium: 140` (`recipesFree` stays 48) |
| `src/data/premiumInventory.ts` | already re-exports recipe count — no new field |
| `PREMIUM_RECIPE_TEASERS` | replace phantom names with **three real new names** that exist in the catalog |

Current teasers (`Mediterranean Salmon Bowl`, `High-Protein Lentil Curry`, `Overnight Oats + Whey`) **do not exist** in either catalog. Locked replacements:

1. Garage Whey Oat Mug
2. Cast Iron Turkey Hash
3. Tuna Pouch Rice Cooler

`payments.ts` `BUNDLE_PILLARS.fuel` already interpolates `CONTENT_FLOORS`. After the floor bump, that blurb is honest **if** the premium sentence is updated (below). Do not hand-type 140 anywhere else.

---

## Protein-first coach copy (EN locked)

Do not invent new i18n keys. Rewrite these existing EN strings. Keep `defaultValue` in TSX identical to EN.

### Fuel Coach (`src/i18n/fuelLocales.ts` + call-site `defaultValue`)

| Key | New EN |
|-----|--------|
| `fuelCoachGenerateDesc` | Protein first from your logs — a 7-day plate plan from garage staples, then carbs around hard sessions. Not a food database. |
| `fuelCoachLockedDesc` | Protein-first week from your targets and training load — garage meals you can cook, not a barcode catalog. |
| `fuelCoachPreviewNote` | Protein first, then carbs on heavy days. Recipes from the Fuel library. |
| `fuelPremiumLockedBody` | Super Bundle adds the protein-first recipe library — garage and travel plates, not a food database. Logger stays free. |
| `fuelBundleUpsell` | Super Bundle adds protein-first recipes and the Fuel Coach week — logger stays free. |

TSX `defaultValue` must match: `FuelMealPlanCard.tsx`, `FuelLockedPreview.tsx`, `FuelRecipesPanel.tsx`.

### Today insight (`src/i18n/todayLocales.ts` + English floor)

| Key | New EN |
|-----|--------|
| `coachInsightNeedFuel` | You're training hard but protein is lagging. Hit protein first in Fuel — log a plate, not a barcode. |

Also update the English floor in `src/lib/readinessDisplay.ts` so a missing pack still paints the same sentence.

### Shop Fuel blurbs

`src/lib/payments.ts` Fuel premium line (counts stay interpolated):

```
`${CONTENT_FLOORS.recipesPremium} protein-first recipes, meal plans, coaching sync`
```

Fuel free line stays interpolated (`recipesFree`). No new digits.

`src/i18n/bundleLocales.ts` Fuel strings currently **lie** (`20 recipes` vs 48 shipped). Rewrite to interpolate:

| Key | New EN |
|-----|--------|
| `bundlePillarFuelFree` | Macro log, water, {{count}} free recipes |
| `bundlePillarFuelPremium` | {{count}} protein-first recipes + Fuel Coach week from your logs |

`BundlePage.tsx` compare-table `t(keys.premiumKey)` (and any Fuel freeKey if wired) must pass `count` from `CONTENT_FLOORS` for **Fuel only**. Do not “fix” Move / Mind / Learn counts in this PR.

Update existing **Fuel-only** locale overrides that already hardcode these keys (TS packs: es/fr/de/zh/id/th/ar/it/ru/ko/ja as present; JSON packs that already contain the keys). No `i18n:fill`. No new keys.

---

## Tests (falsifiable)

New: `src/lib/nutrition/fuelPremiumSuperBundle.test.ts`

1. `PREMIUM_RECIPE_COUNT === CONTENT_FLOORS.recipesPremium === 140`
2. `"name"` count in `premiumRecipes.ts` === 140
3. Free stays 48 (`FREE_RECIPE_COUNT`, `FREE_RECIPES.length`, `CONTENT_FLOORS.recipesFree`)
4. All 30 frozen names exist; each new row `protein >= 25`; names unique vs free + premium
5. New recipe source text has none of the forbidden tokens above
6. `PREMIUM_RECIPE_TEASERS` are a subset of premium names
7. EN coach / shop strings contain “protein first” / “protein-first” as specified; Fuel bundle strings use `{{count}}` and no literal recipe digit
8. `BundlePage` Fuel `t(...)` passes `count` from `CONTENT_FLOORS`
9. `payments.ts` Fuel premium interpolates `CONTENT_FLOORS.recipesPremium` and says protein-first

Update hardcoded **110** in `src/lib/today/continuityEvening591.test.ts` to **140** (keep the two existing name assertions).

Mutants the new test must kill:

- Floor or meta left at 110
- A frozen name omitted
- A new recipe under 25 g protein
- Teaser name not in the catalog
- Fuel shop string with a typed `20` / `110` / `140`

---

## Docs / ship protocol

Same commit as the code:

- `APP_BUILD_LABEL` → `2026.07-unified.700`
- `LOG.md` heading `## 2026-08-13 — Super Bundle Fuel premium recipes (`.700`)` — rotate oldest live entry (`.669`) to `docs/archive/log/` + `docs/archive/INDEX.md` (LOG is already at 15)
- `CONTEXT.md` `## Now` — add `.700` bullet; rotate oldest ship bullet (`.636`) into the dropped-detail comment so the block stays ≤25
- `src/data/INDEX.md` — point at this PLAN
- Help: one honest Fuel line in `docs/help/premium-and-billing.md` (no new tabs)

Commit trailer: `Excellence-Override: Super Bundle Fuel premium recipes (content)`

---

## Explicit non-goals (repeat)

No trial. Logger free forever. No à la carte Fuel SKU. No new Fuel tab. No food DB. No barcode work. No TDEE rewrite. No PRIVATE_MODE. No live Stripe. No `.698` / `.699`. No N1 www restyle. Preview at most one (prefer none — unit honesty is the proof).
