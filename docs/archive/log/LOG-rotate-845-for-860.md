# Rotated from LOG.md when `.860` landed

## 2026-08-15 — loadZone reaches the split (`.845`)

GNT-2 U1. `contextBuilder` already computed the acute:chronic band and `loadGuard` already held a rise on `high`. `chooseSplit` never saw the band — `planEngine` and `adapt` handed it `bodyScores` only — so a `steady` week and a `high` week were the same `34 sets / 2 recovery` plan. That is the one distinction ACWR exists to make.

**Founder-proposed delta:** `high` inserts one extra recovery day after the existing strain rules, using the same `recoveryDay()` primitive as `strain ≥ 85`. No new set table. `light` / `steady` / `unknown` stay identity on this layer.

**Ship:** `FatigueSignals.loadZone` on `applyFatigueToSplit` / `chooseSplit`; both call sites pass `ctx.loadZone`; `computeContextHash` includes the zone. `MIN_DISTINCT_DOSE_SHAPES` 2 → 3.

Mutants the new tests kill: drop the `high` swap (zone test red); apply `high` before strain so saturation hides it (saturated-strain test red).

Label `.845` (onto master `.844`).

Excellence-Override: gauntlet GNT-2.U1 round 3 (wedge; RESULT unscored)

Rotated LOG oldest → [docs/archive/log/LOG-rotate-830-for-845.md](LOG-rotate-830-for-845.md).
