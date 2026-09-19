# PLAN — invoice-lite honest fuel (Builder)

**Status:** IMPLEMENTED 2026-09-19. Builder only.  
**Seat:** Builder (TRINITY). A later Judge / Canary reviews. This PR does not self-LGTM.  
**SKU:** `invoice-lite` · public name **Invoice Lite**  
**Not** root `PLAN.md` · **not** `docs/PLAN.md` (build phases A–I).

`invoice-lite` is missing on `master`. Parallel SKU `resume-kit` is a sibling folder, not this freeze. Do not create or edit a shared `fuel/config.js`.

---

## Goal

Ship an **honest, unpublished** one-page invoice pack: listing draft, ICP, one-channel outreach drafts, a fulfill checklist, and a local HTML invoice. Zero sales are claimed. `paymentUrl` stays `""`. **Price is UNKNOWN** — do not invent a list price.

This tree does not join the Mission Winning PWA, www, or payments.

---

## One concern

`fuel/invoice-lite/**` only.

---

## Files to add (closed list)

All paths under `fuel/invoice-lite/`. Do not add a parent `fuel/INDEX.md` or `fuel/config.js`.

| Path | Role |
|------|------|
| `PLAN.md` | This freeze |
| `INDEX.md` | Folder map |
| `README.md` | What this is / is not |
| `config.js` | Local SKU row. `paymentUrl` **must** be `""`. Price UNKNOWN |
| `listing.md` | Unpublished listing draft |
| `fulfill/CHECKLIST.md` | Operator checklist — paid/sent stay UNKNOWN |
| `fulfill/DELIVER.md` | What a user prints locally |
| `templates/invoice.html` | Local one-page invoice proof |
| `gtm/ICP.md` | Who this is for |
| `gtm/OUTREACH_DRAFTS.md` | One channel — DO NOT SEND |
| `pages/index.html` | Product hub (no buy control) |
| `pages/listing.html` | Listing as a page |
| `pages/icp.html` | ICP as a page |
| `pages/outreach.html` | Drafts on a page |
| `pages/fulfill.html` | Checklist on a page |
| `scripts/verify.mjs` | Honesty + file + `paymentUrl === ""` + price UNKNOWN |

---

## Product shape (honest)

- **Offer:** a one-page invoice HTML you fill and print to PDF.
- **Price label:** **UNKNOWN**. Not $29. Not a subscription. Do not mint a number to look finished.
- **Storefront:** none. `paymentUrl` is empty.
- **Invoice paid/unpaid:** UNKNOWN until the user marks it. The template does not invent “PAID.”
- **GTM channel (one):** replies to people who need a simple invoice. Drafts only. Do not post.

---

## Refuse

- `paymentUrl` must stay `""`. Never invent checkout, Stripe, Gumroad, Lemon Squeezy, or a fake store link.
- Do not invent a list price. UNKNOWN is first-class.
- Do not copy resume-kit’s $29 onto this SKU.
- ClearShot PARKED — do not reopen or mention as live product.
- No fake traction, tip-promote, poison restore, or spam sends.
- Do not edit `resume-kit` from this freeze (sibling pack is its own list).
- Do not touch `src/`, `app/`, `scripts/` (repo root), `supabase/`, `sites/www`, Android, Expo.
- Do not bump `APP_BUILD_LABEL` or add a `CONTEXT.md` `## Now` bullet — this is not a Mission Winning ship.
- Do not flip `PRIVATE_MODE`. Do not gate the free logger.
- Builder ≠ Judge. Do not self-LGTM.

---

## Done when

- Every file in the closed list exists.
- `node fuel/invoice-lite/scripts/verify.mjs` exits 0.
- `paymentUrl === ""` and price UNKNOWN are asserted by verify.
- Static pages open without a buy / checkout control.
- Draft PR vs `master`. `[skip vercel]`. Builder, not Judge.
