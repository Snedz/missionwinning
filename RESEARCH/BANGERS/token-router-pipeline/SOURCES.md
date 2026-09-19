# token-router-pipeline — sources

Checked **2026-09-19**. Re-opened the same night (Lane C / GLM 5.3) — see dated addendum. No invented discount or checkout URLs.

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
| Martian $20 / 5,000 requests | Seen on directory sites (everydev / spotsaas). First-party `withmartian.com/plan-pricing` **404** on 2026-09-19 night. Still UNKNOWN. |
| Cloudflare Unified Billing 5% | **Resolved 2026-09-19** — first-party on CF pricing docs (row 15). |
| Portkey Production $49 | **Resolved 2026-09-19** — first-party on portkey.ai/pricing (row 14). |
| Anyone’s “MRR” or “N companies” | Martian “300+ companies” is vendor marketing. |
| Buyer count for a $29 disk meter | Untested. |

## Re-open addendum (2026-09-19 night)

Complementary rows. Existing table above is unchanged.

| # | What | URL | Used for | Notes |
|---|------|-----|----------|-------|
| 14 | Portkey pricing (first-party) | https://portkey.ai/pricing | $49 Production | Developer free, 10k logs/mo. Production $49/mo, 100k logs, +$9 / extra 100k. **Moves Portkey $49 off UNKNOWN.** Homepage now banners “PRISMA AIRS AI Gateway” — rename only. |
| 15 | CF AI Gateway pricing | https://developers.cloudflare.com/ai-gateway/reference/pricing/ | Unified Billing fee | First-party: **5%** on credits purchased ($100 → $105). Inference pass-through. **Moves CF 5% off UNKNOWN.** |
| 16 | CF Unified Billing | https://developers.cloudflare.com/ai-gateway/features/unified-billing/ | Hosted credit wallet | Same 5% sentence. Their product, not ours. |
| 17 | Martian plan-pricing | https://withmartian.com/plan-pricing | Negative / dead | **404** this night. Terms still cite it. Directory $20/5k stays UNKNOWN. |

### UNKNOWN after this pass

| Item | Why |
|------|-----|
| Martian $20 / 5,000 requests | Still directory-only. First-party plan URL 404. |
| OpenRouter FAQ stripped $ figures | Live page omits some dollar amounts in HTML. Do not invent a discount / `buy.openrouter` URL. Existing $0.80 min / crypto 5% stay previously sourced. |
| Anyone’s MRR or buyer count | Untested. Ours: 0. |
