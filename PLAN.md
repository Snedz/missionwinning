# PLAN — Edit this session's logged duration (`.1035`)

**Status:** Frozen. One leftover. **Horizon 0.** Wedge: Train + Coach.
**Frozen:** 2026-08-26. **Ship-as:** `.1035`.
**Base:** master `a075f994fb08f5caa30ef1e997d3779932535272` — Reorder lifts on this finished session (`.1034`).
**Do not smash:** Reorder `.1034`, Name `.1007`, Edit sets `.997`, Move `.1027`, Copy `.1030`. Live pause `.1001` stays on Train.

---

## The one thing

History already **prints** `log.durationSeconds`. Set-hold duration is already editable. The **session clock they logged** is not. Same id. Same sets. Same date. Do not invent elapsed from `startedAt`.

## In / out

**In**

- Pure helper (no store): `src/lib/workout/editSessionDuration.ts`
  - Parse with `parseDurationSeconds` from `src/lib/workout/setRowType.ts`. Cap `SESSION_DURATION_MAX = 86400`.
  - `decideEditSessionDuration({ sessionId, durationSeconds, history, live })`
    - `{ kind: 'empty' }` missing id / junk / negative / over-cap / unparseable
    - `{ kind: 'noop' }` missing / tomb / live-open / same value as current `durationSeconds` (missing current is 0)
    - `{ kind: 'apply'; sessionId; durationSeconds }` otherwise. `0` is apply (clear the clock)
  - `applyEditSessionDuration` same id, same sets, same startedAt/completedAt, only `durationSeconds` + `updatedAt`. Durable caller enqueues. Never wipe live.
  - Never `toISOString()` for a calendar date. `updatedAt` may be ISO now.
- UI: `src/components/history/HistorySessionDuration.tsx` modeled on `HistorySessionName.tsx`
  - testids: `session-history-duration` / `session-history-duration-input` / `session-history-duration-save`
  - outline 44px save, not primary-fill
  - i18n `historyDurationLabel` = `Duration`, `historyDurationSave` = `Save duration`
  - Input may be seconds or mm:ss via `parseDurationSeconds`. Placeholder shows current formatted duration.
  - Hide on tomb. Mount on History detail next to Name.
- Store: `durationFinishedHistoryLog(sessionId, durationSeconds)` like `nameFinishedHistoryLog`.
- History only. Guest. First set ungated. Today still one Start. Resume `.963` kept.
- Add `.1035` line to `src/lib/firstSetUngated.ts`.

**Out**

- Rewriting `startedAt` / `completedAt` from the duration
- Inventing elapsed / auto-pause / live clock write
- Second Start / Feed / Today chrome
- Counsel-hold / Mind / `PRIVATE_MODE` flip / promote
- `localStorage`
