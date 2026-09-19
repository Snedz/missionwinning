# PLAN — fuel leftover hop (Builder)

**Status:** IMPLEMENTED 2026-09-19. Builder only.
**Seat:** Builder (TRINITY). A later Judge reviews. This PR does not self-LGTM.
**Not** root `PLAN.md` · **not** `docs/PLAN.md` (build phases A–I).

`master` has no `fuel/` tree. Sibling draft #986 shipped the first resume-kit + invoice-lite paper on another branch and left parent map, `priceLabel`, and buyer/refund/FAQ leftovers unwritten. This hop lands both SKUs **and** those leftovers on this disk.

---

## Goal

Ship an **honest, unpublished** two-SKU fuel pack:

- `resume-kit` — one-page resume. Intended label **$29 one-time**. `priceLabel` is a first-class field.
- `invoice-lite` — one-page invoice. **Price UNKNOWN.** Do not copy $29.

`paymentUrl` stays `""` on every SKU. Zero sales claimed. ClearShot stays PARKED (not mentioned in product copy).

---

## One concern

`fuel/**` only. No Mission Winning app ship.

---

## Files to add (closed list)

### Parent (this leftover)

| Path | Role |
|------|------|
| `PLAN.md` | This freeze |
| `INDEX.md` | Folder map |
| `LAWS.md` | Standing laws — not a shared checkout catalog |
| `scripts/verify-all.mjs` | Runs both SKU verifiers + parent laws |

Do **not** add `fuel/config.js`. A shared catalog is how $29 leaks onto invoice-lite.

### Each SKU

Same shape as the first paper, plus leftovers:

| Path | Role |
|------|------|
| `PLAN.md` · `INDEX.md` · `README.md` · `config.js` · `listing.md` | Core row |
| `fulfill/CHECKLIST.md` · `DELIVER.md` | Operator + print |
| `fulfill/BUYER_NOTE.md` | Unsent delivery note |
| `fulfill/REFUND.md` | Refund is UNKNOWN until a real payment |
| `gtm/ICP.md` · `OUTREACH_DRAFTS.md` · `FAQ.md` | One buyer, drafts, honest FAQ |
| `templates/*.html` | Local one-page proof |
| `pages/*.html` | Hub + listing + ICP + outreach + fulfill + FAQ + support |
| `scripts/verify.mjs` | Honesty + file + laws |

---

## Refuse

- `paymentUrl` must stay `""`. Never invent checkout, Stripe, Gumroad, Lemon Squeezy, or a fake store link.
- Resume `priceLabel` stays `$29 one-time`. Invoice price stays UNKNOWN.
- ClearShot PARKED — do not reopen or mention as live product.
- No fake traction, tip-promote, poison restore, or spam sends.
- Do not add a shared `fuel/config.js`.
- Do not touch `src/`, `app/`, `scripts/` (repo root), `supabase/`, `sites/www`, Android, Expo.
- Do not bump `APP_BUILD_LABEL` or add a `CONTEXT.md` `## Now` bullet — this is not a Mission Winning ship.
- Do not flip `PRIVATE_MODE`. Do not gate the free logger.
- Builder ≠ Judge. Do not self-LGTM.
- UNKNOWN is first-class.

---

## Done when

- Every file in the closed list exists.
- `node fuel/scripts/verify-all.mjs` exits 0.
- `paymentUrl === ""` on both SKUs.
- Resume `priceLabel === "$29 one-time"`.
- Invoice has no `$29` and no minted `amountUsd`.
- Static pages open without a buy / checkout control.
- Draft PR vs `master`. `[skip vercel]`. Builder, not Judge.
