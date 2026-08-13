# MEDIA.md — who appears in the pictures

**Audience:** Anyone generating or shipping product / marketing stills.  
**Pipeline** (folders, Flow credits, optimize script): [MEDIA_SYSTEM.md](MEDIA_SYSTEM.md).  
**Frozen `.736` plan:** [MEDIA_CAST_PLAN.md](MEDIA_CAST_PLAN.md).  
**Brand colours:** [brand-guidelines.md](brand-guidelines.md) · tokens in `src/index.css`.  
**Hosted service territory:** [`src/lib/legal/supportedRegions.ts`](../src/lib/legal/supportedRegions.ts) — the only map of where the product is available.

This file is the **representation contract**. It does not restate the media
pipeline or the geo-block. If this file and MEDIA_SYSTEM disagree on *who is
in the frame*, this file wins. If this file and `supportedRegions.ts` disagree
on *where we operate*, **`supportedRegions.ts` wins.**

---

## Representation ≠ service territory

**Cast is multicultural. Country availability is `supportedRegions.ts`.**

An Arab or Muslim athlete in a still is a person who trains in a **served**
country (for example the US or IL). It is not a “launch in Saudi” campaign.
A kippah is observant gym wear in a served market (Israel is served). A
White / European-descent body is a look, not a claim that Europe is a market.

We **do not** serve: Europe (EEA / UK / CH / FR), Canada, Ukraine, OIC 57
(including Indonesia, Malaysia, Türkiye, the Gulf). We **do** serve IL, US,
JP, KR, TW, HK, IN, LatAm, AU/NZ, RU/BY, TH/VN/PH, and other non-blocked
ISO codes in that module.

Do **not** add copy, alt, filenames, or www heroes that imply we operate in
blocked countries (“Riyadh gym”, “Paris launch”, “available in Germany”,
“Jakarta”, “Toronto hosted”).

---

## Default, not a campaign

Representation is how Form Index stills are made — **every** raster exercise
set, not a Heritage Month skin, not a `/diversity` page, not a one-off for
catalog 006. The work is the pictures inside Train, the library, and any
people-bearing marketing slot.

Do **not** add a DEI blog, a one-of-each checkbox collage on a single card,
or a rainbow sticker pass over metric Learn figures.

---

## Cast roster (who appears)

Named so generators know who appears **across the library**. Not a campaign.
Not a market list. The product shows **one** still at a time
(`hash(exerciseId) % set.length`).

| Look | How it reads in stills |
|------|------------------------|
| **East Asian** | Korean / Japanese / Chinese — **one look**. Cantonese / HK is not a separate slot. JP / KR / TW / HK are served markets; do not caption a city as a launch. |
| **African / Black** | Distinct build. Person in a served country — not a blocked-country launch. |
| **South Asian** | Distinct build. IN is served. |
| **Arab / Muslim modest dress** | Hijab where the movement still reads. Athlete in a served country (US / IL, …) — **not** an OIC market campaign. |
| **Jewish / Israeli** | Kippah and/or tzitzit as **natural training wear**, not a costume. Israel is served. |
| **Latin American** | Distinct build. LatAm is served. |
| **White / European-descent** | Distinct build — not the old single `athlete-a` default. **Europe is not a hosted market.** |
| **Mixed body / age / gender** | Older, compact, heavier, different gender — rotate so the library is not one body |

**Per-exercise set (3–6 stills):** more than one body, more than one skin tone,
and **at least one** modest/religious-dress option (hijab **or** kippah/tzitzit)
where the movement still reads. **Do not** put every look on one card.

**Across the library:** every named look appears. Rotate which 3–4 bodies each
exercise draws. Catalog 006 `squats` was the example, not the only set.

Stick SVGs under `public/form-guides/` are race-neutral diagrams. Long-tail
catalog rows without a raster pack still fall back to SVG / pattern diagrams
(no human default). Raster packs must follow this contract.

---

## Exercise still sets

| Must | Meaning |
|------|---------|
| Roster coverage | Library-wide, not one-of-each per card — see above |
| More than one body | At least two distinct builds in the set |
| More than one skin tone | At least two; not a single default |
| ≥1 modest / religious-dress option | Hijab, kippah, tzitzit, long sleeves, and/or loose pants — **where the movement still reads** |

Same cue per set (same camera, same ROM phase, same implement).

### Picking a still (0.1)

`hash(exerciseId) % set.length` (`src/lib/formCast.ts`). Locale / preference
later. The free logger is never gated on seeing form media.

Cast packs are **still-only** until the matching `side.mp4` is recast
(follow-up). Do not pair a new poster with an old single-default loop.

### Caption / alt

Describe the **movement** (`Side view · full range of motion`). Do **not**
name race, religion, ethnicity, nationality, or a city/country. Those facts
are not the caption. Territory is not the caption.

---

## Generated media

- Illustration or **clearly-generated** stills of **unnamed** athletes.
- Never photoreal “this is a real named person.”
- Never stock photos of real people; never scraped faces; never celebrity
  or influencer likeness.
- Face is secondary. Camera is clinical (side, full body, paper cyclorama
  `#f3f2f2`). See Form Index language in [MEDIA_SYSTEM.md](MEDIA_SYSTEM.md).

---

## Forbidden

| Do not | Why |
|--------|-----|
| Tokenize (one-of-each collage on a card; HK vs Chinese as two looks) | Campaign; hides the teaching |
| Imply blocked-country operations in copy / alt / filenames / heroes | Territory is `supportedRegions.ts`, not the pictures |
| Use a victim’s name | Not ours to use |
| Brand USMC / ACFT-official | We are not the service |
| Medical-device claims | Not a device; not a treatment |
| Runtime image-gen APIs | Offline batch → commit static files |
| Gate form stills behind Bundle | Free logger is never gated |
| Costume religious dress (theatrical tallit, flag merch) | Observant gym wear is ordinary clothes |

---

## www / Learn

Landing photography slots (`GrayscalePhoto` / `public/photo/`) are
**documentary** when they exist. Do not fill them with generated faces.
Until real photos land, empty placeholders are honest.

Learn chapter heroes (`public/learn/*-hero.webp`) are metric / typographic /
stick diagrams. They have no human default. Do not recast them into a
people collage or a city-launch poster.

Marketing art (`public/art/`) is abstract fields. Leave unless a people
hero appears.

When a www or Learn surface **does** show an athlete, it follows this
contract (a set, not one default body) and still must not imply a blocked
market.

---

## Video

Still poster sets ship first. Recasting existing `side.mp4` loops is a
follow-up. Do not I2V from a failing still. Glitchy video is not a ship.

---

## Inventory (`.736`)

Generated vs left is listed in the PR body and [MEDIA_CAST_PLAN.md](MEDIA_CAST_PLAN.md).
Keep that list honest: a pattern SVG is not a recast.
