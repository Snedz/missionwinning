# agent-job-bus — sources

Checked **2026-09-19**. Re-verify before quoting prices.

**Token meter sibling (do not copy their gateway table):** [token-router-pipeline/SOURCES.md](../token-router-pipeline/SOURCES.md) · [token-router-pipeline/FRAMEWORK.md](../token-router-pipeline/FRAMEWORK.md).

| # | What | URL | Used for | Notes |
|---|------|-----|----------|-------|
| 1 | Inngest pricing | https://www.inngest.com/pricing | Official | Hobby $0 / 50k exec; Pro starting $99/mo. Re-opened 2026-09-19. |
| 2 | Inngest self-host | https://www.inngest.com/docs/self-hosting | OSS path | `inngest start`; CLI includes services. |
| 3 | Inngest GitHub | https://github.com/inngest/inngest | Source | Cited from their self-host docs. |
| 4 | Trigger.dev pricing | https://trigger.dev/pricing | Official | Free $0 + $5 credits; Hobby $10; Pro $50 + compute. |
| 5 | Trigger.dev product | https://trigger.dev/ | Product + self-host claim | Existing stub. |
| 6 | Trigger.dev limits | https://trigger.dev/docs/limits | Plan caps | Re-open if citing concurrency. |
| 7 | Temporal pricing | https://temporal.io/pricing | Official | Essentials from $100/mo; Business from $500/mo. |
| 8 | Temporal Cloud pricing docs | https://docs.temporal.io/cloud/pricing | Official detail | Actions from $50/M; storage GBh rates. |
| 9 | Graphile Worker | https://worker.graphile.org/ | OSS PG queue | Adjacent, not a hosted platform. |
| 10 | BullMQ docs | https://docs.bullmq.io/ | OSS Redis queue | Adjacent. |
| 11 | Inngest vs Temporal vs Trigger (secondary) | https://apiscout.dev/guides/inngest-vs-temporal-vs-trigger-dev-2026 | Secondary | Do not treat as first-party prices. |
| 12 | Background jobs compare (secondary) | https://www.stackfyi.com/guides/background-jobs-trigger-vs-inngest-vs-temporal-2026 | Secondary | Same. |
| 13 | Token router sibling | [../token-router-pipeline/](../token-router-pipeline/) | Meter vs queue | Complementary. |

## UNKNOWN (do not invent) — dated 2026-09-19

| Item | Why |
|------|-----|
| Our buyer count for a $19 SQLite bus | Untested. Pays = 0. |
| Inngest / Trigger / Temporal **MRR** or customer counts | Vendor marketing. Out. |
| Trigger.dev self-host operational cost | Not measured. |
| Whether five strangers pay in 14 days | Rank 10. That is the bar. |
