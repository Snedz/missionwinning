# src/lib/history/

> One concern: past-session facts for `/history` — month marks, the session list, find-a-past-session search (`.1008`), export this diary (`.1011`), import that file back (`.1013`), and this session as a file they own (`.1016`).

## Read order

1. `sessionHistoryList.ts` — the first-paint scan (date · title/muscles · set count)
2. `searchHistory.ts` — find a past session (`.1008`); empty query invents nothing
3. `exportDiary.ts` — export this diary (`.1011`); empty invents nothing
4. `importDiary.ts` — import that file back (`.1013`); confirm-gated; empty invents nothing
5. `exportSession.ts` — this session as a file they own (`.1016`); empty / tomb invents nothing
6. `monthGrid.ts` — calendar marks (trained / logged / blank; never “missed”)
7. `historySheetChrome.test.ts` — list first; calendar / charts / journal in Show all

## Files

| File | Concern |
|------|---------|
| `sessionHistoryList.ts` | Row projection for the one true list (`.720`). Fold-from-date (`.1005`) does not hide a row. Tombstones are a separate restore list (`.1006`). Untitled row title is the date (`.1007`). |
| `searchHistory.ts` | Find a past session (`.1008`). Empty query invents nothing. Title / template / date / lift / note. Tombs stay out. |
| `exportDiary.ts` | Export this diary (`.1011`). Honest logged fields. Tombs stay out. Start-from does not shrink the file. Empty invents nothing. |
| `importDiary.ts` | Our export comes back (`.1013`). Confirm-gated merge of the file export wrote. Empty invents nothing. |
| `exportSession.ts` | This session as a file they own (`.1016`). One finished History log. Reuses `decideExportDiary` columns. Empty / missing / tomb invents nothing. |
| `monthGrid.ts` | Month grid vocabulary |
| `guideHistory561.test.ts` | History empty-copy honesty |

Day replay (`HistoryDayPage`) and charts (`historyAnalytics.ts`) live elsewhere.
