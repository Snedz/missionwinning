# PLAN — v0 catalog labeling (`.1054`)

**Status:** Frozen. One leftover. **Horizon 0.** Wedge: Train + Coach.
**Frozen:** 2026-08-27. **Ship-as:** `.1054`.
**Base:** master `84acabfea483f32d616decc4ce35381ce128125d` — Product IA skeleton (`.1053`).
**Do not smash:** Isolation `.1053`. Costume revert `.1052` / `.1050`. Messenger freeze `.752`. Domain boundary C1–C3 / C7. Isolation `src/lib/social/isolation.test.ts`. Athlete-default dock (cold Summary + Search; live Train joins). Today one Start. Guest first set ungated. Resume `.963`. `/private` tight lock. Live www `.696`.

---

## The one thing

Name the official training catalog that already exists. It is `/library` + `/builder`. Super Bundle deepens pro templates and never gates `logSet`. `/explore` stays the places pin-board (Decision 009). `/programs` stays education outlines. No new room. No new tab. No shop.

This slice is **not visual**. Zero CSS / theme / `/private` / www / nav-appearance edits. Docs + labels + tests only.

## In / out

**In** (stop after these)

1. `docs/IA_SKELETON.md` — one tight v0-catalog paragraph. Do not enlarge the novel.
2. Point INDEX / FLOW if they already name rooms.
3. If More / Search / Library / Builder copy implies a missing shop or calls the training catalog Explore, fix the LABEL so Library + Builder read as the official catalog.
4. Tests: `/explore` is still places-only (keep the Today ban). No new primary-nav href for a shop or `/coaches`. Isolation from `.1053` still passes.

**Out**

- Costume / sidebar / theme / `/private` / www
- Message tab, Studio, people rail, `/coaches`
- Shop on Today or `/bundle`
- Renaming `/explore` or dumping education cards into Library
- Changing Start order / dual-writer behavior
- Flip `PRIVATE_MODE`, invent traction, promote production
- Counsel-hold PT / pregnancy / field-test copy

## Accept

```
npx tsx --test src/lib/catalogLabeling.test.ts src/lib/places/exploreNotOnToday.test.ts src/lib/social/isolation.test.ts src/lib/domainBoundary.test.ts src/lib/mobileNavTabs.test.ts src/lib/moreSheetTiers.test.ts
npx tsc --noEmit
npx tsx scripts/check-build-label.mjs
```
