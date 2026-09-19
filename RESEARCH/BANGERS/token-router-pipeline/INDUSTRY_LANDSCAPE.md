# INDUSTRY_LANDSCAPE — Token router (gas pipeline)

Track 03 · named AI-infra map · retrieved 2026-09-19 · not fitness intel

This file owns competitor *shape*, not our laws. Our machine is [FRAMEWORK.md](FRAMEWORK.md). Citations are [SOURCES.md](SOURCES.md). Vendor prices and star counts go stale; treat numbers as **as-of retrieval** and re-verify before a purchase.

AI infrastructure names are PUBLIC here. Consumer fitness product names stay in `ops/intel/`.

---

## 1. The category is four jobs wearing one word

"Router" and "gateway" in 2026 ads mean at least four machines. Mixing them is how an indie build becomes a worse clone.

| Job | Energy metaphor | What it decides | Who you pay |
|-----|-----------------|-----------------|-------------|
| **Trader (aggregator)** | Commodity desk | Which *seller* of a model you buy from; one bill | Markup or credits (OpenRouter) |
| **Substation (proxy gateway)** | Transformer + switchgear | Cache, keys, fallback, logs, policy in front of wells *you already chose* | Seat / logs / $0 OSS + your GPUs |
| **Dispatcher (smart router)** | Grid operator | Which *model* should run this prompt (quality/cost) | Their API, often still paid upstream |
| **Well gateway (provider-native)** | Field gathering lines | Which *replica / deployment* of *their* iron serves you | The well owner (Together, Fireworks) |
| **Municipal subsidy** | City power with ads on the bill | Whether a *human in their app* gets a free session | Attention / ads / data (Freebuff) |
| **Meter (this track)** | Property pipeline + padlock | Whether gas may leave *your* yard, and how much | Your time; later maybe a binary |

Helicone is a **coroner + optional substation** (observability first). Cloudflare is a **substation at the edge**. Portkey is a **substation + governance**. LiteLLM is a **self-hosted substation**. Martian is a **dispatcher**. Nexus FireRouter is a **dispatcher bolted to a well**.

We are none of those. We are the meter on the property.

---

## 2. Matrix (centre of gravity)

| Name | Job | Hosting | License / posture (as of retrieval) | Default gravity | Best for | Gap vs this track |
|------|-----|---------|--------------------------------------|-----------------|----------|-------------------|
| **OpenRouter** | Trader | Managed | Proprietary; ~5.5% on credits | Paid catalog, 300–500+ models | One key, long tail | No claim-before-dispatch on *your* disk; free models are still *their* product |
| **LiteLLM** | Substation | Self-host or cloud | OSS proxy (widely treated as MIT-core); 100+ providers | Config YAML full of paid upstreams | Own the proxy | Budgets exist; default is not hatch-locked empty |
| **Portkey** | Substation + govern | Both | OSS gateway core + paid control plane; **Palo Alto acquired 2026-05-29**, marketed into Prisma AIRS | Enterprise policy | Guardrails, RBAC, semantic cache | Governance suite; not an indie padlock |
| **Helicone** | Observe (+ gateway) | Both | OSS; **Mintlify acquired 2026-03-03; maintenance mode** | Logs after the call | Sessions, cost after the fact | Coroner, not work order. Do not start a *new* critical path here without diligence |
| **Martian** | Dispatcher | Managed | Proprietary; Accenture Ventures 2024 | Auto-pick model | Quality/cost per prompt | Routing model ≠ claim file. Paid-by-default API |
| **Cloudflare AI Gateway** | Edge substation | Managed | On all CF plans; unified REST (2026-05) + custom providers | BYOK or unified billing to paid models | Cache, rate limit, one-line proxy | Free *gateway*, not free *tokens*. No disk hatch |
| **Together dedicated** | Well gateway | Their cloud | Proprietary | Capacity-aware split, A/B, shadow, sticky `prompt_cache_key` | Open-weight production on *their* GPUs | Routes replicas, not your basement Ollama |
| **Fireworks routers / Nexus** | Well gateway + dispatcher | Their cloud | Proprietary | `weightedRandom` / `evenLoad` on deployments; FireRouter scores difficulty | Replica split; coding-harness autopilot | Same: their iron. Nexus even says keep your gateway |
| **Freebuff / Codebuff** | Municipal + agent product | Their apps | Ad-supported; ToS forbids unofficial inference access | Human in *their* CLI/desktop/web | Free coding agent with ads | **Not a well.** Wrapping is a ToS violation |

Vercel AI Gateway, Kong AI Gateway, Not Diamond, Unify, Eden AI, Apache APISIX AI, Bifrost, Continuum appear in 2026 roundups. They do not change the gap. Noted in §8 so an agent does not "discover" them as a missing M1 feature.

---

## 3. OpenRouter — trader

**What they are.** A hosted unified API over a large model catalog (roundups say 300–500+ models, 60+ providers). You pick a model string; they pick or failover among hosts. You buy credits; they document a **5.5% fee on credit purchase** in multiple 2026 comparisons (re-verify on openrouter.ai before citing in a contract).

**What they are good at.** Speed to a weird model. One invoice. Provider failover *inside a model*. BYOK exists but the product gravity is the catalog.

**What they are not.** A meter you own. Fusion (multi-model synthesis, reported March 2026) *increases* energy use on purpose. Free-tier models have daily limits and remain their product.

**Steal the idea, not the company.** Provider-level ignore lists and failover are useful *as a hatched well's own behavior*. Our claim still wraps the whole trader call in one envelope. Do not reimplement their catalog.

**When to send a buyer there.** "I need 200 models this week and I will pay credits." Our sale is the opposite sentence.

---

## 4. LiteLLM — self-hosted substation

**What they are.** OpenAI-compatible proxy: 100+ providers, virtual keys, spend tracking, budgets, guardrails, optional Redis cache, traffic mirroring. You run it, or you buy their cloud.

**What they are good at.** Adapters. "Change the model string, keep the SDK." Teams that already know they will call paid upstreams and want one process in the middle.

**What they are not.** Free-first. A fresh `config.yaml` is a list of paid wells. Budgets can be set; they are not a locked hatch that requires a written reason and a disk/env AND. Virtual keys are multi-tenant gravity.

**Steal.** Adapter discipline later (BUILD_LATER §3.1). Fail-closed spend as a *feature they already advertise* — we still want the claim *file* because a proxy budget that lives in Redis is not crash-visible on a laptop.

**When to send a buyer there.** "I will self-host a proxy in front of twelve paid vendors and I want every adapter already written."

---

## 5. Portkey — governance substation (now PAN)

**What they are.** OSS gateway + managed control plane: routing, semantic cache, guardrails, virtual keys, budgets, observability. **Palo Alto Networks completed the acquisition 2026-05-29** (third-party + news). Expect the independent-startup story to collapse into Prisma AIRS AI Gateway (LLM / MCP / A2A policy).

**What they are good at.** Orgs that need SSO, audit, PII redaction, a purchased policy story.

**What they are not.** An indie disk meter. Semantic cache and MCP registry are how they win RFPs. List prices in Aug 2026 writeups: Developer $0 / 10k recorded logs; Production ~$49/mo / 100k logs. Re-verify; PAN packaging may change the SKU.

**Steal.** Nothing for M1. "Recorded logs continue past cap but stop recording" is the opposite of our fail-closed spend.

**Diligence.** New builds should evaluate it as a PAN product, not as a cute OSS gateway.

---

## 6. Helicone — coroner (maintenance mode)

**What they are.** Proxy logging: change the base URL, get request/response, cost, latency, sessions. A newer gateway layer added routing/fallbacks. Apache-2.0 / OSS self-host via Docker/Helm. Hobby-tier numbers in roundups: ~10k requests/mo free; Pro ~$79/mo (re-verify).

**What happened.** Mintlify acquired Helicone **2026-03-03**. Vendor post: **maintenance mode** — security, bugs, new models; feature roadmap stopped; migration help promised. GatewayScore-style writeups claim the standalone Rust gateway repo went quiet earlier — re-check the repo before depending.

**What they are good at.** After-the-fact "why did this cost $12."

**What they are not.** A work order. A safe *new* critical-path dependency in 2026 without reading the maintenance letter.

**Steal.** Receipt fields (tokens, cents, latency, hash). Do not steal full prompt storage as a default (secrets).

---

## 7. Martian — dispatcher

**What they are.** Managed "pick the best/cheapest model per prompt" API. OpenAI- and Anthropic-compatible (`/v1/chat/completions`, `/v1/responses`, `/v1/messages`). Catalog advertised as 200+ models with per-token USD strings on `GET /v1/models`. Accenture Ventures investment Sept 2024; NEA / GC-backed history in their press.

**What they are good at.** Teams whose KPI is quality/cost *of the model choice*, and who accept a proprietary routing model.

**What they are not.** A hatch. A local well. A claim file. Arize-cited research (via Fireworks Nexus marketing) that naive multi-model ladders can lose to a single model is a warning: **a dispatcher is a research product**, not a weekend `if latency`.

**Steal.** Transparency of *why* a row ranked — our score `reasons[]`. Not their router weights.

---

## 8. Cloudflare AI Gateway — edge substation

**What they are.** One-line proxy on Cloudflare: analytics, logging, cache, rate limit, retry/fallback. Native provider list (docs updated 2026-04-20) includes OpenAI, Anthropic, Google, Groq, OpenRouter, Workers AI, Bedrock, etc. **Together and Fireworks are not native** in that list; **custom providers** (`custom-{slug}`) take any HTTPS OpenAI-compat URL. May 2026: unified REST on `api.cloudflare.com` (`/ai/run`, `/ai/v1/chat/completions`, `/ai/v1/responses`, `/ai/v1/messages`) with optional Unified Billing.

**What they are good at.** Teams already on CF who want cache and a free *control* plane. Zero extra hosts.

**What they are not.** Free inference. Unified Billing is a paid-token convenience. Custom providers still need your key. Adding 10–50 ms proxy latency is the trade (roundup claim; measure).

**Steal.** Custom-provider humility (any OpenAI-compat URL). Rate limit as a sibling of `max_open_claims`. Do not steal unified billing.

---

## 9. Together and Fireworks — well gateways (plus one dispatcher)

These are **inference providers**. Fireworks' own blog (providers vs routers) is the clean split: they own GPUs; OpenRouter/Martian/LiteLLM-cloud do not.

### 9.1 Together dedicated endpoints

An **endpoint** is a stable `project_slug/endpoint_name` you pass as `model`. **Deployments** sit behind it. Traffic split is **capacity-aware**: `weight × ready_replicas`. Then A/B percents, then rollout percents, then a cluster. Stickiness via derived key; operator can set `prompt_cache_key`. Shadow traffic mirrors to a candidate *without* changing the user response — **on their bill**.

**Steal.** Sticky keys for prefix cache. Do not steal shadow-to-paid on a well *we* meter (second tap; BUILD_LATER refuse).

### 9.2 Fireworks Gateway Routers

`POST /v1/accounts/{account_id}/routers` with `deployments[]` and `weightedRandom` (replica-weighted, default) or `evenLoad`. Inference `model` becomes `accounts/{id}/routers/{router_id}`. Purpose: A/B, migration, load across *their* deployments.

### 9.3 Fireworks Nexus / FireRouter

A later **dispatcher**: score each coding request, send easy work to open models (they advertise high cache hit / cheaper cached input), escalate hard work to a closed model on *your* key. `x-routing-preference` / `--routing-preference`. They tell you to keep LiteLLM for policy.

**Steal.** Preference as an explicit operator knob — we already have a hatch. Do not steal auto-escalation to paid (implicit hatch).

**When to send a buyer there.** "I rent GPUs and I need replica-level traffic control." Our router may *call* their router id as one well after M1 unlock.

---

## 10. Freebuff / Codebuff — municipal power (not a well)

**What they are.** Codebuff is an open agent framework. **Freebuff** is the ad-supported product: CLI/desktop/web/GitHub agents, no subscription/key for *included* models. Text ads between turns. Launch post (retrieved 2026-09-19): DeepSeek / MiMo / GLM / MiniMax class models; BYOK for some closed models; Codebuff Pro as the no-ads paid path.

**Limits move.** README (retrieval day) listed session/model caps (e.g. GPT-5.6 Luna two sessions/day; V4 Flash paused at peak). Do not pin those numbers in code.

**ToS (critical).** Freebuff Terms (retrieved 2026-09-19) say free inference is for **individual, human-directed use through official products**. You may **not** call underlying servers from scripts, custom clients, wrappers, or third-party software. Bots/headless/autonomous operation of *their* UI is forbidden; a human must start the session. Ads may use prompt analysis; some models may train.

**Law L7.** No `freebuff` / `codebuff` provider id. A buyer who says "just wrap Freebuff" is refused ([SELL_FIRST.md](SELL_FIRST.md) §2.2, [BUILD_LATER.md](BUILD_LATER.md) §7).

**Steal.** Honest labeling of data use ("may train") as a receipt `notes` field if a *legal* free-tier API requires it. Not their ads.

---

## 11. Also-rans (so we do not "fill the gap")

| Name | Job in one line | Why not M1 |
|------|-----------------|------------|
| Vercel AI Gateway | Substation for Next.js | Hosted; MW already has its own spend brake |
| Kong / APISIX AI | API-gateway plugins | Enterprise API gravity |
| Not Diamond / Unify | Dispatchers | Same as Martian |
| Eden AI | Multi-AI aggregator (not just LLM) | Trader sprawl |
| Bifrost | OSS gateway in some 2026 lists | Adapter pack temptation |
| Continuum | BYOK hosted in one roundup | Not our meter |

If a new name appears, classify it into §1's jobs before adding a feature.

---

## 12. Gap we occupy (the only reason this track exists)

No row in §2 sells **all** of:

1. Disk is the control plane (no account required).
2. HTTP is illegal without an `open` claim file.
3. Default registry is local/free; paid rows are ineligible until a hatch with a written reason.
4. Env cannot open the hatch; env can only force it closed.
5. `0` means refuse, never unlimited.
6. Crash reconcile conservative-burns the envelope.
7. Municipal / unofficial-web products are schema-rejected.

LiteLLM can be *configured* toward 2–5 and still will not *be* 1+6+7 as the product. OpenRouter will not. Portkey will not. That is the wedge. If M1 cannot keep all seven, kill the track (FRAMEWORK §11) instead of adding a dashboard.

---

## 13. How we talk about them in public

- Compare **jobs**, not star counts.
- Do not claim we are "cheaper than OpenRouter" — we do not sell tokens.
- Do not claim Helicone is "dead" — say maintenance mode and date the retrieval.
- Do not claim Portkey is "still a startup" after the PAN close date.
- Do not publish a scrape of anyone's model list into this repo.

---

## 14. Re-verify before a purchase or an M1 adapter

Checklist (operator, not agent-as-truth):

- [ ] OpenRouter fee page and free-model limits
- [ ] LiteLLM license file and budget docs
- [ ] Portkey vs Prisma AIRS SKU you would actually sign
- [ ] Helicone maintenance letter + repo activity
- [ ] Martian `/v1/models` pricing units (per-token vs per-million)
- [ ] CF native vs custom provider list
- [ ] Together / Fireworks current router API
- [ ] Freebuff ToS § on unofficial inference (must still say no)
