# Rotated from LOG.md for `.955`

## 2026-08-24 — Next-set cite after a logged set (`.939`)

After a working set the logger already knew last (ghost)
and vs-last (delta). Next-set numbers already lived in
`suggestNextSetTarget`. None of that painted a skippable
cite on the set row.

**Ship:** `resolveAfterCompleteCite` reuses the existing
engine. Empty history does not invent. One logged set
cites the next load from this session. Skip never blocks
Log set. `getLastSessionSets` now reads
`lastLiveSessionForExercise` — #487 leftover private
loop (tombstones / 0-rep junk). Not a feed. Not a door
name. Not TARGET-above-PREVIOUS. Prev is official
last-actuals (not marketing) and does not fill next.
Cite is after complete, not a last-set ghost. Program
bump (all prescribed sets at top of range) is not
written. Sync/import is a later chore — no mid-set
data-loss claim. Train only.

Label `.939` (past master `.938`; `#775` landed `.938`; `#774` is `.934`).

Rotated LOG oldest → [LOG-rotate-919-for-939.md](./LOG-rotate-919-for-939.md).
