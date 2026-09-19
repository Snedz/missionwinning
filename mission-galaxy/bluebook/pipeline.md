# Blue Book pipeline

Closed path for an anomaly case. Schema: [case.schema.json](case.schema.json). Map: [../README.md](../README.md).

```
INGEST → CLASSIFY → INSTRUMENT → RESOLVE | UNKNOWN | INSUFFICIENT → ARCHIVE
```

`UNKNOWN` is a **terminal classification and a terminal stage**, not a waiting room you must exit. Stage `UNKNOWN` requires classification `UNKNOWN`. Classification `UNKNOWN` forbids `prosaicHypothesis` and forbids stage `RESOLVE`. Stage `ARCHIVE` may keep classification `UNKNOWN`. `INGEST` may omit classification. `INSUFFICIENT` is a holding classification: the case may return to `CLASSIFY` when the named `gap` closes. `RESOLVE` is the prosaic exit (`KNOWN_PROSAIC` only).

---

## Stages

| Stage | Does | Does not |
|-------|------|----------|
| `INGEST` | Accept a ticket or incident. Record `id`, optional `ticketId`, `createdAt`, TRINITY roles | Classify. Grant capabilities. Call host doors |
| `CLASSIFY` | Set `KNOWN_PROSAIC` \| `UNKNOWN` \| `INSUFFICIENT` with the matching rationale field | Force prosaic closure. Claim ET. Invent traction |
| `INSTRUMENT` | Collect the minimum evidence named by the classification | Expand allowlists. Unpark ClearShot. Add `paymentUrl` |
| `RESOLVE` | Close as `KNOWN_PROSAIC` with `prosaicHypothesis` | Pretend unexplained cases do not exist |
| `UNKNOWN` | Close as first-class unexplained with `unknownRationale` | Require a cover story. Ship a myth product |
| `INSUFFICIENT` | Park with a named `gap` | Treat silence as `KNOWN_PROSAIC` |
| `ARCHIVE` | Move to the archive store. Optional `archivedAt` | Delete the record. Samson-rebuild the host |

## Classification rules

- `KNOWN_PROSAIC` requires `prosaicHypothesis` — an ordinary cause (clock skew, leftover extras, misread log). Not a joke and not a myth.
- `UNKNOWN` requires `unknownRationale` — why prosaic causes do not yet fit. **Not** “aliens confirmed.”
- `INSUFFICIENT` requires `gap` — the missing instrument or log.
- A closed program may leave a **minority (~20%)** of cases `UNKNOWN`. That allowance is policy text on the case (`unexplainedQuotaNote`), not a quota to fill and not a live counter.

## TRINITY

`trinity.builder`, `trinity.judge`, and `trinity.canary` are three distinct ids. The builder who wrote the case does not LGTM it. The canary does not share an id with either.

## Infinite Life · anti-Samson

`infiniteLife: true` — classification does not kill the program.  
`antiSamson: true` — rebuild re-isolates and re-allowlists; it does not take the host down to “win.”

## Refuse on this path

No `paymentUrl` / `checkout`. No `etProof` / `alienConfirmed`. No tip-promote. No ClearShot unpark.
