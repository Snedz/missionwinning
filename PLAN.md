# PLAN — Copy this session onto another day (`.1030`)

**Status:** Frozen. One daily. **Horizon 0.** Wedge: Train + Coach.
**Frozen:** 2026-08-26. **Ship-as:** `.1030`.
**Base:** master `fad56f1f3b2d569ad297392b6ec4caf0f1b7a4c0` — This month as a file they own (`.1029`).
**Do not smash:** month file `.1029`, empty-day `.1028`, Move `.1027`, Repeat `.1026`, typed backfill `.1000`.

---

## The one thing

Hevy duplicate onto a date. Missing: copy a finished History log onto another day as a **new row**. Original stays. Not Move `.1027` (same id). Not Repeat `.1026` (live Start). Not typed backfill `.1000` / empty-day `.1028`.

## In / out

**In**

- From History detail (finished live session only): one **Copy to another day** action (date + save). Outline, 44px, not primary-fill.
- New id + new clientId (`newClientId`). Same sets. Same name/title/notes. Duration copied as logged, not invented.
- Shift startedAt/completedAt by local calendar days the same way Move does (`localDayDelta` / `shiftIsoByLocalDays`) so the clock stays; only the day changes.
- Source day still lists the original. Destination day lists the copy (`decideMonthDaySelect`).
- Empty / missing / tomb / live-open / junk date / future invents nothing. Same-day copy is noop (or empty) — do not mint a clone on the same day.
- History only. Guest. First set ungated. Today still exactly one Start. Resume `.963` kept.
- Store applies via a new `copyFinishedHistoryLog` that enqueues the copy on the durable outbox. Never wipe the live set. Never call localStorage.
- Move `.1027` / Repeat `.1026` / empty-day `.1028` / backfill `.1000` / month file `.1029` stay.
- Add `.1030` line to `src/lib/firstSetUngated.ts`.

**Out**

- Streak / rest-day count / future-day planner.
- Second Start / Feed / share / public URL.
- Today chrome leak (HomeTodayLean still one `dock="start"`).
- Rewriting Move into a copy (Move must still re-date the same id).
- Counsel-hold / Mind / `PRIVATE_MODE` flip / promote live www.

## Verify

- `src/lib/workout/moveSessionDay.test.ts`
- `src/lib/workout/repeatThisSession.test.ts`
- `src/lib/firstSetUngated.test.ts`
- `src/lib/today/leanDockStart.test.ts`
- Colocated copy tests: new id; source day still has original; destination day lists copy; future invents nothing; same-day is noop; Move still same id; Repeat still lands Start; Today still one Start; no Feed
- `npx tsc --noEmit`
- `npx tsx scripts/check-build-label.mjs`
