# PLAN — resume-kit honest fuel (Builder)

**Status:** IMPLEMENTED 2026-09-19. Builder only.
**Seat:** Builder (TRINITY). A later Judge reviews. This PR does not self-LGTM.
**SKU:** `resume-kit` · public name **Resume Kit**
**Not** root `PLAN.md` · **not** `docs/PLAN.md`.

---

## Goal

Ship an **honest, unpublished** one-page resume pack. Zero sales claimed. `paymentUrl` stays `""`. If a price label is written, it is **$29 one-time** — field name `priceLabel`. Not a live charge.

---

## One concern

`fuel/resume-kit/**` only. Sibling `invoice-lite` is its own list.

---

## Product shape (honest)

- **Offer:** a one-page resume HTML template plus a fulfill checklist.
- **Price label:** `$29` USD, one-time, **intended**. Not charged. Not a subscription.
- **Storefront:** none. `paymentUrl` is empty until a founder wires a real store.
- **Fulfillment:** paper only. Delivery / refund / buyer stay `UNKNOWN` until a real payment exists.
- **GTM channel (one):** replies to people stuck on a one-page resume. Drafts only. Do not post.

---

## Refuse

- `paymentUrl` must stay `""`.
- Do not change `priceLabel` from `$29 one-time`.
- ClearShot PARKED — do not mention.
- No fake traction, tip-promote, poison restore, or spam sends.
- Do not copy this $29 onto invoice-lite.
- Do not touch Mission Winning `src/` / `app/` / root `scripts/` / `supabase/`.
- Builder ≠ Judge. UNKNOWN is first-class.

---

## Done when

- Files in [INDEX.md](INDEX.md) exist.
- `node fuel/resume-kit/scripts/verify.mjs` exits 0.
- `paymentUrl === ""` and `priceLabel === "$29 one-time"` are asserted.
