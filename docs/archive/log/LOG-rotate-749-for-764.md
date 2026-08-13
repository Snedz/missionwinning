## 2026-08-13 — Supersets on the set log (`.749`)

Hevy/Strong users expect to alternate A1/A2 without losing the set row. Grouping
already existed (`supersetGroup` + `advanceAfterLog` / `shouldRestAfterLog`) but
marked `SS A`, could merge into giant sets, and unlink left an orphan peer.

**Ship:** light pairing on the free logger — exactly two consecutive exercises,
A1/A2 on the existing set table, shared rest after B. `pairWithNext` / `unpair`
are the one definition; store toggle/unlink/remove call them. Pair persists on
the active session (device, no account). Speech never owns this.

Label `.749` (onto master `.748`). Originally reserved `.719`; landed as `.749` past master `.748`.
Excellence-Override below.

Excellence-Override: logger supersets

Rotated LOG oldest → [docs/archive/log/LOG-rotate-690-for-749.md](docs/archive/log/LOG-rotate-690-for-749.md). · [`.748` for `.763`](docs/archive/log/LOG-rotate-748-for-763.md).
