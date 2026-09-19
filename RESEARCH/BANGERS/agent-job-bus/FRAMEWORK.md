# agent-job-bus — framework

**Claim:** Indie agent builders will pay for a **smaller durable job bus** than Temporal / Inngest / Trigger.dev. Longest cycle in this pack (rank 10).

**Status:** paper. **Pays:** 0. **Checkout:** none.

## Problem

Agents need retries, queues, and “don’t lose the run.” The category already has serious products.

## Buyer

| Field | Value |
|-------|--------|
| Who | Solo TypeScript/Python agent hackers who find Inngest/Trigger “too product” and Temporal “too ops” |
| Who is not | Teams that want hosted DX, SSO, HIPAA — they already have Trigger / Inngest / Temporal Cloud |
| Job | Enqueue, lease, retry, dead-letter. One process. No cloud account. |
| 14-day pays | **UNKNOWN** if five of them pay in 14 days. Hardest bar. |

## Wedge

SQLite-backed bus: enqueue, lease, retry, dead-letter. One process. No cloud account. If they wanted hosted DX, they already have Trigger.dev.

**Token meter vs job queue:** [token-router-pipeline](../token-router-pipeline/) meters **tokens** (free → BYOK, disk ledger). This slug queues **jobs**. Do not merge into one “agent platform.” Complementary rule: [OVERNIGHT_GLM53.md](../OVERNIGHT_GLM53.md).

## MW relationship

Infra only. May later serve MW LLM spend caps (`LLM_DAILY_USD_CENTS`) — **not a reason to build now.** Do not replace MW cron / `CRON_SECRET`. Do not wire `/api/coach` through a new queue.

## 14-day test

See [SELL_FIRST.md](SELL_FIRST.md). Bar: **5 cold pays / 14 days**. Rank 10 — **do not start this test first.** Almost certainly FAIL unless the ask is a **$19 binary**, not a platform.

## Incumbents (official — re-open before quoting)

| Product | Official | Kind | Listed money (2026-09-19) | Wedge vs us |
|---------|----------|------|---------------------------|-------------|
| **Inngest Cloud** | https://www.inngest.com/pricing | Hosted durable functions | Hobby **$0** (50k executions). Pro **starting $99/mo** (1M exec included). Enterprise: contact. | Platform + UI. We are one process + one file. |
| **Inngest self-host** | https://www.inngest.com/docs/self-hosting · https://github.com/inngest/inngest | OSS engine | Software free. You run it (`inngest start`). | Already “no cloud account.” Our only chargeable difference is **smaller** (SQLite bus, no Inngest model). |
| **Trigger.dev Cloud** | https://trigger.dev/pricing | Hosted TS tasks | Free **$0** (incl. **$5** credits). Hobby **$10/mo**. Pro **$50/mo** + compute-seconds + **$0.000025**/run. | Hosted DX. Self-host advertised on the product site. |
| **Trigger.dev product** | https://trigger.dev/ | Product + self-host claim | See pricing page | Same. |
| **Temporal Cloud** | https://temporal.io/pricing · https://docs.temporal.io/cloud/pricing | Durable execution | Essentials **from $100/mo**. Business **from $500/mo**. Actions overage from **$50 / million**. | Enterprise-shaped. Not a $19 indie binary. |
| **Temporal OSS** | https://github.com/temporalio/temporal | Self-host | Free software; you run workers + server | Ops tax is the point of Temporal. |
| **Graphile Worker** | https://worker.graphile.org/ | Postgres job queue | OSS (MIT). | Needs Postgres. We are SQLite / one process. |
| **BullMQ** | https://docs.bullmq.io/ | Redis (or PG) queue | OSS. | Needs Redis. Different shape. |
| **Token router (sibling)** | [../token-router-pipeline/](../token-router-pipeline/) | Disk **token meter** | Paper; $29 HYPOTHESIS there | Meters tokens. Does not lease jobs. |

Secondary comparison blogs stay in [SOURCES.md](SOURCES.md). Do not treat them as first-party prices.

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Building a worse Inngest | Kill | Offer must be the $19 one-file bus, not a platform. |
| “Just self-host Inngest / Trigger / Graphile” | Kill | If that sentence wins, this slug dies. |
| 14-day B2B cycle | Rank 10 | Do not run first. Cheap one-time. DM 20 builders. |
| Merging with token-router | Process | Link. Two jobs. |
| MW cron coupling | Process | Forbidden. |

## Price hypothesis (not a fact)

$19 one-time. **HYPOTHESIS.** Do not print a Stripe URL.
