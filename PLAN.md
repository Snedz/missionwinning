# PLAN — This month on the History calendar (`.1031`)

**Status:** Frozen. One leftover. **Horizon 0.** Wedge: Train + Coach.
**Frozen:** 2026-08-26. **Ship-as:** `.1031`.
**Base:** master `674983aa999fcbf4869d712286b90a4466507813` — Copy this session onto another day (`.1030`).
**Do not smash:** Copy `.1030`, month file `.1029`, empty-day `.1028`, Move `.1027`, Repeat `.1026`.

---

## The one thing

After paging months with prev/next, jump back to the current local month and today. Not a year picker. Not a streak. Not a rest-day count. Not a future planner.

## In / out

**In**

- History calendar (`HistoryCalendar.tsx`): when the viewed `monthKey` is **not** the current local month, one **This month** action.
  - `variant="outline"`, `min-h-[44px]`, not `primary-fill` / `primary-action`.
  - testid: `history-calendar-this-month`
  - i18n `historyCalThisMonth` = `This month` in `src/i18n/historyLocales.ts`.
- Pure helper (no store): `src/lib/history/thisMonthCalendar.ts`
  - `decideThisMonth({ viewedMonthKey, todayKey })` returns
    - `{ kind: 'empty' }` for missing / junk viewed month or junk today
    - `{ kind: 'noop' }` when viewed month already equals today's local month
    - `{ kind: 'apply'; monthKey: string; dateKey: string }` otherwise
  - `monthKey` is current local `YYYY-MM` derived from `todayKey`. `dateKey` is `todayKey`.
  - Never `toISOString()` for a calendar date. Use `isLocalDateKey` / `isLocalMonthKey` (next to `localMonthKey`).
  - Does **not** mutate history. Does **not** invent sessions.
- Wire: `HistoryCalendar` calls `decideThisMonth`. On apply, `onMonthKeyChange(decision.monthKey)` **and** `onSelectDate?.(decision.dateKey)`.
- `HistoryPage` already owns `monthKey` / selected day. Do not invent a second month state.
- Already-this-month: hide the button (noop). Empty/junk: hide.
- History only. Guest. First set ungated. Today still exactly one Start. Resume `.963` kept.
- Copy `.1030` / Move `.1027` / Repeat `.1026` / empty-day `.1028` / month file `.1029` stay.
- Add `.1031` line to `src/lib/firstSetUngated.ts`.

**Out**

- Streak / rest-day count / future-day planner / year picker / month-year modal that invents a future month they have not paged
- Second Start / Feed / share / public URL / Today chrome leak
- Rewriting month-file `.1029` Save this month, empty-day `.1028` plus, Move, Copy, Repeat
- Counsel-hold / Mind / `PRIVATE_MODE` flip / promote live www
- Calling `localStorage` / `toISOString()` for calendar dates

## Verify

- `src/lib/history/monthTheyOwn.test.ts`
- `src/lib/workout/copySessionDay.test.ts`
- `src/lib/firstSetUngated.test.ts`
- `src/lib/today/leanDockStart.test.ts`
- `src/lib/history/thisMonthCalendar.test.ts`
- `src/lib/history/thisMonthCalendarSurface.test.ts`
- `npx tsc --noEmit`
- `npx tsx scripts/check-build-label.mjs`
