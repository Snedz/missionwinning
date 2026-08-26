# PLAN — This month shows how many live sessions (`.1033`)

**Status:** Frozen. One leftover. **Horizon 0.** Wedge: Train + Coach.
**Frozen:** 2026-08-26. **Ship-as:** `.1033`.
**Base:** master `56b7e3eabc2ad256d0e3162ff549b4da680830c5` — Trained day shows how many live sessions (`.1032`).
**Do not smash:** Day-cell `.1032`, This month `.1031`, Copy `.1030`, month file `.1029`, empty-day `.1028`, Move `.1027`, Repeat `.1026`.

---

## The one thing

This month already prints **training days**. Two logs on Tuesday is still one training day. Print how many live sessions the month on screen has. Not a fire. Not a streak. Not a year picker.

## In / out

**In**

- Pure helper (no store): `src/lib/history/monthSessionCount.ts`
  - `decideMonthSessionCount({ monthKey, history, startFrom? })` returns
    - `{ kind: 'empty' }` when `monthKey` is missing / junk (`isLocalMonthKey`)
    - `{ kind: 'empty' }` when there are no live rows whose local date key (`localDateKeyFromIso(completedAt || startedAt)`) **starts with** that `YYYY-MM`
    - `{ kind: 'apply'; count: number }` otherwise, `count` = number of those live rows
  - Tombs (`deletedAt`) stay out. `startFrom` is accepted and **ignored**.
  - Never invent `0` as apply. Empty month is empty, not a fire-zero.
  - Never `toISOString()`. Never `localStorage`. Never import the store.
- `HistoryCalendar` footer: when decide is apply, print the count with testid `history-month-sessions`, `text-[13px] tabular-nums`. i18n `historyCalSessions` default `{{count}} sessions` / one `1 session`.
  - Keep the existing training-days / other-logged-days summary. Do **not** replace it.
  - Keep `history-month-empty` “Nothing logged this month.” when `grid.trainedDays === 0`. Do not print `0 sessions` there.
- History only. Guest. First set ungated. Today still exactly one Start. Resume `.963` kept.
- Day-cell count `.1032` / This month `.1031` / Copy `.1030` / month file `.1029` / empty-day `.1028` / Move `.1027` / Repeat `.1026` stay.
- Add `.1033` line to `src/lib/firstSetUngated.ts`.

**Out**

- Fire-count calendar / streak / rest-day / missed ✕ / year picker
- Second Start / Feed / share / public URL / Today chrome leak
- Counting tombstones / inventing 0 on empty / replacing training-days with sessions
- Rewriting This month `.1031` or day-cell `.1032`
- Counsel-hold / Mind / `PRIVATE_MODE` flip / promote live www
- Calling `localStorage` / `toISOString()` for calendar dates

## Verify

- `src/lib/history/daySessionCount.test.ts`
- `src/lib/history/thisMonthCalendar.test.ts`
- `src/lib/history/monthTheyOwn.test.ts`
- `src/lib/firstSetUngated.test.ts`
- `src/lib/today/leanDockStart.test.ts`
- `src/lib/history/monthSessionCount.test.ts`
- `src/lib/history/monthSessionCountSurface.test.ts`
- `npx tsc --noEmit`
- `npx tsx scripts/check-build-label.mjs`
