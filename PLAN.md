# PLAN — Last cite is BW, not 0, on empty load (`.1017`)

**Status:** Frozen. One daily. **Horizon 0.** Wedge: Train + Coach.
**Frozen:** 2026-08-26. **Ship-as:** `.1017`.
**Base:** master `fa96397d5` — This session as a file they own (`.1016`).
**Do not smash:** `.1016` session file, `.1015` assisted cite, `.1014` duration cite, `.1013` import, `.1012` this-movement title, `.1011` export door, `.1010` Library tomb skip, `.1009` BW cite.

---

## The one thing

Last / Prev on empty load is BW, not `8 × 0`.

Next already prints `8 × BW` via `formatSetLoadLine` when weight is 0. `formatSetRowPrev` for type `weight` still interpolates the number: `8 × 0`. Same row. Custom stays type weight.

## Why this, why now

Year-one metric is week-4 loggers. Cite stack `.1009` / `.1014` / `.1015` closed BW / hold / assisted. Weight-type empty load is the leftover split. Session file `.1016` took the stamp; this hop is `.1017`.

## In / out

**In**

- `formatSetRowPrev` weight-type 0 → `8 × BW`.
- `formatPrevSetLabels` fallback the same.
- Loaded stays `5 × 100`. Display only. Store still `weight: 0`.
- Guest. First set ungated.

**Out**

- Custom type rewrite (stays weight).
- Heatmap `days = 99`. Library spark 0.
- Duration / assisted cites (keep).
- Today chrome, Feed, `/private`.
- Promote. Live www stays `.696`.

## Done when

1. Weight-type empty load: Last / Prev / after-complete print `8 × BW`, not `8 × 0`.
2. Loaded / vest / duration / assisted unchanged.
3. Custom id stays type `weight`.
4. Today still one Start. First set ungated.

## Verify

- `src/lib/workout/emptyLoadCite.test.ts`
- `npx tsx --test src/lib/workout/durationCite.test.ts src/lib/workout/assistedCite.test.ts src/lib/workout/nextCiteBw.test.ts`
- `npx tsx scripts/check-build-label.mjs` — `.1017` > master `.1016`.
