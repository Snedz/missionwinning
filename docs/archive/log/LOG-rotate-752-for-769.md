# LOG rotation — `.752` (rotated for `.769`)

Rotated out of [LOG.md](../../../LOG.md) when `.769` shipped, to keep that file
at ≤15 entries. Nothing is deleted; this is the full entry.

## 2026-08-13 — Garage swap on the exercise row (`.752`)

When the machine is not there, one **Swap** on the Train logger row and on a
Coach session line offers **1–2 original** bodyweight / garage stand-ins (same
pattern, no gym). Short list. Offline. Free. No account.

**Ship:** `garageSwap.ts` closed map + apply helpers. Logger Swap sheet is
`GarageSwapList` (not the catalog picker). Coach line swap mutates one
`PlanExercise` via `swapExerciseInPlan` — does not call `generateWeek` / adapt.
Equipment change clears last load; same equipment keeps planned weight. Hide
Swap when already garage or no honest pair. Today compact stays swap-free.
Swap still seeds the new exercise’s last note (`.748`).

Label `.752` (onto master `.751`). Originally reserved `.721`; landed as `.752` past master `.751`.
Excellence-Override below.

Excellence-Override: garage exercise swap

Rotated LOG oldest → [docs/archive/log/LOG-rotate-693-for-752.md](docs/archive/log/LOG-rotate-693-for-752.md).
