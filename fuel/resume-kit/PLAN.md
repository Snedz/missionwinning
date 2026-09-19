# PLAN — resume-kit honest fuel (Builder)

**Status:** IMPLEMENTED 2026-09-19. Builder only.  
**Seat:** Builder (TRINITY). A later Judge / Canary reviews. This PR does not self-LGTM.  
**SKU:** `resume-kit` · public name **Resume Kit**  
**Not** root `PLAN.md` · **not** `docs/PLAN.md` (build phases A–I).

`resume-kit` is missing on `master`. Parallel SKU `invoice-lite` is a sibling folder, not this freeze. Do not create or edit a shared `fuel/config.js`.

---

## Goal

Ship an **honest, unpublished** one-page resume pack: listing draft, ICP, one-channel outreach drafts, a fulfill checklist, and a local HTML template. Zero sales are claimed. `paymentUrl` stays `""`. If a price label is written, it is **$29 one-time** — not a live charge.

This tree does not join the Mission Winning PWA, www, or payments.

---

## One concern

`fuel/resume-kit/**` only.

---

## Files to add (closed list)

All paths under `fuel/resume-kit/`. Do not add a parent `fuel/INDEX.md` or `fuel/config.js`.

| Path | Role |
|------|------|
| `PLAN.md` | This freeze |
| `INDEX.md` | Folder map |
| `README.md` | What this is / is not |
| `config.js` | Local SKU row. `paymentUrl` **must** be `""`. Price `$29` one-time |
| `listing.md` | Unpublished listing draft |
| `fulfill/CHECKLIST.md` | Operator checklist — no fake “paid” |
| `fulfill/DELIVER.md` | What a buyer would receive after a real payment exists |
| `templates/one-page.html` | Local one-page resume proof |
| `gtm/ICP.md` | Who this is for |
| `gtm/OUTREACH_DRAFTS.md` | One channel — DO NOT SEND |
| `pages/index.html` | Product hub (no buy control) |
| `pages/listing.html` | Listing as a page |
| `pages/icp.html` | ICP as a page |
| `pages/outreach.html` | Drafts on a page |
| `pages/fulfill.html` | Checklist on a page |
| `scripts/verify.mjs` | Honesty + file + `paymentUrl === ""` + $29 one-time |

---

## Product shape (honest)

- **Offer:** a one-page resume HTML template plus a fulfill checklist.
- **Price label:** $29 USD, one-time, **intended**. Not charged. Not a subscription.
- **Storefront:** none. `paymentUrl` is empty until a founder wires a real store.
- **Fulfillment:** paper only. Delivery status is `UNKNOWN` until a real payment exists.
- **GTM channel (one):** replies to people stuck on a one-page resume. Drafts only. Do not post.

---

## Refuse

- `paymentUrl` must stay `""`. Never invent checkout, Stripe, Gumroad, Lemon Squeezy, or a fake store link.
- Do not change the $29 one-time price label.
- ClearShot PARKED — do not reopen or mention as live product.
- No fake traction, tip-promote, poison restore, or spam sends.
- Do not edit `invoice-lite` from this freeze (sibling pack is its own list).
- Do not touch `src/`, `app/`, `scripts/` (repo root), `supabase/`, `sites/www`, Android, Expo.
- Do not bump `APP_BUILD_LABEL` or add a `CONTEXT.md` `## Now` bullet — this is not a Mission Winning ship.
- Do not flip `PRIVATE_MODE`. Do not gate the free logger.
- Builder ≠ Judge. Do not self-LGTM.
- UNKNOWN is first-class: unpaid / undelivered / no-store is `UNKNOWN`, not “almost live.”

---

## Done when

- Every file in the closed list exists.
- `node fuel/resume-kit/scripts/verify.mjs` exits 0.
- `paymentUrl === ""` and price `$29` one-time are asserted by verify.
- Static pages open without a buy / checkout control.
- Draft PR vs `master`. `[skip vercel]`. Builder, not Judge.
