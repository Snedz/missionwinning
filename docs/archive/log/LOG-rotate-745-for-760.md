## 2026-08-13 — Rest timer remembers last rest (`.745`)

The free logger already had one rest timer (dock + footer Rest). Next rest
ignored what the athlete last chose for that exercise — only a global session
default and a name heuristic. Strong/Hevy remember last rest; we did not.

**Ship:** deepen the existing timer — `rememberLastRest` / `recallLastRest` /
`resolveRestForNextSet` in `restTimer.ts`. Log-set and footer Rest start the
same store timer with last rest (else heuristic ∪ session default). +15s that
grows the initial updates last rest. **Skip / stop never write** leftover
seconds (no shame, no rest streak). Device-local `mw_last_rest_by_exercise`,
capped at 80 ids. No second timer. Set-log table stays first paint.

Label `.745` (onto master `.744`). Originally reserved `.715`; landed as `.745` past master `.744`.
Excellence-Override below.

Excellence-Override: rest timer last-rest

Rotated LOG oldest → [docs/archive/log/LOG-rotate-669-for-715.md](docs/archive/log/LOG-rotate-669-for-715.md). · [`.744` for `.759`](docs/archive/log/LOG-rotate-744-for-759.md).
