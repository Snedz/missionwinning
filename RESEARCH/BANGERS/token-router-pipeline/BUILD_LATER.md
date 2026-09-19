# BUILD_LATER — Token router (gas pipeline)

Track 03 · what M1 will not contain · paper 2026-09-19

This file is a closed deferral list. If a ticket in [CURSOR_TODO.md](CURSOR_TODO.md) names a row here, the ticket is wrong. If a PR ships a row here "because it was easy," it has changed the product. Amend this file in the same PR or reject the PR.

M1 is: disk-first pipeline, free-first registry, `ALLOW_PAID` hatch, M1 caps, laws L1–L10. See [FRAMEWORK.md](FRAMEWORK.md).

---

## 1. How to read this list

| Label | Means |
|-------|--------|
| **Later** | Allowed after M1 is proven by the §7 demo in [SELL_FIRST.md](SELL_FIRST.md) *and* a founder line. |
| **Never from this track** | Conflicts with the offer or the law. A different track / company may do it. |
| **Refuse** | Illegal, ToS-violating, or silent-spend shaped. Do not "research a workaround." |

---

## 2. Never from this track

| Item | Why |
|------|-----|
| Hosted credit marketplace | That is OpenRouter. We do not hold users' money or take a markup on tokens. |
| Per-token SaaS pricing | Incentive to increase burn. Opposite of the sale. |
| Wrap Freebuff / Codebuff / Gemini web / ChatGPT web / any unofficial client for "free" frontier | Freebuff ToS (retrieved 2026-09-19) forbids calling underlying servers from wrappers, scripts, custom clients, or automation that is not their product. Other web UIs are the same class of problem. Law L7. |
| Ad-supported inference *as our product* | Different company (Freebuff). We sell a meter, not an ad unit. |
| Default paid provider / bundled vendor key | Silent spend at init. Free-first is the default registry. |
| `ALLOW_PAID` opened by env alone | Law L3 / L8. CI and copied `.env` files would spend. |
| Emergency override / `FORCE_PAID` / `just_this_once` | Reintroduces the unmetered tap. Open the hatch with a reason. |
| Unlimited sentinels (`-1`, `null` means ∞) | M1 schema rejects them. Unlimited is how caps die. |
| Smart quality router (prompt → "best model") | Martian / Not Diamond / Nexus FireRouter. Different machine. Score stays boring. |
| Replace Mission Winning Coach spend brake | Law L10. Compose later, two homes. Do not delete `spendLimit.ts`. |
| Fitness-competitor intel in this folder | Classification. Names stay in `ops/intel/`. |
| Invented traction / "N companies use this" | Hard rule. Paper has zero users until an operator says yes. |

---

## 3. Later (explicit)

Each row names the **unlock** so "later" is not "whenever."

### 3.1 More wells

| Item | Unlock |
|------|--------|
| Adapter pack beyond local + 3 paid + 1 documented-free | M1 demo green on local; hatch path tested against a *fake* paid well; one real paid well dogfooded by founder |
| OpenRouter as a *hatched* well (trader behind the meter) | Hatch + paid cap > 0; operator understands they pay OpenRouter's 5.5% credit fee *and* our claim envelope |
| Cloudflare AI Gateway as a hop | Only as a provider URL the operator already owns; we do not become a CF app |
| Together dedicated traffic-split / Fireworks `weightedRandom` routers | Operator already has those deployments; we call their router id as one well, we do not reimplement their split |
| LiteLLM as an upstream process | If they already run it; we claim *before* we talk to their proxy. We do not vendor LiteLLM. |

### 3.2 Control plane that is not disk files

| Item | Unlock |
|------|--------|
| SQLite instead of files | Receipt volume or `max_open_claims` contention proven, not theorized |
| HTTP server (`POST /v1/chat/completions` façade) | CLI + library proven; then a thin OpenAI-compatible front so existing SDKs can point at localhost. Still disk-backed. Still no dispatch without claim. |
| Multi-operator / teams / RBAC | We are now in Portkey's market. Only with a new paper and a kill. |
| Cloud sync of receipts | Classification + privacy review. Default stays local. |

### 3.3 Intelligence we are not

| Item | Unlock |
|------|--------|
| Semantic cache | After receipts show repeat prefixes worth caching; even then, cache hits still write a receipt (`class: cache`, `$0`) so the meter never goes dark |
| Prompt CMS / versioning | Not our product; compose with someone else's |
| Evals / RouterBench-style quality curves | Research toy, separate track |
| Session replay / full prompt logging UI | Helicone's job. Our receipts store usage and hashes; raw prompts are opt-in and off by default (secrets). |
| Guardrails / PII redaction | Portkey / PAN. We may *refuse* a claim for oversize body (already an M1 cap). That is a valve, not a policy engine. |

### 3.4 Money

| Item | Unlock |
|------|--------|
| Supported binary / brew tap | One operator using source M1 for a week |
| Hatch-review service | Same |
| Any SKU | EIN + founder. Not this track's PR. |

### 3.5 Mission Winning composition

| Item | Unlock |
|------|--------|
| Coach / daily-insight / meal-vision caller asks this router for a claim | Written founder commission. Keep `LLM_DAILY_USD_CENTS` and org breaker. Router caps are the host brake. Two passes. |
| Android / Expo | Never as a way to sneak this into the Play product. Out of band. |

---

## 4. Tempting M1 scope that is still later

These show up in every gateway comparison table. They are how tracks become substations.

| Temptation | Why it feels required | Why it waits |
|------------|----------------------|--------------|
| Redis cache | "Everyone has caching" | Disk claim *is* the coherence layer. Cache is an optimization that can hide spend if hits are unmetered. |
| Virtual keys | "LiteLLM has them" | Single-operator M1. A key is a well's secret, in a secrets file, not a product. |
| Load balance across 12 OpenAI keys | "rate limits" | That is a paid-well growth tactic. Hatch + one key first. |
| Streaming token accounting at token-tick | "accurate" | M1 may stream bytes to the user but **accounts at end** (or conservative claim-max on interrupt). Tick-accounting is a later receipt mode. |
| Dashboard | "sellable" | `receipts/` + `jq` is the M1 UI. A dashboard is a company. |
| Provider auto-discovery | "magic" | Auto-adding a paid well is silent spend. Operator adds rows. |
| Fallback from local to paid on quality | "users complain" | Quality fallback is an implicit hatch. Forbidden. Fail the request or ask the operator to open the hatch. |

---

## 5. Industry features we will cite and not copy

A short "we understood you" so a later agent does not "fill the gap."

| Vendor feature | Their job | Our M1 stand-in |
|----------------|-----------|-----------------|
| OpenRouter provider routing + ignore lists | Trader chooses a well among many hosts of the same model | Operator names *one* well per row; failover is an explicit scored list on the claim |
| LiteLLM virtual keys + team budgets | Proxy multi-tenant | One hatch, one daily paid cap |
| Portkey guardrails + semantic cache + MCP registry | Governance platform | Body-size cap; no MCP registry |
| Helicone sessions + properties | Observability | Receipt + `request_hash` |
| Martian routing model | Quality/cost dispatcher | Cost-class sort |
| Cloudflare cache + rate limit + unified billing | Edge substation | `health_ttl_sec`, `max_open_claims`, no unified billing |
| Together capacity-aware split, A/B, shadow | Their dedicated platform | Out of scope; call their endpoint as one well |
| Fireworks `weightedRandom` / `evenLoad` routers + Nexus FireRouter | Their deployment router + difficulty router | Same |
| Freebuff text ads between agent turns | Their free product | Not a well |

---

## 6. When a later row may be pulled forward

All five must hold:

1. The SELL_FIRST §7 demo is green on the M1 code.
2. An operator has used it for real work (not a fixture).
3. The row's unlock in §3 is true.
4. The PR amends this file and [FRAMEWORK.md](FRAMEWORK.md) in the same commit.
5. The PR does not open `app/` or `src/lib/coach/` unless a commission exists (L10).

Missing any one → the row stays here.

---

## 7. Refuse list (do not file as "research")

- Scraping or automating Freebuff / other ad-supported UIs to feed this router.
- Sharing or embedding a vendor API key in the default registry.
- "Shadow" paid calls that do not share the claim envelope (Together-style shadow traffic is *their* feature on *their* bill; doing it on a paid well we meter is a second tap).
- Logging full prompts to a public repo "for receipts."
- Marking a paid OpenRouter model `class: free` because the model card said "free."

---

## 8. What M1 *is*, restated so this file cannot be misread as "build nothing"

Build later is not a freeze on the router. M1 is allowed to be:

- schema + library + CLI
- local well + fake paid well in tests
- hatch + caps + reconcile
- OpenAI-compatible *client* calls *out* to a well (not a public server)
- tests that kill L1–L9 mutants

That is enough to sell the meter. Everything in the tables above is how the meter becomes a marketplace, a substation, or a ToS violation.
