# PLAN — Product IA skeleton (`.1053`)

**Status:** Frozen. One leftover. **Horizon 0.** Wedge: Train + Coach.
**Frozen:** 2026-08-27. **Ship-as:** `.1053`.
**Base:** master `895d940daebdf8f10f6a041360d7478f81492a05` — Revert Patreon costume, restore wireframe (`.1052`).
**Do not smash:** Costume revert `.1052` / `.1050`. Messenger freeze `.752`. Domain boundary C1–C3 / C7. Isolation `src/lib/social/isolation.test.ts`. Athlete-default dock (cold Summary + Search; live Train joins). Today one Start. Guest first set ungated. Resume `.963`. `/private` tight lock. Live www `.696`.

---

## The one thing

Lock product truth as bones, not lipstick. Tonight's IA is already decided. Do not invent a second product, a sidebar costume, or a Studio.

`.1051` painted Patreon chrome onto the existing IA. Founder reverted it (`.1052`). This slice is **not visual**. Zero CSS / theme / `/private` / www / nav-appearance edits.

## In / out

**In** (stop after these)

1. `docs/IA_SKELETON.md` — CoS freeze. Named rooms: Today · Train · Coach (AI) · History · Library.
2. Isolation in `src/lib/social/isolation.test.ts`: Today/Train do not import social; tabs = `/log` + `/active`; Coach never reads Garage; chat never withholds a set.
3. Dual-writer = comment only. Do not change Start order.

v0 catalog labeling is a later PR.

**Out**

- Any visual / costume / sidebar / theme change
- Restyle `/private` or `sites/www`
- Patreon public creator URL, member Feed, Chats-on-home
- TrainHeroic Coach Home, Session Comments, Chat as athlete dock tab
- Hevy Home-as-feed, likes/comments on logs
- Intercom / Chat Heads / Fitbod overlay / any type-5 bubble on Today or Train
- Discord.com, DMs, workout auto-post, people rail / Top 8 / `/coaches`
- Empty Studio, Message tab, Explore-as-shop, shop on Today or `/bundle`
- Flip `PRIVATE_MODE`, invent traction, promote production
- Counsel-hold PT / pregnancy / field-test copy
- Change Start order

## Accept

```
npx tsx --test src/lib/social/isolation.test.ts src/lib/domainBoundary.test.ts src/lib/mobileNavTabs.test.ts src/lib/moreSheetTiers.test.ts src/lib/coach/weekWriter.test.ts src/lib/workout/honorSavedRoutine.test.ts
npx tsc --noEmit
npx tsx scripts/check-build-label.mjs
```
