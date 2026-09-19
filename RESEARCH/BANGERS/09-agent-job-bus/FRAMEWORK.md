# 09 — agent-job-bus

**Status:** unpublished-draft · paper only  
**Job:** a **local** queue that leases one overnight agent job, writes a receipt, and refuses a second lease until the first is closed — the missing piece between [OVERNIGHT_GLM53.md](../OVERNIGHT_GLM53.md) and a pile of draft PRs.

## What it is

A file-backed bus (git or a working-tree JSONL), not a hosted SaaS.

| Field | Meaning |
|-------|---------|
| `id` | Closed slug (`bangers-04`, `bangers-06`, …) |
| `lease` | `open` / `leased` / `receipt` / `abandoned` |
| `lessee` | Agent id or `UNKNOWN` |
| `receipt` | Paths touched + verify exit code, or `UNKNOWN` |
| `paymentUrl` | Always empty on the **product** story |

Customer zero is **this repo’s overnight GLM**. A later indie-founder SKU is the same schema with a README, not a Kubernetes chart.

## Optional neighbor

Track **03 `token-router-pipeline`** may cap spend **before** a job starts. 09 does not route tokens. If 03 is missing, spend cap is **UNKNOWN** — jobs still lease.

## ICP

A solo founder who wakes up to three agents who all “finished” the same folder. They want a lease file, not another Slack bot.

Not: Mission Winning harness (`docs/GRAPH_LOOP.md`) replacement. Not Vercel cron. Not a marketplace of agents.

## Kill criterion

If two leases can be `leased` on the same `id` at once, the bus is wrong. Do not add a dashboard to hide it.

## Sell before build

[SELL_FIRST.md](SELL_FIRST.md). Price **UNKNOWN** (do not copy $9). `paymentUrl` empty. The playbook may use the schema for free; a paid pack is a later founder decision.
