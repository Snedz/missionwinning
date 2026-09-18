# PLAN — Mission HOME / Program 67 RedNote 适我主义 steal

**Status:** FROZEN 2026-09-18. Implement only this document.  
**Lane:** Builder / docs. Not a product surface.  
**Ship label (if `src/` is touched):** `2026.07-unified.1111`.  
**Not** [docs/PLAN.md](docs/PLAN.md) (build phases A–I). This file is the craft-window freeze.

Do **not** edit this file in implementation commits. Build against it.

---

## Goal

Public-safe **RedNote / 适我主义 home design steal** + Mission HOME doc pack for **Program 67**. Honest renovation **pattern notes**. Not a shopping scam.

The pack records how a CoS / Founder **tasteful loft** can steal circulation and material patterns from Xiaohongshu (RedNote) 适我主义 — and which photo-first tropes to skip.

## One concern

`mission-home/` pattern notes + a tiny README-section lock. Nothing else.

## What this is not

| Refuse | Why |
|--------|-----|
| `paymentUrl` | No checkout, affiliate, or pay link |
| **ClearShot** | No camera / photos mini / MediaStore shopping |
| **Fake ET** | No invented contractor hours or “done by Friday” theater |
| **tip-promote** | No Super Bundle, tip jar, or founder-tip CTA |
| **Invented product prices as checkout** | No SKU, no `$1,299 island`, no fake cart |

Also refuse: street address, unit number, personal photos, named contractors, Stripe, Train/Today UI, `PRIVATE_MODE` flip, America marketing, a second design system.

---

## Files to create

Create `mission-home/` at the repo root (does not exist today). Do not put the pack under `docs/` — keep it a named Program 67 folder.

| Path | Concern |
|------|---------|
| `mission-home/INDEX.md` | Folder map. One concern. Read-order. |
| `mission-home/README.md` | Loft rooms. Required `##` headings listed below. |
| `mission-home/REDNOTE_SHIWO.md` | 适我主义 vocabulary + STEAL / SKIP |
| `mission-home/MATERIALS.md` | oak · limewash · brass · soapstone · 2700K |
| `mission-home/SEARCH_SEEDS.md` | Chinese + EN RedNote queries |
| `src/lib/missionHomePack.test.ts` | Tiny lock: README sections exist; pack stays public-safe |

Routing (one row each, no essay):

- Root [INDEX.md](INDEX.md) §2 — “Mission HOME / Program 67”
- [docs/INDEX.md](docs/INDEX.md) — pointer to `../mission-home/`
- [src/lib/INDEX.md](src/lib/INDEX.md) — one row for the pack test

---

## README.md — required sections

Use these exact `##` headings (the test pins the strings):

1. `## What this is`
2. `## Refuse`
3. `## Coffee fuel wall`
4. `## Spiral stair`
5. `## Island`
6. `## Library`
7. `## Shoe closet`
8. `## Sliding wardrobe`

Each room section states **steal** (pattern) and **skip** (photo-first / housework / checkout). No prices. No ET. Tone: tasteful loft, paper notes, not a moodboard dump.

Open with: CoS / Founder loft. Program 67. Public-safe. Link the sibling files.

---

## REDNOTE_SHIWO.md — required concepts

Name Xiaohongshu / RedNote as the **research surface**, not a shop. 适我主义 is Xiaohongshu’s 2026 living-trend language (space fits the inhabitant; not a second style catalog).

Write a STEAL / SKIP table for each:

| Term | Honest meaning (do not invent a brand) |
|------|----------------------------------------|
| **适我主义** | The house fits real habits. Not “no trend,” not a product SKU. |
| **去家务化动线** | Circulation that deletes extra housework steps (entry dirt-lock, laundry hand-off, kitchen reach). |
| **容乱区** | A closed volume that may look lived-in so the visual field can stay calm. |
| **能量场** | Morning light, warm kelvin, ritual objects, less visual noise. Not crystals-as-checkout. |
| **早C岛台** | Island as the morning coffee / start station (C = coffee / 晨间 C 位). Not a second unused sink for photos. |

Also name **适懒化** / 不弯腰垃圾桶 / 无拖延症动线 as supporting notes if they earn a line — they are the same 去家务化 family, not extra rooms.

Close with a short **attribution**: pattern language from public 2026 Xiaohongshu living-trend coverage. Not a scrape. Not affiliate.

---

## MATERIALS.md — required materials

One section each:

- Oak (floor / millwork continuity; skip fake-oak vinyl as “the look”)
- Limewash (soft bounce; skip if the loft already has a sealed industrial coat you will not maintain)
- Brass (small hardware; skip a gold explosion)
- Soapstone (island that may patina — 容乱 at material level; skip if the brief wants a showroom shine)
- 2700K lighting (evening field; cooler only on a task; skip gallery cool-white)

No SKUs. No “buy this $X slab.” Ranges like “warm dim, not office 4000K” are notes, not checkout.

---

## SEARCH_SEEDS.md

Two lists: **中文** (Xiaohongshu / 小红书 query seeds) and **English** (RedNote / Xiaohongshu EN). Queries only — no account handles, no affiliate URLs, no `paymentUrl`.

Must cover: 适我主义, 去家务化动线, 容乱区, 能量场, 早C岛台, 咖啡墙, 旋转楼梯 / 螺旋楼梯, 岛台, 书柜, 进门鞋柜, 推拉衣柜, oak limewash brass soapstone 2700K loft.

---

## Test

`src/lib/missionHomePack.test.ts` (picked up by `npm test`):

1. `mission-home/README.md` contains every required `##` heading above.
2. Every pack `.md` exists.
3. Pack files do **not** contain `paymentUrl`, `tip-promote`, or `https://` checkout/affiliate hosts. The word **ClearShot** may appear only inside a Refuse heading/table (document the refuse; do not shop it).
4. Pack files do not invent checkout prices (`$` + digits as a buy line). Material notes may say “do not invent a price.”
5. Discover the pack directory (`readdir`) rather than a silent allowlist of four files — a new unreviewed `.md` fails until the test names it.

Falsify: delete `## Island` → red. Add `paymentUrl=https://…` → red. Drop a fifth unreviewed `.md` → red.

---

## Ship protocol (because the test lives under `src/`)

Hard rule 5 in the **same implementation commit** as the test:

- `APP_BUILD_LABEL` → `2026.07-unified.1111`
- `LOG.md` heading ending in (`.1111`); rotate oldest live entry (`.1096`) to `docs/archive/log/LOG-rotate-1096-for-1111.md` + [docs/archive/INDEX.md](docs/archive/INDEX.md)
- `CONTEXT.md` `## Now` mentions `2026.07-unified.1111`; rotate oldest *shipped* bullet (`.1095`); keep ≤25 bullets; Status table untouched
- `[skip vercel]`. No tip-promote. Live www stays `.697`. PRIVATE_MODE stays.

---

## Verify

```bash
npx tsx --test src/lib/missionHomePack.test.ts
npm test -- src/lib/missionHomePack.test.ts src/lib/contextBudget.test.ts src/lib/logBudget.test.ts src/lib/buildInfo.test.ts
node scripts/check-build-label.mjs
```

No UI. No e2e. No browser.

---

## Out of scope

UI, tokens, Train / Today / Coach, Stripe, camera, ClearShot host, fake contractor ET, product prices, tipping, America, locales, F5, `PRIVATE_MODE`.
