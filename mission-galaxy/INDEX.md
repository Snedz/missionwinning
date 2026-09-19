# mission-galaxy/

> One concern: public-safe Directory tickets + Blue Book anomaly-case paper. Not athlete UI. Not a myth product.

## Agent resume card

- **Purpose:** Mission GALAXY paper — Directory trust tiers + capability tickets, quarantine store, Blue Book pipeline (`INGEST → CLASSIFY → INSTRUMENT → RESOLVE|UNKNOWN|INSUFFICIENT → ARCHIVE`). `UNKNOWN` is first-class. Unknown agents presume breach. Archive grants stay empty (no poison restore).
- **Non-goals:** paymentUrl / checkout, ClearShot unpark, ET proof, traction, product routes, `src/lib/mission-os/` edits, `mission-home/` collision, build-label mint, Live promote.
- **Entry files:** [README.md](README.md) (map) · [PLAN.md](PLAN.md) (freeze + harden) · [directory.schema.json](directory.schema.json) · [bluebook/case.schema.json](bluebook/case.schema.json) · [bluebook/pipeline.md](bluebook/pipeline.md) · [capability-world.md](capability-world.md) · `validateCapabilityTicket` / `TRUST_TIER_RULES` in [validate.mjs](validate.mjs)
- **Tests to run:** `node mission-galaxy/validate.mjs` · `node --test mission-galaxy/validate.test.mjs`
- **Forbidden:** Import from `src/lib/coach/`, `src/store/`, HomePage, ActiveWorkoutPage. Do not edit ClearShot. Do not invent billing URLs. Builder does not self-LGTM.
- **Horizon:** Paper + schemas. Host chrome later.

## Related

| Path | Role |
|------|------|
| [docs/contracts/MODULE.md](../docs/contracts/MODULE.md) | Existing module/capability contract (referenced, not rewritten) |
| [src/lib/mission-os/INDEX.md](../src/lib/mission-os/INDEX.md) | Named doors — do not edit from this folder |
| [docs/CLASSIFICATION.md](../docs/CLASSIFICATION.md) | PUBLIC vs INTERNAL — this slice stays PUBLIC |
