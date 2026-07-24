# Fuel and nutrition

The **Fuel** tab (`/nutrition`) helps you log what you eat and stay on target for protein and calories.

Estimates are **tools**, not medical advice. Always review macros before logging when the app asks you to.

## Daily log

1. **Targets** — Edit daily calories, protein, carbs, and fat (stored on this device).
2. **Describe what you ate** — natural language (`chicken rice broccoli`, `3 eggs`, `50g chicken`). Review the draft, fix numbers, then **Log meal**.
3. **Quick chips** — frequent foods and saved meals.
4. **Photo & detailed log** — meal chips, custom entry (full macros), or photo estimate.
5. **Search / barcode** — Open Food Facts database; review draft before log.
6. **Today’s meals** — grouped by breakfast/lunch/dinner/snack; edit (pencil) or delete entries.
7. **Past days** — browse recent days and **Copy to today**.

## Accuracy tips

| Method | Best for | Notes |
|--------|----------|--------|
| Database search / barcode | Packaged foods | Most accurate when the product is in Open Food Facts |
| Describe meal (matched) | Common whole foods | Keyword templates + quantities; always editable |
| Photo | When you have no label | **Vision AI** only if founder configured `MEAL_VISION_*`; otherwise a rough estimate from color/filename — edit or pick a database match |
| Custom | Anything | Full P/Cals/C/F by hand |

**Low confidence** drafts show a search box so you can replace guess macros with database values.

## Week glance

A 7-day bar chart shows calories per day vs your target (amber when over). Data comes from local history (last ~90 days).

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
