# PLAN — This month as a file they own (`.1029`)

**Status:** Frozen. One daily. **Horizon 0.** Wedge: Train + Coach.
**Frozen:** 2026-08-26. **Ship-as:** `.1029`.
**Base:** master `65f50302e76f4cd3fa656d4ba1abb69ed182f28b` — Log onto this empty day from the month (`.1028`).
**Do not smash:** empty-day `.1028`, Move `.1027`, Repeat `.1026`, diary `.1011`, session file `.1016`, import `.1013`.

---

## The one thing

Hevy calendar: they own the month on screen. Missing: save THAT month's live rows as a local CSV (JSON is the same rows). Reuse `decideExportDiary` columns. Not the whole diary (`.1011`). Not one session (`.1016`).

## In / out

**In**

- From History month they own: one **Save this month** door on the calendar month currently shown (`HistoryCalendar` `monthKey`, `YYYY-MM` via `localMonthKey` / `shiftLocalMonth`).
- The viewed month is currently *inside* `HistoryCalendar` (`useState(() => localMonthKey())`). Lift it or callback so the file matches the month on screen — not "today's month" if they paged to July.
- Live sessions whose local date key starts with that `YYYY-MM`. Tombs out. Start-from fold does not shrink the file.
- Empty month / missing / junk invents nothing — Save stays disabled.
- Honest logged columns only. Reuse `decideExportDiary` on the filtered live rows (do not rewrite the diary helper; do not shrink `.1011` to a month). Filename like `mission-winning-month-YYYY-MM.csv`.
- No public URL, Feed, share, email, clipboard permalink.
- History only. Not Today. Guest. First set ungated. Today still exactly one Start. Resume `.963` kept.
- `.1011` whole-diary export and `.1016` this-session file stay. Empty-day `.1028` plus stays.
- Add `.1029` line to `src/lib/firstSetUngated.ts`.

**Out**

- Streak / rest-day count / future-day planner.
- Second Start / Feed / share / public URL.
- Today chrome leak (HomeTodayLean still one `dock="start"`).
- Rewriting empty-day `.1028` / Move `.1027` / Repeat `.1026` / diary `.1011` semantics / session file `.1016` / import `.1013`.
- Counsel-hold / Mind / `PRIVATE_MODE` flip / promote live www.

## Verify

- `src/lib/history/exportDiary.test.ts`
- `src/lib/history/exportSession.test.ts`
- `src/lib/history/monthTheyOwn.test.ts`
- `src/lib/history/monthTheyOwnSurface.test.ts`
- Colocated tests: empty month disables Save; a live month writes only that month's rows; paging to another month changes the file; overflow diary export still writes the whole diary; Today still one Start
- `src/lib/firstSetUngated.test.ts`
- `src/lib/today/leanDockStart.test.ts`
