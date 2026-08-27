# Design system — Patreon costume (live)

**Runtime source:** [`src/styles/patreonTokens.css`](../src/styles/patreonTokens.css)  
**Wireframe (do not overwrite):** [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md) — modernist paper/ink/Archivo, radius 0  
**Freeze:** [`DESIGN_PATREON_PLAN.md`](DESIGN_PATREON_PLAN.md)  
**Build:** `2026.07-unified.1051`

This is the live visual system for **public www** and **signed-in / public chrome**. It is not a second product. Routes, copy, and one Start stay ours.

DevTools freeze from the founder creator-studio page. Do not invent colors.

---

## Font

Reference face: `"ABC Oracle Plus Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif`.

**We do not ship ABC Oracle Plus.** It is not licensable in this repo. Inter is not a brand statement.

**Live face:** Archivo Variable (already self-hosted on www; `next/font` Archivo on the app) plus the same system stack. Archivo is the geometric variable sans the gate already allows. One `@font-face` on www remains Archivo — `wwwSurface.test.ts` still holds.

| Role | Size / weight |
|------|----------------|
| Body | 16 / 400 |
| Creator / page name | 32 / 500 |
| Page title | 26 / 500 |
| Section | 22 / 500 |
| Rail / tabs | 14 / 500 |
| Buttons | 14 / 550 |

---

## Color (closed set)

| Token | Value | Role |
|-------|--------|------|
| `--ptn-page` | `#ffffff` | Page ground |
| `--ptn-ink` | `#000000` | Primary text |
| `--ptn-quiet` | `rgba(0,0,0,0.6)` | Inactive / secondary |
| `--ptn-card` | `#ffffff` | Card fill |
| `--ptn-card-rule` | `1px solid rgba(0,0,0,0.09)` | Card / hairline. No shadow |
| `--ptn-pill-fill` | `#000000` | Primary pill fill; text white |
| `--ptn-tab` | `rgb(0, 96, 170)` | Active tab + underline |
| `--ptn-photo` | `rgba(0,0,0,0.08)` | Honest grey photo frame (ink at 8%, not a new hue) |

No poster red on this costume. No pastel shelf hue. No second accent.

---

## Radius

| Use | Value |
|-----|--------|
| Cards | `8px` |
| Rail rows | `12px` |
| Icon buttons | `8px` at 48×48 |
| Avatars | `9999px` |
| Pills | `9999px` |

---

## Chrome measure

| Piece | Size |
|-------|------|
| Icon rail | 72px |
| Studio rail | ~264px |
| Settings inner nav | 200px (not a third studio rail) |
| Main column | ~926px |
| Cards | 648px |
| Inner pad | 40px |
| Section gap | 128px |

---

## Components (this costume only)

- **Pill (solid):** black fill, white text, radius 9999px.
- **Pill (ghost):** transparent, `1px` ink border, ink text.
- **Card:** white, 8px, 1px `rgba(0,0,0,0.09)`, no box-shadow.
- **Active tab:** `--ptn-tab` + underline.
- **Active rail row:** light grey wash, radius 12px (wash = ink at ~6%, not a new color).
- **Photo:** existing `/photo/phone-bench`, `home-rack`, `bare-wrist`, or a captioned grey frame. Alt ready for `/photo/hero` and `/photo/hero-2`.

---

## What this is not

- Not a feed, not share, not a public creator URL, not Discord.
- Not a rewrite of `/private`.
- Not a replacement of `src/index.css` (token-sync + Android still pin modernist).
- Not a license to add Inter, glow, or a second red.
