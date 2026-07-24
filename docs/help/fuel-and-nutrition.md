# Fuel and nutrition

The **Fuel** tab (`/nutrition`) helps you log what you eat and stay on target for protein and calories.

Estimates are **tools**, not medical advice. Always review macros before logging when the app asks you to.

## Daily log

1. **Targets** — Edit daily calories, protein, carbs, and fat (stored on this device), or **Set from goal** (lose / maintain / gain → Mifflin-style estimate from weight + activity).
2. **Recent** — one-tap re-log foods from today/yesterday (tap = log; **×** = adjust servings first).
3. **Describe what you ate** — natural language (`chicken rice broccoli`, `3 eggs`, `50g chicken`). Review the draft, use **Servings** (½–3×), fix numbers, then **Log meal**.
4. **Frequent / saved** — common and saved meals.
5. **Photo & detailed log** — meal chips, custom entry (full macros), or photo estimate.
6. **Search / barcode** — Open Food Facts; review draft (servings) before log. **Enter** selects the top search hit.
7. **Today’s meals** — grouped by breakfast/lunch/dinner/snack; edit (pencil) or delete.
8. **Past days** — browse recent days and **Copy to today**.
9. **Weight** — optional daily weight on Fuel (same local body metrics as Track); 7-day delta when you have history.

## Accuracy tips

| Method | Best for | Notes |
|--------|----------|--------|
| Database search / barcode | Packaged foods | Most accurate when the product is in Open Food Facts |
| Describe meal (matched) | Common whole foods | Keyword templates + quantities; always editable |
| Photo | When you have no label | **Vision AI** only if founder configured `MEAL_VISION_*`; otherwise a rough estimate from color/filename — edit or pick a database match |
| Custom | Anything | Full P/Cals/C/F by hand |

**Low confidence** drafts show a search box so you can replace guess macros with database values.

## Week glance and weight

A 7-day bar chart shows calories per day vs your target (amber when over). Data comes from local history (last ~90 days).

**Weight** on Fuel shares `mw_body_metrics` with Track (included in JSON backup). Log weight here for a quick trend next to the calorie bars.

## Goal → targets

**Set from goal** estimates daily calories with Mifflin-St Jeor × activity:

| Goal | Adjustment |
|------|------------|
| Lose | ~15% under TDEE (cut) |
| Maintain | ≈ TDEE |
| Gain | ~10% over TDEE (bulk) |

Protein scales from bodyweight; carbs/fat fill remaining calories. Always editable afterward. Not medical advice.

## Free vs open beta

| Always free | Open beta (current) | Paid Super Bundle (when re-enabled) |
|-------------|---------------------|-------------------------------------|
| Logger, search, barcode, photo path, recipes core | Full depth unlocked | Fuel Coach plans / deeper content |

## Founder: optional photo vision

Photo estimates can use a multimodal API when set (server only — never `NEXT_PUBLIC_`):

| Variable | Purpose |
|----------|---------|
| `MEAL_VISION_API_URL` | OpenAI-compatible chat completions URL (multimodal) |
| `MEAL_VISION_API_KEY` | Bearer key |
| `MEAL_VISION_MODEL` | Default `gpt-4o-mini` (or provider equivalent) |
| `MEAL_VISION_REQUIRE_ZDR` | `true` to require zero-data-retention header (same idea as coach LLM) |

Without these, photo log still works via local heuristics + Open Food Facts matching. See [ENV.md](../ENV.md).

## Tips

1. Hit protein first on training days.
2. Prefer barcode/search for packages; describe meal for home cooking.
3. Copy past days when meals repeat, then edit portions.
4. Water tracking is a simple daily win.

Questions: [faq.md](faq.md).
