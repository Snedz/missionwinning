# Super Bundle shop restore (0.1 beta)

Frozen ship plan for this PR. Not the living roadmap ([PLAN.md](PLAN.md)).

**Label:** `2026.07-unified.705` (does not steal #477 `.698` / #478 `.699`)  
**Excellence-Override:** Super Bundle shop restore (annual; logger free)

## Goal

Restore `/bundle` as the Super Bundle shop: two honest states, real catalog counts, no live charge while `FREE_BETA` is on.

## One concern

Merchandising the one paid SKU (Super Bundle) against a four-app stack, with checkout muted until Stripe-under-LLC is live. Logger stays free. Depth stays unlocked.

## Shop (locked)

Two cards only, stacked (Grok Bot hierarchy, MW paper/ink):

1. **Free** — logger + free floors forever. No account. No card. CTA: **Start training** (outline) → `/active`. **Get notified** / Subscribe is the one poster red.
2. **Super Bundle** — `$59`/year primary (founders), `$11.99`/mo secondary, `$149` lifetime. One SKU.

Paid card sells **content quality**, not empty SKUs. Counts come from `CONTENT_FLOORS` / `catalogMeta` / `premiumInventory` (floors that `contentInventory.test.ts` already pins `actual >= floor`):

| What you get | Floor |
|---|---|
| Premium recipes | `recipesPremium` (110) |
| Premium Move flows | `movePremium` (48) |
| Premium Mind sessions | `mindPremium` (60) |
| Premium Learn sections | `learnPremiumSections` (16) |
| Mission Coach depth | weekly plans from logs (no fake count) |

Vs-stack copy (illustrative, not live SKUs): **one Super Bundle vs Strong + MyFitnessPal + Pliability + Calm**. Pillar `$15/$10/…` may remain in the below-fold compare table as illustrative only.

Optional third state: paid card reads **Already included** only on real enrollment (`!isFreeBeta() && premium`). Free-beta depth bypass is not a purchase.

Buttons:

- Free card **Start training** is outline (not poster fill) so the paid card holds the one red.
- `FREE_BETA` or checkout unconfigured → **Get notified** (waitlist). Honest line: “Checkout opens when payments go live.”
- Checkout actually runnable and not free-beta → **Subscribe Now**.
- Never take a card while `isFreeBeta()`.

## Files

| Path | Change |
|------|--------|
| `src/lib/bundleShop.ts` + `.test.ts` | Inventory lines, vs-stack, CTA decision |
| `src/lib/payments.ts` | `isPaidCheckoutAllowed()` — false while free-beta |
| `src/components/bundle/BundleShopStack.tsx` | Two stacked cards |
| `src/page-components/BundlePage.tsx` | Shop stack; keep success polling; Phantom only when checkout allowed |
| `src/components/UnlockButton.tsx` | Mute live checkout under free-beta; waitlist with Get notified |
| `app/bundle/page.tsx` | Stop redirecting `/bundle` → `/log` |
| `app/sitemap.ts` | List `/bundle` |
| `src/components/marketing/footerLinks.ts` | Restore Super Bundle link |
| `src/components/layout/MoreSheet.tsx` | Restore Bundle row |
| `src/page-components/LandingPage.tsx` | Restore footer Super Bundle link |
| `src/components/layout/InfoPageFooter.tsx` | Allow requested Bundle link |
| `src/i18n/bundleLocales.ts` | Shop strings (EN; other langs `...en`) |
| `src/lib/freeBetaMute.test.ts` · `freeBetaDualMode.test.ts` | Mute **checkout**, not the shop |
| `docs/FREE_BETA.md` · help · CONTEXT · LOG | Match reality |
| `docs/help/premium-and-billing.md` · `docs/help/faq.md` | One SKU, no trial, checkout not live during beta |
| `src/lib/INDEX.md` · `src/components/INDEX.md` | Index `bundleShop.ts` + `bundle/` |
| `src/lib/moreSheetTiers.ts` · `src/lib/footerFlow.test.ts` | Shop row always listed; checkout still muted |
| `src/lib/buildInfo.ts` | `.705` |

## Remaining at freeze

Shop cards, checkout mute, `/bundle` 200, discovery restore, and mute-test rewrite are already in the working tree. Finish: ship protocol (`.705` + LOG + CONTEXT), help copy, INDEX rows, More-sheet comment, footerFlow `/bundle` always present. Do not restart the shop.

## Refuse

- No 7-day / One Week Trial card, trial SKU, “credit card required,” or Fitbod-style trial
- No à la carte pillar SKUs (Train/Fuel/Move/Mind/Learn are not sold separately)
- No live Stripe unmute; no `PRIVATE_MODE` flip
- No bait-and-switch: keep `isFreeBetaPremiumUnlocked()` depth
- No Today / Train restyle; no N1 cinematic www
- No fake traction numbers
- Do not steal #477 `.698` / #478 `.699`
- Draft PR; preview at most one
- Do not gate the free logger

## Out of concern

Pillar locked-preview Unlock CTAs, Coach chat tips, Today quick links, Profile premium upsell — stay muted during free-beta (shop lives at `/bundle`). Android Play subscribe. Whats New sheet.
