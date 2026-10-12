## 2026-09-16 — Split activeWorkoutHelpers behind a barrel (`.1106`)

The 900-line Train helper bag
mixed session view, dial, console,
and menu gates in one file. Night
cleanup splits it behind a barrel
so import paths do not churn.

Bodies: `activeSessionView.ts`
(next-set, open-idx, progress,
post-session path), `activeDial.ts`
(last-session / prev / dial /
next-target / logged-line),
`activeConsole.ts` (`buildConsoleSet`
/ dock / form-guide / swap rank),
`activeMenuGates.ts` (`shouldShow*`
/ skip / volume-trim). Tests stay
on the barrel; body-slicing `read()`
tests follow the owning file.

Did not split Train/Today UI,
`HistoryPage`, `SetLogTable`, or
`workoutStore`. No product behavior
change.

`[skip vercel]`. No tip-promote. Live
www stays `.697`. PRIVATE_MODE stays.

Label `2026.07-unified.1106`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1091-for-1106.md](docs/archive/log/LOG-rotate-1091-for-1106.md) (`.1091`).
