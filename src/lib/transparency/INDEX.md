# src/lib/transparency/

> One concern: Visibility report + Under the Hood weights — every gated or hidden state named; published boosts and visibility filters downloadable.

## Read order

1. `types.ts` — report + row + weight + athlete-label shapes
2. `earnTable.ts` — live XP table from `rewards/catalog.ts`
3. `weights.ts` — BOOSTS (live catalog + Club planned) and PENALTIES (visibility filters)
4. `report.ts` — `buildTransparencyReport` (pure; injectable inputs)
5. `download.ts` — JSON + plain text from the **same** report object
6. `copyGuard.ts` — forbidden ranker / suppression phrases

## Rules

- BOOSTS are our Mission Points / Club table — never another product's ranking scores as XP.
- PENALTIES are visibility filters (report / mute / block / hide). They never debit points. No ROOM SCORE table exists.
- Coach never reads rank. Cite `buildWeekRationale` (hook) — planner blindness.
- Free logger is never gated.
- Score is **hidden** (private to this athlete).
- Club v1 earn table in `docs/CLUB_PLAN.md` is planned, not live.

## Tests

| File | Covers |
|------|--------|
| `report.test.ts` | Every gated/hidden/limited/skipped state has a reason; logger never gated; download includes weights + labels |
| `copyGuard.test.ts` | Transparency sources + report output refuse forbidden phrases |
| `earnTable.test.ts` | Published rows match `XP_BY_ACTION` / caps |
| `weights.test.ts` | Live boosts = catalog; Club session/coach-plan; penalties never debit |

## UI (not here)

| Layer | Path |
|-------|------|
| Visibility | `src/page-components/TransparencyPage.tsx` · `/account/transparency` |
| Under the Hood | `src/page-components/UnderTheHoodPage.tsx` · `/account/under-the-hood` |
| Entry | `src/components/profile/ProfileTransparencyCard.tsx` on Account |
| Panel | `src/components/transparency/WeightsPanel.tsx` |

## Related

- Plan: [docs/TRANSPARENCY_PLAN.md](../../../docs/TRANSPARENCY_PLAN.md)
- Region policy: `src/lib/legal/supportedRegions.ts`
- Coach why-line: `src/lib/coach/weekRationale.ts`
