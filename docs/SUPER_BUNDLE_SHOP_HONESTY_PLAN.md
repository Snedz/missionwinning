# Super Bundle shop leftover — Move table + Train why + vs-stack help (`.707`)

**Status:** frozen 2026-08-13 overnight (amended). Implement **this file only**.

Specialists landed first. Do not collide:

| PR | Owns — do not touch |
|----|---------------------|
| **#498** | `/bundle` shop restore, `BundlePage` layout, `BundleShopStack`, checkout mute, `faq.md`, `premium-and-billing.md`, today/activeWorkout catalog keys |
| **#497** | Move catalog + `MoveLockedPreview` / `moveLocales` Pliability copy |
| **#499** | Fuel recipes + Fuel shop `{{count}}` strings + `FuelLockedPreview` |
| **#501** | Mind sessions + Mind shop strings + `MindLockedPreview` |
| **#502** | Learn chapters + Learn shop string + `LearnLockedPreview` |
| **#478** | Coach `sessionRationale` / why-this-session |

This is **not** [docs/PLAN.md](PLAN.md). Parent catalog plan: [SUPER_BUNDLE_CONTENT_PLAN.md](SUPER_BUNDLE_CONTENT_PLAN.md).

Excellence-Override: Super Bundle content depth vs competitor stack.

Ship label: **`2026.07-unified.707`** (`.705` is #498 and #502; `.706` is #500).

---

## One concern

The **below-fold `/bundle` compare table** still advertises **10 / 18 Move flows** (floors are **32 / 48**) and Train premium as **unlimited plans / chatbot**. Help still has no vs-stack page that names MFP + Pliability + Calm as what we are *not*.

#498's new shop cards interpolate other pillars with i18next `{{count}}`. This leftover does **not** rewrite that layout. Move table strings bake `CONTENT_FLOORS` so the table stays honest **without** editing `BundlePage` (Fuel/Mind specialists pass `count` only for their pillars).

---

## Honest counts (do not change)

| Catalog | Free | Premium |
|---------|------|---------|
| Move flows | 32 | 48 |

Other floors stay specialists' problem. This ship does not raise or lower any floor.

---

## Vs stack (this leftover only)

| Comp | They sell | Our leftover merch |
|------|-----------|--------------------|
| **Strong** | Paid logger | Unchanged — logger stays free. |
| **Fitbod / Coach apps** | Chatbot + black-box plan | Train table: log-cited **why** (inputs · rule · effect) + **adapt**. Do not change `adapt.ts` / `weekRationale.ts`. |
| **Pliability** | Video shelf | Table counts from floors. Catalog quality is #497. |
| **MyFitnessPal / Calm** | Food DB / streaks | Named only on the **help vs-stack** page as what we are not. Do not steal Fuel/Mind shop strings. |

No trial. No à la carte. No new tabs. No `PRIVATE_MODE`. No Stripe unmute. No `BundlePage` rewrite.

---

## In scope

1. **`bundleLocales` Train + Move only** (EN + it/ru/ko/ja overrides). Move free/premium read `CONTENT_FLOORS` at module load (not i18next `count`). Train premium = log-cited why + adapt.
2. **Pack overlays** for those three keys — delete or rewrite so they cannot re-type 10/18/unlimited.
3. **`public/locales/*/bundle.json`** — same three keys, honest digits / Train wording.
4. **`payments.ts` Train premium wording only** (counts already interpolate; Fuel/Mind wording is #499/#501).
5. **Help:** [mission-coach.md](help/mission-coach.md) why-line; **new** [super-bundle-vs-stack.md](help/super-bundle-vs-stack.md) so we do not edit #498's `faq.md` / `premium-and-billing.md`.

---

## Out of scope (refuse)

- `BundlePage.tsx`, `UnlockButton`, shop stack, Stripe, `PRIVATE_MODE`
- `premiumMobilityFlows.ts`, `MoveLockedPreview`, `moveLocales`
- Fuel / Mind / Learn catalogs, locked previews, their `bundleLocales` keys
- `adapt.ts`, `weekRationale.ts`, `sessionRationale.ts`
- New tabs, trial, à la carte, Android / Expo

---

## Tests (falsifiable)

- After pack overlay, every `APP_LANG` Move free/premium string contains the floor digit and not `\b18\b` / `\b10\b` as the catalog count.
- EN Train premium has no `unlimited` and cites why/adapt.
- Pack files that still overlay those keys cannot re-lie.
- `public/locales/*/bundle.json` Move premium cannot say 18.
- Help vs-stack page exists; says no trial; names the stack as what we are not.
- Mutant: `"18 timed recovery"` in EN `bundlePillarMovePremium` goes red.

---

## Docs / ship

Same commit: LOG (rotate `.669` → `LOG-rotate-669-for-707.md`), `CONTEXT.md` `## Now`, `APP_BUILD_LABEL` `2026.07-unified.707`. Trailer: `Excellence-Override: Super Bundle content depth vs competitor stack`.

Draft PR. Preview at most one. Do not merge.
