# Product IA skeleton

**Status:** Locked. CoS freeze. Bones, not lipstick.  
**Baseline:** web `2026.07-unified.1056`  
**Chip floorplan (not this file):** [FLOW_ARCHITECTURE.md](FLOW_ARCHITECTURE.md)

Pitch **Train + Mission Coach**. Free-forever offline logger. Week from **own logs**, no wearable. Today is one Start, not a feed.

This file is the product-doc source of truth. Do not enlarge it.

---

## Three loops

**LOG.** `/log` (Today, one Start) → `/active` (Train, dock only while live) → `/history`. Chat, comments, DMs, feeds, and bubbles stay off this path. Chat is never a reason to withhold a set.

**WEEK.** Own logs → `/coach` is the only week writer (`generateWeek`). Never a purchased Team calendar.

**GARAGE.** `/server` is More → You → Messenger. Never a dock tab. Never first paint on Today or Train. Coach chat stays on `/coach` and does not share a thread, store, or badge with Garage.

---

## Named rooms (existing — do not mint)

Today · Train · Coach (AI) · History · Library.

Left room rail = Today · Train · Coach (AI) · History · Library. You + More sit in the rail foot. Cold dock = Summary + Search; live Train joins. Builder / Messenger live in More. That is athlete-default TIERING, not a second product.

Do not mint Studio. Do not add a Message tab. Do not name a shop Explore.

---

## v0 catalog

Official training catalog is `/library` + `/builder` — one catalog; Collection later = program/block. Super Bundle deepens pro templates and never gates `logSet`. `/explore` is the places pin-board (Decision 009), not a shop. `/programs` is education outlines, not the training catalog. Third-party SKUs get a new route later.

---

## Isolation (must fail if broken)

- Today / Train do not import social
- Log-path tabs = `/log` + `/active` only
- Coach never reads Garage chat; `generateWeek` week input is logs, never `/server`
- Chat is never a reason to withhold a set

Enforcer: `src/lib/social/isolation.test.ts` + `domainBoundary` C1–C3 + `coach/weekWriter.test.ts`. Already landed in `.1053`. Do not duplicate.

---

## Later-door object model (structure only)

Creator-studio walk 2026-08-27. Steal structure. Never competitor theme. There is no separate studio URL: the owned page *is* the studio. Member loop (`/home` following feed + `/explore` discovery + checkout) is refused entire.

Objects (source names; map, do not rename MW rooms):

| Source | Shape | MW map |
|--------|-------|--------|
| Post | Atomic publishable | Later craft unit. Not a new room. |
| Collection | Ordered grouping with its own preview/price | Later program/block of sessions. Existing Library + Builder (v0 catalog). |
| Product | A role (post or collection + price), not a tree | Super Bundle depth. Never a shop route. |
| Membership tier | Recurring access gate | Refuse as identity. |
| Page | Public container; content invisible until published | Later staged surface (`/server` staging). NEVER Today. |

Mapped onto existing rooms only — do not mint:

- **Draft-is-default:** open a live object, not a blank form. Today already does this (one Start). Do not change Today.
- **Library as one catalog** with state/mode tabs. Maps to existing Library + Builder. Do not add a catalog route.
- **Collection** = ordered grouping. Later program/block only. Do not build a shop.
- **Settings as sidecar** of one object, not a wizard. Later craft. Do not restyle settings now.
- **Page-level draft → preview-as → publish**, separate from content publish. Later `/server` staging, not Today.
- **Checklist that self-completes.** MW already has a 2-step welcome. Do not add a Welcome.
- **Insights/reports** off the creation path. Today is not a dashboard.

Refuse (do not implement): `/home` following feed · `/explore` creator discovery + Recommendations (MW `/explore` stays places) · chats / notifications on home · public creator page + Publish page · comments, likes, reshares, gifting · paywall / upgrade-to-unlock as identity.

---

## Known leak (comment only)

Builder `saveAllProgramSessions` → `savedWorkouts` beats Coach on Today's Start. Not a join mechanic. Do not change Start order.

---

## Refuse

No costume. No `/private` restyle. No `PRIVATE_MODE` flip. No promote off `.696`. No Studio, Message tab, Explore-as-shop, or member loop.
