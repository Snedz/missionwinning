# PLAN — Log onto this empty day from the month (`.1028`)

**Status:** Frozen. One daily. **Horizon 0.** Wedge: Train + Coach.
**Frozen:** 2026-08-26. **Ship-as:** `.1028`.
**Base:** master `c721fa5b36d8e730457f4cae207a33239fae03ba` — Move this session to another day (`.1027`).
**Do not smash:** Move `.1027`, Repeat `.1026`, set-table `.1025`, month `.1018`, edit-finished `.997`, backfill `.1000` overflow.

---

## The one thing

`.1018` month empty day currently prints "Nothing logged". Missing: one plus / log-onto-this-day door on that empty day. Reuse `.1000` backfill on that dateKey. New row. Not a second overflow door.

## In / out

**In**

- History month they own (`HistoryCalendar` + `decideMonthDaySelect` kind `none`): one plus / log onto this empty day.
- Prefills the existing backfill draft date to that local dateKey. Save still goes through `decideBackfillSession` (empty / missing / junk invents nothing). Future invents nothing. Tombs stay out unless restored.
- History only. Guest. First set ungated. Today still exactly one Start. Resume `.963` kept.
- Add `.1028` line to `src/lib/firstSetUngated.ts`.

**Out**

- Streak / rest-day count / future-day planner.
- Second Start / Feed / share / public URL.
- Today chrome leak (HomeTodayLean stays one `dock="start"`; no month/backfill import on Today).
- Second backfill overflow button. `.1000` stays the History overflow "Log a past session".
- Counsel-hold / Mind / `PRIVATE_MODE` flip / promote live www.
- Rewriting Move `.1027` / Repeat `.1026` / set-table `.1025` / edit `.997` / backfill helper semantics except date prefill.

## Verify

- `src/lib/workout/backfillSession.test.ts`
- `src/lib/history/monthTheyOwn.test.ts`
- `src/lib/history/monthTheyOwnSurface.test.ts`
- Colocated empty-day door tests (vacated/empty day opens backfill on that date; future invents nothing; Today still one Start; overflow `.1000` still exists)
- `src/lib/firstSetUngated.test.ts`
- `src/lib/today/leanDockStart.test.ts`
