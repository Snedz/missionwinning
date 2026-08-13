# src/lib/transparency/

> One concern: Why-this report — every gated or hidden state named in plain language.

## Read order

1. `types.ts` — report + row + earn-table shapes
2. `earnTable.ts` — live XP table from `rewards/catalog.ts` (not the planned Club ledger)
3. `report.ts` — `buildTransparencyReport` (pure; injectable inputs)
4. `download.ts` — JSON + plain text from the **same** report object
5. `copyGuard.ts` — forbidden X-ranker / suppression phrases

## Rules

- We are not X. No impressions, For You, or shadowban of other users.
- Coach never reads rank. Cite `buildWeekRationale` (page) — planner blindness.
- Free logger is never gated.
- If a number is not public: **private-to-self, not suppressed**.
- Club v1 earn table in `docs/CLUB_PLAN.md` is planned, not live.

## Tests

| File | Covers |
|------|--------|
| `report.test.ts` | Every gated/hidden/limited state has a reason; logger never gated |
| `download.test.ts` | JSON + text carry the same reasons as the report |
| `copyGuard.test.ts` | Transparency sources + report output refuse forbidden phrases |
| `earnTable.test.ts` | Published rows match `XP_BY_ACTION` / caps |

## UI (not here)

| Layer | Path |
|-------|------|
| Page | `src/page-components/TransparencyPage.tsx` |
| Route | `/account/transparency` |
| Entry | `src/components/profile/ProfileTransparencyCard.tsx` on Account |

## Related

- Plan: [docs/TRANSPARENCY_PLAN.md](../../../docs/TRANSPARENCY_PLAN.md)
- Region policy: `src/lib/legal/supportedRegions.ts`
- Coach why-line: `src/lib/coach/weekRationale.ts`
