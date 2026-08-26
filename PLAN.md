# PLAN — Move this session to another day (`.1027`)

**Status:** Frozen. One daily. **Horizon 0.** Wedge: Train + Coach.
**Frozen:** 2026-08-26. **Ship-as:** `.1027`.
**Base:** master `f3a273ca` — Repeat this session (`.1026`).
**Do not smash:** Repeat `.1026`, set-table `.1025`, History volume `.1024`, month `.1018`, edit-finished `.997`, backfill `.1000`.

---

## The one thing

Edit-finished is sets. Backfill is a new row. Missing: re-date the existing finished History log. Strong is adjust date.

## In / out

**In**

- History detail (finished live session only): one Move to another day action.
- Same id. Same sets. Clock stays. Vacated day drops that row. Destination day shows it.
- Empty / missing / tomb / future invents nothing. Tombs stay out unless restored.
- Guest. First set ungated. Today still one Start. Resume `.963` kept.

**Out**

- Streak / rest-day count / future-day planner.
- Second Start / Feed / share / public URL.
- Today chrome. Counsel-hold / Mind / `PRIVATE_MODE` flip / promote.
- Repeat `.1026`. Set-table `.1025`. History volume `.1024`. Month `.1018`. Edit `.997`. Backfill `.1000`.

## Verify

- `src/lib/workout/moveSessionDay.test.ts`
- `src/lib/workout/moveSessionDaySurface.test.ts`
