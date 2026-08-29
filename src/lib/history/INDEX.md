# src/lib/history/

> One concern: past-session facts for `/history` — month marks, the session list, find-a-past-session search (`.1008`), export this diary (`.1011`), import that file back (`.1013`), this session as a file they own (`.1016`), empty-load Last cite (`.1017`), the month they own (`.1018`), Repeat this session into the live Start (`.1026`), move this session to another day (`.1027`), log onto this empty day from the month (`.1028`), this month as a file they own (`.1029`), copy this session onto another day (`.1030`), This month on the calendar (`.1031`), a trained day shows how many live sessions (`.1032`), and this month shows how many live sessions (`.1033`).

## Read order

1. `sessionHistoryList.ts` — the first-paint scan (date · title/muscles · set count)
2. `searchHistory.ts` — find a past session (`.1008`); empty query invents nothing
3. `exportDiary.ts` — export this diary (`.1011`); empty invents nothing
4. `importDiary.ts` — import that file back (`.1013`); confirm-gated; empty invents nothing
5. `exportSession.ts` — this session as a file they own (`.1016`); empty / tomb invents nothing
6. `monthTheyOwn.ts` — tap a live day (`.1018`); empty-day log (`.1028`); tombs out; start-from never erases the month
7. `exportMonth.ts` — this month as a file they own (`.1029`); empty / junk invents nothing
8. `thisMonthCalendar.ts` — This month on the calendar (`.1031`); empty / junk invents nothing; already-this-month is noop
9. `daySessionCount.ts` — trained day live session count (`.1032`); empty / junk invents nothing; never a fire
10. `monthSessionCount.ts` — month live session count (`.1033`); empty / junk invents nothing; never a fire-zero
11. `monthGrid.ts` — calendar marks (trained / logged / blank; never “missed”)
12. `historySheetChrome.test.ts` — list first; calendar / charts / journal in Show all

## Files

| File | Concern |
|------|---------|
| `sessionHistoryList.ts` | Row projection for the one true list (`.720`). Fold-from-date (`.1005`) does not hide a row. Tombstones are a separate restore list (`.1006`). Untitled row title is the date (`.1007`). |
| `searchHistory.ts` | Find a past session (`.1008`). Empty query invents nothing. Title / template / date / lift / note. Tombs stay out. |
| `exportDiary.ts` | Export this diary (`.1011`). Honest logged fields. Tombs stay out. Start-from does not shrink the file. Empty invents nothing. |
| `importDiary.ts` | Our export comes back (`.1013`). Confirm-gated merge of the file export wrote. Empty invents nothing. |
| `exportSession.ts` | This session as a file they own (`.1016`). One finished History log. Reuses `decideExportDiary` columns. Empty / missing / tomb invents nothing. |
| `monthTheyOwn.ts` | Month they own (`.1018`). Live-day facts + tap select. Empty-day log onto that date (`.1028`). Tombs out. Start-from ignored. Empty invents nothing. Not a fire count. |
| `exportMonth.ts` | This month as a file they own (`.1029`). Reuses `decideExportDiary` columns. Empty / junk invents nothing. |
| `thisMonthCalendar.ts` | This month on the History calendar (`.1031`). Jump back to the current local month and today. Empty / junk invents nothing. Already-this-month is noop. |
| `daySessionCount.ts` | Trained day live session count (`.1032`). Prints how many live sessions with the dumbbell. Empty / junk invents nothing. Never a fire. |
| `monthSessionCount.ts` | Month live session count (`.1033`). Prints how many live sessions for the month on screen. Empty / junk invents nothing. Never a fire-zero. Sessions, not training days. |
| `monthGrid.ts` | Month grid vocabulary |
| `guideHistory561.test.ts` | History empty-copy honesty |
| `emptyDayLogSurface.test.ts` | Empty month day plus / log-onto-this-day; overflow `.1000` stays; Today one Start (`.1028`) |
| `exportMonth.test.ts` | This month as a file they own: empty disables Save; paging changes the file (`.1029`) |
| `exportMonthSurface.test.ts` | Save this month on History calendar; Today one Start (`.1029`) |
| `thisMonthCalendar.test.ts` | This month jump: empty invents nothing; already-this-month noop; July viewed + August today applies (`.1031`) |
| `thisMonthCalendarSurface.test.ts` | This month on History calendar; Today one Start; Copy/Move/Repeat/empty-day/month-file stay (`.1031`) |
| `daySessionCount.test.ts` | Trained-day count: empty on none/logged/future/junk/0; apply 1 and 3 (`.1032`) |
| `daySessionCountSurface.test.ts` | Count on History DayCell; dumbbell stays; Today one Start; This month/Copy/Move/Repeat/empty-day/month-file stay (`.1032`) |
| `monthSessionCount.test.ts` | Month count: junk/empty invents nothing; two sessions one day apply 2; tomb ignored; startFrom does not shrink (`.1033`) |
| `monthSessionCountSurface.test.ts` | Count on History calendar footer; training-days stay; Today one Start; day-cell/This month/Copy/Move/Repeat/empty-day/month-file stay (`.1033`) |
| `historyGroupLoading.test.ts` | `/history` client nav is not group Loading; segment loading is house leftover (`.1058`) |

Day replay (`HistoryDayPage`) and charts (`historyAnalytics.ts`) live elsewhere.
