# src/lib/history/

> One concern: past-session facts for `/history` — month marks, the session list, and find-a-past-session search (`.1008`).

## Read order

1. `sessionHistoryList.ts` — the first-paint scan (date · title/muscles · set count)
2. `searchHistory.ts` — find a past session (`.1008`); empty query invents nothing
3. `monthGrid.ts` — calendar marks (trained / logged / blank; never “missed”)
4. `historySheetChrome.test.ts` — list first; calendar / charts / journal in Show all

## Files

| File | Concern |
|------|---------|
| `sessionHistoryList.ts` | Row projection for the one true list (`.720`). Fold-from-date (`.1005`) does not hide a row. Tombstones are a separate restore list (`.1006`). Untitled row title is the date (`.1007`). |
| `searchHistory.ts` | Find a past session (`.1008`). Empty query invents nothing. Title / template / date / lift / note. Tombs stay out. |
| `monthGrid.ts` | Month grid vocabulary |
| `guideHistory561.test.ts` | History empty-copy honesty |

Day replay (`HistoryDayPage`) and charts (`historyAnalytics.ts`) live elsewhere.
