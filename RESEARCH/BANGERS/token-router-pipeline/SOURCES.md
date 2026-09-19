# token-router-pipeline — sources

Checked **2026-09-19**.

| # | What | URL | Used for | Notes |
|---|------|-----|----------|-------|
| 1 | OpenRouter pricing | https://openrouter.ai/pricing | Fee table | Standard 5.5% platform fee; Business 8%; Free 50 req/day, 25+ free models; BYOK $25k then 5%. |
| 2 | OpenRouter FAQ | https://openrouter.ai/docs/faq | Pass-through + credit fee | No inference markup; fee on credit purchase ($0.80 min; crypto 5%). |
| 3 | OpenRouter vs LiteLLM | https://openrouter.ai/blog/insights/openrouter-vs-litellm/ | Category split | Hosted credits vs self-host infra cost. |
| 4 | OpenRouter vs Portkey | https://openrouter.ai/blog/insights/openrouter-vs-portkey/ | Governance vs network | Portkey $49 Production cited by OpenRouter — still re-open Portkey. |
| 5 | LiteLLM proxy docs | https://docs.litellm.ai/docs/simple_proxy | OSS gateway | 100+ LLMs; spend / virtual keys / budgets. |
| 6 | Helicone pricing | https://www.helicone.ai/pricing | Observability pipe | Hobby / Pro $79 / Team $799; 10k req hobby; usage-based after. |
| 7 | Cloudflare AI Gateway | https://developers.cloudflare.com/ai-gateway/ | Edge pipe | Analytics, cache, rate limit, retry, fallback. All CF plans. |
| 8 | Martian docs | https://docs.withmartian.com/ | Smart router | OpenAI-compatible `api.withmartian.com`; 200+ models. |
| 9 | FreeBuff | https://freebuff.com/ | Ad-supported agent | “Powered by text ads.” Not a public API. |
| 10 | FreeBuff launch post | https://freebuff.com/blog/freebuff-launch | Models + ads | Ads between turns; Codebuff Pro is the paid no-ad tier. |
| 11 | OmniRoute #5212 | https://github.com/diegosouzapw/OmniRoute/issues/5212 | Why not a provider | No public REST API; ToS vs automation; circular to OpenRouter. |
| 12 | freebuff-proxy (do not use) | https://github.com/trefeon/freebuff-proxy | Negative source | Unofficial `/v1` that strips ads. **Out of scope.** |
| 13 | Portkey | https://portkey.ai/ | Governance pipe | Confirm live pricing on their `/pricing` — third-party $49/10k-log figures are **secondary**. |

## UNKNOWN / secondary (do not treat as facts)

| Item | Why |
|------|-----|
| Martian $20 / 5,000 requests | Seen on directory sites (everydev / spotsaas), not a first-party pricing page in this pass. |
| Cloudflare Unified Billing 5% | Third-party comparison blogs. Re-open CF docs. |
| Portkey Production $49 | Repeated in OpenRouter’s own comparison and blogs; still verify on portkey.ai. |
| Anyone’s “MRR” or “N companies” | Martian “300+ companies” is vendor marketing. |
| Buyer count for a $29 disk meter | Untested. |
