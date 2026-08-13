# src/lib/history/

> One concern: past-session facts for `/history` — month marks and the session list.

## Read order

1. `sessionHistoryList.ts` — the Sessions tab scan (date · title/muscles · set count)
2. `monthGrid.ts` — calendar marks (trained / logged / blank; never “missed”)

## Files

| File | Concern |
|------|---------|
| `sessionHistoryList.ts` | Row projection for the one true list (`.720`) |
| `monthGrid.ts` | Month grid vocabulary |
| `guideHistory561.test.ts` | History empty-copy honesty |

Day replay (`HistoryDayPage`) and charts (`historyAnalytics.ts`) live elsewhere.
