# agent-job-bus — build later

**Gate:** [SELL_FIRST.md](SELL_FIRST.md) result = **PASS** (5 cold pays / 14 days) or a written founder override.

Until then: no hosted queue, no MW cron replacement, no Temporal clone.

---

## Forbidden now

- Hosted multi-tenant queue  
- Temporal / Inngest / Trigger clone as a SaaS  
- Replacing MW cron (`CRON_SECRET`) or `/api/coach`  
- Merging this repo with [token-router-pipeline](../token-router-pipeline/) into an “agent platform”  
- Invented checkout URL  
- Dashboard-first build  
- Claiming SOC2

---

## If the bar passes — smallest after-PASS

1. One binary (Go or Node). SQLite file in the working directory.  
2. HTTP or Unix socket: `enqueue` / `lease` / `ack` / `fail`.  
3. At-least-once. Document poison-message / dead-letter behavior.  
4. **No dashboard in v1.**  
5. License: founder picks (may be a separate repo from MW AGPL).  
6. Price matches the lander ($19 HYPOTHESIS).

Out of v1: cron UI, exactly-once, multi-region, SSO.

---

## Later (not v1)

Optional pairing with the token-router **meter** (two processes, two files) only if both slugs passed and the founder writes it down.
