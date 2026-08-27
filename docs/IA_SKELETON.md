# Product IA skeleton

**Status:** Locked. CoS freeze. Bones, not lipstick.  
**Baseline:** web `2026.07-unified.1054`  
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

Proto-shell already exists: cold dock = Summary + Search; live Train joins; Builder / Library / Server live in More. That is athlete-default TIERING, not a second product.

Do not mint Studio. Do not add a Message tab. Do not name a shop Explore.

---

## v0 catalog

Official training catalog is `/library` + `/builder` — one catalog; Collection later = program/block. Super Bundle deepens pro templates and never gates `logSet`. `/explore` is the places pin-board (Decision 009), not a shop. `/programs` is education outlines, not the training catalog. Third-party SKUs get a new route later.

---

## Isolation (must fail if broken)

- Today / Train do not import social
- Log-path tabs = `/log` + `/active` only
- Coach never reads Garage chat
- Chat is never a reason to withhold a set

Enforcer: `src/lib/social/isolation.test.ts` (+ `domainBoundary` C1–C3).

---

## Known leak (comment only)

Builder `saveAllProgramSessions` → `savedWorkouts` beats Coach on Today's Start. Not a join mechanic. Do not change Start order.

---

## Refuse

No costume. No `/private` restyle. No `PRIVATE_MODE` flip. No promote off `.696`. No Studio, Message tab, or Explore-as-shop.
