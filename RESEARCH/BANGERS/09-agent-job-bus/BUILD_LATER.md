# 09 — BUILD_LATER

Gate: founder override **or** (later) a real payment. Overnight agents may implement **only** a repo-local JSONL under `RESEARCH/BANGERS/09-agent-job-bus/var/` if the founder asks — default is paper schema.

## Phase A (local)

1. `queue.jsonl` with the fields in FRAMEWORK
2. `lease.mjs` — fail if `id` already `leased`
3. `receipt.mjs` — writes paths + `verify-contract.mjs` exit code
4. Overnight playbook points at these commands

## Phase B

- Optional hook to 03 for a spend ceiling (if 03 exists)
- Human `abandon` for a dead lease older than one night

## Never

- A public HTTP job API with a made-up domain
- Replacing `docs/GRAPH_LOOP.md` / `npm run harness`
- Storing API keys in the queue file

## Proofs allowed now

The field table in FRAMEWORK and this file. No `localhost` “demo server” that looks like a product.
