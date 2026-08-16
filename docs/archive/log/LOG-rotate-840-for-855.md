# Rotated from LOG.md when `.855` landed

## 2026-08-15 — Coach week is magnitude-blind (`.840`)

GNT-1 U3 proved two histories differ. Two points cannot separate "reads logs"
from "has two moods" — a planner flipping on any non-empty history passes it.

**Ship:** GNT-2 opened on its written gate (GNT-1 report done). U1 instrument
`coachEval.test.ts` sweeps 0→20 logs: recovery monotone up, sets monotone down,
`MIN_DISTINCT_DOSE_SHAPES` floor. It found the bar **unmet** — the planner emits
`48 sets/0 recovery` cold and `34/2` for *every* non-empty history, so 2 logs and
20 produce the same week. Floor pinned at 2 to document that, not endorse it;
raising it is the U1 builder brief. 2 mutants killed (log-blind → collapsed to 1
shape; cold-as-strained → same). Test-only ratchet, not a new npm check: that
would need gate wiring (`ciTruth`) and CLAUDE.md §4 (`gateDocParity`).

Label `.840` (onto master `.839`).

Rotated LOG oldest → [docs/archive/log/LOG-rotate-822-for-840.md](docs/archive/log/LOG-rotate-822-for-840.md).
