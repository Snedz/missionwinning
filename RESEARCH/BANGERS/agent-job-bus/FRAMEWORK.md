# agent-job-bus — framework

**Claim:** Indie agent builders will pay for a **smaller durable job bus** than Temporal / Inngest / Trigger.dev. Longest cycle in this pack (rank 10).

**Status:** paper. **Pays:** 0. **Checkout:** none.

## Problem

Agents need retries, queues, and “don’t lose the run.” The category already has serious products.

## Buyer

Solo TypeScript/Python agent hackers who find Inngest/Trigger “too product” and Temporal “too ops.” **UNKNOWN** if five of them pay in 14 days.

## Wedge

SQLite-backed bus: enqueue, lease, retry, dead-letter. One process. No cloud account. If they wanted hosted DX, they already have Trigger.dev (free / $10 Hobby / $50 Pro — **re-open trigger.dev**).

## Incumbents (thin)

| Name | URL | Notes |
|------|-----|-------|
| Inngest | https://www.inngest.com/pricing | Hobby $0 (50k executions); Pro $99/mo (page 2026-09-19) |
| Trigger.dev | https://trigger.dev/ | TS tasks; self-host advertised; cloud usage-priced |
| Temporal | Temporal Cloud / OSS | Enterprise-shaped; Cloud dollars **re-open** their pricing |

## Risks

Building a worse Inngest. 14-day bar almost certainly FAIL unless the ask is a **$19 binary**, not a platform.

## Price hypothesis

$19 one-time. **HYPOTHESIS.**
