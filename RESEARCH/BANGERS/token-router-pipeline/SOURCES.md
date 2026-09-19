# SOURCES — Token router (gas pipeline)

Track 03 · retrieval date **2026-09-19** unless a row says otherwise.

What was taken is named. Roundup blogs are **secondary**; official docs win on conflict. Star counts, prices, and model lists go stale — re-verify using [INDUSTRY_LANDSCAPE.md](INDUSTRY_LANDSCAPE.md) §14 before a purchase.

No live API keys. No invented traction. Fitness-competitor names are not in this file.

---

## 1. Official / primary

| # | Source | URL | Taken |
|---|--------|-----|-------|
| P1 | LiteLLM — AI Gateway (LLM Proxy) docs | https://docs.litellm.ai/docs/simple_proxy | Job: OpenAI-compatible proxy, 100+ LLMs, spend / virtual-key budgets, cache, mirroring. Used to classify LiteLLM as a **substation**, not a meter. |
| P2 | Cloudflare AI Gateway overview | https://developers.cloudflare.com/ai-gateway/ | Features: analytics, logging, cache, rate limit, retry/fallback; "one line of code"; available on all plans. Updated **2026-04-20** on the page. |
| P3 | Cloudflare — Provider Native | https://developers.cloudflare.com/ai-gateway/usage/providers/ | Native list includes OpenAI, Anthropic, Google, Groq, OpenRouter, Workers AI, Bedrock, … **Together and Fireworks absent** on retrieval. |
| P4 | Cloudflare — Custom Providers | https://developers.cloudflare.com/ai-gateway/configuration/custom-providers/ | `custom-{slug}`; Unified `/compat` vs provider-specific path; any HTTPS OpenAI-compat well. |
| P5 | Cloudflare changelog — unified REST API | https://developers.cloudflare.com/changelog/post/2026-05-21-rest-api/ | **2026-05-21**: `/ai/run`, `/ai/v1/chat/completions`, `/ai/v1/responses`, `/ai/v1/messages`; Unified Billing optional. |
| P6 | Together — route traffic (dedicated endpoints) | https://docs.together.ai/docs/dedicated-endpoints/route-traffic | Capacity-aware `weight × ready_replicas`; A/B then route; sticky key; `prompt_cache_key`. |
| P7 | Together — dedicated concepts | https://docs.together.ai/docs/dedicated-endpoints/concepts | Endpoint string `project_slug/endpoint_name` as `model`; resource id prefixes. |
| P8 | Together — A/B tests | https://docs.together.ai/docs/dedicated-endpoints/ab-tests | Integer percents; control must stay on the split. |
| P9 | Together blog — configuring dedicated inference | https://www.together.ai/blog/configuring-dedicated-model-inference | Split vs A/B vs canary as three tools; shadow experiments mentioned in platform blog. |
| P10 | Fireworks — Routers | https://docs.fireworks.ai/deployments/routers | Router as `accounts/{id}/routers/{id}` in `model`; weighted replica selection. |
| P11 | Fireworks — Create Router API | https://docs.fireworks.ai/api-reference/create-router | `weightedRandom` (replica count) vs `evenLoad`; deployments[]. |
| P12 | Fireworks Nexus / FireRouter marketing | https://fireworks.ai/nexus | Difficulty/cost routing; `x-routing-preference`; keep LiteLLM for policy; cache-hit claim (marketing — do not treat as measured here). |
| P13 | Fireworks blog — providers vs API routers | https://fireworks.ai/blog/inference-providers-vs-api-routers | Definition: providers own GPUs; routers forward. Classifies OpenRouter, Martian, LiteLLM cloud as routers. |
| P14 | Martian — API reference / endpoints / quickstart | https://docs.withmartian.com/api-reference · `/api-reference/endpoints` · `/quickstart` | OpenAI + Anthropic shapes; `creator/model` ids; pricing strings **per token** (×1e6 for per-million); 200+ models claim. |
| P15 | Accenture — Martian investment | https://newsroom.accenture.com/news/2024/accenture-invests-in-martian-to-bring-dynamic-routing-of-large-language-queries-and-more-effective-ai-systems-to-clients | **2024-09-17**: Ventures investment; router-as-switchboard story; $9M prior mention in their copy. Historical, not a 2026 feature claim. |
| P16 | Freebuff launch | https://freebuff.com/blog/freebuff-launch | Ad-supported CLI; text ads between turns; Codebuff Pro as paid no-ads; model names as of that post. |
| P17 | Freebuff / CodebuffAI README | https://github.com/CodebuffAI/freebuff | Product surface (CLI/desktop/web/GH); ads fund included models; data-use / training labels; **limits change**. |
| P18 | Freebuff Terms of Service | https://freebuff.com/terms-of-service | **Human, official-product use only.** No calling underlying inference from wrappers, scripts, custom clients, third-party software. No unattended bots on their UI. Primary cite for law L7. |
| P19 | Mintlify — acquires Helicone | https://www.mintlify.com/blog/mintlify-acquires-helicone | **2026-03-03**: acquisition; Helicone in **maintenance mode**; security/bugs/new models; migration help. |
| P20 | Helicone gateway overview (Mintlify-hosted docs) | https://helicone-helicone.mintlify.app/gateway/overview | Still describes OpenAI-compat gateway, routing, 0% markup vs OpenRouter 5.5%, BYOK. Treat as product docs that may lag the maintenance letter. |

---

## 2. Secondary roundups (2026)

Used to **orient** the matrix and to cross-check job labels. Not used as proof of a feature we require.

| # | Source | URL | Taken | Caution |
|---|--------|-----|-------|---------|
| S1 | Aiprosol — LLM Gateway & Router Index | https://aiprosol.com/llm-gateways | Job table: OpenRouter trader, LiteLLM proxy, Portkey proxy+router, CF edge, Helicone observe, Martian smart router. Last reviewed **2026-06-13** on page. | Neutral tone; still a blog. |
| S2 | Continuum — Best LLM gateways 2026 | https://continuumcode.ai/guides/best-llm-gateways/ | Checked Aug 2026: LiteLLM OSS default; OpenRouter 5.5%; Portkey $49; Helicone observe-first $79 Pro; CF free core. | Vendor-adjacent (they sell a gateway). |
| S3 | Respan — 10 best LLM gateways 2026 | https://www.respan.ai/articles/best-llm-gateways | Portkey **PAN close 2026-05-29**; Helicone maintenance; OpenRouter catalog size; LiteLLM self-host. | They sell an observability+gateway product. |
| S4 | Respan — CF vs Martian / Martian vs OpenRouter | https://www.respan.ai/market-map/compare/cloudflare-ai-gateway-vs-martian · `…/martian-vs-openrouter` | Job split: CF cache/rate-limit vs Martian model pick. | Same. |
| S5 | PkgPulse — Portkey vs LiteLLM vs OpenRouter 2026 | https://www.pkgpulse.com/guides/portkey-vs-litellm-vs-openrouter-llm-gateway-2026 | Product-shape table; Portkey recorded-log vs request overage wording. | Useful for "do not flatten log caps into request caps." |
| S6 | rikuq — Portkey vs Helicone vs LiteLLM vs OpenRouter | https://rikuq.com/blog/infra/portkey-vs-helicone-vs-litellm-vs-openrouter/ | OpenRouter Fusion Mar 2026 mention; "credits ≠ passthrough." | Author builds a competing gateway (Prism). |
| S7 | Markaicode — Helicone vs Portkey | https://markaicode.com/vs/helicone-vs-portkey/ | Aug 2026 list prices; PAN / Mintlify as diligence not price. | Secondary. |
| S8 | GatewayScore — Portkey vs Helicone | https://gatewayscore.com/compare/portkey-vs-helicone/ | Maintenance-mode as disqualifier for *new* critical path; star counts (stale immediately). | Scores are theirs. |
| S9 | DEV — Helicone maintenance meaning | https://dev.to/sahajmeet_kaur_/helicone-acquisition-what-maintenance-mode-actually-means-hd5 | Restates Mintlify letter; OSS still self-hostable. | Secondary. |

OpenRouter's own provider-routing doc URL used during research (`/docs/guides/routing/provider-routing` and `/docs/features/provider-routing`) **did not fetch** (404 / timeout) on 2026-09-19. Do not cite a live OpenRouter routing page until it retrieves. Trader behavior is taken from P13 + S1–S6 only.

---

## 3. In-repo (Mission Winning) — composition, not competition

| # | Path | Taken |
|---|------|-------|
| R1 | [docs/ENV.md](../../../docs/ENV.md) | `COACH_LLM_*`; high reasoning as silent bill; `LLM_DAILY_USD_CENTS` default 15¢; org breaker 2500¢; `0` kills spend. |
| R2 | `src/lib/llm/spendLimit.ts` | Fail-closed dollar brake; store throw → refuse. Pattern copied as *idea* for L4, not as code. |
| R3 | `src/lib/llm/spend.ts` / `quota.ts` | Cents parse; per-feature request caps. Two-homes rule if composed. |
| R4 | [docs/CLASSIFICATION.md](../../../docs/CLASSIFICATION.md) | PUBLIC vs INTERNAL; no fitness names in this tree. |
| R5 | [CONTEXT.md](../../../CONTEXT.md) `## Now` | Lifetime vs Grok cap already a launch fact. Status stays there; this paper does not restamp it. |

---

## 4. Metaphor sources (not citations of fact)

The energy / pipeline metaphor is **ours** for this track (2026-09-19). It is not taken from a vendor. Analogies to "tokens as energy" appear in informal operator talk; we close the mapping in FRAMEWORK §3 so it cannot sprawl.

Fireworks P13's provider-vs-router split **informed** §1's job table but did not name "meter" or "hatch."

---

## 5. What we did not take

- Any Freebuff session-limit number as a constant (P17 says they move).
- Helicone or Portkey dollar prices as our SKU.
- RouterBench / AIQ Martian research PDFs (not fetched this sitting). Mentioned only as "dispatcher is a research product."
- OpenRouter official routing HTML (fetch failed).
- Fireworks `docs.fireworks.ai/guides/gateway-router` (404 on retrieval); used P10–P11 instead.
- Traction figures ("300+ companies" in P15 press) as ours or as current.

---

## 6. How to add a source

1. Fetch it. If it 404s, say so (do not cite from memory).
2. Add a row with URL, date, and **one sentence of what was taken**.
3. If it changes a law or a landscape job, amend FRAMEWORK / INDUSTRY_LANDSCAPE in the same PR.
4. Do not paste substantial copyrighted docs into this repo — summarize.
