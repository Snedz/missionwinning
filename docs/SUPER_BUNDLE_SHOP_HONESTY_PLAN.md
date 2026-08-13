# Super Bundle shop honesty — leftover freeze (`.705`)

**Status:** frozen 2026-08-13 overnight. Implement **this file only**.

Move catalog is already owned by specialist **#497** (premium flows) and Victory seam **#491**. Do not touch `premiumMobilityFlows.ts`, `mobilityFlows.ts`, `MovePage.tsx`, `MoveLockedPreview.tsx`, or `moveLocales` locked/Pliability keys. Do not rewrite Fuel recipes, Mind sessions, or `premiumChapters.ts`.

This is **not** [docs/PLAN.md](PLAN.md) (build phases A–I). The parent catalog plan remains [SUPER_BUNDLE_CONTENT_PLAN.md](SUPER_BUNDLE_CONTENT_PLAN.md). This leftover is the shop/FAQ gap specialists will not own.

Excellence-Override: Super Bundle content depth vs competitor stack.

Ship label: **`2026.07-unified.705`** (overnight PRs already claim `.698`–`.704`).

---

## One concern

`/bundle`, locked-preview merch (Mind / Fuel / Learn), Coach why-line copy, and help FAQ must state **honest floors** and **what the $59 Super Bundle is instead of** MFP + Pliability + Calm as separate apps.

`BUNDLE_PILLARS` already interpolates `CONTENT_FLOORS`. **`bundleLocales` still lies** (18 Move / 22 Mind / 4 Learn courses vs 48 / 60 / 16). Pack overlays re-type the same stale digits. Locked Mind/Learn hints still say 10+17 and ISSA-cert courses. Train merch still says “unlimited plans / chatbot.” Fuel merch can be read as a food DB. Help still says “individual modules.”

---

## Honest counts (do not change)

Same floors as the parent plan. This ship **does not** raise or lower them. #497 may later raise Move premium to 56 — interpolation from `CONTENT_FLOORS` is how this page stays honest when that lands.

| Catalog | Free | Premium |
|---------|------|---------|
| Move flows | 32 | 48 |
| Mind sessions | 32 | 60 |
| Fuel recipes | 48 | 110 |
| Learn premium sections | — | 16 |
| Guidebook free chapters | 6 | — |

---

## Vs stack (merch, not new rooms)

| Comp | They sell | Super Bundle merch instead |
|------|-----------|----------------------------|
| **Strong** | Paid logger | Logger stays **free**. Never gate `/active`. |
| **Fitbod / Coach apps** | Chatbot + black-box plan | Log-cited **why** (inputs · rule · effect) + **adapt**. Do not change `adapt.ts` / `weekRationale.ts`. |
| **Pliability** | Video mobility shelf | Timed original flows; counts from floors. Move catalog quality is #497. |
| **MyFitnessPal** | Food DB / barcode | Recipes + **protein-first Fuel Coach** (training-load adapt). Barcode is a tool, not the SKU. |
| **Calm** | Library + streaks | Short, **skippable**, training-adjacent sessions. **No streak guilt.** |

No trial. No à la carte. No new tabs. No `PRIVATE_MODE`. No Stripe unmute.

---

## In scope

### 1. Shop `/bundle`

- EN + stale it/ru/ko/ja pillar strings interpolate `{{n}}` from `CONTENT_FLOORS` (not i18next `count`, which triggers plurals).
- `BundlePage` passes `n` via a small helper. Table shows free + premium lines so floors are visible.
- Strip clone framing from **our** Train/Fuel/Mind/Learn merch. Competitor names may appear in help as “what we are not.”
- Train premium: log-cited why + adapt — not unlimited plans / chatbot.
- Fuel premium: `{{n}}` recipes + protein-first coaching — not barcode / food database.
- Mind premium: `{{n}}` skippable timed sessions — no streak.
- Learn premium: `{{n}}` sections with chapter progress — not “4 ISSA courses.”
- Delete stale pack overlays for those keys so HTTP/pack cannot re-lie.
- Align `payments.ts` Train/Fuel/Mind **wording** (counts already interpolate).

### 2. Locked previews (not Move)

- Mind: interpolate `mindFree` / `mindPremium`; drop Calm / Waking Up / sleep stories; skippable, no streak.
- Learn: interpolate guidebook chapters + 16 sections; drop ISSA-cert teaser list as the SKU pitch. Keep teaser **titles matching shipped** `premiumChapters.ts` (do not invent Diataxis chapter ids this ship).
- Fuel locked desc: protein-first + training-load adapt.
- Sleep-week banner: skip any night; sequence optional; no streak.
- **Do not** edit `MoveLockedPreview` / `moveLockedHint` (#497).

### 3. Help FAQ

- [premium-and-billing.md](help/premium-and-billing.md): Super Bundle is the only paid SKU; no “individual modules”; logger never gated; no trial.
- [faq.md](help/faq.md) + [mission-coach.md](help/mission-coach.md): why-this-week = inputs · rule · effect; chat is not the SKU.

---

## Out of scope (refuse)

- Move / Fuel / Mind catalog rewrites; Learn `premiumChapters.ts`
- New tabs, routes, pillars, locales, America, F5, N1 www
- Trial, Stripe, `PRIVATE_MODE`, à la carte
- Changing floors or adding volume
- Android / Expo

---

## Tests (falsifiable)

- After pack overlay, every APP_LANG bundle pillar count string contains `{{n}}` and no leftover digit.
- `bundlePillarI18nVars` returns the matching `CONTENT_FLOORS` value; `BundlePage` passes `n`.
- EN merch we own (bundle + Mind/Learn/Fuel locked keys) has no Pliability / Calm / Waking Up / MyFitnessPal / Fitbod **clone framing**.
- Help premium page does not say “individual modules.”
- Mutant: stale “18 timed recovery” in EN `bundlePillarMovePremium` (or a pack overlay of `18`) goes red.

---

## Docs / ship

Same commit as the copy: LOG (rotate `.669`), `CONTEXT.md` `## Now`, `APP_BUILD_LABEL` `2026.07-unified.705`. Trailer: `Excellence-Override: Super Bundle content depth vs competitor stack`.

Draft PR. Preview at most one. Do not merge. Do not flip `PRIVATE_MODE`.
