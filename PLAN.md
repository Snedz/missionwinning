# PLAN — Fuel help FAQ honesty (`.1111`)

**Status:** FROZEN. Implement only what this file names.  
**Lane:** Content / Fuel honesty (one concern). Builder seat only — do not self-certify as Judge.  
**Base:** `origin/master` @ `0e3e9eab` (`.1110` honest manifest description).  
**Paper:** stamp `.1111`. Live www stays `.697`. `PRIVATE_MODE` stays.  
**Not** `docs/PLAN.md` (build phases A–I). This file is the craft-window freeze.

---

## Disk inventory (why this is Fuel help, not Program 67 kits)

This cloud checkout is **`Snedz/missionwinning`** only (public AGPL PWA). A full walk found:

| Asked-for rocket | On this disk? | In `Snedz/*` GitHub? |
|------------------|---------------|----------------------|
| `resume-kit` | **absent** | **absent** |
| `invoice-lite` | **absent** | **absent** |
| `kdp-color` | **absent** | **absent** |
| `RESTAURANTS/` | **absent** | **absent** |
| zip rebuild scripts for those kits | **absent** | — |

Founder SoT for those kits is local Mac. Inventing `$29` resume / invoice / KDP packs in this **public** tree would give the merchandise away and mix a second business into the fitness product. That is not honest tonnage.

The on-disk Fuel product is the **nutrition pillar** (`/nutrition`, `docs/help/fuel-and-nutrition.md`). Horizon still requires **Fuel estimate accuracy**. Graph C8 already closed the Log-button gate (`estimateLogAllowed`). Help FAQ Fuel is two thin answers and does not yet name edit-before-log, vision-vs-heuristic, or “restock does not order.”

## Goal

Make athlete-facing Fuel help tell the truth the logger already enforces: estimates are tools; low / rough drafts cannot log until the athlete edits; photo vision is optional and otherwise a heuristic; restock is a list you copy, not a shop; Fuel logger stays free; mute-pay / no checkout.

## One concern

Fuel help FAQ honesty + thin cross-links between existing help pages. Nothing else.

## Files to touch

### Help copy (English-only `docs/help/` — no locale-pack farm)

1. `docs/help/faq.md` — expand the **Fuel** section (keep barcode + photo). Add honest Q/A:
   - Edit-before-log: low confidence / rough / heuristic drafts keep **Log meal** disabled until the athlete touches a field or scales servings.
   - Photo: Vision AI only if founder set `MEAL_VISION_*`; otherwise filename/color heuristic. Not clinical. Not competition prep.
   - Train-day target flex comes from **local workout logs**, not a wearable.
   - This week's restock is a copy/download list. The app does not order groceries.
   - Fuel logger / search / barcode / photo path stay free. Super Bundle is optional recipe/plan depth. Checkout is muted (Get notified). No payment URL.
   - Estimates are not medical advice.
2. `docs/help/fuel-and-nutrition.md` — one short **Honesty** subsection that states the same four facts (edit-before-log, vision-vs-heuristic, restock does not order, not medical). Link to `faq.md` Fuel. Link to Train (`getting-started.md`) and Coach (`mission-coach.md`). Do not invent NL tokens or new recipe counts — keep 48 free / 140 premium.
3. `docs/help/pillars.md` — Fuel bullets: estimates are tools; Log stays off until you edit a low/rough draft; link `faq.md` Fuel.
4. `docs/help/getting-started.md` — **Next steps** add `fuel-and-nutrition.md`. One sentence: Fuel estimates are review-then-log, not a food lab.
5. `docs/help/INDEX.md` — faq row notes Fuel honesty (edit-before-log / restock / vision).

### Guard (discover the help files; do not enumerate a closed phrase list that can rot)

6. `src/lib/nutrition/fuelHelpFaqHonesty.test.ts` — **create**. Read `docs/help/faq.md` + `fuel-and-nutrition.md`. Fail if the Fuel FAQ section is missing, or if it lacks edit-before-log, vision-vs-heuristic, restock-does-not-order, and not-clinical. Fail if it claims checkout is live, invents traction, or fills a payment URL. Fail if `fuel-and-nutrition.md` drops the faq / Train / Coach links this PLAN names.

### Ship protocol

7. `src/lib/buildInfo.ts` — `2026.07-unified.1111`
8. `LOG.md` — new `.1111` heading; rotate oldest live `##` (`.1096`) to `docs/archive/log/` so the file stays ≤15 entries
9. `docs/archive/INDEX.md` — list the rotated `.1096` file
10. `CONTEXT.md` `## Now` — `.1111` bullet; rotate oldest *shipped* bullet if over 25; Status table unchanged

## Refuse list

- Do **not** invent or fill `paymentUrl` / checkout / Stripe links.
- Do **not** create `resume-kit`, `invoice-lite`, `kdp-color`, or `RESTAURANTS/` in this public tree.
- Do **not** tip-promote or claim traction / MRR / testimonials.
- Do **not** touch ClearShot or unpark it (`src/lib/mission-os/clearshot.ts`, Android ClearShot repo).
- Do **not** poison-restore from OneDrive narratives.
- Do **not** invent NL food tokens (C8 closed).
- Do **not** add recipes, barcode DB, TDEE rewrite, or Fuel Coach engine changes.
- Do **not** add landing FAQ keys (14-pack i18n farm).
- Do **not** flip `PRIVATE_MODE`. Do not touch `sites/www`.
- Do **not** merge. Prefer `[skip vercel]`.
- Do **not** self-certify as Judge.

## Done when

- This PLAN.md is frozen, then implemented without expanding the file list.
- Help FAQ Fuel names edit-before-log, vision-vs-heuristic, restock-does-not-order, not-clinical.
- Cross-links exist: fuel guide ↔ faq ↔ getting-started / Coach.
- `fuelHelpFaqHonesty.test.ts` is green; a mutant deleting the Fuel FAQ section goes red.
- No `paymentUrl` invented. Price labels in existing shop copy stay Super Bundle floors (48 / 140) — this PR does not retouch them.
- Draft PR open vs `master` with files + how to verify.
- Stop after this window. Builder does not grade the ship.
