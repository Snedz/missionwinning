## 2026-08-13 — Optional RIR on the set row (`.756`)

Optional integer **0–5 reps in reserve** on a completed set. Empty is valid.
Never required. Never replaces RPE. Log set stays ungated.

**Ship:** `rir.ts` parse; `rateSetRir` after log; compact `SetRirSelect` on
completed rows beside RPE. Sync keeps `side` and `rir`. Offline, no account.

Label `.756` (onto master `.755`). Originally reserved `.725`; landed as `.756` past master `.755`.
Excellence-Override below.

Excellence-Override: optional RIR

Rotated LOG oldest → [docs/archive/log/LOG-rotate-697-for-756.md](docs/archive/log/LOG-rotate-697-for-756.md).
