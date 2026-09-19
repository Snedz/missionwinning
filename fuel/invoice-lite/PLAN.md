# PLAN — invoice-lite honest fuel (Builder)

**Status:** IMPLEMENTED 2026-09-19. Builder only.
**Seat:** Builder (TRINITY). A later Judge reviews. This PR does not self-LGTM.
**SKU:** `invoice-lite` · public name **Invoice Lite**
**Not** root `PLAN.md` · **not** `docs/PLAN.md`.

---

## Goal

Ship an **honest, unpublished** one-page invoice pack. Zero sales claimed. `paymentUrl` stays `""`. **Price is UNKNOWN** — do not invent a list price. Do not copy resume-kit’s $29.

---

## One concern

`fuel/invoice-lite/**` only.

---

## Product shape (honest)

- **Offer:** a one-page invoice HTML you fill and print to PDF.
- **Price label:** **UNKNOWN**. Not $29. Not a subscription. Do not mint a number to look finished.
- **Storefront:** none. `paymentUrl` is empty.
- **Invoice paid/unpaid:** UNKNOWN until the user marks it. The template does not invent “PAID.”
- **GTM channel (one):** replies to people who need a simple invoice. Drafts only. Do not post.

---

## Refuse

- `paymentUrl` must stay `""`.
- Do not invent a list price. UNKNOWN is first-class.
- Do not copy resume-kit’s $29 onto this SKU.
- ClearShot PARKED — do not mention.
- No fake traction, tip-promote, poison restore, or spam sends.
- Do not touch Mission Winning `src/` / `app/` / root `scripts/` / `supabase/`.
- Builder ≠ Judge.

---

## Done when

- Files in [INDEX.md](INDEX.md) exist.
- `node fuel/invoice-lite/scripts/verify.mjs` exits 0.
- `paymentUrl === ""` and price UNKNOWN are asserted.
