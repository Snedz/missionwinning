# LOG rotate — `.1113` for `.1137`

Rotated out of `LOG.md` on 2026-10-15 so the live file stays at 15 entries. `.1116` is the live floor.

## 2026-09-24 — History year of logged days (`.1113`)

`/history` paints a Monday-first
year above the session list
and above that day's rows.
Cells are live sessions from
`workoutHistory`
(`workout-tracker-storage`),
bucketed by `trainedDayKeys`
and `localDateKeyFromIso`.
Tombs and junk timestamps
stay out. A day outside the
53-week window is not a cell.
A blank day is not missed.
Fill height is the count
(1 / 2 / 3 / 4+). The strip
opens on the current week.
Import stays the confirm
dialog. MW-owned History
grid. No vendored chart
source. `yearHeatmapSurface.test.ts`
renders the grid, so the
component is in the unit lane.
Untested-file floor stays 494.

**Mutants killed:** two same-day
sessions counted as one; a
tomb still painted; an ISO date
slice moving a Kiritimati
morning onto the previous day;
a session outside the window
added to the totals.

`[skip vercel]`. No
tip-promote. Live www stays `.697`.
PRIVATE_MODE stays.

Label `2026.07-unified.1113`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1098-for-1113.md](docs/archive/log/LOG-rotate-1098-for-1113.md) (`.1098`). `.1097` was already rotated by `.1112`.
