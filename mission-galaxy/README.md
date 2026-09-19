# Mission GALAXY

Public-safe paper for a **Directory + Blue Book** ops slice. This is governance of unknown agents and unexplained cases — not a myth product, not athlete UI, and not a payment rail.

Map: **Directory · Tickets · Stores · Quarantine · Blue Book · rebuild**.

Freeze: [PLAN.md](PLAN.md). Folder card: [INDEX.md](INDEX.md).

---

## Directory

The Directory is the closed inventory of **who may act** and **where their tickets live**.

Closed **trust tiers** (see [directory.schema.json](directory.schema.json); coupling in `TRUST_TIER_RULES`):

| Tier | Store | Submitter | Status | Grants |
|------|-------|-----------|--------|--------|
| `host` | `directory` | allowlisted + `agentId` | `open` \| `resolved` | closed or `[]` |
| `known` | `directory` | allowlisted + `agentId` | `open` \| `resolved` | closed or `[]` |
| `unknown` | `quarantine` | `unknown` | `open` \| `quarantined` | `[]` · presume breach |
| `quarantine` | `quarantine` | `unknown` | `quarantined` | `[]` · presume breach |
| `archive` | `archive` | either (unknown still presume breach) | `archived` | `[]` — no poison restore |

A Directory document is `{ schemaVersion, tiers, tickets[] }`. Tiers on the document are exactly the five names above, in that order.

## Tickets

A ticket is a work item, not a verdict.

Required fields: `id`, `tier`, `status` (`open` \| `quarantined` \| `resolved` \| `archived`), `subject`, `submittedBy`, `capabilityAllowlist`, `presumeBreach`, `store`, `createdAt`.

`submittedBy.kind` is `allowlisted` or `unknown`. An `unknown` submitter:

- must set `presumeBreach: true`
- must use `tier` `unknown` or `quarantine`, or `archive` once closed
- must use `store` `quarantine` or `archive` (archive ⇒ status `archived`, empty allowlist)

`createdAt` is an ISO-8601 instant (`…Z`). Ticket ids are unique. Shape is `validateCapabilityTicket`.

Empty `capabilityAllowlist` is the default. Missing grant = deny. See [capability-world.md](capability-world.md).

Banned ticket/document keys: `paymentUrl`, `checkout`, `clearshot`, `traction`, `restore`, `poisonRestore`, `unpark`, `promoteLive`, `tipPromote`.

## Stores

Three stores. A ticket names exactly one.

| Store | Holds |
|-------|--------|
| `directory` | Allowlisted, in-flight tickets |
| `quarantine` | Unknown-submitter tickets and anything that presumed breach |
| `archive` | Closed tickets. Allowlist must be `[]` — grants do not walk back (no poison restore) |

Quarantine is a **store**, not a classification. A quarantined ticket may later become a Blue Book case. It does not gain host doors by moving.

## Quarantine

Unknown agent ⇒ presume breach ⇒ quarantine. That is the whole rule.

Quarantine cannot call host capability doors. It cannot grow an allowlist by leftover extras. Rebuild (below) re-isolates; it does not pardon.

## Blue Book

Anomaly cases — unexplained behavior in the agent/ops program — use [bluebook/case.schema.json](bluebook/case.schema.json) and [bluebook/pipeline.md](bluebook/pipeline.md).

Closed **classifications:**

| Classification | Means | Required extra |
|----------------|-------|----------------|
| `KNOWN_PROSAIC` | Ordinary cause named | `prosaicHypothesis` |
| `UNKNOWN` | First-class unexplained. Not a defect. Not ET proof | `unknownRationale` |
| `INSUFFICIENT` | Cannot classify yet | `gap` |

`UNKNOWN` must not carry a `prosaicHypothesis` cover story. Stage `UNKNOWN` requires classification `UNKNOWN`. Stage `ARCHIVE` may keep classification `UNKNOWN`. `INGEST` may omit classification. A closed program may leave a **minority (~20%)** of cases unexplained. Forcing `KNOWN_PROSAIC` to hit 0% is the failure mode this slice exists to prevent.

Pipeline:

```
INGEST → CLASSIFY → INSTRUMENT → RESOLVE | UNKNOWN | INSUFFICIENT → ARCHIVE
```

Every case carries **TRINITY** `{ builder, judge, canary }` — three distinct role ids. Builder does not self-LGTM. `antiSamson` and `infiniteLife` are required `true`: classification is not a kill switch, and rebuild is not scorched earth.

Banned case keys: `paymentUrl`, `checkout`, `etProof`, `alienConfirmed`, `traction`, `restore`, `unpark`, `promoteLive`, `tipPromote`.

## Rebuild

Rebuild is **last-resort isolation**, never Samson:

1. Move live tickets for the suspected actor to `quarantine`.
2. Drop their `capabilityAllowlist` to `[]`.
3. Re-issue grants only from the closed capability world.
4. Archive the incident as a Blue Book case (`UNKNOWN` is allowed).
5. The program continues (`infiniteLife`).

Do not take the host down to “win” a classification. Do not unpark ClearShot. Do not invent checkout.

---

## Verify

```bash
node mission-galaxy/validate.mjs
node --test mission-galaxy/validate.test.mjs
```

Closed fixtures: [fixtures/](fixtures/).

## Refuse (standing)

- No `paymentUrl` / `checkout`
- No ClearShot unpark
- No ET proof / myth product
- No tip-promote / fake traction
- Builder ≠ Judge ≠ Canary
