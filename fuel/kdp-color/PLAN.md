# PLAN — kdp-color honest fuel (Builder-2)

**Status:** FROZEN 2026-09-18. Implement only this file.  
**Seat:** Builder-2 (parallel to resume-kit / invoice-lite). Trinity: Builder only — no self-LGTM as Judge.  
**SKU:** `kdp-color` · public name **Open Plate**  
**Not** root `PLAN.md` (stale house-skin freeze) · **not** `docs/PLAN.md` (build phases A–I).

`kdp-color` is missing on `master`. Do not deepen resume-kit or invoice-lite. Do not create or edit a shared `fuel/config.js`.

---

## Goal

Ship an **honest, unpublished** KDP color-interior starter pack plus one-channel GTM drafts and ICP pages that do not require sending.

Open Plate is a **print-interior kit**, not a live Amazon book and not a checkout. Zero sales are claimed. `paymentUrl` stays `""`. The pack is useful on disk: original line-art plates, a 24-page assembly that does not fake uniqueness by repeating art, a listing draft marked unpublished, and export notes a first-time publisher can follow.

This tree does not join the Mission Winning PWA, www, ClearShot, or payments.

---

## One concern

`fuel/kdp-color/**` only — interiors, listing, export notes, ICP / outreach drafts, static pages, local config, verify.

---

## Files to add (closed list)

All paths under `fuel/kdp-color/`. Do not add a parent `fuel/INDEX.md` or `fuel/config.js`.

| Path | Role |
|------|------|
| `PLAN.md` | This freeze |
| `INDEX.md` | Folder map |
| `README.md` | What this is / is not |
| `config.js` | Local SKU config. `paymentUrl` **must** be `""`. No checkout fields invented |
| `listing.md` | Unpublished KDP listing draft (title, blurb, keywords, categories) |
| `export/NOTES.md` | Color-interior export + KDP upload notes |
| `interiors/manifest.json` | Page list + honest counts (unique plates vs front/back matter) |
| `interiors/generate.mjs` | Deterministic SVG plate generator (original geometry) |
| `interiors/plates/*.svg` | Generated unique plates (committed so the pack works without a run) |
| `interiors/book.html` | Printable 8.5×11 assembly (24 pages, no repeated plate) |
| `gtm/ICP.md` | Who this is for (and not for) |
| `gtm/OUTREACH_DRAFTS.md` | **One channel** drafts, marked DO NOT SEND |
| `pages/index.html` | Product hub (no buy button) |
| `pages/listing.html` | Human-readable listing |
| `pages/icp.html` | ICP page |
| `scripts/verify.mjs` | Honesty + file + `paymentUrl === ""` checks |

---

## Product shape (honest)

- **Trim:** 8.5 in × 11 in paperback, color interior. Bleed 0.125 in. Safe 0.25 in inside trim.
- **24 pages** (KDP paperback minimum) assembled as: 3 front-matter + **12 unique plates** + 6 useful notes/palette pages + 3 back-matter. Do **not** pad by cloning plates.
- **Plates:** original black line art (geometric / botanical / architectural). No licensed characters. No Mission Winning marks. No rival product names.
- **Listing:** draft only. No ASIN, no ISBN, no “#1”, no review counts, no “bestseller”.
- **Storefront:** Amazon KDP **after** the founder uploads. Until then there is no URL.
- **Cover / spine:** out of scope this burn. Export notes say so.
- **GTM channel (one):** KDP Help Community replies to people stuck on color-interior specs. Drafts only. Do not post.

---

## Refuse

- `paymentUrl` must stay `""`. Never invent checkout, Stripe, Gumroad, Lemon Squeezy, or a fake Amazon link.
- ClearShot PARKED — do not reopen, import, or mention as live product.
- No fake traction, tip-promote, poison restore, or spam sends.
- Do not edit resume-kit, invoice-lite, or any shared hot `config.js`.
- Do not touch `src/`, `app/`, `scripts/` (repo root), `supabase/`, `sites/www`, Android, Expo.
- Do not bump `APP_BUILD_LABEL` or add a `CONTEXT.md` `## Now` bullet — this is not a Mission Winning ship.
- Do not flip `PRIVATE_MODE`. Do not gate the free logger.
- Do not claim the book is published, ranked, or earning.
- Do not send outreach. Drafts carry `DO NOT SEND`.
- Do not write INTERNAL war-room / named fitness-competitor intel.

---

## Done when

- Every file in the closed list exists.
- `node fuel/kdp-color/scripts/verify.mjs` exits 0.
- `paymentUrl === ""` is asserted by verify.
- Static pages open without a buy / checkout control.
- Draft PR vs `master` with verify steps. `[skip vercel]`. Builder, not Judge.

Stop after this list. No second SKU.
