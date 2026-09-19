# token-router-pipeline — build later

**Gate:** 5 cold pays / 14 days.

---

## Forbidden now

- A hosted SaaS that resells tokens  
- OpenRouter clone  
- FreeBuff / Codebuff unofficial `/v1` proxies (`freebuff-proxy`, `Freebuff2API`, token pools)  
- Wiring MW `/api/coach` through a new gateway  
- Claiming SOC2

---

## If the bar passes — smallest binary

1. Single Go or Node process. `POST /v1/chat/completions` only.  
2. `policy.yaml` + `meter.sqlite` in the working directory.  
3. Routes: `free` then `byok`. Timeout and empty-body count as fail.  
4. Cap breach → HTTP 402 or 429 with a **stable JSON code** (`meter_cap`). No silent truncate.  
5. License: pick one (founder). Do not default to AGPL just because MW is AGPL — this may be a separate repo.  
6. README: “not OpenRouter.”

Out of v1: admin UI, team RBAC, semantic cache, embeddings, image models.

---

## Disk schema (sketch)

```
ledger(id, ts, route_id, provider, model, prompt_tokens, completion_tokens, cents, hop, ok)
caps(period, kind, limit_cents, limit_tokens)
```

Period keys use the **local calendar date**, not `toISOString()` date slices — same lesson as MW `localDateKey`.

---

## Later

Optional sync of the ledger into MW spend caps is a **founder commission**, not a reason to start.
