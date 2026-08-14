## 2026-08-13 — Drop sets on the set log (`.754`)

The free logger already had `SetKind` `'drop'` — volume, PR skip, sync, CSV,
and a Kind chip. Tagging Drop did not start a drop. Strong/Hevy users expect
one control after a working set: same exercise, lower load, no rest.

**Ship:** deepen the existing kind. Footer **Drop** (`canStartDrop` after a
working set) marks the next set `kind: 'drop'`, prefills **−20%** of the parent
load (unit step, always below when load > 0), and **skips rest**. Compose with
last-rest via `composeDropRest`. Offline, no account. Set-log table stays first
paint. No XP, no social, no shame.

Label `.754` (onto master `.753`). Originally reserved `.723`; landed as `.754` past master `.753`.
Excellence-Override below.

Excellence-Override: drop sets

Rotated LOG oldest → [docs/archive/log/LOG-rotate-695-for-754.md](LOG-rotate-695-for-754.md).
