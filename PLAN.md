# PLAN — Trained day shows how many live sessions (`.1032`)

**Status:** Frozen. One leftover. **Horizon 0.** Wedge: Train + Coach.
**Frozen:** 2026-08-26. **Ship-as:** `.1032`.
**Base:** master `12a2bcfbb53f4aa26ab915acec1ca6b1e4645d82` — This month on the History calendar (`.1031`).
**Do not smash:** This month `.1031`, Copy `.1030`, month file `.1029`, empty-day `.1028`, Move `.1027`, Repeat `.1026`.

---

## The one thing

A trained History calendar day already has `MonthDay.sessions`. Print that count. Not a fire. Not a streak. Not a missed ✕.

## In / out

**In**

- Pure helper (no store): `src/lib/history/daySessionCount.ts`
  - `decideDaySessionCount({ mark, sessions })` returns
    - `{ kind: 'empty' }` when mark is not `'trained'`, or sessions is missing / junk / not a finite integer / `< 1`
    - `{ kind: 'apply'; count: number }` when mark is `'trained'` and sessions is a finite integer `≥ 1`
  - Never invent 1 on a blank / logged-other / future day. Never count tombs (caller already uses `monthLiveFacts`).
  - Never `toISOString()`. Never `localStorage`. Never import the store.
- `HistoryCalendar` `DayCell`: when apply, print `count` as `text-[11px] tabular-nums` with the dumbbell. Dumbbell stays (WCAG 1.4.1). testid `history-month-day-sessions`. Aria includes the count when apply.
- History only. Guest. First set ungated. Today still exactly one Start. Resume `.963` kept.
- This month `.1031` / Copy `.1030` / month file `.1029` / empty-day `.1028` / Move `.1027` / Repeat `.1026` stay.
- Add `.1032` line to `src/lib/firstSetUngated.ts`.

**Out**

- Fire-count calendar / streak / rest-day count / missed ✕ / year picker
- Second Start / Feed / share / public URL / Today chrome leak
- Inventing a 1 on `mark: 'none'` or `mark: 'logged'` or `isFuture`
- Counting tombstones
- Rewriting This month `.1031` into something else
- Counsel-hold / Mind / `PRIVATE_MODE` flip / promote live www
- Calling `localStorage` / `toISOString()` for calendar dates

## Verify

- `src/lib/history/thisMonthCalendar.test.ts`
- `src/lib/history/monthTheyOwn.test.ts`
- `src/lib/firstSetUngated.test.ts`
- `src/lib/today/leanDockStart.test.ts`
- `src/lib/history/daySessionCount.test.ts`
- `src/lib/history/daySessionCountSurface.test.ts`
- `npx tsc --noEmit`
- `npx tsx scripts/check-build-label.mjs`
