# PLAN — Mission GALAXY public-safe slice

**Status:** FROZEN. Implement only what this file names.  
**Not** `docs/PLAN.md` (build phases A–I). This file is the craft-window freeze.  
**Builder only.** A later Judge / Canary reviews. This PR does not self-LGTM.

---

## Goal

Scaffold a **public-safe** Mission GALAXY paper module: Directory tickets + Blue Book anomaly-case pipeline docs/schemas that mirror Founder doctrine without shipping a myth product, a payment rail, or a ClearShot unpark.

Doctrines this slice must encode (names only; no INTERNAL war-room):

| Doctrine | Public-safe meaning in this folder |
|----------|-------------------------------------|
| **Unknown agents** | An unsigned / unallowlisted actor is `UNKNOWN`, not silently trusted |
| **Presume breach** | `UNKNOWN` submitters force quarantine + `presumeBreach: true` |
| **UNKNOWN first-class** | `UNKNOWN` is a valid terminal classification, not a defect to paper over |
| **Blue Book ~20% unexplained** | A closed program may leave a minority of cases unexplained. Do not force `KNOWN_PROSAIC` to hit 0% |
| **Infinite Life** | Classification is not a kill switch. The program continues |
| **anti-Samson** | Rebuild is last-resort isolation, never scorched-earth take-down |
| **TRINITY** | Builder ≠ Judge ≠ Canary. Three distinct role ids on every case |
| **WIT / no ambient authority** | Capability grants are explicit allowlists. Missing grant = deny |

This is **ops-governance paper**, not a UFO claim and not athlete UI.

## One concern

Land Directory + Blue Book schemas and the map/pipeline/capability docs that make them usable. Nothing else.

## Files to create

All new files live under `mission-galaxy/` except one routing row.

| Path | Role |
|------|------|
| `mission-galaxy/PLAN.md` | This freeze |
| `mission-galaxy/README.md` | Map: Directory · Tickets · Stores · Quarantine · Blue Book · rebuild |
| `mission-galaxy/INDEX.md` | Folder resume card (repo convention). Thin pointer at README + schemas |
| `mission-galaxy/directory.schema.json` | Directory document: closed tiers + ticket fields |
| `mission-galaxy/bluebook/case.schema.json` | Case document: `KNOWN_PROSAIC` \| `UNKNOWN` \| `INSUFFICIENT` |
| `mission-galaxy/bluebook/pipeline.md` | `INGEST → CLASSIFY → INSTRUMENT → RESOLVE \| UNKNOWN \| INSUFFICIENT → ARCHIVE` |
| `mission-galaxy/capability-world.md` | WIT-style capability allowlists. No ambient authority. No `paymentUrl` / `checkout` |
| `mission-galaxy/validate.mjs` | Tiny Node schema/fixture validator (no new npm dep) |
| `mission-galaxy/validate.test.mjs` | `node:test` pins: accept valid, refuse doctrine-breaking fixtures |
| `mission-galaxy/fixtures/` | Closed fixture set (valid + refuse). Listed in README |
| `INDEX.md` (repo root) | One routing row: Mission GALAXY → `mission-galaxy/README.md` |

### Fixture set (closed)

| File | Expect |
|------|--------|
| `fixtures/directory.valid.json` | accept |
| `fixtures/directory.unknown-without-breach.json` | refuse (`presumeBreach` missing / false on unknown submitter) |
| `fixtures/case.unknown.json` | accept (`UNKNOWN` first-class) |
| `fixtures/case.known-prosaic.json` | accept (prosaic hypothesis present; no myth claim) |
| `fixtures/case.insufficient.json` | accept |
| `fixtures/case.builder-is-judge.json` | refuse (TRINITY) |
| `fixtures/case.payment-url.json` | refuse (`paymentUrl` / `checkout` banned) |

## Schema contracts (must land)

### Directory (`directory.schema.json`)

Closed **tiers:** `host` · `known` · `unknown` · `quarantine` · `archive`.

A Directory document has `schemaVersion`, `tiers` (the closed list), and `tickets[]`.

Each **ticket** requires:

- `id` (non-empty string)
- `tier` (one of the closed tiers)
- `status` — `open` \| `quarantined` \| `resolved` \| `archived`
- `subject` (non-empty, max 200)
- `submittedBy` — `{ kind: "allowlisted" \| "unknown", agentId?: string }`
- `capabilityAllowlist` — array of grant strings; default empty; **no ambient**
- `presumeBreach` — boolean; **must be `true` when `submittedBy.kind === "unknown"`**
- `store` — `directory` \| `quarantine` \| `archive`
- `createdAt` (ISO-8601)

Unknown submitter + `tier` not `unknown`/`quarantine` is refuse. Unknown submitter + `store` not `quarantine` is refuse.

Banned keys on tickets and on the document: `paymentUrl`, `checkout`, `clearshot`, `traction`.

### Blue Book case (`bluebook/case.schema.json`)

Closed **classifications:** `KNOWN_PROSAIC` · `UNKNOWN` · `INSUFFICIENT`.

Closed **stages:** `INGEST` · `CLASSIFY` · `INSTRUMENT` · `RESOLVE` · `UNKNOWN` · `INSUFFICIENT` · `ARCHIVE`.

Each case requires:

- `id`, optional `ticketId`
- `stage`, `classification` (required once stage ≥ `CLASSIFY`; fixtures after INGEST always set it)
- `trinity` — `{ builder, judge, canary }` three **distinct** non-empty role ids
- `antiSamson` — must be `true`
- `infiniteLife` — must be `true`
- `unexplainedQuotaNote` — string naming the ~20% unexplained allowance (policy text, not a live counter)
- evidence / rationale fields:
  - `KNOWN_PROSAIC` requires `prosaicHypothesis`
  - `UNKNOWN` requires `unknownRationale`
  - `INSUFFICIENT` requires `gap`
- `createdAt`

Banned keys: `paymentUrl`, `checkout`, `etProof`, `alienConfirmed`, `traction`.  
`UNKNOWN` must not require a prosaic cover story.

### Capability world (`capability-world.md`)

- Closed grant names only. Do not invent `paymentUrl` or `checkout`.
- Point at existing Mission OS doors (`identity` / `billing` / `photos` / `storage`) **by reference**. Do not edit `src/lib/mission-os/` or unpark ClearShot.
- Unknown grant = deny. Quarantine store cannot call host doors.
- Rebuild = re-isolate + re-allowlist, never Samson.

## Refuse

- Do **not** invent `paymentUrl` / `checkout` (schema, docs, fixtures, or validator allow-path).
- Do **not** touch ClearShot / unpark it. Do not edit `src/lib/mission-os/clearshot.ts` or `packages/mw-core` ClearShot rows.
- Do **not** claim ET proof or ship myth products. `UNKNOWN` ≠ “aliens”.
- Do **not** tip-promote or invent traction.
- Do **not** flip `PRIVATE_MODE`. Do not mint a build label (this branch touches no `src|app|scripts|supabase`).
- Do **not** edit Train / Today / Coach / Fuel UI, Stripe, camera, or add a product route.
- Do **not** recreate INTERNAL strategy / REDTEAM memos. Public-safe names only.
- Do **not** self-LGTM. Builder ≠ Judge.
- Prefer `[skip vercel]`.

## Done when

- This PLAN is frozen, then implemented without expanding the file list beyond what this revision names.
- Schemas + docs + validator + closed fixtures landed.
- `node mission-galaxy/validate.mjs` and `node --test mission-galaxy/validate.test.mjs` exit 0.
- PR open vs `master` with verify steps. Draft. No self Judge LGTM.
- Hard window: finish substantive work, then stop.
