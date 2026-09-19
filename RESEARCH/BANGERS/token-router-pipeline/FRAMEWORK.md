# token-router-pipeline — framework

**Claim:** Indie builders will pay a small amount for a **disk-local meter + free→BYOK-paid failover** they own. They will **not** pay for “another OpenRouter.”

**Status:** paper. **Pays:** 0. **Checkout URL:** none.

---

## Problem

LLM spend is a **gas bill**: many meters, many shutoffs, one leak and the month is gone. Teams already buy **gateways** (one API, logs, fallbacks). The category is crowded and well-funded.

An indie still has a smaller, uglier job:

1. Burn **free** quota first (provider free tiers, OpenRouter free models).  
2. When free fails (429, empty, quality), fail over to **their own paid keys**.  
3. Keep a **local ledger** of tokens / cents so a cron or agent cannot silently drain a card.

That job is a **policy + ledger**, not a marketplace.

---

## Buyer

| Field | Value |
|-------|--------|
| Who | Solo / 2-person shops running agents or batch jobs with a mix of free and paid keys |
| Job | Cap spend on disk; prefer free; fail over without rewriting every client |
| Not | Enterprises that need SOC2, SSO, HIPAA — they already have Portkey / Helicone / CF |

**14-day cold pays:** hard. This is rank 7. Price must be a **one-time or cheap annual binary**, not a 5.5% marketplace.

---

## How this is not OpenRouter

| | **OpenRouter** | **This indie router** |
|--|----------------|------------------------|
| Job | One hosted API + unified credits across 500+ models | Policy on **your** keys and **your** disk |
| Money | Provider rates pass through; **5.5%** fee on card credit purchases (Standard, 2026-09-19). BYOK: fee-free to $25k list / mo then 5% | **No credit resale.** Buyer pays providers directly. They pay *us* once for the meter/failover binary. |
| Free models | 25+ free models on the Free plan; 50 req/day cap on that plan | Use those (or Groq/Gemini/etc. free tiers) as **first hop**, then BYOK |
| Failover | Hosted auto-routing on paid plans | Local ordered list: `free → cheap BYOK → expensive BYOK` |
| Hosting | Their cloud | Process + SQLite/JSONL on disk. Optional later: user’s VPS |
| Marketplace | Yes | **No** |

If the lander says “access 500 models with one key,” you are selling OpenRouter. Stop.

---

## Industry landscape (gas pipelines)

Think of each product as a **pipe** (where tokens flow), a **meter** (who sees the bill), and a **valve** (who can shut it).

| Pipe | Official | Kind | Meter | Valve | Typical money (re-check) |
|------|----------|------|-------|-------|--------------------------|
| **OpenRouter** | https://openrouter.ai/pricing | Hosted aggregator | Activity logs; credit wallet | Auto-routing, budgets on paid plans | Standard **5.5%** on credit buy ($0.80 min). Business **8%**. Free: 50 req/day, 25+ free models |
| **LiteLLM** | https://docs.litellm.ai/docs/simple_proxy | OSS OpenAI-compatible proxy | Spend per virtual key / user | Budgets, rate limits, fallbacks in config | Software free (MIT). You pay infra. Enterprise is sales-quoted |
| **Portkey** | https://portkey.ai/ · pricing on site | Gateway + governance | Logs (plan-capped) | Guardrails, RBAC, virtual keys | First-party 2026-09-19: Developer free (10k logs); Production **$49/mo**. Homepage banners PRISMA AIRS rename |
| **Helicone** | https://www.helicone.ai/pricing | Observability-first + gateway | Requests, HQL, retention by plan | Caching, rate limits, fallbacks | Hobby free (10k req/mo). Pro **$79/mo**. Team **$799/mo**. Usage-based after includes |
| **Martian** | https://docs.withmartian.com/ | Quality/cost **router** | Their routing | Pick model per request | Directory sites cite 2,500 free req then ~$20 / 5k. **Confirm on Martian’s own pricing page** (not found as a stable public table in this pass) |
| **Cloudflare AI Gateway** | https://developers.cloudflare.com/ai-gateway/ | Edge proxy | Analytics, logs | Cache, rate limit, retry, model fallback | Docs: available on all CF plans. Unified Billing **5%** first-party (`/ai-gateway/reference/pricing`) |
| **FreeBuff** | https://freebuff.com/ | Ad-supported **coding agent CLI** | Ads between turns | Not a public `/v1` gateway | Free for humans. **No official developer API.** Unofficial proxies exist and violate the spirit/ToS — **out** |

Other names you will hit (not in the user list): Vercel AI Gateway, Kong AI Gateway, Bifrost, Requesty, RouteLLM. Do not add them to a lander unless we add a source row.

---

## Disk router (design notes — paper only)

This is the product if the bar ever passes. It is **not** a hosted SaaS.

```
client  →  localhost:PORT /v1/chat/completions
                │
                ├─ read policy.yaml  (ordered routes)
                ├─ read meter.sqlite (tokens, cents, day/month caps)
                ├─ hop 0..n: try route if meter allows
                │     fail → next hop (429, 5xx, empty, timeout)
                └─ append ledger row (provider, model, tokens, cents, hop)
```

| Piece | Rule |
|-------|------|
| **policy.yaml** | Ordered routes. Each route: `kind: free \| byok`, provider, model, key env name, hard cap (tokens or USD). |
| **meter.sqlite** | One process, one file. Daily / monthly caps. Process **exits 0** (refuse the call) when a cap would break — never “best effort.” |
| **Free hop** | Official free surfaces only: OpenRouter free models (their ToS), Gemini/Groq free tiers, etc. |
| **Paid hop** | Buyer’s keys. We never hold their credits. |
| **FreeBuff** | Consumer CLI only. **Do not** wrap unofficial `freebuff-proxy` / `Freebuff2API`. Those exist to strip ads and scrape a product that is not an API. |
| **Config on disk** | No cloud account. Optional export of the ledger as CSV. |

LiteLLM already does spend tracking and fallbacks. The **only** reason to charge is a **smaller, opinionated** binary: free-first, hard caps, one file, no admin UI tax. If that sentence is not worth $29 to five strangers, **LiteLLM is the answer** and this slug dies.

---

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| “Just use LiteLLM / OpenRouter” | Kill | Offer must be the meter + free-first policy, not the catalog. |
| FreeBuff scrape | Legal / ToS | Explicitly refuse. |
| 14-day B2B cycle | Rank | Cheap one-time; DM 20 agent builders. Expect FAIL. |
| Holding keys | Security | Local only; never our hosted vault in v1. |

---

## Price hypothesis

**HYPOTHESIS:** $29 one-time for the binary + a one-page policy template. Not a % of tokens.

---

## Overnight notes (GLM 5.3)

**2026-09-19 · Lane C.** Complementary only — the OpenRouter-vs-indie table above is unchanged. We are still **not** a new OpenRouter.

**03 vs 09:** this slug meters **tokens** (disk ledger + free→BYOK hop). Idea 09 [agent-job-bus](../agent-job-bus/FRAMEWORK.md) queues **jobs** (enqueue / lease / retry / dead-letter). Same indie-builder ICP is expected; the offers stay two SKUs. Do not merge into an “agent platform.”

**First-party re-open (do not rewrite the landscape table):** Portkey Production **$49/mo** is now on `portkey.ai/pricing` (was secondary). Cloudflare Unified Billing **5%** is now on `developers.cloudflare.com/ai-gateway/reference/pricing` (was third-party). Martian `withmartian.com/plan-pricing` **404** — directory $20/5k stays UNKNOWN. FreeBuff unofficial `/v1` proxies stay **out**. Detail: [GLM53.md](GLM53.md).
