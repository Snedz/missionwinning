# token-router-pipeline — GLM 5.3 overnight

**Lane:** C  
**Idea #:** 03  
**Read first:** [OVERNIGHT_GLM53.md](../OVERNIGHT_GLM53.md), then this folder’s [FRAMEWORK.md](FRAMEWORK.md) + [SELL_FIRST.md](SELL_FIRST.md).

## Mission (this night)

Paper only. Keep the claim as a **disk-local meter + free→BYOK failover** the buyer owns — not a hosted catalog. Re-open first-party pricing. Keep unofficial FreeBuff / Codebuff `/v1` proxies **out**. Do not invent a payment URL. Do not replace the OpenRouter-vs-indie table. Do not pitch a new OpenRouter.

## Must keep

- Kill bar: 5 cold pays / 14 days
- Checkout URL: none
- Pays: 0 unless the founder wrote a count
- FreeBuff unofficial `/v1` (including `freebuff-proxy`, `Freebuff2API`, token pools): **out**
- No hosted SaaS checkout; no invented OpenRouter discount / `buy.*` URLs

## Do tonight

- [x] Confirm all six contract files exist
- [x] Re-open SOURCES; mark dead / unconfirmed cells UNKNOWN
- [x] Complement FRAMEWORK (overnight notes only — OpenRouter-vs-indie table untouched)
- [x] SELL_FIRST lander still has the honesty block
- [x] Append leftovers to [CURSOR_TODO.md](CURSOR_TODO.md)

## Do not

- Invent a payment URL
- Start a binary
- Rewrite sibling slugs
- Add a `freebuff-proxy` adapter
- Sell “one key, 500 models”

## What stayed true

The existing [FRAMEWORK.md](FRAMEWORK.md) OpenRouter-vs-indie table is still the right split: they sell a hosted credit wallet; we would sell a **policy + ledger on disk**. LiteLLM already does spend + fallbacks — the only chargeable sentence remains **hard-cap, free-first, one-file**. If five strangers will not pay $29 for that, this slug dies.

Idea 09 ([agent-job-bus](../agent-job-bus/FRAMEWORK.md)) queues **jobs**. This slug meters **tokens**. Link; do not merge into an “agent platform.”

## Night log

| When | What | Result |
|------|------|--------|
| 2026-09-19 | Six-file contract | Five files already deep. This file is the sixth. No seventh README. |
| 2026-09-19 | OpenRouter pricing https://openrouter.ai/pricing | Live. Free: 25+ free models, 50 req/day. Standard **5.5%**. Business **8%**. BYOK: $25k list/mo fee-free then 5%. Matches the existing table — **did not rewrite it**. |
| 2026-09-19 | OpenRouter FAQ https://openrouter.ai/docs/faq | Live. Pass-through inference; fee on credit purchase. FAQ HTML strips some dollar figures (min purchase, crypto %). Existing SOURCES $0.80 min / crypto 5% stay as previously sourced — **do not invent a discount URL**. Opt-in prompt logging “1% discount” is their privacy trade, not an offer we copy. |
| 2026-09-19 | Helicone https://www.helicone.ai/pricing | Live. Hobby 10k req. Pro **$79/mo**. Team **$799/mo**. Usage-based after includes. |
| 2026-09-19 | LiteLLM https://docs.litellm.ai/docs/simple_proxy | Live. OSS OpenAI-compatible proxy; spend / virtual keys / budgets. Still the kill competitor. |
| 2026-09-19 | Portkey https://portkey.ai/pricing | **First-party confirmed.** Developer free (10k logs/mo). Production **$49/mo** (100k logs; +$9 / extra 100k). Homepage now banners “Portkey is now PRISMA AIRS AI Gateway” — rename is landscape, not a new SKU we sell. |
| 2026-09-19 | Cloudflare AI Gateway https://developers.cloudflare.com/ai-gateway/ | Live. Available on all CF plans. |
| 2026-09-19 | CF Unified Billing https://developers.cloudflare.com/ai-gateway/reference/pricing/ | **First-party confirmed:** 5% on credits purchased through Unified Billing ($100 → $105). Inference pass-through, no markup. Moves that cell off UNKNOWN. |
| 2026-09-19 | Martian docs https://docs.withmartian.com/ | Live research-lab + Gateway docs (200+ models, `api.withmartian.com`). |
| 2026-09-19 | Martian plan page https://withmartian.com/plan-pricing | **404.** Terms still cite this URL. Directory $20 / 5k stays **UNKNOWN**. No first-party plan table found. |
| 2026-09-19 | FreeBuff https://freebuff.com/ | Live. Ad-supported consumer CLI / Desktop / Web. Daily Freebucks. **No public developer `/v1`.** |
| 2026-09-19 | `trefeon/freebuff-proxy` | Still an unofficial OpenAI-compatible `/v1` that strips ads. **Out.** Do not wrap. |
| 2026-09-19 | SELL_FIRST honesty | Still no pay button. CTA is written “I will pay $29…” only. Pays: 0. Clock: not started. |
| 2026-09-19 | 03 ↔ 09 overlap | Noted on FRAMEWORK. Tokens vs jobs. Do not merge. |

**Pays:** 0. **Checkout URL:** none. **14-day result:** untested. Do not claim PASS.
