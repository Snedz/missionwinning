# Rotated from LOG.md when `.771` + `.772` both landed

## 2026-08-13 — Optional tempo on the set row (`.757`)

Optional **ecc/pause/con** (`3-1-1`) on a completed set. Empty is valid.
Never required. Never blocks Log set. Last tempo for that exercise prefills
the next logged set. Does not feed coach load or rewards.

**Ship:** `tempo.ts` parse + last-tempo recall; `rateSetTempo` after log;
compact `SetTempoField` on completed rows beside RPE/RIR. Sync keeps `side`,
`rir`, and `tempo`. Offline, no account.

Label `.757` (onto master `.756`). Originally reserved `.734`; landed as `.757` past master `.756`.
Excellence-Override below.

Excellence-Override: optional set-row tempo

Rotated LOG oldest → [LOG-rotate-714-for-757.md](./LOG-rotate-714-for-757.md).
