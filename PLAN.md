# PLAN — Next cite is BW, not 0 kg, on assisted 0 (`.1015`)

**Status:** Frozen. One daily. **Horizon 0.** Wedge: Train + Coach.
**Frozen:** 2026-08-26. **Ship-as:** `.1015`.
**Base:** master `f4b852279` — Next cite is 0:45, not mute (`.1014`).
**Do not smash:** `.1014` duration cite, `.1013` import, `.1012` this-movement title, `.1011` export door, `.1010` Library tomb skip, `.1009` BW cite.

---

## The one thing

Assisted 0 is BW, not `8 × 0 kg`.

BW cite `.1009` closed vest-0 on Next / Last / after-complete. Assisted still printed `8 × 0 kg` when help was 0. Help already prints minus. Zero help is unassisted bodyweight.

## Why this, why now

Year-one metric is week-4 loggers. Duration cite `.1014` is on master. This hop is the assisted leftover.

## In / out

**In**

- `formatSetRowLine` / `formatSetRowPrev` assisted 0 → `8 × BW`.
- Help > 0 stays `8 × −20 kg`.
- Display only. Store still `weight: 0`.
- Guest. First set ungated.

**Out**

- Custom / unknown rewrite (stays weight).
- Duration cite `.1014` (keep).
- Today chrome, Feed, `/private`.
- Counsel-hold, Mind, cloud sync, account.
- Promote. Live www stays `.696`.

## Done when

1. Assisted 0 prints `8 × BW`, not `8 × 0 kg`.
2. Help still prints minus.
3. Loaded cite unchanged.
4. Today still one Start. First set ungated.

## Verify

- `src/lib/workout/assistedCite.test.ts`
- `npx tsx --test src/lib/firstSetUngated.ts`
- `npx tsx scripts/check-build-label.mjs` — `.1015` > master `.1014`.
